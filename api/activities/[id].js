import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default async function handler(req, res) {
    corsAllowAuth(res, 'GET,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Falta el id de la actividad' });
    }

    if (req.method === 'DELETE') {
        if (!assertAdmin(req, res)) return;
        
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Supabase error DELETE activity ${id}:`, error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ ok: true, deleted: id });
    }

    return res.status(405).json({ error: 'Método no permitido' });
}
