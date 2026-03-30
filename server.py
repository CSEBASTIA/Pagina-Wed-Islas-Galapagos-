"""
Servidor local con Live Reload + Base de Datos SQLite – Islas Galápagos
-----------------------------------------------------------------------
Uso:
    python server.py            → Puerto por defecto: 8000
    python server.py 3000       → Puerto personalizado: 3000

API REST de Tours:
    GET    /api/tours           → Listar todos
    GET    /api/tours/{id}      → Obtener uno
    POST   /api/tours           → Crear nuevo
    PUT    /api/tours/{id}      → Actualizar
    DELETE /api/tours/{id}      → Eliminar
    POST   /api/tours/reset     → Restaurar los 6 originales

API REST de Reservas (solo admin si ADMIN_SECRET tiene ≥16 caracteres):
    GET    /api/reservations         → Listar todas
    GET    /api/reservations/{id}    → Obtener una
    POST   /api/reservations         → Crear (admin)
    PUT    /api/reservations/{id}    → Actualizar estado/datos
    DELETE /api/reservations/{id}    → Eliminar
"""

import http.server
import socketserver
import webbrowser
import sys
import os
import threading
import time
import sqlite3
import json
import re
import hmac


# ── Configuración ──────────────────────────────────────────────────────────────
DEFAULT_PORT = 8000
HOST = "localhost"
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tours.db")
WATCH_EXTENSIONS = {".html", ".css", ".js", ".json", ".svg", ".png", ".jpg", ".jpeg"}

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# ══════════════════════════════════════════════════════════════════════════════
# BASE DE DATOS SQLITE
# ══════════════════════════════════════════════════════════════════════════════

DEFAULT_TOURS = [
    (
        101,
        "Tour Cuatro Hermanos",
        "Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.",
        "5 Horas",
        "07:30 AM",
        "12:30 PM",
        4.9,
        85,
        "./assets/images/Cuatro hermanos.jpeg",
        "Snorkel,Aventura,Fauna",
        "Moderado",
    ),
    (
        102,
        "Tour Punta Cormorant",
        "Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.",
        "4 Horas",
        "08:00 AM",
        "12:00 PM",
        4.8,
        110,
        "./assets/images/punta cormorant.jpeg",
        "Playa,Caminata,Snorkel",
        "Fácil",
    ),
    (
        103,
        "Tour Isla Tortuga",
        "Avistamiento de aves en un cráter colapsado. Ideal para fotografía.",
        "3 Horas",
        "02:00 PM",
        "05:00 PM",
        4.7,
        60,
        "./assets/images/isla tortuga.jpeg",
        "Aves,Paseo,Relax",
        "Fácil",
    ),
    (
        104,
        "Tour Los Túneles",
        "Exploración de arcos volcánicos submarinos únicos, hogar de caballitos de mar.",
        "6 Horas",
        "06:00 AM",
        "12:00 PM",
        4.9,
        145,
        "./assets/images/GALERIA1.jpg",
        "Snorkel,Aventura,Fauna",
        "Moderado",
    ),
    (
        105,
        "Tour Tintoreras",
        "Caminata por senderos de lava junto a iguanas marinas y tiburones de aletas blancas.",
        "2.5 Horas",
        "09:00 AM",
        "11:30 AM",
        4.6,
        95,
        "./assets/images/GALERIA2.jpg",
        "Caminata,Fauna,Relax",
        "Fácil",
    ),
    (
        106,
        "Tour Sierra Negra",
        "Ascenso al volcán activo más grande del archipiélago. Vistas espectaculares de la caldera.",
        "8 Horas",
        "07:00 AM",
        "03:00 PM",
        4.8,
        78,
        "./assets/images/GALERIA3.jpg",
        "Senderismo,Volcán,Aventura",
        "Difícil",
    ),
]


