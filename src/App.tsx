import { useRef, useState, useCallback, useEffect } from "react";
import { MapboxMap } from "@/components/MapboxMap";
import { EditModeToggle } from "@/components/EditModeToggle";
import { AddLocationForm } from "@/components/AddLocationForm";
import { EditLocationForm } from "@/components/EditLocationForm";
import { LocationPanel } from "@/components/LocationPanel";
import { LabelPopover } from "@/components/LabelPopover";
import { MapSwitcherPanel } from "@/components/MapSwitcherPanel";
import { useMapbox } from "@/hooks/useMapbox";
import { useLocations } from "@/hooks/useLocations";
import { useMarkers } from "@/hooks/useMarkers";
import { useMapClickHandler } from "@/hooks/useMapClickHandler";
import { MAPS, DEFAULT_MAP_ID } from "@/lib/maps";
import type { Location } from "@/types/map";

const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function getInitialMapId(): string {
  const hash = window.location.hash.slice(1); // strip '#'
  return MAPS.some((m) => m.id === hash) ? hash : DEFAULT_MAP_ID;
}

function App() {
  const [activeMapId, setActiveMapId] = useState(getInitialMapId);
  const activeMapDef = MAPS.find((m) => m.id === activeMapId)!;

  // Keep hash in sync with active map
  useEffect(() => {
    window.location.hash = activeMapId;
  }, [activeMapId]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, isMapReady } = useMapbox(containerRef, ACCESS_TOKEN, activeMapDef);

  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<
    [number, number] | null
  >(null);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [popoverPixel, setPopoverPixel] = useState<{ x: number; y: number } | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const {
    locations,
    status,
    isSyncing,
    addLocation,
    deleteLocation,
    updateLocation,
  } = useLocations(activeMapId);

  const handleSelectMap = useCallback(
    (mapId: string) => {
      if (mapId === activeMapId) return;
      setIsEditMode(false);
      setPendingCoordinates(null);
      setActiveLocation(null);
      setEditingLocation(null);
      setActiveMapId(mapId);
    },
    [activeMapId],
  );

  const handleMapClick = useCallback((coords: [number, number]) => {
    setPendingCoordinates(coords);
  }, []);

  const handleConfirmLocation = useCallback(
    (location: Location) => {
      addLocation(location);
      setPendingCoordinates(null);
    },
    [addLocation],
  );

  const handleCancelForm = useCallback(() => {
    setPendingCoordinates(null);
  }, []);

  const handleViewLocation = useCallback((location: Location, pixel: { x: number; y: number }) => {
    setActiveLocation(location);
    setPopoverPixel(pixel);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActiveLocation(null);
    setPopoverPixel(null);
  }, []);

  // Hide the label popover when the user pans the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const dismiss = () => {
      setActiveLocation((loc) => (loc && !loc.link ? null : loc));
      setPopoverPixel(null);
    };
    map.on('movestart', dismiss);
    return () => { map.off('movestart', dismiss); };
  }, [mapRef, isMapReady]);

  const handleEditLocation = useCallback((location: Location) => {
    setEditingLocation(location);
    setPendingCoordinates(null);
  }, []);

  const handleSaveEdit = useCallback(
    (updated: Location) => {
      updateLocation(updated);
      setEditingLocation(null);
    },
    [updateLocation],
  );

  const handleDeleteFromEdit = useCallback(
    (id: string) => {
      deleteLocation(id);
      setEditingLocation(null);
    },
    [deleteLocation],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingLocation(null);
  }, []);

  const handleMoveLocation = useCallback(
    (id: string, coordinates: [number, number]) => {
      const location = locations.find((l) => l.id === id);
      if (location) updateLocation({ ...location, coordinates });
    },
    [locations, updateLocation],
  );

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    setPendingCoordinates(null);
    setActiveLocation(null);
    setEditingLocation(null);
  }, []);

  useMarkers({
    mapRef,
    locations,
    isEditMode,
    onViewLocation: handleViewLocation,
    onEditLocation: handleEditLocation,
    onMoveLocation: handleMoveLocation,
  });
  useMapClickHandler({ mapRef, isEditMode, onMapClick: handleMapClick });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        position: "relative",
      }}
    >
      <MapboxMap key={activeMapId} containerRef={containerRef} />
      <MapSwitcherPanel
        maps={MAPS}
        activeMapId={activeMapId}
        onSelect={handleSelectMap}
      />
      {import.meta.env.DEV && (
        <EditModeToggle isEditMode={isEditMode} onToggle={handleToggleEditMode} />
      )}
      {pendingCoordinates && (
        <AddLocationForm
          mapRef={mapRef}
          coordinates={pendingCoordinates}
          onConfirm={handleConfirmLocation}
          onCancel={handleCancelForm}
        />
      )}
      {activeLocation && (
        activeLocation.link
          ? <LocationPanel location={activeLocation} onClose={handleClosePanel} />
          : <LabelPopover location={activeLocation} pixel={popoverPixel} onClose={handleClosePanel} />
      )}
      {editingLocation && (
        <EditLocationForm
          location={editingLocation}
          onSave={handleSaveEdit}
          onDelete={handleDeleteFromEdit}
          onCancel={handleCancelEdit}
        />
      )}
      {(!isMapReady || status === "loading" || isSyncing) && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            width: "24px",
            height: "24px",
            border: "3px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            zIndex: 20,
          }}
        />
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .mapboxgl-ctrl-scale { font-size: 10px; opacity: 0.6; }
      `}</style>
    </div>
  );
}

export default App;
