// js/components/booking-modal.ui.js
// Componente del modal de reservas

console.log('📦 Cargando booking-modal.ui.js...');

const BookingModal = {
    modal: null,
    modalDetails: null,
    modalStep1: null,
    modalStep2: null,
    currentTour: null,

    init() {
        console.log('🔧 Inicializando BookingModal...');

        this.modal = document.getElementById('booking-modal');
        this.modalDetails = document.getElementById('modal-step-details');
        this.modalStep1 = document.getElementById('modal-step-1');
        this.modalStep2 = document.getElementById('modal-step-2');

        if (!this.modal) {
            console.error('❌ No se encontró booking-modal');
            return;
        }

        this.initializeEventListeners();
        console.log('✅ BookingModal inicializado');
    },

    initializeEventListeners() {
        const guestsInput = document.getElementById('input-guests');
        if (guestsInput) {
            guestsInput.addEventListener('input', () => this.updatePrice());
        }

        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    },

    open(tourId, isBlog = false) {
        console.log(`📖 Abriendo modal para tour ${tourId} (blog: ${isBlog})`);

        if (!this.modal) return;

        this.resetModal();

        const tour = isBlog
            ? ToursService.getBlogTourById(tourId)
            : ToursService.getTourById(tourId);

        if (!tour) {
            console.error(`❌ No se encontró el tour ${tourId}`);
            return;
        }

        this.currentTour = tour;
        this.prefillUserData();

        if (isBlog) {
            this.showBlogDetails(tour);
        } else {
            this.showBookingForm(tour);
        }

        this.modal.classList.remove('hidden-modal');
        this.modal.classList.add('flex-modal');
    },

    close() {
        if (!this.modal) return;
        this.modal.classList.add('hidden-modal');
        this.modal.classList.remove('flex-modal');
        this.currentTour = null;
    },

    resetModal() {
        if (this.modalDetails) this.modalDetails.classList.add('hidden');
        if (this.modalStep1) this.modalStep1.style.display = 'none';
        if (this.modalStep2) {
            this.modalStep2.style.display = 'none';
            this.modalStep2.classList.remove('flex');
        }

        const form = document.getElementById('booking-form');
        if (form) form.reset();
    },

    showBlogDetails(tour) {
        if (!this.modalDetails) return;

        document.getElementById('detail-tour-title').innerText = tour.title;
        document.getElementById('detail-tour-image').src = tour.image;
        document.getElementById('detail-tour-offers').innerText = tour.offers;
        document.getElementById('detail-tour-departure').innerText = tour.departure;
        document.getElementById('detail-tour-arrival').innerText = tour.arrival;
        document.getElementById('detail-tour-price').innerText = `$${tour.price}`;

        this.populateForm(tour);
        this.modalDetails.classList.remove('hidden');

        if (window.lucide) lucide.createIcons();
    },

    showBookingForm(tour) {
        this.populateForm(tour);
        if (this.modalStep1) this.modalStep1.style.display = 'block';
        if (window.lucide) lucide.createIcons();
    },

    goToBookingForm() {
        if (this.modalDetails) this.modalDetails.classList.add('hidden');
        if (this.modalStep1) this.modalStep1.style.display = 'block';
    },

    populateForm(tour) {
        document.getElementById('modal-tour-title').innerText = tour.title;
        document.getElementById('modal-tour-image').src = tour.image;
        document.getElementById('modal-tour-price').value = tour.price;
        this.updatePrice();
    },

    prefillUserData() {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        const nameInput = document.getElementById('input-name');
        if (nameInput) nameInput.value = user.name || '';

        const phoneInput = document.getElementById('input-phone');
        if (phoneInput && user.phone) phoneInput.value = user.phone;
    },

    updatePrice() {
        const priceInput = document.getElementById('modal-tour-price');
        const guestsInput = document.getElementById('input-guests');
        const totalPriceEl = document.getElementById('modal-total-price');
        const guestsTextEl = document.getElementById('modal-guests-text');

        if (!priceInput || !guestsInput) return;

        const price = parseFloat(priceInput.value || '0');
        const guests = parseInt(guestsInput.value || '1', 10) || 1;
        const total = price * guests;

        if (totalPriceEl) totalPriceEl.innerText = `$${total}`;
        if (guestsTextEl) guestsTextEl.innerText = `Total estimado para ${guests} persona${guests > 1 ? 's' : ''}`;
    },
    ////
    handleFormSubmit(e) {
        e.preventDefault();

        const tourTitle = document.getElementById('modal-tour-title').innerText;
        const date = document.getElementById('input-date').value;
        const guests = document.getElementById('input-guests').value;
        const name = document.getElementById('input-name').value;
        const phone = document.getElementById('input-phone').value;

        if (!date || !guests || !name || !phone) {
            alert('Por favor completa todos los campos');
            return;
        }

        const total =
            parseFloat(document.getElementById('modal-tour-price').value || '0') *
            parseInt(guests || '1', 10);

        const formData = {
            title: tourTitle,
            date,
            guests,
            total,
            image: document.getElementById('modal-tour-image').src,
            customerName: name,
            customerPhone: phone
        };

        console.log('📝 Creando reserva:', formData);

        const booking = BookingsService.createBooking(formData);

        if (booking) {
            console.log('✅ Reserva creada exitosamente');
            // =========================
            // 📲 REDIRECCIÓN A WHATSAPP
            // =========================
            const whatsappNumber = '+593994891081';
            const message = `
           Hola, deseo reservar un tour.

           🛥️ Tour: ${tourTitle}// se inserta el nombre del tour
           📅 Fecha: ${date}//  se inserta la fecha
           👥 Personas: ${guests}// se inserta el numero de personas
           👤 Nombre: ${name}// se inserta el nombre
           📞 Teléfono: ${phone}// se inserta el telefono
           `.trim();
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`; //envia a whatsapp
            window.open(whatsappURL, '_blank');
            this.showSuccessMessage();
        } else {
            console.error('❌ Error al crear reserva');
        }
    },
    showSuccessMessage() {
        if (this.modalStep1) this.modalStep1.style.display = 'none';
        if (this.modalStep2) {
            this.modalStep2.classList.remove('hidden');
            this.modalStep2.classList.add('flex');
        }
        if (window.lucide) lucide.createIcons();
    }
};

// Hacer disponible globalmente
window.BookingModal = BookingModal;
window.openModal = (tourId, isBlog) => BookingModal.open(tourId, isBlog);
window.closeModal = () => BookingModal.close();
window.goToBookingForm = () => BookingModal.goToBookingForm();

console.log('✅ booking-modal.ui.js cargado');