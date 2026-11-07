import React, { useState } from 'react';
import { Link, useRouter } from '../router.jsx';
import { EMAIL, FACEBOOK, INSTAGRAM, whatsappUrl } from '../site.js';


const navLinks = [
  { to: '/#destinos', label: 'Tours' },
  { to: '/#nosotros', label: 'Nosotros' },
  { to: '/salidas', label: 'Próximas salidas' },
  { to: '/galeria', label: 'Galería' },
  { to: '/contacto', label: 'Contacto' },
];

export function Brand() {
  return <Link className="brand" to="/" aria-label="Golden Ray I, inicio">
    <span className="brand__name">GOLDEN RAY <span>I</span></span>
    <span className="brand__place">ISABELA · GALÁPAGOS</span>
  </Link>;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { path } = useRouter();
  const close = () => setMenuOpen(false);
  return <header className="site-header">
    <div className="container site-header__inner">
      <Brand />
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? 'Cerrar' : 'Menú'}
      </button>
      <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} id="main-nav" aria-label="Navegación principal">
        {navLinks.map((link) => <Link key={link.to} to={link.to} onClick={close} aria-current={path === link.to || path.startsWith(`${link.to}/`) ? 'page' : undefined}>{link.label}</Link>)}
        <a className="nav-cta" onClick={close} href={whatsappUrl('Hola, quisiera información sobre los tours de Golden Ray I.')} target="_blank" rel="noopener noreferrer">Escríbenos</a>
      </nav>
    </div>
  </header>;
}

export function SiteFooter() {
  return <footer className="footer">
    <div className="container footer__inner">
      <Brand />
      <nav className="footer__nav" aria-label="Navegación del pie de página">
        <Link to="/">Inicio</Link>
        {navLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
      </nav>
      <div className="footer__social" aria-label="Canales de contacto">
        <a href={whatsappUrl('Hola, quiero consultar los tours de Golden Ray I.')} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href={`mailto:${EMAIL}`}>Correo</a>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={FACEBOOK} target="_blank" rel="noopener noreferrer">Facebook</a>
      </div>
      <p className="footer__location">Puerto Villamil · Isla Isabela · Galápagos</p>
      <p className="footer__copyright">© {new Date().getFullYear()} Golden Ray I. Todos los derechos reservados.</p>
    </div>
  </footer>;
}

export function PageHero({ eyebrow, title, lead, image, imagePosition = 'center' }) {
  return <section className={`page-hero ${image ? '' : 'page-hero--plain'}`} aria-labelledby="page-title">
    {image && <><img className="page-hero__image" src={image} alt="" style={{ objectPosition: imagePosition }} /><div className="page-hero__shade" /></>}
    <div className="container page-hero__content">
      <p className="eyebrow eyebrow--light">{eyebrow}</p>
      <h1 id="page-title">{title}</h1>
      {lead && <p className="page-hero__lead">{lead}</p>}
    </div>
  </section>;
}
