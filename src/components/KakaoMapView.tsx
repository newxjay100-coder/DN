"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LocationMode,
  RadiusOption,
  RestaurantWithDistance,
} from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import InteractiveLeafletMap from "./InteractiveLeafletMap";
import SampleMapView from "./SampleMapView";
import {
  AlertTriangle,
  ChevronRight,
  Compass,
  ExternalLink,
  KeyRound,
  Loader2,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  RotateCw,
  Sliders,
  Sparkles,
} from "lucide-react";

interface KakaoMapViewProps {
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
}

type MapLoadStatus = "loading" | "ready" | "error";
type MapErrorReason = "missing_key" | "sdk_load_failed" | null;

const KAKAO_SDK_SCRIPT_ID = "kakao-map-sdk-script";

export default function KakaoMapView({
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
}: KakaoMapViewProps) {
  const rawAppKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim() ?? "";
  const isKeyConfigured =
    rawAppKey.length > 0 && rawAppKey !== "your_kakao_javascript_key_here";

  const [status, setStatus] = useState<MapLoadStatus>(() =>
    isKeyConfigured ? "loading" : "error"
  );
  const [errorReason, setErrorReason] = useState<MapErrorReason>(() =>
    isKeyConfigured ? null : "missing_key"
  );
  const [useFallbackPreview, setUseFallbackPreview] = useState<boolean>(false);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(
    focusedRestaurantId ?? restaurants[0]?.id ?? null
  );

  // 지도 드래그 시 나타나는 '이 위치에서 재탐색' 상태
  const [showReSearchBtn, setShowReSearchBtn] = useState(false);
  const [mapCurrentCenter, setMapCurrentCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<Map<string, kakao.maps.Marker>>(new Map());
  const summaryOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const radiusCircleRef = useRef<kakao.maps.Circle | null>(null);
  const centerOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const userGpsOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const bubbleOverlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);

  const selectedRestaurant =
    restaurants.find((r) => r.id === activeRestaurantId) ??
    restaurants[0] ??
    null;

  // 카카오 지도 SDK 로드 및 지도 인스턴스 초기화
  const initKakaoMap = useCallback(() => {
    if (!isKeyConfigured) {
      setStatus("error");
      setErrorReason("missing_key");
      return;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.relayout();
        mapInstanceRef.current.setCenter(
          new window.kakao.maps.LatLng(centerCoords.lat, centerCoords.lng)
        );
        setStatus("ready");
      } catch {}
      return;
    }

    setStatus("loading");
    setErrorReason(null);

    const createMapInstance = () => {
      if (!window.kakao || !window.kakao.maps) {
        setStatus("error");
        setErrorReason("sdk_load_failed");
        return;
      }

      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;
        try {
          if (mapInstanceRef.current) return;

          const initialTarget =
            restaurants.find((r) => r.id === focusedRestaurantId) ?? null;
          const initialLat = initialTarget
            ? initialTarget.lat
            : centerCoords.lat;
          const initialLng = initialTarget
            ? initialTarget.lng
            : centerCoords.lng;

          const mapOption: kakao.maps.MapOptions = {
            center: new window.kakao!.maps.LatLng(initialLat, initialLng),
            level: initialTarget ? 3 : selectedRadius === 500 ? 3 : 4,
          };

          const map = new window.kakao!.maps.Map(
            mapContainerRef.current,
            mapOption
          );
          mapInstanceRef.current = map;

          // 지도가 렌더링된 직후 컨테이너 크기 재계산 (0x0 크기 방지)
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.relayout();
              mapInstanceRef.current.setCenter(
                new window.kakao.maps.LatLng(initialLat, initialLng)
              );
            }
          }, 100);

          // 지도 드래그 이벤트: 중심 이동 시 '이 위치에서 재검색' 버튼 노출
          window.kakao.maps.event.addListener(map, "dragend", () => {
            const center = map.getCenter();
            setMapCurrentCenter({ lat: center.getLat(), lng: center.getLng() });
            setShowReSearchBtn(true);
          });

          setStatus("ready");
          setErrorReason(null);
        } catch (err) {
          console.error("카카오 지도 생성 예외:", err);
          setStatus("error");
          setErrorReason("sdk_load_failed");
        }
      });
    };

    // 1) 이미 window.kakao.maps 가 로드되어 있는 경우 즉시 생성
    if (window.kakao && window.kakao.maps) {
      createMapInstance();
      return;
    }

    // 2) 문서 헤드에 dapi.kakao.com 스크립트가 존재하는지 확인
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = KAKAO_SDK_SCRIPT_ID;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
        rawAppKey
      )}&autoload=false&libraries=services,clusterer`;
      script.async = true;

      script.onload = () => {
        createMapInstance();
      };

      script.onerror = () => {
        setStatus("error");
        setErrorReason("sdk_load_failed");
      };

      document.head.appendChild(script);
    }

    // 3) 폴링을 통해 SDK 로드 대기 (최대 6초)
    let pollCount = 0;
    const interval = setInterval(() => {
      pollCount++;
      if (window.kakao && window.kakao.maps) {
        clearInterval(interval);
        createMapInstance();
      } else if (pollCount > 30) {
        clearInterval(interval);
        if (status !== "ready") {
          setStatus("error");
          setErrorReason("sdk_load_failed");
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isKeyConfigured, rawAppKey]);

  useEffect(() => {
    initKakaoMap();
  }, [initKakaoMap]);

  // 기준 위치 및 반경 원 시각화
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (status !== "ready" || !map || !window.kakao?.maps) return;

    const centerLatLng = new window.kakao.maps.LatLng(
      centerCoords.lat,
      centerCoords.lng
    );

    // 중요: 신규 중심 좌표(GPS 또는 검색 지역)로 카카오 지도 화면 즉시 부드럽게 이동
    map.panTo(centerLatLng);

    if (centerOverlayRef.current) {
      centerOverlayRef.current.setMap(null);
      centerOverlayRef.current = null;
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
      radiusCircleRef.current = null;
    }

    // 기준 위치 커스텀 오버레이
    const centerBadge = document.createElement("div");
    if (locationMode === "geolocation") {
      centerBadge.style.cssText =
        "display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:9999px;background:#059669;color:#ffffff;font-size:11px;font-weight:800;border:2px solid #ffffff;box-shadow:0 4px 12px rgba(5,150,105,0.4);white-space:nowrap;transform:translateY(-8px);";
      centerBadge.innerHTML =
        '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#a7f3d0;box-shadow:0 0 6px #a7f3d0;"></span> 내 현재 위치 (GPS)';
    } else {
      centerBadge.style.cssText =
        "padding:3px 9px;border-radius:9999px;background:#0f172a;color:#ffffff;font-size:11px;font-weight:700;border:2px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;";
      centerBadge.textContent = "지역 기준 위치";
    }

    centerOverlayRef.current = new window.kakao.maps.CustomOverlay({
      map,
      position: centerLatLng,
      content: centerBadge,
      yAnchor: 0.5,
      zIndex: 5,
    });

    // 선택한 반경 원 시각화
    if (selectedRadius !== "all") {
      radiusCircleRef.current = new window.kakao.maps.Circle({
        map,
        center: centerLatLng,
        radius: selectedRadius,
        strokeWeight: 2,
        strokeColor: "#f59e0b",
        strokeOpacity: 0.85,
        strokeStyle: "dashed",
        fillColor: "#fbbf24",
        fillOpacity: 0.12,
        zIndex: 1,
      });
    }

    // 마커 포커스가 없으면 현재 기준 위치로 지도 중심 이동
    if (!focusedRestaurantId) {
      map.panTo(centerLatLng);
    }
  }, [
    status,
    centerCoords.lat,
    centerCoords.lng,
    selectedRadius,
    locationMode,
    focusedRestaurantId,
  ]);

  // 실시간 GPS 위치 펄스 오버레이 (GPS 수신 좌표가 있을 때 별도 펄스 핀)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (status !== "ready" || !map || !window.kakao?.maps) return;

    if (userGpsOverlayRef.current) {
      userGpsOverlayRef.current.setMap(null);
      userGpsOverlayRef.current = null;
    }

    if (userGpsCoords) {
      const gpsPos = new window.kakao.maps.LatLng(
        userGpsCoords.lat,
        userGpsCoords.lng
      );

      const radarPin = document.createElement("div");
      radarPin.style.cssText =
        "position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;";
      radarPin.innerHTML = `
        <span style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <span style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #ffffff;box-shadow:0 0 10px rgba(37,99,235,0.8);position:relative;z-index:2;"></span>
      `;

      userGpsOverlayRef.current = new window.kakao.maps.CustomOverlay({
        map,
        position: gpsPos,
        content: radarPin,
        yAnchor: 0.5,
        zIndex: 15,
      });
    }
  }, [status, userGpsCoords]);

  // 음식점 마커 생성 및 식신 스타일 플로팅 말풍선 오버레이
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (status !== "ready" || !map || !window.kakao?.maps) return;

    // 기존 마커 및 오버레이 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();
    bubbleOverlaysRef.current.forEach((ov) => ov.setMap(null));
    // 유효한 위경도 좌표를 가진 음식점만 지도에 마커 표시 (좌표 없는 데이터 안전 처리)
    const validRestaurants = restaurants.filter(
      (r) =>
        r.lat &&
        r.lng &&
        !isNaN(r.lat) &&
        !isNaN(r.lng) &&
        r.lat > 30 &&
        r.lat < 45 &&
        r.lng > 120 &&
        r.lng < 135
    );

    validRestaurants.forEach((restaurant, idx) => {
      const position = new window.kakao!.maps.LatLng(
        restaurant.lat,
        restaurant.lng
      );

      // 카카오 마커
      const marker = new window.kakao!.maps.Marker({
        map,
        position,
        title: restaurant.name,
        clickable: true,
      });

      window.kakao!.maps.event.addListener(marker, "click", () => {
        setActiveRestaurantId(restaurant.id);
        map.panTo(position);
        onFocusRestaurantMarker?.(restaurant);
      });

      markersRef.current.set(restaurant.id, marker);

      // 상위 3개 대표 맛집은 지도 위에 식신 스타일의 미니 말풍선 카드 상시 표시
      if (idx < 3) {
        const bubbleCard = document.createElement("div");
        bubbleCard.style.cssText =
          "background:rgba(255,255,255,0.95);border:1px solid #e2e8f0;padding:4px 8px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.12);display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;transform:translateY(-48px);font-family:inherit;";

        const imgHtml = restaurant.imageUrl
          ? `<img src="${restaurant.imageUrl}" style="width:24px;height:24px;border-radius:6px;object-fit:cover;" />`
          : `<div style="width:24px;height:24px;border-radius:6px;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;">공공</div>`;

        const ratingHtml =
          restaurant.rating !== undefined
            ? `<div style="font-size:10px;font-weight:700;color:#d97706;">★${restaurant.rating}</div>`
            : `<div style="font-size:9px;font-weight:800;color:#0369a1;background:#e0f2fe;padding:1px 4px;border-radius:4px;">공공</div>`;

        bubbleCard.innerHTML = `
          ${imgHtml}
          <div style="font-size:11px;font-weight:800;color:#0f172a;">${restaurant.name}</div>
          ${ratingHtml}
        `;
        bubbleCard.onclick = (e) => {
          e.stopPropagation();
          setActiveRestaurantId(restaurant.id);
          map.panTo(position);
          onSelectRestaurantDetail(restaurant);
        };

        const bubbleOverlay = new window.kakao.maps.CustomOverlay({
          map,
          position,
          content: bubbleCard,
          yAnchor: 1,
          zIndex: 8,
          clickable: true,
        });

        bubbleOverlaysRef.current.push(bubbleOverlay);
      }
    });
  }, [status, restaurants, onFocusRestaurantMarker, onSelectRestaurantDetail]);

  // 목록 클릭 시 해당 마커로 지도 이동
  useEffect(() => {
    if (!focusedRestaurantId) return;
    setActiveRestaurantId(focusedRestaurantId);

    const map = mapInstanceRef.current;
    if (status !== "ready" || !map || !window.kakao?.maps) return;

    const target = restaurants.find((r) => r.id === focusedRestaurantId);
    if (!target) return;

    const targetPos = new window.kakao.maps.LatLng(target.lat, target.lng);
    if (map.getLevel() > 4) {
      map.setLevel(3, { animate: true });
    }
    map.panTo(targetPos);
  }, [focusedRestaurantId, focusTrigger, status, restaurants]);

  // 지도 위 '이 위치에서 재검색' 실행
  const handleReSearchAtCurrentCenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();

    setShowReSearchBtn(false);

    // 카카오 Geocoder 역지오코딩 시도
    if (window.kakao?.maps?.services?.Geocoder) {
      try {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(lng, lat, (result: any, geoStatus: any) => {
          if (
            geoStatus === window.kakao.maps.services.Status.OK &&
            result &&
            result.length > 0
          ) {
            const reg =
              result.find((r: any) => r.region_type === "H") || result[0];
            const dongName = reg.region_3depth_name || "현재 위치";
            const fullName = `${reg.region_1depth_name} ${reg.region_2depth_name} ${reg.region_3depth_name}`;
            onSearchAtCenter?.({ lat, lng, dongName, fullName });
            return;
          }
          onSearchAtCenter?.({
            lat,
            lng,
            dongName: "지도 중심 위치",
            fullName: `지도 중심 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          });
        });
        return;
      } catch {
        // fallback
      }
    }

    onSearchAtCenter?.({
      lat,
      lng,
      dongName: "지도 중심 위치",
      fullName: `지도 중심 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    });
  };

  // 내 GPS 위치로 지도 이동
  const handleGpsCenterClick = () => {
    if (onRequestGeolocation) {
      onRequestGeolocation();
    }
    const map = mapInstanceRef.current;
    if (map && userGpsCoords) {
      map.setLevel(3, { animate: true });
      map.panTo(new window.kakao.maps.LatLng(userGpsCoords.lat, userGpsCoords.lng));
    }
  };

  // 줌 인 / 줌 아웃 컨트롤
  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const current = map.getLevel();
    map.setLevel(current + delta, { animate: true });
  };

  // 카카오 지도 실패 또는 로딩 지연 시 안내 배너와 함께 인터랙티브 타일 지도(리플릿) 제공
  if (status === "error" || useFallbackPreview) {
    return (
      <div className="space-y-3">
        {status === "error" && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl text-xs text-amber-900 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>카카오 지도 도메인 등록 및 연결 안내</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUseFallbackPreview(false);
                  initKakaoMap();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                카카오 지도 다시 연결
              </button>
            </div>
            <p className="leading-relaxed text-amber-800">
              카카오 지도 JavaScript API는 보안 정책상 카카오 개발자 콘솔에 등록된 도메인에서만 지도를 표시합니다.
            </p>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 font-mono text-[11px] text-slate-800 flex items-center justify-between gap-2">
              <span>
                현재 접속 주소: <strong>{typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}</strong>
              </span>
            </div>
            <p className="text-[11px] text-amber-700">
              👉 <strong>[developers.kakao.com] &gt; [내 애플리케이션] &gt; [플랫폼] &gt; [Web] &gt; [사이트 도메인]</strong>에 위 주소를 추가해 주시면 즉시 카카오 지도가 활성화됩니다.
            </p>
          </div>
        )}

        <InteractiveLeafletMap
          restaurants={restaurants}
          centerCoords={centerCoords}
          selectedRadius={selectedRadius}
          locationMode={locationMode}
          userGpsCoords={userGpsCoords}
          isGeoLoading={isGeoLoading}
          focusedRestaurantId={focusedRestaurantId}
          focusTrigger={focusTrigger}
          onRequestGeolocation={onRequestGeolocation}
          onSelectRestaurantDetail={onSelectRestaurantDetail}
          onFocusRestaurantMarker={onFocusRestaurantMarker}
          onSearchAtCenter={onSearchAtCenter}
          onRadiusChange={onRadiusChange}
          onRetryKakao={() => {
            setUseFallbackPreview(false);
            initKakaoMap();
          }}
          isKakaoAvailable={isKeyConfigured}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 상단 상태 바 */}
      <div className="bg-slate-950 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-400">카카오 지도 (Kakao Map)</strong> —{" "}
            {locationMode === "geolocation"
              ? "내 현재 위치(GPS) 기준 반경 탐색"
              : "선택 지역 기준 탐색"}{" "}
            (반경 내 {restaurants.length}곳)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            지도를 드래그하여 다른 동네로 이동할 수 있습니다
          </span>
          <button
            type="button"
            onClick={() => setUseFallbackPreview(true)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] font-bold cursor-pointer"
          >
            오픈 타일 지도로 보기
          </button>
        </div>
      </div>

      {/* 지도 캔버스 및 로딩/안내 */}
      <div className="relative w-full min-h-[440px] sm:min-h-[500px] bg-slate-100 flex flex-col">
        <div
          ref={mapContainerRef}
          className="w-full h-[440px] sm:h-[500px]"
        />

        {status === "loading" && (
          <div className="absolute inset-0 z-30 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-800">
              카카오 지도(Kakao Map)를 연결하고 있습니다...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              실시간 GPS 및 위치 기반 마커를 준비하고 있습니다.
            </p>
          </div>
        )}

        {/* 0. 지도 상단 플로팅 컨트롤: 탐색 반경 넓히기 & 즉시 전환 */}
        {status === "ready" && onRadiusChange && (
          <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-1 p-1 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-xl text-white">
            <span className="text-[10px] font-bold text-teal-300 px-2 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#00C4B4]" />
              탐색 반경
            </span>
            {(
              [
                { value: 500, label: "500m" },
                { value: 1000, label: "1km" },
                { value: 3000, label: "3km" },
                { value: 5000, label: "5km 광역" },
                { value: 10000, label: "10km 시군구" },
                { value: "all", label: "전체" },
              ] as const
            ).map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => onRadiusChange(opt.value)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  selectedRadius === opt.value
                    ? "bg-[#00C4B4] text-slate-950 font-black shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* 1. 지도 위 플로팅 컨트롤: '이 지도 위치에서 맛집 재검색' (지도 이동 시 노출) */}
        {status === "ready" && showReSearchBtn && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={handleReSearchAtCurrentCenter}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950/95 hover:bg-slate-900 text-white text-xs font-black shadow-xl border border-teal-400 transition cursor-pointer active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#00C4B4]" />
              <span>이 위치 중심으로 맛집 재검색</span>
            </button>
            {onRadiusChange && selectedRadius !== "all" && (
              <button
                type="button"
                onClick={() => onRadiusChange(5000)}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-full bg-[#00C4B4] hover:bg-[#00a89a] text-slate-950 text-xs font-black shadow-xl transition cursor-pointer active:scale-95"
              >
                <span>🔍 5km 광역 넓히기</span>
              </button>
            )}
          </div>
        )}

        {/* 2. 지도 위 플로팅 컨트롤: 우하단 내 위치(GPS) 바로가기 & 줌 버튼 */}
        {status === "ready" && (
          <div className="absolute bottom-5 right-4 z-20 flex flex-col items-center gap-2">
            {/* GPS 내 위치 바로가기 버튼 */}
            <button
              type="button"
              onClick={handleGpsCenterClick}
              disabled={isGeoLoading}
              title="내 현재 GPS 위치로 지도 이동"
              className={`p-3 rounded-2xl shadow-xl border transition cursor-pointer flex items-center justify-center active:scale-95 ${
                locationMode === "geolocation"
                  ? "bg-amber-400 text-slate-950 border-amber-500 font-bold"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isGeoLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              ) : (
                <LocateFixed className="w-5 h-5 text-amber-500" />
              )}
            </button>

            {/* 줌 확대/축소 버튼 */}
            <div className="flex flex-col rounded-2xl bg-white border border-slate-300 shadow-xl overflow-hidden divide-y divide-slate-200">
              <button
                type="button"
                onClick={() => handleZoom(-1)}
                title="확대"
                className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(1)}
                title="축소"
                className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단: 선택된 마커 요약 카드 */}
      {selectedRestaurant ? (
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
                {selectedRestaurant.category}
              </span>
              <span className="text-xs font-black text-amber-700">
                기준점으로부터 직선거리 {formatDistance(selectedRestaurant.distanceMeters)}
              </span>
              {selectedRestaurant.phone && (
                <span className="text-xs text-slate-500 font-mono">
                  {selectedRestaurant.phone}
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900">
              {selectedRestaurant.name}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-1">
              {selectedRestaurant.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(
                selectedRestaurant.name
              )},${selectedRestaurant.lat},${selectedRestaurant.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FEE500] text-[#191919] hover:bg-[#FDD800] transition cursor-pointer shadow-xs"
              title="카카오맵으로 바로 길찾기"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#191919]" />
              <span>카카오맵 길찾기</span>
            </a>

            <button
              type="button"
              onClick={() => onSelectRestaurantDetail(selectedRestaurant)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white hover:bg-slate-800 transition shrink-0 cursor-pointer shadow-xs"
            >
              <span>상세 보기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          현재 필터 조건에 해당하는 음식점 마커가 없습니다.
        </div>
      )}
    </div>
  );
}
