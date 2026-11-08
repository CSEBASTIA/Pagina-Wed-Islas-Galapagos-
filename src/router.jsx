import React, { createContext, useContext, useEffect, useState } from 'react';

const RouterContext = createContext(null);

function normalize(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

function readLocation(behavior = 'instant') {
  return { path: normalize(window.location.pathname), hash: window.location.hash, behavior };
}

export function Router({ children }) {
  const [location, setLocation] = useState(() => readLocation());

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let id = '';
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      // Un "#" mal codificado en la dirección no debe romper la página.
    }
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: location.behavior });
    else window.scrollTo({ top: 0, behavior: location.behavior });
  }, [location]);

  function navigate(to) {
    const url = new URL(to, window.location.href);
    const samePage = normalize(url.pathname) === normalize(window.location.pathname);
    if (url.pathname + url.hash !== window.location.pathname + window.location.hash) {
      window.history.pushState(null, '', url.pathname + url.hash);
    }
    setLocation(readLocation(samePage ? 'smooth' : 'instant'));
  }

  return <RouterContext.Provider value={{ ...location, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({ to, onClick, children, ...props }) {
  const router = useContext(RouterContext);
  function handleClick(event) {
    onClick?.(event);
    if (!router || event.defaultPrevented || event.button !== 0 || props.target ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.navigate(to);
  }
  return <a href={to} onClick={handleClick} {...props}>{children}</a>;
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Golden Ray I` : 'Golden Ray I | Tours en Galápagos';
  }, [title]);
}
