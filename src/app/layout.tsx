import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "동내 (DONGNAE) - 전국 우리 동네 & 역세권 맛집 지도",
  description:
    "Delicious Life! 서울·경기·인천 및 전국 전역 우리 동네 맛집, 지하철 역세권 맛집 및 공공데이터 실시간 상가 인허가 정보 탐색",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#00C4B4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY || "";

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        {kakaoKey && (
          <Script
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
              kakaoKey
            )}&autoload=false&libraries=services,clusterer`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="min-h-screen antialiased flex flex-col">{children}</body>
    </html>
  );
}
