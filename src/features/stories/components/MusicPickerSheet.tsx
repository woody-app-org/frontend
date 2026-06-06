import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Music, Pause, Play, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { searchDeezerTracks, type DeezerTrack } from "../services/deezer.service";

export interface MusicPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: DeezerTrack | null;
  onSelect: (track: DeezerTrack | null) => void;
}

const PREVIEW_DURATION = 30;

export function MusicPickerSheet({
  open,
  onOpenChange,
  selected,
  onSelect,
}: MusicPickerSheetProps) {
  // Ecrã: "search" = lista de resultados | "trim" = aparar trecho
  const [screen, setScreen] = useState<"search" | "trim">("search");
  const [trimTrack, setTrimTrack] = useState<DeezerTrack | null>(null);
  const [startTime, setStartTime] = useState(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [trimPlaying, setTrimPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlayingId(null);
    setTrimPlaying(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopAudio();
      setQuery("");
      setResults([]);
      setSearchError(null);
      setScreen("search");
      setTrimTrack(null);
      setStartTime(0);
    }
  }, [open, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stopAudio]);

  // --- Ecrã de pesquisa ---

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setSearchError(null);
      searchDeezerTracks(value)
        .then((tracks) => {
          setResults(tracks);
          if (tracks.length === 0) setSearchError("Nenhuma música encontrada.");
        })
        .catch(() => setSearchError("Não foi possível buscar músicas. Tenta novamente."))
        .finally(() => setLoading(false));
    }, 400);
  };

  const toggleSearchPreview = (track: DeezerTrack) => {
    if (playingId === track.id) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio(track.previewUrl);
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    void audio.play().catch(() => setPlayingId(null));
    setPlayingId(track.id);
  };

  const openTrim = (track: DeezerTrack) => {
    stopAudio();
    // Preservar o startTime se for a mesma faixa já selecionada
    const initialStart = selected?.id === track.id ? selected.startTime : 0;
    setTrimTrack(track);
    setStartTime(initialStart);
    setTrimPlaying(false);
    setScreen("trim");
  };

  // --- Ecrã de trim ---

  const toggleTrimPreview = () => {
    if (!trimTrack) return;
    if (trimPlaying) {
      audioRef.current?.pause();
      setTrimPlaying(false);
      return;
    }
    stopAudio();
    const audio = new Audio(trimTrack.previewUrl);
    audio.currentTime = startTime;
    audio.onended = () => setTrimPlaying(false);
    audioRef.current = audio;
    void audio.play().catch(() => setTrimPlaying(false));
    setTrimPlaying(true);
  };

  const handleScrubChange = (value: number) => {
    setStartTime(value);
    // Atualiza o ponto de partida sem interromper — o utilizador ouve ao tocar play
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleConfirmTrim = () => {
    if (!trimTrack) return;
    stopAudio();
    onSelect({ ...trimTrack, startTime });
    onOpenChange(false);
  };

  const handleBackToSearch = () => {
    stopAudio();
    setScreen("search");
    setTrimTrack(null);
  };

  const handleRemove = () => {
    stopAudio();
    onSelect(null);
    onOpenChange(false);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/55 backdrop-blur-[2px]"
        className={cn(
          "flex max-h-[min(100dvh,46rem)] w-[calc(100vw-0.75rem)] max-w-lg flex-col gap-0 overflow-hidden p-0",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-md",
          "rounded-2xl border border-black/10 bg-[var(--woody-card)] shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
        )}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-[var(--woody-divider)] px-4 py-3">
          <div className="flex items-center gap-2">
            {screen === "trim" ? (
              <button
                type="button"
                onClick={handleBackToSearch}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-[var(--woody-muted)] hover:bg-black/5",
                  woodyFocus.ring
                )}
                aria-label="Voltar à pesquisa"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
            ) : null}
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[var(--woody-text)]">
              <Music className="size-4 text-[var(--woody-nav)]" aria-hidden />
              {screen === "trim" ? "Escolher trecho" : "Adicionar música"}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-[var(--woody-muted)] hover:bg-black/5",
              woodyFocus.ring
            )}
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <DialogDescription className="sr-only">
          {screen === "trim"
            ? "Escolhe o trecho da música que vai tocar no story."
            : "Pesquisa uma música para adicionar ao story."}
        </DialogDescription>

        {/* ── Ecrã de pesquisa ── */}
        {screen === "search" ? (
          <>
            <div className="border-b border-[var(--woody-divider)] px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-main-surface)] px-3 py-2">
                <Search className="size-4 shrink-0 text-[var(--woody-muted)]" aria-hidden />
                <input
                  type="search"
                  placeholder="Pesquisar música ou artista…"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] focus:outline-none"
                  autoFocus
                />
                {loading ? (
                  <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-[var(--woody-nav)] border-t-transparent" />
                ) : null}
              </div>
            </div>

            {selected ? (
              <div className="border-b border-[var(--woody-divider)] bg-[var(--woody-nav)]/8 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
                  Selecionada
                </p>
                <div className="flex items-center gap-3">
                  <img src={selected.coverUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{selected.title}</p>
                    <p className="truncate text-xs text-[var(--woody-muted)]">
                      {selected.artist} · começa em {formatTime(selected.startTime)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openTrim(selected)}
                    className={cn(
                      "shrink-0 rounded-xl border border-[var(--woody-nav)]/50 px-2.5 py-1 text-xs font-semibold text-[var(--woody-nav)] hover:bg-[var(--woody-nav)]/10",
                      woodyFocus.ring
                    )}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-[var(--woody-muted)] hover:bg-black/8",
                      woodyFocus.ring
                    )}
                    aria-label="Remover música"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {searchError && !loading ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--woody-muted)]">{searchError}</p>
              ) : null}

              {!query.trim() && !selected ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <Music className="mb-3 size-10 text-[var(--woody-muted)]/50" aria-hidden />
                  <p className="text-sm text-[var(--woody-muted)]">
                    Pesquisa uma música para adicionar ao teu story
                  </p>
                </div>
              ) : null}

              {results.length > 0 ? (
                <ul className="divide-y divide-[var(--woody-divider)]">
                  {results.map((track) => (
                    <li key={track.id} className="flex items-center gap-3 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSearchPreview(track)}
                        className={cn("relative shrink-0 rounded-xl", woodyFocus.ring)}
                        aria-label={playingId === track.id ? "Pausar preview" : "Ouvir preview"}
                      >
                        <img src={track.coverUrl} alt="" className="size-10 rounded-xl object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                          {playingId === track.id ? (
                            <Pause className="size-4 text-white" aria-hidden />
                          ) : (
                            <Play className="size-4 text-white" aria-hidden />
                          )}
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--woody-text)]">{track.title}</p>
                        <p className="truncate text-xs text-[var(--woody-muted)]">{track.artist}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openTrim(track)}
                        className={cn(
                          "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors",
                          woodyFocus.ring,
                          selected?.id === track.id
                            ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]"
                            : "border-[var(--woody-divider)] text-[var(--woody-muted)] hover:border-[var(--woody-nav)]/50"
                        )}
                      >
                        {selected?.id === track.id ? "Selecionada" : "Selecionar"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </>
        ) : null}

        {/* ── Ecrã de trim ── */}
        {screen === "trim" && trimTrack ? (
          <div className="flex flex-1 flex-col gap-0 overflow-hidden">
            {/* Info da faixa */}
            <div className="flex items-center gap-4 px-5 py-5">
              <img
                src={trimTrack.coverUrl}
                alt=""
                className="size-16 shrink-0 rounded-xl object-cover shadow-md"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[var(--woody-text)]">{trimTrack.title}</p>
                <p className="truncate text-sm text-[var(--woody-muted)]">{trimTrack.artist}</p>
              </div>
            </div>

            {/* Scrubber */}
            <div className="px-5 pb-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
                Início do trecho
              </p>
              <div className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-right text-sm tabular-nums text-[var(--woody-muted)]">
                  {formatTime(startTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={PREVIEW_DURATION - 1}
                  step={1}
                  value={startTime}
                  onChange={(e) => handleScrubChange(Number(e.target.value))}
                  className="flex-1 accent-[var(--woody-nav)]"
                  aria-label="Início do trecho"
                />
                <span className="w-10 shrink-0 text-sm tabular-nums text-[var(--woody-muted)]">
                  {formatTime(PREVIEW_DURATION)}
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-[var(--woody-muted)]">
                O story vai tocar a partir de <strong>{formatTime(startTime)}</strong>
              </p>
            </div>

            {/* Botão de preview do trecho */}
            <div className="flex justify-center px-5 py-3">
              <button
                type="button"
                onClick={toggleTrimPreview}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                  woodyFocus.ring,
                  trimPlaying
                    ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]"
                    : "border-[var(--woody-divider)] text-[var(--woody-muted)] hover:border-[var(--woody-nav)]/40"
                )}
              >
                {trimPlaying ? (
                  <><Pause className="size-4" aria-hidden /> Parar</>
                ) : (
                  <><Play className="size-4" aria-hidden /> Ouvir a partir daqui</>
                )}
              </button>
            </div>

            <div className="mt-auto border-t border-[var(--woody-divider)] px-5 py-4">
              <Button
                type="button"
                className="w-full rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
                onClick={handleConfirmTrim}
              >
                Adicionar ao story
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
