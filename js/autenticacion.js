// autenticacion.js
// Manejo de usuario, auth modal y actualización de UI

let currentUser = JSON.parse(localStorage.getItem('isabela_user')) || null;

// Guarda usuario y refresca UI
function saveUser(userData) {
    currentUser = userData;
    localStorage.setItem('isabela_user', JSON.stringify(currentUser));
    updateAuthUI();
}

// Cierra sesión
function logout() {
    currentUser = null;
    localStorage.removeItem('isabela_user');
    updateAuthUI();
    showHome();
}

// Actualiza botones de login / reservas arriba y en el menú móvil
function updateAuthUI() {
    const desktopContainer = document.getElementById('desktop-auth-container');
    const mobileContainer = document.getElementById('mobile-auth-container');
    
    if (!desktopContainer || !mobileContainer) return;

    let desktopHTML = '';
    let mobileHTML = '';

    if (currentUser) {
        // Usuario logueado
        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';
        const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Viajero';

        desktopHTML = `
            <div class="flex items-center gap-3">
                <button onclick="openHistoryModal()" class="bg-cyan-600 text-white px-5 py-2 rounded-full font-medium hover:bg-cyan-700 transition shadow-md text-sm flex items-center gap-2">
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
                        <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        `;

        mobileHTML = `
            <div class="flex items-center gap-2 px-2 py-2 bg-cyan-50 rounded-lg mb-2">
                <div class="w-8 h-8 bg-cyan-200 rounded-full flex items-center justify-center text-cyan-800 font-bold">
                    ${initial}
                </div>
                <span class="font-bold text-gray-800">Hola, ${currentUser.name}</span>
            </div>
            <button onclick="openHistoryModal(); toggleMobileMenu()" class="bg-cyan-600 text-white py-2 rounded-lg w-full mb-2">Mis Reservas</button>
            <button onclick="logout(); toggleMobileMenu()" class="text-red-500 text-sm font-medium py-2 w-full text-left pl-2">Cerrar Sesión</button>
        `;

        // Auto-rellenar formulario de reserva
        const nameInput = document.getElementById('input-name');
        if (nameInput) nameInput.value = currentUser.name || '';

        const phoneInput = document.getElementById('input-phone');
        if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;

    } else {
        // Invitado
        desktopHTML = `
            <button onclick="openAuthModal()" class="text-gray-600 hover:text-cyan-600 font-medium transition">Iniciar Sesión</button>
            <button onclick="openAuthModal()" class="bg-cyan-600 text-white px-5 py-2 rounded-full font-medium hover:bg-cyan-700 transition shadow-md text-sm">
                Mis Reservas
            </button>
        `;

        mobileHTML = `
            <button onclick="openAuthModal(); toggleMobileMenu()" class="text-left text-gray-800 font-medium py-2">Iniciar Sesión</button>
            <button onclick="openAuthModal(); toggleMobileMenu()" class="bg-cyan-600 text-white py-2 rounded-lg w-full">Mis Reservas</button>
        `;
    }

    desktopContainer.innerHTML = desktopHTML;
    mobileContainer.innerHTML = mobileHTML;

    if (window.lucide) {
        lucide.createIcons();
    }
}

/* ===== Modal de Autenticación ===== */

const authModal = document.getElementById('auth-modal');
const authLoginMode = document.getElementById('auth-login-mode');
const authRegisterMode = document.getElementById('auth-register-mode');

function openAuthModal() {
    switchAuthMode('login');
    if (!authModal) return;
    authModal.classList.remove('hidden-modal');
    authModal.classList.add('flex-modal');
}

function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.add('hidden-modal');
    authModal.classList.remove('flex-modal');
}

function switchAuthMode(mode) {
    if (!authLoginMode || !authRegisterMode) return;

    if (mode === 'login') {
        authLoginMode.classList.remove('hidden');
        authRegisterMode.classList.add('hidden');
    } else {
        authLoginMode.classList.add('hidden');
        authRegisterMode.classList.remove('hidden');
    }
}

// Listeners de formularios
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('login-name').value;
        const email = document.getElementById('login-email').value;
        saveUser({ name, email });
        closeAuthModal();
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const dob = document.getElementById('reg-dob').value;

        saveUser({ name, email, phone, dob });
        closeAuthModal();
    });
}
