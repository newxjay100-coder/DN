"use client";

import { MainTab } from "@/types/restaurant";
import {
  Bookmark,
  Gift,
  Heart,
  MapPin,
  Navigation,
  Train,
  UtensilsCrossed,
} from "lucide-react";

interface DongnaeBottomNavProps {
  activeTab: MainTab;
  favoriteCount: number;
  couponCount: number;
  onTabChange: (tab: MainTab) => void;
  onMyLocationClick: () => void;
  onOpenSubwaySearch: () => void;
}

export default function DongnaeBottomNav({
  activeTab,
  favoriteCount,
  couponCount,
  onTabChange,
  onMyLocationClick,
  onOpenSubwaySearch,
}: DongnaeBottomNavProps) {
  return (
    <nav
      aria-label="모바일 하단 네비게이션"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around"
    >
      {/* 1. 맛집찾기 */}
      <button
        type="button"
        onClick={() => {
          onTabChange("region");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={`flex flex-col items-center justify-center p-1.5 rounded-2xl flex-1 transition cursor-pointer ${
          activeTab === "region"
            ? "text-[#00C4B4] font-black"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <MapPin
          className={`w-5 h-5 ${
            activeTab === "region" ? "stroke-[2.5]" : "stroke-[1.75]"
          }`}
        />
        <span className="text-[10px] mt-0.5">맛집찾기</span>
      </button>

      {/* 2. 내주변 (GPS) */}
      <button
        type="button"
        onClick={onMyLocationClick}
        className="flex flex-col items-center justify-center p-1.5 rounded-2xl flex-1 text-slate-500 hover:text-[#00C4B4] transition cursor-pointer"
      >
        <Navigation className="w-5 h-5 text-[#00C4B4] stroke-[2.2]" />
        <span className="text-[10px] mt-0.5 text-slate-700 font-bold">
          내주변
        </span>
      </button>

      {/* 3. 중앙 퀵 액션 버튼: 지하철 역세권 (망고플레이트 주황 원형 + 버튼 감성) */}
      <button
        type="button"
        onClick={onOpenSubwaySearch}
        className="flex flex-col items-center justify-center -mt-4 bg-[#FF6B00] text-white w-12 h-12 rounded-full shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition cursor-pointer shrink-0"
        title="전국 지하철 노선 맛집 탐색"
      >
        <Train className="w-6 h-6 stroke-[2.2]" />
      </button>

      {/* 4. 혜택·쿠폰 */}
      <button
        type="button"
        onClick={() => {
          onTabChange("coupon");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={`flex flex-col items-center justify-center p-1.5 rounded-2xl flex-1 transition cursor-pointer relative ${
          activeTab === "coupon"
            ? "text-[#FF6B00] font-black"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <Gift
          className={`w-5 h-5 ${
            activeTab === "coupon" ? "stroke-[2.5]" : "stroke-[1.75]"
          }`}
        />
        <span className="text-[10px] mt-0.5">할인·쿠폰</span>
        {couponCount > 0 && (
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#FF6B00]" />
        )}
      </button>

      {/* 5. 찜한맛집 */}
      <button
        type="button"
        onClick={() => {
          onTabChange("favorites");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={`flex flex-col items-center justify-center p-1.5 rounded-2xl flex-1 transition cursor-pointer relative ${
          activeTab === "favorites"
            ? "text-[#00C4B4] font-black"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <Heart
          className={`w-5 h-5 ${
            activeTab === "favorites"
              ? "fill-[#00C4B4] text-[#00C4B4]"
              : "stroke-[1.75]"
          }`}
        />
        <span className="text-[10px] mt-0.5">찜한맛집</span>
        {favoriteCount > 0 && (
          <span className="absolute top-1 right-2.5 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
            {favoriteCount}
          </span>
        )}
      </button>
    </nav>
  );
}
