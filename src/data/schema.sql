-- ========================================================
-- [5단계 & PostGIS] 우리 동네 음식점 찾기: Supabase 테이블, PostGIS 공간 인덱스 및 RLS 정책
-- 실행 방법: Supabase Dashboard > SQL Editor > 새 쿼리창에 붙여넣고 [Run] 실행
-- ========================================================

-- 1. PostGIS 확장 기능 활성화 (Supabase extensions 스키마)
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. restaurants 테이블 생성 (신규 프로젝트용)
CREATE TABLE IF NOT EXISTS public.restaurants (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'public_data_sdsc',
  original_id TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  raw_category TEXT,
  gu_name TEXT NOT NULL DEFAULT '기타구',
  dong_name TEXT NOT NULL DEFAULT '기타동',
  road_address TEXT,
  jibun_address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  has_exact_coords BOOLEAN DEFAULT true,
  business_status TEXT,  -- 영업상태(영업/정상, 폐업 등, 제공되는 데이터에만 저장)
  phone TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  rating NUMERIC,
  review_count INTEGER,
  open_hours TEXT,
  data_source TEXT DEFAULT 'public_data',
  is_sample BOOLEAN DEFAULT false,
  -- PostGIS 공간 지리 컬럼 (WGS84 좌표계, SRID 4326)
  location GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 기존 테이블이 이미 존재하는 경우 컬럼 안전 추가 (Safe Migration)
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS original_id TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS raw_category TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS business_status TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS has_exact_coords BOOLEAN DEFAULT true;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS rating NUMERIC;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS review_count INTEGER;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS open_hours TEXT;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);

-- 4. 기존 데이터의 source, original_id 및 PostGIS location 좌표 일괄 업데이트
-- 주의: PostGIS 좌표 순서는 ST_MakePoint(경도 lng, 위도 lat) 입니다.
UPDATE public.restaurants 
SET source = COALESCE(data_source, 'curated'),
    original_id = COALESCE(original_id, id)
WHERE original_id IS NULL OR original_id = '';

UPDATE public.restaurants
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE lat IS NOT NULL AND lng IS NOT NULL 
  AND lat > 30 AND lat < 45 
  AND lng > 120 AND lng < 135
  AND (location IS NULL);

-- 5. 출처(source)와 원본 ID(original_id) 조합으로 중복 저장 방지 제약조건
ALTER TABLE public.restaurants DROP CONSTRAINT IF EXISTS uq_restaurants_source_original;
ALTER TABLE public.restaurants ADD CONSTRAINT uq_restaurants_source_original UNIQUE (source, original_id);

-- 6. [PostGIS 핵심] 공간 인덱스(GIST) 및 검색 최적화 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_restaurants_source_original ON public.restaurants(source, original_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_dong ON public.restaurants(dong_name);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON public.restaurants(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_coords ON public.restaurants(lat, lng);
CREATE INDEX IF NOT EXISTS idx_restaurants_updated_at ON public.restaurants(updated_at DESC);

-- 7. 위·경도 삽입/수정 시 PostGIS location 컬럼을 자동 동기화하는 트리거 함수
CREATE OR REPLACE FUNCTION public.fn_sync_restaurant_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL 
     AND NEW.lat > 30 AND NEW.lat < 45 
     AND NEW.lng > 120 AND NEW.lng < 135 THEN
    -- PostGIS 좌표 순서: Point(경도 lng, 위도 lat), WGS84 SRID 4326
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_restaurant_location ON public.restaurants;
CREATE TRIGGER trg_sync_restaurant_location
  BEFORE INSERT OR UPDATE OF lat, lng ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_restaurant_location();

-- 8. [PostGIS 핵심 RPC] 기준 좌표 기준 반경(500m/1km/3km) 주변 음식점 검색 함수
-- - 거리 단위: 미터(meters)
-- - 좌표 순서: user_lng(경도), user_lat(위도)
-- - ST_DWithin: 공간 인덱스(GIST)를 활용한 정확한 반경 필터링
-- - ST_Distance: 구면 상의 정확한 직선거리(미터) 계산
CREATE OR REPLACE FUNCTION public.search_nearby_restaurants(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION,
  filter_category TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  result_limit INT DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  source TEXT,
  original_id TEXT,
  name TEXT,
  category TEXT,
  raw_category TEXT,
  gu_name TEXT,
  dong_name TEXT,
  road_address TEXT,
  jibun_address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  has_exact_coords BOOLEAN,
  business_status TEXT,
  phone TEXT,
  summary TEXT,
  tags TEXT[],
  image_url TEXT,
  rating NUMERIC,
  review_count INT,
  open_hours TEXT,
  data_source TEXT,
  is_sample BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  user_geom GEOGRAPHY;
BEGIN
  -- 사용자 위치 Point 생성: ST_MakePoint(경도 lng, 위도 lat)
  user_geom := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

  RETURN QUERY
  SELECT
    r.id,
    r.source,
    r.original_id,
    r.name,
    r.category,
    r.raw_category,
    r.gu_name,
    r.dong_name,
    r.road_address,
    r.jibun_address,
    r.lat,
    r.lng,
    r.has_exact_coords,
    r.business_status,
    r.phone,
    r.summary,
    r.tags,
    r.image_url,
    r.rating,
    r.review_count,
    r.open_hours,
    r.data_source,
    r.is_sample,
    r.created_at,
    r.updated_at,
    -- 소수점 1자리 반올림 직선거리(미터 단위)
    ROUND(ST_Distance(r.location, user_geom)::NUMERIC, 1)::DOUBLE PRECISION AS distance_meters
  FROM public.restaurants r
  WHERE
    r.location IS NOT NULL
    -- 1) 반경 필터: ST_DWithin는 미터(meters) 단위로 공간 인덱스를 활용함
    AND ST_DWithin(r.location, user_geom, radius_meters)
    -- 2) 업종 필터: 지정된 경우 해당 업종만 필터
    AND (filter_category IS NULL OR filter_category = '' OR filter_category = '전체' OR r.category = filter_category)
    -- 3) 검색어 필터: 상호명, 도로명주소, 동이름 부분 일치
    AND (
      search_query IS NULL 
      OR search_query = '' 
      OR r.name ILIKE '%' || search_query || '%' 
      OR r.road_address ILIKE '%' || search_query || '%' 
      OR r.dong_name ILIKE '%' || search_query || '%'
    )
  -- 직선거리 가까운 순으로 DB에서 정렬
  ORDER BY distance_meters ASC
  -- 조회 결과 개수 제한
  LIMIT result_limit;
END;
$$;

-- 9. Row Level Security (RLS) 활성화 및 정책
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.restaurants;
DROP POLICY IF EXISTS "Allow public insert and update" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_select_policy" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_server_write_policy" ON public.restaurants;

-- [RLS 조회] 누구나 목록 및 주변 검색 함수(RPC) 실행/조회 가능
CREATE POLICY "restaurants_select_policy" ON public.restaurants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- [RLS 쓰기] 서버 전용(service_role)만 수정/저장 가능
CREATE POLICY "restaurants_server_write_policy" ON public.restaurants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
