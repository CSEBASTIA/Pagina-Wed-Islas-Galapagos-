import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialStore } from './seed.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultDataFile = path.join(root, 'data', 'site.json');

export function readStore(file = defaultDataFile) {
  if (!fs.existsSync(file)) {
    writeStore(structuredClone(initialStore), file);
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data.tours) || !Array.isArray(data.departures)) {
    throw new Error('El archivo de datos no tiene un formato válido.');
  }
  let migrated = false;
  for (const tour of data.tours) {
    const original = initialStore.tours.find((item) => item.id === tour.id);
    const legacyImages = {
      'los-tuneles': '/images/GALERIA1.jpg',
      tintoreras: '/images/GALERIA2.jpg',
      'sierra-negra': '/images/GALERIA3.jpg',
    };
    if (original && tour.image === legacyImages[tour.id]) {
      tour.image = original.image;
      migrated = true;
    }
    if (!tour.difficulty) {
      tour.difficulty = original?.difficulty || 'A consultar';
      migrated = true;
    }
    if (!Array.isArray(tour.highlights)) {
      tour.highlights = original?.highlights || [];
      migrated = true;
    }
  }
  if (migrated) writeStore(data, file);
  return data;
}

export function writeStore(data, file = defaultDataFile) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporary, file);
}
