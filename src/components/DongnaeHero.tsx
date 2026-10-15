"use client";

import { useState } from "react";
import { FoodCategory } from "@/types/restaurant";
import {
  Building2,
  ChevronRight,
  Coffee,
  Compass,
  Gift,
  MapPin,
  Navigation,
  Sparkles,
  Train,
  Utensils,
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
  { label: "#역삼/선릉", query: "역삼" },
  { label: "#홍대/연남", query: "연남동" },
  { label: "#해운대", query: "해운대" },
  { label: "#성심당", query: "성심당" },
  { label: "#송도", query: "송도" },
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
  return (
    <section className="w-full bg-gradient-to-b from-teal-50/60 via-slate-50 to-white border-b border-slate-200/80 px-4 py-5 sm:py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* 상단: 세련된 2컬럼 히어로 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* 좌측: 타이틀 & 원클릭 빠른 탐색 칩스 (7컬럼) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00C4B4] text-slate-950 text-[11px] font-black tracking-wide">
                  DONGNAE GOURMET
                </span>
                <span className="text-xs font-bold text-slate-500">
                  전국 17개 시도 & 수도권 맛집 지도
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  오늘 어디서 드실래요?
                  <br />
                  <span className="text-[#00C4B4]">우리 동네 & 역세권</span> 숨은 맛집을 만나보세요.
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  실시간 인허가 공공 상가 50건 및 망고플레이트·다이닝코드 엄선 큐레이션
                </p>
              </div>

              {/* 빠른 숏컷 필터 버튼들 */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onQuickSelectNearbyGps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00a89a] border border-teal-200 text-xs font-black transition cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 fill-[#00C4B4]" />
                  <span>내 주변 500m</span>
                </button>

                <button
                  type="button"
                  onClick={onQuickSelectSubway}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black transition cursor-pointer"
                >
                  <Train className="w-3.5 h-3.5 text-amber-600" />
                  <span>지하철 역세권 5분</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onQuickSelectPublicData();
                    onScrollToContent?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-black transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>공공 상가 50건</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory?.("한식");
                    onScrollToContent?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  <span>든든한 한식</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory?.("카페/디저트");
                    onScrollToContent?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  <span>감성 카페</span>
                </button>
              </div>
            </div>

            {/* 인기 검색어 칩스 */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="text-slate-400 font-bold shrink-0">추천 검색:</span>
              {POPULAR_KEYWORDS.map((k) => (
                <button
                  key={k.query}
                  type="button"
                  onClick={() => onSearchSubmit(k.query)}
                  className="text-slate-600 hover:text-[#00C4B4] font-semibold hover:underline cursor-pointer"
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* 우측: 고메 페스티벌 & EAT딜 기획전 배너 (5컬럼) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-3xl p-5 sm:p-6 text-white shadow-xs flex flex-col justify-between relative overflow-hidden border border-slate-800">
            {/* 배경 은은한 포인트 블러 */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#00C4B4]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-[#FF6B00] text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
                  고메 페스티벌
                </span>
                <span className="text-xs font-black text-amber-400">
                  최대 33% EAT딜
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  동내 & 현대백화점 미식 위크
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  엄선된 미슐랭 셰프 식당 및 백년가게 인증 맛집에서 즉시 사용 가능한 할인 쿠폰 혜택
                </p>
              </div>

              {/* 썸네일 & 혜택 바 */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80"
                    alt="고메 위크"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 px-1 rounded-tl bg-[#FF6B00] text-[9px] font-black text-white">
                    33%
                  </span>
                </div>

                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-200">
                    전국 인기 쿠폰 {6}종 발급 중
                  </div>
                  <div className="text-[11px] text-teal-400 font-mono">
                    선착순 일일 한정 혜택
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                현재 지역: <strong className="text-white">{currentDongTitle}</strong>
              </span>
              <button
                type="button"
                onClick={onQuickSelectCurated}
                className="inline-flex items-center gap-1 text-xs font-black text-[#00C4B4] hover:text-white transition cursor-pointer"
              >
                <span>기획전 맛집 보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
