// js/components/navigation.ui.js

const Navigation = {
    views: { home: null, tours: null, blog: null, contact: null },
    mobileMenu: null,
    menuBtn: null,

    init() {
        this.views.home = document.getElementById('home-view');
        this.views.tours = document.getElementById('tours-view');
        this.views.blog = document.getElementById('blog-view');
        this.views.contact = document.getElementById('contact-view');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuBtn = document.getElementById('mobile-menu-btn');
        if (this.menuBtn) this.menuBtn.addEventListener('click', () => this.toggleMobileMenu());
    },

    showHome() { this._show('home'); },
    showTours() { this._show('tours'); },
    showBlog() { this._show('blog'); },
    showContact() { this._show('contact'); },

    _show(key) {
        const map = { home: 'home-view', tours: 'tours-view', blog: 'blog-view', contact: 'contact-view' };
        const target = map[key];
        const targetEl = document.getElementById(target);
        if (!targetEl) {
            const jump = { home: './index.html', tours: './tours.html', blog: './blog.html', contact: './contact.html' };
            window.location.href = jump[key];
            return;
        }
        Object.values(this.views).forEach(v => v && v.classList.add('hidden-section'));
        targetEl.classList.remove('hidden-section');
        window.scrollTo(0, 0);
    },

    toggleMobileMenu() {
        if (!this.mobileMenu) return;
        this.mobileMenu.classList.toggle('hidden');
    }
};

window.Navigation = Navigation;
window.showHome = () => Navigation.showHome();
window.showTours = () => Navigation.showTours();
window.showBlog = () => Navigation.showBlog();
window.showContact = () => Navigation.showContact();
window.toggleMobileMenu = () => Navigation.toggleMobileMenu();
