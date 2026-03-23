import crypto from 'crypto';

const MIN_LEN = 16;

function timingSafeEqualString(a, b) {
    const sa = String(a);
    const sb = String(b);
    if (sa.length !== sb.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(sa, 'utf8'), Buffer.from(sb, 'utf8'));
    } catch {
        return false;
    }
}

export function corsAllowAuth(res, methods) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Secret');
}

export function assertAdmin(req, res) {
    const secret = String(process.env.ADMIN_SECRET || '').trim();
    if (secret.length < MIN_LEN) {
        res.status(503).json({
            error: `Falta ADMIN_SECRET en el servidor (mínimo ${MIN_LEN} caracteres).`,
        });
        return false;
    }
    const auth = String(req.headers.authorization || '');
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const headerSecret = String(req.headers['x-admin-secret'] || '').trim();
    const token = bearer || headerSecret;
    if (!timingSafeEqualString(token, secret)) {
        res.status(401).json({ error: 'No autorizado' });
        return false;
    }
    return true;
}
