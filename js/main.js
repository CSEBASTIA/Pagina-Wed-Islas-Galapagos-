// js/main.js
// Punto de entrada - Inicialización de la aplicación

console.log('🚀 Isabela Tours - Initializing...');

document.addEventListener('DOMContentLoaded', () => {
    initializeComponents();
    setupInitialUI();
    loadIslandGalleries();
    console.log('✅ Isabela Tours - Ready!');
});

function initializeComponents() {
    if (typeof Navigation !== 'undefined') {
        Navigation.init();
    }
}

function setupInitialUI() {
    if (typeof ToursUI !== 'undefined' && ToursUI.renderTours) {
        ToursUI.renderTours();
    }
    if (window.lucide) lucide.createIcons();
    if (typeof Navigation !== 'undefined') {
        Navigation.showHome();
    }
}

// ── Galerías de islas ────────────────────────────────────────────────────────
async function loadIslandGalleries() {
    const islands = ['tortuga', 'cormorant', 'hermanos'];
    for (const island of islands) {
        const container = document.getElementById(`gallery-${island}`);
        if (!container) continue;
        try {
            const photos = await GalleryService.getPhotos(island);
            renderIslandGallery(container, photos, island);
        } catch (e) {
            console.warn(`⚠️ No se pudo cargar galería de ${island}:`, e);
        }
    }
}

function renderIslandGallery(container, photos, island) {
    if (!photos || photos.length === 0) {
        container.innerHTML = '';  // vacío si no hay fotos
        return;
    }
    container.innerHTML = photos.slice(0, 9).map(photo => `
        <div class="aspect-square overflow-hidden rounded-lg cursor-pointer"
             onclick="openLightbox('${photo.url}', '${island}')">
            <img src="${photo.url}" alt="Foto ${island}"
                 class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                 onerror="this.parentElement.style.display='none'">
        </div>
    `).join('');
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function openLightbox(src, alt) {
    const lb = document.getElementById('island-lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img) return;
    img.src = src;
    img.alt = alt || '';
    lb.classList.remove('hidden');
    lb.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('island-lightbox');
    if (!lb) return;
    lb.classList.add('hidden');
    lb.classList.remove('flex');
    document.body.style.overflow = '';
}

// Cerrar lightbox con ESC
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

// ── Manejadores globales de errores ──────────────────────────────────────────
window.addEventListener('error', (event) => {
    console.error('❌ Application Error:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
});


function initializeComponents() {
    console.log('🔧 Inicializando componentes...');

    // Inicializar navegación
    if (typeof Navigation !== 'undefined') {
        Navigation.init();
    } else {
        console.error('❌ Navigation no está definido');
    }
}

function setupInitialUI() {
    console.log('🎨 Configurando UI inicial...');

    // Renderizar tours
    if (typeof ToursUI !== 'undefined' && ToursUI.renderTours) {
        ToursUI.renderTours();
    } else {
        console.error('❌ ToursUI no está definido');
    }

    // Inicializar iconos de Lucide
    if (window.lucide) {
        lucide.createIcons();
    } else {
        console.warn('⚠️ Lucide no está cargado');
    }

    // Mostrar vista home
    if (typeof Navigation !== 'undefined') {
        Navigation.showHome();
    }
}

// Manejador global de errores
window.addEventListener('error', (event) => {
    console.error('❌ Application Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
});