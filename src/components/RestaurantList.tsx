"use client";

import { RestaurantWithDistance } from "@/types/restaurant";
import RestaurantCard from "./RestaurantCard";
import { Building2, RefreshCw, SearchX, Sparkles } from "lucide-react";

interface RestaurantListProps {
  restaurants: RestaurantWithDistance[];
  focusedRestaurantId?: string | null;
  dataSourceFilter?: "all" | "public_data" | "curated";
  publicDataError?: string | null;
  onSelectRestaurantDetail: (restaurant: RestaurantWithDistance) => void;
  onMoveToMapMarker: (restaurant: RestaurantWithDistance) => void;
  onResetFilters: () => void;
  onSelectDefaultRegion: () => void;
  onSwitchToCurated?: () => void;
  onRetryPublicData?: () => void;
}

export default function RestaurantList({
  restaurants,
  focusedRestaurantId,
  dataSourceFilter = "public_data",
  publicDataError,
  onSelectRestaurantDetail,
  onMoveToMapMarker,
  onResetFilters,
  onSelectDefaultRegion,
  onSwitchToCurated,
  onRetryPublicData,
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    const isPublicMode = dataSourceFilter === "public_data";

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center my-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          {isPublicMode ? (
            <Building2 className="w-7 h-7 text-sky-600" />
          ) : (
            <SearchX className="w-7 h-7 text-slate-400" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1.5">
          {isPublicMode
            ? "선택한 동네의 공공데이터 음식점 결과가 없습니다"
            : "조건에 일치하는 음식점이 없습니다"}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
          {isPublicMode ? (
            <>
              {publicDataError ? (
                <span className="text-rose-600 font-bold block mb-1">
                  사유: {publicDataError}
                </span>
              ) : null}
              공공데이터포털(소상공인시장진흥공단/행정안전부)에서 해당 반경 내에 등록된 음식점이 없거나 필터 조건에 맞지 않습니다. 반경을 넓히거나 다른 동네를 선택해 보세요.
            </>
          ) : (
            <>
              검색어, 업종 필터, 또는 탐색 반경(500m / 1km / 3km)을 변경해 보세요.
              상단의 <strong>&lsquo;동네·주소 검색&rsquo;</strong>을 통해 원하는 동네로 직접 이동하실 수도 있습니다.
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isPublicMode && onRetryPublicData && (
            <button
              type="button"
              onClick={onRetryPublicData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-700 text-white hover:bg-sky-800 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>공공데이터 다시 조회</span>
            </button>
          )}

          {isPublicMode && onSwitchToCurated && (
            <button
              type="button"
              onClick={onSwitchToCurated}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-500 transition shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>검증 큐레이션 맛집 보기</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            필터 초기화
          </button>

          <button
            type="button"
            onClick={onSelectDefaultRegion}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition shadow-2xs cursor-pointer"
          >
            기본 동네(연남동)로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          isFocusedOnMap={focusedRestaurantId === restaurant.id}
          onSelectDetail={onSelectRestaurantDetail}
          onMoveToMapMarker={onMoveToMapMarker}
        />
      ))}
    </div>
  );
}
