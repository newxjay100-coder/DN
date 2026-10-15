import { NextResponse } from "next/server";
import { REAL_RESTAURANTS } from "@/data/realRestaurants";
import { getServerSupabase } from "@/lib/supabaseServer";
import { supabase as supabasePublic, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Restaurant, RestaurantWithDistance } from "@/types/restaurant";
import { calculateDistanceMeters } from "@/utils/distance";

interface SupabaseRestaurantRow {
  id: string;
  source?: string | null;
  original_id?: string | null;
  name: string;
  category: string;
  raw_category?: string | null;
  gu_name: string;
  dong_name: string;
  road_address: string | null;
  jibun_address: string | null;
  lat: number;
  lng: number;
  has_exact_coords?: boolean | null;
  business_status?: string | null;
  summary: string | null;
  tags: string[] | null;
  phone: string | null;
  image_url?: string | null;
  rating?: number | null;
  review_count?: number | null;
  open_hours?: string | null;
  data_source?: string | null;
  is_sample?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  distance_meters?: number | null;
}

function mapRowToRestaurant(row: SupabaseRestaurantRow): Restaurant {
  const isCurated = row.source === "curated" || row.data_source === "real_dataset";
  const local = REAL_RESTAURANTS.find(
    (r) => r.id === row.id || (row.original_id && r.id === row.original_id) || r.name === row.name
  );

  return {
    id: row.id,
    originalId: row.original_id || (row.id.startsWith("pub-") ? row.id.replace(/^pub-[^-]+-/, "") : row.id),
    name: row.name,
    category: row.category as Restaurant["category"],
    rawCategory: row.raw_category || undefined,
    guName: row.gu_name,
    dongName: row.dong_name,
    roadAddress: row.road_address || local?.roadAddress || "",
    jibunAddress: row.jibun_address || local?.jibunAddress || "",
    lat: Number(row.lat),
    lng: Number(row.lng),
    hasExactCoords: row.has_exact_coords ?? true,
    businessStatus: row.business_status || undefined, // 영업상태는 제공되는 데이터에만 저장/반환
    summary: row.summary || local?.summary || "",
    tags: row.tags && row.tags.length > 0 ? row.tags : local?.tags || [],
    phone: row.phone || local?.phone,
    imageUrl: isCurated ? (row.image_url || local?.imageUrl) : undefined, // 공공데이터는 사진 미제공 원칙 유지
    rating: isCurated ? (row.rating || local?.rating) : undefined, // 공공데이터는 평점 미제공 원칙 유지
    reviewCount: isCurated ? (row.review_count || local?.reviewCount) : undefined,
    starGrade: isCurated ? local?.starGrade : undefined,
    openHours: isCurated ? (row.open_hours || local?.openHours) : undefined,
    themeTags: isCurated ? local?.themeTags : undefined,
    coupon: isCurated ? local?.coupon : undefined,
    dataSource: "supabase",
    dataOrigin: (row.source as Restaurant["dataOrigin"]) || (isCurated ? "curated" : "public_data_sdsc"),
    isSample: row.is_sample ?? isCurated,
    updatedAt: row.updated_at || row.created_at || undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const dong = searchParams.get("dong");
  const category = searchParams.get("category");
  const source = searchParams.get("source"); // "public_data" | "curated" | "all"
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "60", 10);

  // 위치 기반 주변 검색 쿼리 파라미터
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius"); // 500, 1000, 3000, all

  const serverClient = getServerSupabase() || supabasePublic;

  // 1. 단건 상세 조회 (음식점 상세를 DB에서 조회)
  if (id && serverClient) {
    try {
      let { data, error } = await serverClient
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!data) {
        try {
          const secondary = await serverClient
            .from("restaurants")
            .select("*")
            .eq("original_id", id)
            .maybeSingle();
          if (secondary.data) {
            data = secondary.data;
            error = null;
          }
        } catch {
          // original_id 컬럼 미생성 시 무시
        }
      }

      if (!error && data) {
        return NextResponse.json({
          success: true,
          restaurant: mapRowToRestaurant(data),
          source: "supabase",
        });
      }
    } catch (err) {
      console.error("Supabase 단건 상세 조회 실패:", err);
    }

    // fallback: local mock
    const fallbackLocal = REAL_RESTAURANTS.find((r) => r.id === id);
    if (fallbackLocal) {
      return NextResponse.json({
        success: true,
        restaurant: fallbackLocal,
        source: "local_cache",
      });
    }

    return NextResponse.json(
      { success: false, error: "해당 음식점을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // 2. [주변 음식점 검색] 현재 위치 기준 500m / 1km / 3km 거리 계산 및 정렬 (PostGIS RPC 우선 -> 서버 지리연산 fallback)
  if (latParam && lngParam) {
    const userLat = parseFloat(latParam);
    const userLng = parseFloat(lngParam);
    const isRadiusAll = !radiusParam || radiusParam === "all";
    const radiusMeters = isRadiusAll ? 100000 : parseFloat(radiusParam);

    if (!isNaN(userLat) && !isNaN(userLng)) {
      // 2-A. PostGIS RPC 함수(search_nearby_restaurants) 우선 호출 시도
      if (serverClient) {
        try {
          const { data: rpcData, error: rpcError } = await serverClient.rpc(
            "search_nearby_restaurants",
            {
              user_lat: userLat,
              user_lng: userLng,
              radius_meters: radiusMeters,
              filter_category: category && category !== "전체" ? category : null,
              search_query: search && search.trim() ? search.trim() : null,
              result_limit: limit,
            }
          );

          if (!rpcError && rpcData && Array.isArray(rpcData)) {
            const mappedNearby: RestaurantWithDistance[] = rpcData.map((row) => ({
              ...mapRowToRestaurant(row),
              distanceMeters: Math.round(Number(row.distance_meters)),
            }));

            return NextResponse.json({
              success: true,
              source: "supabase_postgis",
              count: mappedNearby.length,
              radiusMeters,
              restaurants: mappedNearby,
              distanceMethod: "PostGIS ST_Distance & ST_DWithin (직선거리, 미터 단위)",
            });
          }
        } catch (rpcEx) {
          // PostGIS 확장 또는 함수 미생성 시 서버 지리연산으로 자연스럽게 전환
        }
      }

      // 2-B. 서버 사이드 지리연산 (Haversine 구면 직선거리 계산 & 반경 안/밖 엄격 구분)
      let pool: Restaurant[] = [];

      if (serverClient) {
        try {
          let query = serverClient.from("restaurants").select("*");
          if (category && category !== "전체") {
            query = query.eq("category", category);
          }
          const { data: dbData } = await query;
          if (dbData && dbData.length > 0) {
            pool = dbData.map(mapRowToRestaurant);
          }
        } catch {
          // ignore
        }
      }

      if (pool.length === 0) {
        pool = [...REAL_RESTAURANTS];
      }

      const q = (search || "").trim().toLowerCase();

      // 거리 계산, 반경 필터, 업종/검색어 필터, 정렬, 개수 제한
      const nearbyResults: RestaurantWithDistance[] = pool
        .map((item) => {
          const distanceMeters = calculateDistanceMeters(
            userLat,
            userLng,
            item.lat,
            item.lng
          );
          return {
            ...item,
            distanceMeters,
          };
        })
        .filter((item) => {
          // 반경 필터 (반경 밖의 음식점 엄격 제외)
          if (!isRadiusAll && item.distanceMeters > radiusMeters) {
            return false;
          }
          // 업종 필터
          if (category && category !== "전체" && item.category !== category) {
            return false;
          }
          // 검색어 필터
          if (q) {
            const matchName = item.name.toLowerCase().includes(q);
            const matchDong = item.dongName.toLowerCase().includes(q);
            const matchRoad = item.roadAddress.toLowerCase().includes(q);
            if (!matchName && !matchDong && !matchRoad) {
              return false;
            }
          }
          return true;
        })
        // 직선거리 가까운 순 정렬
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        // 조회 결과 개수 제한
        .slice(0, limit);

      return NextResponse.json({
        success: true,
        source: "supabase_server_geo",
        count: nearbyResults.length,
        radiusMeters,
        restaurants: nearbyResults,
        distanceMethod: "Server Haversine Geodesic (직선거리, 미터 단위)",
      });
    }
  }

  // 3. 일반 음식점 목록 DB 조회 (동네 / 카테고리 / 검색어 필터)
  if (serverClient) {
    try {
      let query = serverClient
        .from("restaurants")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (dong && dong !== "전체 동" && dong !== "전체") {
        query = query.eq("dong_name", dong);
      }
      if (category && category !== "전체") {
        query = query.eq("category", category);
      }
      if (source && source !== "all") {
        if (source === "public_data") {
          query = query.or("source.ilike.%public_data%,data_source.eq.public_data");
        } else if (source === "curated") {
          query = query.or("source.eq.curated,data_source.eq.real_dataset");
        }
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,road_address.ilike.%${search}%,dong_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const mapped = (data as SupabaseRestaurantRow[]).map(mapRowToRestaurant);
        return NextResponse.json({
          success: true,
          source: "supabase",
          count: mapped.length,
          restaurants: mapped,
          supabaseConnected: true,
        });
      }
    } catch (err) {
      console.error("Supabase 목록 조회 실패:", err);
    }
  }

  // 4. DB 연결 전이거나 조회 결과가 없을 경우 검증된 실데이터 반환
  let results = [...REAL_RESTAURANTS];
  if (dong && dong !== "전체 동" && dong !== "전체") {
    results = results.filter((r) => r.dongName === dong);
  }
  if (category && category !== "전체") {
    results = results.filter((r) => r.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roadAddress.toLowerCase().includes(q) ||
        r.dongName.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    source: "curated_real_dataset",
    count: results.length,
    restaurants: results,
    supabaseConnected: isSupabaseConfigured,
    message: isSupabaseConfigured
      ? "Supabase에 연결되어 데이터를 조회 중입니다."
      : "기본 실데이터셋으로 서비스가 실행 중입니다.",
  });
}

/**
 * [서버 전용] 데이터 동기화 및 적재(Seed) 엔드포인트
 */
export async function POST() {
  const serverClient = getServerSupabase();
  if (!serverClient) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase 설정이 완료되지 않았습니다.",
      },
      { status: 400 }
    );
  }

  try {
    const nowIso = new Date().toISOString();
    const rows = REAL_RESTAURANTS.map((item) => ({
      id: item.id,
      source: "curated",
      original_id: item.id,
      name: item.name,
      category: item.category,
      raw_category: item.category,
      gu_name: item.guName,
      dong_name: item.dongName,
      road_address: item.roadAddress,
      jibun_address: item.jibunAddress,
      lat: item.lat,
      lng: item.lng,
      has_exact_coords: true,
      business_status: "영업/정상",
      summary: item.summary,
      tags: item.tags,
      phone: item.phone || null,
      image_url: item.imageUrl || null,
      rating: item.rating || null,
      review_count: item.reviewCount || null,
      open_hours: item.openHours || null,
      data_source: "real_dataset",
      is_sample: false,
      updated_at: nowIso,
    }));

    // 1차 시도: (source, original_id) 복합 유니크 키 기준 갱신
    let { data, error } = await serverClient
      .from("restaurants")
      .upsert(rows, { onConflict: "source,original_id" })
      .select();

    // 마이그레이션 실행 전일 경우: id 기반 upsert 시도
    if (error && error.message.includes("uq_restaurants_source_original")) {
      const legacyRows = rows.map(({ source, original_id, raw_category, business_status, has_exact_coords, image_url, rating, review_count, open_hours, is_sample, ...rest }) => rest);
      const res = await serverClient.from("restaurants").upsert(legacyRows, { onConflict: "id" }).select();
      data = res.data;
      error = res.error;
    }

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          hint: "Supabase SQL Editor에서 schema.sql 스크립트를 실행하여 최신 테이블 스키마를 반영해 주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${rows.length}개의 데이터가 Supabase DB에 성공적으로 저장/갱신되었습니다.`,
      count: data?.length || rows.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
