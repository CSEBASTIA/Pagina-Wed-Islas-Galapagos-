import React, { useEffect, useRef, useState } from 'react';
import { PageHero } from '../components/Layout.jsx';
import { ACCEPTED_TYPES, MAX_MB, MAX_PHOTOS, checkPhoto, optimizePhoto } from '../photoCheck.js';
import { Link, usePageTitle } from '../router.jsx';
import { submitExperience } from '../services/experiences.js';
import { whatsappUrl } from '../site.js';

const blankForm = { name: '', tour: '', comment: '', consent: false };
const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;
const formatSize = (bytes) => (bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB`);

export default function UploadPhotosPage({ site }) {
  usePageTitle('Sube tu experiencia');
  const [photos, setPhotos] = useState([]);
  const [problems, setProblems] = useState([]);
  const [checking, setChecking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const input = useRef(null);
  const nextId = useRef(0);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const full = photos.length >= MAX_PHOTOS;

  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  async function addFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    setChecking(true);
    setStatus(null);
    const issues = [];
    const accepted = [];
    const known = new Set(photosRef.current.map((photo) => photo.key));
    for (const file of files) {
      if (known.has(fileKey(file))) { issues.push(`${file.name}: ya está en la lista.`); continue; }
      if (photosRef.current.length + accepted.length >= MAX_PHOTOS) {
        issues.push(`${file.name}: solo puedes subir ${MAX_PHOTOS} fotos por envío.`);
        continue;
      }
      const result = await checkPhoto(file);
      if (result.error) { issues.push(result.error); continue; }
      let optimized;
      try { optimized = await optimizePhoto(file); } catch { issues.push(`${file.name}: no se pudo preparar la foto.`); continue; }
      known.add(fileKey(file));
      nextId.current += 1;
      accepted.push({ id: nextId.current, key: fileKey(file), name: file.name, originalSize: file.size, file: optimized, url: URL.createObjectURL(optimized) });
    }
    setPhotos((list) => [...list, ...accepted]);
    setProblems(issues);
    setChecking(false);
    if (input.current) input.current.value = '';
  }

  function removePhoto(id) {
    setPhotos((list) => list.filter((photo) => {
      if (photo.id === id) URL.revokeObjectURL(photo.url);
      return photo.id !== id;
    }));
    setProblems([]);
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (!full && !checking) addFiles(event.dataTransfer.files);
  }

  async function submit(event) {
    event.preventDefault();
    if (!photos.length) { setStatus({ type: 'error', text: 'Agrega al menos una foto.' }); return; }
    if (!form.consent) { setStatus({ type: 'error', text: 'Debes aceptar la autorización para enviar tus fotos.' }); return; }
    setSending(true);
    setStatus(null);
    try {
      await submitExperience({ files: photos.map((photo) => photo.file), name: form.name.trim(), tour: form.tour, comment: form.comment.trim() });
      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
      setPhotos([]);
      setForm(blankForm);
      setStatus({ type: 'success', text: '¡Gracias! Recibimos tus fotos. Las revisaremos antes de publicarlas en la galería.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message, whatsapp: true });
    } finally {
      setSending(false);
    }
  }

  const count = photos.length;
  return <>
    <PageHero eyebrow="COMPARTE TU VIAJE" title="Sube tu experiencia" image="/images/tortuga2.jpeg"
      lead={`¿Viajaste con Golden Ray I? Comparte hasta ${MAX_PHOTOS} fotos de tu salida. Las revisamos antes de publicarlas en la galería.`} />

    <section className="upload-section section" aria-label="Formulario para subir fotos">
      <div className="container upload__grid">
        <form className="upload-form" onSubmit={submit} noValidate>
          <label className={`dropzone ${dragging ? 'dropzone--active' : ''} ${full ? 'dropzone--full' : ''}`}
            onDragOver={(event) => { event.preventDefault(); if (!full) setDragging(true); }}
            onDragLeave={() => setDragging(false)} onDrop={onDrop}>
            <input ref={input} className="visually-hidden" type="file" accept={ACCEPTED_TYPES} multiple
              disabled={full || checking} onChange={(event) => addFiles(event.target.files)} />
            <strong>{full ? `Ya elegiste ${MAX_PHOTOS} fotos` : 'Arrastra tus fotos aquí'}</strong>
            <span>{full ? 'Quita alguna si quieres cambiarla.' : <>o <u>elígelas desde tu dispositivo</u></>}</span>
            <small>JPG, PNG o WEBP · máximo {MAX_MB} MB cada una · {count}/{MAX_PHOTOS}</small>
          </label>

          {checking && <p className="upload-note" role="status">Revisando y optimizando fotos…</p>}
          {problems.length > 0 && <ul className="upload-problems" role="alert">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>}

          {count > 0 && <ul className="upload-previews" aria-label="Fotos elegidas">
            {photos.map((photo, index) => <li key={photo.id}>
              <img src={photo.url} alt={`Foto ${index + 1}: ${photo.name}`} />
              <button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Quitar ${photo.name}`}>✕</button>
            </li>)}
          </ul>}
          {count > 0 && <p className="upload-note">Listas para enviar: {formatSize(photos.reduce((sum, photo) => sum + photo.file.size, 0))} en total (originales: {formatSize(photos.reduce((sum, photo) => sum + photo.originalSize, 0))}).</p>}

          <div className="upload-fields">
            <label>Tu nombre <span>(opcional, para darte crédito)</span>
              <input maxLength="60" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>Tour en el que participaste <span>(opcional)</span>
              <select value={form.tour} onChange={(event) => setForm({ ...form, tour: event.target.value })}>
                <option value="">Selecciona un tour</option>
                {site.tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
              </select>
            </label>
            <label className="upload-fields__wide">Cuéntanos tu experiencia <span>(opcional)</span>
              <textarea maxLength="300" rows="3" value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} />
            </label>
          </div>

          <label className="upload-consent">
            <input type="checkbox" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} />
            <span>Confirmo que soy autor de estas fotos o tengo permiso para compartirlas, que las personas que aparecen están de acuerdo, y autorizo a Golden Ray I a publicarlas en este sitio. Acepto los <Link to="/terminos#termino-fotos">términos y condiciones</Link> y la <Link to="/privacidad">política de privacidad</Link>.</span>
          </label>

          <button className="button button--dark" type="submit" disabled={sending || checking}>
            {sending ? 'Enviando…' : count ? `Enviar ${count} ${count === 1 ? 'foto' : 'fotos'}` : 'Enviar fotos'} <span aria-hidden="true">→</span>
          </button>

          {status && <p className={`form-message ${status.type === 'error' ? 'form-message--error' : ''}`} role={status.type === 'error' ? 'alert' : 'status'}>
            {status.text}
            {status.whatsapp && <> También puedes <a href={whatsappUrl('Hola, quiero compartir fotos de mi salida con Golden Ray I.')} target="_blank" rel="noopener noreferrer">enviarlas por WhatsApp</a>.</>}
          </p>}
        </form>

        <aside className="upload-tips">
          <h2>Antes de enviar</h2>
          <ul>
            <li><strong>Hasta {MAX_PHOTOS} fotos</strong> por envío, en JPG, PNG o WEBP y de máximo {MAX_MB} MB.</li>
            <li><strong>Optimización automática:</strong> reducimos el tamaño de las fotos y quitamos datos ocultos como la ubicación GPS antes de enviarlas.</li>
            <li><strong>Solo fotografías:</strong> el formulario rechaza archivos que no sean imágenes o que sean demasiado pequeños.</li>
            <li><strong>Revisión previa:</strong> publicamos las fotos después de revisarlas; algunas pueden no publicarse.</li>
            <li><strong>Respeta la fauna:</strong> preferimos fotos tomadas a una distancia segura de los animales.</li>
          </ul>
          <Link className="underlined-link" to="/galeria">Volver a la galería <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </section>
  </>;
}
