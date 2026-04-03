import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default async function handler(req, res) {
    corsAllowAuth(res, 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();

    if (req.method === 'GET') {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('activities')
            .select(`
                *,
                tours:tour_id (
                    title,
                    image
                )
            `)
            .eq('active', 1)
            .gte('date_available', today)
            .order('date_available', { ascending: true });

        if (error) {
            console.error('Supabase error GET activities:', error);
            return res.status(500).json({ error: error.message });
        }

        // Aplanar relación para que frontend la consuma fácilmente
        const activities = (data || []).map(a => ({
            ...a,
            tour_title: a.tours?.title || 'Tour Eliminado',
            tour_image: a.tours?.image || ''
        }));
        
        return res.status(200).json(activities);
    }

    if (req.method === 'POST') {
        if (!assertAdmin(req, res)) return;
        const { tour_id, date_available, spots, discount_pct, note } = req.body || {};
        
        if (!tour_id || !date_available) {
            return res.status(400).json({ error: 'tour_id y date_available son obligatorios' });
        }

        const { data, error } = await supabase
            .from('activities')
            .insert([{
                tour_id: parseInt(tour_id, 10),
                date_available,
                spots: parseInt(spots, 10) || 10,
                discount_pct: parseInt(discount_pct, 10) || 0,
                note: note || '',
                active: 1
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error POST activities:', error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Método no permitido' });
}
