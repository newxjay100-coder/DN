"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RegionLocation,
  SEOUL_GYEONGGI_REGIONS,
} from "@/data/seoulGyeonggiRegions";
import { NATIONWIDE_REGIONS } from "@/data/nationwideRegions";
import {
  Building2,
  ChevronRight,
  Compass,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    title: string;
    fullName: string;
    lat: number;
    lng: number;
  }) => void;
}

interface UnifiedRegionItem {
  id: string;
  dongName: string;
  districtName: string;
  cityName: string;
  fullName: string;
  lat: number;
  lng: number;
  description: string;
  regionType: "seoul" | "gyeonggi" | "incheon" | "nationwide";
  keywords: string[];
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onSelectLocation,
}: AddressSearchModalProps) {
  const [keyword, setKeyword] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "all" | "seoul" | "gyeonggi" | "incheon" | "nationwide"
  >("all");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setKeyword("");
    }
  }, [isOpen]);

  const allRegions = useMemo<UnifiedRegionItem[]>(() => {
    const list: UnifiedRegionItem[] = [];

    SEOUL_GYEONGGI_REGIONS.forEach((r) => {
      list.push({
        id: r.id,
        dongName: r.dongName,
        districtName: r.districtName,
        cityName: r.cityName,
        fullName: r.fullName,
        lat: r.lat,
        lng: r.lng,
        description: r.description,
        regionType: r.regionType,
        keywords: r.keywords,
      });
    });

    NATIONWIDE_REGIONS.forEach((nr) => {
      if (
        !nr.province.includes("서울") &&
        !nr.province.includes("경기") &&
        !nr.province.includes("인천")
      ) {
        list.push({
          id: nr.id,
          dongName: nr.dongName,
          districtName: nr.cityName,
          cityName: nr.province,
          fullName: nr.fullName,
          lat: nr.lat,
          lng: nr.lng,
          description: nr.description,
          regionType: "nationwide",
          keywords: nr.keywords,
        });
      }
    });

    return list;
  }, []);

  // 검색어 및 지역 탭 필터링
  const searchResults = useMemo<UnifiedRegionItem[]>(() => {
    const q = keyword.trim().toLowerCase();

    return allRegions.filter((region) => {
      if (activeTab === "seoul" && region.regionType !== "seoul") return false;
      if (activeTab === "gyeonggi" && region.regionType !== "gyeonggi")
        return false;
      if (activeTab === "incheon" && region.regionType !== "incheon")
        return false;
      if (activeTab === "nationwide" && region.regionType !== "nationwide")
        return false;

      if (!q) return true;

      return (
        region.dongName.toLowerCase().includes(q) ||
        region.districtName.toLowerCase().includes(q) ||
        region.cityName.toLowerCase().includes(q) ||
        region.fullName.toLowerCase().includes(q) ||
        region.description.toLowerCase().includes(q) ||
        region.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [keyword, activeTab, allRegions]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 & 검색 입력창 */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h3
                id="address-modal-title"
                className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight"
              >
                동네 찾기 (서울 · 경기 · 인천 · 전국 17개 시도)
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 검색창 */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="동네, 시/구, 지하철역 검색 (예: 송도, 판교, 해운대, 서면, 유성, 동성로, 제주, 강남)"
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none transition shadow-2xs"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 지역 구분 탭: 전체 / 서울 / 경기 / 인천 / 전국 5대도시/제주 */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              전체 ({allRegions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seoul")}
              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
                activeTab === "seoul"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              서울 (
              {allRegions.filter((r) => r.regionType === "seoul").length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gyeonggi")}
              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
                activeTab === "gyeonggi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              경기 (
              {allRegions.filter((r) => r.regionType === "gyeonggi").length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("incheon")}
              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
                activeTab === "incheon"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              인천 (
              {allRegions.filter((r) => r.regionType === "incheon").length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("nationwide")}
              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer shrink-0 ${
                activeTab === "nationwide"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              전국 광역·제주 (
              {allRegions.filter((r) => r.regionType === "nationwide").length}
              )
            </button>
          </div>
        </div>

        {/* 추천 인기 동네 칩 */}
        {!keyword && (
          <div className="px-5 py-2.5 bg-emerald-50/60 border-b border-emerald-100 text-xs">
            <p className="font-bold text-emerald-950 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>추천 인기 동네 바로가기:</span>
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                "부산 해운대",
                "대전 성심당",
                "대구 동성로",
                "제주 연동",
                "인천 송도",
                "판교",
                "수원 행궁동",
                "서울 연남동",
                "서울 강남역",
                "서울 성수동",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const clean = tag.replace("인천 ", "").replace("서울 ", "").replace("부산 ", "").replace("대전 ", "").replace("대구 ", "").replace("제주 ", "").trim();
                    setKeyword(clean);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition cursor-pointer font-medium shadow-2xs"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 검색 결과 목록 */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-100">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Compass className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">
                &lsquo;{keyword}&rsquo;에 해당하는 동네를 찾지 못했습니다.
              </p>
              <p className="text-xs text-slate-400">
                시·구 이름이나 대표 동네명(예: 송도, 해운대, 서면, 판교, 행궁동, 연남동, 강남)으로 검색해 보세요.
              </p>
            </div>
          ) : (
            searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectLocation({
                    title: `${item.districtName} ${item.dongName}`,
                    fullName: item.fullName,
                    lat: item.lat,
                    lng: item.lng,
                  });
                  onClose();
                }}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.regionType === "seoul"
                          ? "bg-sky-100 text-sky-800"
                          : item.regionType === "gyeonggi"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.regionType === "incheon"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      {item.regionType === "seoul"
                        ? "서울"
                        : item.regionType === "gyeonggi"
                        ? "경기"
                        : item.regionType === "incheon"
                        ? "인천"
                        : "전국"}
                    </span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {item.fullName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* 하단 바 */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>서울·경기·인천 및 전국 17개 시도 주요 상권 & 지하철역 완벽 지원</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
