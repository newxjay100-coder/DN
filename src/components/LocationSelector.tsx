"use client";

import { GeolocationStatus, LocationMode } from "@/types/restaurant";
import {
  Building2,
  Clock,
  Compass,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface LocationSelectorProps {
  currentAddressTitle: string;
  currentAddressDescription: string;
  locationMode: LocationMode;
  geoStatus: GeolocationStatus;
  geoErrorMessage: string | null;
  currentCoords: { lat: number; lng: number };
  onOpenAddressSearch: () => void;
  onRequestGeolocation: () => void;
  onQuickSelectRegion: (presetId: string) => void;
  onSimulateGeolocationDenied: () => void;
  onSimulateGeolocationTimeout: () => void;
  onSimulateMapoLocation: () => void;
  onSimulatePangyoLocation: () => void;
  onSimulateIncheonLocation: () => void;
}

const POPULAR_PRESETS = [
  { id: "songdo", label: "인천 송도", type: "incheon" },
  { id: "chinatown", label: "인천 차이나타운", type: "incheon" },
  { id: "bupyeong", label: "인천 부평", type: "incheon" },
  { id: "cheongna", label: "인천 청라", type: "incheon" },
  { id: "guwol", label: "인천 구월동", type: "incheon" },
  { id: "soraepogu", label: "인천 소래포구", type: "incheon" },
  { id: "yeonnam", label: "서울 연남동", type: "seoul" },
  { id: "euljiro", label: "서울 을지로", type: "seoul" },
  { id: "seongsu", label: "서울 성수동", type: "seoul" },
  { id: "hangangno", label: "서울 용리단길", type: "seoul" },
  { id: "yeoksam", label: "서울 강남역", type: "seoul" },
  { id: "jamsil", label: "서울 잠실(송리단길)", type: "seoul" },
  { id: "mullae", label: "서울 문래창작촌", type: "seoul" },
  { id: "pangyo", label: "경기 판교", type: "gyeonggi" },
  { id: "haenggung", label: "경기 수원 행궁동", type: "gyeonggi" },
  { id: "ilsan", label: "경기 일산(밤리단길)", type: "gyeonggi" },
  { id: "dongtan", label: "경기 동탄", type: "gyeonggi" },
  { id: "bojeong", label: "경기 용인 보정동", type: "gyeonggi" },
  { id: "gwangmyeong", label: "경기 광명", type: "gyeonggi" },
];

export default function LocationSelector({
  currentAddressTitle,
  currentAddressDescription,
  locationMode,
  geoStatus,
  geoErrorMessage,
  currentCoords,
  onOpenAddressSearch,
  onRequestGeolocation,
  onQuickSelectRegion,
  onSimulateGeolocationDenied,
  onSimulateGeolocationTimeout,
  onSimulateMapoLocation,
  onSimulatePangyoLocation,
  onSimulateIncheonLocation,
}: LocationSelectorProps) {
  const isGeoActive =
    locationMode === "geolocation" && geoStatus === "granted";

  return (
    <section
      aria-label="내 주변 찾기 및 서울·경기 주소 검색"
      className="bg-white border-b border-slate-200 px-4 py-3.5"
    >
      <div className="max-w-5xl mx-auto space-y-3">
        {/* 1행: 현재 기준 위치 표시 + 내 주변 찾기 및 주소 검색 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isGeoActive
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-slate-900 text-white"
              }`}
            >
              <LocateFixed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500">
                  탐색 기준 위치:
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {isGeoActive
                    ? `내 현재 위치 (GPS) · ${currentAddressTitle}`
                    : currentAddressTitle}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentAddressDescription}
              </p>
            </div>
          </div>

          {/* 메인 액션 버튼군: 내 위치 찾기 + 서울·경기 주소 검색 */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* 1. 내 주변 찾기 (GPS) */}
            <button
              type="button"
              onClick={onRequestGeolocation}
              disabled={geoStatus === "loading"}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer ${
                isGeoActive
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {geoStatus === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>위치 확인 중...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4 text-emerald-400" />
                  <span>내 주변 찾기</span>
                </>
              )}
            </button>

            {/* 2. 서울·경기·인천 주소/동네 검색 모달 열기 버튼 */}
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition shadow-2xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              <span>동네·주소 검색 (서울·경기·인천)</span>
            </button>

            {/* 빠른 테스트용 시뮬레이션 버튼군 */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium text-slate-600">
              <button
                type="button"
                onClick={onSimulateIncheonLocation}
                title="인천 연수구 송도동 기준 GPS 시뮬레이션"
                className="px-2 py-1 rounded hover:bg-white hover:text-amber-700 font-bold transition cursor-pointer text-amber-900 bg-amber-50/70"
              >
                인천(송도) 테스트
              </button>
              <button
                type="button"
                onClick={onSimulateMapoLocation}
                title="서울 마포구 연남동 기준 GPS 시뮬레이션"
                className="px-2 py-1 rounded hover:bg-white hover:text-emerald-700 font-bold transition cursor-pointer border-l border-slate-200"
              >
                서울(마포) 테스트
              </button>
              <button
                type="button"
                onClick={onSimulatePangyoLocation}
                title="경기 성남시 판교 기준 GPS 시뮬레이션"
                className="px-2 py-1 rounded hover:bg-white hover:text-emerald-700 font-bold transition cursor-pointer border-l border-slate-200"
              >
                경기(판교) 테스트
              </button>
              <button
                type="button"
                onClick={onSimulateGeolocationDenied}
                title="위치 권한 거부 시 직접 선택 모드로 전환되는 과정을 테스트합니다"
                className="px-2 py-1 rounded hover:bg-white hover:text-rose-700 transition cursor-pointer border-l border-slate-200"
              >
                권한 거부
              </button>
            </div>
          </div>
        </div>

        {/* 2행: 위치 권한 거부 또는 오류 알림 박스 */}
        {(geoStatus === "denied" ||
          geoStatus === "timeout" ||
          geoStatus === "unavailable" ||
          geoStatus === "unsupported") && (
          <div
            role="alert"
            className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-950 flex items-start gap-3 animate-in fade-in duration-200"
          >
            {geoStatus === "timeout" ? (
              <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <p className="font-bold text-rose-900">
                {geoErrorMessage || "현재 위치 정보를 가져올 수 없습니다."}
              </p>
              <p className="text-rose-800 leading-relaxed">
                현재 <strong>지역 직접 선택 모드</strong>로 자동 전환되었습니다.
                아래에서 원하시는 동네를 누르시거나, 상단{" "}
                <strong>&lsquo;동네·주소 검색&rsquo;</strong>을 통해 인천, 서울 및 경기 지역의
                어떤 동네든 직접 찾아보실 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 font-bold hover:bg-rose-100 transition shrink-0 cursor-pointer"
            >
              주소 검색 열기
            </button>
          </div>
        )}

        {/* 3행: 서울·경기·인천 인기 동네 빠른 선택 칩 & 개인정보 보호 문구 */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-xs font-bold text-slate-700 shrink-0 mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              수도권 대표 동네:
            </span>
            {POPULAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onQuickSelectRegion(preset.id)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 border border-transparent hover:border-emerald-200"
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenAddressSearch}
              className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
            >
              + 전체 동네 찾기
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>위치 정보 DB 미저장 (기기 계산)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
