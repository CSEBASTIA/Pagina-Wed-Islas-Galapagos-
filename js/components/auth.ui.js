// js/components/auth.ui.js
// Componente UI de autenticación

console.log('📦 Cargando auth.ui.js...');

const AuthUI = {
  updateUI() {
    console.log('🔄 Actualizando UI de autenticación...');

    this.updateDesktopAuth();
    this.updateMobileAuth();
    this.prefillBookingForm();

    const user = AuthService.getCurrentUser();
    if (user) {
      console.log(`✅ Usuario logueado: ${user.name}`);
    } else {
      console.log('ℹ️ No hay usuario logueado');
    }
  },

  updateDesktopAuth() {
    const container = document.getElementById('desktop-auth-container');
    if (!container) {
      console.warn('⚠️ No se encontró desktop-auth-container');
      return;
    }

    const user = AuthService.getCurrentUser();

    if (user) {
      container.innerHTML = this.getLoggedInHTML();
    } else {
      container.innerHTML = this.getLoggedOutHTML();
    }

    if (window.lucide) lucide.createIcons();
  },

  updateMobileAuth() {
    const container = document.getElementById('mobile-auth-container');
    if (!container) {
      console.warn('⚠️ No se encontró mobile-auth-container');
      return;
    }

    const user = AuthService.getCurrentUser();

    if (user) {
      container.innerHTML = this.getLoggedInHTMLMobile();
    } else {
      container.innerHTML = this.getLoggedOutHTMLMobile();
    }

    if (window.lucide) lucide.createIcons();
  },

  getLoggedInHTML() {
    const initial = AuthService.getUserInitials();
    const firstName = AuthService.getUserFirstName();

    return `
            <div class="flex items-center gap-3">
                <button onclick="HistoryModal.open()" class="bg-cyan-600 text-white px-5 py-2 rounded-full font-medium hover:bg-cyan-700 transition shadow-md text-sm flex items-center gap-2">
                    <i data-lucide="calendar-days" class="w-4 h-4"></i> Mis Reservas
                </button>
                <div class="relative group">
                    <button class="text-gray-700 font-bold flex items-center gap-2 hover:text-cyan-600 transition">
                        <div class="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700">
                            ${initial}
                        </div>
                        <span class="hidden lg:inline">Hola, ${firstName}</span>
                    </button>
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 hidden group-hover:block border border-gray-100">
                        <button onclick="AuthUI.handleLogout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        `;
  },

  getLoggedOutHTML() {
    return `
            <button onclick="AuthModal.open('login')" class="text-gray-600 hover:text-cyan-600 font-medium transition">Iniciar Sesión</button>
            <button onclick="AuthModal.open('login')" class="bg-cyan-600 text-white px-5 py-2 rounded-full font-medium hover:bg-cyan-700 transition shadow-md text-sm">
                Mis Reservas
            </button>
        `;
  },

  getLoggedInHTMLMobile() {
    const initial = AuthService.getUserInitials();
    const user = AuthService.getCurrentUser();

    return `
            <div class="flex items-center gap-2 px-2 py-2 bg-cyan-50 rounded-lg mb-2">
                <div class="w-8 h-8 bg-cyan-200 rounded-full flex items-center justify-center text-cyan-800 font-bold">
                    ${initial}
                </div>
                <span class="font-bold text-gray-800">Hola, ${user.name}</span>
            </div>
            <button onclick="HistoryModal.open(); Navigation.toggleMobileMenu()" class="bg-cyan-600 text-white py-2 rounded-lg w-full mb-2">Mis Reservas</button>
            <button onclick="AuthUI.handleLogout(); Navigation.toggleMobileMenu()" class="text-red-500 text-sm font-medium py-2 w-full text-left pl-2">Cerrar Sesión</button>
        `;
  },

  getLoggedOutHTMLMobile() {
    return `
            <button onclick="AuthModal.open('login'); Navigation.toggleMobileMenu()" class="text-left text-gray-800 font-medium py-2">Iniciar Sesión</button>
            <button onclick="AuthModal.open('login'); Navigation.toggleMobileMenu()" class="bg-cyan-600 text-white py-2 rounded-lg w-full">Mis Reservas</button>
        `;
  },

  handleLogout() {
    console.log('👋 Cerrando sesión...');

    AuthService.logout();
    this.updateUI();
    Navigation.showHome();
  },

  prefillBookingForm() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    const nameInput = document.getElementById('input-name');
    if (nameInput) nameInput.value = user.name || '';

    const phoneInput = document.getElementById('input-phone');
    if (phoneInput && user.phone) phoneInput.value = user.phone;
  }
};

// Hacer disponible globalmente
window.AuthUI = AuthUI;
window.updateAuthUI = () => AuthUI.updateUI();
window.logout = () => AuthUI.handleLogout();

console.log('✅ auth.ui.js cargado');