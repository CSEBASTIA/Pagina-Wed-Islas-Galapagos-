// js/components/auth-modal.ui.js
// Componente del modal de autenticación

console.log('📦 Cargando auth-modal.ui.js...');

const AuthModal = {
    modal: null,
    loginMode: null,
    registerMode: null,

    init() {
        console.log('🔧 Inicializando AuthModal...');

        this.modal = document.getElementById('auth-modal');
        this.loginMode = document.getElementById('auth-login-mode');
        this.registerMode = document.getElementById('auth-register-mode');

        if (!this.modal) {
            console.error('❌ No se encontró auth-modal');
            return;
        }

        this.initializeEventListeners();
        console.log('✅ AuthModal inicializado');
    },

    initializeEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    },

    open(mode = 'login') {
        console.log(`📖 Abriendo modal de autenticación (modo: ${mode})`);

        if (!this.modal) return;

        this.switchMode(mode);
        this.modal.classList.remove('hidden-modal');
        this.modal.classList.add('flex-modal');
    },

    close() {
        if (!this.modal) return;
        this.modal.classList.add('hidden-modal');
        this.modal.classList.remove('flex-modal');
    },

    switchMode(mode) {
        if (!this.loginMode || !this.registerMode) return;

        if (mode === 'login') {
            this.loginMode.classList.remove('hidden');
            this.registerMode.classList.add('hidden');
        } else {
            this.loginMode.classList.add('hidden');
            this.registerMode.classList.remove('hidden');
        }

        if (window.lucide) {
            lucide.createIcons();
        }
    },

    handleLogin(e) {
        e.preventDefault();

        const credentials = {
            name: document.getElementById('login-name').value,
            email: document.getElementById('login-email').value
        };

        console.log('🔐 Iniciando sesión...');

        const user = AuthService.login(credentials);

        if (user) {
            this.close();
            AuthUI.updateUI();
            console.log('✅ Sesión iniciada correctamente');
        } else {
            console.error('❌ Error al iniciar sesión');
        }
    },

    handleRegister(e) {
        e.preventDefault();

        const userData = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            dateOfBirth: document.getElementById('reg-dob').value
        };

        console.log('📝 Registrando usuario...');

        const user = AuthService.register(userData);

        if (user) {
            this.close();
            AuthUI.updateUI();
            console.log('✅ Usuario registrado correctamente');
        } else {
            console.error('❌ Error al registrar usuario');
        }
    }
};

// Hacer disponible globalmente
window.AuthModal = AuthModal;
window.openAuthModal = () => AuthModal.open('login');
window.closeAuthModal = () => AuthModal.close();
window.switchAuthMode = (mode) => AuthModal.switchMode(mode);

console.log('✅ auth-modal.ui.js cargado');