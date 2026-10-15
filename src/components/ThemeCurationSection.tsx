"use client";

import { useState } from "react";
import { RestaurantWithDistance, ThemeCategory } from "@/types/restaurant";
import RestaurantCard from "./RestaurantCard";
import {
  Beer,
  Briefcase,
  Cake,
  Clock,
  Heart,
  Sparkles,
  Utensils,
} from "lucide-react";

interface ThemeCurationSectionProps {
  restaurants: RestaurantWithDistance[];
  onSelectRestaurantDetail: (restaurant: RestaurantWithDistance) => void;
  onMoveToMapMarker: (restaurant: RestaurantWithDistance) => void;
}

const THEME_TABS: { id: ThemeCategory; label: string; icon: any; color: string; desc: string }[] = [
  {
    id: "전체",
    label: "전체 테마",
    icon: Sparkles,
    color: "bg-slate-900 text-white",
    desc: "식신 에디터가 엄선한 테마별 대표 맛집 컬렉션",
  },
  {
    id: "데이트코스",
    label: "데이트 & 분위기",
    icon: Heart,
    color: "bg-rose-500 text-white",
    desc: "로맨틱한 조명과 감성적인 인테리어, 와인과 파스타가 있는 데이트 명소",
  },
  {
    id: "노포·백년가게",
    label: "노포 & 백년가게",
    icon: Clock,
    color: "bg-amber-600 text-white",
    desc: "최소 30년 이상 대를 이어온 깊은 손맛과 전통의 전설적인 맛집",
  },
  {
    id: "직장인점심",
    label: "직장인 점심 성지",
    icon: Briefcase,
    color: "bg-emerald-600 text-white",
    desc: "가성비와 든든함을 모두 갖춘 직장인들의 회전율 높은 점심 1등 식당",
  },
  {
    id: "회식·고기파티",
    label: "회식 & 고기파티",
    icon: Beer,
    color: "bg-orange-500 text-white",
    desc: "단체 모임과 회식에 최적화된 최상급 숙성 삼겹살과 양갈비, 족발 명가",
  },
  {
    id: "감성카페·디저트",
    label: "감성 뷰 카페 & 베이커리",
    icon: Cake,
    color: "bg-purple-600 text-white",
    desc: "초대형 식물원, 호수 수변 테라스, 시그니처 디저트를 즐길 수 있는 카페",
  },
];

export default function ThemeCurationSection({
  restaurants,
  onSelectRestaurantDetail,
  onMoveToMapMarker,
}: ThemeCurationSectionProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeCategory>("전체");

  const filtered = restaurants.filter((r) => {
    if (selectedTheme === "전체") return true;
    return r.themeTags?.includes(selectedTheme);
  });

  const currentThemeMeta = THEME_TABS.find((t) => t.id === selectedTheme) || THEME_TABS[0];

  return (
    <section aria-label="식신 테마별 맛집 큐레이션" className="space-y-6">
      {/* 상단 테마 탭 셀렉터 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              식신 상황별·취향별 테마 큐레이션
            </h2>
            <p className="text-xs text-slate-500">
              광고 없는 실제 방문객 빅데이터로 엄선한 테마별 컬렉션
            </p>
          </div>
        </div>

        {/* 테마 탭 버튼들 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {THEME_TABS.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? `${theme.color} shadow-md scale-102`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 현재 선택된 테마 히어로 카드 */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
              {currentThemeMeta.label}
            </span>
            <span className="text-xs text-slate-400">
              선정된 맛집 {filtered.length}곳
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {currentThemeMeta.desc}
          </p>
        </div>
      </div>

      {/* 맛집 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSelectDetail={onSelectRestaurantDetail}
            onMoveToMapMarker={onMoveToMapMarker}
          />
        ))}
      </div>
    </section>
  );
}
