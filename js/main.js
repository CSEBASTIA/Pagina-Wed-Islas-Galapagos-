// js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    const open = (new URLSearchParams(window.location.search).get('open') || '').toLowerCase().trim();
    if (open === 'blog' || open === 'contact' || open === 'tours') {
        const map = { blog: './blog.html', contact: './contact.html', tours: './tours.html' };
        window.location.replace(map[open]);
        return;
    }

    if (typeof Navigation !== 'undefined') Navigation.init();

    if (document.getElementById('home-view') && typeof ToursUI !== 'undefined') {
        await ToursUI.renderTours();
        if (typeof Navigation !== 'undefined') Navigation.showHome();
    }

    await loadIslandGalleries();
    if (window.lucide) lucide.createIcons();
});

async function loadIslandGalleries() {
    const islands = ['tortuga', 'cormorant', 'hermanos'];
    for (const island of islands) {
        const container = document.getElementById(`gallery-${island}`);
        if (!container || typeof GalleryService === 'undefined') continue;
        try {
            const photos = await GalleryService.getPhotos(island);
            renderIslandGallery(container, photos, island);
        } catch (e) {
            console.warn(`No se pudo cargar galería de ${island}:`, e);
        }
    }
}

function renderIslandGallery(container, photos, island) {
    if (!photos || photos.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = photos.slice(0, 9).map((photo) => `
        <div class="aspect-square overflow-hidden rounded-lg cursor-pointer" onclick="openLightbox('${photo.url}', '${island}')">
            <img src="${photo.url}" alt="Foto ${island}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300" onerror="this.parentElement.style.display='none'">
        </div>
    `).join('');
}

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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});
