import { VideoPostPlayer } from "@/components/media/VideoPostPlayer";
import { cn } from "@/lib/utils";

export interface VideoMessageAttachmentProps {
  src: string;
  poster?: string;
  className?: string;
}

/** Vídeo compacto na bolha de conversa (delega em <code>VideoPostPlayer</code> variante message). */
export function VideoMessageAttachment({ src, poster, className }: VideoMessageAttachmentProps) {
  return <VideoPostPlayer src={src} poster={poster} variant="message" className={className} />;
}