def get_db():
    """Conexión thread-safe a SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """Crear tabla e insertar tours por defecto si la BD está vacía."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tours (
                id          INTEGER PRIMARY KEY,
                title       TEXT    NOT NULL,
                description TEXT    DEFAULT '',
                duration    TEXT    DEFAULT '',
                departure   TEXT    DEFAULT '',
                arrival     TEXT    DEFAULT '',
                rating      REAL    DEFAULT 5.0,
                reviews     INTEGER DEFAULT 0,
                image       TEXT    DEFAULT '',
                tags        TEXT    DEFAULT '',
                difficulty  TEXT    DEFAULT 'Moderado'
            )
        """)
        # Migración: eliminar columna price si existe en BD antigua
        try:
            conn.execute("ALTER TABLE tours DROP COLUMN price")
            conn.commit()
            print("  Migracion: columna 'price' eliminada de tours")
        except Exception:
            pass  # Ya no existía, sin problema
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reservations (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                tour_id         INTEGER DEFAULT 0,
                tour_name       TEXT    NOT NULL DEFAULT '',
                customer_name   TEXT    NOT NULL,
                email           TEXT    NOT NULL,
                phone           TEXT    DEFAULT '',
                date            TEXT    NOT NULL,
                people          INTEGER NOT NULL DEFAULT 1,
                message         TEXT    DEFAULT '',
                status          TEXT    NOT NULL DEFAULT 'Pendiente',
                created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                tour_id       INTEGER DEFAULT 0,
                tour_name     TEXT    DEFAULT '',
                customer_name TEXT    NOT NULL,
                rating        INTEGER NOT NULL DEFAULT 5,
                comment       TEXT    DEFAULT '',
                created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS promotions (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                tour_id         INTEGER NOT NULL,
                date_available  TEXT    NOT NULL,
                spots           INTEGER NOT NULL DEFAULT 10,
                discount_pct    INTEGER NOT NULL DEFAULT 0,
                note            TEXT    DEFAULT '',
                active          INTEGER NOT NULL DEFAULT 1,
                created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)
        count = conn.execute("SELECT COUNT(*) FROM tours").fetchone()[0]
        if count == 0:
            conn.executemany(
                """
                INSERT OR IGNORE INTO tours
                    (id, title, description, duration, departure, arrival,
                     rating, reviews, image, tags, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                DEFAULT_TOURS,
            )
            print(
                f"  Base de datos inicializada con {len(DEFAULT_TOURS)} tours por defecto"
            )
        conn.commit()


def row_to_dict(row):
    d = dict(row)
    d["tags"] = [t.strip() for t in d.get("tags", "").split(",") if t.strip()]
    return d


def promo_row_to_dict(row):
    """Convierte fila de promotions a dict, incluyendo nombre del tour."""
    d = dict(row)
    return d


# ── Promotions DB helpers ────────────────────────────────────────────────────

def db_get_all_promotions():
    """Devuelve todas las promociones activas con el nombre del tour."""
    with get_db() as conn:
        rows = conn.execute("""
            SELECT p.*, t.title AS tour_title, t.image AS tour_image
            FROM promotions p
            LEFT JOIN tours t ON t.id = p.tour_id
            WHERE p.active = 1
            ORDER BY p.date_available ASC
        """).fetchall()
        return [dict(r) for r in rows]


def db_create_promotion(data):
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO promotions (tour_id, date_available, spots, discount_pct, note)
               VALUES (?, ?, ?, ?, ?)""",
            (
                int(data.get("tour_id", 0)),
                data.get("date_available", ""),
                int(data.get("spots", 10)),
                int(data.get("discount_pct", 0)),
                data.get("note", ""),
            ),
        )
        conn.commit()
        row = conn.execute(
            """SELECT p.*, t.title AS tour_title, t.image AS tour_image
               FROM promotions p LEFT JOIN tours t ON t.id = p.tour_id
               WHERE p.id = ?""",
            (cur.lastrowid,),
        ).fetchone()
        return dict(row) if row else {"id": cur.lastrowid}


def db_delete_promotion(promo_id):
    with get_db() as conn:
        conn.execute("DELETE FROM promotions WHERE id = ?", (promo_id,))
        conn.commit()


# ── Operaciones CRUD ───────────────────────────────────────────────────────────


def db_get_all():
    with get_db() as conn:
        return [
            row_to_dict(r)
            for r in conn.execute("SELECT * FROM tours ORDER BY id").fetchall()
        ]


def db_get_one(tour_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM tours WHERE id = ?", (tour_id,)).fetchone()
        return row_to_dict(row) if row else None


def db_create(data):
    tags = (
        ",".join(data.get("tags", ["Tour"]))
        if isinstance(data.get("tags"), list)
        else data.get("tags", "Tour")
    )
    with get_db() as conn:
        cur = conn.execute(
            """
            INSERT INTO tours (title, description, duration, departure, arrival,
                               rating, reviews, image, tags, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                data.get("title", "Nuevo Tour"),
                data.get("description", ""),
                data.get("duration", ""),
                data.get("departure", ""),
                data.get("arrival", ""),
                float(data.get("rating", 5.0)),
                int(data.get("reviews", 0)),
                data.get("image", ""),
                tags,
                data.get("difficulty", "Moderado"),
            ),
        )
        conn.commit()
        return db_get_one(cur.lastrowid)


