"use client";

import { useState } from "react";
import { RestaurantWithDistance } from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import {
  Award,
  Building2,
  ChevronRight,
  Database,
  Gift,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  Star,
  Tag,
  UtensilsCrossed,
} from "lucide-react";

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
  isFocusedOnMap?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onSelectDetail: (restaurant: RestaurantWithDistance) => void;
  onMoveToMapMarker: (restaurant: RestaurantWithDistance) => void;
}

const CATEGORY_STYLES: Record<string, { badge: string; pill: string }> = {
  한식: {
    badge: "bg-orange-500 text-white",
    pill: "bg-orange-50 text-orange-800 border-orange-200",
  },
  일식: {
    badge: "bg-sky-500 text-white",
    pill: "bg-sky-50 text-sky-800 border-sky-200",
  },
  중식: {
    badge: "bg-red-500 text-white",
    pill: "bg-red-50 text-red-800 border-red-200",
  },
  양식: {
    badge: "bg-purple-500 text-white",
    pill: "bg-purple-50 text-purple-800 border-purple-200",
  },
  분식: {
    badge: "bg-rose-500 text-white",
    pill: "bg-rose-50 text-rose-800 border-rose-200",
  },
  "카페/디저트": {
    badge: "bg-amber-500 text-white",
    pill: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export default function RestaurantCard({
  restaurant,
  isFocusedOnMap = false,
  isFavorite = false,
  onToggleFavorite,
  onSelectDetail,
  onMoveToMapMarker,
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);

  const isPublicData = restaurant.dataSource === "public_data";

  const categoryStyle =
    CATEGORY_STYLES[restaurant.category] ?? {
      badge: "bg-slate-700 text-white",
      pill: "bg-slate-100 text-slate-800 border-slate-200",
    };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${restaurant.name} 마커로 지도 이동`}
      onClick={() => onMoveToMapMarker(restaurant)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onMoveToMapMarker(restaurant);
        }
      }}
      className={`group bg-white rounded-3xl border overflow-hidden hover:border-amber-400 hover:shadow-xl active:scale-[0.99] transition-all duration-300 flex flex-col justify-between cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isFocusedOnMap
          ? "border-amber-500 ring-3 ring-amber-400/20 shadow-lg"
          : isPublicData
          ? "border-sky-200 bg-sky-50/10 shadow-2xs"
          : "border-slate-200/90 shadow-2xs"
      }`}
    >
      <div>
        {/* 상단 썸네일 영역 */}
        {restaurant.imageUrl && !imageError ? (
          <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-black/35 pointer-events-none" />

            {/* 좌상단: 업종 뱃지 & 데이터 출처 */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${categoryStyle.badge}`}
              >
                {restaurant.category}
              </span>

              {isPublicData ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500 text-white shadow-sm flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  공공데이터
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  큐레이션
                </span>
              )}

              {/* 동내 시그니처 스타 등급 뱃지 (큐레이션에만 존재) */}
              {restaurant.starGrade === "3star" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                  <Award className="w-3 h-3" />
                  ★★★ 동내 3스타
                </span>
              )}
              {restaurant.starGrade === "2star" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-slate-950 shadow-sm flex items-center gap-0.5">
                  ★★ 동내 2스타
                </span>
              )}
              {restaurant.starGrade === "1star" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-900 shadow-sm flex items-center gap-0.5">
                  ★ 동내 1스타
                </span>
              )}
            </div>

            {/* 우상단: 찜하기 & 거리 */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(restaurant.id);
                  }}
                  aria-label={isFavorite ? "찜 해제" : "찜하기"}
                  className={`p-2 rounded-full backdrop-blur-xs transition cursor-pointer shadow-md ${
                    isFavorite
                      ? "bg-rose-500 text-white"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`}
                  />
                </button>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                <Navigation className="w-3 h-3 text-slate-950" />
                <span>직선거리 {formatDistance(restaurant.distanceMeters)}</span>
              </span>
            </div>

            {/* 좌하단: 주소 & 영업시간 */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold drop-shadow-md">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {restaurant.guName} {restaurant.dongName}
                </span>
              </span>

              {restaurant.openHours && (
                <span className="text-[11px] text-amber-200 truncate max-w-[150px]">
                  {restaurant.openHours.split("(")[0].trim()}
                </span>
              )}
            </div>
          </div>
        ) : (
          /* 공공데이터 등 사진 미제공 업소: 사진을 날조하지 않고 정직한 공공데이터 표준 플레이스홀더 카드 렌더링 */
          <div className="relative w-full h-36 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 border-b border-slate-200 flex flex-col justify-between p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${categoryStyle.badge}`}
                >
                  {restaurant.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-700 text-white flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  공공데이터 실데이터
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-900 text-white">
                <Navigation className="w-3 h-3 text-amber-400" />
                <span>직선거리 {formatDistance(restaurant.distanceMeters)}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                {restaurant.guName} {restaurant.dongName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {restaurant.originalId ? `ID: ${restaurant.originalId}` : "공공데이터 등록"}
              </span>
            </div>
          </div>
        )}

        {/* 본문 설명 영역 */}
        <div className="p-4 sm:p-4.5 space-y-2">
          {/* 상호명 & 평점/상태 */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition tracking-tight truncate">
              {restaurant.name}
            </h3>

            {/* 평점 및 리뷰수 (공공데이터 미제공 시 임의 생성 금지 준수) */}
            {restaurant.rating !== undefined && restaurant.rating !== null ? (
              <div className="flex items-center gap-1 text-xs shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="font-black text-slate-900">
                  {restaurant.rating}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({restaurant.reviewCount || 0})
                </span>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium shrink-0">
                별점/리뷰 없음 (공공데이터)
              </span>
            )}
          </div>

          {/* 한줄 요약 */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {restaurant.summary}
          </p>

          {/* 공공데이터 출처 및 원본 ID 안내 태그 */}
          {isPublicData && (
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-sky-600" />
                {restaurant.dataOrigin === "public_data_sdsc"
                  ? "소상공인시장진흥공단_상가정보"
                  : "행정안전부_일반음식점"}
              </span>
              <span className="font-mono text-[10px] text-sky-700">
                원천번호: {restaurant.originalId || restaurant.id}
              </span>
            </div>
          )}

          {/* 쿠폰 혜택 배너 (큐레이션 맛집 쿠폰이 있을 때만 표시) */}
          {restaurant.coupon && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-950 font-bold">
              <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{restaurant.coupon.discount}</span>
              <span className="text-[10px] text-amber-700 font-normal">
                ({restaurant.coupon.title})
              </span>
            </div>
          )}

          {/* 도로명 주소 */}
          <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{restaurant.roadAddress}</span>
          </div>

          {/* 원본 업종 및 태그 */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
            {restaurant.businessStatus && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  restaurant.businessStatus.includes("영업") ||
                  restaurant.businessStatus.includes("정상")
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {restaurant.businessStatus}
              </span>
            )}
            {restaurant.rawCategory && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                업종: {restaurant.rawCategory}
              </span>
            )}
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 바 */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          터치 시 지도 마커로 즉시 이동
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveToMapMarker(restaurant);
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-amber-600" />
            <span>지도 위치</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetail(restaurant);
            }}
            className="inline-flex items-center gap-1 text-xs font-black text-slate-950 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 transition shadow-2xs cursor-pointer"
          >
            <span>상세정보</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
