"use client";

import { MainTab } from "@/types/restaurant";
import {
  Award,
  Bookmark,
  Compass,
  Gift,
  MapPin,
  Search,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";

interface SiksinHeaderProps {
  activeTab: MainTab;
  favoriteCount: number;
  couponCount: number;
  searchQuery: string;
  onTabChange: (tab: MainTab) => void;
  onSearchChange: (q: string) => void;
  onOpenAddressSearch: () => void;
}

export default function SiksinHeader({
  activeTab,
  favoriteCount,
  couponCount,
  searchQuery,
  onTabChange,
  onSearchChange,
  onOpenAddressSearch,
}: SiksinHeaderProps) {
  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* 1. 상단 옐로우 식신 시그니처 유틸리티 바 */}
      <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-[11px] sm:text-xs font-bold border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
              HOT
            </span>
            <span>핫플레이스 식신 X 우리 동네 리얼 맛집 플랫폼</span>
            <span className="hidden md:inline text-amber-900 font-normal">
              · 서울 · 경기 · 인천 수도권 전역 실시간 업데이트
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-900">
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="hover:underline cursor-pointer flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>동네 찾기</span>
            </button>
            <span className="text-amber-600">|</span>
            <span className="hidden sm:inline hover:underline cursor-pointer">
              맛집 제보
            </span>
            <span className="hidden sm:inline text-amber-600">|</span>
            <span className="hover:underline cursor-pointer">앱 다운로드</span>
          </div>
        </div>
      </div>

      {/* 2. 메인 다크 헤더: 로고 + 5대 핵심 탭 + 통합 검색창 */}
      <div className="bg-slate-950 text-white px-4 py-3 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 좌측: 식신 스타일 로고 */}
          <div className="flex items-center justify-between">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onTabChange("region")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    식신<span className="text-amber-400">핫플레이스</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  수도권 우리 동네 맛집 지도 & 실시간 랭킹
                </p>
              </div>
            </div>

            {/* 모바일 찜한 맛집 퀵 아이콘 */}
            <button
              type="button"
              onClick={() => onTabChange("favorites")}
              className="md:hidden relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400"
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

          {/* 중앙: 5대 핵심 메뉴 탭 (지역 / 테마 / 실시간 랭킹 / 혜택 쿠폰 / 찜) */}
          <nav
            aria-label="주요 서비스 메뉴"
            className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar"
          >
            <button
              type="button"
              onClick={() => onTabChange("region")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                activeTab === "region"
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>지역 맛집</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("theme")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                activeTab === "theme"
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
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
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>실시간 랭킹 TOP 5</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("coupon")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer relative ${
                activeTab === "coupon"
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
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
                  ? "bg-amber-400 text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>찜한 맛집 ({favoriteCount})</span>
            </button>
          </nav>

          {/* 우측: 상단 스마트 검색창 */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="동네(송도, 판교, 연남) or 음식 검색"
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