def db_update(tour_id, data):
    allowed = {
        "title",
        "description",
        "duration",
        "departure",
        "arrival",
        "rating",
        "reviews",
        "image",
        "tags",
        "difficulty",
    }
    sets, vals = [], []
    for k, v in data.items():
        if k in allowed:
            if k == "tags" and isinstance(v, list):
                v = ",".join(v)
            sets.append(f"{k} = ?")
            vals.append(v)
    if not sets:
        return db_get_one(tour_id)
    vals.append(tour_id)
    with get_db() as conn:
        conn.execute(f"UPDATE tours SET {', '.join(sets)} WHERE id = ?", vals)
        conn.commit()
    return db_get_one(tour_id)


def db_delete(tour_id):
    with get_db() as conn:
        conn.execute("DELETE FROM tours WHERE id = ?", (tour_id,))
        conn.commit()


# ── Reservaciones CRUD ────────────────────────────────────────────────────────


def _reservation_to_dict(row):
    return dict(row)


def db_create_reservation(data):
    with get_db() as conn:
        cur = conn.execute(
            """
            INSERT INTO reservations
                (tour_id, tour_name, customer_name, email, phone, date, people, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
        """,
            (
                int(data.get("tour_id", 0)),
                data.get("tour_name", ""),
                data.get("customer_name", ""),
                data.get("email", ""),
                data.get("phone", ""),
                data.get("date", ""),
                int(data.get("people", 1)),
                data.get("message", ""),
            ),
        )
        conn.commit()
        return db_get_reservation(cur.lastrowid)


def db_get_all_reservations():
    with get_db() as conn:
        return [
            _reservation_to_dict(r)
            for r in conn.execute(
                "SELECT * FROM reservations ORDER BY created_at DESC"
            ).fetchall()
        ]


def db_get_reservation(res_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM reservations WHERE id = ?", (res_id,)
        ).fetchone()
        return _reservation_to_dict(row) if row else None


def db_update_reservation(res_id, data):
    allowed = {"tour_name", "customer_name", "email", "phone", "date", "people", "message", "status"}
    VALID_STATUSES = {"Pendiente", "Confirmada", "Completada", "Cancelada"}
    sets, vals = [], []
    for k, v in data.items():
        if k in allowed:
            if k == "status" and v not in VALID_STATUSES:
                continue
            sets.append(f"{k} = ?")
            vals.append(v)
    if not sets:
        return db_get_reservation(res_id)
    vals.append(res_id)
    with get_db() as conn:
        conn.execute(f"UPDATE reservations SET {', '.join(sets)} WHERE id = ?", vals)
        conn.commit()
    return db_get_reservation(res_id)


def db_delete_reservation(res_id):
    with get_db() as conn:
        conn.execute("DELETE FROM reservations WHERE id = ?", (res_id,))
        conn.commit()


# ── Reseñas CRUD ──────────────────────────────────────────────────────────────


def db_get_all_reviews():
    with get_db() as conn:
        return [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM reviews ORDER BY created_at DESC"
            ).fetchall()
        ]


