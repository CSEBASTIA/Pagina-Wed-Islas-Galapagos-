import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { isAdminPath } from './adminRoute.js';
import { Router } from './router.jsx';
import './styles.css';

function addMeta(name, content) {
  const meta = document.createElement('meta');
  meta.name = name;
  meta.content = content;
  document.head.append(meta);
}

const root = createRoot(document.getElementById('root'));

isAdminPath(window.location.pathname).then(async (isAdmin) => {
  if (!isAdmin) {
    root.render(<Router><App /></Router>);
    return;
  }
  // Panel privado: no se indexa, no envía la dirección a otros sitios y su código
  // se descarga aparte, solo al entrar por la ruta secreta.
  addMeta('robots', 'noindex, nofollow');
  addMeta('referrer', 'no-referrer');
  document.title = 'Golden Ray I';
  const { default: Panel } = await import('./pages/Manage.jsx');
  root.render(<Panel />);
});
