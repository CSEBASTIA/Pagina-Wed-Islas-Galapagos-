// js/main.js
// Punto de entrada - Inicialización de la aplicación

console.log('🚀 Isabela Tours - Initializing...');

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos los componentes
    initializeComponents();

    // Configurar UI inicial
    setupInitialUI();

    console.log('✅ Isabela Tours - Ready!');
});

function initializeComponents() {
    console.log('🔧 Inicializando componentes...');

    // Inicializar navegación
    if (typeof Navigation !== 'undefined') {
        Navigation.init();
    } else {
        console.error('❌ Navigation no está definido');
    }

    // Inicializar modales
    if (typeof BookingModal !== 'undefined') {
        BookingModal.init();
    } else {
        console.error('❌ BookingModal no está definido');
    }

    if (typeof HistoryModal !== 'undefined') {
        HistoryModal.init();
    } else {
        console.error('❌ HistoryModal no está definido');
    }

    if (typeof AuthModal !== 'undefined') {
        AuthModal.init();
    } else {
        console.error('❌ AuthModal no está definido');
    }
}

function setupInitialUI() {
    console.log('🎨 Configurando UI inicial...');

    // Renderizar tours
    if (typeof ToursUI !== 'undefined' && ToursUI.renderTours) {
        ToursUI.renderTours();
    } else {
        console.error('❌ ToursUI no está definido');
    }

    // Actualizar autenticación
    if (typeof AuthUI !== 'undefined' && AuthUI.updateUI) {
        AuthUI.updateUI();
    } else {
        console.error('❌ AuthUI no está definido');
    }

    // Inicializar iconos de Lucide
    if (window.lucide) {
        lucide.createIcons();
    } else {
        console.warn('⚠️ Lucide no está cargado');
    }

    // Mostrar vista home
    if (typeof Navigation !== 'undefined') {
        Navigation.showHome();
    }
}

// Manejador global de errores
window.addEventListener('error', (event) => {
    console.error('❌ Application Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
});