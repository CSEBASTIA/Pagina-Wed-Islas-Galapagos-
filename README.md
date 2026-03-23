# 🏝️ Golden Ray I — Isabela Tours · Galápagos

Sitio web de tours para la lancha **Golden Ray I** en Isla Isabela, Galápagos. Permite a los clientes explorar destinos, ver galerías de fotos, dejar reseñas y contactar directamente por WhatsApp. Incluye un panel de administración completo para gestionar tours, fotos y reseñas.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + Tailwind CSS + Vanilla JavaScript |
| Backend (API) | Vercel Serverless Functions (Node.js) |
| Base de datos | Supabase (PostgreSQL) |
| Storage (fotos) | Supabase Storage |
| Despliegue | Vercel |
| Servidor local | Python (`server.py`) con SQLite + Live Reload |

---

## 📁 Estructura del Proyecto

```
golden-ray/
├── index.html              # Página principal
├── tours.html              # Destinos + galerías por isla
├── blog.html               # Blog dinámico con reseñas
├── contact.html            # Canales de contacto
├── galeria.html            # Galería completa por isla (lightbox)
├── admin.html              # Panel de administración
│
├── server.py               # Servidor local Python (desarrollo)
├── vercel.json             # Rutas y rewrites para Vercel
├── package.json
├── supabase-setup.sql      # Script SQL para inicializar Supabase
├── .env.example            # Ejemplo de variables de entorno
│
├── api/                    # Serverless Functions (Vercel)
│   ├── _adminAuth.js       # Middleware de autenticación admin
│   ├── _supabase.js        # Cliente Supabase (server-side)
│   ├── admin/
│   │   └── ping.js         # GET /api/admin/ping — validar sesión admin
│   ├── tours/
│   │   ├── index.js        # GET /api/tours · POST /api/tours
│   │   ├── [id].js         # GET · PUT · DELETE /api/tours/:id
│   │   └── reset.js        # POST /api/tours/reset
│   ├── gallery/
│   │   ├── list.js         # GET /api/gallery/:island
│   │   ├── upload.js       # POST /api/gallery/:island/upload
│   │   └── delete.js       # DELETE /api/gallery/:island/:file
│   └── reviews/
│       └── index.js        # GET · POST · DELETE /api/reviews
│
├── css/
│   ├── main.css            # Estilos globales
│   ├── animations.css      # Animaciones de entrada y scroll
│   ├── home.css            # Estilos específicos del inicio
│   ├── tours.css           # Estilos de la página de tours
│   ├── blog.css            # Estilos del blog
│   └── contact.css         # Estilos de la página de contacto
│
├── js/
│   ├── main.js             # Punto de entrada — inicializa la app
│   ├── blog-page.js        # Inicialización del blog
│   ├── contact-page.js     # Inicialización de contacto
│   ├── admin-api-headers.js # Headers de autenticación admin
│   │
│   ├── config/
│   │   └── supabase.js     # Config Supabase (solo clave anon, frontend)
│   │
│   ├── services/           # Lógica de negocio (llamadas a /api/*)
│   │   ├── tours.service.js
│   │   ├── reviews.service.js
│   │   ├── gallery.service.js
│   │   ├── bookings.service.js   # Reservas (localStorage)
│   │   ├── auth.service.js       # Auth simple (localStorage)
│   │   ├── reservation.service.js
│   │   ├── observer.service.js   # Stub
│   │   └── theme.service.js      # Stub
│   │
│   └── components/         # UI Components
│       ├── navigation.ui.js
│       ├── tours.ui.js         # Renderizado de tours (Strategy Pattern)
│       ├── review-modal.ui.js  # Modal para dejar reseñas
│       ├── blog.ui.js          # Renderizado del blog
│       ├── admin-panel.ui.js   # Panel de administración
│       ├── booking-modal.ui.js # Modal de reservas → WhatsApp
│       ├── history-modal.ui.js # Historial de reservas
│       ├── auth-modal.ui.js    # Modal de login
│       └── auth.ui.js          # UI de autenticación
│
└── assets/
    └── images/             # Imágenes del sitio y galerías
```

---

## 🌐 Páginas del Sitio

### `index.html` — Inicio
Presenta la empresa con secciones en este orden:
1. **Hero** — imagen de portada con llamada a la acción
2. **Archipiélago** — info sobre Galápagos (fauna, flora, reserva marina)
3. **Reseñas** — grid de tours donde los clientes pueden dejar reseñas con estrellas
4. **¿Por qué elegirnos?** — diferenciadores de Golden Ray I con imagen de la lancha

### `tours.html` — Destinos
Muestra las 3 islas principales con galería de fotos dinámica (cargada desde Supabase Storage) y botón de reserva directo a WhatsApp. Las islas disponibles son: Isla Tortuga, Punta Cormorant y Cuatro Hermanos.

