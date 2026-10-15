"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  Compass,
  Flame,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Train,
  TrendingUp,
} from "lucide-react";

interface DongnaeHeroProps {
  currentDongTitle: string;
  onSearchSubmit: (keyword: string) => void;
  onQuickSelectSubway: () => void;
  onQuickSelectNearbyGps: () => void;
  onQuickSelectCurated: () => void;
  onQuickSelectPublicData: () => void;
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
    <section className="relative w-full overflow-hidden bg-slate-950 text-white">
      {/* 1. 다이닝코드 스타일 다크 미식 배경 이미지 & 그래디언트 오버레이 */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80"
          alt="동내 고품격 다이닝 배경"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950" />
        <div className="absolute inset-0 bg-radial from-teal-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16 flex flex-col items-center text-center">
        {/* 2. 다이닝코드 스타일 D 원형 로고 심볼 */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-2xl border-3 border-[#00C4B4] mb-4 hover:scale-105 transition-transform">
          D
        </div>

        {/* 3. 영문 브랜드명 및 이탤릭 슬로건 */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-white drop-shadow-md uppercase">
          DONGNAE
        </h1>
        <p className="mt-1 text-sm sm:text-base font-serif italic text-[#00C4B4] drop-shadow-sm font-semibold">
          Delicious Life! 우리 동네 로컬 & 역세권 맛집 탐색
        </p>

        {/* 현재 위치 배너 칩 */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5 text-[#00C4B4]" />
          <span>현재 탐색 기준: </span>
          <strong className="text-white font-bold">{currentDongTitle}</strong>
        </div>

        {/* 4. [엔터 버튼 포함] 중심 검색바 */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-xl mt-6 relative flex items-center shadow-2xl rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md p-1.5 border border-white/40 focus-within:ring-3 focus-within:ring-[#00C4B4]/50 transition-all"
        >
          <div className="pl-3.5 text-slate-400">
            <Search className="w-5 h-5 text-slate-500" />
          </div>

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="전국 동네(연남, 해운대, 둔산), 역(홍대입구역, 강남역, 서면역) 입력 후 엔터"
            className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
          />

          {/* 요구사항: 지역이름다음 엔터 버튼을 만들어 누르면 지역 맛집이나오는 스타일 */}
          <button
            type="submit"
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#00C4B4] hover:bg-[#00a89a] active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl sm:rounded-full transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <span>엔터</span>
            <span className="text-xs opacity-75">↵</span>
          </button>
        </form>

        {/* 5. 다이닝코드 스타일 퀵 액션 필(Pill) 버튼 4종 */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full max-w-xl">
          <button
            type="button"
            onClick={onQuickSelectNearbyGps}
            className="group flex-1 min-w-[130px] sm:min-w-[140px] px-3.5 py-2.5 rounded-full bg-slate-900/80 hover:bg-[#00C4B4] text-white hover:text-slate-950 border border-teal-500/50 hover:border-[#00C4B4] text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#00C4B4] group-hover:text-slate-950 transition-colors" />
            <span>내 주변 맛집</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#00C4B4] text-slate-950 group-hover:bg-slate-950 group-hover:text-[#00C4B4] font-black">
              GPS
            </span>
          </button>

          <button
            type="button"
            onClick={onQuickSelectSubway}
            className="group flex-1 min-w-[130px] sm:min-w-[140px] px-3.5 py-2.5 rounded-full bg-slate-900/80 hover:bg-amber-400 text-white hover:text-slate-950 border border-amber-500/50 hover:border-amber-400 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Train className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950 transition-colors" />
            <span>지하철 노선도</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 group-hover:bg-slate-950 group-hover:text-amber-400 font-black">
              전구간
            </span>
          </button>

          <button
            type="button"
            onClick={onQuickSelectCurated}
            className="group flex-1 min-w-[130px] sm:min-w-[140px] px-3.5 py-2.5 rounded-full bg-slate-900/80 hover:bg-white text-white hover:text-slate-950 border border-slate-700 hover:border-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600 transition-colors" />
            <span>전국 인기 맛집</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
              BEST
            </span>
          </button>

          <button
            type="button"
            onClick={onQuickSelectPublicData}
            className="group flex-1 min-w-[130px] sm:min-w-[140px] px-3.5 py-2.5 rounded-full bg-slate-900/80 hover:bg-sky-400 text-white hover:text-slate-950 border border-sky-500/50 hover:border-sky-400 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400 group-hover:text-slate-950 transition-colors" />
            <span>전국 공공 상가</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-500 text-white font-black">
              50건
            </span>
          </button>
        </div>

        {/* 6. 오늘의 인기 검색어 가로 칩 바 */}
        <div className="mt-5 flex items-center gap-2 flex-wrap justify-center text-xs">
          <span className="flex items-center gap-1 text-slate-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-[#00C4B4]" />
            인기 검색어:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {POPULAR_KEYWORDS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setKeyword(item.query);
                  onSearchSubmit(item.query);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-[#00C4B4] text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. 아래로 스크롤 가이드 원형 버튼 */}
        {onScrollToContent && (
          <button
            type="button"
            onClick={onScrollToContent}
            aria-label="음식점 목록으로 이동"
            className="mt-6 p-2 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-[#00C4B4] hover:bg-slate-900/80 transition-all cursor-pointer animate-bounce"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
