# 동내 (DONGNAE) - 전국 우리 동네 & 역세권 맛집 지도

> **Delicious Life!** 전국 우리 동네 골목 상권부터 수도권 전역 지하철 역세권까지, 실시간 기기 GPS 및 공공데이터포털 인허가 상가 실데이터를 기반으로 탐색하는 차세대 미식 지도 서비스입니다.

---

## 🌟 주요 핵심 기능

1. **실시간 기기 GPS 내 주변 탐색 ("내 주변 찾기")**:
   - Geolocation API + 카카오 지도 지오코더 역지오코딩 연동
   - 현재 서 있는 위치의 실제 도로명 및 법정동 주소 자동 산출
   - 반경(500m, 1km, 3km, 5km, 10km, 전체) 원클릭 거리순 맛집 탐색

2. **전국 모든 동네 & 지하철역 스마트 엔터(Enter) 검색**:
   - 검색창에 전국 동네(*연남동, 해운대, 서면, 둔산동, 동성로, 제주 연동 등*) 입력 후 **[엔터 ↵]** 시 즉시 전국 위치 인식 및 지도 이동
   - 수도권 및 전국 지하철 전 노선 역세권 1km 반경 맛집 탐색 지원

3. **공공데이터포털 실데이터 실시간 연동**:
   - 소상공인시장진흥공단_상가(상권)정보 API 실시간 수집 (최대 50건)
   - 원본 상가 ID, 상호명, 표준 카테고리, 도로명/지번 주소, 좌표 완벽 보존
   - 미제공 평점/리뷰/사진 임의 생성 배제 원칙 준수

4. **Supabase PostGIS 공간 데이터베이스**:
   - PostGIS `ST_DWithin`, `ST_Distance` 기반 실시간 반경 검색 및 직선거리 계산
   - 공공데이터 재수집 시 `(source, original_id)` 복합 유니크 키 기준 자동 갱신(Upsert)
   - RLS 정책 적용으로 브라우저 안전성 확보

5. **다이닝코드 무드 UI/UX**:
   - 다크 & 민트 시그니처 비주얼 디자인
   - 인터랙티브 카카오 맵 뷰 (커스텀 오버레이, 마커 클러스터링, 반경 원형 시각화)
   - 반응형 모바일 우선 UI

---

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4, Lucide React
- **Maps & Geocoding**: Kakao Maps JavaScript SDK (services, clusterer)
- **Database**: Supabase PostgreSQL + PostGIS Extension
- **Public API**: 공공데이터포털 (소상공인시장진흥공단 상가정보)

---

## 🔑 환경 변수 설정 (.env.local)

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 변수들을 설정합니다. (Vercel 배포 시에는 Vercel Project Settings > Environment Variables에 등록)

```env
# 1. 카카오 지도 JavaScript 앱 키 (카카오 개발자 콘솔에서 발급)
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_javascript_key

# 2. Supabase 데이터베이스 (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# 서버 전용 비밀키 (브라우저 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# 3. 공공데이터포털 API 설정 (일반 인증키 Decoding/Encoding)
DATA_GO_KR_SERVICE_KEY=your_data_go_kr_service_key
DATA_GO_KR_SDSC2_URL=https://apis.data.go.kr/B553077/api/open/sdsc2
DATA_GO_KR_GENERAL_RESTAURANTS_URL=https://apis.data.go.kr/1741000/general_restaurants
```

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 실행 (http://localhost:3000)
npm run dev

# 3. 타입 체크 및 프로덕션 빌드 검증
npx tsc --noEmit
npm run build
```

---

## 🌐 Vercel 원클릭 배포 가이드

1. **GitHub 저장소 연결**: Vercel에 본 저장소(`https://github.com/newxjay100-coder/DN.git`)를 Import합니다.
2. **Environment Variables 입력**: 위 **환경 변수 설정**에 기재된 5가지 환경변수를 등록합니다.
3. **카카오 개발자 사이트 도메인 등록**:
   - [Kakao Developers](https://developers.kakao.com) > 앱 설정 > 플랫폼 > Web
   - Vercel에서 발급된 배포 도메인(예: `https://dn-*.vercel.app`)을 사이트 도메인에 추가합니다.
4. **Deploy**: 즉시 전 세계 어디서나 모바일과 PC에서 서비스가 활성화됩니다.
