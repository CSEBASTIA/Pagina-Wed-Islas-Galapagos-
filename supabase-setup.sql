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
        status IN ('Pendiente', 'Confirmada', 'Completada', 'Cancelada')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Tabla de Reseñas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    tour_id INTEGER DEFAULT 0,
    tour_name TEXT DEFAULT '',
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Tabla de Actividades ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    tour_id INTEGER NOT NULL REFERENCES tours(id),
    date_available DATE NOT NULL,
    spots INTEGER NOT NULL DEFAULT 10,
    note TEXT DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Row Level Security (RLS) ──────────────────────────────────

-- Tours: lectura pública, escritura solo service_role
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tours_select_public" ON tours
    FOR SELECT USING (true);
CREATE POLICY "tours_insert_service" ON tours
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "tours_update_service" ON tours
    FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "tours_delete_service" ON tours
    FOR DELETE USING (auth.role() = 'service_role');

-- Reservas: inserción pública, resto service_role
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_insert_public" ON reservations
    FOR INSERT WITH CHECK (true);
CREATE POLICY "reservations_select_service" ON reservations
    FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "reservations_update_service" ON reservations
    FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "reservations_delete_service" ON reservations
    FOR DELETE USING (auth.role() = 'service_role');

-- Reviews: lectura e inserción pública, borrado service_role
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_public" ON reviews
    FOR SELECT USING (true);
CREATE POLICY "reviews_insert_public" ON reviews
    FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_delete_service" ON reviews
    FOR DELETE USING (auth.role() = 'service_role');

-- Activities: lectura pública, escritura service_role
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_select_public" ON activities
    FOR SELECT USING (true);
CREATE POLICY "activities_insert_service" ON activities
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "activities_update_service" ON activities
    FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "activities_delete_service" ON activities
    FOR DELETE USING (auth.role() = 'service_role');

-- ── Storage Bucket "galleries" ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('galleries', 'galleries', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "galleries_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'galleries');
CREATE POLICY "galleries_insert_service" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'galleries' AND auth.role() = 'service_role');
CREATE POLICY "galleries_update_service" ON storage.objects
    FOR UPDATE USING (bucket_id = 'galleries' AND auth.role() = 'service_role');
CREATE POLICY "galleries_delete_service" ON storage.objects
    FOR DELETE USING (bucket_id = 'galleries' AND auth.role() = 'service_role');

-- ── Tours por defecto ─────────────────────────────────────────
INSERT INTO tours (id, title, description, duration, departure, arrival, rating, reviews, image, tags, difficulty)
VALUES
    (101, 'Tour Cuatro Hermanos',  'Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.',           '5 Horas',   '07:30 AM', '12:30 PM', 4.9, 85,  './assets/images/Cuatro hermanos.jpeg', 'Snorkel,Aventura,Fauna',     'Moderado'),
    (102, 'Tour Punta Cormorant',  'Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.',       '4 Horas',   '08:00 AM', '12:00 PM', 4.8, 110, './assets/images/punta cormorant.jpeg', 'Playa,Caminata,Snorkel',     'Fácil'),
    (103, 'Tour Isla Tortuga',     'Avistamiento de aves en un cráter colapsado. Ideal para fotografía.',                '3 Horas',   '02:00 PM', '05:00 PM', 4.7, 60,  './assets/images/isla tortuga.jpeg',    'Aves,Paseo,Relax',           'Fácil'),
    (104, 'Tour Los Túneles',      'Exploración de arcos volcánicos submarinos únicos.',                                 '6 Horas',   '06:00 AM', '12:00 PM', 4.9, 145, './assets/images/GALERIA1.jpg',         'Snorkel,Aventura,Fauna',     'Moderado'),
    (105, 'Tour Tintoreras',       'Caminata por senderos de lava junto a iguanas marinas y tiburones.',                 '2.5 Horas', '09:00 AM', '11:30 AM', 4.6, 95,  './assets/images/GALERIA2.jpg',         'Caminata,Fauna,Relax',       'Fácil'),
    (106, 'Tour Sierra Negra',     'Ascenso al volcán activo más grande del archipiélago.',                              '8 Horas',   '07:00 AM', '03:00 PM', 4.8, 78,  './assets/images/GALERIA3.jpg',         'Senderismo,Volcán,Aventura', 'Difícil')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- FIXES PARA TABLAS EXISTENTES
-- Si ya tenías las tablas creadas con el SQL viejo, ejecuta
-- esta sección en el SQL Editor de Supabase para corregir
-- ============================================================

-- ── FIX 1: Cambiar active de INTEGER a BOOLEAN ───────────────
ALTER TABLE activities
    ALTER COLUMN active TYPE BOOLEAN USING (active::boolean);
