import { useCallback, useEffect, useId, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import {
  blobToImageFile,
  cropImageToRectBlob,
  cropImageToSquareBlob,
  getPreferredAvatarOutput,
  getPreferredCoverOutput,
} from "@/lib/image/canvasCropImage";

/** Opção de formato oficial selecionável dentro do diálogo de crop. */
export type ImageCropFormatOption = {
  key: string;
  label: string;
  aspect: number;
  outputWidth: number;
  outputHeight: number;
};

export type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `URL.createObjectURL` ou URL remota; o chamador revoga object URLs ao fechar. */
  imageSrc: string | null;
  title: string;
  description?: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  /**
   * Quando definido, mostra chips para a utilizadora escolher o formato oficial
   * (ex.: 4:5 / 3:4 / 1:1). Substitui `aspect`/`outputWidth`/`outputHeight`.
   */
  formatOptions?: ImageCropFormatOption[];
  /** Chave do formato pré-selecionado (default: primeira opção). */
  initialFormatKey?: string;
  /** Exportação quadrada (avatar); ignorado se `outputWidth` e `outputHeight` estiverem definidos. */
  outputSize?: number;
  /** Exportação retangular (ex. capa); requer ambos. */
  outputWidth?: number;
  outputHeight?: number;
  /** `wide` — modal e área de pré-visualização mais largos para formatos panorâmicos. */
  layout?: "square" | "wide";
  onConfirm: (file: File) => Promise<void>;
};

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  title,
  description,
  aspect = 1,
  cropShape = "round",
  outputSize = 512,
  outputWidth,
  outputHeight,
  layout = "square",
  formatOptions,
  initialFormatKey,
  onConfirm,
}: ImageCropDialogProps) {
  const zoomFieldId = useId();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [confirming, setConfirming] = useState(false);

  const hasFormats = !!formatOptions && formatOptions.length > 0;
  const [selectedFormatKey, setSelectedFormatKey] = useState<string>(
    () => initialFormatKey ?? formatOptions?.[0]?.key ?? ""
  );
  const selectedFormat = hasFormats
    ? formatOptions!.find((f) => f.key === selectedFormatKey) ?? formatOptions![0]
    : null;

  // Formato selecionado tem prioridade sobre as props fixas.
  const effectiveAspect = selectedFormat ? selectedFormat.aspect : aspect;
  const effectiveOutputWidth = selectedFormat ? selectedFormat.outputWidth : outputWidth;
  const effectiveOutputHeight = selectedFormat ? selectedFormat.outputHeight : outputHeight;

  const isRectExport =
    typeof effectiveOutputWidth === "number" &&
    typeof effectiveOutputHeight === "number" &&
    effectiveOutputWidth > 0 &&
    effectiveOutputHeight > 0;

  const resetAdjustment = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  useEffect(() => {
    if (!open || !imageSrc) return;
    resetAdjustment();
    setCroppedAreaPixels(null);
    setSelectedFormatKey(initialFormatKey ?? formatOptions?.[0]?.key ?? "");
  }, [open, imageSrc, resetAdjustment, initialFormatKey, formatOptions]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setConfirming(true);
    try {
      let blob: Blob;
      let fileName: string;

      if (isRectExport) {
        const { mimeType, fileName: fn, quality } = getPreferredCoverOutput();
        fileName = fn;
        blob = await cropImageToRectBlob(imageSrc, croppedAreaPixels, {
          outputWidth: effectiveOutputWidth!,
          outputHeight: effectiveOutputHeight!,
          mimeType,
          quality,
        });
      } else {
        const { mimeType, fileName: fn, quality } = getPreferredAvatarOutput();
        fileName = fn;
        blob = await cropImageToSquareBlob(imageSrc, croppedAreaPixels, {
          outputSize,
          mimeType,
          quality,
        });
      }

      const file = blobToImageFile(blob, fileName);
      await onConfirm(file);
      onOpenChange(false);
    } finally {
      setConfirming(false);
    }
  }, [
    croppedAreaPixels,
    imageSrc,
    isRectExport,
    onConfirm,
    onOpenChange,
    effectiveOutputHeight,
    outputSize,
    effectiveOutputWidth,
  ]);

  const isWideLayout = layout === "wide";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "top-[4%] z-[112] flex max-h-[min(92dvh,760px)] translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-1/2 sm:-translate-y-1/2",
          isWideLayout
            ? "max-w-[min(36rem,calc(100vw-1rem))]"
            : "max-w-[min(28rem,calc(100vw-1rem))]",
          "border-[var(--woody-accent)]/15"
        )}
        overlayClassName="z-[111]"
        onPointerDownOutside={(e) => {
          if (confirming) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (confirming) e.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-[var(--woody-accent)]/10 px-4 pb-3 pt-4 text-left sm:px-5 sm:pt-5">
          <DialogTitle className="text-[var(--woody-text)]">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-[var(--woody-muted)]">{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Ajuste o enquadramento e o zoom da imagem.</DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          {imageSrc ? (
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-2xl bg-[var(--woody-nav)]/12 ring-1 ring-[var(--woody-accent)]/12",
                cropShape === "round"
                  ? "mx-auto aspect-square max-w-[min(20rem,calc(100vw-3rem))]"
                  : cn(
                      "mx-auto w-full min-h-[120px]",
                      isWideLayout ? "max-h-[min(44dvh,300px)]" : "max-h-[min(40dvh,260px)]"
                    )
              )}
              style={cropShape === "round" ? undefined : { aspectRatio: `${effectiveAspect}` }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={effectiveAspect}
                cropShape={cropShape}
                showGrid={false}
                roundCropAreaPixels={cropShape === "round"}
                zoomWithScroll
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                classes={{ containerClassName: "rounded-2xl" }}
              />
            </div>
          ) : null}

          {hasFormats ? (
            <div className="mt-4">
              <span className="mb-2 block text-xs font-medium text-[var(--woody-muted)]">Formato</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Formato da imagem">
                {formatOptions!.map((opt) => {
                  const active = opt.key === selectedFormat?.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={confirming}
                      onClick={() => setSelectedFormatKey(opt.key)}
                      aria-pressed={active}
                      className={cn(
                        "min-h-9 rounded-full px-3.5 text-sm font-medium transition-colors",
                        woodyFocus.ring,
                        active
                          ? "bg-[var(--woody-nav)] text-white"
                          : "bg-[var(--woody-nav)]/8 text-[var(--woody-text)] hover:bg-[var(--woody-accent)]/12"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={zoomFieldId} className="text-xs font-medium text-[var(--woody-muted)]">
                Zoom
              </label>
              <span className="tabular-nums text-xs text-[var(--woody-muted)]">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              id={zoomFieldId}
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(ev) => setZoom(Number(ev.target.value))}
              className={cn(
                "h-11 w-full cursor-pointer touch-pan-x accent-[var(--woody-nav)]",
                woodyFocus.ring
              )}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={zoom}
              aria-label="Zoom da imagem"
            />
          </div>

          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("inline-flex items-center gap-2 text-[var(--woody-muted)]", woodyFocus.ring)}
              onClick={resetAdjustment}
              disabled={confirming}
            >
              <RotateCcw className="size-4" aria-hidden />
              Redefinir
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-4">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-h-11 w-full rounded-xl border-[var(--woody-accent)]/25 sm:w-auto",
              woodyFocus.ring
            )}
            onClick={() => onOpenChange(false)}
            disabled={confirming}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!croppedAreaPixels || confirming}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 sm:w-auto",
              woodyFocus.ring
            )}
            onClick={() => void handleConfirm()}
          >
            {confirming ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              "Aplicar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
