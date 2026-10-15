"use client";

import { FOOD_CATEGORIES } from "@/data/realRestaurants";
import { FoodCategory, RadiusOption, ViewMode } from "@/types/restaurant";
import {
  Building2,
  ChevronDown,
  Compass,
  Filter,
  Grid,
  LayoutGrid,
  List,
  Map,
  Navigation,
  Search,
  SlidersHorizontal,
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
  { value: "all", label: "전체" },
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
  { value: 3000, label: "3km" },
  { value: 5000, label: "5km" },
  { value: 10000, label: "10km" },
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
      <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
        {/* 0행: 공공데이터 실데이터 vs 큐레이션 맛집 구분 탭 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 bg-slate-100/80 rounded-2xl">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onDataSourceFilterChange("public_data")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
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
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                dataSourceFilter === "curated"
                  ? "bg-[#00C4B4] text-slate-950 shadow-xs font-extrabold"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ 큐레이션 맛집 ({curatedCount}건)</span>
            </button>

            <button
              type="button"
              onClick={() => onDataSourceFilterChange("all")}
              className={`hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                dataSourceFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span>전체 보기</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium px-2">
            {dataSourceFilter === "public_data"
              ? "소상공인시장진흥공단 상가정보 실시간 연동"
              : "동내(DONGNAE) 검증 로컬 맛집"}
          </span>
        </div>

        {/* 1행: 망고플레이트 시그니처 필터 바 ("평점순 ⌵", "⌖ 500m", "필터", [⊞ 그리드 / ☰ 목록 / 🗺️ 지도]) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 좌측: 망고플레이트 스타일 반경 및 정렬 필터 알약(Pill) 버튼들 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold shrink-0">
              <Navigation className="w-3.5 h-3.5 text-[#00C4B4]" />
              <span>거리순 정렬</span>
            </span>

            {/* 반경 알약 필터 (망고플레이트 스타일 "+ 500m" 버튼군) */}
            {RADIUS_OPTIONS.map((opt) => {
              const active = selectedRadius === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => onRadiusChange(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* 우측: 3단 뷰 스위치 (망고플레이트 2열 그리드 ⊞ vs 다이닝코드 목록 ☰ vs 카카오 지도 🗺️) */}
          <div
            role="tablist"
            aria-label="화면 보기 방식 전환"
            className="inline-flex rounded-2xl bg-slate-100 p-1 shrink-0 self-end sm:self-auto shadow-2xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="망고플레이트 스타일 2열 포토 그리드"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>그리드</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="다이닝코드 스타일 상세 리스트"
            >
              <List className="w-3.5 h-3.5 text-[#00C4B4]" />
              <span>목록</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "map"}
              onClick={() => onViewModeChange("map")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-slate-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="카카오 지도 보기"
            >
              <Map className="w-3.5 h-3.5 text-teal-600" />
              <span>지도</span>
            </button>
          </div>
        </div>

        {/* 2행: 업종 필터 가로 스크롤 (한식, 일식, 중식, 양식, 분식, 카페) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
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
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                    active
                      ? "bg-[#00C4B4] text-slate-950 shadow-xs font-black"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* 결과 개수 & 필터 초기화 */}
          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0 ml-auto">
            <span>
              총{" "}
              <strong className="text-slate-950 font-black">
                {resultCount}
              </strong>
              곳
            </span>
            {(searchQuery !== "" ||
              selectedCategory !== "전체" ||
              selectedRadius !== "all") && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
