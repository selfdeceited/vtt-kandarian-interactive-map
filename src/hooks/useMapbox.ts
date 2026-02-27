import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { RefObject } from "react";
import type { MapConfig } from "@/types/map";
import { imageLink } from "@/lib/imageLink";

export function useMapbox(
  containerRef: RefObject<HTMLDivElement | null>,
  config: MapConfig,
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = config.accessToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("kandarian-map", {
        type: "image",
        url: imageLink,
        // Coordinates calculated to match image aspect ratio (6000x4000, 3:2)
        // Lat span: 8.501°, Lon span corrected for Mercator at ~42°N: 8.501 * 1.5 / cos(42°) ≈ 17.15°
        coordinates: [
          [-84.545, 46.437], // Top Left
          [-67.395, 46.437], // Top Right
          [-67.395, 37.936], // Bottom Right
          [-84.545, 37.936], // Bottom Left
        ],
      });

      map.addLayer({
        id: "kandarian-map-layer",
        type: "raster",
        source: "kandarian-map",
        paint: {
          "raster-opacity": 0.85,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Map initializes once; config changes applied imperatively via mapRef

  return mapRef;
}
