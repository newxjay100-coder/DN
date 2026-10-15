"use client";

import { useEffect, useState } from "react";
import { RestaurantWithDistance, UserReview } from "@/types/restaurant";
import { formatDistance } from "@/utils/distance";
import {
  Award,
  Building2,
  Clock,
  Database,
  ExternalLink,
  Gift,
  Heart,
  Info,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";

interface RestaurantDetailModalProps {
  restaurant: RestaurantWithDistance | null;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onClose: () => void;
  onViewOnMap?: (restaurant: RestaurantWithDistance) => void;
  onOpenCoupon?: (coupon: any, restaurantName: string) => void;
}

export default function RestaurantDetailModal({
  restaurant,
  isFavorite = false,
  onToggleFavorite,
  onClose,
  onViewOnMap,
  onOpenCoupon,
}: RestaurantDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [dbDetail, setDbDetail] = useState<Partial<RestaurantWithDistance> | null>(null);

  // DB에서 음식점 최신 상세 정보 조회 (/api/restaurants?id=...)
  useEffect(() => {
    if (!restaurant?.id) return;
    setDbDetail(null);
    fetch(`/api/restaurants?id=${encodeURIComponent(restaurant.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.restaurant) {
          setDbDetail(json.restaurant);
        }
      })
      .catch(() => {});
  }, [restaurant?.id]);

  const activeRestaurant: RestaurantWithDistance | null = restaurant
    ? { ...restaurant, ...dbDetail }
    : null;

  const isPublicData =
    activeRestaurant?.dataSource === "public_data" ||
    activeRestaurant?.dataOrigin?.startsWith("public_data");

  useEffect(() => {
    if (!restaurant) return;

    setImageError(false);

    // 로컬스토리지에서 이 식당의 리뷰 불러오기
    try {
      const stored = localStorage.getItem(`siksin_reviews_${restaurant.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else if (!isPublicData) {
        // 큐레이션 맛집인 경우에만 기본 방문자 리뷰 표시
        setReviews([
          {
            id: "rev-sample-1",
            restaurantId: restaurant.id,
            author: "동내미식가",
            rating: 5,
            comment: `정말 맛있어요! 대표 메뉴가 특히 훌륭하고 직원분들도 친절하십니다.`,
            createdAt: "2026.10.12",
          },
          {
            id: "rev-sample-2",
            restaurantId: restaurant.id,
            author: "동네단골러",
            rating: restaurant.rating ? Math.round(restaurant.rating) : 5,
            comment: `${restaurant.dongName} 올 때마다 꼭 들르는 최애 핫플레이스입니다.`,
            createdAt: "2026.10.08",
          },
        ]);
      } else {
        // 공공데이터는 기본 가짜 리뷰를 생성하지 않음 (요구사항 준수)
        setReviews([]);
      }
    } catch {
      // ignore
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [restaurant, isPublicData, onClose]);

  if (!restaurant) return null;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newRev: UserReview = {
      id: `rev-${Date.now()}`,
      restaurantId: restaurant.id,
      author: reviewerName.trim() || "익명의 동내미식가",
      rating: newRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toLocaleDateString("ko-KR"),
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(
        `siksin_reviews_${restaurant.id}`,
        JSON.stringify(updated)
      );
    } catch {
      // ignore
    }

    setReviewComment("");
    setReviewerName("");
  };

  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
    restaurant.name
  )},${restaurant.lat},${restaurant.lng}`;

  const kakaoRouteUrl = `https://map.kakao.com/link/to/${encodeURIComponent(
    restaurant.name
  )},${restaurant.lat},${restaurant.lng}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일 바텀시트 핸들바 */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* 상단 헤더 배너: 사진이 있으면 사진, 없으면 공공데이터 공식 식별 헤더 */}
        {restaurant.imageUrl && !imageError ? (
          <div className="relative w-full h-52 sm:h-60 bg-slate-900 shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-black/30 pointer-events-none" />

            {/* 우상단 닫기 & 찜하기 버튼 */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(restaurant.id)}
                  aria-label={isFavorite ? "찜 해제" : "찜하기"}
                  className={`p-2 rounded-full backdrop-blur-xs transition cursor-pointer shadow-md ${
                    isFavorite
                      ? "bg-rose-500 text-white"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 좌상단 뱃지: 카테고리 + 별맛집 스타 */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-white shadow-sm border border-slate-700">
                {restaurant.category}
              </span>
              {restaurant.starGrade === "3star" && (
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  ★★★ 동내 3스타
                </span>
              )}
            </div>

            {/* 사진 하단 타이틀 & 거리 정보 */}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  기준 위치로부터 직선거리 {formatDistance(restaurant.distanceMeters)}
                </span>
                {restaurant.rating !== undefined && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-white font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {restaurant.rating} ({restaurant.reviewCount || 0}명 평가)
                    </span>
                  </>
                )}
              </div>
              <h2
                id="detail-modal-title"
                className="text-xl sm:text-2xl font-black tracking-tight"
              >
                {restaurant.name}
              </h2>
            </div>
          </div>
        ) : (
          /* 공공데이터 등 사진 미제공 업소: 임의 사진 생성 금지 및 정식 공공데이터 인허가 카드 */
          <div className="relative w-full p-5 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-500 text-white shadow-sm">
                  {restaurant.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950 border border-sky-400/40 text-sky-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  공공데이터 실데이터
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h2
                id="detail-modal-title"
                className="text-xl sm:text-2xl font-black tracking-tight"
              >
                {restaurant.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-sky-200">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  기준 위치로부터 직선거리 {formatDistance(restaurant.distanceMeters)}
                </span>
                <span>·</span>
                <span className="text-slate-300">
                  {restaurant.originalId ? `공공원천 ID: ${restaurant.originalId}` : "인허가 업소"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 본문 스크롤 영역 */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
          {/* 공공데이터 안내 배너 */}
          {isPublicData && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-900">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>공공데이터포털 공식 API 연동 정보</span>
              </div>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                본 정보는 대한민국 공공데이터포털(
                {restaurant.dataOrigin === "public_data_sdsc"
                  ? "소상공인시장진흥공단_상가정보"
                  : "행정안전부_일반음식점"}
                )에서 실시간으로 제공된 데이터입니다. 공공 API 명세에 따라 별점, 리뷰, 음식 사진, 영업시간은 제공되지 않는 원본 인허가 정보입니다.
              </p>
            </div>
          )}

          {/* 1. 쿠폰 혜택 배너 (큐레이션 식당 쿠폰이 있는 경우만) */}
          {restaurant.coupon && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-slate-950 shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-950 text-[#00C4B4]">
                  DONGNAE COUPON
                </span>
                <p className="text-base font-black">{restaurant.coupon.discount}</p>
                <p className="text-xs text-amber-900 font-medium">
                  {restaurant.coupon.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCoupon && restaurant.coupon) {
                    onOpenCoupon(restaurant.coupon, restaurant.name);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs transition shadow-xs cursor-pointer shrink-0"
              >
                바코드 받기
              </button>
            </div>
          )}

          {/* 2. 소개 카드 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-black text-slate-900 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isPublicData ? "공공데이터 등록 개요" : "동내 에디터 한줄평 & 대표 메뉴"}</span>
            </p>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {restaurant.summary}
            </p>
          </div>

          {/* 3. 영업시간 & 위치 정보 */}
          <div className="space-y-2.5 text-xs text-slate-600 bg-white rounded-2xl p-4 border border-slate-200">
            {restaurant.openHours ? (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">영업 시간: </span>
                  <span>{restaurant.openHours}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700">영업 시간: </span>
                  <span>공공데이터 미제공 (업소 문의 필요)</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">도로명 주소: </span>
                <span>{restaurant.roadAddress}</span>
              </div>
            </div>

            {restaurant.jibunAddress && (
              <div className="flex items-start gap-2 text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700">지번 주소: </span>
                  <span>{restaurant.jibunAddress}</span>
                </div>
              </div>
            )}

            {restaurant.phone && (
              <div className="flex items-center gap-2 font-mono">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">전화번호: </span>
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              </div>
            )}

            {activeRestaurant?.businessStatus && (
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">🏛️</span>
                <div>
                  <span className="font-bold text-slate-800">영업 상태: </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      activeRestaurant.businessStatus.includes("영업") ||
                      activeRestaurant.businessStatus.includes("정상")
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {activeRestaurant.businessStatus} (공공데이터 인허가 제공)
                  </span>
                </div>
              </div>
            )}

            {activeRestaurant?.updatedAt && (
              <div className="flex items-center gap-2 text-slate-500">
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700">DB 갱신일시: </span>
                  <span className="font-mono text-[11px]">
                    {new Date(activeRestaurant.updatedAt).toLocaleString("ko-KR")} (Supabase)
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
              <span>위경도 좌표: {activeRestaurant?.lat?.toFixed(6)}, {activeRestaurant?.lng?.toFixed(6)}</span>
              {activeRestaurant?.originalId && <span>· 원본 ID: {activeRestaurant.originalId}</span>}
              {activeRestaurant?.dataOrigin && (
                <span>· 출처: {activeRestaurant.dataOrigin}</span>
              )}
            </div>
          </div>

          {/* 4. 카카오 지도 / 길찾기 버튼 바 */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={kakaoRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>카카오맵 길찾기</span>
            </a>
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span>카카오 지도 보기</span>
            </a>
          </div>

          {/* 5. 방문자 리뷰 및 직접 작성 폼 */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>방문자 리뷰 ({reviews.length})</span>
              </h3>
              {restaurant.rating !== undefined ? (
                <span className="text-[11px] text-slate-500">
                  실제 방문자 평점 ★ {restaurant.rating}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  공공데이터 원천 (기본 별점 없음)
                </span>
              )}
            </div>

            {/* 리뷰 작성 폼 */}
            <form onSubmit={handleAddReview} className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="작성자 닉네임 (선택)"
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs w-1/2 focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                  <span>별점:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          star <= newRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="직접 방문하신 경험이나 팁을 남겨주세요."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!reviewComment.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs disabled:opacity-40 hover:bg-slate-800 transition cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>등록</span>
                </button>
              </div>
            </form>

            {/* 리뷰 목록 */}
            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">
                  {isPublicData
                    ? "공공데이터 포털에서 등록된 업소입니다. 첫 번째 방문자 리뷰를 작성해 보세요!"
                    : "아직 등록된 리뷰가 없습니다."}
                </p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-white border border-slate-100 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {rev.author}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {rev.createdAt}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
