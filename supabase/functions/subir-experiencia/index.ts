// Edge Function "subir-experiencia": recibe las fotos de «Sube tu experiencia».
// Repite en el servidor las validaciones del formulario, limita los envíos por IP
// y guarda las fotos como pendientes de revisión en el bucket privado "envios".
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const MAX_PHOTOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const MIN_SIDE = 400;
const PER_IP_PER_HOUR = 3;
const MAX_PER_DAY = 60;
const PENDING_DAYS = 30;
const BUCKET = 'envios';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Kind = { mime: string; ext: string };
type Photo = { bytes: Uint8Array; kind: Kind; width: number; height: number };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

// Detecta el formato por su firma binaria, no por el nombre ni el tipo declarado.
function detect(b: Uint8Array): Kind | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { mime: 'image/webp', ext: 'webp' };
  return null;
}

// Lee ancho y alto de la cabecera de la imagen sin decodificarla.
function dimensions(b: Uint8Array, kind: Kind): { width: number; height: number } | null {
  if (kind.mime === 'image/png') {
    if (b.length < 24) return null;
    const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (kind.mime === 'image/webp') {
    if (b.length < 30) return null;
    const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (chunk === 'VP8 ') return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
    if (chunk === 'VP8L') {
      return {
        width: 1 + (((b[22] & 0x3f) << 8) | b[21]),
        height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
      };
    }
    if (chunk === 'VP8X') return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    return null;
  }
  // JPEG: recorre los marcadores hasta el SOF, que contiene las medidas.
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const marker = b[i + 1];
    if (marker === 0xff) { i += 1; continue; }
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    i += 2 + ((b[i + 2] << 8) | b[i + 3]);
  }
  return null;
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const clean = (value: FormDataEntryValue | null, max: number) => String(value ?? '').trim().slice(0, max) || null;

// Borra los envíos que llevan más de 30 días sin revisarse (fotos incluidas).
async function cleanupOldPending(db: SupabaseClient) {
  const cutoff = new Date(Date.now() - PENDING_DAYS * 86_400_000).toISOString();
  const { data: old } = await db.from('photo_submissions').select('id, submission_photos(storage_path)')
    .eq('status', 'pendiente').lt('created_at', cutoff).limit(20);
  if (!old?.length) return;
  const paths = old.flatMap((item) => (item.submission_photos ?? []).map((photo: { storage_path: string }) => photo.storage_path));
  if (paths.length) await db.storage.from(BUCKET).remove(paths);
  await db.from('photo_submissions').delete().in('id', old.map((item) => item.id));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'El envío no es válido.' }, 400);
  }

  if (form.get('consent') !== 'true') {
    return json({ error: 'Debes aceptar la autorización para enviar tus fotos.' }, 400);
  }
  const files = form.getAll('fotos').filter((entry): entry is File => entry instanceof File);
  if (files.length < 1 || files.length > MAX_PHOTOS) {
    return json({ error: `Envía entre 1 y ${MAX_PHOTOS} fotos.` }, 400);
  }

  const photos: Photo[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return json({ error: `${file.name}: pesa más de 10 MB.` }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detect(bytes);
    if (!kind) return json({ error: `${file.name}: no es una foto JPG, PNG o WEBP.` }, 400);
    const size = dimensions(bytes, kind);
    if (!size) return json({ error: `${file.name}: no se pudo leer la imagen.` }, 400);
    if (Math.min(size.width, size.height) < MIN_SIDE) {
      return json({ error: `${file.name}: la imagen es muy pequeña (mínimo ${MIN_SIDE} px por lado).` }, 400);
    }
    photos.push({ bytes, kind, ...size });
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const db = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey, { auth: { persistSession: false } });

  // La IP se guarda solo como huella con sal secreta, para limitar envíos.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconocida';
  const ipHash = await sha256Hex(`${ip}|${serviceKey}`);
  const [byIp, byDay] = await Promise.all([
    db.from('photo_submissions').select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash).gte('created_at', new Date(Date.now() - 3_600_000).toISOString()),
    db.from('photo_submissions').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86_400_000).toISOString()),
  ]);
  if ((byIp.count ?? 0) >= PER_IP_PER_HOUR) {
    return json({ error: 'Ya enviaste varias fotos en la última hora. Inténtalo más tarde.' }, 429);
  }
  if ((byDay.count ?? 0) >= MAX_PER_DAY) {
    return json({ error: 'Hoy recibimos muchas fotos. Inténtalo de nuevo mañana.' }, 429);
  }

  let tourId: string | null = clean(form.get('tour'), 80);
  if (tourId) {
    const { data } = await db.from('tours').select('id').eq('id', tourId).maybeSingle();
    tourId = data?.id ?? null;
  }

  await cleanupOldPending(db).catch(() => {});

  const { data: submission, error } = await db.from('photo_submissions').insert({
    name: clean(form.get('name'), 60),
    tour_id: tourId,
    comment: clean(form.get('comment'), 300),
    consent_at: new Date().toISOString(),
    ip_hash: ipHash,
  }).select('id').single();
  if (error || !submission) return json({ error: 'No se pudo registrar el envío. Inténtalo de nuevo.' }, 500);

  const uploaded: string[] = [];
  try {
    for (const [index, photo] of photos.entries()) {
      const path = `${submission.id}/${index + 1}.${photo.kind.ext}`;
      const upload = await db.storage.from(BUCKET).upload(path, photo.bytes, { contentType: photo.kind.mime, upsert: false });
      if (upload.error) throw upload.error;
      uploaded.push(path);
      const row = await db.from('submission_photos').insert({
        submission_id: submission.id,
        storage_path: path,
        mime_type: photo.kind.mime,
        size_bytes: photo.bytes.length,
        width: photo.width,
        height: photo.height,
      });
      if (row.error) throw row.error;
    }
  } catch {
    if (uploaded.length) await db.storage.from(BUCKET).remove(uploaded);
    await db.from('photo_submissions').delete().eq('id', submission.id);
    return json({ error: 'No se pudieron guardar las fotos. Inténtalo de nuevo.' }, 500);
  }

  return json({ ok: true, photos: photos.length });
});
