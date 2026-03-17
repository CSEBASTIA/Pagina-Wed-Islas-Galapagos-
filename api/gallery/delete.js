// api/gallery/delete.js  →  DELETE /api/gallery/:island/:filename
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

    // Extraer isla y filename de la URL: /api/gallery/tortuga/foto.jpg
    const after = req.url.split('/api/gallery/')[1] || '';
    const [island, ...rest] = after.split('/');
    const filename = rest.join('/');

    if (!island || !filename) {
        return res.status(400).json({ error: 'Se requiere isla y nombre de archivo' });
    }

    const path = `${island}/${filename}`;

    const { error } = await supabase.storage.from('galleries').remove([path]);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true, deleted: filename });
}