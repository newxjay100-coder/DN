"use client";

import { useEffect } from "react";
import { RestaurantCoupon } from "@/types/restaurant";
import { Check, Copy, Gift, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface CouponModalProps {
  coupon: RestaurantCoupon | null;
  restaurantName: string;
  onClose: () => void;
}

export default function CouponModal({
  coupon,
  restaurantName,
  onClose,
}: CouponModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!coupon) return;
    setCopied(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [coupon, onClose]);

  if (!coupon) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 쿠폰 상단 티켓 헤더 */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 p-5 text-slate-950 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center mx-auto mb-2 shadow-md">
            <Gift className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full">
            SIKSIN VIP COUPON
          </span>
          <h3 className="text-xl font-black mt-1.5 text-slate-950">
            {coupon.discount}
          </h3>
          <p className="text-xs font-bold text-amber-900 mt-0.5">
            {restaurantName} 전용 혜택
          </p>
        </div>

        {/* 바코드 및 티켓 절취선 효과 */}
        <div className="relative border-b-2 border-dashed border-slate-200 bg-slate-50 py-3 px-6 text-center">
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-950/70" />
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-950/70" />

          {/* 가상 바코드 그래픽 */}
          <div className="h-10 bg-slate-900 rounded mx-auto flex items-center justify-center px-4 overflow-hidden select-none">
            <div className="w-full flex items-center justify-between gap-1 opacity-90">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-7 bg-white ${
                    i % 3 === 0 ? "w-1" : i % 2 === 0 ? "w-0.5" : "w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-slate-600 mt-1 block">
            {coupon.code}
          </span>
        </div>

        {/* 쿠폰 설명 & 사용 방법 */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-black text-sm text-slate-900">
              {coupon.title}
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {coupon.description}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 space-y-1 text-[11px]">
            <p className="font-bold text-slate-700">📌 매장 이용 안내</p>
            <p>· 주문 전 직원에게 본 쿠폰 화면 또는 바코드를 제시해 주세요.</p>
            <p>· 유효기간: {coupon.validUntil}까지</p>
            <p>· 타 쿠폰 및 중복 할인 불가</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>쿠폰번호 복사</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
