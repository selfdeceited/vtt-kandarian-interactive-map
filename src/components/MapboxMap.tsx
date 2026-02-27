import { useRef } from "react";
import { useMapbox } from "@/hooks/useMapbox";
import type { MapConfig } from "@/types/map";

// Required for map to render correctly
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  config?: Partial<Omit<MapConfig, "accessToken">>;
  className?: string;
}

const DEFAULT_CONFIG: MapConfig = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
  center: [0, 0],
  zoom: 2,
  style: { version: 8, sources: {}, layers: [] },
};

export function MapboxMap({ config, className }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedConfig: MapConfig = { ...DEFAULT_CONFIG, ...config };
  useMapbox(containerRef, resolvedConfig);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
