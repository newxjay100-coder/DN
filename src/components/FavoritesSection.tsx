"use client";

import { RestaurantWithDistance } from "@/types/restaurant";
import RestaurantCard from "./RestaurantCard";
import { Bookmark, Heart, MapPin, Sparkles } from "lucide-react";

interface FavoritesSectionProps {
  favoriteRestaurants: RestaurantWithDistance[];
  onSelectRestaurantDetail: (restaurant: RestaurantWithDistance) => void;
  onMoveToMapMarker: (restaurant: RestaurantWithDistance) => void;
  onSwitchToRegionTab: () => void;
}

export default function FavoritesSection({
  favoriteRestaurants,
  onSelectRestaurantDetail,
  onMoveToMapMarker,
  onSwitchToRegionTab,
}: FavoritesSectionProps) {
  if (favoriteRestaurants.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-900">
          아직 찜한 맛집이 없습니다
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          마음에 드는 음식점 카드의 하트(❤️) 버튼을 눌러 나만의 단골 맛집 리스트를 만들어 보세요!
        </p>
        <button
          type="button"
          onClick={onSwitchToRegionTab}
          className="mt-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          맛집 둘러보기 →
        </button>
      </div>
    );
  }

  return (
    <section aria-label="내가 찜한 맛집 목록" className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              내가 찜한 맛집 ({favoriteRestaurants.length}곳)
            </h2>
            <p className="text-xs text-slate-500">
              브라우저에 안전하게 저장된 나만의 단골 맛집 버킷리스트
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitchToRegionTab}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
        >
          + 더 많은 맛집 찾기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSelectDetail={onSelectRestaurantDetail}
            onMoveToMapMarker={onMoveToMapMarker}
          />
        ))}
      </div>
    </section>
  );
}
