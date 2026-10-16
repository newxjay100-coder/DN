import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface GeolocationBridgeResult {
  success: boolean;
  coords?: {
    lat: number;
    lng: number;
  };
  errorReason?: "denied" | "timeout" | "unavailable" | "unsupported";
  message?: string;
}

/**
 * [웹/네이티브 통합 하이브리드 Geolocation 브리지]
 * - 모바일 네이티브 앱(iOS/Android) 환경: @capacitor/geolocation 플러그인을 사용하여
 *   OS 네이티브 권한 팝업을 직접 띄우고 고정밀 GPS 센서를 통해 위치를 수신합니다.
 * - 웹 브라우저 환경: 브라우저 표준 navigator.geolocation을 2단계(고정밀 -> 일반)로 조회합니다.
 * - 권한 거부 시: 사용자에게 친절한 안내와 함께 수동 동네 검색 모달로 안전하게 fallback합니다.
 */
export async function getHybridCurrentPosition(): Promise<GeolocationBridgeResult> {
  // 1. 모바일 앱 네이티브 환경 (iOS / Android)
  if (Capacitor.isNativePlatform()) {
    try {
      let perm = await Geolocation.checkPermissions();

      if (perm.location === "denied") {
        return {
          success: false,
          errorReason: "denied",
          message:
            "기기 위치 권한이 거부되어 있습니다. 스마트폰 설정 > 앱 권한에서 위치 서비스를 허용하시거나, 아래에서 동네를 직접 선택해 주세요.",
        };
      }

      if (perm.location === "prompt" || perm.location === "prompt-with-rationale") {
        perm = await Geolocation.requestPermissions();
        if (perm.location !== "granted") {
          return {
            success: false,
            errorReason: "denied",
            message:
              "위치 권한이 허용되지 않았습니다. 동네 이름을 검색하여 주변 맛집을 확인해 보세요.",
          };
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      });

      return {
        success: true,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };
    } catch (err: unknown) {
      console.warn("Capacitor 네이티브 위치 수신 실패:", err);
      return {
        success: false,
        errorReason: "unavailable",
        message: "현재 GPS 신호를 수신할 수 없습니다. 동네를 직접 선택해 주세요.",
      };
    }
  }

  // 2. 웹 브라우저 환경 (Desktop / Mobile Browser)
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return {
      success: false,
      errorReason: "unsupported",
      message: "현재 브라우저에서 위치 정보 기능을 지원하지 않습니다.",
    };
  }

  return new Promise((resolve) => {
    const tryWebLocate = (isHighAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          // 1차 고정밀 실패 시, 2차 일반 정밀도로 1회 자동 재시도
          if (
            isHighAccuracy &&
            (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)
          ) {
            tryWebLocate(false);
            return;
          }

          if (error.code === error.PERMISSION_DENIED) {
            resolve({
              success: false,
              errorReason: "denied",
              message:
                "브라우저 위치 권한이 거부되었습니다. 주소창 좌측 설정에서 위치를 허용하시거나 동네를 직접 선택해 주세요.",
            });
          } else if (error.code === error.TIMEOUT) {
            resolve({
              success: false,
              errorReason: "timeout",
              message: "위치 확인 요청 시간이 초과되었습니다. 다시 시도해 주세요.",
            });
          } else {
            resolve({
              success: false,
              errorReason: "unavailable",
              message: "기기에서 위치 정보를 확인할 수 없습니다. 동네를 직접 검색해 보세요.",
            });
          }
        },
        {
          enableHighAccuracy: isHighAccuracy,
          timeout: isHighAccuracy ? 7000 : 12000,
          maximumAge: 30000,
        }
      );
    };

    tryWebLocate(true);
  });
}
