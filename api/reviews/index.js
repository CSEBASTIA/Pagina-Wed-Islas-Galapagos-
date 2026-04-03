// api/reviews/index.js
import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default async function handler(req, res) {
    corsAllowAuth(res, 'GET,POST,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();

    // GET /api/reviews
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data || []);
    }

    // POST /api/reviews
    if (req.method === 'POST') {
        const { tour_id, tour_name, customer_name, rating, comment } = req.body;

        if (!tour_name || !customer_name || !rating) {
            return res.status(400).json({ error: 'tour_name, customer_name y rating son obligatorios' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'El rating debe ser entre 1 y 5' });
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                tour_id: tour_id ? parseInt(tour_id, 10) : null,
                tour_name,
                customer_name,
                rating: parseInt(rating),
                comment: comment || ''
            }])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // DELETE /api/reviews/:id  (desde admin)
    if (req.method === 'DELETE') {
        if (!assertAdmin(req, res)) return;
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: 'ID requerido' });

        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
}