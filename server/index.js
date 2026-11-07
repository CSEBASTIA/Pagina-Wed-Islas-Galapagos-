import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultDataFile, readStore, writeStore } from './store.js';
import { imageChoices } from './seed.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cookieName = 'golden_ray_admin';
const sessionLifetime = 8 * 60 * 60 * 1000;
const loginWindow = 15 * 60 * 1000;
const requestHeader = 'GoldenRayAdmin';

function todayInGalapagos() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function string(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max + 1) : '';
}

function validateTour(input) {
  const highlights = Array.isArray(input.highlights) ? input.highlights : [];
  const tour = {
    title: string(input.title, 100),
    destination: string(input.destination, 80),
    description: string(input.description, 600),
    duration: string(input.duration, 60),
    difficulty: string(input.difficulty, 30) || 'A consultar',
    highlights: highlights.map((item) => string(item, 30)).filter(Boolean),
    image: string(input.image, 150),
    active: input.active === true,
  };
  if (tour.title.length < 3 || tour.title.length > 100 ||
      tour.destination.length < 2 || tour.destination.length > 80 ||
      tour.description.length < 15 || tour.description.length > 600 ||
      tour.duration.length < 2 || tour.duration.length > 60 ||
      !['Fácil', 'Moderado', 'Difícil', 'A consultar'].includes(tour.difficulty) ||
      tour.highlights.length > 4 || tour.highlights.some((item) => item.length > 30) ||
      !imageChoices.includes(tour.image)) {
    throw new Error('Completa los datos del tour y elige una imagen disponible.');
  }
  return tour;
}

