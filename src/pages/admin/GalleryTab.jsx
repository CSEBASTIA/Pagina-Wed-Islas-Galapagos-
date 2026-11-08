import React, { useEffect, useRef, useState } from 'react';
import { ACCEPTED_TYPES, checkPhoto, optimizePhoto } from '../../photoCheck.js';
import { photoCategories } from '../../photos.js';
import {
  addGalleryPhotos, deleteGalleryPhoto, swapGalleryOrder, updateGalleryPhoto,
} from '../../services/admin.js';

const MAX_AT_ONCE = 10;
const baseName = (name) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 80) || 'Foto';

function GalleryRow({ photo, index, total, busy, onSave, onMove, onDelete }) {
  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState(photo.category);
  const changed = title.trim() !== photo.title || category !== photo.category;
  return <div className={`gallery-admin__item ${photo.published ? '' : 'gallery-admin__item--hidden'}`}>
    <img src={photo.src} alt="" loading="lazy" />
    <div className="gallery-admin__fields">
      <label>Título<input maxLength="80" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>Categoría<select value={category} onChange={(event) => setCategory(event.target.value)}>{photoCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <small>{photo.source === 'visitante' ? `Enviada por ${photo.credit || 'un visitante'}` : 'Foto del equipo'}{photo.published ? '' : ' · Oculta'}</small>
    </div>
    <div className="gallery-admin__actions">
      <label className="checkbox-label"><input type="checkbox" checked={photo.published} disabled={busy} onChange={(event) => onSave(photo, { published: event.target.checked }, event.target.checked ? 'Foto visible en la galería.' : 'Foto oculta de la galería.')} /> Visible</label>
      <label className="checkbox-label"><input type="checkbox" checked={photo.featured} disabled={busy} onChange={(event) => onSave(photo, { featured: event.target.checked }, event.target.checked ? 'Foto agregada al carrusel.' : 'Foto quitada del carrusel.')} /> En el carrusel</label>
      <div className="gallery-admin__buttons">
        <button type="button" disabled={busy || !changed || title.trim().length < 2} onClick={() => onSave(photo, { title: title.trim(), category }, 'Foto actualizada.')}>Guardar</button>
        <button type="button" disabled={busy || index === 0} onClick={() => onMove(index, -1)} aria-label="Subir en el orden">↑</button>
        <button type="button" disabled={busy || index === total - 1} onClick={() => onMove(index, 1)} aria-label="Bajar en el orden">↓</button>
        <button type="button" className="danger" disabled={busy} onClick={() => onDelete(photo)}>Borrar</button>
      </div>
    </div>
  </div>;
}

export default function GalleryTab({ photos, tours, busy, act }) {
  const [queue, setQueue] = useState([]);
  const [problems, setProblems] = useState([]);
  const [preparing, setPreparing] = useState(false);
  const input = useRef(null);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  useEffect(() => () => queueRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  async function pick(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    setPreparing(true);
    const issues = [];
    const ready = [];
    for (const file of files) {
      if (queueRef.current.length + ready.length >= MAX_AT_ONCE) { issues.push(`${file.name}: puedes subir hasta ${MAX_AT_ONCE} fotos a la vez.`); continue; }
      const check = await checkPhoto(file);
      if (check.error) { issues.push(check.error); continue; }
      try {
        const optimized = await optimizePhoto(file);
        ready.push({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file: optimized, url: URL.createObjectURL(optimized), title: baseName(file.name), detail: '', category: 'Paisajes', featured: false });
      } catch {
        issues.push(`${file.name}: no se pudo preparar la foto.`);
      }
    }
    setQueue((list) => [...list, ...ready]);
    setProblems(issues);
    setPreparing(false);
    if (input.current) input.current.value = '';
  }

  const updateItem = (id, fields) => setQueue((list) => list.map((item) => (item.id === id ? { ...item, ...fields } : item)));
  const removeItem = (id) => setQueue((list) => list.filter((item) => {
    if (item.id === id) URL.revokeObjectURL(item.url);
    return item.id !== id;
  }));

  function upload() {
    const items = queueRef.current;
    act(async () => {
      await addGalleryPhotos(items);
      items.forEach((item) => URL.revokeObjectURL(item.url));
      setQueue([]);
    }, items.length === 1 ? 'Foto agregada a la galería.' : `${items.length} fotos agregadas a la galería.`);
  }

  const save = (photo, fields, success) => act(() => updateGalleryPhoto(photo.id, fields), success);
  const move = (index, delta) => act(() => swapGalleryOrder(photos[index], photos[index + delta]), 'Orden actualizado.');
  function remove(photo) {
    if (!window.confirm(`¿Borrar la foto «${photo.title}» de la galería? Esta acción no se puede deshacer.`)) return;
    act(() => deleteGalleryPhoto(photo, tours), 'Foto borrada de la galería.');
  }

  return <>
    <section className="manage-panel">
      <div className="manage-panel__heading"><h2>Agregar fotos a la galería</h2><p>Hasta {MAX_AT_ONCE} fotos a la vez. Se optimizan antes de subirse (máx. 1600 px, sin ubicación GPS).</p></div>
      <label className={`dropzone dropzone--compact ${preparing ? 'dropzone--full' : ''}`}>
        <input ref={input} className="visually-hidden" type="file" accept={ACCEPTED_TYPES} multiple disabled={preparing || busy} onChange={(event) => pick(event.target.files)} />
        <strong>{preparing ? 'Preparando fotos…' : 'Elegir fotos'}</strong>
        <small>JPG, PNG o WEBP · {queue.length}/{MAX_AT_ONCE}</small>
      </label>
      {problems.length > 0 && <ul className="upload-problems" role="alert">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>}
      {queue.length > 0 && <>
        <div className="gallery-admin__queue">
          {queue.map((item) => <div className="gallery-admin__item" key={item.id}>
            <img src={item.url} alt="" />
            <div className="gallery-admin__fields">
              <label>Título<input maxLength="80" value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} /></label>
              <label>Detalle (opcional)<input maxLength="120" value={item.detail} onChange={(event) => updateItem(item.id, { detail: event.target.value })} /></label>
              <label>Categoría<select value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value })}>{photoCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            </div>
            <div className="gallery-admin__actions">
              <label className="checkbox-label"><input type="checkbox" checked={item.featured} onChange={(event) => updateItem(item.id, { featured: event.target.checked })} /> En el carrusel</label>
              <div className="gallery-admin__buttons"><button type="button" className="danger" onClick={() => removeItem(item.id)}>Quitar</button></div>
            </div>
          </div>)}
        </div>
        <div className="form-actions"><button type="button" className="button button--dark" disabled={busy || queue.some((item) => item.title.trim().length < 2)} onClick={upload}>Subir {queue.length} {queue.length === 1 ? 'foto' : 'fotos'}</button></div>
      </>}
    </section>

    <section className="manage-panel">
      <div className="manage-panel__heading"><h2>Fotos de la galería ({photos.length})</h2><p>Las fotos ocultas no se ven en la web. Usa las flechas para cambiar el orden.</p></div>
      <div className="gallery-admin__list">
        {photos.map((photo, index) => <GalleryRow key={`${photo.id}-${photo.title}-${photo.category}`} photo={photo} index={index} total={photos.length}
          busy={busy} onSave={save} onMove={move} onDelete={remove} />)}
        {photos.length === 0 && <p>Todavía no hay fotos en la galería.</p>}
      </div>
    </section>
  </>;
}
