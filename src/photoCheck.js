export const MAX_PHOTOS = 5;
export const MAX_MB = 10;
export const MIN_SIDE = 400;
export const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

// Firmas binarias de cada formato: así se detecta que el archivo es realmente
// una foto y no otro archivo renombrado como .jpg.
const signatures = [
  { type: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: 'image/webp', test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
];

export async function checkPhoto(file) {
  if (file.size > MAX_MB * 1024 * 1024) return { error: `${file.name}: pesa más de ${MAX_MB} MB.` };
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const kind = signatures.find((signature) => signature.test(bytes));
  if (!kind) return { error: `${file.name}: no es una foto JPG, PNG o WEBP.` };
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    if (Math.min(width, height) < MIN_SIDE) {
      return { error: `${file.name}: la imagen es muy pequeña (mínimo ${MIN_SIDE} px por lado).` };
    }
    return { type: kind.type, width, height };
  } catch {
    return { error: `${file.name}: no se pudo abrir como imagen.` };
  }
}
