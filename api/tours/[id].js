// api/tours/[id].js
import { supabase } from '../_supabase.js';

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function toTour(row) {
    if (!row) return null;
    return {
        ...row,
        tags: typeof row.tags === 'string'
            ? row.tags.split(',').map(x => x.trim()).filter(Boolean)
            : (row.tags || [])
    };
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const id = parseInt(req.query.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    // GET /api/tours/:id
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('tours').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Tour no encontrado' });
        return res.status(200).json(toTour(data));
    }

    // PUT /api/tours/:id
    if (req.method === 'PUT') {
        const allowed = ['title', 'description', 'duration', 'departure', 'arrival', 'rating', 'reviews', 'image', 'tags', 'difficulty'];
        const updates = {};
        for (const k of allowed) {
            if (req.body[k] !== undefined) {
                updates[k] = k === 'tags' && Array.isArray(req.body[k])
                    ? req.body[k].join(',')
                    : req.body[k];
            }
        }
        const { data, error } = await supabase
            .from('tours').update(updates).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(toTour(data));
    }

    // DELETE /api/tours/:id
    if (req.method === 'DELETE') {
        const { error } = await supabase.from('tours').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
}