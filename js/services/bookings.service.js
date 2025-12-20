// js/services/bookings.service.js
// Servicio de gestión de reservas

console.log('📦 Cargando bookings.service.js...');

const STORAGE_KEY = 'isabela_bookings';

const BookingsService = {
    getAllBookings() {
        try {
            const bookings = localStorage.getItem(STORAGE_KEY);
            return bookings ? JSON.parse(bookings) : [];
        } catch (error) {
            console.error('Error leyendo reservas:', error);
            return [];
        }
    },

    getBookingById(bookingId) {
        const bookings = this.getAllBookings();
        return bookings.find(b => b.id === bookingId) || null;
    },

    createBooking(bookingData) {
        const bookings = this.getAllBookings();

        const newBooking = {
            id: Date.now(),
            title: bookingData.title,
            date: bookingData.date,
            guests: parseInt(bookingData.guests, 10),
            total: parseFloat(bookingData.total),
            image: bookingData.image,
            status: 'Pendiente',
            createdAt: new Date().toISOString(),
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone
        };

        bookings.push(newBooking);
        this.saveBookings(bookings);

        console.log('✅ Reserva creada:', newBooking);
        return newBooking;
    },

    updateBookingStatus(bookingId, status) {
        const bookings = this.getAllBookings();
        const index = bookings.findIndex(b => b.id === bookingId);

        if (index === -1) return false;

        bookings[index].status = status;
        bookings[index].updatedAt = new Date().toISOString();

        return this.saveBookings(bookings);
    },

    deleteBooking(bookingId) {
        const bookings = this.getAllBookings();
        const filtered = bookings.filter(b => b.id !== bookingId);

        return this.saveBookings(filtered);
    },

    getBookingsSortedByDate() {
        const bookings = this.getAllBookings();
        return bookings.sort((a, b) => b.id - a.id);
    },

    getBookingsByStatus(status) {
        const bookings = this.getAllBookings();
        return bookings.filter(b => b.status === status);
    },

    saveBookings(bookings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
            return true;
        } catch (error) {
            console.error('Error guardando reservas:', error);
            return false;
        }
    },

    clearAllBookings() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error limpiando reservas:', error);
            return false;
        }
    }
};

// Hacer disponible globalmente
window.BookingsService = BookingsService;

console.log('✅ bookings.service.js cargado');