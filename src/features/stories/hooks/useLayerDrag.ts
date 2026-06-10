import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

export type LayerDragMode = "move" | "resize";

interface DragState {
  mode: LayerDragMode;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export interface LayerDragGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_SIZE = 0.05;
const MAX_SIZE = 1;

/** Drag (mover) e resize (canto inferior-direito) de uma camada, em coordenadas normalizadas (0..1) relativas ao canvas. */
export function useLayerDrag(
  canvasRef: RefObject<HTMLElement | null>,
  geometry: LayerDragGeometry,
  onChange: (next: LayerDragGeometry) => void
) {
  const stateRef = useRef<DragState | null>(null);
  const geometryRef = useRef(geometry);
  geometryRef.current = geometry;

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>, mode: LayerDragMode) => {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      stateRef.current = {
        mode,
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: geometryRef.current.x,
        startY: geometryRef.current.y,
        startWidth: geometryRef.current.width,
        startHeight: geometryRef.current.height,
      };
    },
    []
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const state = stateRef.current;
      const canvas = canvasRef.current;
      if (!state || !canvas || e.pointerId !== state.pointerId) return;

      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - state.startClientX) / rect.width;
      const dy = (e.clientY - state.startClientY) / rect.height;

      if (state.mode === "move") {
        const x = Math.min(1, Math.max(0, state.startX + dx));
        const y = Math.min(1, Math.max(0, state.startY + dy));
        onChange({ ...geometryRef.current, x, y });
      } else {
        const width = Math.min(MAX_SIZE, Math.max(MIN_SIZE, state.startWidth + dx * 2));
        const height = Math.min(MAX_SIZE, Math.max(MIN_SIZE, state.startHeight + dy * 2));
        onChange({ ...geometryRef.current, width, height });
      }
    },
    [canvasRef, onChange]
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const state = stateRef.current;
    if (!state || e.pointerId !== state.pointerId) return;
    stateRef.current = null;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
