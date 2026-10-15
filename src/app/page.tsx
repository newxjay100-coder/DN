"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddressSearchModal from "@/components/AddressSearchModal";
import BestRankingSidePanel from "@/components/BestRankingSidePanel";
import CouponModal from "@/components/CouponModal";
import CouponSection from "@/components/CouponSection";
import DongStatsInfographic from "@/components/DongStatsInfographic";
import FavoritesSection from "@/components/FavoritesSection";
import KakaoMapView from "@/components/KakaoMapView";
import LocationSelector from "@/components/LocationSelector";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantDetailModal from "@/components/RestaurantDetailModal";
import RestaurantList from "@/components/RestaurantList";
import SearchAndFilterBar, {
  DataSourceFilter,
} from "@/components/SearchAndFilterBar";
import ServiceStatusBanner from "@/components/ServiceStatusBanner";
import DongnaeFooter from "@/components/DongnaeFooter";
import DongnaeHeader from "@/components/DongnaeHeader";
import DongnaeHero from "@/components/DongnaeHero";
import DongnaeBottomNav from "@/components/DongnaeBottomNav";
import SubwayStationSection from "@/components/SubwayStationSection";
import ThemeCurationSection from "@/components/ThemeCurationSection";
import {
  REAL_RESTAURANTS,
  TARGET_DONG_REGIONS,
} from "@/data/realRestaurants";
import { SEOUL_GYEONGGI_REGIONS } from "@/data/seoulGyeonggiRegions";
import { SUBWAY_STATIONS, SubwayStation } from "@/data/subwayStations";
import {
  FoodCategory,
  GeolocationStatus,
  LocationMode,
  MainTab,
  RadiusOption,
  Restaurant,
  RestaurantCoupon,
  RestaurantWithDistance,
  ViewMode,
} from "@/types/restaurant";
import { calculateDistanceMeters } from "@/utils/distance";
import {
  resolveKakaoLocation,
  reverseGeocodeRealCoords,
} from "@/utils/kakaoGeocode";
import {
  AlertTriangle,
  Award,
  Building2,
  Compass,
  Crown,
  Info,
  List,
  Loader2,
  Map,
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  // 1. 음식점 데이터 상태 (큐레이션 실데이터 + 공공데이터 실데이터)
  const [baseRestaurants, setBaseRestaurants] =
    useState<Restaurant[]>(REAL_RESTAURANTS);
  const [dataSource, setDataSource] = useState<string>("curated_real_dataset");

  // 공공데이터포털 실데이터 및 데이터 소스 구분 상태
  const [publicRestaurants, setPublicRestaurants] = useState<Restaurant[]>([]);
  const [dataSourceFilter, setDataSourceFilter] =
    useState<DataSourceFilter>("public_data");
  const [publicDataStatus, setPublicDataStatus] = useState<
    "idle" | "loading" | "success" | "error" | "empty"
  >("idle");
  const [publicDataError, setPublicDataError] = useState<string | null>(null);

  // 2. 식신 5대 메인 네비게이션 탭 상태 ('region' | 'theme' | 'ranking' | 'coupon' | 'favorites')
  const [activeTab, setActiveTab] = useState<MainTab>("region");

  // 3. 찜한 맛집 & 보유 쿠폰 상태 (localStorage 연동)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedCouponIds, setSavedCouponIds] = useState<string[]>([
    "cp-yn-01",
    "cp-ic-01",
  ]);
  const [activeCouponModal, setActiveCouponModal] = useState<{
    coupon: RestaurantCoupon;
    restaurantName: string;
  } | null>(null);

  // 4. 지역 및 위치 상태
  const [selectedLocation, setSelectedLocation] = useState<{
    title: string;
    fullName: string;
    lat: number;
    lng: number;
    description: string;
  }>({
    title: "마포구 연남동",
    fullName: "서울특별시 마포구 연남동",
    lat: 37.5625,
    lng: 126.9245,
    description: "경의선숲길·동교로 인근 중심 좌표",
  });

  const [locationMode, setLocationMode] =
    useState<LocationMode>("manual_region");
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>("idle");
  const [geoErrorMessage, setGeoErrorMessage] = useState<string | null>(null);
  const [userGpsCoords, setUserGpsCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 주소 검색 모달 열림 여부
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 5. 검색 / 업종 / 반경 / 뷰모드 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<FoodCategory>("전체");
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // 지하철역 선택 상태
  const [selectedSubwayStationId, setSelectedSubwayStationId] =
    useState<string>("st-hongdae");

  // 6. 상세 모달 및 지도 포커스 마커 상태
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantWithDistance | null>(null);
  const [focusedMapRestaurantId, setFocusedMapRestaurantId] = useState<
    string | null
  >(null);
  const [mapFocusTrigger, setMapFocusTrigger] = useState<number>(0);

  // 로컬 스토리지 초기화
  useEffect(() => {
    try {
      const storedFavs =
        localStorage.getItem("dongnae_favorites") ||
        localStorage.getItem("siksin_favorites");
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      } else {
        setFavorites(["real-yn-01", "real-ic-01"]);
      }

      const storedCoupons =
        localStorage.getItem("dongnae_saved_coupons") ||
        localStorage.getItem("siksin_saved_coupons");
      if (storedCoupons) {
        setSavedCouponIds(JSON.parse(storedCoupons));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem("dongnae_favorites", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleSaveCoupon = (couponId: string) => {
    setSavedCouponIds((prev) => {
      const next = prev.includes(couponId)
        ? prev.filter((c) => c !== couponId)
        : [...prev, couponId];
      try {
        localStorage.setItem("dongnae_saved_coupons", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 음식점 데이터 로드 (Supabase DB에서 조회)
  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurants");
      if (res.ok) {
        const json = await res.json();
        if (json.restaurants && json.restaurants.length > 0) {
          setBaseRestaurants(json.restaurants);
          setDataSource(json.source || "default");

          // 저장 후 새로고침해도 DB에 보존된 공공데이터가 유지되도록 복원
          const savedPublicRows = json.restaurants.filter(
            (r: Restaurant) =>
              r.dataOrigin === "public_data_sdsc" ||
              r.dataOrigin === "public_data_gov"
          );
          if (savedPublicRows.length > 0) {
            setPublicRestaurants((prev) =>
              prev.length === 0 ? savedPublicRows.slice(0, 20) : prev
            );
            setPublicDataStatus("success");
          }
        }
      }
    } catch {
      // 오류 시 기본 실데이터 유지
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // 현재 계산 기준 좌표
  const currentCenterCoords = useMemo(() => {
    if (
      locationMode === "geolocation" &&
      geoStatus === "granted" &&
      userGpsCoords
    ) {
      return userGpsCoords;
    }
    return {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    };
  }, [locationMode, geoStatus, userGpsCoords, selectedLocation]);

  // [PostGIS & DB 기준] 주변 음식점 서버/DB 실시간 검색 (거리 계산 & 정렬 서버/DB 수행)
  const fetchNearbyFromDb = useCallback(async () => {
    try {
      const radiusParam = selectedRadius === "all" ? "all" : String(selectedRadius);
      const catParam = selectedCategory !== "전체" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : "";
      const url = `/api/restaurants?lat=${currentCenterCoords.lat}&lng=${currentCenterCoords.lng}&radius=${radiusParam}${catParam}${searchParam}&limit=60`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.restaurants)) {
          setBaseRestaurants(json.restaurants);
          setDataSource(json.source || "supabase");
        }
      }
    } catch {
      // 오류 시 로컬 유지
    }
  }, [currentCenterCoords.lat, currentCenterCoords.lng, selectedRadius, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchNearbyFromDb();
  }, [fetchNearbyFromDb]);

  // GPS 좌표에 가장 가까운 동네 이름 매칭
  const findClosestRegionName = (lat: number, lng: number): string => {
    let closest = SEOUL_GYEONGGI_REGIONS[0];
    let minDistance = Infinity;

    for (const r of SEOUL_GYEONGGI_REGIONS) {
      const d = calculateDistanceMeters(lat, lng, r.lat, r.lng);
      if (d < minDistance) {
        minDistance = d;
        closest = r;
      }
    }

    if (minDistance < 4500) {
      return `${closest.fullName} 인근`;
    }
    return `내 현재 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // 지도 중심 위치에서 맛집 재검색 핸들러
  const handleSearchAtCenter = (loc: {
    lat: number;
    lng: number;
    dongName: string;
    fullName: string;
  }) => {
    setSelectedLocation({
      title: loc.dongName || "지도 선택 위치",
      fullName: loc.fullName || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
      lat: loc.lat,
      lng: loc.lng,
      description: "지도 중심 좌표 기준 실시간 맛집 탐색",
    });
    setLocationMode("manual_region");
    setFocusedMapRestaurantId(null);
    setSearchQuery("");
  };

  // 브라우저 위치 권한 요청 (고정밀 -> 일반 정밀도 2단계 안정적 조회 및 실시간 역지오코딩)
  const handleRequestGeolocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      setLocationMode("manual_region");
      setGeoErrorMessage(
        "현재 브라우저에서 위치 정보(Geolocation) 기능을 지원하지 않습니다."
      );
      return;
    }

    setGeoStatus("loading");
    setGeoErrorMessage(null);

    const tryLocate = (isHighAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserGpsCoords(coords);
          setGeoStatus("granted");
          setLocationMode("geolocation");
          setFocusedMapRestaurantId(null);

          // 실시간 카카오 지오코더 역지오코딩으로 정확한 도로명/동네 주소 산출
          const geoInfo = await reverseGeocodeRealCoords(coords.lat, coords.lng);
          setSelectedLocation({
            title: geoInfo.dongName,
            fullName: geoInfo.address,
            lat: coords.lat,
            lng: coords.lng,
            description: `실시간 GPS 수신 위치 (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}) · ${geoInfo.address}`,
          });

          // 내 주변 3km 이내 맛집 우선 표시 (원클릭 반경 변경 가능)
          setSelectedRadius(3000);
          setSearchQuery("");
          setMapFocusTrigger((prev) => prev + 1);
          fetchPublicData(coords.lat, coords.lng, 3000);
        },
        (error) => {
          // 1차 고정밀 실패 시, 2차 일반 정밀도로 1회 자동 재시도 (데스크톱/노트북 타임아웃 방지)
          if (
            isHighAccuracy &&
            (error.code === error.TIMEOUT ||
              error.code === error.POSITION_UNAVAILABLE)
          ) {
            tryLocate(false);
            return;
          }

          setLocationMode("manual_region");
          if (error.code === error.PERMISSION_DENIED) {
            setGeoStatus("denied");
            setGeoErrorMessage(
              "위치 권한이 거부되었습니다. 브라우저 주소창 좌측 자물쇠 아이콘에서 '위치 정보'를 [허용]으로 변경하시거나 아래에서 동네를 직접 선택해 주세요."
            );
          } else if (error.code === error.TIMEOUT) {
            setGeoStatus("timeout");
            setGeoErrorMessage(
              "위치 확인 요청 시간이 초과되었습니다. 네트워크 연결 확인 후 다시 시도해 주세요."
            );
          } else {
            setGeoStatus("unavailable");
            setGeoErrorMessage(
              "기기에서 위치 정보를 확인할 수 없습니다. 전국 동네를 직접 검색하거나 선택해 주세요."
            );
          }
        },
        {
          enableHighAccuracy: isHighAccuracy,
          timeout: isHighAccuracy ? 7000 : 12000,
          maximumAge: 30000,
        }
      );
    };

    tryLocate(true);
  };

  // 주소 검색 모달에서 지역을 선택했을 때
  const handleSelectAddress = (loc: {
    title: string;
    fullName: string;
    lat: number;
    lng: number;
  }) => {
    setSelectedLocation({
      title: loc.title,
      fullName: loc.fullName,
      lat: loc.lat,
      lng: loc.lng,
      description: `${loc.fullName} 중심 기준 반경 거리 탐색`,
    });
    setLocationMode("manual_region");
    setFocusedMapRestaurantId(null);
    setGeoStatus("idle");
    setGeoErrorMessage(null);
    setSearchQuery("");
  };

  // 인기 프리셋 동네 선택
  const handleQuickSelectPreset = (presetId: string) => {
    const target =
      SEOUL_GYEONGGI_REGIONS.find((r) => r.id.includes(presetId)) ??
      TARGET_DONG_REGIONS.find((t) => t.id === presetId);

    if (target) {
      const isRegion = "fullName" in target;
      setSelectedLocation({
        title: isRegion
          ? `${target.districtName} ${target.dongName}`
          : target.dongName,
        fullName: isRegion
          ? target.fullName
          : `${target.cityName} ${target.guName} ${target.dongName}`,
        lat: isRegion ? target.lat : target.centerLat,
        lng: isRegion ? target.lng : target.centerLng,
        description: target.description,
      });
      setLocationMode("manual_region");
      setFocusedMapRestaurantId(null);
      setGeoStatus("idle");
      setSearchQuery("");
    }
  };

  // GPS 시뮬레이션 핸들러들
  const handleSimulateGeolocationDenied = () => {
    setGeoStatus("denied");
    setLocationMode("manual_region");
    setGeoErrorMessage(
      "[테스트] 위치 권한이 거부된 상태입니다. 수도권 지역 직접 선택 모드가 활성화되었습니다."
    );
  };

  const handleSimulateGeolocationTimeout = () => {
    setGeoStatus("timeout");
    setLocationMode("manual_region");
    setGeoErrorMessage(
      "[테스트] 위치 확인 시간이 초과되었습니다 (8초 타임아웃). 지역 직접 선택 모드가 활성화되었습니다."
    );
  };

  const handleSimulateMapoLocation = () => {
    setUserGpsCoords({ lat: 37.5625, lng: 126.9245 });
    setGeoStatus("granted");
    setLocationMode("geolocation");
    setSelectedRadius(1000);
    setFocusedMapRestaurantId(null);
    setGeoErrorMessage(null);
    setSelectedLocation((prev) => ({
      ...prev,
      title: "서울특별시 마포구 연남동",
      fullName: "서울특별시 마포구 연남동 (가상 GPS)",
      description: "서울 마포구 연남동 가상 GPS 좌표 기준 반경 탐색",
    }));
  };

  const handleSimulatePangyoLocation = () => {
    setUserGpsCoords({ lat: 37.3948, lng: 127.1114 });
    setGeoStatus("granted");
    setLocationMode("geolocation");
    setSelectedRadius(1000);
    setFocusedMapRestaurantId(null);
    setGeoErrorMessage(null);
    setSelectedLocation((prev) => ({
      ...prev,
      title: "경기도 성남시 판교동",
      fullName: "경기도 성남시 분당구 판교동 (가상 GPS)",
      description: "경기 성남시 판교역·테크노밸리 가상 GPS 좌표 기준 반경 탐색",
    }));
  };

  const handleSimulateIncheonLocation = () => {
    const songdoCoords = { lat: 37.3916, lng: 126.6508 };
    setUserGpsCoords(songdoCoords);
    setGeoStatus("granted");
    setLocationMode("geolocation");
    setSelectedRadius("all");
    setFocusedMapRestaurantId(null);
    setGeoErrorMessage(null);
    setSelectedLocation({
      title: "인천광역시 연수구 송도동",
      fullName: "인천광역시 연수구 송도동 (송도국제도시 가상 GPS)",
      lat: songdoCoords.lat,
      lng: songdoCoords.lng,
      description: "인천 송도센트럴파크 가상 GPS 좌표 기준 반경 탐색",
    });
  };

  // 지하철역 클릭 시 해당 역세권 중심 탐색 핸들러
  const handleSelectSubwayStation = useCallback((station: SubwayStation) => {
    setSelectedSubwayStationId(station.id);
    setSelectedLocation({
      title: `${station.name} (${station.primaryLine})`,
      fullName: `${station.cityDistrict} ${station.name}`,
      lat: station.lat,
      lng: station.lng,
      description: `${station.primaryLine} [${station.section}] ${station.name} 역세권 맛집 탐색 · 핫플레이스: ${station.hotKeyword} (${station.dongName})`,
    });
    setLocationMode("manual_region");
    setFocusedMapRestaurantId(null);
    setSelectedRadius(1000); // 1km 이내 역세권 탐색
    setSearchQuery("");
  }, []);

  // 공공데이터 실데이터 조회 (선택한 동네/좌표 반경 전국 상가 등록 음식점 최대 50건 조회)
  const fetchPublicData = useCallback(
    async (lat: number, lng: number, radiusMeters: number = 3000) => {
      setPublicDataStatus("loading");
      setPublicDataError(null);
      try {
        const res = await fetch(
          `/api/public-data?cx=${lng}&cy=${lat}&limit=50&radius=${radiusMeters}`
        );
        if (!res.ok) {
          setPublicDataStatus("error");
          setPublicDataError(`공공데이터 API 응답 오류 (HTTP ${res.status})`);
          return;
        }
        const json = await res.json();
        if (json.success && json.restaurants && json.restaurants.length > 0) {
          setPublicRestaurants(json.restaurants);
          setPublicDataStatus("success");
          // DB 저장/갱신 완료 후 전체 DB 목록도 백그라운드 동기화
          fetchRestaurants();
        } else {
          setPublicRestaurants([]);
          setPublicDataStatus("empty");
        }
      } catch (err: unknown) {
        setPublicDataStatus("error");
        setPublicDataError(
          err instanceof Error ? err.message : "네트워크 연결 오류"
        );
      }
    },
    [fetchRestaurants]
  );

  // 검색창 엔터(Enter) 클릭 / 제출 시 전국 모든 지역, 동네, 지하철역, 명소 자동 인식 및 실시간 탐색
  const handleSearchSubmit = useCallback(
    async (rawQuery?: string) => {
      const q = (rawQuery !== undefined ? rawQuery : searchQuery).trim();
      if (!q) return;

      // 카카오 지도 Geocoder / Places + 전국 17개 시도 동네 DB + 지하철역 통합 지오코딩
      const resolved = await resolveKakaoLocation(q);

      if (resolved) {
        setSelectedLocation({
          title: resolved.title,
          fullName: resolved.fullName,
          lat: resolved.lat,
          lng: resolved.lng,
          description: resolved.description,
        });
        setLocationMode("manual_region");
        setFocusedMapRestaurantId(null);
        setSelectedRadius(3000); // 3km 반경으로 주변 맛집 탐색 활성화
        setSearchQuery(""); // 중요: 지역명 매칭 시 검색어 필터를 비워 해당 동네 전체 맛집이 거리순으로 정렬되도록 함
        setMapFocusTrigger((prev) => prev + 1); // 지도 중심 이동 트리거
        fetchPublicData(resolved.lat, resolved.lng, 3000); // 해당 지역 공공데이터 상가 50건 즉시 조회
        return;
      }

      // 일반 음식점명/메뉴 검색: 전체 반경에서 검색어 필터 유지
      setSearchQuery(q);
      setSelectedRadius("all");
    },
    [searchQuery, fetchPublicData]
  );

  useEffect(() => {
    const r = selectedRadius === "all" ? 5000 : selectedRadius;
    fetchPublicData(currentCenterCoords.lat, currentCenterCoords.lng, r);
  }, [currentCenterCoords.lat, currentCenterCoords.lng, selectedRadius, fetchPublicData]);

  // 검색어 동네 키워드 감지
  const matchedDongRegion = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    return (
      SEOUL_GYEONGGI_REGIONS.find(
        (r) =>
          r.dongName.toLowerCase().includes(q) ||
          r.districtName.toLowerCase().includes(q) ||
          r.cityName.toLowerCase().includes(q) ||
          r.keywords.some((k) => k.toLowerCase() === q)
      ) ?? null
    );
  }, [searchQuery]);

  // 데이터 소스에 따른 풀(Pool) 결정 (공공데이터 실데이터 vs 큐레이션 실데이터)
  const activePool = useMemo(() => {
    if (dataSourceFilter === "public_data") {
      return publicRestaurants;
    }
    if (dataSourceFilter === "curated") {
      return baseRestaurants;
    }
    return [...publicRestaurants, ...baseRestaurants];
  }, [dataSourceFilter, publicRestaurants, baseRestaurants]);

  // 거리 계산 및 필터링 & 정렬
  const filteredRestaurants = useMemo<RestaurantWithDistance[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasSearchQuery = query.length > 0;

    return activePool
      .map((item) => {
        const distanceMeters = calculateDistanceMeters(
          currentCenterCoords.lat,
          currentCenterCoords.lng,
          item.lat,
          item.lng
        );
        return {
          ...item,
          distanceMeters,
        };
      })
      .filter((item) => {
        // 1) 업종 필터
        if (
          selectedCategory !== "전체" &&
          item.category !== selectedCategory
        ) {
          return false;
        }

        // 2) 반경 필터 (500m / 1km / 3km 반경 안과 밖 엄격 구분)
        if (
          selectedRadius !== "all" &&
          item.distanceMeters > selectedRadius
        ) {
          return false;
        }

        // 3) 검색어 필터
        if (hasSearchQuery) {
          const matchName = item.name.toLowerCase().includes(query);
          const matchDong = item.dongName.toLowerCase().includes(query);
          const matchGu = item.guName.toLowerCase().includes(query);
          const matchCategory = item.category.toLowerCase().includes(query);
          const matchRoadAddr = item.roadAddress.toLowerCase().includes(query);
          const matchSummary = item.summary.toLowerCase().includes(query);
          const matchTag = item.tags.some((t) =>
            t.toLowerCase().includes(query)
          );
          if (
            !matchName &&
            !matchDong &&
            !matchGu &&
            !matchCategory &&
            !matchRoadAddr &&
            !matchSummary &&
            !matchTag
          ) {
            return false;
          }
        }

        return true;
      })
      // 직선거리(미터) 기준 가까운 순서 정렬
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [
    baseRestaurants,
    currentCenterCoords,
    selectedCategory,
    selectedRadius,
    searchQuery,
  ]);

  // 찜한 맛집 목록
  const favoriteRestaurants = useMemo(() => {
    return filteredRestaurants.filter((r) => favorites.includes(r.id));
  }, [filteredRestaurants, favorites]);

  // 전체 수도권 명예의 전당 TOP 10 랭킹 (랭킹 탭 전용)
  const hallOfFameRestaurants = useMemo(() => {
    return [...baseRestaurants]
      .map((r) => ({
        ...r,
        distanceMeters: calculateDistanceMeters(
          currentCenterCoords.lat,
          currentCenterCoords.lng,
          r.lat,
          r.lng
        ),
      }))
      .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
      .slice(0, 10);
  }, [baseRestaurants, currentCenterCoords]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("전체");
    setSelectedRadius("all");
    setFocusedMapRestaurantId(null);
  };

  const handleSelectDefaultRegion = () => {
    handleQuickSelectPreset("yeonnam");
    setSelectedRadius("all");
    setFocusedMapRestaurantId(null);
  };

  const handleMoveToMapMarker = (restaurant: RestaurantWithDistance) => {
    setFocusedMapRestaurantId(restaurant.id);
    setMapFocusTrigger((prev) => prev + 1);
    setSelectedRestaurant(null);
    setViewMode("map");
    setActiveTab("region");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 1. 상단 서비스 상태 배너 */}
      <ServiceStatusBanner
        dataSource={dataSource}
        totalCount={baseRestaurants.length}
        onRefreshData={fetchRestaurants}
      />

      {/* 2. 동내(DONGNAE) 시그니처 헤더 (다이닝코드 무드 민트 유틸리티 + 로고 + 검색어 엔터 버튼) */}
      <DongnaeHeader
        currentDongTitle={selectedLocation.title}
        activeTab={activeTab}
        favoriteCount={favorites.length}
        couponCount={savedCouponIds.length}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onOpenAddressSearch={() => setIsAddressModalOpen(true)}
        onOpenSubwaySearch={() => {
          setActiveTab("region");
          const el = document.getElementById("dongnae-subway-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onMyLocationClick={handleRequestGeolocation}
      />

      {/* 2-1. 망고플레이트 기획전 배너 & 다이닝코드 내주변 카드 히어로 섹션 */}
      <DongnaeHero
        currentDongTitle={selectedLocation.title}
        onSearchSubmit={handleSearchSubmit}
        onQuickSelectSubway={() => {
          setActiveTab("region");
          const el = document.getElementById("dongnae-subway-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onQuickSelectNearbyGps={handleRequestGeolocation}
        onQuickSelectCurated={() => setDataSourceFilter("curated")}
        onQuickSelectPublicData={() => setDataSourceFilter("public_data")}
        onSelectCategory={setSelectedCategory}
        onScrollToContent={() => {
          const el = document.getElementById("dongnae-content-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 3. 탭별 메인 컨텐츠 영역 */}
      <main
        id="dongnae-content-section"
        className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 space-y-5"
      >
        {/* ================= A. [지역 맛집] 탭 ================= */}
        {activeTab === "region" && (
          <div className="space-y-4">
            {/* 0) 요구사항: 수도권 전체 지하철 노선표 및 구간별 역세권 주변 맛집 찾기 코너 */}
            <div id="dongnae-subway-section">
              <SubwayStationSection
                currentStationId={selectedSubwayStationId}
                userCoords={currentCenterCoords}
                restaurants={
                  baseRestaurants.length > 0 ? baseRestaurants : REAL_RESTAURANTS
                }
                onSelectStation={handleSelectSubwayStation}
                onSelectRestaurantDetail={setSelectedRestaurant}
              />
            </div>

            {/* 1) 위치 선택 및 빠른 프리셋 바 */}
            <LocationSelector
              currentAddressTitle={selectedLocation.fullName}
              currentAddressDescription={selectedLocation.description}
              locationMode={locationMode}
              geoStatus={geoStatus}
              geoErrorMessage={geoErrorMessage}
              currentCoords={currentCenterCoords}
              onOpenAddressSearch={() => setIsAddressModalOpen(true)}
              onRequestGeolocation={handleRequestGeolocation}
              onQuickSelectRegion={handleQuickSelectPreset}
              onSimulateGeolocationDenied={handleSimulateGeolocationDenied}
              onSimulateGeolocationTimeout={handleSimulateGeolocationTimeout}
              onSimulateMapoLocation={handleSimulateMapoLocation}
              onSimulatePangyoLocation={handleSimulatePangyoLocation}
              onSimulateIncheonLocation={handleSimulateIncheonLocation}
            />

            {/* 2) 동네 업종 통계 인포그래픽 */}
            <DongStatsInfographic
              currentDongName={selectedLocation.title}
              currentFullName={selectedLocation.fullName}
              restaurants={filteredRestaurants}
              onOpenAddressSearch={() => setIsAddressModalOpen(true)}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* 3) 검색어 / 업종 필터 / 반경 / 목록·지도 전환 바 + 엔터 버튼 */}
            <SearchAndFilterBar
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedRadius={selectedRadius}
              viewMode={viewMode}
              resultCount={filteredRestaurants.length}
              totalSampleCount={activePool.length}
              dataSourceFilter={dataSourceFilter}
              publicDataCount={publicRestaurants.length}
              curatedCount={baseRestaurants.length}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              onCategoryChange={setSelectedCategory}
              onRadiusChange={setSelectedRadius}
              onViewModeChange={setViewMode}
              onDataSourceFilterChange={setDataSourceFilter}
              onResetFilters={handleResetFilters}
            />

            {/* 3-1) 실시간 내 위치 활성화 정보 배너 (요구사항: 내주변 찾기 누르면 실시간 내위치 정보가 나오고 그주변 맛집 안내) */}
            {locationMode === "geolocation" && geoStatus === "granted" && (
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/60 rounded-3xl p-4 sm:p-5 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                      <Navigation className="w-5 h-5 text-emerald-400" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                          ● 실시간 내 위치 확인됨
                        </span>
                        <span className="text-xs font-mono text-emerald-300">
                          {currentCenterCoords.lat.toFixed(5)}, {currentCenterCoords.lng.toFixed(5)}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {selectedLocation.fullName}
                      </h3>
                      <p className="text-xs text-slate-300">
                        기기 실시간 GPS 좌표 기반으로 가장 가까운 주변 맛집을 직선거리순으로 안내합니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleRequestGeolocation}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>GPS 재측위</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationMode("manual_region");
                        handleQuickSelectPreset("yeonnam");
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      동네 모드로 변경
                    </button>
                  </div>
                </div>

                {/* 거리 반경 빠른 선택 버튼 */}
                <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-slate-400 font-bold mr-1">탐색 반경:</span>
                  {(
                    [
                      { value: 500, label: "500m (도보 5분)" },
                      { value: 1000, label: "1km (도보권)" },
                      { value: 3000, label: "3km (내주변)" },
                      { value: 5000, label: "5km (광역)" },
                      { value: 10000, label: "10km (시·군·구)" },
                      { value: "all", label: "전체" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedRadius(opt.value)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                        selectedRadius === opt.value
                          ? "bg-emerald-400 text-slate-950 shadow-xs font-black"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <span className="ml-auto text-emerald-400 font-bold text-xs">
                    반경 내 맛집 {filteredRestaurants.length}곳 (거리순)
                  </span>
                </div>
              </div>
            )}

            {/* 4) 스마트 동네 감지 제안 배너 */}
            {matchedDongRegion && (
              <div className="bg-gradient-to-r from-amber-400/20 via-amber-300/20 to-yellow-200/30 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      &lsquo;{matchedDongRegion.dongName}&rsquo; (
                      {matchedDongRegion.cityName}{" "}
                      {matchedDongRegion.districtName}) 동네를 찾으셨나요?
                    </p>
                    <p className="text-xs text-amber-950 font-medium">
                      탐색 기준 위치를 이 동네로 즉시 이동하고 주변 맛집들을
                      거리순으로 정렬합니다.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectAddress({
                      title: matchedDongRegion.dongName,
                      fullName: matchedDongRegion.fullName,
                      lat: matchedDongRegion.lat,
                      lng: matchedDongRegion.lng,
                    });
                    setSearchQuery("");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  이 동네 중심으로 보기 →
                </button>
              </div>
            )}

            {/* 5) 메인 2열 레이아웃: 좌측 맛집 목록/지도 + 우측 실시간 BEST 랭킹 TOP 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
              {/* 좌측 메인 컨텐츠 (목록 or 지도) */}
              <div className="lg:col-span-3 space-y-4">
                {/* 공공데이터 실시간 로딩 / 상태 배너 */}
                {dataSourceFilter === "public_data" && (
                  <div className="space-y-2">
                    {publicDataStatus === "loading" && (
                      <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-2.5 animate-pulse shadow-2xs">
                        <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                        <div>
                          <span className="font-black">공공데이터포털 API 실시간 연동 중:</span>{" "}
                          <span>선택하신 동네({selectedLocation.title})의 인허가 음식점 20건을 조회하고 있습니다...</span>
                        </div>
                      </div>
                    )}

                    {publicDataStatus === "error" && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <span className="font-bold">공공데이터포털 API 호출 실패:</span>{" "}
                            <span>{publicDataError || "일시적인 공공 API 응답 지연입니다."}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              fetchPublicData(
                                currentCenterCoords.lat,
                                currentCenterCoords.lng
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                          >
                            다시 시도
                          </button>
                          <button
                            type="button"
                            onClick={() => setDataSourceFilter("curated")}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                          >
                            큐레이션 맛집 보기
                          </button>
                        </div>
                      </div>
                    )}

                    {publicDataStatus === "success" && (
                      <div className="p-3 rounded-2xl bg-sky-50/90 border border-sky-200 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <div>
                            <span className="font-black">공공데이터포털 실데이터 20건 연결됨:</span>{" "}
                            <span className="text-sky-800">
                              소상공인시장진흥공단_상가정보 원천 ID 보존 · 별점/리뷰/사진 미생성 원칙 준수
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDataSourceFilter("curated")}
                          className="text-xs font-bold text-sky-800 hover:text-sky-950 underline cursor-pointer shrink-0"
                        >
                          동내 큐레이션 맛집 보기 →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>탐색 기준:</span>
                    <span className="font-black text-slate-800">
                      {selectedLocation.fullName}
                    </span>
                    {locationMode === "geolocation" && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        실시간 GPS
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black">
                      {dataSourceFilter === "public_data"
                        ? "공공데이터 20건"
                        : dataSourceFilter === "curated"
                        ? "검증 큐레이션 맛집"
                        : "전체 통합"}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">
                    총 {filteredRestaurants.length}곳 (거리순)
                  </span>
                </div>

                {viewMode === "map" ? (
                  <KakaoMapView
                    restaurants={filteredRestaurants}
                    centerCoords={currentCenterCoords}
                    selectedRadius={selectedRadius}
                    locationMode={locationMode}
                    userGpsCoords={userGpsCoords}
                    isGeoLoading={geoStatus === "loading"}
                    onRequestGeolocation={handleRequestGeolocation}
                    onSearchAtCenter={handleSearchAtCenter}
                    onRadiusChange={setSelectedRadius}
                    focusedRestaurantId={focusedMapRestaurantId}
                    focusTrigger={mapFocusTrigger}
                    onSelectRestaurantDetail={setSelectedRestaurant}
                    onFocusRestaurantMarker={(r) =>
                      setFocusedMapRestaurantId(r.id)
                    }
                  />
                ) : (
                  <RestaurantList
                    restaurants={filteredRestaurants}
                    viewMode={viewMode}
                    focusedRestaurantId={focusedMapRestaurantId}
                    dataSourceFilter={dataSourceFilter}
                    publicDataError={publicDataError}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectRestaurantDetail={setSelectedRestaurant}
                    onMoveToMapMarker={handleMoveToMapMarker}
                    onResetFilters={handleResetFilters}
                    onSelectDefaultRegion={handleSelectDefaultRegion}
                    onSwitchToCurated={() => setDataSourceFilter("curated")}
                    onRetryPublicData={() =>
                      fetchPublicData(
                        currentCenterCoords.lat,
                        currentCenterCoords.lng,
                        selectedRadius === "all" ? 5000 : selectedRadius
                      )
                    }
                  />
                )}
              </div>

              {/* 우측 사이드 패널: 동네 실시간 BEST 랭킹 TOP 5 (식신 업로드 이미지 우측 재현) */}
              <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
                <BestRankingSidePanel
                  currentDongName={selectedLocation.title}
                  restaurants={filteredRestaurants}
                  onSelectRestaurantDetail={setSelectedRestaurant}
                  onMoveToMapMarker={handleMoveToMapMarker}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= B. [테마 맛집] 탭 ================= */}
        {activeTab === "theme" && (
          <ThemeCurationSection
            restaurants={filteredRestaurants}
            onSelectRestaurantDetail={setSelectedRestaurant}
            onMoveToMapMarker={handleMoveToMapMarker}
          />
        )}

        {/* ================= C. [실시간 랭킹] 탭 ================= */}
        {activeTab === "ranking" && (
          <section
            aria-label="동내(DONGNAE) 수도권 맛집 명예의 전당 랭킹"
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-[#00C4B4] via-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-[#00C4B4] text-xs font-black">
                  <Crown className="w-3.5 h-3.5 fill-[#00C4B4]" />
                  <span>동내(DONGNAE) 명예의 전당 TOP 10</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  수도권 (서울·경기·인천) 통합 인기 랭킹
                </h2>
                <p className="text-xs text-teal-100 font-medium">
                  실제 방문객들의 평점, 리뷰 수, 동내 스타 등급을 종합 산출한
                  공식 랭킹입니다.
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xs self-start sm:self-auto">
                매일 자정 실시간 갱신
              </span>
            </div>

            {/* 10대 명예의 전당 카드 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hallOfFameRestaurants.map((restaurant, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={restaurant.id}
                    className="relative bg-white rounded-3xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex items-center gap-3.5 cursor-pointer"
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    {/* 순위 마크 */}
                    <div className="shrink-0 text-center w-10">
                      <span
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
                          rank === 1
                            ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                            : rank === 2
                            ? "bg-slate-300 text-slate-950 ring-2 ring-slate-200"
                            : rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {rank}
                      </span>
                      {rank <= 3 && (
                        <span className="text-[10px] font-black text-amber-600 block mt-0.5">
                          TOP {rank}
                        </span>
                      )}
                    </div>

                    {/* 음식 사진 */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {restaurant.category}
                        </span>
                        <h3 className="text-base font-black text-slate-900 truncate">
                          {restaurant.name}
                        </h3>
                        {restaurant.starGrade === "3star" && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                            3스타
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {restaurant.summary}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {restaurant.rating || 4.8}
                        </span>
                        <span className="text-slate-400">
                          ({restaurant.reviewCount || 200}명 평가)
                        </span>
                        <span className="text-slate-400 font-mono">
                          · {restaurant.dongName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= D. [혜택·쿠폰] 탭 ================= */}
        {activeTab === "coupon" && (
          <CouponSection
            restaurants={filteredRestaurants}
            savedCouponIds={savedCouponIds}
            onToggleSaveCoupon={handleToggleSaveCoupon}
            onSelectRestaurantDetail={setSelectedRestaurant}
          />
        )}

        {/* ================= E. [찜한 맛집] 탭 ================= */}
        {activeTab === "favorites" && (
          <FavoritesSection
            favoriteRestaurants={favoriteRestaurants}
            onSelectRestaurantDetail={setSelectedRestaurant}
            onMoveToMapMarker={handleMoveToMapMarker}
            onSwitchToRegionTab={() => setActiveTab("region")}
          />
        )}
      </main>

      {/* 4. 모바일 하단 플로팅 지도/그리드 전환 버튼 (지역 탭에서만 노출) */}
      {activeTab === "region" && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 sm:hidden">
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === "map" ? "grid" : "map"))
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/95 text-white text-xs font-bold shadow-2xl border border-slate-700 cursor-pointer active:scale-95 transition backdrop-blur-md"
          >
            {viewMode === "map" ? (
              <>
                <List className="w-4 h-4 text-[#FF6B00]" />
                <span>카드 보기로 전환 ({filteredRestaurants.length})</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4 text-[#00C4B4]" />
                <span>지도 보기로 전환 ({filteredRestaurants.length})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 5. 모바일 하단 네비게이션 바 (망고플레이트 & 다이닝코드 스타일) */}
      <DongnaeBottomNav
        activeTab={activeTab}
        favoriteCount={favorites.length}
        couponCount={savedCouponIds.length}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onMyLocationClick={handleRequestGeolocation}
        onOpenSubwaySearch={() => {
          setActiveTab("region");
          const el = document.getElementById("dongnae-subway-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 6. 동내(DONGNAE) 미식 푸터 */}
      <div className="pb-16 md:pb-0">
        <DongnaeFooter />
      </div>

      {/* 6. 모달 팝업들 */}
      {/* 1) 주소 검색 모달 */}
      <AddressSearchModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectLocation={handleSelectAddress}
      />

      {/* 2) 상세 정보 & 리뷰 모달 */}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isFavorite={
          selectedRestaurant ? favorites.includes(selectedRestaurant.id) : false
        }
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setSelectedRestaurant(null)}
        onViewOnMap={handleMoveToMapMarker}
        onOpenCoupon={(coupon, name) =>
          setActiveCouponModal({ coupon, restaurantName: name })
        }
      />

      {/* 3) 쿠폰 바코드 모달 */}
      {activeCouponModal && (
        <CouponModal
          coupon={activeCouponModal.coupon}
          restaurantName={activeCouponModal.restaurantName}
          onClose={() => setActiveCouponModal(null)}
        />
      )}
    </div>
  );
}
