import React from 'react';
import IsabelaSection from '../components/IsabelaSection.jsx';
import { Link, usePageTitle } from '../router.jsx';
import { formatDate, whatsappUrl } from '../site.js';

function careTip(tour) {
  const text = `${tour.title} ${(tour.highlights || []).join(' ')}`.toLowerCase();
  if (/snorkel|marin|buceo/.test(text)) {
    return 'En el agua mantén al menos 2 metros de distancia de tortugas, rayas, tiburones y lobos marinos. No los toques, no los persigas y no te lleves nada del mar.';
  }
  if (/senderismo|volc|caminata/.test(text)) {
    return 'Camina solo por los senderos señalizados, mantén 2 metros de distancia de la fauna y no te lleves rocas, arena ni plantas.';
  }
  if (/aves|fotograf/.test(text)) {
    return 'Observa las aves a 2 metros de distancia y fotografíalas sin flash, sin molestar sus nidos ni su descanso.';
  }
  return 'Mantén 2 metros de distancia de los animales, no los alimentes y llévate todos tus residuos.';
}

function TourCard({ tour, index }) {
  const next = tour.departures?.[0];
  return <article className="tour-card" style={{ animationDelay: `${Math.min(index, 5) * 90}ms` }}>
    <div className="tour-card__photo">
      <img src={tour.image} alt={`Imagen de la experiencia ${tour.title}`} loading="lazy" />
      <span className="tour-card__location">{tour.destination}</span>
    </div>
    <div className="tour-card__body">
      <h3>{tour.title}</h3>
      <p>{tour.description}</p>
      <div className="tour-card__tags">
        {(tour.highlights || []).map((highlight) => <span key={highlight}>{highlight}</span>)}
        {tour.difficulty && tour.difficulty !== 'A consultar' && <span>Dificultad {tour.difficulty.toLowerCase()}</span>}
      </div>
      <aside className="tour-card__care" aria-label="Cuidado del medio ambiente">
        <strong>Cuidemos Galápagos</strong>
        <span>{careTip(tour)}</span>
      </aside>
      <div className="tour-card__foot">
        {next
          ? <Link className="tour-card__date" to="/salidas">Próxima salida: {formatDate(next.date)}</Link>
          : <span className="tour-card__date">Fecha a consultar</span>}
        <a href={whatsappUrl(`Hola, quisiera información sobre el tour ${tour.title}.`)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar ${tour.title} por WhatsApp`}>Consultar tour <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </article>;
}

const shortcuts = [
  { to: '/salidas', eyebrow: 'PLANIFICA TU VIAJE', title: 'Próximas salidas', text: 'Revisa las fechas publicadas y los cupos disponibles.', image: '/images/foto galeria.jpeg' },
  { to: '/galeria', eyebrow: 'POSTALES DE NUESTRAS ISLAS', title: 'Galería', text: 'Fotos de nuestras salidas, la vida marina y los paisajes.', image: '/images/tortuga2.jpeg' },
  { to: '/contacto', eyebrow: 'ESTAMOS PARA AYUDARTE', title: 'Contacto', text: 'Escríbenos por WhatsApp, correo o Instagram.', image: '/images/cuatro hermano 2.jpeg' },
];

export default function HomePage({ site }) {
  usePageTitle('');
  const { tours, loading, error } = site;
  return <>
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <img className="hero__image" src="/images/galapagos4.jpeg" alt="Paisaje natural de las Islas Galápagos" />
      <div className="hero__shade" />
      <div className="hero__glow hero__glow--one" aria-hidden="true" />
      <div className="hero__glow hero__glow--two" aria-hidden="true" />
      <div className="container hero__content">
        <p className="eyebrow eyebrow--light">GOLDEN RAY I · ISLA ISABELA</p>
        <h1 id="hero-title">Galápagos se vive<br /><em>de cerca.</em></h1>
        <p className="hero__lead">Explora paisajes volcánicos, vida marina y rincones inolvidables. Te ayudamos a elegir tu próxima aventura desde Isabela.</p>
        <div className="hero__actions">
          <Link className="button button--cream" to="/#destinos">Explorar tours <span aria-hidden="true">→</span></Link>
          <Link className="text-link text-link--light" to="/salidas">Ver próximas salidas</Link>
        </div>
        <div className="hero__foot"><span>Isabela, Galápagos · Ecuador</span><span>Experiencias en el mar y en tierra</span></div>
      </div>
    </section>

    <section className="intro section" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div><p className="eyebrow">DESCUBRE EL ARCHIPIÉLAGO</p><h2 id="intro-title">Cada isla tiene una historia. <em>Ven a descubrirla.</em></h2></div>
        <div className="intro__copy"><p>En Golden Ray I compartimos experiencias para conocer la naturaleza de Galápagos desde Isla Isabela. Mira los destinos, revisa las próximas fechas y escríbenos directamente para planificar tu salida.</p><Link className="underlined-link" to="/contacto">Conversemos sobre tu viaje <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>

    <section className="tours-section section" id="destinos" aria-labelledby="tours-title">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow">EXPERIENCIAS GOLDEN RAY I</p><h2 id="tours-title">Elige tu próximo destino</h2></div><p>De las costas a los volcanes, encuentra una experiencia para tu forma de viajar.</p></div>
        {loading && <p className="status">Cargando tours…</p>}
        {error && <p className="status status--error" role="alert">{error}</p>}
        {!loading && !error && <div className="tour-grid">{tours.map((tour, index) => <TourCard tour={tour} index={index} key={tour.id} />)}</div>}
        {!loading && !error && tours.length === 0 && <p className="status">Pronto publicaremos nuestros tours.</p>}
      </div>
    </section>

    <section className="about-section section" id="nosotros" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__photo">
          <img src="/images/lancha.jpeg" alt="Lancha Golden Ray I navegando en Galápagos" loading="lazy" />
          <span>GOLDEN RAY I · ISABELA</span>
        </div>
        <div className="about__copy">
          <p className="eyebrow">CONOCE A GOLDEN RAY I</p>
          <h2 id="about-title">Una forma cercana de descubrir las islas.</h2>
          <p>Golden Ray I es una lancha y un equipo local en Puerto Villamil, Isla Isabela. Queremos que cada visitante conozca los paisajes y la vida natural de Galápagos con una experiencia pensada para su viaje.</p>
          <p>Por eso mostramos los destinos y las fechas disponibles, y conversamos directamente contigo para confirmar la ruta, los detalles y el valor de cada salida.</p>
          <a className="underlined-link" href={whatsappUrl('Hola, quisiera conocer más sobre Golden Ray I y sus tours.')} target="_blank" rel="noopener noreferrer">Hablar con Golden Ray I <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>

    <IsabelaSection />

    <section className="shortcuts-section section" aria-labelledby="shortcuts-title">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow">SIGUE EXPLORANDO</p><h2 id="shortcuts-title">Todo lo que necesitas para tu viaje</h2></div></div>
        <div className="shortcut-grid">
          {shortcuts.map((item) => <Link className="shortcut" to={item.to} key={item.to}>
            <img src={item.image} alt="" loading="lazy" />
            <span className="shortcut__shade" />
            <span className="shortcut__body">
              <small>{item.eyebrow}</small>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
              <span className="shortcut__cta">Abrir <span aria-hidden="true">→</span></span>
            </span>
          </Link>)}
        </div>
      </div>
    </section>
  </>;
}
