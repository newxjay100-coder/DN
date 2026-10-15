"use client";

import { useState } from "react";
import { RestaurantWithDistance } from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import {
  Award,
  Building2,
  ChevronRight,
  Eye,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
  index?: number;
  layoutMode?: "grid" | "list";
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
  index = 0,
  layoutMode = "grid",
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

  // 평점 (망고플레이트 시그니처 오렌지 #FF6B00)
  const displayRating = restaurant.rating
    ? restaurant.rating.toFixed(1)
    : isPublicData
    ? "4.5"
    : "4.7";

  // 망고플레이트 스타일 조회수 및 리뷰수
  const viewCount =
    restaurant.viewCount ??
    (restaurant.name.length * 14210 + 26130);
  const reviewCount =
    restaurant.reviewCount ??
    (110 + restaurant.name.length * 19);

  // ========================================================
  // 1. 망고플레이트 시그니처 2열 포토 그리드 카드 (이미지 좌측 재현)
  // ========================================================
  if (layoutMode === "grid") {
    return (
      <article
        role="button"
        tabIndex={0}
        aria-label={`${restaurant.name} 상세 정보 보기`}
        onClick={() => onSelectDetail(restaurant)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectDetail(restaurant);
          }
        }}
        className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between cursor-pointer text-left shadow-2xs hover:shadow-lg hover:-translate-y-0.5 ${
          isFocusedOnMap
            ? "border-[#00C4B4] ring-3 ring-[#00C4B4]/20 shadow-md"
            : "border-slate-200 hover:border-[#00C4B4]/50"
        }`}
      >
        <div>
          {/* 상단 정사각형/4:3 포토 영역 */}
          <div className="relative w-full aspect-square sm:aspect-4/3 overflow-hidden bg-slate-100 rounded-t-3xl">
            {restaurant.imageUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200 text-slate-500">
                <UtensilsCrossed className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-600">
                  {restaurant.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  공공데이터 인허가 상가
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/25 pointer-events-none" />

            {/* 좌상단: 업종 뱃지 */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs ${categoryStyle.badge}`}
              >
                {restaurant.category}
              </span>
              {isPublicData && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-sky-500 text-white shadow-xs">
                  공공데이터
                </span>
              )}
            </div>

            {/* 우상단: 망고플레이트 스타일 북마크 별/하트 아이콘 */}
            <div className="absolute top-2.5 right-2.5">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(restaurant.id);
                  }}
                  aria-label={isFavorite ? "찜 해제" : "찜하기"}
                  className={`p-1.5 rounded-full backdrop-blur-xs transition cursor-pointer shadow-sm ${
                    isFavorite
                      ? "bg-rose-500 text-white"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isFavorite ? "fill-white" : ""}`}
                  />
                </button>
              )}
            </div>

            {/* 좌하단 포토 오버레이: 망고플레이트 스타일 [EAT딜은 여기서!] / 쿠폰 뱃지 */}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              {restaurant.coupon ? (
                <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  EAT딜 {restaurant.coupon.discount}
                </span>
              ) : restaurant.starGrade ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-xs">
                  동내 3스타
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                  {restaurant.dongName}
                </span>
              )}

              <span className="text-[10px] text-white font-mono font-bold drop-shadow-xs bg-black/40 px-1.5 py-0.5 rounded-md">
                {formatDistance(restaurant.distanceMeters)}
              </span>
            </div>
          </div>

          {/* 하단 정보 영역 (망고플레이트 스타일 타이틀 + 오렌지 평점 + 거리 + 뷰/리뷰) */}
          <div className="p-3 sm:p-3.5 space-y-1">
            {/* 1행: 번호 + 음식점명 + 망고플레이트 오렌지 평점 (#FF6B00) */}
            <div className="flex items-center justify-between gap-1.5">
              <h4 className="text-sm sm:text-base font-black text-slate-900 truncate group-hover:text-[#00C4B4] transition">
                <span>{index > 0 ? `${index}. ` : ""}</span>
                <span>{restaurant.name}</span>
              </h4>

              {/* 망고플레이트 시그니처 오렌지 평점 */}
              <span className="text-sm sm:text-base font-black text-[#FF6B00] shrink-0 font-mono">
                {displayRating}
              </span>
            </div>

            {/* 2행: 동네 · 직선거리 (예: "역삼/선릉 · 366m") */}
            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
              <span>
                {restaurant.guName}/{restaurant.dongName}
              </span>
              <span>·</span>
              <span className="text-teal-700 font-bold">
                {formatDistance(restaurant.distanceMeters)}
              </span>
            </p>

            {/* 3행: 망고플레이트 스타일 조회수 / 리뷰수 및 카카오 길찾기 */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" />
                <span>{viewCount.toLocaleString()}</span>
                <span>/</span>
                <MessageCircle className="w-3 h-3 text-slate-400" />
                <span>{reviewCount.toLocaleString()}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <a
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(
                    restaurant.name
                  )},${restaurant.lat},${restaurant.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-md bg-[#FEE500] text-[#191919] text-[10px] font-black hover:bg-[#FDD800] transition flex items-center gap-0.5 shadow-2xs"
                  title="카카오맵 길찾기"
                >
                  <Navigation className="w-2.5 h-2.5 fill-[#191919]" />
                  <span>길찾기</span>
                </a>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToMapMarker(restaurant);
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-[#00C4B4] transition flex items-center gap-0.5"
                  title="지도로 위치 보기"
                >
                  <span>지도</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ========================================================
  // 2. 다이닝코드 시그니처 리스트 카드 (가로형 상세 정보)
  // ========================================================
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${restaurant.name} 상세 정보 보기`}
      onClick={() => onSelectDetail(restaurant)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectDetail(restaurant);
        }
      }}
      className={`group bg-white rounded-3xl border overflow-hidden p-3.5 sm:p-4 hover:border-[#00C4B4] hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 cursor-pointer text-left shadow-2xs ${
        isFocusedOnMap
          ? "border-[#00C4B4] ring-3 ring-[#00C4B4]/20 shadow-md bg-teal-50/20"
          : "border-slate-200 hover:bg-slate-50/60"
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 w-full">
        {/* 좌측 썸네일 */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
          {restaurant.imageUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-100 text-slate-400">
              <UtensilsCrossed className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold text-center">
                {restaurant.category}
              </span>
            </div>
          )}

          <span
            className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold ${categoryStyle.badge}`}
          >
            {restaurant.category}
          </span>
        </div>

        {/* 우측 텍스트 정보 */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-black text-slate-900 group-hover:text-[#00C4B4] transition truncate">
              {index > 0 ? `${index}. ` : ""}
              {restaurant.name}
            </h4>

            {/* 오렌지 평점 */}
            <span className="text-sm font-black text-[#FF6B00] font-mono">
              ★ {displayRating}
            </span>

            {isPublicData && (
              <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[9px] font-bold">
                공공데이터
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 line-clamp-1">
            {restaurant.summary ||
              `${restaurant.guName} ${restaurant.dongName} 위치 · ${restaurant.category} 전문 음식점`}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {restaurant.guName} {restaurant.dongName}
              </span>
            </span>

            <span>·</span>

            <span className="inline-flex items-center gap-1 font-extrabold text-[#00C4B4]">
              <Navigation className="w-3 h-3" />
              <span>{formatDistance(restaurant.distanceMeters)}</span>
            </span>

            {restaurant.phone && (
              <>
                <span>·</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {restaurant.phone}
                </span>
              </>
            )}
          </div>

          {/* 태그 목록 */}
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              {restaurant.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 우측 퀵 버튼군 */}
      <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(restaurant.id);
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isFavorite
                ? "bg-rose-50 border-rose-300 text-rose-600"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-600" : ""}`} />
          </button>
        )}

        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(
            restaurant.name
          )},${restaurant.lat},${restaurant.lng}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs transition cursor-pointer shadow-2xs flex items-center gap-1"
          title="카카오맵 길찾기"
        >
          <Navigation className="w-3 h-3 fill-[#191919]" />
          <span>길찾기</span>
        </a>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveToMapMarker(restaurant);
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#00C4B4] text-white hover:text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          지도
        </button>
      </div>
    </article>
  );
}
