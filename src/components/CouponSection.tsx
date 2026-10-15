"use client";

import { useState } from "react";
import { RestaurantCoupon, RestaurantWithDistance } from "@/types/restaurant";
import { Check, Download, Gift, Sparkles, Tag, Ticket } from "lucide-react";
import CouponModal from "./CouponModal";

interface CouponSectionProps {
  restaurants: RestaurantWithDistance[];
  savedCouponIds: string[];
  onToggleSaveCoupon: (couponId: string) => void;
  onSelectRestaurantDetail: (restaurant: RestaurantWithDistance) => void;
}

export default function CouponSection({
  restaurants,
  savedCouponIds,
  onToggleSaveCoupon,
  onSelectRestaurantDetail,
}: CouponSectionProps) {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [selectedVoucher, setSelectedVoucher] = useState<{
    coupon: RestaurantCoupon;
    restaurantName: string;
  } | null>(null);

  // 쿠폰이 있는 음식점들만 추출
  const restaurantsWithCoupons = restaurants.filter(
    (r): r is RestaurantWithDistance & { coupon: RestaurantCoupon } =>
      Boolean(r.coupon)
  );

  const displayedList =
    activeTab === "all"
      ? restaurantsWithCoupons
      : restaurantsWithCoupons.filter((r) =>
          savedCouponIds.includes(r.coupon.id)
        );

  return (
    <section aria-label="식신 혜택 및 쿠폰존" className="space-y-6">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 rounded-3xl p-6 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black">
            <Gift className="w-3.5 h-3.5" />
            <span>동내(DONGNAE) 단독 외식 혜택</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            수도권 맛집 전용 할인 & 서비스 쿠폰팩
          </h2>
          <p className="text-xs text-amber-950 font-medium">
            다운로드 후 매장 방문 시 보여주시면 즉시 혜택이 적용됩니다.
          </p>
        </div>

        {/* 탭: 전체 쿠폰 / 내 보유 쿠폰 */}
        <div className="inline-flex rounded-2xl bg-slate-950/90 p-1.5 text-xs font-bold text-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "all"
                ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            전체 쿠폰 ({restaurantsWithCoupons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "my"
                ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            내 쿠폰함 ({savedCouponIds.length})
          </button>
        </div>
      </div>

      {/* 쿠폰 카드 그리드 */}
      {displayedList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === "my"
              ? "아직 다운로드한 쿠폰이 없습니다"
              : "발급 가능한 쿠폰이 없습니다"}
          </h3>
          <p className="text-xs text-slate-400">
            {activeTab === "my"
              ? "‘전체 쿠폰’ 탭에서 원하는 식당의 쿠폰을 다운받아 보세요!"
              : "곧 새로운 매장의 혜택이 업데이트될 예정입니다."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedList.map((r) => {
            const isSaved = savedCouponIds.includes(r.coupon.id);

            return (
              <div
                key={r.coupon.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                {/* 상단 쿠폰 배지 & 식당 썸네일 */}
                <div className="p-4.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {r.dongName} · {r.category}
                      </span>
                      <h4
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectRestaurantDetail(r)}
                        className="text-base font-black text-slate-900 hover:text-amber-600 transition cursor-pointer"
                      >
                        {r.name}
                      </h4>
                    </div>

                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* 쿠폰 타이틀 및 혜택 */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <span className="text-lg font-black text-amber-900 block">
                      {r.coupon.discount}
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {r.coupon.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {r.coupon.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>유효기간: {r.coupon.validUntil}</span>
                    <span>코드: {r.coupon.code}</span>
                  </div>
                </div>

                {/* 하단 버튼 바 */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSaveCoupon(r.coupon.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : "bg-amber-400 hover:bg-amber-500 text-slate-950 font-black"
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>보유 중 (취소)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>쿠폰 다운받기</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedVoucher({
                        coupon: r.coupon,
                        restaurantName: r.name,
                      })
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                  >
                    바코드 보기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 바코드 팝업 모달 */}
      {selectedVoucher && (
        <CouponModal
          coupon={selectedVoucher.coupon}
          restaurantName={selectedVoucher.restaurantName}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </section>
  );
}
