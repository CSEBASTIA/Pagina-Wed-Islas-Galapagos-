// api/auth/google.js — GET /api/auth/google
// Redirige al usuario a la pantalla de login de Google

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return res.status(503).json({ error: 'GOOGLE_CLIENT_ID no configurado en variables de entorno' });
    }

    // URL fija de producción para OAuth — NO depende de env vars
    const PROD_URL = 'https://golden-ray-1-galapagos.vercel.app';
    const redirectUri = `${PROD_URL}/api/auth/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
    });

    return res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}