"use client";

import { useState } from "react";
import { FoodCategory } from "@/types/restaurant";
import {
  Building2,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Flame,
  Gift,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Train,
  Truck,
  Utensils,
  Zap,
} from "lucide-react";

interface DongnaeHeroProps {
  currentDongTitle: string;
  onSearchSubmit: (keyword: string) => void;
  onQuickSelectSubway: () => void;
  onQuickSelectNearbyGps: () => void;
  onQuickSelectCurated: () => void;
  onQuickSelectPublicData: () => void;
  onSelectCategory?: (category: FoodCategory) => void;
  onScrollToContent?: () => void;
}

const POPULAR_KEYWORDS = [
  { label: "#연남동", query: "연남동" },
  { label: "#홍대입구역", query: "홍대입구" },
  { label: "#부산해운대", query: "해운대" },
  { label: "#대전성심당", query: "성심당" },
  { label: "#제주연동", query: "제주 연동" },
  { label: "#송도센트럴파크", query: "송도" },
  { label: "#대구동성로", query: "동성로" },
  { label: "#강남역", query: "강남" },
  { label: "#판교", query: "판교" },
];

export default function DongnaeHero({
  currentDongTitle,
  onSearchSubmit,
  onQuickSelectSubway,
  onQuickSelectNearbyGps,
  onQuickSelectCurated,
  onQuickSelectPublicData,
  onSelectCategory,
  onScrollToContent,
}: DongnaeHeroProps) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (keyword.trim()) {
      onSearchSubmit(keyword.trim());
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-teal-50/40 via-white to-slate-50 border-b border-slate-200/80 px-4 py-5 sm:py-7">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* 1. 망고플레이트 시그니처 상단 맛집 기획전 배너 (이미지 좌측 재현) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border border-amber-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
                  AD 기획전
                </span>
                <span className="text-xs font-bold text-amber-900">
                  현대백화점 & 동내(DONGNAE) 고메 페스티벌
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                전국 우리 동네 & 역세권 맛집 할인 기획전
              </h2>
              <p className="text-xs text-amber-950 font-medium">
                실시간 인허가 공공데이터 50건 및 검증된 큐레이션 맛집 최대 33% 할인 쿠폰 & EAT딜 혜택을 만나보세요.
              </p>
            </div>

            {/* 우측 썸네일 & 33% 뱃지 (망고플레이트 상단 원형 배너 스타일) */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-amber-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80"
                  alt="맛집 기획전"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#FF6B00] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  33%
                </span>
              </div>

              <button
                type="button"
                onClick={onQuickSelectCurated}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-xs"
              >
                기획전 맛집 보기 →
              </button>
            </div>
          </div>
        </div>

        {/* 2. 다이닝코드 시그니처 2열 레이아웃: [내주변 퀵 카드] + [추천 맛집 스포트라이트] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* A. 다이닝코드 시그니처 "내주변" 화이트 카드 (이미지 우측 하단 그대로 재현) */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    내주변
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    GPS 실시간
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onQuickSelectNearbyGps}
                  className="text-xs font-black text-[#00C4B4] hover:text-[#00a89a] flex items-center gap-0.5 cursor-pointer"
                >
                  <span>위치로 검색</span>
                  <Navigation className="w-3 h-3" />
                </button>
              </div>

              {/* 카테고리 퀵 리스트 (다이닝코드 내주변 세로 메뉴) */}
              <div className="divide-y divide-slate-100 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory?.("한식");
                    onScrollToContent?.();
                  }}
                  className="w-full py-2.5 flex items-center justify-between text-slate-700 hover:text-[#00C4B4] font-bold transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <span>우리 동네 든든한 한식</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory?.("카페/디저트");
                    onScrollToContent?.();
                  }}
                  className="w-full py-2.5 flex items-center justify-between text-slate-700 hover:text-[#00C4B4] font-bold transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <span>감성 카페 & 디저트</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onQuickSelectSubway();
                  }}
                  className="w-full py-2.5 flex items-center justify-between text-slate-700 hover:text-[#00C4B4] font-bold transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-teal-600" />
                    <span>지하철 역세권 5분 맛집</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onQuickSelectPublicData();
                    onScrollToContent?.();
                  }}
                  className="w-full py-2.5 flex items-center justify-between text-slate-700 hover:text-[#00C4B4] font-bold transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span>전국 공공 상가 50건</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>

            {/* 하단 페이지네이션 닷 인디케이터 (다이닝코드 UI 재현) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C4B4]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* B. 다이닝코드 상단 추천 맛집 스포트라이트 ("깐부치킨 언주역점" 스타일) */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  오늘의 다이닝코드 & 동내 픽
                </span>
                <span className="text-xs font-black text-[#FF6B00]">
                  ★ 4.8 실시간 평점
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
                    alt="동내 추천 맛집"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      연남동 숲길 & 언주역 로컬 미식
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                      BEST
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    카페 분위기의 정갈한 인테리어와 이미 수많은 미식가들에게 검증된 풍미 있는 로컬 시그니처 메뉴를 만나보세요.
                  </p>
                  <p className="text-[11px] text-teal-700 font-bold">
                    #{currentDongTitle} · 도보 3분 역세권 · 단체/예약 가능
                  </p>
                </div>
              </div>
            </div>

            {/* 3. 오늘의 인기 검색어 칩 바 */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                인기:
              </span>
              {POPULAR_KEYWORDS.map((k) => (
                <button
                  key={k.query}
                  type="button"
                  onClick={() => onSearchSubmit(k.query)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#00C4B4] hover:text-slate-950 text-slate-700 font-bold transition cursor-pointer text-[11px]"
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
