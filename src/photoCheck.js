export const MAX_PHOTOS = 5;
export const MAX_MB = 25; // tamaño máximo de la foto original; se envía ya optimizada
export const MIN_SIDE = 400;
export const MAX_SIDE = 1600; // lado mayor tras optimizar
export const JPEG_QUALITY = 0.82;
// Sin HEIC a propósito: así el iPhone convierte sus fotos a JPEG al elegirlas.
export const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'];
const text = (bytes, start, end) => String.fromCharCode(...bytes.slice(start, end));

// Firmas binarias de cada formato: así se detecta que el archivo es realmente
// una foto y no otro archivo renombrado como .jpg.
const signatures = [
  { type: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: 'image/webp', test: (b) => text(b, 0, 4) === 'RIFF' && text(b, 8, 12) === 'WEBP' },
  { type: 'image/heic', test: (b) => text(b, 4, 8) === 'ftyp' && HEIC_BRANDS.includes(text(b, 8, 12)) },
];

// Abre la foto con createImageBitmap y, si el navegador no puede (algunos
// teléfonos o navegadores antiguos), con una etiqueta <img>.
async function openImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Se intenta abajo con <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function checkPhoto(file) {
  if (file.size > MAX_MB * 1024 * 1024) return { error: `${file.name}: pesa más de ${MAX_MB} MB.` };
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const kind = signatures.find((signature) => signature.test(bytes));
  if (!kind) return { error: `${file.name}: no es una foto JPG, PNG, WEBP o HEIC.` };
  let image;
  try {
    image = await openImage(file);
  } catch {
    return {
      error: kind.type === 'image/heic'
        ? `${file.name}: este navegador no puede abrir fotos HEIC. Elige la foto desde la galería del teléfono o conviértela a JPG.`
        : `${file.name}: no se pudo abrir como imagen.`,
    };
  }
  const { width, height } = image;
  image.release();
  if (Math.min(width, height) < MIN_SIDE) {
    return { error: `${file.name}: la imagen es muy pequeña (mínimo ${MIN_SIDE} px por lado).` };
  }
  return { type: kind.type, width, height };
}

// Reduce la foto (lado mayor de 1600 px, sin bajar de 400 px el lado menor) y la
// convierte a JPEG. Al dibujarla de nuevo se descartan los metadatos, incluida la
// ubicación GPS que guardan muchos teléfonos.
export async function optimizePhoto(file) {
  const image = await openImage(file);
  const { width, height } = image;
  const scale = Math.min(1, Math.max(MAX_SIDE / Math.max(width, height), MIN_SIDE / Math.min(width, height)));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image.source, 0, 0, canvas.width, canvas.height);
  image.release();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error(`${file.name}: no se pudo optimizar.`))), 'image/jpeg', JPEG_QUALITY);
  });
  const name = `${file.name.replace(/\.[^.]+$/, '') || 'foto'}.jpg`;
  return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
}
