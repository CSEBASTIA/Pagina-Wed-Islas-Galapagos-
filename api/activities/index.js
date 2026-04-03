// api/activities/index.js  →  GET /api/activities  |  POST /api/activities
import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default async function handler(req, res) {
    corsAllowAuth(res, 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();

    // GET — listar actividades futuras activas (público)
    if (req.method === 'GET') {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('activities')
            .select(`
                *,
                tours ( title, image )
            `)
            .eq('active', true)
            .gte('date_available', today)
            .order('date_available', { ascending: true });

        if (error) {
            console.error('Supabase error GET activities:', error);
            return res.status(500).json({ error: error.message });
        }

        // Aplanar el join para que el frontend reciba tour_title y tour_image directo
        const result = (data || []).map(row => ({
            ...row,
            tour_title: row.tours?.title || '',
            tour_image: row.tours?.image || '',
            tours: undefined,
        }));

        return res.status(200).json(result);
    }

    // POST — crear actividad (solo admin)
    if (req.method === 'POST') {
        if (!assertAdmin(req, res)) return;

        const { tour_id, date_available, spots, note } = req.body || {};

        if (!tour_id || !date_available) {
            return res.status(400).json({ error: 'tour_id y date_available son obligatorios' });
        }

        const { data, error } = await supabase
            .from('activities')
            .insert([{
                tour_id: parseInt(tour_id),
                date_available,
                spots: parseInt(spots) || 10,
                note: note || '',
                active: true,
            }])
            .select(`*, tours ( title, image )`)
            .single();

        if (error) return res.status(500).json({ error: error.message });

        return res.status(201).json({
            ...data,
            tour_title: data.tours?.title || '',
            tour_image: data.tours?.image || '',
            tours: undefined,
        });
    }

    return res.status(405).json({ error: 'Método no permitido' });
}