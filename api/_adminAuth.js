// api/_adminAuth.js
// Valida el JWT generado por /api/auth/callback en lugar de ADMIN_SECRET fijo.

import crypto from 'crypto';

// ── Verificación JWT (misma lógica que en callback.js) ────────────────────────
function base64url(buf) {
    return Buffer.from(buf)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function verifyJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [header, body, sig] = parts;
        const expected = base64url(
            crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest()
        );
        // timingSafeEqual requiere misma longitud
        if (sig.length !== expected.length) return null;
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        if (payload.exp && Date.now() / 1000 > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

// ── CORS helpers ──────────────────────────────────────────────────────────────
export function corsAllowAuth(res, methods) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ── assertAdmin ───────────────────────────────────────────────────────────────
// Extrae el JWT del header Authorization: Bearer <jwt>
// Verifica firma y expiración. Retorna true si es válido, false (con 401) si no.
export function assertAdmin(req, res) {
    const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'fallback_secret_change_me';

    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

    if (!token) {
        res.status(401).json({ error: 'No autorizado: falta token' });
        return false;
    }

    const payload = verifyJWT(token, jwtSecret);
    if (!payload) {
        res.status(401).json({ error: 'No autorizado: token inválido o expirado' });
        return false;
    }

    // Adjuntar info del admin al request para uso opcional en handlers
    req.adminUser = payload;
    return true;
}