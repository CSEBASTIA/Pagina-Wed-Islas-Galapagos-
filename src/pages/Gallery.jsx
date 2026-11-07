import React, { useEffect, useRef, useState } from 'react';
import PhotoCarousel from '../PhotoCarousel.jsx';
import { PageHero } from '../components/Layout.jsx';
import { photoCategories, photos } from '../photos.js';
import { usePageTitle } from '../router.jsx';
import { INSTAGRAM } from '../site.js';

function Lightbox({ items, index, onChange, onClose }) {
  const dialog = useRef(null);
  const photo = items[index];

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  const move = (delta) => onChange((index + delta + items.length) % items.length);

  function onKeyDown(event) {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
  }

  return <dialog className="lightbox" ref={dialog} aria-label={photo.title} onKeyDown={onKeyDown}
    onClose={onClose} onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
    <figure className="lightbox__figure">
      <img src={photo.src} alt={photo.title} />
      <figcaption><strong>{photo.title}</strong><span>{photo.detail}</span><small>{index + 1} / {items.length}</small></figcaption>
    </figure>
    <button type="button" className="lightbox__close" onClick={onClose} aria-label="Cerrar">✕</button>
    {items.length > 1 && <>
      <button type="button" className="arrow-button lightbox__prev" onClick={() => move(-1)} aria-label="Foto anterior">‹</button>
      <button type="button" className="arrow-button lightbox__next" onClick={() => move(1)} aria-label="Foto siguiente">›</button>
    </>}
  </dialog>;
}

export default function GalleryPage() {
  usePageTitle('Galería');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(-1);
  const visible = category ? photos.filter((photo) => photo.category === category) : photos;
  const chooseCategory = (value) => { setOpen(-1); setCategory(value); };

  return <>
    <PageHero eyebrow="POSTALES DE NUESTRAS ISLAS" title="Galería" image="/images/GALERIA7.jpg"
      lead="Imágenes de nuestras salidas, la vida marina y los paisajes que nos inspiran." />

    <PhotoCarousel />

    <section className="gallery-section section" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow">TODAS LAS FOTOS</p><h2 id="gallery-title">Momentos Golden Ray I</h2></div><p>Toca una foto para verla en grande.</p></div>
        <div className="filter-bar" role="group" aria-label="Filtrar fotos">
          <button type="button" className="chip" aria-pressed={!category} onClick={() => chooseCategory('')}>Todas</button>
          {photoCategories.map((item) => <button type="button" className="chip" key={item} aria-pressed={category === item} onClick={() => chooseCategory(item)}>{item}</button>)}
        </div>
        <div className="gallery-grid">
          {visible.map((photo, index) => <button type="button" className="gallery-item" key={photo.src} onClick={() => setOpen(index)} aria-label={`Ver ${photo.title}`}>
            <img src={photo.src} alt="" loading="lazy" />
            <span className="gallery-item__caption"><strong>{photo.title}</strong><span>{photo.category}</span></span>
          </button>)}
        </div>
      </div>
    </section>

    <section className="instagram-section section" aria-labelledby="instagram-title">
      <div className="container instagram__inner">
        <div><p className="eyebrow eyebrow--light">MÁS DE GALÁPAGOS</p><h2 id="instagram-title">Momentos que hablan por sí solos.</h2><p>Descubre fotos y novedades en nuestro perfil.</p></div>
        <a className="button button--outline" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Ver Instagram <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    {visible[open] && <Lightbox items={visible} index={open} onChange={setOpen} onClose={() => setOpen(-1)} />}
  </>;
}