ALTER TABLE activities
    ALTER COLUMN active SET DEFAULT true;

-- ── FIX 2: Agregar FK si no existe ───────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_activities_tour'
        AND table_name = 'activities'
    ) THEN
        ALTER TABLE activities
            ADD CONSTRAINT fk_activities_tour
            FOREIGN KEY (tour_id) REFERENCES tours(id);
    END IF;
END $$;

-- ── FIX 3: Eliminar columna discount_pct si existe ───────────
ALTER TABLE activities DROP COLUMN IF EXISTS discount_pct;

-- ── FIX 4: Reemplazar RLS incorrectas de activities ──────────
DROP POLICY IF EXISTS "activities_all_service" ON activities;
DROP POLICY IF EXISTS "activities_select_public" ON activities;
DROP POLICY IF EXISTS "activities_insert_service" ON activities;
DROP POLICY IF EXISTS "activities_update_service" ON activities;
DROP POLICY IF EXISTS "activities_delete_service" ON activities;

CREATE POLICY "activities_select_public" ON activities
    FOR SELECT USING (true);
CREATE POLICY "activities_insert_service" ON activities
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "activities_update_service" ON activities
    FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "activities_delete_service" ON activities
    FOR DELETE USING (auth.role() = 'service_role');

-- ── FIX 5: Reemplazar RLS incorrectas de reviews ─────────────
DROP POLICY IF EXISTS "reviews_all_service" ON reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_service" ON reviews;

CREATE POLICY "reviews_select_public" ON reviews
    FOR SELECT USING (true);
CREATE POLICY "reviews_insert_public" ON reviews
    FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_delete_service" ON reviews
    FOR DELETE USING (auth.role() = 'service_role');

-- ── FIX 6: Reemplazar RLS incorrectas de tours ──────────────
DROP POLICY IF EXISTS "tours_all_service" ON tours;
DROP POLICY IF EXISTS "tours_select_public" ON tours;
DROP POLICY IF EXISTS "tours_insert_service" ON tours;
DROP POLICY IF EXISTS "tours_update_service" ON tours;
DROP POLICY IF EXISTS "tours_delete_service" ON tours;

CREATE POLICY "tours_select_public" ON tours
    FOR SELECT USING (true);
CREATE POLICY "tours_insert_service" ON tours
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "tours_update_service" ON tours
    FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "tours_delete_service" ON tours
    FOR DELETE USING (auth.role() = 'service_role');

-- ── FIX 7: Reemplazar RLS incorrectas de storage ────────────
DROP POLICY IF EXISTS "galleries_service_write" ON storage.objects;
DROP POLICY IF EXISTS "galleries_public_read" ON storage.objects;
DROP POLICY IF EXISTS "galleries_insert_service" ON storage.objects;
DROP POLICY IF EXISTS "galleries_update_service" ON storage.objects;
DROP POLICY IF EXISTS "galleries_delete_service" ON storage.objects;

CREATE POLICY "galleries_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'galleries');
CREATE POLICY "galleries_insert_service" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'galleries' AND auth.role() = 'service_role');
CREATE POLICY "galleries_update_service" ON storage.objects
    FOR UPDATE USING (bucket_id = 'galleries' AND auth.role() = 'service_role');
CREATE POLICY "galleries_delete_service" ON storage.objects
    FOR DELETE USING (bucket_id = 'galleries' AND auth.role() = 'service_role');

-- ── FIX 8: Rellenar tour_id en reseñas viejas ───────────────
UPDATE reviews SET tour_id = 104
WHERE tour_name ILIKE '%túneles%' AND (tour_id IS NULL OR tour_id = 0);

UPDATE reviews SET tour_id = 101
WHERE tour_name ILIKE '%cuatro hermanos%' AND (tour_id IS NULL OR tour_id = 0);

UPDATE reviews SET tour_id = 102
WHERE tour_name ILIKE '%cormorant%' AND (tour_id IS NULL OR tour_id = 0);

UPDATE reviews SET tour_id = 103
WHERE tour_name ILIKE '%tortuga%' AND (tour_id IS NULL OR tour_id = 0);

UPDATE reviews SET tour_id = 105
WHERE tour_name ILIKE '%tintoreras%' AND (tour_id IS NULL OR tour_id = 0);

UPDATE reviews SET tour_id = 106
WHERE tour_name ILIKE '%sierra negra%' AND (tour_id IS NULL OR tour_id = 0);

-- ── VERIFICACIÓN ─────────────────────────────────────────────
SELECT 'reviews' AS tabla, count(*) AS total,
    count(CASE WHEN tour_id > 0 THEN 1 END) AS con_tour_id
FROM reviews
UNION ALL
SELECT 'activities', count(*),
    count(CASE WHEN active THEN 1 END)
FROM activities;