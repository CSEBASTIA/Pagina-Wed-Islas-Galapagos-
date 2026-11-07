// Punto de integración para "Sube tu experiencia".
// Aquí se conectará el envío de fotos al almacenamiento (Supabase Storage).
// El servidor también deberá validar tipo, tamaño y cantidad de fotos, y
// guardarlas como pendientes de revisión antes de publicarlas en la galería.
export const UPLOADS_ENABLED = false;

export class UploadsNotReadyError extends Error {}

export async function submitExperience({ files, name, tour, comment }) {
  if (!UPLOADS_ENABLED) {
    throw new UploadsNotReadyError('El envío de fotos todavía no está activo. Mientras tanto, puedes enviarnos tus fotos por WhatsApp.');
  }
  void files; void name; void tour; void comment;
  throw new Error('Configura el envío de fotos en src/services/experiences.js.');
}
