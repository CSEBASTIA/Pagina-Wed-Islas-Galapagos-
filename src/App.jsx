import React, { useEffect, useState } from 'react';
import { Header, SiteFooter } from './components/Layout.jsx';
import ContactPage from './pages/Contact.jsx';
import DeparturesPage from './pages/Departures.jsx';
import GalleryPage from './pages/Gallery.jsx';
import HomePage from './pages/Home.jsx';
import TermsPage from './pages/Terms.jsx';
import { Link, usePageTitle, useRouter } from './router.jsx';
import { request } from './site.js';

function NotFoundPage() {
  usePageTitle('Página no encontrada');
  return <section className="section not-found">
    <div className="container">
      <p className="eyebrow">ERROR 404</p>
      <h1>Esta página no existe.</h1>
      <p>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Link className="button button--dark" to="/">Volver al inicio <span aria-hidden="true">→</span></Link>
    </div>
  </section>;
}

function useSiteData() {
  const [site, setSite] = useState({ tours: [], loading: true, error: '' });
  useEffect(() => {
    request('/api/site')
      .then((data) => setSite({ tours: data.tours || [], loading: false, error: '' }))
      .catch((error) => setSite({ tours: [], loading: false, error: error.message }));
  }, []);
  return site;
}

export default function App() {
  const { path } = useRouter();
  const site = useSiteData();
  const pages = {
    '/': <HomePage site={site} />,
    '/salidas': <DeparturesPage site={site} />,
    '/galeria': <GalleryPage />,
    '/contacto': <ContactPage />,
    '/terminos': <TermsPage />,
  };
  return <>
    <Header />
    <main key={path}>{pages[path] || <NotFoundPage />}</main>
    <SiteFooter />
  </>;
}
