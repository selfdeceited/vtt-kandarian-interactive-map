import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { RefObject } from "react";
import type { MapDefinition } from "@/types/map";

export function useMapbox(
  containerRef: RefObject<HTMLDivElement | null>,
  accessToken: string,
  mapDef: MapDefinition,
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsMapReady(false);
    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      center: mapDef.center,
      zoom: mapDef.zoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }));

    mapRef.current = map;

    const sourceId = `${mapDef.id}-map`;
    const layerId = `${mapDef.id}-map-layer`;

    map.on("load", () => {
      map.addSource(sourceId, {
        type: "image",
        url: mapDef.imageUrl,
        coordinates: mapDef.imageCoordinates,
      });

      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
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
  }, [mapDef]); // Re-runs when the active map changes; containerRef and accessToken are stable

  return { mapRef, isMapReady };
}
