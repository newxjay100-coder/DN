"use client";

import { UtensilsCrossed } from "lucide-react";

export default function SiksinFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 상단 패밀리 링크 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-sm">
              식신<span className="text-amber-400">핫플레이스</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <span className="hover:text-amber-400 cursor-pointer">서비스 소개</span>
            <span>·</span>
            <span className="hover:text-amber-400 cursor-pointer">이용약관</span>
            <span>·</span>
            <span className="hover:text-amber-400 cursor-pointer font-bold text-white">
              개인정보처리방침
            </span>
            <span>·</span>
            <span className="hover:text-amber-400 cursor-pointer">맛집 등록 문의</span>
            <span>·</span>
            <span className="hover:text-amber-400 cursor-pointer">고객센터</span>
          </div>
        </div>

        {/* 중단 회사 정보 및 고객센터 (식신 푸터 양식) */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 text-[11px] leading-relaxed text-slate-400">
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              (주)식신 | 대표이사: 안병익 | 사업자등록번호: 214-88-58798
            </p>
            <p>
              주소: 서울특별시 서초구 사임당로 143, 6층 | 통신판매업신고: 제2013-서울서초-0196호
            </p>
            <p>
              위치기반서비스 이용약관 | 전자금융거래이용약관 | 제휴 및 광고 문의: contact@siksinhot.com
            </p>
            <p className="pt-2 text-slate-500">
              Copyright © 2026 SIKSIN Co., Ltd. All Rights Reserved. 수도권 공공데이터 및 카카오 지도 API 연동.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 space-y-1">
            <span className="text-amber-400 font-bold block">고객센터</span>
            <span className="text-lg font-black text-white block">1577-0957</span>
            <p className="text-[10px] text-slate-500">
              평일 09:30 - 18:00 (점심시간 12:00 - 13:00)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
