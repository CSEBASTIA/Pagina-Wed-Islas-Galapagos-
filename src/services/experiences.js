import { SUPABASE_KEY, SUPABASE_URL } from '../lib/supabase.js';

// Envía las fotos a la Edge Function "subir-experiencia" de Supabase, que las
// valida de nuevo y las guarda como pendientes de revisión. Para cambiar de
// almacenamiento más adelante (otro proveedor o un NAS) basta con cambiar esta función.
const ENDPOINT = `${SUPABASE_URL}/functions/v1/subir-experiencia`;

export async function submitExperience({ files, name, tour, comment }) {
  const form = new FormData();
  files.forEach((file) => form.append('fotos', file, file.name));
  form.append('name', name);
  form.append('tour', tour);
  form.append('comment', comment);
  form.append('consent', 'true');

  let response;
  try {
    response = await fetch(ENDPOINT, { method: 'POST', headers: { apikey: SUPABASE_KEY }, body: form });
  } catch {
    throw new Error('No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudieron enviar las fotos. Inténtalo de nuevo.');
  return data;
}
