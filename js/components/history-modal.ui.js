// js/components/history-modal.ui.js
// Componente del modal de historial

console.log('📦 Cargando history-modal.ui.js...');

const HistoryModal = {
  modal: null,
  historyList: null,

  init() {
    console.log('🔧 Inicializando HistoryModal...');

    this.modal = document.getElementById('history-modal');
    this.historyList = document.getElementById('history-list');

    if (!this.modal) {
      console.error('❌ No se encontró history-modal');
      return;
    }

    console.log('✅ HistoryModal inicializado');
  },

  open() {
    console.log('📖 Abriendo historial de reservas...');

    if (!this.modal || !this.historyList) return;

    this.renderBookings();

    this.modal.classList.remove('hidden-modal');
    this.modal.classList.add('flex-modal');
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden-modal');
    this.modal.classList.remove('flex-modal');
  },

  renderBookings() {
    this.historyList.innerHTML = '';

    const bookings = BookingsService.getBookingsSortedByDate();

    console.log(`📊 Mostrando ${bookings.length} reservas`);

    if (bookings.length === 0) {
      this.showEmptyState();
      return;
    }

    bookings.forEach(booking => {
      const card = this.createBookingCard(booking);
      this.historyList.innerHTML += card;
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  showEmptyState() {
    this.historyList.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i data-lucide="calendar-x" class="h-12 w-12 mx-auto mb-3 opacity-50"></i>
                <p>No tienes reservas registradas aún.</p>
            </div>
        `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  createBookingCard(booking) {
    const badgeClass = this.getStatusBadgeClass(booking.status);

    return `
            <div class="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition">
                <img src="${booking.image}" 
                     class="w-20 h-20 object-cover rounded-lg bg-gray-200 flex-shrink-0" 
                     alt="${booking.title}">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold text-gray-800 leading-tight">${booking.title}</h4>
                        <span class="px-2 py-0.5 text-xs font-bold rounded-full border ${badgeClass}">
                            ${booking.status}
                        </span>
                    </div>
                    <div class="text-sm text-gray-500 space-y-1">
                        <div class="flex items-center gap-2">
                            <i data-lucide="calendar" class="w-3 h-3"></i> 
                            ${booking.date || 'Fecha pendiente'}
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="users" class="w-3 h-3"></i> 
                            ${booking.guests} Persona${booking.guests > 1 ? 's' : ''}
                        </div>
                    </div>
                    <div class="mt-2 font-bold text-cyan-700 text-right">
                        $${booking.total}
                    </div>
                </div>
            </div>
        `;
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Confirmada':
        return 'badge-confirmed';
      case 'Pendiente':
        return 'badge-pending';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'badge-pending';
    }
  }
};

// Hacer disponible globalmente
window.HistoryModal = HistoryModal;
window.openHistoryModal = () => HistoryModal.open();
window.closeHistoryModal = () => HistoryModal.close();

console.log('✅ history-modal.ui.js cargado');