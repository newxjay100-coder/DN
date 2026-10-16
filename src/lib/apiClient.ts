import { Capacitor } from "@capacitor/core";
import { REAL_RESTAURANTS } from "@/data/realRestaurants";
import { Restaurant, RestaurantWithDistance } from "@/types/restaurant";
import { calculateDistanceMeters } from "@/utils/distance";

/**
 * [동내(DONGNAE) 공통 API 클라이언트]
 * - 웹 환경: 상대 경로(/api/...)를 통해 동일 오리진 Next.js 서버를 직접 호출합니다.
 * - 모바일 앱(Capacitor) 환경:
 *   1) NEXT_PUBLIC_API_BASE_URL (배포된 HTTPS 서버)로 호출합니다.
 *   2) 오프라인 상태이거나 네트워크 장애 발생 시, 로컬 내장 실데이터(REAL_RESTAURANTS)와
 *      클라이언트 지리연산(Haversine)으로 안전하게 자동 전환(Fallback)되어 앱이 절대 멈추지 않습니다.
 * - 절대 규칙: 공공데이터 인증키나 Supabase 서비스 롤 키와 같은 비밀 키는 클라이언트에 절대 노출되지 않습니다.
 */

export function getApiBaseUrl(): string {
  // 환경변수에 설정된 배포 HTTPS API 서버가 있는 경우 우선 적용
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 모바일 앱 환경에서 API_BASE_URL 미지정 시
  if (Capacitor.isNativePlatform()) {
    return "";
  }

  // 웹 브라우저 환경에서는 상대 경로 사용
  return "";
}

export interface FetchRestaurantsParams {
  id?: string;
  lat?: number;
  lng?: number;
  radius?: number | "all";
  dong?: string;
  category?: string;
  search?: string;
  source?: "public_data" | "curated" | "all";
  limit?: number;
}

/**
 * 음식점 목록 및 주변 검색 API 호출
 */
export async function apiFetchRestaurants(
  params: FetchRestaurantsParams = {}
): Promise<{
  success: boolean;
  restaurants: RestaurantWithDistance[];
  source: string;
  count: number;
  error?: string;
}> {
  const baseUrl = getApiBaseUrl();
  const searchParams = new URLSearchParams();

  if (params.id) searchParams.set("id", params.id);
  if (params.lat !== undefined && !isNaN(params.lat))
    searchParams.set("lat", String(params.lat));
  if (params.lng !== undefined && !isNaN(params.lng))
    searchParams.set("lng", String(params.lng));
  if (params.radius !== undefined)
    searchParams.set("radius", String(params.radius));
  if (params.dong && params.dong !== "전체 동" && params.dong !== "전체")
    searchParams.set("dong", params.dong);
  if (params.category && params.category !== "전체")
    searchParams.set("category", params.category);
  if (params.search) searchParams.set("search", params.search);
  if (params.source) searchParams.set("source", params.source);
  if (params.limit) searchParams.set("limit", String(params.limit));

  const url = `${baseUrl}/api/restaurants?${searchParams.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.restaurants)) {
        return {
          success: true,
          restaurants: data.restaurants,
          source: data.source || "remote_api",
          count: data.count || data.restaurants.length,
        };
      }
    }
  } catch (err) {
    console.warn("원격 API 호출 실패, 오프라인 로컬 데이터셋으로 전환:", err);
  }

  // Fallback: 로컬 데이터셋 및 거리 계산 (오프라인 모드 완벽 지원)
  let list: RestaurantWithDistance[] = REAL_RESTAURANTS.map((item) => {
    let distanceMeters = 0;
    if (params.lat !== undefined && params.lng !== undefined) {
      distanceMeters = calculateDistanceMeters(
        params.lat,
        params.lng,
        item.lat,
        item.lng
      );
    }
    return { ...item, distanceMeters };
  });

  // 반경 필터
  if (
    params.radius &&
    params.radius !== "all" &&
    params.lat !== undefined &&
    params.lng !== undefined
  ) {
    const rMeters = Number(params.radius);
    list = list.filter((item) => item.distanceMeters <= rMeters);
  }

  // 동네 필터
  if (params.dong && params.dong !== "전체 동" && params.dong !== "전체") {
    list = list.filter((item) => item.dongName === params.dong);
  }

  // 업종 필터
  if (params.category && params.category !== "전체") {
    list = list.filter((item) => item.category === params.category);
  }

  // 검색어 필터
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roadAddress.toLowerCase().includes(q) ||
        r.dongName.toLowerCase().includes(q)
    );
  }

  if (params.lat !== undefined && params.lng !== undefined) {
    list.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  return {
    success: true,
    restaurants: list,
    source: "local_dataset_offline",
    count: list.length,
  };
}

/**
 * 공공데이터 실시간 상권 정보 호출
 */
export async function apiFetchPublicData(params: {
  cx: number;
  cy: number;
  radius: number;
  limit?: number;
}): Promise<{
  success: boolean;
  restaurants: Restaurant[];
  count: number;
  error?: string;
}> {
  const baseUrl = getApiBaseUrl();
  const searchParams = new URLSearchParams({
    cx: String(params.cx),
    cy: String(params.cy),
    radius: String(params.radius),
    limit: String(params.limit || 50),
  });

  const url = `${baseUrl}/api/public-data?${searchParams.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        restaurants: data.restaurants || [],
        count: data.count || (data.restaurants?.length ?? 0),
      };
    }
    const errJson = await res.json().catch(() => ({}));
    return {
      success: false,
      restaurants: [],
      count: 0,
      error: errJson?.error || "공공데이터 호출 실패",
    };
  } catch (err) {
    return {
      success: false,
      restaurants: [],
      count: 0,
      error: err instanceof Error ? err.message : "네트워크 오류",
    };
  }
}
