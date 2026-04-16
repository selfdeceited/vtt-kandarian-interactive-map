import { useRef, useState, useCallback, useEffect } from "react";
import { MapboxMap } from "@/components/MapboxMap";
import { EditModeToggle } from "@/components/EditModeToggle";
import { AddLocationForm } from "@/components/AddLocationForm";
import { EditLocationForm } from "@/components/EditLocationForm";
import { LocationPanel } from "@/components/LocationPanel";
import { LabelPopover } from "@/components/LabelPopover";
import { MapSwitcherPanel } from "@/components/MapSwitcherPanel";
import { SearchMarkers } from "@/components/SearchMarkers";
import { PathDrawingToolbar } from "@/components/PathDrawingToolbar";
import { PathsToggle } from "@/components/PathsToggle";
import { AddPathForm } from "@/components/AddPathForm";
import { PathLabelPopover } from "@/components/PathLabelPopover";
import { NodeEditForm } from "@/components/NodeEditForm";
import { PathEditForm } from "@/components/PathEditForm";
import { useMapbox } from "@/hooks/useMapbox";
import { useLocations } from "@/hooks/useLocations";
import { useMarkers } from "@/hooks/useMarkers";
import { useMapClickHandler } from "@/hooks/useMapClickHandler";
import { usePathDrawing } from "@/hooks/usePathDrawing";
import { usePathRenderer } from "@/hooks/usePathRenderer";
import { MAPS, DEFAULT_MAP_ID } from "@/lib/maps";
import type { Location, Path, PathNode } from "@/types/map";
import { getPathColor } from "@/lib/paths";

const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function getInitialMapId(): string {
  const hash = window.location.hash.slice(1);
  return MAPS.some((m) => m.id === hash) ? hash : DEFAULT_MAP_ID;
}

