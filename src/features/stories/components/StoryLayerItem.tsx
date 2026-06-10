import { type RefObject } from "react";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLayerDrag, type LayerDragGeometry } from "../hooks/useLayerDrag";
import type { StoryLayer } from "../types";

const FONT_SIZE_CLASS: Record<NonNullable<StoryLayer["fontSize"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

export interface StoryLayerItemProps {
  layer: StoryLayer;
  canvasRef: RefObject<HTMLElement | null>;
  selected: boolean;
  muted?: boolean;
  onSelect: () => void;
  onChange: (geometry: LayerDragGeometry) => void;
}

export function StoryLayerItem({ layer, canvasRef, selected, muted = true, onSelect, onChange }: StoryLayerItemProps) {
  const { onPointerDown, onPointerMove, onPointerUp } = useLayerDrag(
    canvasRef,
    { x: layer.x, y: layer.y, width: layer.width, height: layer.height },
    onChange
  );

  const style = {
    left: `${(layer.x - layer.width / 2) * 100}%`,
    top: `${(layer.y - layer.height / 2) * 100}%`,
    width: `${layer.width * 100}%`,
    height: `${layer.height * 100}%`,
    transform: `rotate(${layer.rotation}deg)`,
  };

  return (
    <div
      className={cn(
        "absolute touch-none select-none",
        selected ? "outline outline-2 outline-dashed outline-white/80" : ""
      )}
      style={style}
      onPointerDown={(e) => {
        onSelect();
        onPointerDown(e, "move");
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {layer.type === "text" ? (
        <div
          className={cn(
            "flex h-full w-full cursor-grab items-center justify-center whitespace-pre-wrap break-words text-center font-semibold leading-snug active:cursor-grabbing",
            FONT_SIZE_CLASS[layer.fontSize ?? "md"]
          )}
          style={{ color: layer.color ?? "#ffffff" }}
        >
          {layer.text || "Texto"}
        </div>
      ) : layer.type === "image" ? (
        <img
          src={layer.mediaUrl ? resolvePublicMediaUrl(layer.mediaUrl) : undefined}
          alt=""
          className="size-full cursor-grab object-contain active:cursor-grabbing"
          draggable={false}
        />
      ) : (
        <video
          src={layer.mediaUrl ? resolvePublicMediaUrl(layer.mediaUrl) : undefined}
          className="size-full cursor-grab object-contain active:cursor-grabbing"
          muted={muted}
          loop
          playsInline
          autoPlay
        />
      )}

      {selected ? (
        <div
          onPointerDown={(e) => onPointerDown(e, "resize")}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute bottom-1 right-1 size-5 cursor-nwse-resize rounded-full border-2 border-white bg-[var(--woody-nav)]"
        />
      ) : null}
    </div>
  );
}
