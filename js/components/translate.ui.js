// js/components/translate.ui.js

const TranslateUI = {
    init() {
        this.checkAutoDetect();
        this.bindEvents();
        this.updateUI();
    },

    checkAutoDetect() {
        const hasLangCookie = document.cookie.split(';').some((item) => item.trim().startsWith('googtrans='));
        if (!hasLangCookie) {
            // Detección automática según navegador
            const userLang = navigator.language || navigator.userLanguage;
            // Solo establecemos inglés si el navegador está en inglés
            if (userLang && userLang.toLowerCase().startsWith('en')) {
                this.setLanguage('en');
            }
        }
    },

    bindEvents() {
        document.querySelectorAll('.lang-toggle-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                if (lang) {
                    this.setLanguage(lang);
                }
            });
        });
    },

    setLanguage(lang) {
        // En lugar de interactuar con el widget y causar demoras visuales, 
        // escribimos la cookie de Google y recargamos la página limpiamente.
        if (lang === 'en') {
            document.cookie = `googtrans=/es/en; path=/;`;
            document.cookie = `googtrans=/es/en; domain=${window.location.hostname}; path=/;`;
        } else {
            // Regresamos al idioma principal borrando la cookie de traducción de ingles, o forzando es/es
            document.cookie = `googtrans=/es/es; path=/;`;
            document.cookie = `googtrans=/es/es; domain=${window.location.hostname}; path=/;`;
        }
        
        // Update local UI immediately for responsiveness
        this.updateUI(lang);
        
        // Recargar para aplicar traduccion
        window.location.reload();
    },

    updateUI(forceLang = null) {
        let currentLang = 'es';
        if (forceLang) {
            currentLang = forceLang;
        } else {
            const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
            if (match && match[2] === '/es/en') {
                currentLang = 'en';
            }
        }

        document.querySelectorAll('.lang-toggle-option').forEach(btn => {
            if (btn.getAttribute('data-lang') === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
};

window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'es', 
        includedLanguages: 'es,en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

document.addEventListener('DOMContentLoaded', () => {
    TranslateUI.init();
});