function validateDeparture(input, data) {
  const departure = {
    tourId: string(input.tourId, 80),
    date: string(input.date, 10),
    time: string(input.time, 5),
    spots: Number(input.spots),
    note: string(input.note, 120),
  };
  if (!data.tours.some((tour) => tour.id === departure.tourId)) {
    throw new Error('Selecciona un tour válido.');
  }
  const date = new Date(`${departure.date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departure.date) ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== departure.date ||
      departure.date < todayInGalapagos()) {
    throw new Error('Selecciona una fecha válida desde hoy en adelante.');
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(departure.time) ||
      !Number.isInteger(departure.spots) || departure.spots < 1 || departure.spots > 99 ||
      departure.note.length > 120) {
    throw new Error('Revisa la hora, los cupos y la nota de la salida.');
  }
  return departure;
}

function secretMatches(provided, expected) {
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function makeSession(secret) {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + sessionLifetime })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

function validSession(token, secret) {
  if (!token || !secret) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = sign(payload, secret);
  if (signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(session.expires) && session.expires > Date.now();
  } catch {
    return false;
  }
}

function cookieOptions(req, maxAge = sessionLifetime) {
  return { httpOnly: true, sameSite: 'strict', secure: req.secure, path: '/', maxAge };
}

export function createApp({
  dataFile = process.env.DATA_FILE || defaultDataFile,
  adminSecret = process.env.ADMIN_SECRET || '',
} = {}) {
  const app = express();
  const failures = new Map();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '40kb' }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) &&
        req.get('x-requested-with') !== requestHeader) {
      return res.status(403).json({ error: 'Solicitud no permitida.' });
    }
    next();
  });

  const configured = adminSecret.length >= 16;
  const authenticated = (req) => {
    const cookie = req.headers.cookie?.split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${cookieName}=`));
    return validSession(cookie?.slice(cookieName.length + 1), adminSecret);
  };
  const requireAdmin = (req, res, next) => {
    if (!configured) return res.status(503).json({ error: 'Configura ADMIN_SECRET en el servidor.' });
    if (!authenticated(req)) return res.status(401).json({ error: 'Acceso restringido.' });
    next();
  };
  const update = (res, callback) => {
    try {
      const data = readStore(dataFile);
      const result = callback(data);
      writeStore(data, dataFile);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/site', (_req, res) => {
    try {
      const data = readStore(dataFile);
      const today = todayInGalapagos();
      res.json({
        tours: data.tours.filter((tour) => tour.active).map((tour) => ({
          ...tour,
          departures: data.departures
            .filter((departure) => departure.tourId === tour.id && departure.date >= today)
            .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
        })),
      });
    } catch {
      res.status(500).json({ error: 'No se pudo cargar el sitio.' });
    }
  });
  app.post('/api/auth/login', (req, res) => {
    if (!configured) return res.status(503).json({ error: 'Configura ADMIN_SECRET en el servidor.' });
    const key = req.ip;
    const attempts = (failures.get(key) || []).filter((time) => Date.now() - time < loginWindow);
    if (attempts.length >= 5) return res.status(429).json({ error: 'Demasiados intentos. Prueba más tarde.' });
    if (!secretMatches(string(req.body?.secret, 200), adminSecret)) {
      attempts.push(Date.now());
      failures.set(key, attempts);
      return res.status(401).json({ error: 'Clave incorrecta.' });
    }
    failures.delete(key);
    res.cookie(cookieName, makeSession(adminSecret), cookieOptions(req));
    res.json({ authenticated: true });
  });
  app.get('/api/auth/session', (req, res) => res.json({ authenticated: configured && authenticated(req) }));
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie(cookieName, cookieOptions(req, 0));
    res.json({ authenticated: false });
  });
  app.get('/api/manage', requireAdmin, (_req, res) => {
    try {
      res.json({ ...readStore(dataFile), imageChoices });
    } catch {
      res.status(500).json({ error: 'No se pudieron cargar los datos.' });
    }
  });
  app.post('/api/manage/tours', requireAdmin, (req, res) => update(res, (data) => {
    const tour = { id: crypto.randomUUID(), ...validateTour(req.body || {}) };
    data.tours.push(tour);
    return tour;
  }));
  app.put('/api/manage/tours/:id', requireAdmin, (req, res) => update(res, (data) => {
    const index = data.tours.findIndex((tour) => tour.id === req.params.id);
    if (index < 0) throw new Error('Tour no encontrado.');
    data.tours[index] = { id: req.params.id, ...validateTour(req.body || {}) };
    return data.tours[index];
  }));
  app.delete('/api/manage/tours/:id', requireAdmin, (req, res) => update(res, (data) => {
    const index = data.tours.findIndex((tour) => tour.id === req.params.id);
    if (index < 0) throw new Error('Tour no encontrado.');
    data.tours.splice(index, 1);
    data.departures = data.departures.filter((departure) => departure.tourId !== req.params.id);
    return { deleted: true };
  }));
  app.post('/api/manage/departures', requireAdmin, (req, res) => update(res, (data) => {
    const departure = { id: crypto.randomUUID(), ...validateDeparture(req.body || {}, data) };
    data.departures.push(departure);
    return departure;
  }));
  app.put('/api/manage/departures/:id', requireAdmin, (req, res) => update(res, (data) => {
    const index = data.departures.findIndex((departure) => departure.id === req.params.id);
    if (index < 0) throw new Error('Salida no encontrada.');
    data.departures[index] = { id: req.params.id, ...validateDeparture(req.body || {}, data) };
    return data.departures[index];
  }));
  app.delete('/api/manage/departures/:id', requireAdmin, (req, res) => update(res, (data) => {
    const index = data.departures.findIndex((departure) => departure.id === req.params.id);
    if (index < 0) throw new Error('Salida no encontrada.');
    data.departures.splice(index, 1);
    return { deleted: true };
  }));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  const dist = path.join(root, 'dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist, { index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({ error: error.status === 413 ? 'Solicitud demasiado grande.' : 'Solicitud inválida.' });
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  const app = createApp();
  app.listen(port, host, () => {
    console.log(`Golden Ray I: http://localhost:${port}`);
    if ((process.env.ADMIN_SECRET || '').length < 16) {
      console.warn('Gestión desactivada: configura ADMIN_SECRET (mínimo 16 caracteres).');
    }
  });
}
