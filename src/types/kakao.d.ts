export {};

declare global {
  interface Window {
    kakao?: {
      maps: typeof kakao.maps;
    };
  }

  namespace kakao.maps {
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
      isEmpty(): boolean;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class MarkerImage {
      constructor(
        src: string,
        size: Size,
        options?: {
          offset?: Point;
          alt?: string;
        }
      );
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      getCenter(): LatLng;
      setCenter(latlng: LatLng): void;
      panTo(latlng: LatLng): void;
      setLevel(level: number, options?: { animate?: boolean }): void;
      getLevel(): number;
      setBounds(bounds: LatLngBounds): void;
      relayout(): void;
    }

    interface MarkerOptions {
      map?: Map | null;
      position: LatLng;
      title?: string;
      image?: MarkerImage;
      zIndex?: number;
      clickable?: boolean;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setPosition(position: LatLng): void;
      setZIndex(zIndex: number): void;
      setImage(image: MarkerImage): void;
    }

    interface CustomOverlayOptions {
      map?: Map | null;
      position: LatLng;
      content: HTMLElement | string;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setPosition(position: LatLng): void;
      setContent(content: HTMLElement | string): void;
      setZIndex(zIndex: number): void;
    }

    interface CircleOptions {
      map?: Map | null;
      center: LatLng;
      radius: number;
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: "solid" | "shortdash" | "dashed" | "dot";
      fillColor?: string;
      fillOpacity?: number;
      zIndex?: number;
    }

    class Circle {
      constructor(options: CircleOptions);
      setMap(map: Map | null): void;
      setPosition(position: LatLng): void;
      setRadius(radius: number): void;
    }

    namespace event {
      function addListener(
        target: unknown,
        type: string,
        handler: () => void
      ): void;
      function removeListener(
        target: unknown,
        type: string,
        handler: () => void
      ): void;
    }

    namespace services {
      enum Status {
        OK = "OK",
        ZERO_RESULT = "ZERO_RESULT",
        ERROR = "ERROR",
      }

      class Geocoder {
        addressSearch(
          address: string,
          callback: (result: any[], status: Status) => void
        ): void;
        coord2RegionCode(
          x: number,
          y: number,
          callback: (result: any[], status: Status) => void
        ): void;
        coord2Address(
          x: number,
          y: number,
          callback: (result: any[], status: Status) => void
        ): void;
      }

      class Places {
        keywordSearch(
          keyword: string,
          callback: (result: any[], status: Status) => void
        ): void;
      }
    }
  }
}
