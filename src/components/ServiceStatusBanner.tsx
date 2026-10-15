"use client";

import { useState } from "react";
import { CheckCircle2, Database, MapPin, Sparkles } from "lucide-react";

interface ServiceStatusBannerProps {
  dataSource: string;
  totalCount: number;
  onRefreshData?: () => void;
}

export default function ServiceStatusBanner({
  dataSource,
  totalCount,
  onRefreshData,
}: ServiceStatusBannerProps) {
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleSeedSupabase = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    try {
      const res = await fetch("/api/restaurants", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSeedStatus(`성공: ${json.message}`);
        onRefreshData?.();
      } else {
        setSeedStatus(`안내: ${json.error || json.hint || "저장 실패"}`);
      }
    } catch {
      setSeedStatus("서버 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div
      role="status"
      aria-label="서비스 연동 상태"
      className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-1.5 text-xs"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="inline-flex items-center gap-1 font-black bg-[#00C4B4] text-slate-950 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-slate-950" />
            공공데이터 & PostGIS 연동
          </span>
          <span className="text-slate-300">
            전국 17개 시도 공공 음식점 <strong>{totalCount}곳</strong> 탑재 · 실시간 GPS & 카카오 지도
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {seedStatus && (
            <span className="text-[11px] font-semibold text-teal-300">
              {seedStatus}
            </span>
          )}
          <button
            type="button"
            onClick={handleSeedSupabase}
            disabled={isSeeding}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>{isSeeding ? "동기화 중..." : "DB 동기화"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white p-0.5 transition cursor-pointer"
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
