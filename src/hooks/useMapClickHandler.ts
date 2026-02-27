import { useEffect } from "react";
import type { RefObject } from "react";

interface UseMapClickHandlerOptions {
  mapRef: RefObject<mapboxgl.Map | null>;
  isEditMode: boolean;
  onMapClick: (coordinates: [number, number]) => void;
}

export function useMapClickHandler({
  mapRef,
  isEditMode,
  onMapClick,
}: UseMapClickHandlerOptions): void {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isEditMode) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      onMapClick([lng, lat]);
    };

    map.on("click", handleClick);
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      map.getCanvas().style.cursor = "";
    };
  }, [isEditMode, mapRef, onMapClick]);
}
