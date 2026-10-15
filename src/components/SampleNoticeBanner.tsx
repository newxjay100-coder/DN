"use client";

import { AlertCircle } from "lucide-react";

export default function SampleNoticeBanner() {
  return (
    <div
      role="status"
      aria-label="샘플 데이터 안내"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-950"
    >
      <div className="max-w-5xl mx-auto flex items-start gap-2.5 text-xs sm:text-sm">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="inline-flex items-center font-bold bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded mr-1.5">
            샘플 데이터 화면 (20곳)
          </span>
          <span>
            본 화면은 1단계 UI 검증을 위한 <strong>가상의 샘플 음식점 20개</strong>를
            표시합니다. 실제 정보로 오인할 수 있는{" "}
            <strong className="underline decoration-amber-500">
              평점·리뷰·영업시간은 생성하지 않았으며
            </strong>
            , 공공데이터포털·카카오 지도·Supabase 연동은 제공해 주실 공식 명세 기반으로
            다음 단계에서 연결됩니다.
          </span>
        </div>
      </div>
    </div>
  );
}
