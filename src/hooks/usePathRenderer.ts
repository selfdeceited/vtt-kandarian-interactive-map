import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import mapboxgl from "mapbox-gl";
import type { Path, PathNode } from "@/types/map";
import { getPathColor } from "@/lib/paths";

function nodeSvgPlain(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="10" height="10">
  <circle cx="5" cy="5" r="4" fill="${color}" stroke="white" stroke-width="1.5"/>
</svg>`;
}

function nodeSvgMeta(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14">
  <circle cx="7" cy="7" r="6" fill="${color}" stroke="white" stroke-width="2"/>
  <circle cx="7" cy="7" r="2.5" fill="white"/>
</svg>`;
}

function createNodeElement(hasMetadata: boolean, isEditMode: boolean, color: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = (hasMetadata ? nodeSvgMeta(color) : nodeSvgPlain(color)).trim();
  el.style.cursor = isEditMode ? "pointer" : hasMetadata ? "pointer" : "default";
  el.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.4))";
  return el;
}

function buildLinesGeoJSON(paths: Path[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: paths
      .filter((p) => p.nodes.length >= 2)
      .map((p) => ({
        type: "Feature" as const,
        properties: { pathId: p.id, label: p.label, color: getPathColor(p.id) },
        geometry: {
          type: "LineString" as const,
          coordinates: p.nodes.map((n) => n.coordinates),
        },
      })),
  };
}

function buildDraftLinesGeoJSON(nodes: PathNode[]): GeoJSON.FeatureCollection {
  if (nodes.length < 2) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: nodes.map((n) => n.coordinates),
        },
      },
    ],
  };
}

interface NodeMarkerRecord {
  marker: mapboxgl.Marker;
  nodeId: string;
  pathId: string;
}

interface UsePathRendererOptions {
  mapRef: RefObject<mapboxgl.Map | null>;
  isMapReady: boolean;
  isEditMode: boolean;
  showPaths: boolean;
  savedPaths: Path[];
  inProgressNodes: PathNode[];
  onViewNode: (node: PathNode, pixel: { x: number; y: number }) => void;
  onEditNode: (node: PathNode, pathId: string) => void;
  onMoveNode: (nodeId: string, pathId: string, coords: [number, number]) => void;
  onHoverPath: (path: Path | null, pixel?: { x: number; y: number }) => void;
  onViewPath: (path: Path, pixel: { x: number; y: number }) => void;
  onEditPath: (path: Path) => void;
}

