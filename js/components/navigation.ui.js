// js/components/navigation.ui.js
// Componente de navegación

console.log('📦 Cargando navigation.ui.js...');

const Navigation = {
    views: {
        home: null,
        tours: null,
        blog: null,
        contact: null
    },
    mobileMenu: null,
    menuBtn: null,

    init() {
        console.log('🔧 Inicializando Navigation...');

        this.views.home = document.getElementById('home-view');
        this.views.tours = document.getElementById('tours-view');
        this.views.blog = document.getElementById('blog-view');
        this.views.contact = document.getElementById('contact-view');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuBtn = document.getElementById('mobile-menu-btn');

        this.initializeEventListeners();
        console.log('✅ Navigation inicializado');
    },

    initializeEventListeners() {
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
    },

    showHome() {
        this.hideAllViews();
        if (this.views.home) {
            this.views.home.classList.remove('hidden-section');
        }
        window.scrollTo(0, 0);
    },

    showTours() {
        this.hideAllViews();
        if (this.views.tours) {
            this.views.tours.classList.remove('hidden-section');
        }
        window.scrollTo(0, 0);
    },

    showBlog() {
        this.hideAllViews();
        if (this.views.blog) {
            this.views.blog.classList.remove('hidden-section');
        }
        window.scrollTo(0, 0);
    },

    showContact() {
        this.hideAllViews();
        if (this.views.contact) {
            this.views.contact.classList.remove('hidden-section');
        }
        window.scrollTo(0, 0);
    },

    hideAllViews() {
        Object.values(this.views).forEach(view => {
            if (view) {
                view.classList.add('hidden-section');
            }
        });
    },

    toggleMobileMenu() {
        if (!this.mobileMenu) return;
        this.mobileMenu.classList.toggle('hidden');
    },

    closeMobileMenu() {
        if (!this.mobileMenu) return;
        this.mobileMenu.classList.add('hidden');
    }
};

// Hacer disponible globalmente
window.Navigation = Navigation;

// Funciones legacy para onclick en HTML
window.showHome = () => Navigation.showHome();
window.showTours = () => Navigation.showTours();
window.showBlog = () => Navigation.showBlog();
window.showContact = () => Navigation.showContact();
window.toggleMobileMenu = () => Navigation.toggleMobileMenu();

console.log('✅ navigation.ui.js cargado');