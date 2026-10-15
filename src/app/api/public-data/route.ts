import { NextResponse } from "next/server";
import { FoodCategory, Restaurant } from "@/types/restaurant";
import { getServerSupabase } from "@/lib/supabaseServer";

interface Sdsc2Item {
  bizesId: string;
  bizesNm: string;
  indsLclsCd: string;
  indsLclsNm: string;
  indsMclsCd?: string;
  indsMclsNm: string;
  indsSclsCd?: string;
  indsSclsNm?: string;
  signguNm?: string;
  adongNm?: string;
  ldongNm?: string;
  rdnmAdr?: string;
  lnoAdr?: string;
  lon: number | string;
  lat: number | string;
  telNo?: string;
}

interface GovGeneralRestaurantItem {
  MNG_NO: string;
  BPLC_NM: string;
  SNTTN_BZSTAT_NM: string;
  ROAD_NM_ADDR: string;
  LOTNO_ADDR: string;
  CRD_INFO_X?: string;
  CRD_INFO_Y?: string;
  TELNO?: string;
  SALS_STTS_NM?: string;
}

// 공공데이터 원본 업종명을 표준 FoodCategory로 매핑
function mapRawCategoryToStandard(raw: string): Exclude<FoodCategory, "전체"> {
  const s = (raw || "").trim();
  if (s.includes("한식") || s.includes("탕") || s.includes("찌개") || s.includes("구이") || s.includes("국밥") || s.includes("보쌈") || s.includes("족발")) {
    return "한식";
  }
  if (s.includes("일식") || s.includes("초밥") || s.includes("회") || s.includes("돈가스") || s.includes("돈카츠") || s.includes("라멘") || s.includes("우동")) {
    return "일식";
  }
  if (s.includes("중식") || s.includes("짜장") || s.includes("짬뽕") || s.includes("마라") || s.includes("딤섬")) {
    return "중식";
  }
  if (s.includes("서양") || s.includes("양식") || s.includes("피자") || s.includes("파스타") || s.includes("스테이크") || s.includes("패밀리") || s.includes("패스트푸드") || s.includes("버거")) {
    return "양식";
  }
  if (s.includes("분식") || s.includes("김밥") || s.includes("떡볶이") || s.includes("순대") || s.includes("튀김")) {
    return "분식";
  }
  if (s.includes("카페") || s.includes("커피") || s.includes("디저트") || s.includes("제과") || s.includes("빵") || s.includes("비알코올")) {
    return "카페/디저트";
  }
  return "한식";
}

// 도로명/지번 주소로부터 구/동 이름 추출
function extractGuAndDong(road: string, jibun: string): { guName: string; dongName: string } {
  const combined = `${road} ${jibun}`;
  const guMatch = combined.match(/([가-힣]+[구|군|시])/);
  const dongMatch = combined.match(/([가-힣\d]+[동|읍|면|리|가])/);

  return {
    guName: guMatch ? guMatch[1] : "기타",
    dongName: dongMatch ? dongMatch[1] : "기타동",
  };
}

/**
 * [서버 전용 DB 갱신 함수]
 * - 수집된 공공데이터를 Supabase 데이터베이스에 Upsert합니다.
 * - 출처(source)와 원본 ID(original_id) 조합으로 중복을 방지하며, 다시 수집 시 updated_at과 함께 갱신됩니다.
 * - 영업상태는 제공되는 데이터에만 저장합니다.
 */