### `blog.html` — Blog
Genera automáticamente un artículo por cada tour activo en la base de datos, mostrando sus reseñas asociadas debajo. No requiere edición manual.

### `contact.html` — Contacto
Cards de contacto directo: WhatsApp, Instagram, Facebook y correo.

### `galeria.html` — Galería
Galería completa por isla con lightbox, navegación entre fotos y selección por tabs. Las fotos se cargan dinámicamente desde Supabase Storage.

### `admin.html` — Panel Admin
Panel protegido por clave (`ADMIN_SECRET`). Funcionalidades:
- **Tours**: crear, editar, eliminar y restaurar los 6 tours originales
- **Galerías**: subir y eliminar fotos por isla
- **Reseñas**: ver y eliminar reseñas de clientes
- **Blog**: resumen de tours y cantidad de reseñas por tour
- **Editor HTML**: editar el HTML de cualquier página del sitio directamente (con backup automático)

---

## 🔌 API REST

Todos los endpoints viven en `/api/*` y son manejados por Vercel Serverless Functions.

### Tours
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/tours` | — | Listar todos los tours |
| GET | `/api/tours/:id` | — | Obtener un tour |
| POST | `/api/tours` | Admin | Crear tour |
| PUT | `/api/tours/:id` | Admin | Actualizar tour |
| DELETE | `/api/tours/:id` | Admin | Eliminar tour |
| POST | `/api/tours/reset` | Admin | Restaurar 6 tours originales |

### Reseñas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/reviews` | — | Listar todas las reseñas |
| POST | `/api/reviews` | — | Crear reseña (público) |
| DELETE | `/api/reviews?id=:id` | Admin | Eliminar reseña |

### Galerías
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/gallery/:island` | — | Listar fotos de una isla |
| POST | `/api/gallery/:island/upload` | Admin | Subir foto |
| DELETE | `/api/gallery/:island/:file` | Admin | Eliminar foto |

### Admin
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/ping` | Admin | Validar clave de sesión |

La autenticación admin usa el header `Authorization: Bearer <secret>` o `X-Admin-Secret: <secret>`, comparado con la variable de entorno `ADMIN_SECRET` mediante `crypto.timingSafeEqual` para prevenir timing attacks.

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz (nunca lo subas a git):

```env
# Clave del panel admin (mínimo 16 caracteres)
ADMIN_SECRET=tu_clave_larga_aqui

# Supabase — solo en el servidor (Vercel Functions)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=eyJ...clave_service_role...

# La clave anon va en js/config/supabase.js (es pública)
```

En Vercel: **Project → Settings → Environment Variables**

---

## 🗄️ Base de Datos (Supabase)

Ejecuta `supabase-setup.sql` en el SQL Editor de Supabase para crear las tablas, políticas RLS y el bucket de galerías.

### Tabla `tours`
```sql
id, title, description, duration, departure, arrival,
rating, reviews, image, tags (CSV), difficulty
```

### Tabla `reviews`
```sql
id, tour_name, customer_name, rating (1-5), comment, created_at
```

### Storage bucket `galleries`
Estructura de carpetas: `galleries/{island}/{filename}`
Islas disponibles: `tortuga`, `cormorant`, `hermanos`

---

## 💻 Desarrollo Local

El proyecto incluye `server.py`, un servidor Python con SQLite y live reload para trabajar sin internet ni Vercel CLI.

```bash
python server.py          # Puerto 8000
python server.py 3000     # Puerto personalizado
```

El servidor levanta en `http://localhost:8000` y abre el navegador automáticamente. Detecta cambios en archivos `.html`, `.css`, `.js` y recarga la página automáticamente.

En local la API usa SQLite (`tours.db`). En producción (Vercel) usa Supabase.

---

## 🚢 Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno (`ADMIN_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)
3. Vercel despliega automáticamente en cada push a `main`

Las rutas de la API están definidas en `vercel.json` con rewrites para mapear URLs amigables a los archivos serverless.

---

## 🔒 Seguridad

- La `SUPABASE_SERVICE_KEY` (clave con permisos totales) **nunca va al frontend**, solo en las Vercel Functions del servidor
- El frontend solo usa la `SUPABASE_ANON_KEY` (clave pública)
- La autenticación admin usa comparación de timing seguro (`timingSafeEqual`) para prevenir ataques de temporización
- Las tablas tienen Row Level Security (RLS) en Supabase: lectura pública para tours y reseñas, escritura solo desde `service_role`
- El `.env` está en `.gitignore` — las credenciales reales nunca se suben al repositorio

---

## 📱 Flujo del Cliente

1. El visitante explora los tours en la página de inicio o en `/tours.html`
2. Hace clic en **"Dejar Reseña"** → se abre un modal con selector de estrellas
3. La reseña se guarda en Supabase y aparece en el blog automáticamente
4. Para reservar, el botón de WhatsApp abre una conversación con el mensaje prellenado

---

© 2025 Golden Ray I · Isla Isabela, Galápagos