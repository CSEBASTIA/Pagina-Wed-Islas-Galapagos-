// api/gallery/upload.js  →  POST /api/gallery/:island/upload
import { supabase } from '../_supabase.js';
import { assertAdmin, corsAllowAuth } from '../_adminAuth.js';

export const config = { api: { bodyParser: false } };

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

function parseMultipart(bodyBuffer, contentType) {
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) return null;
    const boundary = Buffer.from('--' + boundaryMatch[1].replace(/"/g, ''));
    const parts = [];
    let start = bodyBuffer.indexOf(boundary);
    while (start !== -1) {
        start += boundary.length + 2;
        const end = bodyBuffer.indexOf(boundary, start);
        if (end === -1) break;
        const part = bodyBuffer.slice(start, end - 2);
        const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) { start = end; continue; }
        const headers = part.slice(0, headerEnd).toString();
        const body = part.slice(headerEnd + 4);
        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        const ctMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
        parts.push({
            name: nameMatch ? nameMatch[1] : '',
            filename: filenameMatch ? filenameMatch[1] : '',
            contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
            data: body,
        });
        start = end;
    }
    return parts;
}

export default async function handler(req, res) {
    corsAllowAuth(res, 'POST,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    if (!assertAdmin(req, res)) return;

    // Leer isla desde query param
    const island = req.query.island;
    if (!island) return res.status(400).json({ error: 'Isla requerida' });

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Se esperaba multipart/form-data' });
    }

    try {
        const bodyBuffer = await readBody(req);
        const parts = parseMultipart(bodyBuffer, contentType);
        const filePart = parts?.find(p => p.name === 'photo' && p.filename);

        if (!filePart) return res.status(400).json({ error: 'No se recibió ningún archivo con campo "photo"' });

        const safeName = `${Date.now()}_${filePart.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const path = `${island}/${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from('galleries')
            .upload(path, filePart.data, {
                contentType: filePart.contentType,
                upsert: false,
            });

        if (uploadError) return res.status(500).json({ error: uploadError.message });

        const { data: urlData } = supabase.storage.from('galleries').getPublicUrl(path);

        return res.status(201).json({
            ok: true,
            filename: safeName,
            url: urlData.publicUrl,
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}