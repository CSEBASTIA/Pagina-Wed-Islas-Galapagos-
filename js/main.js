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

    if (window.lucide) lucide.createIcons();
});
