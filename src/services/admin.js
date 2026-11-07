import { supabase } from '../lib/supabase.js';
import { friendlyError, slugify, toDeparture, toTour, todayInGalapagos, uniqueSlug } from './mappers.js';

// Fotos del sitio que se pueden asignar a un tour (además de las de la galería).
const siteImages = [
  '/images/Cuatro hermanos.jpeg', '/images/punta cormorant.jpeg', '/images/isla tortuga.jpeg',
  '/images/GALERIA6.jpg', '/images/la de los pajaros.jpeg', '/images/GALERIA7.jpg', '/images/GALERIA1.jpg',
  '/images/tortuga2.jpeg', '/images/Golden RAY.jpeg', '/images/lancha.jpeg', '/images/foto galeria.jpeg',
];

function fail(error) {
  throw new Error(friendlyError(error));
}

function requireRows(data, message) {
  if (!data?.length) throw new Error(message);
}

export async function currentAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase.from('admins').select('user_id,name')
    .eq('user_id', session.user.id).maybeSingle();
  if (error) fail(error);
  return { email: session.user.email, isAdmin: Boolean(data), name: data?.name || '' };
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) fail(error);
  return currentAdmin();
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onSignedOut(callback) {
  const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') callback(); });
  return () => data.subscription.unsubscribe();
}

export async function loadAdminData() {
  const [tours, departures, gallery] = await Promise.all([
    supabase.from('tours').select('*').order('sort_order').order('title'),
    supabase.from('departures').select('*').order('departs_on').order('departs_at'),
    supabase.from('gallery_photos').select('image,title').order('sort_order'),
  ]);
  for (const result of [tours, departures, gallery]) if (result.error) fail(result.error);
  const seen = new Set();
  const imageChoices = [];
  for (const photo of gallery.data) {
    if (!seen.has(photo.image)) { seen.add(photo.image); imageChoices.push({ value: photo.image, label: photo.title }); }
  }
  for (const image of siteImages) {
    if (!seen.has(image)) { seen.add(image); imageChoices.push({ value: image, label: decodeURIComponent(image.split('/').pop()) }); }
  }
  return {
    tours: tours.data.map((row) => toTour(row)),
    departures: departures.data.map(toDeparture),
    imageChoices,
  };
}

export async function saveTour(form, editingId, tours) {
  const highlights = form.highlightsText.split(',').map((item) => item.trim()).filter(Boolean);
  if (highlights.length > 4) throw new Error('Puedes poner como máximo 4 actividades destacadas.');
  if (highlights.some((item) => item.length > 30)) throw new Error('Cada actividad destacada puede tener hasta 30 caracteres.');
  const row = {
    title: form.title.trim(),
    destination: form.destination.trim(),
    description: form.description.trim(),
    duration: form.duration.trim() || null,
    difficulty: form.difficulty,
    highlights,
    image: form.image,
    active: form.active,
  };
  if (editingId) {
    const { data, error } = await supabase.from('tours').update(row).eq('id', editingId).select('id');
    if (error) fail(error);
    requireRows(data, 'No se guardó el tour: puede que ya no exista o que tu sesión no tenga permisos.');
    return;
  }
  const id = uniqueSlug(slugify(row.title), new Set(tours.map((tour) => tour.id)));
  const sortOrder = Math.max(0, ...tours.map((tour) => tour.sortOrder || 0)) + 10;
  const { error } = await supabase.from('tours').insert({ id, ...row, sort_order: sortOrder });
  if (error) fail(error);
}

export async function deleteTour(id) {
  const { data, error } = await supabase.from('tours').delete().eq('id', id).select('id');
  if (error) fail(error);
  requireRows(data, 'No se eliminó el tour: puede que ya no exista o que tu sesión no tenga permisos.');
}

export async function saveDeparture(form, editingId) {
  if (!form.tourId) throw new Error('Selecciona un tour.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || form.date < todayInGalapagos()) {
    throw new Error('Elige una fecha desde hoy en adelante.');
  }
  if (!/^\d{2}:\d{2}/.test(form.time)) throw new Error('Indica la hora de salida.');
  const spots = Number(form.spots);
  if (!Number.isInteger(spots) || spots < 1 || spots > 99) throw new Error('Los cupos deben estar entre 1 y 99.');
  const row = { tour_id: form.tourId, departs_on: form.date, departs_at: form.time, spots, note: form.note.trim() };
  if (editingId) {
    const { data, error } = await supabase.from('departures').update(row).eq('id', editingId).select('id');
    if (error) fail(error);
    requireRows(data, 'No se guardó la salida: puede que ya no exista o que tu sesión no tenga permisos.');
    return;
  }
  const { error } = await supabase.from('departures').insert(row);
  if (error) fail(error);
}

export async function deleteDeparture(id) {
  const { data, error } = await supabase.from('departures').delete().eq('id', id).select('id');
  if (error) fail(error);
  requireRows(data, 'No se eliminó la salida: puede que ya no exista o que tu sesión no tenga permisos.');
}
