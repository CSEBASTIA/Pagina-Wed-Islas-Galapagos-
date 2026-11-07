import { createClient } from '@supabase/supabase-js';

// Datos públicos del proyecto "Islas Galapagos". La clave publicable está pensada
// para usarse en el navegador: los permisos reales los controla Row Level Security.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lmgecsbrkpfkeifshxot.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_VSB2WkAlWE8QzYR-kqfM0g_tNJnmooS';
export const GALLERY_BUCKET = 'galeria';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Las fotos pueden ser del sitio ("/images/...") o estar en el bucket galeria.
export function imageUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\//.test(path)) return path;
  return supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
}
