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