export function usePathRenderer({
  mapRef,
  isMapReady,
  isEditMode,
  showPaths,
  savedPaths,
  inProgressNodes,
  onViewNode,
  onEditNode,
  onMoveNode,
  onHoverPath,
  onViewPath,
  onEditPath,
}: UsePathRendererOptions): void {
  // Stable refs so event handlers registered once don't capture stale values
  const isEditModeRef = useRef(isEditMode);
  isEditModeRef.current = isEditMode;
  const savedPathsRef = useRef(savedPaths);
  savedPathsRef.current = savedPaths;
  const onViewNodeRef = useRef(onViewNode);
  onViewNodeRef.current = onViewNode;
  const onEditNodeRef = useRef(onEditNode);
  onEditNodeRef.current = onEditNode;
  const onMoveNodeRef = useRef(onMoveNode);
  onMoveNodeRef.current = onMoveNode;
  const onHoverPathRef = useRef(onHoverPath);
  onHoverPathRef.current = onHoverPath;
  const onViewPathRef = useRef(onViewPath);
  onViewPathRef.current = onViewPath;
  const onEditPathRef = useRef(onEditPath);
  onEditPathRef.current = onEditPath;

  const nodeMarkersRef = useRef<Map<string, NodeMarkerRecord>>(new Map());
  const draftNodeMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Set up GeoJSON sources + layers and line event handlers once
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

    map.addSource("paths-saved-source", { type: "geojson", data: empty });
    map.addSource("path-draft-source", { type: "geojson", data: empty });

    map.addLayer({
      id: "paths-saved-lines",
      type: "line",
      source: "paths-saved-source",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 2.5,
        "line-dasharray": [4, 3],
        "line-opacity": 0.85,
      },
    });

    map.addLayer({
      id: "path-draft-line",
      type: "line",
      source: "path-draft-source",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#aaa",
        "line-width": 2,
        "line-dasharray": [2, 2],
        "line-opacity": 0.65,
      },
    });

    const handleMouseMove = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] }) => {
      map.getCanvas().style.cursor = "pointer";
      const pathId = e.features?.[0]?.properties?.pathId as string | undefined;
      if (!pathId) return;
      const path = savedPathsRef.current.find((p) => p.id === pathId);
      if (!path) return;
      onHoverPathRef.current(path, { x: e.point.x, y: e.point.y });
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = isEditModeRef.current ? "crosshair" : "";
      onHoverPathRef.current(null);
    };

    const handleLineClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] }) => {
      const pathId = e.features?.[0]?.properties?.pathId as string | undefined;
      if (!pathId) return;
      const path = savedPathsRef.current.find((p) => p.id === pathId);
      if (!path) return;
      if (isEditModeRef.current) {
        onEditPathRef.current(path);
      } else if (path.link) {
        onViewPathRef.current(path, { x: e.point.x, y: e.point.y });
      }
    };

    map.on("mousemove", "paths-saved-lines", handleMouseMove);
    map.on("mouseleave", "paths-saved-lines", handleMouseLeave);
    map.on("click", "paths-saved-lines", handleLineClick);

    return () => {
      // Event listeners and layer/source cleanup may throw if the map was
      // already destroyed (e.g. on map switch). Wrap in try-catch so marker
      // cleanup always runs.
      try {
        map.off("mousemove", "paths-saved-lines", handleMouseMove);
        map.off("mouseleave", "paths-saved-lines", handleMouseLeave);
        map.off("click", "paths-saved-lines", handleLineClick);

        if (map.getLayer("paths-saved-lines")) map.removeLayer("paths-saved-lines");
        if (map.getLayer("path-draft-line")) map.removeLayer("path-draft-line");
        if (map.getSource("paths-saved-source")) map.removeSource("paths-saved-source");
        if (map.getSource("path-draft-source")) map.removeSource("path-draft-source");
      } catch {
        // Map already removed — layers/sources are gone, nothing to clean up
      }

      for (const { marker } of nodeMarkersRef.current.values()) marker.remove();
      nodeMarkersRef.current.clear();
      for (const marker of draftNodeMarkersRef.current.values()) marker.remove();
      draftNodeMarkersRef.current.clear();
    };
  }, [mapRef, isMapReady]);

  // Toggle layer + marker visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const vis = showPaths ? "visible" : "none";
    if (map.getLayer("paths-saved-lines")) map.setLayoutProperty("paths-saved-lines", "visibility", vis);
    if (map.getLayer("path-draft-line")) map.setLayoutProperty("path-draft-line", "visibility", vis);
    const display = showPaths ? "" : "none";
    for (const { marker } of nodeMarkersRef.current.values()) marker.getElement().style.display = display;
    for (const marker of draftNodeMarkersRef.current.values()) marker.getElement().style.display = display;
  }, [mapRef, isMapReady, showPaths]);

  // Update saved path lines GeoJSON
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const source = map.getSource("paths-saved-source") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(buildLinesGeoJSON(savedPaths));
  }, [mapRef, isMapReady, savedPaths]);

  // Sync saved node HTML markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const existing = nodeMarkersRef.current;

    const desired = new Map<string, { node: PathNode; pathId: string }>();
    for (const path of savedPaths) {
      for (const node of path.nodes) {
        desired.set(node.id, { node, pathId: path.id });
      }
    }

    // Remove stale markers
    for (const [id, record] of existing) {
      if (!desired.has(id)) {
        record.marker.remove();
        existing.delete(id);
      }
    }

    // Re-create all to keep color + draggable in sync
    for (const [id, { node, pathId }] of desired) {
      if (existing.has(id)) {
        existing.get(id)!.marker.remove();
        existing.delete(id);
      }

      const color = getPathColor(pathId);
      const hasMetadata = !!(node.label || node.link);
      const el = createNodeElement(hasMetadata, isEditMode, color);
      el.style.display = showPaths ? "" : "none";
      let didDrag = false;

      const marker = new mapboxgl.Marker({ element: el, anchor: "center", draggable: isEditMode })
        .setLngLat(node.coordinates)
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (didDrag) return;
        if (isEditModeRef.current) {
          onEditNodeRef.current(node, pathId);
        } else if (node.label || node.link) {
          const rect = el.getBoundingClientRect();
          const container = map.getContainer().getBoundingClientRect();
          onViewNodeRef.current(node, {
            x: rect.left + rect.width / 2 - container.left,
            y: rect.top - container.top,
          });
        }
      });

      marker.on("dragstart", () => { didDrag = false; });
      marker.on("drag", () => { didDrag = true; });
      marker.on("dragend", () => {
        if (didDrag) {
          const { lng, lat } = marker.getLngLat();
          onMoveNodeRef.current(node.id, pathId, [lng, lat]);
        }
        setTimeout(() => { didDrag = false; }, 0);
      });

      existing.set(id, { marker, nodeId: id, pathId });
    }
  }, [mapRef, isMapReady, savedPaths, isEditMode, showPaths]);

  // Update draft line GeoJSON
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const source = map.getSource("path-draft-source") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(buildDraftLinesGeoJSON(inProgressNodes));
  }, [mapRef, isMapReady, inProgressNodes]);

  // Sync draft node markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const existing = draftNodeMarkersRef.current;
    const desiredIds = new Set(inProgressNodes.map((n) => n.id));

    for (const [id, marker] of existing) {
      if (!desiredIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    for (const node of inProgressNodes) {
      if (!existing.has(node.id)) {
        const el = createNodeElement(false, false, "#aaa");
        el.style.opacity = "0.65";
        el.style.cursor = "default";
        el.style.display = showPaths ? "" : "none";
        const marker = new mapboxgl.Marker({ element: el, anchor: "center", draggable: false })
          .setLngLat(node.coordinates)
          .addTo(map);
        existing.set(node.id, marker);
      }
    }
  }, [mapRef, isMapReady, inProgressNodes, showPaths]);
}
