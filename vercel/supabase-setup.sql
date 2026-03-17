-- ============================================================
-- SETUP DE SUPABASE PARA ISABELA TOURS
-- Pega este SQL en: Supabase Dashboard → SQL Editor → Run
-- ============================================================
-- ── Tabla de Tours ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    departure TEXT DEFAULT '',
    arrival TEXT DEFAULT '',
    rating REAL DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    image TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    -- CSV: "Snorkel,Aventura"
    difficulty TEXT DEFAULT 'Moderado'
);
-- ── Tabla de Reservas ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    tour_id INTEGER DEFAULT 0,
    tour_name TEXT NOT NULL DEFAULT '',
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    date TEXT NOT NULL,
    people INTEGER NOT NULL DEFAULT 1,
    message TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (
        status IN (
            'Pendiente',
            'Confirmada',
            'Completada',
            'Cancelada'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ── Row Level Security (RLS) ──────────────────────────────────
-- Tours: lectura pública, escritura solo desde servidor (service_role)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tours_select_public" ON tours FOR
SELECT USING (true);
CREATE POLICY "tours_all_service" ON tours USING (auth.role() = 'service_role');
-- Reservas: inserción pública, lectura/edición solo desde servidor
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_insert_public" ON reservations FOR
INSERT WITH CHECK (true);
CREATE POLICY "reservations_all_service" ON reservations USING (auth.role() = 'service_role');
-- ── Tours por defecto ─────────────────────────────────────────
INSERT INTO tours (
        id,
        title,
        description,
        duration,
        departure,
        arrival,
        rating,
        reviews,
        image,
        tags,
        difficulty
    )
VALUES (
        101,
        'Tour Cuatro Hermanos',
        'Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.',
        '5 Horas',
        '07:30 AM',
        '12:30 PM',
        4.9,
        85,
        './assets/images/Cuatro hermanos.jpeg',
        'Snorkel,Aventura,Fauna',
        'Moderado'
    ),
    (
        102,
        'Tour Punta Cormorant',
        'Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.',
        '4 Horas',
        '08:00 AM',
        '12:00 PM',
        4.8,
        110,
        './assets/images/punta cormorant.jpeg',
        'Playa,Caminata,Snorkel',
        'Fácil'
    ),
    (
        103,
        'Tour Isla Tortuga',
        'Avistamiento de aves en un cráter colapsado. Ideal para fotografía.',
        '3 Horas',
        '02:00 PM',
        '05:00 PM',
        4.7,
        60,
        './assets/images/isla tortuga.jpeg',
        'Aves,Paseo,Relax',
        'Fácil'
    ),
    (
        104,
        'Tour Los Túneles',
        'Exploración de arcos volcánicos submarinos únicos.',
        '6 Horas',
        '06:00 AM',
        '12:00 PM',
        4.9,
        145,
        './assets/images/GALERIA1.jpg',
        'Snorkel,Aventura,Fauna',
        'Moderado'
    ),
    (
        105,
        'Tour Tintoreras',
        'Caminata por senderos de lava junto a iguanas marinas y tiburones.',
        '2.5 Horas',
        '09:00 AM',
        '11:30 AM',
        4.6,
        95,
        './assets/images/GALERIA2.jpg',
        'Caminata,Fauna,Relax',
        'Fácil'
    ),
    (
        106,
        'Tour Sierra Negra',
        'Ascenso al volcán activo más grande del archipiélago.',
        '8 Horas',
        '07:00 AM',
        '03:00 PM',
        4.8,
        78,
        './assets/images/GALERIA3.jpg',
        'Senderismo,Volcán,Aventura',
        'Difícil'
    ) ON CONFLICT (id) DO NOTHING;
-- ── Storage Bucket "galleries" ────────────────────────────────
-- Ejecuta esto también en el SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('galleries', 'galleries', true) ON CONFLICT (id) DO NOTHING;
-- Política: cualquiera puede ver las fotos (bucket público)
CREATE POLICY "galleries_public_read" ON storage.objects FOR
SELECT USING (bucket_id = 'galleries');
-- Política: solo service_role puede subir/borrar
CREATE POLICY "galleries_service_write" ON storage.objects USING (
    bucket_id = 'galleries'
    AND auth.role() = 'service_role'
);