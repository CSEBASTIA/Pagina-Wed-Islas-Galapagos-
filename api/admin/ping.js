import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default function handler(req, res) {
    corsAllowAuth(res, 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
    if (!assertAdmin(req, res)) return;
    return res.status(200).json({ ok: true });
}
