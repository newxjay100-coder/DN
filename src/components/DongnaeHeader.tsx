"use client";

import { MainTab, ViewMode } from "@/types/restaurant";
import {
  Award,
  Bookmark,
  ChevronDown,
  Compass,
  Gift,
  Heart,
  List,
  Map,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Train,
  UtensilsCrossed,
  X,
} from "lucide-react";

interface DongnaeHeaderProps {
  currentDongTitle?: string;
  activeTab: MainTab;
  favoriteCount: number;
  couponCount: number;
  searchQuery: string;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onTabChange: (tab: MainTab) => void;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onOpenAddressSearch: () => void;
  onOpenSubwaySearch?: () => void;
  onMyLocationClick?: () => void;
}

export default function DongnaeHeader({
  currentDongTitle = "마포구 연남동",
  activeTab,
  favoriteCount,
  couponCount,
  searchQuery,
  viewMode = "grid",
  onViewModeChange,
  onTabChange,
  onSearchChange,
  onSearchSubmit,
  onOpenAddressSearch,
  onOpenSubwaySearch,
  onMyLocationClick,
}: DongnaeHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200/90">
      {/* 1. 망고플레이트 시그니처 상단 지역 바 ("지금 보고있는 지역은 역삼/선릉 ⌵") */}
      <div className="bg-slate-50/90 border-b border-slate-200/70 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* 좌측: 지금 보고있는 지역은 + 드롭다운 버튼 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium">
              지금 보고있는 지역은
            </span>
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="inline-flex items-center gap-1 text-sm sm:text-base font-black text-slate-900 hover:text-[#00C4B4] transition cursor-pointer"
              title="동네 변경하기"
            >
              <span>{currentDongTitle}</span>
              <ChevronDown className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* 우측: 다이닝코드 & 망고플레이트 퀵 액션 (내 주변 ⌖ / 역세권 / 지도 전환) */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {onMyLocationClick && (
              <button
                type="button"
                onClick={onMyLocationClick}
                className="inline-flex items-center gap-1 text-[#00C4B4] hover:text-[#00a89a] font-extrabold cursor-pointer"
                title="실시간 GPS로 내 위치 찾기"
              >
                <Navigation className="w-3.5 h-3.5 text-[#00C4B4]" />
                <span className="hidden sm:inline">위치로 검색</span>
                <span className="sm:hidden">내주변</span>
              </button>
            )}

            <span className="text-slate-300">|</span>

            {onOpenSubwaySearch && (
              <button
                type="button"
                onClick={onOpenSubwaySearch}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-bold cursor-pointer"
                title="수도권 및 전국 지하철 노선 맛집"
              >
                <Train className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">지하철역</span>
              </button>
            )}

            {onViewModeChange && (
              <>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() =>
                    onViewModeChange(viewMode === "map" ? "grid" : "map")
                  }
                  className="inline-flex items-center gap-1 text-slate-700 hover:text-[#00C4B4] font-bold cursor-pointer"
                  title="지도 / 그리드 화면 전환"
                >
                  <Map className="w-3.5 h-3.5 text-teal-600" />
                  <span>{viewMode === "map" ? "카드보기" : "지도보기"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. 다이닝코드 시그니처 화이트 & 민트 메인 헤더: 로고 + 맛집 검색창(위치로 검색 포함) */}
      <div className="px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 좌측: DINING DONGNAE 시그니처 민트 로고 */}
          <div className="flex items-center justify-between">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onTabChange("region")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              {/* 다이닝코드 스타일 민트 스푼/포크 심볼 */}
              <div className="w-9 h-9 rounded-2xl bg-[#00C4B4] text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    <span className="text-[#00C4B4]">DINING</span> DONGNAE
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-teal-50 text-[#00a89a] text-[10px] font-black border border-teal-200">
                    전국 맛집
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  망고플레이트 & 다이닝코드 감성 우리 동네 미식 탐색
                </p>
              </div>
            </div>

            {/* 모바일 찜한 맛집 퀵 카운터 */}
            <button
              type="button"
              onClick={() => onTabChange("favorites")}
              className="md:hidden relative p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-rose-500 transition"
              aria-label="찜한 맛집"
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {favoriteCount}
                </span>
              )}
            </button>
          </div>

          {/* 중앙: 다이닝코드 스타일 클린 검색창 (Q 맛집 검색하기 ... 위치로 검색 ⌖ + 엔터) */}
          <div className="flex items-center gap-1.5 w-full md:w-96 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="맛집 검색하기 (동네, 지하철역, 상호명)"
                className="w-full pl-9 pr-24 py-2.5 bg-slate-100 hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00C4B4] focus:ring-2 focus:ring-[#00C4B4]/20 transition shadow-2xs font-medium"
              />

              {/* 검색창 내부 우측: 다이닝코드 시그니처 [위치로 검색 ⌖] */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  onMyLocationClick && (
                    <button
                      type="button"
                      onClick={onMyLocationClick}
                      className="text-[11px] font-black text-[#00C4B4] hover:text-[#00a89a] cursor-pointer flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-teal-50"
                      title="내 위치 기준으로 탐색"
                    >
                      <span>위치로</span>
                      <Navigation className="w-3 h-3" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 엔터 ↵ 버튼 */}
            <button
              type="button"
              onClick={() => onSearchSubmit(searchQuery)}
              title="검색 실행 (Enter)"
              className="px-3.5 py-2.5 bg-[#00C4B4] hover:bg-[#00a89a] active:scale-95 text-slate-950 font-black text-xs rounded-2xl transition flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
            >
              <span>엔터</span>
              <span className="text-[10px] opacity-80">↵</span>
            </button>
          </div>

          {/* 우측: 5대 주요 서비스 탭 (망고플레이트 & 다이닝코드 네비게이션) */}
          <nav
            aria-label="주요 서비스 메뉴"
            className="hidden lg:flex items-center gap-1"
          >
            <button
              type="button"
              onClick={() => onTabChange("region")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "region"
                  ? "bg-[#00C4B4] text-slate-950 font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>맛집찾기</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("theme")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "theme"
                  ? "bg-[#00C4B4] text-slate-950 font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>테마맛집</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("ranking")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "ranking"
                  ? "bg-[#00C4B4] text-slate-950 font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>랭킹 TOP 5</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("coupon")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                activeTab === "coupon"
                  ? "bg-[#FF6B00] text-white font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>할인·쿠폰</span>
              {couponCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange("favorites")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-[#00C4B4] text-slate-950 font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>찜한맛집 ({favoriteCount})</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
