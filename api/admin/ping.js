// api/admin/ping.js — GET /api/admin/ping
// Verifica que el JWT del admin sea válido. Sin cambios en la interfaz.

import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export default function handler(req, res) {
    corsAllowAuth(res, 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
    if (!assertAdmin(req, res)) return;

    return res.status(200).json({
        ok: true,
        email: req.adminUser?.email || '',
        name: req.adminUser?.name || '',
        picture: req.adminUser?.picture || '',
    });
}