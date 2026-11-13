import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSite, friendlyError, slugify, toGalleryPhoto, todayInGalapagos, uniqueSlug } from './mappers.js';

const tourRow = {
  id: 'los-tuneles', title: 'Los Túneles', destination: 'Isabela', description: 'Snorkel entre túneles de lava.',
  duration: null, difficulty: 'Moderado', highlights: ['Snorkel'], image: '/images/GALERIA6.jpg', active: true, sort_order: 10,
};

test('agrupa las salidas por tour, ordenadas y con la hora en HH:MM', () => {
  const site = buildSite([tourRow, { ...tourRow, id: 'tintoreras', title: 'Tintoreras' }], [
    { id: 'b', tour_id: 'los-tuneles', departs_on: '2026-12-05', departs_at: '08:30:00', spots: 12, note: null },
    { id: 'a', tour_id: 'los-tuneles', departs_on: '2026-11-18', departs_at: '08:30:00', spots: 10, note: 'Nota' },
  ], (path) => `https:${path}`);
  assert.equal(site.length, 2);
  assert.deepEqual(site[0].departures.map((d) => d.id), ['a', 'b']);
  assert.equal(site[0].departures[0].time, '08:30');
  assert.equal(site[0].departures[1].note, '');
  assert.equal(site[0].image, 'https:/images/GALERIA6.jpg');
  assert.equal(site[0].imagePath, '/images/GALERIA6.jpg');
  assert.equal(site[1].departures.length, 0);
});

test('una salida combinada aparece en cada tour que recorre', () => {
  const site = buildSite([tourRow, { ...tourRow, id: 'tintoreras', title: 'Tintoreras' }, { ...tourRow, id: 'sierra-negra', title: 'Sierra Negra' }], [
    { id: 'a', tour_id: 'los-tuneles', stops: ['Los Túneles', 'Tintoreras', 'Finado'], departs_on: '2026-12-04', departs_at: '08:00:00', spots: 10, note: '' },
  ]);
  assert.deepEqual(site.map((tour) => tour.departures.length), [1, 1, 0]);
  assert.deepEqual(site[1].departures[0].stops, ['Los Túneles', 'Tintoreras', 'Finado']);
});

test('convierte fotos de la galería', () => {
  const photo = toGalleryPhoto({ id: '1', image: 'equipo/a.jpg', title: 'A', detail: null, category: 'Paisajes', featured: true }, (p) => `/x/${p}`);
  assert.deepEqual(photo, { id: '1', src: '/x/equipo/a.jpg', title: 'A', detail: '', category: 'Paisajes', featured: true });
});

test('crea identificadores de tour legibles y únicos', () => {
  assert.equal(slugify('Los Túneles de Cabo Rosa!'), 'los-tuneles-de-cabo-rosa');
  assert.equal(slugify('¡¡!!'), 'tour');
  assert.equal(uniqueSlug('sierra-negra', new Set(['sierra-negra', 'sierra-negra-2'])), 'sierra-negra-3');
});

test('usa la fecha de Galápagos', () => {
  assert.equal(todayInGalapagos(new Date('2026-11-08T03:00:00Z')), '2026-11-07');
  assert.equal(todayInGalapagos(new Date('2026-11-08T07:00:00Z')), '2026-11-08');
});

test('traduce los errores de la base de datos', () => {
  assert.match(friendlyError({ code: '23505' }), /mismo tour, fecha y hora/);
  assert.match(friendlyError({ code: '42501' }), /permisos/);
  assert.match(friendlyError({ message: 'Invalid login credentials' }), /incorrectos/);
});
