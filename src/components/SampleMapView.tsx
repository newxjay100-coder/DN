"use client";

import { useEffect, useMemo, useState } from "react";
import { TARGET_DONG_REGIONS } from "@/data/realRestaurants";
import { LocationMode, RadiusOption, RestaurantWithDistance } from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import { ChevronRight, Compass, Info, MapPin } from "lucide-react";

interface SampleMapViewProps {
  restaurants: RestaurantWithDistance[];
  centerCoords: { lat: number; lng: number };
  selectedRadius: RadiusOption;
  locationMode: LocationMode;
  focusedRestaurantId?: string | null;
  onSelectRestaurant: (restaurant: RestaurantWithDistance) => void;
}

export default function SampleMapView({
  restaurants,
  centerCoords,
  selectedRadius,
  locationMode,
  focusedRestaurantId,
  onSelectRestaurant,
}: SampleMapViewProps) {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(
    focusedRestaurantId ?? restaurants[0]?.id ?? null
  );

  useEffect(() => {
    if (focusedRestaurantId) {
      setActiveMarkerId(focusedRestaurantId);
    }
  }, [focusedRestaurantId]);

  const bounds = useMemo(() => {
    const lats = [centerCoords.lat, ...restaurants.slice(0, 15).map((r) => r.lat)];
    const lngs = [centerCoords.lng, ...restaurants.slice(0, 15).map((r) => r.lng)];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = Math.max((maxLat - minLat) * 0.2, 0.012);
    const padLng = Math.max((maxLng - minLng) * 0.2, 0.015);
    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
    };
  }, [centerCoords, restaurants]);

  const projectToPercent = (lat: number, lng: number) => {
    const latSpan = bounds.maxLat - bounds.minLat || 0.01;
    const lngSpan = bounds.maxLng - bounds.minLng || 0.01;
    const x = ((lng - bounds.minLng) / lngSpan) * 100;
    const y = ((bounds.maxLat - lat) / latSpan) * 100;
    return {
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(12, Math.min(88, y)),
    };
  };

  const selectedMarkerRestaurant =
    restaurants.find((r) => r.id === activeMarkerId) ?? restaurants[0] ?? null;

  const centerPos = projectToPercent(centerCoords.lat, centerCoords.lng);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 상단 안내 바 */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>인터랙티브 프리뷰 지도</strong> —{" "}
            {locationMode === "geolocation"
              ? "내 현재 위치(GPS) 기준 반경 탐색"
              : "선택 지역 기준 반경 탐색"}{" "}
            (반경 내 {restaurants.length}곳)
          </span>
        </div>
        <span className="text-slate-300 font-mono text-[11px]">
          마커 클릭 시 요약 표시 및 상세 연동
        </span>
      </div>

      {/* 지도 캔버스 영역 */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-100 overflow-hidden select-none">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="real-map-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#real-map-grid)" />

          <path
            d="M 0 420 Q 260 390 600 460 T 1100 450"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="26"
            opacity="0.6"
          />
          <path
            d="M 450 0 L 680 320"
            fill="none"
            stroke="#bbf7d0"
            strokeWidth="12"
            strokeDasharray="6 4"
            opacity="0.7"
          />
        </svg>

        {/* 동네 라벨 표시 */}
        {TARGET_DONG_REGIONS.map((dong) => {
          const pos = projectToPercent(dong.centerLat, dong.centerLng);
          return (
            <div
              key={dong.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-slate-300 text-[11px] font-bold text-slate-600 shadow-2xs">
                {dong.dongName}
              </span>
            </div>
          );
        })}

        {/* 기준 위치 반경 시각화 원 */}
        <div
          style={{ left: `${centerPos.x}%`, top: `${centerPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
        >
          {selectedRadius !== "all" && (
            <div
              className="rounded-full border-2 border-dashed border-emerald-500/60 bg-emerald-400/10 transition-all duration-300"
              style={{
                width:
                  selectedRadius === 500
                    ? "150px"
                    : selectedRadius === 1000
                    ? "260px"
                    : "440px",
                height:
                  selectedRadius === 500
                    ? "150px"
                    : selectedRadius === 1000
                    ? "260px"
                    : "440px",
              }}
            />
          )}
          <div className="relative flex items-center justify-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500/35 animate-ping absolute" />
            <span className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md relative z-10" />
            <span
              className={`absolute top-4 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                locationMode === "geolocation"
                  ? "bg-emerald-700 text-white border border-emerald-500"
                  : "bg-slate-800 text-white"
              }`}
            >
              {locationMode === "geolocation" ? "📍 내 현재 위치 (GPS)" : "📍 기준 위치"}
            </span>
          </div>
        </div>

        {/* 음식점 마커 목록 */}
        {restaurants.map((restaurant) => {
          const pos = projectToPercent(restaurant.lat, restaurant.lng);
          const isSelected = selectedMarkerRestaurant?.id === restaurant.id;

          return (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => setActiveMarkerId(restaurant.id)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              aria-label={`${restaurant.name} 마커`}
              className={`absolute -translate-x-1/2 -translate-y-full transition transform cursor-pointer group ${
                isSelected ? "z-30 scale-110" : "z-20 hover:scale-105"
              }`}
            >
              <div
                className={`px-2 py-1 rounded-xl text-[11px] font-bold shadow-md border flex items-center gap-1 whitespace-nowrap ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-500 font-black"
                    : "bg-white text-slate-800 border-slate-300 hover:border-amber-400"
                }`}
              >
                <MapPin
                  className={`w-3 h-3 shrink-0 ${
                    isSelected ? "text-slate-950" : "text-amber-500"
                  }`}
                />
                <span>{restaurant.name}</span>
              </div>
              <div
                className={`w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b ${
                  isSelected
                    ? "bg-amber-400 border-amber-500"
                    : "bg-white border-slate-300"
                }`}
              />
            </button>
          );
        })}

        {/* 상위 대표 맛집 식신 스타일 플로팅 말풍선 카드 (업로드 이미지 완벽 재현) */}
        {restaurants.slice(0, 3).map((bubbleRest, bIdx) => {
          const bPos = projectToPercent(bubbleRest.lat, bubbleRest.lng);
          const isSelected = selectedMarkerRestaurant?.id === bubbleRest.id;
          const offset =
            bIdx === 0
              ? "translate-x-3 -translate-y-20"
              : bIdx === 1
              ? "-translate-x-36 -translate-y-16"
              : "translate-x-4 translate-y-4";

          return (
            <div
              key={`bubble-${bubbleRest.id}`}
              style={{ left: `${bPos.x}%`, top: `${bPos.y}%` }}
              onClick={() => setActiveMarkerId(bubbleRest.id)}
              className={`absolute z-25 ${offset} transition-all duration-300 hover:scale-105 cursor-pointer hidden sm:block animate-in fade-in duration-300`}
            >
              <div
                className={`p-2 rounded-2xl bg-white/95 backdrop-blur-xs border shadow-xl flex items-center gap-2 max-w-[195px] ${
                  isSelected
                    ? "border-amber-400 ring-2 ring-amber-400/30"
                    : "border-slate-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bubbleRest.imageUrl}
                  alt={bubbleRest.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {bubbleRest.name}
                  </p>
                  <p className="text-[10px] text-amber-700 font-bold truncate">
                    ★ {bubbleRest.rating || 4.8} · {bubbleRest.dongName}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* 범례 오버레이 */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 shadow-xs space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>지도 안내</span>
          </div>
          <div>음식점 마커: {restaurants.length}개</div>
          <div>
            반경 설정:{" "}
            <strong>
              {selectedRadius === "all"
                ? "제한 없음 (전체)"
                : selectedRadius === 500
                ? "500m"
                : selectedRadius === 1000
                ? "1km"
                : "3km"}
            </strong>
          </div>
        </div>
      </div>

      {/* 하단 선택된 마커 요약 카드 */}
      {selectedMarkerRestaurant ? (
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                {selectedMarkerRestaurant.category}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                기준점으로부터 {formatDistance(selectedMarkerRestaurant.distanceMeters)}
              </span>
              {selectedMarkerRestaurant.phone && (
                <span className="text-xs text-slate-500 font-mono">
                  {selectedMarkerRestaurant.phone}
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {selectedMarkerRestaurant.name}
            </h4>
            <p className="text-xs text-slate-600">
              {selectedMarkerRestaurant.summary}
            </p>
            <p className="text-[11px] text-slate-400">
              {selectedMarkerRestaurant.roadAddress}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectRestaurant(selectedMarkerRestaurant)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shrink-0 cursor-pointer"
          >
            <span>상세 화면 열기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          현재 필터 조건에 해당하는 음식점 마커가 없습니다.
        </div>
      )}

      {/* 하단: 음식점 목록 빠른 이동 바 */}
      {restaurants.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              음식점 목록 (클릭 시 해당 마커 선택 · {restaurants.length}곳)
            </span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {restaurants.map((item) => {
              const isFocused = selectedMarkerRestaurant?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMarkerId(item.id)}
                  className={`px-3 py-2 rounded-xl text-left shrink-0 border transition cursor-pointer ${
                    isFocused
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
                    <span
                      className={
                        isFocused ? "text-emerald-400 font-bold" : "text-emerald-700 font-bold"
                      }
                    >
                      {item.category}
                    </span>
                    <span
                      className={isFocused ? "text-slate-300" : "text-slate-400"}
                    >
                      · {formatDistance(item.distanceMeters)}
                    </span>
                  </div>
                  <div className="text-xs font-bold whitespace-nowrap">
                    {item.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
