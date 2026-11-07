import React, { useEffect, useRef, useState } from 'react';
import { photos as allPhotos } from './photos.js';
import { INSTAGRAM } from './site.js';

const photos = allPhotos.filter((photo) => photo.featured);
const slides = [photos.at(-1), ...photos, photos[0]];
const duration = 5000;

export default function PhotoCarousel() {
  const viewport = useRef(null);
  const root = useRef(null);
  const jumpTimer = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const playing = !paused && !hovered && visible && !userInteracting;

  function step() {
    const el = viewport.current;
    if (!el?.children[0]) return 0;
    const first = el.children[0];
    const second = el.children[1];
    return second.offsetLeft - first.offsetLeft;
  }
  function goTo(index, behavior = 'smooth') {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.current?.scrollTo({ left: (index + 1) * step(), behavior: reduced ? 'auto' : behavior });
  }

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const position = () => goTo(activeRef.current, 'auto');
    position();
    window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => goTo(active + 1), duration);
    return () => window.clearTimeout(timer);
  }, [active, playing]);

  function onScroll() {
    const el = viewport.current;
    const width = step();
    if (!el || !width) return;
    const rawIndex = Math.round(el.scrollLeft / width) - 1;
    if (rawIndex === -1 || rawIndex === photos.length) {
      window.clearTimeout(jumpTimer.current);
      jumpTimer.current = window.setTimeout(() => {
        const corrected = rawIndex === -1 ? photos.length - 1 : 0;
        goTo(corrected, 'auto');
        activeRef.current = corrected;
        setActive(corrected);
      }, 430);
      return;
    }
    if (rawIndex >= 0 && rawIndex < photos.length) {
      activeRef.current = rawIndex;
      setActive(rawIndex);
    }
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
  }

  return <section className="carousel-section section" aria-labelledby="carousel-title" ref={root}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setHovered(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
    <div className="container carousel-heading">
      <div><p className="eyebrow">POSTALES DE NUESTRAS ISLAS</p><h2 id="carousel-title">Un vistazo a Galápagos</h2></div>
      <p>Imágenes de nuestras salidas y los paisajes que nos inspiran. Encuentra más momentos en Instagram.</p>
    </div>
    <div className="carousel-stage">
      <div className="carousel-viewport" ref={viewport} tabIndex="0" role="region" aria-roledescription="carrusel" aria-label="Fotografías de Galápagos"
        onScroll={onScroll} onKeyDown={onKeyDown} onPointerDown={() => setUserInteracting(true)} onPointerUp={() => window.setTimeout(() => setUserInteracting(false), 700)} onPointerCancel={() => setUserInteracting(false)}>
        {slides.map((photo, index) => <div className="carousel-slide" key={`${photo.src}-${index}`} aria-hidden={index === 0 || index === slides.length - 1}>
          <img src={photo.src} alt={photo.title} loading="lazy" />
          <div className="carousel-slide__caption"><strong>{photo.title}</strong><span>{photo.detail}</span></div>
        </div>)}
      </div>
      <button type="button" className="arrow-button carousel-arrow carousel-arrow--prev" onClick={() => goTo(active - 1)} aria-label="Foto anterior">‹</button>
      <button type="button" className="arrow-button carousel-arrow carousel-arrow--next" onClick={() => goTo(active + 1)} aria-label="Foto siguiente">›</button>
    </div>
    <div className="container carousel-controls">
      <div className="carousel-tabs" role="tablist" aria-label="Seleccionar fotografía">
        {photos.map((photo, index) => <button key={photo.src} type="button" role="tab" aria-selected={active === index}
          aria-label={photo.title} className={`carousel-tab ${active === index ? 'carousel-tab--active' : ''}`}
          onClick={() => goTo(index)}>
          <span className="carousel-tab__progress" style={{ animationDuration: `${duration}ms`, animationPlayState: playing ? 'running' : 'paused' }} />
        </button>)}
      </div>
      <button className="carousel-play" type="button" onClick={() => setPaused(!paused)}>{paused ? 'Reproducir' : 'Pausar'}</button>
      <a className="underlined-link" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Ver Instagram <span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
