import { SUBWAY_STATIONS } from "@/data/subwayStations";
import {
  findNationwideRegion,
  NATIONWIDE_REGIONS,
} from "@/data/nationwideRegions";
import { SEOUL_GYEONGGI_REGIONS } from "@/data/seoulGyeonggiRegions";
import { calculateDistanceMeters } from "./distance";

export interface ResolvedLocation {
  title: string;
  fullName: string;
  lat: number;
  lng: number;
  description: string;
}

/**
 * 카카오 지도 Geocoder / Places 서비스를 활용한 전국 장소 및 주소 실시간 검색
 * - 브라우저에 카카오 지도 SDK가 로드된 경우 전국의 모든 동/읍/면/번지/상호명 지오코딩 지원
 * - 미지원 시 전국 동네 데이터셋(NATIONWIDE_REGIONS) 및 지하철역 데이터셋 fallback 매핑
 */
export async function resolveKakaoLocation(
  rawQuery: string
): Promise<ResolvedLocation | null> {
  const query = rawQuery.trim();
  if (!query) return null;

  // 1) 지하철역 우선 매칭 (예: "홍대입구역", "강남역", "서면역", "판교역", "동대구역")
  const cleanStation = query.replace(/역$/, "");
  const matchedStation = SUBWAY_STATIONS.find(
    (st) =>
      st.name === query ||
      st.shortName === query ||
      st.name === cleanStation ||
      st.shortName === cleanStation ||
      st.name.includes(cleanStation) ||
      cleanStation.includes(st.shortName)
  );

  if (matchedStation) {
    return {
      title: `${matchedStation.name} (${matchedStation.primaryLine})`,
      fullName: `${matchedStation.cityDistrict} ${matchedStation.name}`,
      lat: matchedStation.lat,
      lng: matchedStation.lng,
      description: `${matchedStation.primaryLine} [${matchedStation.section}] ${matchedStation.name} 역세권 맛집 탐색 · 핫플레이스: ${matchedStation.hotKeyword}`,
    };
  }

  // 2) 카카오 지도 JS SDK의 Geocoder & Places 실시간 검색 (브라우저 지원 시)
  if (
    typeof window !== "undefined" &&
    window.kakao &&
    window.kakao.maps &&
    window.kakao.maps.services
  ) {
    try {
      const result = await new Promise<ResolvedLocation | null>((resolve) => {
        window.kakao.maps.load(() => {
          const geocoder = new window.kakao.maps.services.Geocoder();
          const places = new window.kakao.maps.services.Places();

          // 2-A. 주소 검색(addressSearch) 먼저 시도 (예: "해운대구 우동", "제주시 연동")
          geocoder.addressSearch(query, (addrResults, addrStatus) => {
            if (
              addrStatus === window.kakao.maps.services.Status.OK &&
              addrResults &&
              addrResults.length > 0
            ) {
              const item = addrResults[0];
              const lat = parseFloat(item.y);
              const lng = parseFloat(item.x);
              const dong =
                item.address?.region_3depth_name ||
                item.address?.region_2depth_name ||
                item.address_name;

              resolve({
                title: dong,
                fullName: item.address_name,
                lat,
                lng,
                description: `카카오 지도 전국 주소 검색 결과 (${item.address_name})`,
              });
              return;
            }

            // 2-B. 장소/키워드 검색(keywordSearch) 시도 (예: "해운대", "광안리", "서면", "유성온천", "전주한옥마을")
            places.keywordSearch(query, (placeResults, placeStatus) => {
              if (
                placeStatus === window.kakao.maps.services.Status.OK &&
                placeResults &&
                placeResults.length > 0
              ) {
                const place = placeResults[0];
                const lat = parseFloat(place.y);
                const lng = parseFloat(place.x);

                resolve({
                  title: place.place_name,
                  fullName: place.road_address_name || place.address_name || place.place_name,
                  lat,
                  lng,
                  description: `카카오 전국 명소·상권 검색 결과 (${place.place_name})`,
                });
                return;
              }

              // 카카오 검색 실패 시 null 전달 -> fallback 데이터베이스 매칭
              resolve(null);
            });
          });
        });
      });

      if (result) {
        return result;
      }
    } catch {
      // 카카오 SDK 오류 시 fallback 진행
    }
  }

  // 3) 전국 동네 데이터베이스(NATIONWIDE_REGIONS) 매칭 (전국 17개 시도)
  const nationwideMatch = findNationwideRegion(query);
  if (nationwideMatch) {
    return {
      title: nationwideMatch.dongName,
      fullName: nationwideMatch.fullName,
      lat: nationwideMatch.lat,
      lng: nationwideMatch.lng,
      description: `${nationwideMatch.fullName} 중심 탐색 · ${nationwideMatch.description}`,
    };
  }

  // 4) 서울·경기 기존 데이터베이스 매칭
  const seoulGyeonggiMatch = SEOUL_GYEONGGI_REGIONS.find(
    (r) =>
      r.dongName.includes(query) ||
      query.includes(r.dongName) ||
      r.districtName.includes(query) ||
      r.keywords.some((k) => query.includes(k) || k.includes(query))
  );

  if (seoulGyeonggiMatch) {
    return {
      title: seoulGyeonggiMatch.dongName,
      fullName: seoulGyeonggiMatch.fullName,
      lat: seoulGyeonggiMatch.lat,
      lng: seoulGyeonggiMatch.lng,
      description: `${seoulGyeonggiMatch.fullName} 중심 기준 반경 거리 탐색`,
    };
  }

  return null;
}

/**
 * GPS 좌표(lat, lng)를 사람이 읽을 수 있는 실시간 한국 도로명/지번 주소로 변환 (역지오코딩)
 */
export async function reverseGeocodeRealCoords(
  lat: number,
  lng: number
): Promise<{ address: string; dongName: string }> {
  if (
    typeof window !== "undefined" &&
    window.kakao &&
    window.kakao.maps &&
    window.kakao.maps.services
  ) {
    try {
      const res = await new Promise<{ address: string; dongName: string } | null>(
        (resolve) => {
          window.kakao.maps.load(() => {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, (results, status) => {
              if (
                status === window.kakao.maps.services.Status.OK &&
                results &&
                results.length > 0
              ) {
                const item = results[0];
                const road = item.road_address?.address_name;
                const jibun = item.address?.address_name;
                const dong =
                  item.address?.region_3depth_name ||
                  item.address?.region_2depth_name ||
                  "내 주변";
                resolve({
                  address: road || jibun || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                  dongName: dong,
                });
              } else {
                resolve(null);
              }
            });
          });
        }
      );

      if (res) return res;
    } catch {
      // ignore
    }
  }

  // Fallback: 가장 가까운 전국 동네 이름 매칭
  let closest = NATIONWIDE_REGIONS[0];
  let minD = Infinity;
  for (const r of NATIONWIDE_REGIONS) {
    const d = calculateDistanceMeters(lat, lng, r.lat, r.lng);
    if (d < minD) {
      minD = d;
      closest = r;
    }
  }

  if (minD < 5000) {
    return {
      address: `${closest.fullName} 인근`,
      dongName: closest.dongName,
    };
  }

  return {
    address: `내 현재 GPS 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    dongName: "내 주변",
  };
}
