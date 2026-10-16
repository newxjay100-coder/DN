import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

/**
 * [외부 링크 및 지도 길찾기 안전 실행 헬퍼]
 * - 모바일 앱(Capacitor) 환경: @capacitor/browser를 사용하여 인앱 브라우저로 안전하게 띄웁니다.
 *   (웹뷰가 외부 페이지로 덮어씌워져 앱을 벗어나는 현상 방지)
 * - 웹 브라우저 환경: window.open(..., '_blank', 'noopener,noreferrer')로 새 탭 실행합니다.
 */

export async function openExternalUrl(url: string): Promise<void> {
  if (!url) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({
        url,
        windowName: "_blank",
        presentationStyle: "popover",
        toolbarColor: "#00C4B4",
      });
      return;
    } catch (err) {
      console.warn("Capacitor Browser 열기 실패, 브라우저 대체:", err);
    }
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * 카카오맵 길찾기 링크 실행
 */
export async function openKakaoRoute(params: {
  name: string;
  lat: number;
  lng: number;
}): Promise<void> {
  const encodedName = encodeURIComponent(params.name);
  const webUrl = `https://map.kakao.com/link/to/${encodedName},${params.lat},${params.lng}`;
  await openExternalUrl(webUrl);
}

/**
 * 네이버 지도 길찾기 링크 실행 (멀티 지도 지원)
 */
export async function openNaverRoute(params: {
  name: string;
  lat: number;
  lng: number;
}): Promise<void> {
  const encodedName = encodeURIComponent(params.name);
  const webUrl = `https://map.naver.com/v5/directions/-/-/${params.lng},${params.lat},${encodedName}/-/transit`;
  await openExternalUrl(webUrl);
}

/**
 * 카카오맵 장소 검색/상세 링크 실행
 */
export async function openKakaoPlace(params: {
  name: string;
  lat: number;
  lng: number;
}): Promise<void> {
  const encodedName = encodeURIComponent(params.name);
  const webUrl = `https://map.kakao.com/link/map/${encodedName},${params.lat},${params.lng}`;
  await openExternalUrl(webUrl);
}
