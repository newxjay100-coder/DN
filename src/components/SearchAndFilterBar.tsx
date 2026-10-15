"use client";

import { FOOD_CATEGORIES } from "@/data/realRestaurants";
import { FoodCategory, RadiusOption, ViewMode } from "@/types/restaurant";
import {
  Building2,
  List,
  Map,
  Navigation,
  Search,
  Sparkles,
  X,
} from "lucide-react";

export type DataSourceFilter = "all" | "public_data" | "curated";

interface SearchAndFilterBarProps {
  searchQuery: string;
  selectedCategory: FoodCategory;
  selectedRadius: RadiusOption;
  viewMode: ViewMode;
  resultCount: number;
  totalSampleCount: number;
  dataSourceFilter: DataSourceFilter;
  publicDataCount?: number;
  curatedCount?: number;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onCategoryChange: (category: FoodCategory) => void;
  onRadiusChange: (radius: RadiusOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onDataSourceFilterChange: (filter: DataSourceFilter) => void;
  onResetFilters: () => void;
}

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
  { value: "all", label: "전체 거리" },
  { value: 500, label: "내 주변 500m" },
  { value: 1000, label: "1km 이내" },
  { value: 3000, label: "3km 이내" },
  { value: 5000, label: "5km 광역" },
  { value: 10000, label: "10km 시·군·구" },
];

export default function SearchAndFilterBar({
  searchQuery,
  selectedCategory,
  selectedRadius,
  viewMode,
  resultCount,
  totalSampleCount,
  dataSourceFilter,
  publicDataCount = 0,
  curatedCount = 0,
  onSearchChange,
  onSearchSubmit,
  onCategoryChange,
  onRadiusChange,
  onViewModeChange,
  onDataSourceFilterChange,
  onResetFilters,
}: SearchAndFilterBarProps) {
  return (
    <section
      aria-label="음식점 검색 및 필터"
      className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
        {/* 0행: 공공데이터 실데이터 vs 큐레이션 맛집 구분 탭 (요구사항: 실제 데이터와 샘플 데이터 명확 구분) */}
        <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 rounded-2xl">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onDataSourceFilterChange("public_data")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                dataSourceFilter === "public_data"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏛️ 공공데이터 실데이터 ({publicDataCount}건)</span>
            </button>

            <button
              type="button"
              onClick={() => onDataSourceFilterChange("curated")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                dataSourceFilter === "curated"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ 큐레이션 맛집 ({curatedCount}건)</span>
            </button>

            <button
              type="button"
              onClick={() => onDataSourceFilterChange("all")}
              className={`hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dataSourceFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span>전체 함께보기</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium px-2">
            {dataSourceFilter === "public_data"
              ? "공공데이터포털 소상공인·행안부 API 실시간 연동"
              : "수도권 검증 맛집 데이터셋"}
          </span>
        </div>

        {/* 1행: 검색어 입력창 + 엔터(Enter) 버튼 + 목록/지도 전환 스위치 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit?.(searchQuery);
                }
              }}
              placeholder="전국 동네(연남, 해운대, 둔산), 지하철역(홍대입구, 강남, 서면) 입력 후 엔터"
              aria-label="음식점 및 동네 검색"
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-[#00C4B4] focus:ring-1 focus:ring-[#00C4B4] focus:outline-none transition text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="검색어 지우기"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 요구사항: 지역이름다음 엔터 버튼을 만들어 누르면 지역 맛집이나오는 스타일 */}
          <button
            type="button"
            onClick={() => onSearchSubmit?.(searchQuery)}
            title="검색 실행 (Enter)"
            className="px-3.5 py-2.5 bg-[#00C4B4] hover:bg-[#00a89a] active:scale-95 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
          >
            <span>엔터</span>
            <span className="text-[10px] opacity-75">↵</span>
          </button>

          {/* 목록 / 지도 화면 전환 버튼 */}
          <div
            role="tablist"
            aria-label="화면 보기 방식 전환"
            className="inline-flex rounded-xl bg-slate-100 p-1 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
              <span>목록</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "map"}
              onClick={() => onViewModeChange("map")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Map className="w-4 h-4" />
              <span>지도</span>
            </button>
          </div>
        </div>

        {/* 2행: 업종 필터 (모바일 가로 스크롤 지원) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">
            업종:
          </span>
          {FOOD_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 3행: 내 주변 거리(전체 / 500m / 1km / 3km) 필터 & 결과 건수 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0 mr-1">
              <Navigation className="w-3.5 h-3.5 text-amber-500" />
              반경:
            </span>
            {RADIUS_OPTIONS.map((opt) => {
              const active = selectedRadius === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onRadiusChange(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer border ${
                    active
                      ? "bg-amber-100 border-amber-400 text-slate-950 font-black"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 ml-auto">
            <span>
              조회 결과{" "}
              <strong className="text-slate-900 font-black">
                {resultCount}
              </strong>
              개{" "}
              <span className="text-slate-400">
                (전체 {totalSampleCount}개)
              </span>
            </span>
            {(searchQuery !== "" ||
              selectedCategory !== "전체" ||
              selectedRadius !== "all") && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-semibold text-slate-500 underline hover:text-slate-800 cursor-pointer"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
