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
      className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-emerald-950 text-xs"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-slate-950" />
            공공데이터 & Supabase DB 연동
          </span>
          <span className="text-emerald-950 font-medium">
            수도권(서울·경기·인천) 공공 음식점 <strong>{totalCount}곳</strong> 탑재 · 실시간 GPS & 카카오 지도 연동
          </span>
          {dataSource === "supabase" && (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-full text-[11px]">
              <Database className="w-3 h-3 text-emerald-700" />
              Supabase 클라우드 DB 실시간 조회 중
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {seedStatus && (
            <span className="text-[11px] font-semibold text-emerald-800">
              {seedStatus}
            </span>
          )}
          <button
            type="button"
            onClick={handleSeedSupabase}
            disabled={isSeeding}
            title="현재 음식점 실데이터를 Supabase 테이블에 일괄 적재합니다"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isSeeding ? "적재 중..." : "Supabase DB에 동기화"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
