// api/gallery/list.js  →  GET /api/gallery/:island
import { supabase } from '../_supabase.js';

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    // Leer isla desde query param
    const island = req.query.island;
    if (!island) return res.status(400).json({ error: 'Isla requerida' });

    const { data, error } = await supabase.storage
        .from('galleries')
        .list(island, { sortBy: { column: 'name', order: 'asc' } });

    if (error) return res.status(500).json({ error: error.message });

    const photos = (data || [])
        .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
        .map(f => {
            const { data: urlData } = supabase.storage
                .from('galleries')
                .getPublicUrl(`${island}/${f.name}`);
            return { filename: f.name, url: urlData.publicUrl };
        });

    return res.status(200).json({ island, photos });
}