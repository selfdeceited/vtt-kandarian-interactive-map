import { useState, useCallback, useEffect, useRef } from "react";
import type { PathNode } from "@/types/map";

interface UsePathDrawingOptions {
  isActive: boolean;
  onPathReady: (nodes: PathNode[]) => void;
  onPathCancel: () => void;
}

interface UsePathDrawingReturn {
  inProgressNodes: PathNode[];
  addNode: (coords: [number, number]) => void;
  finishPath: () => void;
  cancelPath: () => void;
}

export function usePathDrawing({
  isActive,
  onPathReady,
  onPathCancel,
}: UsePathDrawingOptions): UsePathDrawingReturn {
  const [inProgressNodes, setInProgressNodes] = useState<PathNode[]>([]);

  const inProgressNodesRef = useRef(inProgressNodes);
  inProgressNodesRef.current = inProgressNodes;

  useEffect(() => {
    if (!isActive) {
      setInProgressNodes([]);
    }
  }, [isActive]);

  const addNode = useCallback((coords: [number, number]) => {
    const node: PathNode = {
      id: crypto.randomUUID(),
      coordinates: coords,
    };
    setInProgressNodes((prev) => [...prev, node]);
  }, []);

  const finishPath = useCallback(() => {
    const nodes = inProgressNodesRef.current;
    if (nodes.length < 2) return;
    setInProgressNodes([]);
    onPathReady(nodes);
  }, [onPathReady]);

  const cancelPath = useCallback(() => {
    setInProgressNodes([]);
    onPathCancel();
  }, [onPathCancel]);

  return {
    inProgressNodes,
    addNode,
    finishPath,
    cancelPath,
  };
}
