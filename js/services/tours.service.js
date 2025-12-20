// js/services/tours.service.js
// Servicio de datos de tours

console.log('📦 Cargando tours.service.js...');

const TOURS = [
    {
        id: 101,
        title: "Tour Cuatro Hermanos",
        description: "Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.",
        price: 160,
        duration: "5 Horas",
        rating: 4.9,
        reviews: 85,
        image: "./assets/images/Cuatro hermanos.jpeg",
        tags: ["Snorkel", "Aventura", "Fauna"],
        difficulty: "Moderado"
    },
    {
        id: 102,
        title: "Tour Punta Cormorant",
        description: "Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.",
        price: 130,
        duration: "4 Horas",
        rating: 4.8,
        reviews: 110,
        image: "./assets/images/punta cormorant.jpeg",
        tags: ["Playa", "Caminata", "Snorkel"],
        difficulty: "Fácil"
    },
    {
        id: 103,
        title: "Tour Isla Tortuga",
        description: "Avistamiento de aves en un cráter colapsado. Ideal para fotografía.",
        price: 90,
        duration: "3 Horas",
        rating: 4.7,
        reviews: 60,
        image: "./assets/images/isla tortuga.jpeg",
        tags: ["Aves", "Paseo", "Relax"],
        difficulty: "Fácil"
    }
];

const BLOG_TOURS = {
    101: {
        id: 101,
        title: "Tour Cuatro Hermanos",
        offers: "Incluye transporte, equipo de snorkel, box lunch, guía.",
        departure: "07:30 AM",
        arrival: "12:30 PM",
        price: 160,
        image: "./assets/images/cuatro hermano 2.jpeg"
    },
    102: {
        id: 102,
        title: "Tour Punta Cormorant",
        offers: "Caminata escénica, Playa de la Harina, snorkel.",
        departure: "08:00 AM",
        arrival: "12:00 PM",
        price: 130,
        image: "./assets/images/la de los pajaros.jpeg"
    },
    103: {
        id: 103,
        title: "Tour Isla Tortuga",
        offers: "Recorrido marítimo, avistamiento de aves, pesca vivencial.",
        departure: "02:00 PM",
        arrival: "05:00 PM",
        price: 90,
        image: "./assets/images/tortuga2.jpeg"
    }
};

// Servicio de Tours
const ToursService = {
    getAllTours() {
        return TOURS;
    },

    getTourById(tourId) {
        return TOURS.find(tour => tour.id === tourId) || null;
    },

    getBlogTourById(tourId) {
        return BLOG_TOURS[tourId] || null;
    },

    filterToursByTag(tag) {
        if (tag === 'Todos') return TOURS;
        return TOURS.filter(tour => tour.tags.includes(tag));
    },

    calculateTotalPrice(tourId, guests) {
        const tour = this.getTourById(tourId);
        if (!tour) return 0;
        return tour.price * guests;
    }
};

// Hacer disponible globalmente
window.ToursService = ToursService;
window.TOURS = TOURS;
window.BLOG_TOURS = BLOG_TOURS;

console.log('✅ tours.service.js cargado');