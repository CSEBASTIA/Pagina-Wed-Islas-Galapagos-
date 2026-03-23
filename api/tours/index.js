// api/tours/index.js
import { supabase } from '../_supabase.js';

const DEFAULT_TOURS = [
    { id: 101, title: "Tour Cuatro Hermanos", description: "Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.", duration: "5 Horas", departure: "07:30 AM", arrival: "12:30 PM", rating: 4.9, reviews: 85, image: "./assets/images/Cuatro hermanos.jpeg", tags: ["Snorkel", "Aventura", "Fauna"], difficulty: "Moderado" },
    { id: 102, title: "Tour Punta Cormorant", description: "Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.", duration: "4 Horas", departure: "08:00 AM", arrival: "12:00 PM", rating: 4.8, reviews: 110, image: "./assets/images/punta cormorant.jpeg", tags: ["Playa", "Caminata", "Snorkel"], difficulty: "Fácil" },
    { id: 103, title: "Tour Isla Tortuga", description: "Avistamiento de aves en un cráter colapsado. Ideal para fotografía.", duration: "3 Horas", departure: "02:00 PM", arrival: "05:00 PM", rating: 4.7, reviews: 60, image: "./assets/images/isla tortuga.jpeg", tags: ["Aves", "Paseo", "Relax"], difficulty: "Fácil" },
    { id: 104, title: "Tour Los Túneles", description: "Exploración de arcos volcánicos submarinos únicos.", duration: "6 Horas", departure: "06:00 AM", arrival: "12:00 PM", rating: 4.9, reviews: 145, image: "./assets/images/GALERIA1.jpg", tags: ["Snorkel", "Aventura", "Fauna"], difficulty: "Moderado" },
    { id: 105, title: "Tour Tintoreras", description: "Caminata por senderos de lava junto a iguanas marinas y tiburones.", duration: "2.5 Horas", departure: "09:00 AM", arrival: "11:30 AM", rating: 4.6, reviews: 95, image: "./assets/images/GALERIA2.jpg", tags: ["Caminata", "Fauna", "Relax"], difficulty: "Fácil" },
    { id: 106, title: "Tour Sierra Negra", description: "Ascenso al volcán activo más grande del archipiélago.", duration: "8 Horas", departure: "07:00 AM", arrival: "03:00 PM", rating: 4.8, reviews: 78, image: "./assets/images/GALERIA3.jpg", tags: ["Senderismo", "Volcán", "Aventura"], difficulty: "Difícil" },
];

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    // GET /api/tours
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('tours')
            .select('*')
            .order('id');

        if (error) {
            console.error('Supabase error GET tours:', error);
            return res.status(200).json(DEFAULT_TOURS);
        }

        const tours = (data || []).map(t => ({
            ...t,
            tags: typeof t.tags === 'string'
                ? t.tags.split(',').map(x => x.trim()).filter(Boolean)
                : (t.tags || [])
        }));

        return res.status(200).json(tours.length ? tours : DEFAULT_TOURS);
    }

    // POST /api/tours
    if (req.method === 'POST') {
        const { title, description, duration, departure, arrival, rating, reviews, image, tags, difficulty } = req.body;

        if (!title) return res.status(400).json({ error: 'title es obligatorio' });

        const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || 'Tour');

        // Generar ID único basado en timestamp
        const newId = Date.now();

        const { data, error } = await supabase
            .from('tours')
            .insert([{
                id: newId,
                title,
                description,
                duration,
                departure,
                arrival,
                rating: rating || 5.0,
                reviews: reviews || 0,
                image,
                tags: tagsStr,
                difficulty: difficulty || 'Moderado'
            }])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        return res.status(201).json({
            ...data,
            tags: data.tags ? data.tags.split(',').map(x => x.trim()) : []
        });
    }

    return res.status(405).json({ error: 'Método no permitido' });
} //importante pushe