async function syncToSupabase(restaurants: Restaurant[]): Promise<{ synced: boolean; error?: string }> {
  const serverClient = getServerSupabase();
  if (!serverClient || restaurants.length === 0) {
    return { synced: false, error: "Supabase 서버 클라이언트 미연결" };
  }

  const nowIso = new Date().toISOString();
  const rows = restaurants.map((item) => ({
    id: item.id,
    source: item.dataOrigin || "public_data_sdsc",
    original_id: item.originalId || item.id,
    name: item.name,
    category: item.category,
    raw_category: item.rawCategory || null,
    gu_name: item.guName,
    dong_name: item.dongName,
    road_address: item.roadAddress || null,
    jibun_address: item.jibunAddress || null,
    lat: item.lat,
    lng: item.lng,
    has_exact_coords: item.hasExactCoords ?? true,
    // 요구사항: 영업상태는 제공되는 데이터에만 저장
    business_status: item.businessStatus || null,
    phone: item.phone || null,
    summary: item.summary || null,
    tags: item.tags || [],
    data_source: "public_data",
    is_sample: false,
    updated_at: nowIso, // 요구사항: 갱신일 저장
  }));

  try {
    // 1차 시도: (source, original_id) 복합 유니크 키 기준 Upsert (중복 방지 및 갱신)
    const { error } = await serverClient
      .from("restaurants")
      .upsert(rows, { onConflict: "source,original_id" });

    if (error) {
      // 마이그레이션 SQL 실행 전 구버전 스키마 호환 fallback
      const legacyRows = rows.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        gu_name: r.gu_name,
        dong_name: r.dong_name,
        road_address: r.road_address,
        jibun_address: r.jibun_address,
        lat: r.lat,
        lng: r.lng,
        summary: r.summary,
        tags: r.tags,
        phone: r.phone,
        data_source: r.data_source,
        updated_at: r.updated_at,
      }));
      const fallbackRes = await serverClient
        .from("restaurants")
        .upsert(legacyRows, { onConflict: "id" });

      if (fallbackRes.error) {
        return { synced: false, error: fallbackRes.error.message };
      }
    }

    // 아이템에 갱신일자 및 DB 저장 상태 주입
    restaurants.forEach((r) => {
      r.updatedAt = nowIso;
      r.dataSource = "supabase";
    });

    return { synced: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Supabase upsert 예외 발생:", msg);
    return { synced: false, error: msg };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 서버 환경변수에서만 인증키 조회 (브라우저 노출 방지)
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY?.trim() || "";

  // 쿼리 파라미터 파싱
  const cx = searchParams.get("cx") || "126.9245"; // 기준 경도 (기본: 연남동)
  const cy = searchParams.get("cy") || "37.5625"; // 기준 위도 (기본: 연남동)
  const radius = searchParams.get("radius") || "3000"; // 반경 (m)
  // 요구사항: 전국 상가 음식점 모두 조회 및 등록된 음식점 최대 100건 지원
  const numOfRows = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "50", 10), 20),
    100
  );
  const pageNo = parseInt(searchParams.get("page") || "1", 10);
  const requestedSource = searchParams.get("source") || "sdsc2"; // "sdsc2" | "general"

  if (!serviceKey) {
    return NextResponse.json(
      {
        success: false,
        error: "서버에 DATA_GO_KR_SERVICE_KEY 환경변수가 설정되지 않았습니다.",
        hint: ".env.local 파일에 DATA_GO_KR_SERVICE_KEY를 설정해 주세요.",
        restaurants: [],
        count: 0,
      },
      { status: 500 }
    );
  }

  // 1. 소상공인시장진흥공단_상가(상권)정보 API 호출 (좌표 반경 기반 실데이터 20건)
  if (requestedSource === "sdsc2" || requestedSource === "all") {
    try {
      const sdscUrl = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?serviceKey=${serviceKey}&radius=${radius}&cx=${cx}&cy=${cy}&type=json&indsLclsCd=I2&numOfRows=${numOfRows}&page=${pageNo}`;

      const res = await fetch(sdscUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 }, // 실시간 수집 및 갱신
      });

      if (res.ok) {
        const json = await res.json();
        const rawItems: Sdsc2Item[] = json?.body?.items || [];
        const totalCount = json?.body?.totalCount || 0;

        if (rawItems.length > 0) {
          // 공공데이터 명세 준수:
          // 1) 원본 ID(bizesId), 이름, 주소, 업종, 위경도 완벽 보존
          // 2) 제공되지 않는 평점, 리뷰, 사진, 영업시간은 생성하지 않음 (undefined)
          // 3) 영업상태는 제공되는 데이터에만 저장 (소상공인 미제공 시 undefined)
          const restaurants: Restaurant[] = rawItems.map((item) => {
            const rawLat = parseFloat(String(item.lat));
            const rawLng = parseFloat(String(item.lon));
            const hasExactCoords = !isNaN(rawLat) && !isNaN(rawLng) && rawLat > 30 && rawLat < 45 && rawLng > 120 && rawLng < 135;
            const addressParsed = extractGuAndDong(item.rdnmAdr || "", item.lnoAdr || "");

            return {
              id: `pub-sdsc-${item.bizesId}`,
              originalId: item.bizesId,
              name: item.bizesNm,
              category: mapRawCategoryToStandard(item.indsMclsNm || item.indsSclsNm || "한식"),
              rawCategory: item.indsMclsNm || item.indsSclsNm || "일반음식",
              guName: item.signguNm || addressParsed.guName,
              dongName: item.adongNm || item.ldongNm || addressParsed.dongName,
              roadAddress: item.rdnmAdr || "도로명 주소 미제공",
              jibunAddress: item.lnoAdr || "지번 주소 미제공",
              lat: hasExactCoords ? rawLat : parseFloat(cy),
              lng: hasExactCoords ? rawLng : parseFloat(cx),
              hasExactCoords,
              summary: `[공공데이터포털 실데이터] 소상공인시장진흥공단_상가(상권)정보 등록 인허가 음식점입니다.`,
              tags: ["공공데이터", item.indsMclsNm || "음식", item.indsSclsNm || "일반음식점"].filter(Boolean),
              phone: item.telNo || undefined,
              dataSource: "public_data",
              dataOrigin: "public_data_sdsc",
              isSample: false,
              businessStatus: undefined, // 소상공인 API에서는 영업상태 미제공 -> 저장하지 않음
              // ※ 공공데이터 미제공 필드는 엄격하게 제외
              imageUrl: undefined,
              rating: undefined,
              reviewCount: undefined,
              starGrade: undefined,
              openHours: undefined,
              isOpenNow: undefined,
              coupon: undefined,
            };
          });

          // [5단계 핵심] 서버에서 Supabase DB로 Upsert (중복 방지 & 갱신)
          const dbSyncResult = await syncToSupabase(restaurants);

          return NextResponse.json({
            success: true,
            source: "public_data_sdsc",
            sourceTitle: "소상공인시장진흥공단_상가(상권)정보 Open API",
            totalCount,
            count: restaurants.length,
            restaurants,
            dbSynced: dbSyncResult.synced,
            dbError: dbSyncResult.error,
          });
        }
      }
    } catch (err: unknown) {
      console.error("SDSC2 API 호출 오류:", err);
    }
  }

  // 2. 행정안전부_일반음식점 API 호출 (일반음식점 인허가 정보)
  if (requestedSource === "general" || requestedSource === "all") {
    try {
      const govUrl = `https://apis.data.go.kr/1741000/general_restaurants/info?serviceKey=${serviceKey}&type=json&numOfRows=${numOfRows}&pageNo=${pageNo}`;

      const res = await fetch(govUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const json = await res.json();
        const rawItems: GovGeneralRestaurantItem[] =
          json?.response?.body?.items?.item || [];
        const totalCount = json?.response?.body?.totalCount || 0;

        if (rawItems.length > 0) {
          const restaurants: Restaurant[] = rawItems.map((item) => {
            const addressParsed = extractGuAndDong(item.ROAD_NM_ADDR || "", item.LOTNO_ADDR || "");

            return {
              id: `pub-gov-${item.MNG_NO}`,
              originalId: item.MNG_NO,
              name: item.BPLC_NM,
              category: mapRawCategoryToStandard(item.SNTTN_BZSTAT_NM || "한식"),
              rawCategory: item.SNTTN_BZSTAT_NM || "일반음식점",
              guName: addressParsed.guName,
              dongName: addressParsed.dongName,
              roadAddress: item.ROAD_NM_ADDR || "도로명 주소 미제공",
              jibunAddress: item.LOTNO_ADDR || "지번 주소 미제공",
              lat: parseFloat(cy),
              lng: parseFloat(cx),
              hasExactCoords: false,
              summary: `[공공데이터포털 실데이터] 행정안전부 일반음식점 인허가 개방 정보입니다. (상태: ${item.SALS_STTS_NM || "영업/정상"})`,
              tags: ["공공데이터", "행정안전부", item.SNTTN_BZSTAT_NM || "음식", item.SALS_STTS_NM || "영업"].filter(Boolean),
              phone: item.TELNO || undefined,
              dataSource: "public_data",
              dataOrigin: "public_data_gov",
              isSample: false,
              // 요구사항: 영업상태는 제공되는 데이터에만 저장 (행정안전부 제공: SALS_STTS_NM)
              businessStatus: item.SALS_STTS_NM || "영업/정상",
              imageUrl: undefined,
              rating: undefined,
              reviewCount: undefined,
              starGrade: undefined,
              openHours: undefined,
              isOpenNow: undefined,
              coupon: undefined,
            };
          });

          // [5단계 핵심] 서버에서 Supabase DB로 Upsert
          const dbSyncResult = await syncToSupabase(restaurants);

          return NextResponse.json({
            success: true,
            source: "public_data_gov",
            sourceTitle: "행정안전부_일반음식점 조회서비스 Open API",
            totalCount,
            count: restaurants.length,
            restaurants,
            dbSynced: dbSyncResult.synced,
            dbError: dbSyncResult.error,
          });
        }
      }
    } catch (err: unknown) {
      console.error("General restaurants API 호출 오류:", err);
    }
  }

  // 3. API 호출 실패 또는 결과가 0건인 경우
  return NextResponse.json({
    success: true,
    source: "public_data_empty",
    count: 0,
    restaurants: [],
    message: "선택하신 지역의 공공데이터 음식점 실시간 조회 결과가 0건입니다.",
  });
}
