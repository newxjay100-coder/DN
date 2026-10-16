"use client";

import { useEffect, useState } from "react";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { supabase } from "@/lib/supabaseClient";

interface UseNativeAppOptions {
  onBackPress?: () => boolean; // return true if the back action was consumed
  onDeepLink?: (url: string) => void;
}

export function useNativeApp(options: UseNativeAppOptions = {}) {
  const [isNative, setIsNative] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    // 1. 온라인 / 오프라인 상태 감지
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 2. 모바일 네이티브 초기화 (스플래시 화면 및 상태바)
      if (native) {
        // 스플래시 화면 부드럽게 숨김
        SplashScreen.hide().catch(() => {});

        // 상태바 스타일 설정 (라이트 테마에 맞는 다크 아이콘)
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: "#FFFFFF" }).catch(() => {});
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // 3. Android 하드웨어 뒤로가기 버튼 처리
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backListener: PluginListenerHandle | null = null;

    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      // 컴포넌트에서 모달 닫기 등으로 뒤로가기 이벤트를 소비했는지 확인
      const consumed = options.onBackPress ? options.onBackPress() : false;

      if (!consumed) {
        if (canGoBack) {
          window.history.back();
        } else {
          // 더 이상 뒤로 갈 화면이 없으면 앱 종료
          CapacitorApp.exitApp();
        }
      }
    })
      .then((handle) => {
        backListener = handle;
      })
      .catch(() => {});

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [options.onBackPress]);

  // 4. 딥링크 복귀 및 로그인 세션 복구 처리 (Supabase Auth Deep Link)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let urlListener: PluginListenerHandle | null = null;

    CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
      console.log("App opened with deep link URL:", url);

      if (options.onDeepLink) {
        options.onDeepLink(url);
      }

      // Supabase OAuth 로그인 후 앱 복귀 시 URL 해시 파싱하여 세션 저장
      if (url.includes("#access_token") || url.includes("code=")) {
        try {
          if (supabase) {
            const urlObj = new URL(url);
            const hash = urlObj.hash.substring(1);
            const params = new URLSearchParams(hash || urlObj.search);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              console.log("Supabase 세션이 딥링크로부터 성공적으로 복구되었습니다.");
            }
          }
        } catch (authErr) {
          console.warn("딥링크 세션 복구 실패:", authErr);
        }
      }
    })
      .then((handle) => {
        urlListener = handle;
      })
      .catch(() => {});

    return () => {
      if (urlListener) {
        urlListener.remove();
      }
    };
  }, [options.onDeepLink]);

  return {
    isNative,
    isOnline,
  };
}
