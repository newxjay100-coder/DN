"use client";

import { RestaurantWithDistance } from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import { Award, ChevronRight, Crown, Star } from "lucide-react";

interface BestRankingSidePanelProps {
  currentDongName: string;
  restaurants: RestaurantWithDistance[];
  onSelectRestaurantDetail: (restaurant: RestaurantWithDistance) => void;
  onMoveToMapMarker: (restaurant: RestaurantWithDistance) => void;
}

export default function BestRankingSidePanel({
  currentDongName,
  restaurants,
  onSelectRestaurantDetail,
  onMoveToMapMarker,
}: BestRankingSidePanelProps) {
  // 거리와 평점(rating)을 종합하여 TOP 5 랭킹 산출
  const top5Restaurants = [...restaurants]
    .sort((a, b) => {
      // 1순위: 평점 (내림차순)
      const rA = a.rating || 4.5;
      const rB = b.rating || 4.5;
      if (rB !== rA) return rB - rA;
      // 2순위: 거리 (오름차순)
      return a.distanceMeters - b.distanceMeters;
    })
    .slice(0, 5);

  if (top5Restaurants.length === 0) return null;

  return (
    <aside
      aria-label="동네 실시간 BEST 랭킹 TOP 5"
      className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col"
    >
      {/* 랭킹 상단 오렌지/앰버 헤더 (식신 우측 랭킹 바 재현) */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-200 fill-amber-200" />
          <h3 className="text-sm font-black tracking-tight">
            {currentDongName} Best 랭킹 TOP 5
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
          실시간 순위
        </span>
      </div>

      {/* 1위~5위 랭킹 리스트 */}
      <div className="p-3 divide-y divide-slate-100 flex-1 space-y-1">
        {top5Restaurants.map((restaurant, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;

          return (
            <div
              key={restaurant.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRestaurantDetail(restaurant)}
              className="pt-2 pb-1.5 first:pt-1 group flex items-center gap-3 rounded-2xl p-2 hover:bg-amber-50/60 transition cursor-pointer"
            >
              {/* 순위 뱃지 */}
              <div className="relative shrink-0 w-8 flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shadow-xs ${
                    rank === 1
                      ? "bg-rose-500 text-white ring-2 ring-rose-300"
                      : rank === 2
                      ? "bg-amber-500 text-white"
                      : rank === 3
                      ? "bg-amber-400 text-slate-950 font-black"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {rank}
                </span>
                {isTop3 && (
                  <span className="text-[9px] font-black text-rose-600 mt-0.5">
                    BEST
                  </span>
                )}
              </div>

              {/* 음식 사진 썸네일 */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={restaurant.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  loading="lazy"
                />
              </div>

              {/* 음식점 정보 */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition truncate">
                    {restaurant.name}
                  </h4>
                  {restaurant.starGrade === "3star" && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                      3스타
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {restaurant.category}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 font-bold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {restaurant.rating || 4.8}
                  </span>
                  <span>·</span>
                  <span className="text-slate-400 font-mono">
                    {formatDistance(restaurant.distanceMeters)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  {restaurant.summary}
                </p>
              </div>

              {/* 이동 아이콘 */}
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          );
        })}
      </div>

      {/* 하단 식신 인증 푸터 바 */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1 font-semibold text-slate-700">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          동내(DONGNAE) 빅데이터 기반 엄선
        </span>
        <span className="text-amber-700 font-bold">100% 광고 없는 랭킹</span>
      </div>
    </aside>
  );
}
