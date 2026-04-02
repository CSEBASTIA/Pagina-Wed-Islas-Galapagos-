// api/auth/callback.js — GET /api/auth/callback
// Google redirige aquí después del login.
// Verifica que el email esté en ADMIN_EMAILS y genera un JWT propio.

import crypto from 'crypto';

// ── JWT mínimo sin dependencias externas ──────────────────────────────────────
function base64url(buf) {
    return Buffer.from(buf)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function signJWT(payload, secret) {
    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64url(JSON.stringify(payload));
    const sig = base64url(
        crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest()
    );
    return `${header}.${body}.${sig}`;
}

export function verifyJWT(token, secret) {
    try {
        const [header, body, sig] = token.split('.');
        const expected = base64url(
            crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest()
        );
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        if (payload.exp && Date.now() / 1000 > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    const { code, error } = req.query;

    if (error) {
        return res.redirect(302, `/admin.html?auth_error=${encodeURIComponent(error)}`);
    }
    if (!code) {
        return res.redirect(302, '/admin.html?auth_error=no_code');
    }

    // ── Variables de entorno ──────────────────────────────────────────────────
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'fallback_secret_change_me';
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

    const baseUrl = process.env.BASE_URL || 'https://golden-ray-1-galapagos.vercel.app';

    const redirectUri = `${baseUrl}/api/auth/callback`;

    if (!clientId || !clientSecret) {
        return res.redirect(302, '/admin.html?auth_error=config_missing');
    }

    // ── Intercambiar code por access_token ────────────────────────────────────
    let tokenData;
    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        tokenData = await tokenRes.json();
    } catch (e) {
        return res.redirect(302, '/admin.html?auth_error=token_fetch_failed');
    }

    if (tokenData.error) {
        return res.redirect(302, `/admin.html?auth_error=${encodeURIComponent(tokenData.error)}`);
    }

    // ── Obtener info del usuario ──────────────────────────────────────────────
    let userInfo;
    try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        userInfo = await infoRes.json();
    } catch (e) {
        return res.redirect(302, '/admin.html?auth_error=userinfo_failed');
    }

    const email = (userInfo.email || '').toLowerCase();

    // ── Verificar si el email está autorizado ─────────────────────────────────
    if (!adminEmails.includes(email)) {
        return res.redirect(302, `/admin.html?auth_error=not_authorized&email=${encodeURIComponent(email)}`);
    }

    // ── Generar JWT propio (válido 8 horas) ───────────────────────────────────
    const jwt = signJWT({
        email,
        name: userInfo.name || email,
        picture: userInfo.picture || '',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    }, jwtSecret);

    // ── Redirigir al admin con el token en el hash (nunca en query) ───────────
    return res.redirect(302, `/admin.html#token=${jwt}`);
}