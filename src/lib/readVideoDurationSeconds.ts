/** Lê a duração em segundos (arredondada) a partir de um object URL de vídeo. */
export function readVideoDurationSeconds(objectUrl: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const finish = (sec?: number) => {
      v.removeAttribute("src");
      v.load();
      resolve(sec);
    };
    v.onloadedmetadata = () => finish(Number.isFinite(v.duration) ? Math.round(v.duration) : undefined);
    v.onerror = () => finish(undefined);
    v.src = objectUrl;
  });
}
