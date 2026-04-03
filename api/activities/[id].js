// api/activities/[id].js  →  DELETE /api/activities/:id
import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default async function handler(req, res) {
    corsAllowAuth(res, 'DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Método no permitido' });
    if (!assertAdmin(req, res)) return;

    const id = parseInt(req.query.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
}
//commit