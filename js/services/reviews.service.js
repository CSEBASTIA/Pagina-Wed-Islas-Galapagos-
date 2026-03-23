// js/services/reviews.service.js
// Gestión de reseñas de tours

const ReviewsService = {

    // Crear una nueva reseña
    async create(data) {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al enviar la reseña');
        return json;
    },

    // Obtener todas las reseñas (admin)
    async getAll() {
        const res = await fetch('/api/reviews');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al cargar reseñas');
        return json;
    },

    // Eliminar una reseña (admin)
    async remove(id) {
        const headers = {
            'Content-Type': 'application/json',
            ...(typeof window.adminApiHeaders === 'function' ? window.adminApiHeaders() : {}),
        };
        const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE', headers });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al eliminar reseña');
        return json;
    }
};

window.ReviewsService = ReviewsService;