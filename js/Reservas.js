// Reservas.js
// Manejo de historial de reservas + modal de reserva

let bookings = JSON.parse(localStorage.getItem('isabela_bookings')) || [];

// Guarda en localStorage
function saveBookingToHistory(booking) {
    bookings.push(booking);
    localStorage.setItem('isabela_bookings', JSON.stringify(bookings));
}

/* ===== Modal de Reserva ===== */

const modal = document.getElementById('booking-modal');
const modalDetails = document.getElementById('modal-step-details');
const modalStep1 = document.getElementById('modal-step-1');
const modalStep2 = document.getElementById('modal-step-2');

const guestsInput = document.getElementById('input-guests');
const modalTotalPrice = document.getElementById('modal-total-price');
const modalGuestsText = document.getElementById('modal-guests-text');
const modalPriceHidden = document.getElementById('modal-tour-price');

// Abre modal desde cards o blog
function openModal(tourId, isBlog = false) {
    if (!modal) return;

    let tour;

    if (modalDetails) modalDetails.classList.add('hidden');
    if (modalStep1) modalStep1.style.display = 'none';
    if (modalStep2) {
        modalStep2.style.display = 'none';
        modalStep2.classList.remove('flex');
    }

    const form = document.getElementById('booking-form');
    if (form) form.reset();

    // Pre-fill con usuario logueado
    if (window.currentUser) {
        const nameInput = document.getElementById('input-name');
        if (nameInput) nameInput.value = window.currentUser.name || '';

        const phoneInput = document.getElementById('input-phone');
        if (phoneInput && window.currentUser.phone) phoneInput.value = window.currentUser.phone;
    }

    if (isBlog) {
        tour = BLOG_TOURS[tourId];
        if (!tour) return;

        document.getElementById('detail-tour-title').innerText = tour.title;
        document.getElementById('detail-tour-image').src = tour.image;
        document.getElementById('detail-tour-offers').innerText = tour.offers;
        document.getElementById('detail-tour-departure').innerText = tour.departure;
        document.getElementById('detail-tour-arrival').innerText = tour.arrival;
        document.getElementById('detail-tour-price').innerText = `$${tour.price}`;

        populateForm(tour);

        if (modalDetails) modalDetails.classList.remove('hidden');
    } else {
        tour = TOURS.find(t => t.id === tourId);
        if (!tour) return;
        populateForm(tour);
        if (modalStep1) modalStep1.style.display = 'block';
    }

    modal.classList.remove('hidden-modal');
    modal.classList.add('flex-modal');
}

function populateForm(tour) {
    document.getElementById('modal-tour-title').innerText = tour.title;
    document.getElementById('modal-tour-image').src = tour.image;
    modalPriceHidden.value = tour.price;
    updatePrice();
}

function goToBookingForm() {
    if (modalDetails) modalDetails.classList.add('hidden');
    if (modalStep1) modalStep1.style.display = 'block';
}

function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden-modal');
    modal.classList.remove('flex-modal');
}

function updatePrice() {
    const price = parseFloat(modalPriceHidden.value || '0');
    const guests = parseInt(guestsInput.value || '1', 10) || 1;
    const total = price * guests;

    if (modalTotalPrice) modalTotalPrice.innerText = `$${total}`;
    if (modalGuestsText) modalGuestsText.innerText = `Total estimado para ${guests} personas`;
}

if (guestsInput) {
    guestsInput.addEventListener('input', updatePrice);
}

// Submit del formulario
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const tourTitle = document.getElementById('modal-tour-title').innerText;
        const tourDate = document.getElementById('input-date').value;
        const tourGuests = guestsInput.value;
        const totalCost = parseFloat(modalPriceHidden.value || '0') * parseInt(tourGuests || '1', 10);
        const image = document.getElementById('modal-tour-image').src;

        saveBookingToHistory({
            title: tourTitle,
            date: tourDate,
            guests: tourGuests,
            total: totalCost,
            image: image,
            status: 'Pendiente',
            id: Date.now()
        });

        if (modalStep1) modalStep1.style.display = 'none';
        if (modalStep2) {
            modalStep2.classList.remove('hidden');
            modalStep2.classList.add('flex');
        }
    });
}

/* ===== Modal Historial ===== */

const historyModal = document.getElementById('history-modal');
const historyList = document.getElementById('history-list');

function openHistoryModal() {
    if (!historyModal || !historyList) return;

    historyList.innerHTML = '';

    if (bookings.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i data-lucide="calendar-x" class="h-12 w-12 mx-auto mb-3 opacity-50"></i>
                <p>No tienes reservas registradas aún.</p>
            </div>`;
    } else {
        bookings
            .sort((a, b) => b.id - a.id)
            .forEach(booking => {
                const badgeClass = booking.status === 'Confirmada' ? 'badge-confirmed' : 'badge-pending';
                const card = `
                    <div class="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition">
                        <img src="${booking.image}" class="w-20 h-20 object-cover rounded-lg bg-gray-200 flex-shrink-0">
                        <div class="flex-1">
                            <div class="flex justify-between items-start mb-1">
                                <h4 class="font-bold text-gray-800 leading-tight">${booking.title}</h4>
                                <span class="px-2 py-0.5 text-xs font-bold rounded-full border ${badgeClass}">${booking.status}</span>
                            </div>
                            <div class="text-sm text-gray-500 space-y-1">
                                <div class="flex items-center gap-2"><i data-lucide="calendar" class="w-3 h-3"></i> ${booking.date || 'Fecha pendiente'}</div>
                                <div class="flex items-center gap-2"><i data-lucide="users" class="w-3 h-3"></i> ${booking.guests} Personas</div>
                            </div>
                            <div class="mt-2 font-bold text-cyan-700 text-right">
                                $${booking.total}
                            </div>
                        </div>
                    </div>
                `;
                historyList.innerHTML += card;
            });
    }

    historyModal.classList.remove('hidden-modal');
    historyModal.classList.add('flex-modal');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function closeHistoryModal() {
    if (!historyModal) return;
    historyModal.classList.add('hidden-modal');
    historyModal.classList.remove('flex-modal');
}
