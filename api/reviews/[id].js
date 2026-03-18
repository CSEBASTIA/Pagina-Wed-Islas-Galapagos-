// api/reservations/[id].js
import { supabase } from '../_supabase.js';

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const id = parseInt(req.query.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    // GET /api/reservations/:id
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('reservations').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Reserva no encontrada' });
        return res.status(200).json(data);
    }

    // PUT /api/reservations/:id
    if (req.method === 'PUT') {
        const VALID_STATUSES = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];
        const allowed = ['tour_name', 'customer_name', 'email', 'phone', 'date', 'people', 'message', 'status'];
        const updates = {};
        for (const k of allowed) {
            if (req.body[k] !== undefined) {
                if (k === 'status' && !VALID_STATUSES.includes(req.body[k])) continue;
                updates[k] = req.body[k];
            }
        }
        const { data, error } = await supabase
            .from('reservations').update(updates).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // DELETE /api/reservations/:id
    if (req.method === 'DELETE') {
        const { error } = await supabase.from('reservations').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
}