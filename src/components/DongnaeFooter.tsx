"use client";

export default function DongnaeFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-14 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 상단 패밀리 링크 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-sm shadow-md border-2 border-[#00C4B4]">
              D
            </div>
            <div>
              <span className="font-black text-white text-base tracking-wider">
                DONGNAE <span className="text-[#00C4B4]">동내</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-serif italic">
                Delicious Life! 로컬 & 역세권 맛집 플랫폼
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-medium text-[11px] sm:text-xs">
            <span className="hover:text-[#00C4B4] cursor-pointer">서비스 소개</span>
            <span>·</span>
            <span className="hover:text-[#00C4B4] cursor-pointer">지하철 노선표</span>
            <span>·</span>
            <span className="hover:text-[#00C4B4] cursor-pointer">이용약관</span>
            <span>·</span>
            <span className="hover:text-[#00C4B4] cursor-pointer font-bold text-white">
              개인정보처리방침
            </span>
            <span>·</span>
            <span className="hover:text-[#00C4B4] cursor-pointer">동내 맛집 제보</span>
            <span>·</span>
            <span className="hover:text-[#00C4B4] cursor-pointer">고객센터</span>
          </div>
        </div>

        {/* 중단 회사 정보 및 고객센터 */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 text-[11px] leading-relaxed text-slate-400">
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              (주)동내컴퍼니 | 브랜드: 동내 (DONGNAE) | 서비스: 수도권 로컬 & 역세권 맛집 지도
            </p>
            <p>
              주소: 서울특별시 마포구 양화로 160 (홍대입구역 앞) | 데이터 출처: 공공데이터포털(소상공인시장진흥공단, 행정안전부) 및 카카오맵 API
            </p>
            <p>
              위치기반서비스 이용약관 | 전자금융거래이용약관 | 제휴 및 등록 문의: contact@dongnae.dining.com
            </p>
            <p className="pt-2 text-slate-500">
              Copyright © 2026 DONGNAE Co., Ltd. All Rights Reserved. 수도권 전역 지하철역 및 동네 실시간 맛집 탐색.
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shrink-0 space-y-1">
            <span className="text-[#00C4B4] font-bold block text-xs">동내 고객지원센터</span>
            <span className="text-lg font-black text-white block font-mono">1588-DONG(3664)</span>
            <p className="text-[10px] text-slate-400">
              평일 09:30 - 18:00 (점심시간 12:00 - 13:00)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
