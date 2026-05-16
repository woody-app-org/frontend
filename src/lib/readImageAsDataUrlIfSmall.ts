/** Limite alinhado ao composer de posts (até haver upload direto para o servidor). */
export const READ_IMAGE_DATA_URL_MAX_FILE_BYTES = 450 * 1024;

export function readImageAsDataUrlIfSmall(file: File): Promise<string> {
  if (file.size > READ_IMAGE_DATA_URL_MAX_FILE_BYTES) {
    return Promise.reject(
      new Error(
        `A imagem deve ter no máximo ${Math.round(READ_IMAGE_DATA_URL_MAX_FILE_BYTES / 1024)} KB (até haver upload direto para o servidor).`
      )
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}
