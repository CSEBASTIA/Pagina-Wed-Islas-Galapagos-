import { GALLERY_BUCKET, imageUrl, supabase } from '../lib/supabase.js';
import { friendlyError, slugify, toDeparture, toGalleryPhoto, toTour, todayInGalapagos, uniqueSlug } from './mappers.js';

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

// ---------------------------------------------------------------------------
// Verificación en dos pasos (TOTP). La base de datos solo reconoce como
// administradora una sesión verificada con el segundo paso (nivel aal2).
// ---------------------------------------------------------------------------
export async function mfaStatus() {
  const level = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level.error) fail(level.error);
  if (level.data.currentLevel === 'aal2') return { step: 'ok' };
  const factors = await supabase.auth.mfa.listFactors();
  if (factors.error) fail(factors.error);
  const verified = factors.data.totp || [];
  return verified.length ? { step: 'verify', factorId: verified[0].id } : { step: 'enroll' };
}

export async function startMfaEnrollment() {
  const factors = await supabase.auth.mfa.listFactors();
  for (const factor of factors.data?.all ?? []) {
    if (factor.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp', issuer: 'Golden Ray I', friendlyName: `Panel ${new Date().toISOString().slice(0, 16)}`,
  });
  if (error) fail(error);
  return { step: 'enroll', factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyMfaCode(factorId, code) {
  const clean = String(code).replace(/\D/g, '');
  if (clean.length !== 6) throw new Error('El código tiene 6 dígitos.');
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: clean });
  if (error) {
    if (/invalid|expired/i.test(error.message || '')) throw new Error('Código incorrecto o vencido. Escribe el código que muestra ahora tu app.');
    fail(error);
  }
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

// ---------------------------------------------------------------------------
// Galería
// ---------------------------------------------------------------------------
const SUBMISSIONS_BUCKET = 'envios';

export async function loadGallery() {
  const { data, error } = await supabase.from('gallery_photos')
    .select('id,image,title,detail,category,featured,published,sort_order,source,credit')
    .order('sort_order').order('created_at');
  if (error) fail(error);
  return data.map((row) => ({
    ...toGalleryPhoto(row, imageUrl), path: row.image, published: row.published,
    source: row.source, credit: row.credit, sortOrder: row.sort_order,
  }));
}

async function nextGalleryOrder() {
  const { data } = await supabase.from('gallery_photos').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  return (data?.[0]?.sort_order || 0) + 10;
}

export async function addGalleryPhotos(items) {
  let order = await nextGalleryOrder();
  for (const item of items) {
    if (item.title.trim().length < 2) throw new Error('Cada foto necesita un título de al menos 2 letras.');
    const path = `equipo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const upload = await supabase.storage.from(GALLERY_BUCKET).upload(path, item.file, { contentType: item.file.type, upsert: false });
    if (upload.error) fail(upload.error);
    const insert = await supabase.from('gallery_photos').insert({
      image: path, title: item.title.trim().slice(0, 80), detail: item.detail.trim().slice(0, 120),
      category: item.category, featured: item.featured, sort_order: order, source: 'equipo',
    });
    if (insert.error) {
      await supabase.storage.from(GALLERY_BUCKET).remove([path]);
      fail(insert.error);
    }
    order += 10;
  }
}

export async function updateGalleryPhoto(id, fields) {
  const { data, error } = await supabase.from('gallery_photos').update(fields).eq('id', id).select('id');
  if (error) fail(error);
  requireRows(data, 'No se guardó la foto: puede que ya no exista o que tu sesión no tenga permisos.');
}

export async function swapGalleryOrder(first, second) {
  await updateGalleryPhoto(first.id, { sort_order: second.sortOrder });
  await updateGalleryPhoto(second.id, { sort_order: first.sortOrder });
}

export async function deleteGalleryPhoto(photo, tours) {
  if (tours.some((tour) => tour.imagePath === photo.path)) {
    throw new Error('Esta foto se usa como imagen de un tour. Cambia la foto del tour antes de borrarla.');
  }
  const { data, error } = await supabase.from('gallery_photos').delete().eq('id', photo.id).select('id');
  if (error) fail(error);
  requireRows(data, 'No se borró la foto: puede que ya no exista o que tu sesión no tenga permisos.');
  if (!photo.path.startsWith('/')) await supabase.storage.from(GALLERY_BUCKET).remove([photo.path]);
}

// ---------------------------------------------------------------------------
// Fotos enviadas por visitantes
// ---------------------------------------------------------------------------

export async function loadSubmissions() {
  const { data, error } = await supabase.from('photo_submissions')
    .select('id,name,tour_id,comment,created_at,submission_photos(id,storage_path,width,height,size_bytes,status)')
    .eq('status', 'pendiente').order('created_at', { ascending: false });
  if (error) fail(error);
  const pending = data.map((item) => ({
    ...item,
    photos: (item.submission_photos || []).filter((photo) => photo.status === 'pendiente')
      .sort((a, b) => a.storage_path.localeCompare(b.storage_path)),
  }));
  const paths = pending.flatMap((item) => item.photos.map((photo) => photo.storage_path));
  const urls = {};
  if (paths.length) {
    const signed = await supabase.storage.from(SUBMISSIONS_BUCKET).createSignedUrls(paths, 3600);
    if (signed.error) fail(signed.error);
    for (const entry of signed.data) if (entry.signedUrl) urls[entry.path] = entry.signedUrl;
  }
  return pending.map((item) => ({
    id: item.id,
    name: item.name,
    tourId: item.tour_id,
    comment: item.comment,
    createdAt: item.created_at,
    photos: item.photos.map((photo) => ({
      id: photo.id, path: photo.storage_path, url: urls[photo.storage_path] || '',
      width: photo.width, height: photo.height, size: photo.size_bytes,
    })),
  }));
}

async function markPhoto(id, status) {
  const { data, error } = await supabase.from('submission_photos').update({ status }).eq('id', id).select('id');
  if (error) fail(error);
  requireRows(data, 'No se actualizó la foto: puede que ya se haya revisado o que tu sesión no tenga permisos.');
}

async function closeIfReviewed(submissionId) {
  const { data, error } = await supabase.from('submission_photos').select('status').eq('submission_id', submissionId);
  if (error) fail(error);
  if (data.some((photo) => photo.status === 'pendiente')) return;
  const { data: { user } } = await supabase.auth.getUser();
  const update = await supabase.from('photo_submissions')
    .update({ status: 'revisado', reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
    .eq('id', submissionId);
  if (update.error) fail(update.error);
}

export async function approvePhoto(submission, photo, { title, category, featured }) {
  if (title.trim().length < 2) throw new Error('Escribe un título para la foto.');
  const destination = `visitantes/${photo.path}`;
  const copy = await supabase.storage.from(SUBMISSIONS_BUCKET).copy(photo.path, destination, { destinationBucket: GALLERY_BUCKET });
  if (copy.error) fail(copy.error);
  const insert = await supabase.from('gallery_photos').insert({
    image: destination,
    title: title.trim().slice(0, 80),
    detail: submission.name ? `Foto de ${submission.name}` : 'Foto de un visitante',
    category,
    featured,
    source: 'visitante',
    credit: submission.name || null,
    submission_photo_id: photo.id,
    sort_order: await nextGalleryOrder(),
  });
  if (insert.error) {
    await supabase.storage.from(GALLERY_BUCKET).remove([destination]);
    fail(insert.error);
  }
  await markPhoto(photo.id, 'aprobada');
  await supabase.storage.from(SUBMISSIONS_BUCKET).remove([photo.path]);
  await closeIfReviewed(submission.id);
}

export async function rejectPhoto(submission, photo) {
  const removal = await supabase.storage.from(SUBMISSIONS_BUCKET).remove([photo.path]);
  if (removal.error) fail(removal.error);
  await markPhoto(photo.id, 'rechazada');
  await closeIfReviewed(submission.id);
}

export async function deleteDeparture(id) {
  const { data, error } = await supabase.from('departures').delete().eq('id', id).select('id');
  if (error) fail(error);
  requireRows(data, 'No se eliminó la salida: puede que ya no exista o que tu sesión no tenga permisos.');
}
