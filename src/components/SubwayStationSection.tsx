"use client";

import { useMemo, useState } from "react";
import {
  SUBWAY_LINES,
  SUBWAY_STATIONS,
  SubwayStation,
} from "@/data/subwayStations";
import { Restaurant, RestaurantWithDistance } from "@/types/restaurant";
import { calculateDistanceMeters, formatDistance } from "@/utils/distance";
import {
  Check,
  ChevronRight,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  Train,
  X,
} from "lucide-react";

interface SubwayStationSectionProps {
  currentStationId?: string;
  userCoords?: { lat: number; lng: number } | null;
  restaurants?: Restaurant[];
  onSelectStation: (station: SubwayStation) => void;
  onSelectRestaurantDetail?: (restaurant: RestaurantWithDistance) => void;
}

export default function SubwayStationSection({
  currentStationId,
  userCoords,
  restaurants = [],
  onSelectStation,
  onSelectRestaurantDetail,
}: SubwayStationSectionProps) {
  const [selectedLine, setSelectedLine] = useState<string>("2호선");
  const [selectedSection, setSelectedSection] = useState<string>("전체 구간");
  const [stationSearchQuery, setStationSearchQuery] = useState<string>("");

  // 현재 선택된 노선의 메타 정보
  const currentLineInfo = useMemo(() => {
    return SUBWAY_LINES.find((l) => l.name === selectedLine) || null;
  }, [selectedLine]);

  // 호선 변경 시 구간 초기화
  const handleLineChange = (lineName: string) => {
    setSelectedLine(lineName);
    setSelectedSection("전체 구간");
  };

  // 노선 및 구간, 검색어에 따른 지하철역 필터링
  const filteredStations = useMemo(() => {
    const q = stationSearchQuery.trim().toLowerCase();

    return SUBWAY_STATIONS.filter((st) => {
      // 1) 노선 필터
      if (
        selectedLine !== "전체" &&
        st.primaryLine !== selectedLine &&
        !st.lines.includes(selectedLine)
      ) {
        return false;
      }

      // 2) 구간 필터
      if (
        selectedSection !== "전체 구간" &&
        st.section !== selectedSection
      ) {
        return false;
      }

      // 3) 검색어 필터
      if (q) {
        const matchName = st.name.toLowerCase().includes(q);
        const matchShort = st.shortName.toLowerCase().includes(q);
        const matchSection = st.section.toLowerCase().includes(q);
        const matchDong = st.dongName.toLowerCase().includes(q);
        const matchDistrict = st.cityDistrict.toLowerCase().includes(q);
        const matchHot = st.hotKeyword.toLowerCase().includes(q);
        const matchLine = st.lines.some((l) => l.toLowerCase().includes(q));

        if (
          !matchName &&
          !matchShort &&
          !matchSection &&
          !matchDong &&
          !matchDistrict &&
          !matchHot &&
          !matchLine
        ) {
          return false;
        }
      }

      return true;
    });
  }, [selectedLine, selectedSection, stationSearchQuery]);

  // GPS 기준 가장 가까운 역세권 역 계산
  const closestStation = useMemo(() => {
    if (!userCoords) return null;
    let minD = Infinity;
    let closest: SubwayStation | null = null;
    for (const st of SUBWAY_STATIONS) {
      const d = calculateDistanceMeters(
        userCoords.lat,
        userCoords.lng,
        st.lat,
        st.lng
      );
      if (d < minD) {
        minD = d;
        closest = st;
      }
    }
    return closest ? { station: closest, distance: minD } : null;
  }, [userCoords]);

  // 현재 활성화된 역
  const activeStation = useMemo(() => {
    return (
      SUBWAY_STATIONS.find((s) => s.id === currentStationId) ||
      filteredStations[0] ||
      SUBWAY_STATIONS[0]
    );
  }, [currentStationId, filteredStations]);

  // 각 지하철역별 반경 1.5km 이내 연결된 맛집 개수 맵 계산
  const stationRestaurantCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const st of SUBWAY_STATIONS) {
      let count = 0;
      for (const r of restaurants) {
        const d = calculateDistanceMeters(st.lat, st.lng, r.lat, r.lng);
        if (d <= 1500) count++;
      }
      map[st.id] = count;
    }
    return map;
  }, [restaurants]);

  // 현재 활성화된 역세권에 직접 연결된 맛집 목록 (반경 1.5km, 가까운 거리순)
  const connectedRestaurants = useMemo<RestaurantWithDistance[]>(() => {
    if (!activeStation) return [];
    return restaurants
      .map((r) => ({
        ...r,
        distanceMeters: calculateDistanceMeters(
          activeStation.lat,
          activeStation.lng,
          r.lat,
          r.lng
        ),
      }))
      .filter((r) => r.distanceMeters <= 1500)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [activeStation, restaurants]);

  return (
    <section
      aria-label="지하철 전 구간 노선도 및 역세권 맛집 찾기"
      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-5"
    >
      {/* 1. 헤더: 타이틀, 전체 통계 & 내 위치 최근접 역 찾기 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00C4B4] to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/20 shrink-0">
            <Train className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                지하철 전 구간 노선도 &amp; 역세권 맛집 연결
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00C4B4] text-slate-950">
                21개 호선 전 구간 망라
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              호선과 구간을 선택하고 역을 누르면, 반경 500m~1km 내 실제 맛집과 지도가 즉시 연결됩니다.
            </p>
          </div>
        </div>

        {/* 내 위치 최근접 지하철역 원클릭 버튼 */}
        {closestStation && (
          <button
            type="button"
            onClick={() => onSelectStation(closestStation.station)}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-[#00C4B4] text-xs font-bold transition cursor-pointer shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-[#00C4B4]" />
            <span>
              내 위치에서 가장 가까운 역:{" "}
              <strong className="underline text-white font-black">
                {closestStation.station.name}
              </strong>
            </span>
            <span className="text-[11px] text-teal-300 font-mono">
              ({formatDistance(closestStation.distance)})
            </span>
          </button>
        )}
      </div>

      {/* 2. 수도권 21개 호선 탭 셀렉터 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00C4B4]" />
            <span>노선 선택</span>
          </span>
          <span className="text-[11px] text-slate-400">
            총 {SUBWAY_LINES.length}개 호선 지원
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleLineChange("전체")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
              selectedLine === "전체"
                ? "bg-white text-slate-950 border-white shadow-md scale-102"
                : "bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            전체 노선
          </button>

          {SUBWAY_LINES.map((line) => {
            const isSelected = selectedLine === line.name;
            return (
              <button
                key={line.name}
                type="button"
                onClick={() => handleLineChange(line.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? "bg-white text-slate-950 border-white shadow-md scale-102"
                    : "bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: line.color }}
                />
                <span>{line.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 구간(Section) 필터 & 검색바 2열 영역 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1">
        {/* 구간(Section) 필터 버튼 목록 */}
        {currentLineInfo && currentLineInfo.sections && currentLineInfo.sections.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] text-slate-400 font-bold shrink-0 mr-1">
              구간:
            </span>
            {currentLineInfo.sections.map((sec) => {
              const isSecSelected = selectedSection === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer border ${
                    isSecSelected
                      ? "bg-[#00C4B4] text-slate-950 border-[#00C4B4] font-black shadow-xs"
                      : "bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-700"
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">
            수도권 전 구간 지하철역 ({filteredStations.length}개 역)
          </div>
        )}

        {/* 섹션 내 빠른 역 이름/키워드 검색창 */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={stationSearchQuery}
            onChange={(e) => setStationSearchQuery(e.target.value)}
            placeholder="지하철역·구간·핫스팟 검색"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:border-[#00C4B4] focus:outline-none transition text-white placeholder:text-slate-500"
          />
          {stationSearchQuery && (
            <button
              type="button"
              onClick={() => setStationSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. 선택된 노선/구간의 지하철역 카드 그리드 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            조회된 역세권:{" "}
            <strong className="text-[#00C4B4] font-bold">
              {filteredStations.length}
            </strong>
            개 역
          </span>
          <span className="text-[11px] text-slate-400">
            역을 누르면 해당 역세권 중심 맛집이 연결됩니다
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredStations.map((station) => {
            const isCurrent = station.id === activeStation?.id;
            const distance = userCoords
              ? calculateDistanceMeters(
                  userCoords.lat,
                  userCoords.lng,
                  station.lat,
                  station.lng
                )
              : null;
            const count = stationRestaurantCountMap[station.id] || 0;

            return (
              <button
                key={station.id}
                type="button"
                onClick={() => onSelectStation(station)}
                className={`group p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? "bg-gradient-to-br from-[#00C4B4]/25 via-slate-900 to-slate-950 border-[#00C4B4] ring-2 ring-[#00C4B4]/40 shadow-xl"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-teal-300">
                      {station.primaryLine}
                    </span>
                    {distance !== null ? (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-amber-400" />
                        {formatDistance(distance)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                        {station.cityDistrict}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-white group-hover:text-[#00C4B4] transition-colors truncate">
                    {station.name}
                  </h3>

                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {station.hotKeyword}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px]">
                  {/* 연결 맛집 수 배지 */}
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      count > 0
                        ? "bg-teal-500/20 text-[#00C4B4] border border-teal-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    맛집 {count}곳
                  </span>

                  <span className="text-[#00C4B4] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                    연결보기
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. [핵심 연결 영역] 활성화된 역세권 직접 연결 맛집 실시간 프리뷰 */}
      {activeStation && (
        <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
          {/* 배너 헤더 */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#00C4B4] animate-pulse shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-black">
                    🚇 {activeStation.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00C4B4] text-slate-950">
                    {activeStation.primaryLine}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeStation.section}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeStation.cityDistrict} {activeStation.dongName} · 핫플레이스:{" "}
                  {activeStation.hotKeyword}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-black text-[#00C4B4] px-2.5 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20">
                인근 맛집 {connectedRestaurants.length}곳 연결됨
              </span>
              <button
                type="button"
                onClick={() => onSelectStation(activeStation)}
                className="px-3 py-1.5 rounded-xl bg-[#00C4B4] hover:bg-[#00a89a] text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
              >
                지도로 바로보기 →
              </button>
            </div>
          </div>

          {/* 연결된 맛집 가로 스크롤 카드 프리뷰 (연결된 맛집 1.5km 이내 즉시 표시) */}
          {connectedRestaurants.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-300">
                  📍 {activeStation.name} 도보 거리순 연결 맛집
                </span>
                <span className="text-[11px] text-slate-400">
                  카드를 누르면 맛집 상세 정보와 지도로 이동합니다
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                {connectedRestaurants.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (onSelectRestaurantDetail) {
                        onSelectRestaurantDetail(r);
                      } else {
                        onSelectStation(activeStation);
                      }
                    }}
                    className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-2 shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {r.imageUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.imageUrl}
                            alt={r.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 font-black text-xs shrink-0 border border-slate-700">
                          {r.category}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-teal-300">
                            {r.category}
                          </span>
                          {r.starGrade === "3star" && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-400 text-slate-950">
                              3스타
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-black text-white group-hover:text-[#00C4B4] transition-colors truncate mt-1">
                          {r.name}
                        </h4>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                            {r.rating || 4.7}
                          </span>
                          <span>·</span>
                          <span className="text-teal-300 font-mono font-bold">
                            역에서 {r.distanceMeters}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {r.summary || `${r.dongName} 인근 맛집`}
                    </p>

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[120px]">
                        {r.roadAddress || r.jibunAddress || r.dongName}
                      </span>
                      <span className="text-[#00C4B4] font-bold flex items-center">
                        상세보기
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
              <p className="text-xs text-slate-400">
                현재 큐레이션 풀에서 {activeStation.name} 반경 1.5km 맛집을 실시간 검색 중이거나,
                공공데이터 API로 즉시 조회하실 수 있습니다.
              </p>
              <button
                type="button"
                onClick={() => onSelectStation(activeStation)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#00C4B4] text-xs font-bold transition cursor-pointer"
              >
                {activeStation.name} 중심 실시간 공공데이터 20건 불러오기 →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
