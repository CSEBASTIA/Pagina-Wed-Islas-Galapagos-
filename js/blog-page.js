document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Navigation !== 'undefined') Navigation.init();
    if (typeof BlogUI !== 'undefined') await BlogUI.mount();
    if (window.lucide) lucide.createIcons();
});
