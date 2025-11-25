// navegacion.js
// Manejo de las distintas vistas y menú móvil

const homeView = document.getElementById('home-view');
const blogView = document.getElementById('blog-view');
const contactView = document.getElementById('contact-view');
const toursView = document.getElementById('tours-view');

function showHome() {
    if (homeView) homeView.classList.remove('hidden-section');
    if (blogView) blogView.classList.add('hidden-section');
    if (contactView) contactView.classList.add('hidden-section');
    if (toursView) toursView.classList.add('hidden-section');
    window.scrollTo(0, 0);
}

function showTours() {
    if (homeView) homeView.classList.add('hidden-section');
    if (blogView) blogView.classList.add('hidden-section');
    if (contactView) contactView.classList.add('hidden-section');
    if (toursView) toursView.classList.remove('hidden-section');
    window.scrollTo(0, 0);
}

function showBlog() {
    if (homeView) homeView.classList.add('hidden-section');
    if (blogView) blogView.classList.remove('hidden-section');
    if (contactView) contactView.classList.add('hidden-section');
    if (toursView) toursView.classList.add('hidden-section');
    window.scrollTo(0, 0);
}

function showContact() {
    if (homeView) homeView.classList.add('hidden-section');
    if (blogView) blogView.classList.add('hidden-section');
    if (contactView) contactView.classList.remove('hidden-section');
    if (toursView) toursView.classList.add('hidden-section');
    window.scrollTo(0, 0);
}

/* ===== Menú móvil ===== */

const mobileMenu = document.getElementById('mobile-menu');
const menuBtn = document.getElementById('mobile-menu-btn');

function toggleMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('hidden');
}

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        toggleMobileMenu();
    });
}
