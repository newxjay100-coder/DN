/**
 * 음식점 도메인 타입 정의
 * - 수도권 (서울 · 경기 · 인천) 맛집 탐색 및 위치 기반 필터링
 */

export type FoodCategory =
  | "전체"
  | "한식"
  | "일식"
  | "중식"
  | "양식"
  | "분식"
  | "카페/디저트";

export type RadiusOption = "all" | 500 | 1000 | 3000 | 5000 | 10000;

export type ViewMode = "list" | "map";

export type LocationMode = "geolocation" | "manual_region";

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "timeout"
  | "unavailable"
  | "unsupported";

export type StarGrade = "3star" | "2star" | "1star" | "thetable";

export type MainTab = "region" | "theme" | "ranking" | "coupon" | "favorites";

export type ThemeCategory =
  | "전체"
  | "데이트코스"
  | "노포·백년가게"
  | "직장인점심"
  | "회식·고기파티"
  | "감성카페·디저트";

export interface RestaurantCoupon {
  id: string;
  title: string;
  discount: string;
  description: string;
  code: string;
  validUntil: string;
}

export interface UserReview {
  id: string;
  restaurantId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DongRegion {
  id: string;
  cityName: string;
  guName: string;
  dongName: string;
  centerLat: number;
  centerLng: number;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: Exclude<FoodCategory, "전체">;
  guName: string;
  dongName: string;
  roadAddress: string;
  jibunAddress: string;
  lat: number;
  lng: number;
  summary: string;
  tags: string[];
  phone?: string;
  imageUrl?: string;
  rating?: number; // 예: 4.8, 4.9
  reviewCount?: number; // 예: 284
  starGrade?: StarGrade; // 식신 3스타 / 2스타 / 1스타 / 더테이블
  openHours?: string; // 예: "11:30 - 21:30 (라스트오더 21:00)"
  isOpenNow?: boolean;
  themeTags?: string[]; // 예: ["데이트", "노포", "회식"]
  coupon?: RestaurantCoupon;
  dataSource?: "supabase" | "public_data" | "default";
  isSample?: boolean;
  originalId?: string; // 공공데이터 원본 고유번호 (bizesId 또는 MNG_NO)
  rawCategory?: string; // 공공데이터 원본 업종명 (예: 서양식, 기타, 한식 등)
  dataOrigin?: "public_data_sdsc" | "public_data_gov" | "curated"; // 공공데이터 출처 기관
  hasExactCoords?: boolean; // 위도/경도 정확도 여부 (false 시 좌표 미제공 주소 기반)
  businessStatus?: string; // 영업상태 (영업/정상, 폐업 등, 제공되는 데이터에만 저장)
  updatedAt?: string; // DB 최종 갱신일시
}

export type SampleRestaurant = Restaurant;

export interface RestaurantWithDistance extends Restaurant {
  /** 기준 좌표로부터의 직선거리 (미터 단위) */
  distanceMeters: number;
}
