// api/gallery/delete.js  →  DELETE /api/gallery/:island/:file
import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default async function handler(req, res) {
    corsAllowAuth(res, 'DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Método no permitido' });
    if (!assertAdmin(req, res)) return;

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