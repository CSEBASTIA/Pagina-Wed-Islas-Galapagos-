// js/services/promotions.service.js
// Servicio para gestionar promociones (fechas disponibles de tours)

const PromotionsService = {

    async getAll() {
        const res = await fetch('/api/promotions');
        if (!res.ok) throw new Error('Error al cargar promociones');
        return await res.json();
    },

    async create(data) {
        const headers = { 'Content-Type': 'application/json' };
        if (typeof adminApiHeaders === 'function') Object.assign(headers, adminApiHeaders());
        const res = await fetch('/api/promotions', {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Error al crear promoción');
        }
        return await res.json();
    },

    async remove(id) {
        const headers = {};
        if (typeof adminApiHeaders === 'function') Object.assign(headers, adminApiHeaders());
        const res = await fetch(`/api/promotions/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Error al eliminar promoción');
        return await res.json();
    }
};

window.PromotionsService = PromotionsService;
