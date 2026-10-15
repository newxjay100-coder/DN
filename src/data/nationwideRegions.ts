/**
 * 전국 (서울·경기·인천 및 5대 광역시, 세종, 강원, 충청, 전라, 경상, 제주)
 * 전지역 주요 시·군·구 및 핫플레이스 동네 데이터셋
 * - 동내 검색창에서 엔터 시 전국 모든 지역 자동 인식 및 좌표 매핑 지원
 */

export interface NationwideRegion {
  id: string;
  province: string; // 예: "서울특별시", "부산광역시", "제주특별자치도", "강원특별자치도"
  cityName: string; // 예: "해운대구", "수성구", "유성구", "강릉시", "제주시"
  dongName: string; // 예: "우동", "범어동", "봉명동", "초당동", "연동"
  fullName: string; // 예: "부산광역시 해운대구 우동 (해운대·센텀시티)"
  keywords: string[]; // 검색 키워드 목록
  lat: number;
  lng: number;
  description: string;
}

export const NATIONWIDE_REGIONS: NationwideRegion[] = [
  // ====================================================
  // 1. [서울특별시] 대표 핵심 지역 (기존 포함)
  // ====================================================
  {
    id: "seoul-mapo-yeonnam",
    province: "서울특별시",
    cityName: "마포구",
    dongName: "연남동",
    fullName: "서울특별시 마포구 연남동 (경의선숲길)",
    keywords: ["연남동", "마포구", "경의선숲길", "홍대입구", "연트럴파크", "동교로"],
    lat: 37.5625,
    lng: 126.9245,
    description: "경의선숲길·동교로 감성 미식 거리",
  },
  {
    id: "seoul-mapo-seogyo",
    province: "서울특별시",
    cityName: "마포구",
    dongName: "서교동",
    fullName: "서울특별시 마포구 서교동 (홍대)",
    keywords: ["서교동", "홍대", "홍대입구", "어울마당로", "와우산로"],
    lat: 37.5545,
    lng: 126.921,
    description: "홍대 어울마당로·서교동 사거리 맛집",
  },
  {
    id: "seoul-mapo-mangwon",
    province: "서울특별시",
    cityName: "마포구",
    dongName: "망원동",
    fullName: "서울특별시 마포구 망원동 (망리단길)",
    keywords: ["망원동", "망원시장", "망리단길", "망원역", "포은로"],
    lat: 37.556,
    lng: 126.906,
    description: "망원시장·포은로 망리단길 로컬 맛집",
  },
  {
    id: "seoul-gangnam-yeoksam",
    province: "서울특별시",
    cityName: "강남구",
    dongName: "역삼동",
    fullName: "서울특별시 강남구 역삼동 (강남역·테헤란로)",
    keywords: ["역삼동", "강남역", "강남구", "테헤란로", "센터필드"],
    lat: 37.5006,
    lng: 127.0365,
    description: "강남역·테헤란로 중심 직장인 및 핫플레이스 상권",
  },
  {
    id: "seoul-gangnam-sinsa",
    province: "서울특별시",
    cityName: "강남구",
    dongName: "신사동",
    fullName: "서울특별시 강남구 신사동 (가로수길·압구정)",
    keywords: ["신사동", "가로수길", "압구정", "압구정로데오", "도산공원"],
    lat: 37.5204,
    lng: 127.0225,
    description: "가로수길·도산공원 트렌디 다이닝",
  },
  {
    id: "seoul-seongdong-seongsu",
    province: "서울특별시",
    cityName: "성동구",
    dongName: "성수동",
    fullName: "서울특별시 성동구 성수동 (성수카페거리·연무장길)",
    keywords: ["성수동", "성수역", "연무장길", "서울숲", "성동구", "뚝섬"],
    lat: 37.5445,
    lng: 127.0559,
    description: "성수역·연무장길 팝업스토어 및 감성 카페거리",
  },
  {
    id: "seoul-songpa-jamsil",
    province: "서울특별시",
    cityName: "송파구",
    dongName: "잠실동",
    fullName: "서울특별시 송파구 잠실동 (송리단길·석촌호수)",
    keywords: ["잠실동", "송리단길", "석촌호수", "잠실역", "송파구", "방이동"],
    lat: 37.5132,
    lng: 127.1001,
    description: "석촌호수 뷰 브런치와 송리단길 디저트 카페",
  },
  {
    id: "seoul-jung-euljiro",
    province: "서울특별시",
    cityName: "중구",
    dongName: "을지로동",
    fullName: "서울특별시 중구 을지로동 (힙지로·명동)",
    keywords: ["을지로", "힙지로", "명동", "을지로3가", "중구", "을지로입구"],
    lat: 37.5662,
    lng: 126.9925,
    description: "힙지로 감성 골목과 명동 노포 백년가게",
  },
  {
    id: "seoul-jongno-ikseon",
    province: "서울특별시",
    cityName: "종로구",
    dongName: "익선동",
    fullName: "서울특별시 종로구 익선동 (익선동한옥마을·인사동)",
    keywords: ["익선동", "종로3가", "인사동", "삼청동", "안국동", "북촌"],
    lat: 37.5742,
    lng: 126.9897,
    description: "고즈넉한 한옥거리와 퓨전 한식 맛집",
  },
  {
    id: "seoul-yeongdeungpo-yeouido",
    province: "서울특별시",
    cityName: "영등포구",
    dongName: "여의도동",
    fullName: "서울특별시 영등포구 여의도동 (더현대서울·IFC몰)",
    keywords: ["여의도동", "여의도", "더현대서울", "IFC몰", "영등포구", "국회의사당"],
    lat: 37.5216,
    lng: 126.9242,
    description: "더현대 서울 지하 고메이와 여의도 금융가 맛집",
  },
  {
    id: "seoul-yongsan-itaewon",
    province: "서울특별시",
    cityName: "용산구",
    dongName: "이태원동",
    fullName: "서울특별시 용산구 이태원동 (경리단길·해방촌·한남동)",
    keywords: ["이태원동", "이태원", "경리단길", "해방촌", "한남동", "용산구", "용리단길"],
    lat: 37.5345,
    lng: 126.9946,
    description: "이국적인 세계 음식거리와 용리단길 핫플레이스",
  },

  // ====================================================
  // 2. [경기도] 대표 핵심 지역
  // ====================================================
  {
    id: "gyeonggi-seongnam-pangyo",
    province: "경기도",
    cityName: "성남시 분당구",
    dongName: "삼평동",
    fullName: "경기도 성남시 분당구 삼평동 (판교테크노밸리·판교역)",
    keywords: ["판교", "삼평동", "백현동", "판교역", "아브뉴프랑", "분당"],
    lat: 37.3948,
    lng: 127.1114,
    description: "판교 아브뉴프랑과 현대백화점 프리미엄 미식존",
  },
  {
    id: "gyeonggi-seongnam-jeongja",
    province: "경기도",
    cityName: "성남시 분당구",
    dongName: "정자동",
    fullName: "경기도 성남시 분당구 정자동 (정자동카페거리)",
    keywords: ["정자동", "정자역", "카페거리", "분당", "성남시"],
    lat: 37.3674,
    lng: 127.1082,
    description: "유럽풍 테라스 카페거리와 화덕피자 맛집",
  },
  {
    id: "gyeonggi-suwon-haenggung",
    province: "경기도",
    cityName: "수원시 팔달구",
    dongName: "행궁동",
    fullName: "경기도 수원시 팔달구 행궁동 (화성행궁·행리단길)",
    keywords: ["행궁동", "행리단길", "화성행궁", "수원", "수원화성", "방화수류정"],
    lat: 37.2848,
    lng: 127.0142,
    description: "수원 화성행궁 성곽길을 따라 조성된 감성 행리단길",
  },
  {
    id: "gyeonggi-suwon-gwanggyo",
    province: "경기도",
    cityName: "수원시 영통구",
    dongName: "이의동",
    fullName: "경기도 수원시 영통구 이의동 (광교호수공원·앨리웨이)",
    keywords: ["광교", "이의동", "광교호수공원", "앨리웨이", "광교중앙역"],
    lat: 37.2884,
    lng: 127.0518,
    description: "광교 호수공원 뷰 다이닝과 앨리웨이 맛집거리",
  },
  {
    id: "gyeonggi-goyang-ilsan",
    province: "경기도",
    cityName: "고양시 일산동구",
    dongName: "장항동",
    fullName: "경기도 고양시 일산동구 장항동 (일산호수공원·웨스턴돔)",
    keywords: ["일산", "장항동", "호수공원", "웨스턴돔", "라페스타", "밤리단길"],
    lat: 37.6584,
    lng: 126.7712,
    description: "일산 호수공원과 밤리단길 감성 보닛길 맛집",
  },
  {
    id: "gyeonggi-bucheon-simgok",
    province: "경기도",
    cityName: "부천시",
    dongName: "심곡동",
    fullName: "경기도 부천시 원미구 심곡동 (부천역·부천로데오)",
    keywords: ["부천", "심곡동", "부천역", "부천로데오", "심곡천", "중동"],
    lat: 37.4841,
    lng: 126.7828,
    description: "부천역 로데오거리와 심곡천 산책로 맛집",
  },

  // ====================================================
  // 3. [인천광역시] 대표 핵심 지역
  // ====================================================
  {
    id: "incheon-yeonsu-songdo",
    province: "인천광역시",
    cityName: "연수구",
    dongName: "송도동",
    fullName: "인천광역시 연수구 송도동 (송도센트럴파크·트리플스트리트)",
    keywords: ["송도", "송도동", "센트럴파크", "트리플스트리트", "송도국제도시", "송현아"],
    lat: 37.3916,
    lng: 126.6508,
    description: "이국적인 센트럴파크 수변 뷰와 세계 미식거리",
  },
  {
    id: "incheon-bupyeong-bupyeong",
    province: "인천광역시",
    cityName: "부평구",
    dongName: "부평동",
    fullName: "인천광역시 부평구 부평동 (부평문화의거리·평리단길)",
    keywords: ["부평", "부평동", "평리단길", "문화의거리", "부평역", "부평시장"],
    lat: 37.4912,
    lng: 126.7238,
    description: "인천 최대의 번화가, 평리단길 카페와 야시장 먹거리",
  },
  {
    id: "incheon-jung-chinatown",
    province: "인천광역시",
    cityName: "중구",
    dongName: "북성동",
    fullName: "인천광역시 중구 북성동 (인천차이나타운·개항장거리)",
    keywords: ["차이나타운", "북성동", "신포동", "월미도", "개항장", "신포국제시장"],
    lat: 37.4752,
    lng: 126.6186,
    description: "원조 자장면 발상지 차이나타운과 신포 닭강정",
  },
  {
    id: "incheon-namdong-guwol",
    province: "인천광역시",
    cityName: "남동구",
    dongName: "구월동",
    fullName: "인천광역시 남동구 구월동 (구월동로데오거리·인천시청)",
    keywords: ["구월동", "로데오거리", "예술회관역", "인천시청", "인천터미널"],
    lat: 37.4447,
    lng: 126.7025,
    description: "인천 구월동 핵심 로데오 먹자골목과 회식 성지",
  },

  // ====================================================
  // 4. [부산광역시] 대표 핵심 지역 (해운대·광안리·서면·남포동)
  // ====================================================
  {
    id: "busan-haeundae-udong",
    province: "부산광역시",
    cityName: "해운대구",
    dongName: "우동",
    fullName: "부산광역시 해운대구 우동 (마린시티·센텀시티)",
    keywords: ["해운대", "우동", "마린시티", "센텀시티", "벡스코", "더베이101"],
    lat: 35.1587,
    lng: 129.1604,
    description: "해운대 해변과 마린시티 마천루 오션뷰 파인다이닝",
  },
  {
    id: "busan-haeundae-jungdong",
    province: "부산광역시",
    cityName: "해운대구",
    dongName: "중동",
    fullName: "부산광역시 해운대구 중동 (해운대해수욕장·미포·달맞이길)",
    keywords: ["해운대해수욕장", "중동", "달맞이길", "미포", "엘시티", "해운대암소갈비"],
    lat: 35.1631,
    lng: 129.1735,
    description: "달맞이길 낭만 카페거리와 전통 해운대 암소갈비, 활어회",
  },
  {
    id: "busan-suyeong-gwangalli",
    province: "부산광역시",
    cityName: "수영구",
    dongName: "민락동",
    fullName: "부산광역시 수영구 민락동 (광안리해수욕장·민락수변공원)",
    keywords: ["광안리", "민락동", "광안대교", "민락수변공원", "수영구", "남천동"],
    lat: 35.1532,
    lng: 129.1189,
    description: "광안대교 오션뷰 야경을 바라보며 즐기는 활어회와 펍",
  },
  {
    id: "busan-busanjin-seomyeon",
    province: "부산광역시",
    cityName: "부산진구",
    dongName: "부전동",
    fullName: "부산광역시 부산진구 부전동 (서면1번가·전포카페거리)",
    keywords: ["서면", "부전동", "전포동", "전포카페거리", "서면역", "부산진구"],
    lat: 35.1578,
    lng: 129.0593,
    description: "부산 최대의 번화가 서면과 아기자기한 전포 감성 카페거리",
  },
  {
    id: "busan-jung-nampo",
    province: "부산광역시",
    cityName: "중구",
    dongName: "남포동",
    fullName: "부산광역시 중구 남포동 (자갈치시장·BIFF거리)",
    keywords: ["남포동", "자갈치시장", "국제시장", "BIFF광장", "광복동", "영도"],
    lat: 35.0979,
    lng: 129.0305,
    description: "생생한 자갈치시장 활어회와 남포동 씨앗호떡, 비빔당면",
  },

  // ====================================================
  // 5. [대구광역시] 대표 핵심 지역 (동성로·수성못·안지랑)
  // ====================================================
  {
    id: "daegu-jung-dongseongno",
    province: "대구광역시",
    cityName: "중구",
    dongName: "동성로",
    fullName: "대구광역시 중구 동성로 (동성로로데오·반월당)",
    keywords: ["동성로", "중구", "반월당", "중앙로", "교동", "삼덕동"],
    lat: 35.8687,
    lng: 128.5962,
    description: "대구 최고의 젊음의 거리, 뭉티기 생고기와 매운 찜갈비",
  },
  {
    id: "daegu-suseong-suseongmot",
    province: "대구광역시",
    cityName: "수성구",
    dongName: "두산동",
    fullName: "대구광역시 수성구 두산동 (수성못·들안길먹거리타운)",
    keywords: ["수성못", "두산동", "들안길", "들안길먹거리타운", "수성구", "범어동"],
    lat: 35.8278,
    lng: 128.6186,
    description: "수성못 수변 레이크뷰 카페와 들안길 숯불갈비 전문점",
  },
  {
    id: "daegu-nam-anjirang",
    province: "대구광역시",
    cityName: "남구",
    dongName: "대명동",
    fullName: "대구광역시 남구 대명동 (안지랑곱창골목·앞산카페거리)",
    keywords: ["안지랑", "안지랑곱창", "대명동", "앞산", "앞산카페거리", "남구"],
    lat: 35.8365,
    lng: 128.5779,
    description: "불맛 가득한 안지랑 곱창골목과 앞산 전망 카페거리",
  },

  // ====================================================
  // 6. [대전광역시] 대표 핵심 지역 (둔산동·유성온천·은행동 성심당)
  // ====================================================
  {
    id: "daejeon-seo-dunsan",
    province: "대전광역시",
    cityName: "서구",
    dongName: "둔산동",
    fullName: "대전광역시 서구 둔산동 (갤러리아타임월드·시청)",
    keywords: ["둔산동", "서구", "갤러리아타임월드", "탄방동", "대전시청"],
    lat: 36.3537,
    lng: 127.3789,
    description: "대전 정부청사 중심 행정·상업 중심가와 트렌디 레스토랑",
  },
  {
    id: "daejeon-yuseong-bongmyeong",
    province: "대전광역시",
    cityName: "유성구",
    dongName: "봉명동",
    fullName: "대전광역시 유성구 봉명동 (유성온천·충남대)",
    keywords: ["유성", "유성온천", "봉명동", "궁동", "충남대", "카이스트"],
    lat: 36.3562,
    lng: 127.3438,
    description: "따뜻한 유성온천 야외 족욕장과 궁동 대학로 가성비 먹거리",
  },
  {
    id: "daejeon-jung-eunhaeng",
    province: "대전광역시",
    cityName: "중구",
    dongName: "은행동",
    fullName: "대전광역시 중구 은행동 (성심당본점·으능정이거리)",
    keywords: ["성심당", "은행동", "으능정이거리", "대전역", "중구", "대흥동"],
    lat: 36.3276,
    lng: 127.4273,
    description: "전국구 빵지순례 1위 성심당 본점과 으능정이 문화의거리",
  },

  // ====================================================
  // 7. [광주광역시] 대표 핵심 지역 (상무지구·충장로·동명동)
  // ====================================================
  {
    id: "gwangju-seo-sangmu",
    province: "광주광역시",
    cityName: "서구",
    dongName: "치평동",
    fullName: "광주광역시 서구 치평동 (상무지구·광주시청)",
    keywords: ["상무지구", "치평동", "서구", "광주시청", "유스퀘어", "풍암동"],
    lat: 35.1534,
    lng: 126.8524,
    description: "광주 최대 비즈니스 번화가, 남도 한정식과 두툼한 떡갈비",
  },
  {
    id: "gwangju-dong-dongmyeong",
    province: "광주광역시",
    cityName: "동구",
    dongName: "동명동",
    fullName: "광주광역시 동구 동명동 (동리단길·국립아시아문화전당)",
    keywords: ["동명동", "동리단길", "충장로", "국립아시아문화전당", "동구", "금남로"],
    lat: 35.1485,
    lng: 126.9248,
    description: "주택 개조 감성 카페와 브런치, 예술이 숨쉬는 동리단길",
  },

  // ====================================================
  // 8. [제주특별자치도] 대표 핵심 지역 (제주시·서귀포·애월·중문)
  // ====================================================
  {
    id: "jeju-jeju-yeon",
    province: "제주특별자치도",
    cityName: "제주시",
    dongName: "연동",
    fullName: "제주특별자치도 제주시 연동 (누웨마루거리·신제주)",
    keywords: ["제주시", "연동", "누웨마루", "노형동", "신제주", "제주공항"],
    lat: 33.4890,
    lng: 126.4912,
    description: "제주 공항 인근 흑돼지 숯불구이와 고기국수 대표 맛집거리",
  },
  {
    id: "jeju-aewol",
    province: "제주특별자치도",
    cityName: "제주시",
    dongName: "애월읍",
    fullName: "제주특별자치도 제주시 애월읍 (한담해변·애월카페거리)",
    keywords: ["애월", "애월읍", "한담해변", "애월카페거리", "곽지해수욕장"],
    lat: 33.4624,
    lng: 126.3108,
    description: "에메랄드빛 한담 해안 산책로와 해녀 해물라면, 오션뷰 카페",
  },
  {
    id: "jeju-seogwipo-jungmun",
    province: "제주특별자치도",
    cityName: "서귀포시",
    dongName: "중문동",
    fullName: "제주특별자치도 서귀포시 중문동 (중문관광단지·올레시장인근)",
    keywords: ["서귀포", "중문", "중문관광단지", "올레시장", "서귀동", "성산"],
    lat: 33.2482,
    lng: 126.4258,
    description: "서귀포 올레시장 딱새우회·모닥치기와 중문 통갈치조림",
  },

  // ====================================================
  // 9. [강원특별자치도] 대표 핵심 지역 (강릉·속초·춘천)
  // ====================================================
  {
    id: "gangwon-gangneung-chodang",
    province: "강원특별자치도",
    cityName: "강릉시",
    dongName: "초당동",
    fullName: "강원특별자치도 강릉시 초당동 (초당순두부마을·안목커피거리)",
    keywords: ["강릉", "초당동", "초당순두부", "안목해변", "강릉커피거리", "교동짬뽕"],
    lat: 37.7915,
    lng: 128.9158,
    description: "바닷물 간수로 빚은 원조 초당순두부와 안목해변 커피거리",
  },
  {
    id: "gangwon-sokcho-jungang",
    province: "강원특별자치도",
    cityName: "속초시",
    dongName: "중앙동",
    fullName: "강원특별자치도 속초시 중앙동 (속초관광수산시장·아바이마을)",
    keywords: ["속초", "속초시장", "아바이마을", "대포항", "만석닭강정", "오징어순대"],
    lat: 38.2045,
    lng: 128.5912,
    description: "만석닭강정과 오징어순대, 갯배 타고 건너는 아바이순대 골목",
  },
  {
    id: "gangwon-chuncheon-myeongdong",
    province: "강원특별자치도",
    cityName: "춘천시",
    dongName: "조운동",
    fullName: "강원특별자치도 춘천시 조운동 (춘천명동닭갈비골목)",
    keywords: ["춘천", "명동닭갈비", "춘천명동", "남춘천", "구봉산", "소양강"],
    lat: 37.8812,
    lng: 127.7289,
    description: "원조 무쇠판 철판 닭갈비 골목과 구봉산 전망대 카페거리",
  },

  // ====================================================
  // 10. [전북·전남] 대표 핵심 지역 (전주·여수)
  // ====================================================
  {
    id: "jeonbuk-jeonju-hanok",
    province: "전북특별자치도",
    cityName: "전주시 완산구",
    dongName: "풍남동",
    fullName: "전북특별자치도 전주시 완산구 풍남동 (전주한옥마을·객리단길)",
    keywords: ["전주", "전주한옥마을", "객리단길", "풍남동", "교동", "전주비빔밥"],
    lat: 35.8147,
    lng: 127.1526,
    description: "전통 전주비빔밥, 콩나물국밥 노포와 객리단길 핫플레이스",
  },
  {
    id: "jeonnam-yeosu-jonghwa",
    province: "전라남도",
    cityName: "여수시",
    dongName: "종화동",
    fullName: "전라남도 여수시 종화동 (여수해양공원·낭만포차거리)",
    keywords: ["여수", "여수밤바다", "낭만포차", "종화동", "돌산", "여수게장"],
    lat: 34.7395,
    lng: 127.7448,
    description: "여수 밤바다를 수놓는 해물삼합 낭만포차와 돌산 돌게장 골목",
  },

  // ====================================================
  // 11. [경북·경남] 대표 핵심 지역 (경주·포항·창원)
  // ====================================================
  {
    id: "gyeongbuk-gyeongju-hwangnam",
    province: "경상북도",
    cityName: "경주시",
    dongName: "황남동",
    fullName: "경상북도 경주시 황남동 (황리단길·대릉원)",
    keywords: ["경주", "황리단길", "황남동", "대릉원", "첨성대", "보문단지"],
    lat: 35.8361,
    lng: 129.2084,
    description: "고분 능선 사이로 이어지는 감성 한옥 브런치와 십원빵",
  },
  {
    id: "gyeongbuk-pohang-yeongildae",
    province: "경상북도",
    cityName: "포항시 북구",
    dongName: "두호동",
    fullName: "경상북도 포항시 북구 두호동 (영일대해수욕장·죽도시장)",
    keywords: ["포항", "영일대", "두호동", "죽도시장", "포항물회", "호미곶"],
    lat: 36.0562,
    lng: 129.3789,
    description: "동해 바다의 시원한 전통 고추장 물회와 죽도시장 대게거리",
  },
  {
    id: "gyeongnam-changwon-sangnam",
    province: "경상남도",
    cityName: "창원시 성산구",
    dongName: "상남동",
    fullName: "경상남도 창원시 성산구 상남동 (상남상업지구)",
    keywords: ["창원", "상남동", "성산구", "창원가로수길", "용호동", "마산"],
    lat: 35.2212,
    lng: 128.6835,
    description: "창원 최대 상업지구의 활기찬 먹거리와 메타세콰이어 가로수길",
  },
];

/**
 * 키워드 또는 주소로 전국 동네/지역 검색
 */
export function findNationwideRegion(rawQuery: string): NationwideRegion | null {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return null;

  // 1) 정확 매칭
  const exact = NATIONWIDE_REGIONS.find(
    (r) =>
      r.dongName.toLowerCase() === q ||
      r.cityName.toLowerCase() === q ||
      r.keywords.some((k) => k.toLowerCase() === q)
  );
  if (exact) return exact;

  // 2) 부분 포함 매칭
  return (
    NATIONWIDE_REGIONS.find(
      (r) =>
        r.dongName.toLowerCase().includes(q) ||
        q.includes(r.dongName.toLowerCase()) ||
        r.cityName.toLowerCase().includes(q) ||
        q.includes(r.cityName.toLowerCase()) ||
        r.keywords.some(
          (k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())
        )
    ) ?? null
  );
}
