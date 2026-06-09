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

/**
 * Os URLs de preview do Deezer são assinados com um token que expira ~1h depois de emitido
 * E fica vinculado ao IP de quem o pediu — por isso não podemos usar nem persistir o URL bruto
 * (o browser do utilizador tem um IP diferente do nosso servidor e a CDN devolveria 403).
 *
 * Em vez disso, pedimos ao backend para fazer streaming dos bytes do áudio (sempre a partir
 * do mesmo IP do servidor) e criamos um Object URL local para o elemento <audio>.
 * Quem chamar esta função é responsável por revogar o URL com `URL.revokeObjectURL`
 * quando deixar de precisar dele.
 */
export async function resolveDeezerPreviewUrl(trackId: string): Promise<string | null> {
  if (!trackId) return null;
  try {
    const response = await api.get<Blob>(`/stories/music/preview/${encodeURIComponent(trackId)}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
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
