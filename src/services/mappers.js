// Conversión entre las filas de Supabase y el formato que usa la web.
// No importa el cliente de Supabase para poder probarse con node --test.

export function todayInGalapagos(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Galapagos', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function toTour(row, resolveImage = (path) => path) {
  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    description: row.description,
    duration: row.duration || '',
    difficulty: row.difficulty,
    highlights: row.highlights || [],
    image: resolveImage(row.image),
    imagePath: row.image,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export function toDeparture(row) {
  return {
    id: row.id,
    tourId: row.tour_id,
    stops: row.stops || [],
    date: row.departs_on,
    time: String(row.departs_at).slice(0, 5),
    spots: row.spots,
    note: row.note || '',
  };
}

const byDateTime = (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);

export function buildSite(tourRows, departureRows, resolveImage) {
  const departures = departureRows.map(toDeparture).sort(byDateTime);
  return tourRows.map((row) => ({
    ...toTour(row, resolveImage),
    // Una salida combinada aparece en cada uno de los tours que recorre.
    departures: departures.filter((departure) => departure.tourId === row.id || departure.stops.includes(row.title)),
  }));
}

export function toGalleryPhoto(row, resolveImage = (path) => path) {
  return {
    id: row.id,
    src: resolveImage(row.image),
    title: row.title,
    detail: row.detail || '',
    category: row.category,
    featured: row.featured,
  };
}

export function slugify(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '') || 'tour';
}

export function uniqueSlug(base, taken) {
  let slug = base;
  for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

export function friendlyError(error) {
  if (!error) return 'No se pudo completar la acción.';
  if (error.code === '23505') return 'Ya existe un registro igual: revisa que no se repita el mismo tour, fecha y hora.';
  if (error.code === '23514') return 'Hay un dato fuera de los límites permitidos. Revisa el formulario.';
  if (error.code === '23503') return 'El tour seleccionado ya no existe.';
  if (error.code === '42501' || error.status === 401 || error.status === 403) {
    return 'Tu sesión no tiene permisos de administrador.';
  }
  if (/invalid login credentials/i.test(error.message || '')) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(error.message || '')) return 'El correo de esta cuenta aún no está confirmado.';
  if (/fetch|network/i.test(error.message || '')) return 'No hay conexión con el servidor. Inténtalo de nuevo.';
  return error.message || 'No se pudo completar la acción.';
}
