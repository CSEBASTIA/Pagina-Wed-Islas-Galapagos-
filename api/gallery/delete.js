// api/gallery/delete.js  →  DELETE /api/gallery/:island/:file
import { supabase } from '../_supabase.js';

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Método no permitido' });

    // Leer isla y archivo desde query params
    const island = req.query.island;
    const file = req.query.file;

    if (!island || !file) {
        return res.status(400).json({ error: 'Se requiere isla y nombre de archivo' });
    }

    const path = `${island}/${file}`;

    const { error } = await supabase.storage.from('galleries').remove([path]);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true, deleted: file });
}