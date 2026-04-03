// js/services/activities.service.js
// Servicio para gestionar actividades (fechas disponibles de tours)

const ActivitiesService = {

    async getAll() {
        const res = await fetch('/api/activities');
        if (!res.ok) {
            const errText = await res.text();
            let errMsg;
            try { errMsg = JSON.parse(errText).error; } catch { errMsg = errText.substring(0, 80); }
            throw new Error(errMsg || 'Error al cargar actividades');
        }
        return await res.json();
    },

    async create(data) {
        const headers = { 'Content-Type': 'application/json' };
        // Usar window.adminApiHeaders para garantizar acceso al scope global
        if (typeof window.adminApiHeaders === 'function') {
            Object.assign(headers, window.adminApiHeaders());
        }
        const res = await fetch('/api/activities', {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errText = await res.text();
            let errMsg;
            try { errMsg = JSON.parse(errText).error; } catch { errMsg = errText.substring(0, 80); }
            throw new Error(errMsg || 'Error al crear actividad');
        }
        return await res.json();
    },

    async remove(id) {
        const headers = {};
        if (typeof window.adminApiHeaders === 'function') {
            Object.assign(headers, window.adminApiHeaders());
        }
        const res = await fetch(`/api/activities/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) {
            const errText = await res.text();
            let errMsg;
            try { errMsg = JSON.parse(errText).error; } catch { errMsg = errText.substring(0, 80); }
            throw new Error(errMsg || 'Error al eliminar actividad');
        }
        return await res.json();
    }
};

window.ActivitiesService = ActivitiesService;
