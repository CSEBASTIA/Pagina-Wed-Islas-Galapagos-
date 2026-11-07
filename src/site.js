export const WHATSAPP = '593994981081';
export const WHATSAPP_DISPLAY = '+593 99 498 1081';
export const EMAIL = 'goldenraytuneles@gmail.com';
export const INSTAGRAM = 'https://www.instagram.com/goldenraytuneles1/';
export const INSTAGRAM_HANDLE = '@goldenraytuneles1';
export const FACEBOOK = 'https://www.facebook.com/profile.php?id=61554388881353';
export const LICENSE_HOLDER = 'Zallox';
// Página web de Zallox. Mientras esté vacía, "Zallox" se muestra como texto sin enlace.
export const LICENSE_URL = '';
export const MAPS = 'https://www.google.com/maps/search/?api=1&query=Puerto%20Villamil%2C%20Isabela%2C%20Gal%C3%A1pagos';

export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC', ...options,
  }).format(new Date(`${value}T12:00:00Z`));
}

export async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'GoldenRayAdmin',
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
  return data;
}
