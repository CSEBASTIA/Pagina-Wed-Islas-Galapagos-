// api/reservations/index.js
import { supabase } from '../_supabase.js';

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    // GET /api/reservations
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data || []);
    }

    // POST /api/reservations
    if (req.method === 'POST') {
        const { tour_id, tour_name, customer_name, email, phone, date, people, message } = req.body;

        const required = ['customer_name', 'email', 'date', 'people', 'tour_name'];
        const missing = required.filter(f => !req.body[f]);
        if (missing.length) {
            return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
        }

        const { data, error } = await supabase
            .from('reservations')
            .insert([{
                tour_id: tour_id || 0,
                tour_name,
                customer_name,
                email,
                phone: phone || '',
                date,
                people: parseInt(people, 10),
                message: message || '',
                status: 'Pendiente',
            }])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Método no permitido' });
}