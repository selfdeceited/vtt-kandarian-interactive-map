import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { RefObject } from "react";
import type { MapConfig } from "@/types/map";
import { imageLink } from "@/lib/imageLink";

export function useMapbox(
  containerRef: RefObject<HTMLDivElement | null>,
  config: MapConfig,
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }));

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("kandarian-map", {
        type: "image",
        url: imageLink,
        // Coordinates calculated to match image aspect ratio (6000x4000, 3:2)
        // Lat span: 2.125°, Lon span corrected for Mercator at ~42°N: 2.125 * 1.5 / cos(42°) ≈ 4.289°
        coordinates: [
          [-78.114, 43.249], // Top Left
          [-73.826, 43.249], // Top Right
          [-73.826, 41.124], // Bottom Right
          [-78.114, 41.124], // Bottom Left
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

    map.once("idle", () => setIsMapReady(true));

    return () => {
      map.remove();
      mapRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Map initializes once; config changes applied imperatively via mapRef

  return { mapRef, isMapReady };
}
