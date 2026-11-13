// Turnos: salidas que recorren uno o varios tours el mismo día.
// La lista pegada trae una línea con la fecha («4 de diciembre») y debajo
// los tours de esa salida separados por puntos o comas.

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const MAX_STOPS = 6;

export function normalize(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function readDate(line, today) {
  const match = normalize(line).match(/^(\d{1,2}) (?:de )?([a-z]{3,})(?: (?:de |del )?(\d{4}))?$/);
  if (!match) return null;
  const word = match[2] === 'setiembre' ? 'septiembre' : match[2];
  const month = MONTHS.findIndex((name) => name.startsWith(word));
  if (month < 0) return null;
  const day = Number(match[1]);
  const build = (year) => {
    const date = new Date(Date.UTC(year, month, day));
    return date.getUTCMonth() === month && date.getUTCDate() === day ? date.toISOString().slice(0, 10) : null;
  };
  if (match[3]) return build(Number(match[3]));
  const year = Number(today.slice(0, 4));
  const date = build(year);
  return date && date < today ? build(year + 1) : date;
}

export function splitStops(line) {
  return String(line).split(/[.,;/+\n]+/).map((part) => part.trim().replace(/\s+/g, ' ')).filter((part) => normalize(part));
}

// Cada fecha con su línea de tours es una sola salida.
export function parseTurnos(text, today) {
  const turnos = [];
  const unread = [];
  let date = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const found = readDate(line, today);
    if (found) { date = found; continue; }
    const names = splitStops(line);
    if (!date || /^\d/.test(line) || !names.length) { unread.push(line); if (/^\d/.test(line)) date = null; continue; }
    turnos.push({ date, names });
  }
  return { turnos, unread };
}

export function matchTour(name, tours) {
  const wanted = normalize(name);
  if (wanted.length < 3) return null;
  return tours.find((tour) => normalize(tour.title) === wanted)
    || tours.find((tour) => { const title = normalize(tour.title); return title.includes(wanted) || wanted.includes(title); })
    || tours.find((tour) => sameWords(wanted, normalize(tour.title)))
    || null;
}

// «Cormorant» y «Cormoranes» son el mismo sitio: basta con que cada palabra
// escrita empiece igual (6 letras) que alguna palabra del título.
function sameWords(wanted, title) {
  const words = wanted.split(' ').filter((word) => word.length >= 6);
  const titleWords = title.split(' ');
  return words.length > 0 && words.every((word) => titleWords.some((other) => other.slice(0, 6) === word.slice(0, 6)));
}

// Convierte los nombres escritos en una salida: el primer tour reconocido es el
// principal y stops lleva todos los nombres en orden (vacío si es un solo tour).
export function resolveStops(names, tours) {
  const all = [];
  const unknown = [];
  let tourId = '';
  for (const name of names) {
    const tour = matchTour(name, tours);
    const label = tour ? tour.title : name;
    if (all.some((item) => normalize(item) === normalize(label))) continue;
    all.push(label);
    if (!tour) unknown.push(label);
    else if (!tourId) tourId = tour.id;
  }
  return { tourId, stops: all.length > 1 ? all : [], title: all.join(' · '), unknown };
}

export function departureTitle(departure, tours) {
  if (departure.stops?.length) return departure.stops.join(' · ');
  return tours.find((tour) => tour.id === departure.tourId)?.title || 'Tour eliminado';
}
