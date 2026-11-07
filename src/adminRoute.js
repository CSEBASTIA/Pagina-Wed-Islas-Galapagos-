// El panel no tiene una dirección visible en el código: solo se guarda la huella
// SHA-256 de su ruta. La ruta real está en el archivo .env local (no se sube a GitHub).
// Para cambiarla, calcula la huella de la nueva ruta (por ejemplo "/mi-ruta") con:
//   node -e "console.log(require('crypto').createHash('sha256').update('/mi-ruta').digest('hex'))"
const ADMIN_PATH_HASH = '43585790f9fe308a6a4db0ad959818960a64f16f8495a28d3d2886af0f357158';

export async function isAdminPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path.length < 12 || !globalThis.crypto?.subtle) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(path));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return hex === ADMIN_PATH_HASH;
}
