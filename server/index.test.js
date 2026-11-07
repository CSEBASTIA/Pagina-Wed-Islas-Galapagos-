import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { createApp } from './index.js';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'golden-ray-test-'));
const server = createApp({ dataFile: path.join(directory, 'site.json'), adminSecret: 'test-secret-123456789' }).listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'GoldenRayAdmin' };

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('publica tours y restringe la gestión a la clave única', async () => {
  const publicResponse = await fetch(`${base}/api/site`);
  assert.equal(publicResponse.status, 200);
  const publicData = await publicResponse.json();
  assert.equal(publicData.tours.length, 6);
  assert.ok(publicData.tours.every((tour) => tour.departures.length === 0));
  assert.ok(publicData.tours.every((tour) => tour.difficulty && Array.isArray(tour.highlights)));

  assert.equal((await fetch(`${base}/api/manage`)).status, 401);
  const denied = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers, body: JSON.stringify({ secret: 'incorrecta' }),
  });
  assert.equal(denied.status, 401);
  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers, body: JSON.stringify({ secret: 'test-secret-123456789' }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(login.headers.get('set-cookie'), /HttpOnly/i);

  const tourResponse = await fetch(`${base}/api/manage/tours`, {
    method: 'POST', headers: { ...headers, Cookie: cookie },
    body: JSON.stringify({
      title: 'Nuevo tour', destination: 'Isabela', duration: '3 horas',
      description: 'Recorrido de prueba por la costa de Isabela.',
      difficulty: 'Fácil', highlights: ['Aves', 'Fotografía'],
      image: '/images/isla tortuga.jpeg', active: true,
    }),
  });
  assert.equal(tourResponse.status, 200);
  const tour = await tourResponse.json();
  const future = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const departure = await fetch(`${base}/api/manage/departures`, {
    method: 'POST', headers: { ...headers, Cookie: cookie },
    body: JSON.stringify({ tourId: tour.id, date: future, time: '08:30', spots: 8, note: '' }),
  });
  assert.equal(departure.status, 200);
  const updated = await (await fetch(`${base}/api/site`)).json();
  assert.equal(updated.tours.find((item) => item.id === tour.id).departures.length, 1);
  assert.deepEqual(updated.tours.find((item) => item.id === tour.id).highlights, ['Aves', 'Fotografía']);
  assert.equal((await fetch(`${base}/api/manage/tours/${tour.id}`, {
    method: 'DELETE', headers: { Cookie: cookie },
  })).status, 403);
});
