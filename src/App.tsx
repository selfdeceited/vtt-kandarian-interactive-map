import { useRef, useState, useCallback } from "react";
import { MapboxMap } from "@/components/MapboxMap";
import { EditModeToggle } from "@/components/EditModeToggle";
import { AddLocationForm } from "@/components/AddLocationForm";
import { EditLocationForm } from "@/components/EditLocationForm";
import { LocationPanel } from "@/components/LocationPanel";
import { useMapbox } from "@/hooks/useMapbox";
import { useLocations } from "@/hooks/useLocations";
import { useMarkers } from "@/hooks/useMarkers";
import { useMapClickHandler } from "@/hooks/useMapClickHandler";
import type { Location, MapConfig } from "@/types/map";

const MAP_CONFIG: MapConfig = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
  center: [-75.97, 42.187],
  zoom: 9,
  style: { version: 8, sources: {}, layers: [] },
};

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, isMapReady } = useMapbox(containerRef, MAP_CONFIG);

  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<
    [number, number] | null
  >(null);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const {
    locations,
    status,
    isSyncing,
    addLocation,
    deleteLocation,
    updateLocation,
  } = useLocations();

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

  const handleViewLocation = useCallback((location: Location) => {
    setActiveLocation(location);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActiveLocation(null);
  }, []);

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
      <MapboxMap containerRef={containerRef} />
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
        <LocationPanel location={activeLocation} onClose={handleClosePanel} />
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
