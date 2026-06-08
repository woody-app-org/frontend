import { api } from "@/lib/api";

export interface DeezerTrack {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  coverUrl: string;
  startTime: number;
}

interface DeezerApiTrack {
  id: number;
  title: string;
  preview: string;
  artist: { name: string };
  album: { cover_medium: string };
}

interface DeezerSearchResponse {
  data?: DeezerApiTrack[];
}

interface DeezerPreviewResponse {
  previewUrl?: string;
}

/**
 * Os URLs de preview do Deezer são assinados com um token que expira ~1h depois de emitidos,
 * por isso não podemos confiar no `previewUrl` persistido — pedimos sempre um URL fresco
 * ao backend (que faz cache curto) antes de reproduzir a música de um story.
 */
export async function resolveDeezerPreviewUrl(trackId: string): Promise<string | null> {
  if (!trackId) return null;
  try {
    const { data } = await api.get<DeezerPreviewResponse>(
      `/stories/music/preview/${encodeURIComponent(trackId)}`
    );
    return data.previewUrl ?? null;
  } catch {
    return null;
  }
}

export async function searchDeezerTracks(query: string): Promise<DeezerTrack[]> {
  if (!query.trim()) return [];
  const { data } = await api.get<DeezerSearchResponse>(
    `/stories/music/search?q=${encodeURIComponent(query.trim())}`
  );
  return (data.data ?? [])
    .filter((t) => t.preview)
    .map((t) => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist.name,
      previewUrl: t.preview,
      coverUrl: t.album.cover_medium,
      startTime: 0,
    }));
}
