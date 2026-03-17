// js/services/tours.service.js
// Servicio de Tours — API local SQLite (http://localhost:8000/api/tours)

console.log('📦 Cargando tours.service.js...');

const API_BASE = '/api/tours';

// ── Tours por defecto (fallback sin servidor) ────────────────────────────────
const DEFAULT_TOURS = [
    { id: 101, title: "Tour Cuatro Hermanos",  description: "Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.",                  duration: "5 Horas",   departure: "07:30 AM", arrival: "12:30 PM", rating: 4.9, reviews: 85,  image: "./assets/images/Cuatro hermanos.jpeg", tags: ["Snorkel","Aventura","Fauna"],       difficulty: "Moderado" },
    { id: 102, title: "Tour Punta Cormorant",  description: "Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.",               duration: "4 Horas",   departure: "08:00 AM", arrival: "12:00 PM", rating: 4.8, reviews: 110, image: "./assets/images/punta cormorant.jpeg", tags: ["Playa","Caminata","Snorkel"],       difficulty: "Fácil"   },
    { id: 103, title: "Tour Isla Tortuga",     description: "Avistamiento de aves en un cráter colapsado. Ideal para fotografía.",                        duration: "3 Horas",   departure: "02:00 PM", arrival: "05:00 PM", rating: 4.7, reviews: 60,  image: "./assets/images/isla tortuga.jpeg",    tags: ["Aves","Paseo","Relax"],             difficulty: "Fácil"   },
    { id: 104, title: "Tour Los Túneles",      description: "Exploración de arcos volcánicos submarinos únicos.",                                         duration: "6 Horas",   departure: "06:00 AM", arrival: "12:00 PM", rating: 4.9, reviews: 145, image: "./assets/images/GALERIA1.jpg",         tags: ["Snorkel","Aventura","Fauna"],       difficulty: "Moderado" },
    { id: 105, title: "Tour Tintoreras",       description: "Caminata por senderos de lava junto a iguanas marinas y tiburones.",                         duration: "2.5 Horas", departure: "09:00 AM", arrival: "11:30 AM", rating: 4.6, reviews: 95,  image: "./assets/images/GALERIA2.jpg",         tags: ["Caminata","Fauna","Relax"],         difficulty: "Fácil"   },
    { id: 106, title: "Tour Sierra Negra",     description: "Ascenso al volcán activo más grande del archipiélago.",                                      duration: "8 Horas",   departure: "07:00 AM", arrival: "03:00 PM", rating: 4.8, reviews: 78,  image: "./assets/images/GALERIA3.jpg",         tags: ["Senderismo","Volcán","Aventura"],   difficulty: "Difícil"  },
];

// ── Helper: petición JSON a la API ───────────────────────────────────────────
async function apiCall(path, method = 'GET', body = null) {
    try {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(path, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn(`⚠️ API ${method} ${path} falló:`, err.message);
        return null;
    }
}

// ── Servicio de Tours ─────────────────────────────────────────────────────────
const ToursService = {

    // ── Leer todos ──────────────────────────────────────────────────────────
    async getAllTours() {
        const data = await apiCall(API_BASE);
        if (data) return data;
        console.warn('⚠️ Sin API — usando tours por defecto');
        return JSON.parse(JSON.stringify(DEFAULT_TOURS));
    },

    // ── Leer uno ────────────────────────────────────────────────────────────
    async getTourById(id) {
        const tour = await apiCall(`${API_BASE}/${id}`);
        if (tour) return tour;
        const all = await this.getAllTours();
        return all.find(t => t.id === id) || null;
    },

    // ── Filtrar por tag ──────────────────────────────────────────────────────
    async filterToursByTag(tag) {
        const tours = await this.getAllTours();
        if (tag === 'Todos') return tours;
        return tours.filter(t => (t.tags || []).includes(tag));
    },




    // ── Datos para modal de reserva ──────────────────────────────────────────
    async getBlogTourById(tourId) {
        const tour = await this.getTourById(tourId);
        if (!tour) return null;
        return {
            id: tour.id, title: tour.title, offers: tour.description,
            departure: tour.departure, arrival: tour.arrival,
            image: tour.image,
        };
    },

    // ── Agregar tour ─────────────────────────────────────────────────────────
    async addTour(data) {
        const tour = await apiCall(API_BASE, 'POST', data);
        if (tour) {
            console.log('✅ Tour guardado en BD:', tour.title);
            return tour;
        }
        // Fallback: solo en memoria
        const fallback = { ...data, id: Date.now() };
        console.warn('💾 Tour guardado solo en memoria (sin servidor)');
        return fallback;
    },

    // ── Actualizar tour ──────────────────────────────────────────────────────
    async updateTour(id, changes) {
        const tour = await apiCall(`${API_BASE}/${id}`, 'PUT', changes);
        if (tour) {
            console.log('✅ Tour actualizado en BD:', tour.title);
            return tour;
        }
        return null;
    },

    // ── Eliminar tour ────────────────────────────────────────────────────────
    async deleteTour(id) {
        const result = await apiCall(`${API_BASE}/${id}`, 'DELETE');
        if (result?.ok) {
            console.log('🗑️ Tour eliminado de BD:', id);
            return true;
        }
        return false;
    },

    // ── Restaurar los 6 originales ───────────────────────────────────────────
    async resetToDefaults() {
        const result = await apiCall(`${API_BASE}/reset`, 'POST');
        if (result?.ok) {
            console.log('🔄 Tours restaurados en BD');
            return result.tours;
        }
        return DEFAULT_TOURS;
    },
};

window.ToursService = ToursService;
console.log('✅ tours.service.js cargado — API local SQLite');