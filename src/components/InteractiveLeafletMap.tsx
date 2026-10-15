"use client";

import { useEffect, useRef, useState } from "react";
import {
  LocationMode,
  RadiusOption,
  RestaurantWithDistance,
} from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import {
  ExternalLink,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";

interface InteractiveLeafletMapProps {
  restaurants: RestaurantWithDistance[];
  centerCoords: { lat: number; lng: number };
  selectedRadius: RadiusOption;
  locationMode: LocationMode;
  userGpsCoords?: { lat: number; lng: number } | null;
  isGeoLoading?: boolean;
  focusedRestaurantId?: string | null;
  focusTrigger?: number;
  onRequestGeolocation?: () => void;
  onSelectRestaurantDetail: (restaurant: RestaurantWithDistance) => void;
  onFocusRestaurantMarker?: (restaurant: RestaurantWithDistance) => void;
  onSearchAtCenter?: (loc: {
    lat: number;
    lng: number;
    dongName: string;
    fullName: string;
  }) => void;
  onRadiusChange?: (radius: RadiusOption) => void;
  onRetryKakao?: () => void;
  isKakaoAvailable?: boolean;
}

export default function InteractiveLeafletMap({
  restaurants,
  centerCoords,
  selectedRadius,
  locationMode,
  userGpsCoords,
  isGeoLoading = false,
  focusedRestaurantId,
  focusTrigger = 0,
  onRequestGeolocation,
  onSelectRestaurantDetail,
  onFocusRestaurantMarker,
  onSearchAtCenter,
  onRadiusChange,
  onRetryKakao,
  isKakaoAvailable = false,
}: InteractiveLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const circleLayerRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(
    focusedRestaurantId ?? restaurants[0]?.id ?? null
  );
  const [showReSearchBtn, setShowReSearchBtn] = useState(false);
  const [dragCenter, setDragCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const selectedRestaurant =
    restaurants.find((r) => r.id === activeRestaurantId) ??
    restaurants[0] ??
    null;

  // 1. Leaflet 지도 인스턴스 초기화
  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (typeof window === "undefined" || !containerRef.current) return;
      if (mapRef.current) return; // 이미 초기화됨

      const L = await import("leaflet");
      if (isCancelled || !containerRef.current) return;
      leafletModuleRef.current = L;

      // Leaflet 지도 생성
      const map = L.map(containerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: selectedRadius === 500 ? 16 : selectedRadius === 1000 ? 15 : 14,
        zoomControl: false, // 커스텀 버튼 사용
        attributionControl: false,
      });

      // 타일 레이어 추가 (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      // 레이어 그룹 생성
      markersLayerRef.current = L.layerGroup().addTo(map);
      circleLayerRef.current = L.layerGroup().addTo(map);

      // 드래그 이벤트 (이 위치에서 재검색)
      map.on("moveend", () => {
        const center = map.getCenter();
        setDragCenter({ lat: center.lat, lng: center.lng });
        setShowReSearchBtn(true);
      });

      mapRef.current = map;
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. 중심 좌표 및 반경 원 갱신
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    // 중심 이동
    map.setView([centerCoords.lat, centerCoords.lng], map.getZoom());

    // 반경 원 갱신
    if (circleLayerRef.current) {
      circleLayerRef.current.clearLayers();

      if (selectedRadius !== "all" && typeof selectedRadius === "number") {
        const circle = L.circle([centerCoords.lat, centerCoords.lng], {
          radius: selectedRadius,
          color: "#00C4B4",
          weight: 2,
          opacity: 0.8,
          fillColor: "#00C4B4",
          fillOpacity: 0.1,
          dashArray: "4, 6",
        });
        circle.addTo(circleLayerRef.current);
      }

      // 중심 핀 (GPS 또는 지역 기준)
      const centerPulseHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-teal-400 opacity-40 animate-ping"></div>
          <div class="relative w-5 h-5 rounded-full bg-teal-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const centerIcon = L.divIcon({
        className: "custom-center-marker",
        html: centerPulseHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([centerCoords.lat, centerCoords.lng], {
        icon: centerIcon,
        zIndexOffset: 1000,
      }).addTo(circleLayerRef.current);
    }
  }, [centerCoords.lat, centerCoords.lng, selectedRadius]);

  // 3. 맛집 마커 렌더링
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletModuleRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !L || !markersLayer) return;

    markersLayer.clearLayers();

    restaurants.forEach((restaurant, idx) => {
      const isSelected = restaurant.id === activeRestaurantId;
      const rank = idx + 1;
      const isTop3 = rank <= 3;

      const ratingText = restaurant.rating ? restaurant.rating.toFixed(1) : "4.8";

      // 커스텀 마커 HTML
      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110 ${
          isSelected ? "scale-115 z-50" : "z-10"
        }">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md border text-[11px] font-black whitespace-nowrap ${
            isSelected
              ? "bg-slate-900 text-white border-teal-400 ring-2 ring-teal-400"
              : isTop3
              ? "bg-amber-500 text-white border-amber-300"
              : "bg-white text-slate-800 border-slate-200"
          }">
            <span class="text-[10px] ${
              isTop3 ? "text-amber-200 font-extrabold" : "text-teal-600"
            }">#${rank}</span>
            <span class="max-w-[70px] truncate">${restaurant.name}</span>
            <span class="text-amber-400 font-bold">★${ratingText}</span>
          </div>
          <div class="w-2 h-2 -mt-0.5 rotate-45 ${
            isSelected
              ? "bg-slate-900 border-r border-b border-teal-400"
              : isTop3
              ? "bg-amber-500"
              : "bg-white border-r border-b border-slate-200"
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-restaurant-pin",
        html: markerHtml,
        iconSize: [120, 36],
        iconAnchor: [60, 36],
      });

      const marker = L.marker([restaurant.lat, restaurant.lng], {
        icon: customIcon,
      });

      marker.on("click", () => {
        setActiveRestaurantId(restaurant.id);
        if (onFocusRestaurantMarker) {
          onFocusRestaurantMarker(restaurant);
        }
      });

      marker.addTo(markersLayer);
    });
  }, [restaurants, activeRestaurantId, onFocusRestaurantMarker]);

  // 4. 포커스된 음식점으로 이동
  useEffect(() => {
    if (!focusedRestaurantId || !mapRef.current) return;
    const target = restaurants.find((r) => r.id === focusedRestaurantId);
    if (target) {
      setActiveRestaurantId(target.id);
      mapRef.current.setView([target.lat, target.lng], 16, { animate: true });
    }
  }, [focusedRestaurantId, focusTrigger, restaurants]);

  // 지도 줌 컨트롤
  const handleZoom = (delta: number) => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(mapRef.current.getZoom() + delta);
  };

  // 내 GPS 위치로 이동
  const handleFlyToGps = () => {
    if (userGpsCoords && mapRef.current) {
      mapRef.current.setView([userGpsCoords.lat, userGpsCoords.lng], 16, {
        animate: true,
      });
    } else if (onRequestGeolocation) {
      onRequestGeolocation();
    }
  };

  // 현재 중심에서 재검색
  const handleSearchCurrentCenter = () => {
    if (!dragCenter || !onSearchAtCenter) return;
    setShowReSearchBtn(false);
    onSearchAtCenter({
      lat: dragCenter.lat,
      lng: dragCenter.lng,
      dongName: "지도 선택 중심",
      fullName: "지도에서 직접 선택한 위치",
    });
  };

  // 카카오맵 길찾기 링크 URL 생성
  const getKakaoRouteUrl = (r: RestaurantWithDistance) => {
    return `https://map.kakao.com/link/to/${encodeURIComponent(r.name)},${
      r.lat
    },${r.lng}`;
  };

  // 카카오맵 장소 상세 링크 URL 생성
  const getKakaoPlaceUrl = (r: RestaurantWithDistance) => {
    return `https://map.kakao.com/link/map/${encodeURIComponent(r.name)},${
      r.lat
    },${r.lng}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col relative">
      {/* 1. 상단 정보 & 카카오맵 연결 상태 바 */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00C4B4] animate-pulse"></div>
          <span className="font-bold text-slate-100">
            실시간 인터랙티브 미식 지도
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-[#00C4B4] font-medium hidden sm:inline">
            반경 내 맛집 {restaurants.length}곳 실시간 표시
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 카카오맵 바로가기 버튼 */}
          <a
            href={`https://map.kakao.com/link/map/탐색위치,${centerCoords.lat},${centerCoords.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition text-[11px]"
            title="카카오맵 웹에서 현재 위치 전체보기"
          >
            <span>카카오맵 전체보기</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {isKakaoAvailable && onRetryKakao && (
            <button
              type="button"
              onClick={onRetryKakao}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>카카오 SDK 모드</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 지도 뷰포트 영역 */}
      <div className="relative w-full h-[420px] sm:h-[500px] bg-slate-100">
        <div ref={containerRef} className="w-full h-full z-0" />

        {/* 지도 상단 플로팅: 드래그 시 재검색 버튼 */}
        {showReSearchBtn && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <button
              type="button"
              onClick={handleSearchCurrentCenter}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xl border border-teal-400 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
              <span>이 지도 중심에서 재탐색</span>
            </button>
          </div>
        )}

        {/* 지도 우측 상단 플로팅 컨트롤 */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          {/* GPS 내 위치 이동 버튼 */}
          <button
            type="button"
            onClick={handleFlyToGps}
            title="내 현재 GPS 위치로 이동"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <LocateFixed
              className={`w-4 h-4 ${
                isGeoLoading ? "text-teal-600 animate-spin" : "text-teal-600"
              }`}
            />
          </button>

          {/* 줌 확대/축소 버튼 */}
          <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden divide-y divide-slate-100">
            <button
              type="button"
              onClick={() => handleZoom(1)}
              title="지도 확대"
              className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-1)}
              title="지도 축소"
              className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 지도 좌측 하단 반경 가이드 */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
          <span>
            탐색 반경:{" "}
            {selectedRadius === "all" ? "전체" : `${selectedRadius}m`}
          </span>
        </div>
      </div>

      {/* 3. 하단: 선택된 마커 맛집 정보 & 카카오맵 길찾기 연결 카드 */}
      {selectedRestaurant ? (
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* 썸네일 사진 */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedRestaurant.imageUrl}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 텍스트 정보 */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                  {selectedRestaurant.category}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  직선거리 {formatDistance(selectedRestaurant.distanceMeters)}
                </span>
                <div className="flex items-center gap-0.5 text-xs font-black text-[#FF6B00]">
                  <Star className="w-3.5 h-3.5 fill-[#FF6B00]" />
                  <span>{selectedRestaurant.rating || 4.8}</span>
                </div>
              </div>

              <h4 className="text-base font-black text-slate-900 truncate">
                {selectedRestaurant.name}
              </h4>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {selectedRestaurant.summary || selectedRestaurant.roadAddress}
              </p>
            </div>
          </div>

          {/* 우측 연결 버튼 액션 그룹 */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* 1) 카카오맵 실시간 길찾기 링크 (원클릭 길찾기) */}
            <a
              href={getKakaoRouteUrl(selectedRestaurant)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FEE500] text-[#191919] hover:bg-[#FDD800] transition cursor-pointer shadow-xs"
              title="카카오맵으로 바로 길찾기"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#191919]" />
              <span>카카오맵 길찾기</span>
            </a>

            {/* 2) 상세 정보 모달 */}
            <button
              type="button"
              onClick={() => onSelectRestaurantDetail(selectedRestaurant)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              <span>상세 보기</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          마커를 클릭하면 해당 음식점의 상세 정보와 카카오맵 길찾기가 연결됩니다.
        </div>
      )}
    </div>
  );
}
