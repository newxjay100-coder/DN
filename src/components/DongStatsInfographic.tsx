"use client";

import { useMemo } from "react";
import { RestaurantWithDistance } from "@/types/restaurant";
import {
  Compass,
  Flame,
  MapPin,
  PieChart,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface DongStatsInfographicProps {
  currentDongName: string;
  currentFullName: string;
  restaurants: RestaurantWithDistance[];
  onOpenAddressSearch: () => void;
  onSelectCategory: (category: any) => void;
}

export default function DongStatsInfographic({
  currentDongName,
  currentFullName,
  restaurants,
  onOpenAddressSearch,
  onSelectCategory,
}: DongStatsInfographicProps) {
  // 현재 동네 및 주변 맛집의 카테고리별 통계 계산
  const categoryStats = useMemo(() => {
    if (restaurants.length === 0) return [];

    const counts: Record<string, number> = {};
    restaurants.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    const total = restaurants.length;
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }, [restaurants]);

  const topCategory = categoryStats[0]?.name || "맛집";

  return (
    <section
      aria-label="동네 맛집 업종별 통계 인포그래픽"
      className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-5 sm:p-6 border border-amber-400/80 shadow-lg text-slate-950 mb-6"
    >
      {/* 배경 장식 원형 패턴 */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/20 pointer-events-none" />
      <div className="absolute right-32 -bottom-16 w-40 h-40 rounded-full bg-amber-500/15 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* 좌측: 동네 인포 타이틀 & 대표 카테고리 & 핫플레이스 수치 */}
        <div className="space-y-2.5 max-w-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentDongName}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-white/70 text-slate-800">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              실시간 핫플레이스
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center gap-1.5 flex-wrap">
              <span>{topCategory} 전문 동네</span>
              <span className="text-amber-900 text-base font-extrabold">
                ({currentDongName})
              </span>
            </h2>
            <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
              {currentFullName} 중심 빅데이터 기준 맛집 업종 점유율과 인기 핫플레이스를 분석했습니다.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>다른 동네 분석하기</span>
            </button>
            <span className="text-xs font-extrabold text-slate-900 bg-white/60 px-3 py-1.5 rounded-xl">
              총 {restaurants.length}개 맛집 분석됨
            </span>
          </div>
        </div>

        {/* 중앙: 식신 스타일 원형 통계 엠블럼 */}
        <div className="flex items-center justify-center shrink-0">
          <div className="w-28 h-28 rounded-full bg-slate-950 text-white flex flex-col items-center justify-center text-center p-2 shadow-2xl border-4 border-white/80 animate-in zoom-in-95 duration-300">
            <Sparkles className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-xs font-bold text-teal-300">동내 핫플</span>
            <span className="text-2xl font-black text-white leading-none my-0.5">
              {restaurants.length}
            </span>
            <span className="text-[10px] text-slate-400">추천 맛집</span>
          </div>
        </div>

        {/* 우측: 업종별 점유율 퍼센트 프로그레스 바 (식신 인포그래픽 핵심 재현) */}
        <div className="bg-slate-950/90 text-white p-4 rounded-2xl border border-slate-800/90 shadow-xl flex-1 max-w-md space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
            <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              {currentDongName} 업종 점유율 현황
            </span>
            <span className="text-[11px] text-slate-400">
              클릭 시 해당 업종 필터링
            </span>
          </div>

          <div className="space-y-1.5">
            {categoryStats.slice(0, 5).map((stat, idx) => (
              <div
                key={stat.name}
                role="button"
                tabIndex={0}
                onClick={() => onSelectCategory(stat.name)}
                className="group flex items-center justify-between gap-3 text-xs p-1 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 w-24 shrink-0 font-bold">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                      idx === 0
                        ? "bg-amber-400 text-slate-950"
                        : idx === 1
                        ? "bg-sky-400 text-slate-950"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="group-hover:text-amber-300 transition">
                    {stat.name}
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? "bg-amber-400"
                        : idx === 1
                        ? "bg-sky-400"
                        : idx === 2
                        ? "bg-emerald-400"
                        : "bg-purple-400"
                    }`}
                    style={{ width: `${Math.max(stat.percent, 8)}%` }}
                  />
                </div>

                {/* 퍼센트 수치 */}
                <span className="text-right w-14 font-mono font-bold text-amber-300 text-xs shrink-0">
                  {stat.percent}% ({stat.count}곳)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
