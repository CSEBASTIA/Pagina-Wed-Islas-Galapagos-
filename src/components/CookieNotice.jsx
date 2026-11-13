import React, { useState } from 'react';
import { Link } from '../router.jsx';

const KEY = 'aviso-cookies-visto';

function alreadySeen() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

export default function CookieNotice() {
  const [visible, setVisible] = useState(() => !alreadySeen());
  if (!visible) return null;
  const accept = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* sin almacenamiento: solo se oculta en esta visita */ }
    setVisible(false);
  };
  return <aside className="cookie-notice" role="region" aria-label="Aviso de cookies">
    <div className="cookie-notice__text">
      <strong>Cookies y privacidad</strong>
      <p>Este sitio no usa cookies de publicidad ni de seguimiento. Solo guarda en tu navegador lo necesario para funcionar, como recordar que ya viste este aviso. <Link to="/privacidad#privacidad-cookies">Leer la política de privacidad</Link></p>
    </div>
    <button className="button button--dark" type="button" onClick={accept}>Entendido</button>
  </aside>;
}
