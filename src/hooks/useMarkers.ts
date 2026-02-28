import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { RefObject } from "react";
import type { Location, LocationType } from "@/types/map";

interface UseMarkersOptions {
  mapRef: RefObject<mapboxgl.Map | null>;
  locations: Location[];
  isEditMode: boolean;
  onViewLocation: (location: Location, pixel: { x: number; y: number }) => void;
  onEditLocation: (location: Location) => void;
  onMoveLocation: (id: string, coordinates: [number, number]) => void;
}

interface MarkerRecord {
  marker: mapboxgl.Marker;
  cleanup: () => void;
}

const SETTLEMENT_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <!-- Base wall -->
    <rect x="3" y="16" width="26" height="12" fill="#8b3a2a" stroke="white" stroke-width="0.5" rx="1"/>
    <!-- Gate arch -->
    <path d="M13 28 L13 22 Q16 18 19 22 L19 28 Z" fill="#1a0f00"/>
    <!-- Left tower -->
    <rect x="2" y="10" width="8" height="18" fill="#8b3a2a" stroke="white" stroke-width="0.5" rx="1"/>
    <!-- Right tower -->
    <rect x="22" y="10" width="8" height="18" fill="#8b3a2a" stroke="white" stroke-width="0.5" rx="1"/>
    <!-- Center tower -->
    <rect x="11" y="7" width="10" height="12" fill="#8b3a2a" stroke="white" stroke-width="0.5" rx="1"/>
    <!-- Left battlement -->
    <rect x="2" y="7" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <rect x="5" y="7" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <rect x="8" y="7" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <!-- Right battlement -->
    <rect x="22" y="7" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <rect x="25" y="7" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <rect x="28" y="7" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <!-- Center battlement -->
    <rect x="11" y="4" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <rect x="14" y="4" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <rect x="17" y="4" width="2" height="4" fill="#8b3a2a" stroke="white" stroke-width="0.5"/>
    <!-- Window left tower -->
    <rect x="5" y="13" width="2" height="3" fill="#1a0f00" rx="0.5"/>
    <!-- Window right tower -->
    <rect x="25" y="13" width="2" height="3" fill="#1a0f00" rx="0.5"/>
    <!-- Window center tower -->
    <rect x="15" y="9" width="2" height="3" fill="#1a0f00" rx="0.5"/>
  </svg>
`;

const OTHER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <circle cx="16" cy="13" r="9" fill="#4a6fa5" stroke="white" stroke-width="0.8"/>
    <circle cx="16" cy="13" r="3.5" fill="white"/>
    <path d="M16 22 L13 28 L16 26 L19 28 Z" fill="#4a6fa5" stroke="white" stroke-width="0.5"/>
  </svg>
`;

function createMarkerElement(isEditMode: boolean, type: LocationType): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 32px;
    height: 32px;
    cursor: ${isEditMode ? "grab" : "pointer"};
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));
  `;
  el.innerHTML = type === "settlement" ? SETTLEMENT_SVG : OTHER_SVG;
  return el;
}

function createMarkerRecord(
  map: mapboxgl.Map,
  location: Location,
  isEditMode: boolean,
  onView: (location: Location, pixel: { x: number; y: number }) => void,
  onEdit: (location: Location) => void,
  onMove: (id: string, coordinates: [number, number]) => void,
): MarkerRecord {
  const el = createMarkerElement(isEditMode, location.type);

  const marker = new mapboxgl.Marker({ element: el, draggable: isEditMode, anchor: "bottom" })
    .setLngLat(location.coordinates)
    .addTo(map);

  const markerEl = el;

  // Track whether the last interaction was a drag so we don't open the edit form on dragend click
  let didDrag = false;

  const handleDragEnd = () => {
    didDrag = true;
    const { lng, lat } = marker.getLngLat();
    onMove(location.id, [lng, lat]);
    // Reset after a tick so the click handler that fires right after can check it
    setTimeout(() => {
      didDrag = false;
    }, 0);
  };

  const handleMarkerClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (didDrag) return;
    if (isEditMode) {
      onEdit(location);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const container = map.getContainer().getBoundingClientRect();
      onView(location, {
        x: rect.left + rect.width / 2 - container.left,
        y: rect.top - container.top,
      });
    }
  };

  marker.on("dragend", handleDragEnd);
  markerEl.addEventListener("click", handleMarkerClick);

  return {
    marker,
    cleanup: () => {
      marker.off("dragend", handleDragEnd);
      markerEl.removeEventListener("click", handleMarkerClick);
      marker.remove();
    },
  };
}

export function useMarkers({
  mapRef,
  locations,
  isEditMode,
  onViewLocation,
  onEditLocation,
  onMoveLocation,
}: UseMarkersOptions): void {
  const recordsRef = useRef<Map<string, MarkerRecord>>(new Map());

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const records = recordsRef.current;
    const currentIds = new Set(locations.map((l) => l.id));

    // Remove markers for deleted locations
    for (const [id, record] of records) {
      if (!currentIds.has(id)) {
        record.cleanup();
        records.delete(id);
      }
    }

    // Recreate all markers to update closures on any dependency change
    for (const location of locations) {
      if (records.has(location.id)) {
        records.get(location.id)!.cleanup();
        records.delete(location.id);
      }
      const record = createMarkerRecord(
        map,
        location,
        isEditMode,
        onViewLocation,
        onEditLocation,
        onMoveLocation,
      );
      records.set(location.id, record);
    }
  }, [locations, isEditMode, mapRef, onViewLocation, onEditLocation, onMoveLocation]);

  // Cleanup all markers on unmount
  useEffect(() => {
    const records = recordsRef.current;
    return () => {
      for (const record of records.values()) {
        record.cleanup();
      }
      records.clear();
    };
  }, []);
}
