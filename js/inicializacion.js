// inicializacion.js
// Punto de entrada del sitio

document.addEventListener('DOMContentLoaded', () => {
    // Render de tours
    if (typeof renderTours === 'function') {
        renderTours();
    }

    // Configuración inicial de auth
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }

    // Iconos de lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // Vista inicial
    if (typeof showHome === 'function') {
        showHome();
    }
});
