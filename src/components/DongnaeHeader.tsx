"use client";

import { MainTab } from "@/types/restaurant";
import {
  Award,
  Bookmark,
  Compass,
  Gift,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Train,
  X,
} from "lucide-react";

interface DongnaeHeaderProps {
  activeTab: MainTab;
  favoriteCount: number;
  couponCount: number;
  searchQuery: string;
  onTabChange: (tab: MainTab) => void;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onOpenAddressSearch: () => void;
  onOpenSubwaySearch?: () => void;
  onMyLocationClick?: () => void;
}

export default function DongnaeHeader({
  activeTab,
  favoriteCount,
  couponCount,
  searchQuery,
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
    <header className="sticky top-0 z-40 shadow-lg">
      {/* 1. 상단 다이닝코드 스타일 민트/시안 유틸리티 바 */}
      <div className="bg-[#00C4B4] text-slate-950 px-4 py-1.5 text-[11px] sm:text-xs font-bold border-b border-[#00a89a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-slate-950 text-[#00C4B4] px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider">
              DONGNAE
            </span>
            <span className="font-extrabold tracking-tight">
              동내(DONGNAE) X 전국 우리 동네 & 역세권 맛집
            </span>
            <span className="hidden md:inline text-teal-950 font-normal">
              · 서울·경기·인천 및 전국 전지역 상가·지하철역 & 공공데이터 실시간 연동
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-950">
            {onMyLocationClick && (
              <button
                type="button"
                onClick={onMyLocationClick}
                className="hover:underline cursor-pointer flex items-center gap-1 font-black"
                title="GPS로 내 주변 맛집 즉시 찾기"
              >
                <Navigation className="w-3 h-3 text-slate-950" />
                <span>내 주변</span>
              </button>
            )}
            <span className="text-teal-700">|</span>
            <button
              type="button"
              onClick={onOpenSubwaySearch}
              className="hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <Train className="w-3 h-3" />
              <span>지하철역 찾기</span>
            </button>
            <span className="text-teal-700">|</span>
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <Compass className="w-3 h-3" />
              <span>동네 변경</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 메인 다크 헤더: [D] 원형 로고 + 메뉴 탭 + 엔터 버튼 검색창 */}
      <div className="bg-slate-950 text-white px-4 py-3 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 좌측: 다이닝코드 스타일 D 로고 마크 */}
          <div className="flex items-center justify-between">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onTabChange("region")}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              {/* 원형 흰색 배지 안의 검정 대문자 D */}
              <div className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-[#00C4B4] group-hover:scale-105 transition-transform">
                D
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-wider text-white">
                    DONGNAE
                  </span>
                  <span className="text-xs font-bold text-[#00C4B4]">동내</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00C4B4] text-slate-950 font-black tracking-tight">
                    DINING
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium font-serif italic">
                  Delicious Life! 우리 동네 로컬 맛집 지도
                </p>
              </div>
            </div>

            {/* 모바일 찜한 맛집 퀵 아이콘 */}
            <button
              type="button"
              onClick={() => onTabChange("favorites")}
              className="md:hidden relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-[#00C4B4]"
              aria-label="찜한 맛집"
            >
              <Bookmark className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>
          </div>

          {/* 중앙: 5대 핵심 메뉴 탭 */}
          <nav
            aria-label="주요 서비스 메뉴"
            className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar"
          >
            <button
              type="button"
              onClick={() => onTabChange("region")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                activeTab === "region"
                  ? "bg-[#00C4B4] text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>동네·역세권</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("theme")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                activeTab === "theme"
                  ? "bg-[#00C4B4] text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>테마 맛집</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("ranking")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                activeTab === "ranking"
                  ? "bg-[#00C4B4] text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>동내 랭킹 TOP 5</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("coupon")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer relative ${
                activeTab === "coupon"
                  ? "bg-[#00C4B4] text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>혜택·쿠폰</span>
              {couponCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange("favorites")}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-[#00C4B4] text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>찜한 맛집 ({favoriteCount})</span>
            </button>
          </nav>

          {/* 우측: 엔터(Enter) 버튼이 포함된 스마트 검색창 */}
          <div className="flex items-center gap-1.5 w-full md:w-72 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="전국 동네(연남, 해운대, 둔산) or 역(강남, 서면)"
                className="w-full pl-9 pr-7 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00C4B4] focus:ring-1 focus:ring-[#00C4B4] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 요구사항: 지역이름다음 엔터 버튼을 만들어 누르면 지역 맛집이나오는 스타일 */}
            <button
              type="button"
              onClick={() => onSearchSubmit(searchQuery)}
              title="검색 실행 (Enter)"
              className="px-3 py-2 bg-[#00C4B4] hover:bg-[#00a89a] active:scale-95 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md shrink-0"
            >
              <span>엔터</span>
              <span className="text-[10px] opacity-75">↵</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