function App() {
  const [activeMapId, setActiveMapId] = useState(getInitialMapId);
  const activeMapDef = MAPS.find((m) => m.id === activeMapId)!;

  useEffect(() => {
    window.location.hash = activeMapId;
  }, [activeMapId]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, isMapReady } = useMapbox(containerRef, ACCESS_TOKEN, activeMapDef);

  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<[number, number] | null>(null);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [popoverPixel, setPopoverPixel] = useState<{ x: number; y: number } | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Path-specific state
  const [showPaths, setShowPaths] = useState(true);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [pendingPathNodes, setPendingPathNodes] = useState<PathNode[] | null>(null);
  const [editingNode, setEditingNode] = useState<{ node: PathNode; pathId: string } | null>(null);
  const [editingPath, setEditingPath] = useState<Path | null>(null);
  const [hoverPath, setHoverPath] = useState<{ path: Path; pixel: { x: number; y: number } } | null>(null);
  const [activePath, setActivePath] = useState<{ path: Path; pixel: { x: number; y: number } } | null>(null);
  const [activeNode, setActiveNode] = useState<{ node: PathNode; pixel: { x: number; y: number } } | null>(null);

  const {
    locations,
    paths,
    status,
    isSyncing,
    addLocation,
    deleteLocation,
    updateLocation,
    addPath,
    updatePath,
    deletePath,
  } = useLocations(activeMapId);

  const clearPathState = useCallback(() => {
    setHoverPath(null);
    setActivePath(null);
    setActiveNode(null);
    setEditingNode(null);
    setEditingPath(null);
    setPendingPathNodes(null);
  }, []);

  const { inProgressNodes, addNode, finishPath, cancelPath } = usePathDrawing({
    isActive: isDrawingPath,
    onPathReady: (nodes) => {
      setPendingPathNodes(nodes);
      setIsDrawingPath(false);
    },
    onPathCancel: () => setIsDrawingPath(false),
  });

  usePathRenderer({
    mapRef,
    isMapReady,
    isEditMode,
    showPaths,
    savedPaths: paths,
    inProgressNodes,
    onViewNode: (node, pixel) => setActiveNode({ node, pixel }),
    onEditNode: (node, pathId) => setEditingNode({ node, pathId }),
    onMoveNode: (nodeId, pathId, coords) => {
      const path = paths.find((p) => p.id === pathId);
      if (!path) return;
      updatePath({
        ...path,
        nodes: path.nodes.map((n) => (n.id === nodeId ? { ...n, coordinates: coords } : n)),
      });
    },
    onHoverPath: (path, pixel) =>
      path ? setHoverPath({ path, pixel: pixel! }) : setHoverPath(null),
    onViewPath: (path, pixel) => setActivePath({ path, pixel }),
    onEditPath: (path) => setEditingPath(path),
  });

  const handleSelectMap = useCallback(
    (mapId: string) => {
      if (mapId === activeMapId) return;
      setIsEditMode(false);
      setPendingCoordinates(null);
      setActiveLocation(null);
      setEditingLocation(null);
      setIsDrawingPath(false);
      cancelPath();
      clearPathState();
      setActiveMapId(mapId);
    },
    [activeMapId, cancelPath, clearPathState],
  );

  const handleMapClick = useCallback(
    (coords: [number, number]) => {
      if (isDrawingPath) { addNode(coords); return; }
      // Guard: if click landed on a path line, let the line's own handler deal with it
      const map = mapRef.current;
      if (map) {
        const pt = map.project(coords as [number, number]);
        const pathFeatures = map.queryRenderedFeatures(pt, { layers: ["paths-saved-lines"] });
        if (pathFeatures.length > 0) return;
      }
      setPendingCoordinates(coords);
    },
    [isDrawingPath, addNode, mapRef],
  );

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

  const handleViewLocation = useCallback(
    (location: Location, pixel: { x: number; y: number }) => {
      setActiveLocation(location);
      setPopoverPixel(pixel);
    },
    [],
  );

  const handleClosePanel = useCallback(() => {
    setActiveLocation(null);
    setPopoverPixel(null);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const dismiss = () => {
      setActiveLocation((loc) => (loc && !loc.link ? null : loc));
      setPopoverPixel(null);
    };
    map.on("movestart", dismiss);
    return () => { map.off("movestart", dismiss); };
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

  const handleSearchSelect = useCallback(
    (location: Location) => {
      const map = mapRef.current;
      if (!map) return;
      const pixel = map.project(location.coordinates as [number, number]);
      setActiveLocation(location);
      setPopoverPixel({ x: pixel.x, y: pixel.y });
    },
    [mapRef],
  );

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    setPendingCoordinates(null);
    setActiveLocation(null);
    setEditingLocation(null);
    if (isDrawingPath) {
      cancelPath();
      setIsDrawingPath(false);
    }
    clearPathState();
  }, [isDrawingPath, cancelPath, clearPathState]);

  // Path operation handlers
  const handleConfirmPath = useCallback(
    (path: Path) => {
      addPath(path);
      setPendingPathNodes(null);
    },
    [addPath],
  );

  const handleSaveNode = useCallback(
    (updated: PathNode) => {
      if (!editingNode) return;
      const path = paths.find((p) => p.id === editingNode.pathId);
      if (!path) return;
      updatePath({ ...path, nodes: path.nodes.map((n) => (n.id === updated.id ? updated : n)) });
      setEditingNode(null);
    },
    [editingNode, paths, updatePath],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string, pathId: string) => {
      const path = paths.find((p) => p.id === pathId);
      if (!path) return;
      const newNodes = path.nodes.filter((n) => n.id !== nodeId);
      if (newNodes.length < 2) { deletePath(pathId); }
      else { updatePath({ ...path, nodes: newNodes }); }
      setEditingNode(null);
    },
    [paths, updatePath, deletePath],
  );

  const handleDeletePath = useCallback(
    (pathId: string) => {
      deletePath(pathId);
      setEditingNode(null);
      setEditingPath(null);
    },
    [deletePath],
  );

  const handleSavePath = useCallback(
    (updated: Path) => {
      updatePath(updated);
      setEditingPath(null);
    },
    [updatePath],
  );

  // Escape key cancels in-progress path
  useEffect(() => {
    if (!isDrawingPath) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { cancelPath(); setIsDrawingPath(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDrawingPath, cancelPath]);

  // Double-click finishes in-progress path
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isDrawingPath) return;
    const handler = (e: { preventDefault: () => void }) => {
      e.preventDefault();
      finishPath();
    };
    map.on("dblclick", handler);
    return () => { map.off("dblclick", handler); };
  }, [mapRef, isDrawingPath, finishPath]);

  useMarkers({
    mapRef,
    locations,
    isEditMode,
    onViewLocation: handleViewLocation,
    onEditLocation: handleEditLocation,
    onMoveLocation: handleMoveLocation,
  });
  useMapClickHandler({ mapRef, isEditMode, onMapClick: handleMapClick });

  // Synthetic Location shape reused to display path/node metadata in existing panels
  const pathAsLocation = activePath
    ? { id: activePath.path.id, label: activePath.path.label, link: activePath.path.link!, type: "other" as const, coordinates: [0, 0] as [number, number] }
    : null;
  const nodeAsLocation = activeNode
    ? { id: activeNode.node.id, label: activeNode.node.label!, link: activeNode.node.link ?? "", type: "other" as const, coordinates: [0, 0] as [number, number] }
    : null;

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, position: "relative" }}>
      <MapboxMap key={activeMapId} containerRef={containerRef} />
      <MapSwitcherPanel maps={MAPS} activeMapId={activeMapId} onSelect={handleSelectMap} />
      {isMapReady && (
        <SearchMarkers
          locations={locations}
          mapRef={mapRef}
          accessToken={ACCESS_TOKEN}
          onSelect={handleSearchSelect}
        />
      )}
      {/* Top-left control strip — always visible */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        {import.meta.env.DEV && (
          <EditModeToggle isEditMode={isEditMode} onToggle={handleToggleEditMode} />
        )}
        <PathsToggle showPaths={showPaths} onToggle={() => setShowPaths((v) => !v)} />
      </div>
      {import.meta.env.DEV && isEditMode && (
        <PathDrawingToolbar
          isDrawingPath={isDrawingPath}
          nodeCount={inProgressNodes.length}
          onStartDrawing={() => { setPendingCoordinates(null); setIsDrawingPath(true); }}
          onFinishPath={finishPath}
          onCancelPath={() => { cancelPath(); setIsDrawingPath(false); }}
        />
      )}

      {/* Location pin forms */}
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

      {/* Path creation form (after drawing finished) */}
      {pendingPathNodes && (
        <AddPathForm
          nodes={pendingPathNodes}
          onConfirm={handleConfirmPath}
          onCancel={() => setPendingPathNodes(null)}
        />
      )}

      {/* Path hover tooltip */}
      {hoverPath && (
        <PathLabelPopover
          label={hoverPath.path.label}
          color={getPathColor(hoverPath.path.id)}
          pixel={hoverPath.pixel}
          onClose={() => setHoverPath(null)}
        />
      )}

      {/* Path view panel (click on path with link) */}
      {activePath && pathAsLocation && (
        <LocationPanel location={pathAsLocation} onClose={() => setActivePath(null)} />
      )}

      {/* Node view (click on node with metadata) */}
      {activeNode && nodeAsLocation && (
        activeNode.node.link
          ? <LocationPanel location={nodeAsLocation} onClose={() => setActiveNode(null)} />
          : <LabelPopover location={nodeAsLocation} pixel={activeNode.pixel} onClose={() => setActiveNode(null)} />
      )}

      {/* Path edit forms */}
      {editingNode && (
        <NodeEditForm
          node={editingNode.node}
          pathId={editingNode.pathId}
          pathNodeCount={paths.find((p) => p.id === editingNode.pathId)?.nodes.length ?? 0}
          onSave={handleSaveNode}
          onDeleteNode={handleDeleteNode}
          onDeletePath={handleDeletePath}
          onCancel={() => setEditingNode(null)}
        />
      )}
      {editingPath && (
        <PathEditForm
          path={editingPath}
          onSave={handleSavePath}
          onDelete={handleDeletePath}
          onCancel={() => setEditingPath(null)}
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
