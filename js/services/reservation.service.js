/**
 * ReservationService – Servicio de Reservas de Tours
 * Comunica con la API REST del servidor local.
 */

const ReservationService = (() => {
    const BASE = '/api/reservations';

    /**
     * Crear una nueva reserva (público).
     * @param {Object} data - { tour_id, tour_name, customer_name, email, phone, date, people, message }
     */
    async function create(data) {
        const res = await fetch(BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al crear la reserva');
        return json;
    }

    /**
     * Obtener todas las reservas (admin).
     */
    async function getAll() {
        const res = await fetch(BASE);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al cargar reservas');
        return json;
    }

    /**
     * Obtener una reserva por ID.
     */
    async function getOne(id) {
        const res = await fetch(`${BASE}/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Reserva no encontrada');
        return json;
    }

    /**
     * Actualizar estado u otros campos de una reserva (admin).
     * @param {number} id
     * @param {Object} data - e.g. { status: 'Confirmada' }
     */
    async function update(id, data) {
        const res = await fetch(`${BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al actualizar la reserva');
        return json;
    }

    /**
     * Eliminar una reserva (admin).
     */
    async function remove(id) {
        const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error al eliminar la reserva');
        return json;
    }

    return { create, getAll, getOne, update, remove };
})();