def db_create_review(data):
    rating = max(1, min(5, int(data.get("rating", 5))))
    with get_db() as conn:
        cur = conn.execute(
            """
            INSERT INTO reviews (tour_id, tour_name, customer_name, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                int(data.get("tour_id", 0)),
                data.get("tour_name", ""),
                data.get("customer_name", "Anónimo"),
                rating,
                data.get("comment", ""),
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM reviews WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row) if row else {}


def db_delete_review(review_id):
    with get_db() as conn:
        conn.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
        conn.commit()


def db_reset():
    with get_db() as conn:
        conn.execute("DELETE FROM tours")
        conn.executemany(
            """
            INSERT INTO tours (id, title, description, duration, departure, arrival,
                               rating, reviews, image, tags, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            DEFAULT_TOURS,
        )
        conn.commit()



def _parse_multipart(body_bytes, content_type):
    """
    Parser minimal de multipart/form-data sin depender del módulo cgi.
    Retorna dict {field_name: {"filename": str, "data": bytes}} o str para campos simples.
    """
    m = re.search(r'boundary=([^;\s]+)', content_type)
    if not m:
        return {}
    boundary = m.group(1).strip('"').encode()
    parts = {}
    delimiter = b'--' + boundary
    raw_parts = body_bytes.split(delimiter)
    for part in raw_parts[1:]:
        if part.startswith(b'--') or part.strip() == b'':
            continue
        if b'\r\n\r\n' in part:
            header_block, _, content = part.partition(b'\r\n\r\n')
        elif b'\n\n' in part:
            header_block, _, content = part.partition(b'\n\n')
        else:
            continue
        content = content.rstrip(b'\r\n')
        headers_text = header_block.decode('utf-8', errors='replace')
        cd_match = re.search(r'Content-Disposition:[^\n]+name="([^"]+)"', headers_text, re.IGNORECASE)
        if not cd_match:
            continue
        field_name = cd_match.group(1)
        fn_match = re.search(r'filename="([^"]+)"', headers_text, re.IGNORECASE)
        if fn_match:
            parts[field_name] = {"filename": fn_match.group(1), "data": content}
        else:
            parts[field_name] = content.decode('utf-8', errors='replace')
    return parts


# ══════════════════════════════════════════════════════════════════════════════
# LIVE RELOAD
# ══════════════════════════════════════════════════════════════════════════════

_version = 0
_version_lock = threading.Lock()
_sse_clients: list = []
_sse_lock = threading.Lock()


def _notify_clients():
    global _version
    with _version_lock:
        _version += 1
        v = _version
    with _sse_lock:
        dead = []
        for client in _sse_clients:
            try:
                client.wfile.write(f"data: {v}\n\n".encode())
                client.wfile.flush()
            except Exception:
                dead.append(client)
        for c in dead:
            _sse_clients.remove(c)


def _watch_files(interval: float = 0.8):
    snapshots: dict = {}

    def take_snapshot():
        snap = {}
        for root, _, files in os.walk("."):
            for f in files:
                if any(f.endswith(ext) for ext in WATCH_EXTENSIONS):
                    path = os.path.join(root, f)
                    try:
                        snap[path] = os.path.getmtime(path)
                    except OSError:
                        pass
        return snap

    snapshots = take_snapshot()
    while True:
        time.sleep(interval)
        current = take_snapshot()
        if current != snapshots:
            changed = [p for p in current if current[p] != snapshots.get(p)]
            for p in changed:
                print(f"  Cambio detectado: {p}")
            snapshots = current
            _notify_clients()


_LIVERELOAD_SCRIPT = """
<script>
(function() {
  const es = new EventSource('/livereload');
  es.onmessage = () => location.reload();
  es.onerror   = () => setTimeout(() => location.reload(), 2000);
})();
</script>
"""


# ══════════════════════════════════════════════════════════════════════════════
# HTTP HANDLER
# ══════════════════════════════════════════════════════════════════════════════


class LiveReloadHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass  # Silenciar logs

    # ── Helpers de respuesta ─────────────────────────────────────────────────
    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _error(self, msg, status=400):
        self._json({"error": msg}, status)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return {}

    def _path_only(self):
        """Ruta sin query string (evita que /api/tours?x=1 no coincida)."""
        return self.path.split("?", 1)[0]

    def _admin_authorized(self):
        """Si ADMIN_SECRET está definido (>=16), exige Bearer o X-Admin-Secret."""
        secret = os.environ.get("ADMIN_SECRET", "4veoeE8TyFTTB3nJ").strip()
        if len(secret) < 16:
            return True
        auth = self.headers.get("Authorization", "")
        token = auth[7:].strip() if auth.startswith("Bearer ") else self.headers.get("X-Admin-Secret", "").strip()
        if len(token) != len(secret):
            return False
        try:
            return hmac.compare_digest(token.encode("utf-8"), secret.encode("utf-8"))
        except Exception:
            return False

    def _require_admin(self):
        if not self._admin_authorized():
            self._error("No autorizado", 401)
            return False
        return True

    # ── GET ──────────────────────────────────────────────────────────────────
    def do_GET(self):
        if self.path == "/livereload":
            self._handle_sse()
            return

        p = self._path_only()

        if p == "/api/admin/ping":
            if not self._admin_authorized():
                self._error("No autorizado", 401)
                return
            self._json({"ok": True})
            return

        # API Tours
        if p == "/api/tours":
            self._json(db_get_all())
            return

        m = re.match(r"^/api/tours/(\d+)$", p)
        if m:
            tour = db_get_one(int(m.group(1)))
            if tour:
                self._json(tour)
            else:
                self._error("Tour no encontrado", 404)
            return

        # API Reservaciones — datos personales: solo administración
        if p == "/api/reservations":
            if not self._require_admin():
                return
            self._json(db_get_all_reservations())
            return

        m_res = re.match(r"^/api/reservations/(\d+)$", p)
        if m_res:
            if not self._require_admin():
                return
            res = db_get_reservation(int(m_res.group(1)))
            if res:
                self._json(res)
            else:
                self._error("Reservación no encontrada", 404)
            return

        # API Contenido — leer HTML de cualquier página
        if p.startswith("/api/content"):
            if not self._require_admin():
                return
            from urllib.parse import urlparse, parse_qs

            qs = parse_qs(urlparse(self.path).query)
            page = qs.get("page", ["index.html"])[0]
            # Seguridad: solo .html en la raíz del proyecto
            page = os.path.basename(page)
            if not page.endswith(".html"):
                self._error("Solo se permiten archivos .html", 400)
                return
            filepath = os.path.join(os.getcwd(), page)
            if not os.path.exists(filepath):
                self._error(f"Archivo no encontrado: {page}", 404)
                return
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    html = f.read()
                self._json({"page": page, "content": html})
            except Exception as e:
                self._error(str(e), 500)
            return

        # Listar páginas HTML editables
        if p == "/api/pages":
            if not self._require_admin():
                return
            pages = [f for f in os.listdir(".") if f.endswith(".html")]
            self._json({"pages": sorted(pages)})
            return

        # API Reseñas — GET todas (público para el blog)
        if p == "/api/reviews":
            self._json(db_get_all_reviews())
            return

        # API Promociones — GET todas activas (público)
        if p == "/api/promotions":
            self._json(db_get_all_promotions())
            return

        # API Galerías — listar fotos de una isla
        m_gal = re.match(r"^/api/gallery/([a-z0-9_-]+)$", p)
        if m_gal:
            island = m_gal.group(1)
            gallery_dir = os.path.join("assets", "images", "galleries", island)
            if not os.path.exists(gallery_dir):
                os.makedirs(gallery_dir, exist_ok=True)
            photos = []
            for fname in sorted(os.listdir(gallery_dir)):
                if any(
                    fname.lower().endswith(ext)
                    for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]
                ):
                    photos.append(
                        {
                            "filename": fname,
                            "url": f"/assets/images/galleries/{island}/{fname}",
                        }
                    )
            self._json({"island": island, "photos": photos})
            return

        # Archivos HTML con live reload inyectado
        path = self.translate_path(p)
        if path.endswith(".html") or p in ("/", ""):
            self._serve_html_with_reload(path)
            return

        super().do_GET()


    def end_headers(self):
        """Inyectar Cache-Control según el tipo de archivo."""
        path = self._path_only().lower()
        # Imágenes: 1 día
        if any(path.endswith(ext) for ext in ('.jpg','.jpeg','.png','.gif','.webp','.svg','.ico')):
            self.send_header('Cache-Control', 'public, max-age=86400')
        # CSS y JS: 1 hora
        elif any(path.endswith(ext) for ext in ('.css', '.js')):
            self.send_header('Cache-Control', 'public, max-age=3600')
        # Fuentes
        elif any(path.endswith(ext) for ext in ('.woff','.woff2','.ttf','.otf')):
            self.send_header('Cache-Control', 'public, max-age=604800')  # 1 semana
        # HTML y API: no cachear
        elif path.endswith('.html') or path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    # ── POST ─────────────────────────────────────────────────────────────────
    def do_POST(self):
        p = self._path_only()
        if p == "/api/tours/reset":
            if not self._require_admin():
                return
            db_reset()
            self._json({"ok": True, "tours": db_get_all()})
            return

        if p == "/api/reservations":
            if not self._require_admin():
                return
            data = self._read_body()
            required = ["customer_name", "email", "date", "people", "tour_name"]
            missing = [f for f in required if not data.get(f)]
            if missing:
                self._error(f"Campos requeridos: {', '.join(missing)}")
                return
            reservation = db_create_reservation(data)
            print(f"  Nueva reserva: {data.get('tour_name')} — {data.get('customer_name')}")
            self._json(reservation, 201)
            return

        if p == "/api/tours":
            if not self._require_admin():
                return
            data = self._read_body()
            if not data.get("title"):
                self._error("title es obligatorio")
                return
            tour = db_create(data)
            self._json(tour, 201)
            return

        # API Reseñas — POST (público, cualquiera puede dejar una reseña)
        if p == "/api/reviews":
            data = self._read_body()
            if not data.get("customer_name"):
                self._error("customer_name es obligatorio")
                return
            review = db_create_review(data)
            print(f"  Nueva resena de {data.get('customer_name')} para {data.get('tour_name', 'tour')}")
            self._json(review, 201)
            return

        # Upload de foto a galería de una isla
        m_upload = re.match(r"^/api/gallery/([a-z0-9_-]+)/upload$", p)
        if m_upload:
            if not self._require_admin():
                return
            island = m_upload.group(1)
            gallery_dir = os.path.join("assets", "images", "galleries", island)
            os.makedirs(gallery_dir, exist_ok=True)
            try:
                content_type = self.headers.get("Content-Type", "")
                length = int(self.headers.get("Content-Length", 0))
                if length <= 0:
                    self._error("Archivo vacío", 400)
                    return
                body_bytes = self.rfile.read(length)
                parts = _parse_multipart(body_bytes, content_type)
                file_item = parts.get("photo")
                if (
                    not file_item
                    or not isinstance(file_item, dict)
                    or not file_item.get("filename")
                ):
                    self._error("No se recibió ningún archivo con campo 'photo'", 400)
                    return
                # Limpiar nombre de archivo
                safe_name = re.sub(
                    r"[^a-zA-Z0-9._-]", "_", os.path.basename(file_item["filename"])
                )
                dest = os.path.join(gallery_dir, safe_name)
                # Si ya existe, agregar timestamp
                if os.path.exists(dest):
                    name, ext = os.path.splitext(safe_name)
                    safe_name = f"{name}_{int(time.time())}{ext}"
                    dest = os.path.join(gallery_dir, safe_name)
                with open(dest, "wb") as f:
                    f.write(file_item["data"])
                print(f"  Foto subida: galleries/{island}/{safe_name}")
                self._json(
                    {
                        "ok": True,
                        "filename": safe_name,
                        "url": f"./assets/images/galleries/{island}/{safe_name}",
                    },
                    201,
                )
            except Exception as e:
                self._error(str(e), 500)
            return

        # API Promociones — POST (admin)
        if p == "/api/promotions":
            if not self._require_admin():
                return
            data = self._read_body()
            if not data.get("tour_id") or not data.get("date_available"):
                self._error("tour_id y date_available son obligatorios")
                return
            promo = db_create_promotion(data)
            print(f"  Nueva promocion: tour_id={data.get('tour_id')} fecha={data.get('date_available')}")
            self._json(promo, 201)
            return

        self._error("Ruta no encontrada", 404)

    # ── PUT ──────────────────────────────────────────────────────────────────
    def do_PUT(self):
        p = self._path_only()
        # Guardar contenido HTML de una página
        if p == "/api/content":
            if not self._require_admin():
                return
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0:
                self._error("Cuerpo vacío", 400)
                return
            try:
                body = json.loads(self.rfile.read(length).decode("utf-8"))
                page = os.path.basename(body.get("page", "index.html"))
                content = body.get("content", "")
                if not page.endswith(".html"):
                    self._error("Solo se permiten archivos .html", 400)
                    return
                if not content.strip():
                    self._error("Contenido vacío", 400)
                    return
                filepath = os.path.join(os.getcwd(), page)
                # Backup automático antes de guardar
                backup = filepath + ".bak"
                if os.path.exists(filepath):
                    import shutil

                    shutil.copy2(filepath, backup)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"  Pagina guardada: {page}")
                self._json(
                    {"ok": True, "page": page, "backup": os.path.basename(backup)}
                )
            except Exception as e:
                self._error(str(e), 500)
            return

        m_res_put = re.match(r"^/api/reservations/(\d+)$", p)
        if m_res_put:
            if not self._require_admin():
                return
            data = self._read_body()
            res = db_update_reservation(int(m_res_put.group(1)), data)
            if res:
                self._json(res)
            else:
                self._error("Reservación no encontrada", 404)
            return

        m = re.match(r"^/api/tours/(\d+)$", p)
        if m:
            if not self._require_admin():
                return
            data = self._read_body()
            tour = db_update(int(m.group(1)), data)
            if tour:
                self._json(tour)
            else:
                self._error("Tour no encontrado", 404)
            return
        self._error("Ruta no encontrada", 404)

    # ── DELETE ───────────────────────────────────────────────────────────────
    def do_DELETE(self):
        p = self._path_only()
        # API Reseñas — DELETE (solo admin)
        if p == "/api/reviews":
            if not self._require_admin():
                return
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            id_list = qs.get("id", [])
            if not id_list:
                self._error("Parámetro id requerido", 400)
                return
            try:
                review_id = int(id_list[0])
            except ValueError:
                self._error("id debe ser un número", 400)
                return
            db_delete_review(review_id)
            self._json({"ok": True})
            return

        m_res_del = re.match(r"^/api/reservations/(\d+)$", p)
        if m_res_del:
            if not self._require_admin():
                return
            db_delete_reservation(int(m_res_del.group(1)))
            self._json({"ok": True})
            return

        m = re.match(r"^/api/tours/(\d+)$", p)
        if m:
            if not self._require_admin():
                return
            db_delete(int(m.group(1)))
            self._json({"ok": True})
            return

        m_del = re.match(r"^/api/gallery/([a-z0-9_-]+)/(.+)$", p)

        # API Promociones — DELETE (admin)
        m_promo_del = re.match(r"^/api/promotions/(\d+)$", p)
        if m_promo_del:
            if not self._require_admin():
                return
            db_delete_promotion(int(m_promo_del.group(1)))
            self._json({"ok": True})
            return
        if m_del:
            if not self._require_admin():
                return
            island = m_del.group(1)
            filename = os.path.basename(m_del.group(2))  # Seguridad: solo nombre base
            filepath = os.path.join("assets", "images", "galleries", island, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                self._json({"ok": True, "deleted": filename})
            else:
                self._error("Archivo no encontrado", 404)
            return

        self._error("Ruta no encontrada", 404)

    # ── OPTIONS (CORS preflight) ─────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Secret")
        self.end_headers()

    # ── SSE ──────────────────────────────────────────────────────────────────
    def _handle_sse(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        with _sse_lock:
            _sse_clients.append(self)
        try:
            while True:
                time.sleep(1)
                self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except Exception:
            with _sse_lock:
                if self in _sse_clients:
                    _sse_clients.remove(self)

    # ── HTML + live reload ───────────────────────────────────────────────────
    def _serve_html_with_reload(self, path: str):
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        try:
            with open(path, "rb") as f:
                content = f.read()
        except OSError:
            self.send_error(404, "Archivo no encontrado")
            return
        html = content.decode("utf-8", errors="replace")
        html = (
            html.replace("</body>", f"{_LIVERELOAD_SCRIPT}</body>", 1)
            if "</body>" in html
            else html + _LIVERELOAD_SCRIPT
        )
        encoded = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


# ══════════════════════════════════════════════════════════════════════════════
# ARRANQUE
# ══════════════════════════════════════════════════════════════════════════════


def run(port: int = DEFAULT_PORT):
    init_db()

    watcher = threading.Thread(target=_watch_files, daemon=True)
    watcher.start()

    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer((HOST, port), LiveReloadHandler) as httpd:
        url = f"http://{HOST}:{port}"
        print("=" * 52)
        print("  Servidor Islas Galapagos  (Live Reload)")
        print("=" * 52)
        print(f"  URL    → {url}")
        print(f"  Admin  → {url}/admin.html")
        print(f"  API    → {url}/api/tours")
        print(f"  BD     → {DB_PATH}")
        print(f"  Raíz   → {os.getcwd()}")
        print("  Presiona Ctrl+C para detener")
        print("=" * 52)
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n  Servidor detenido. Hasta luego!\n")


if __name__ == "__main__":
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
            if not (1024 <= port <= 65535):
                raise ValueError
        except ValueError:
            print(
                f"  Puerto invalido '{sys.argv[1]}'. Debe ser un numero entre 1024 y 65535."
            )
            sys.exit(1)
    run(port)
