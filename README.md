# Golden Ray I · Tours en Galápagos

> **Sitio web creado y publicado bajo la licencia de [Zallox](https://zallox.dev/).**
> Su diseño, código, estructura, textos y organización de contenidos son propiedad de Zallox y se usan bajo su licencia. No se permite copiarlo, redistribuirlo ni usarlo con fines comerciales sin autorización escrita de Zallox.

Sitio de **Golden Ray I**, lancha y equipo local de Puerto Villamil, Isla Isabela (Galápagos). Muestra los tours, las próximas salidas, una galería de fotos, la información de contacto y una página para que los pasajeros compartan sus fotos. Los precios y las reservas se coordinan por WhatsApp: el sitio no cobra ni reserva.

Web publicada: **https://golden-ray-1-galapagos.vercel.app**

## Cómo está construido

```
Navegador ──► Web estática en Vercel (React + Vite)
                 │
                 ▼
              Supabase
              ├── Base de datos Postgres con Row Level Security
              ├── Auth: inicio de sesión + verificación en dos pasos
              ├── Storage: buckets «galeria» (público) y «envios» (privado)
              └── Edge Function «subir-experiencia» (fotos de visitantes)
```

No hay servidor propio. La web habla directamente con Supabase usando la **clave publicable**, que está pensada para estar en el navegador: lo que cada persona puede leer o cambiar lo decide la base de datos con sus reglas (RLS), no el código de la web.

| Pieza | Tecnología |
| --- | --- |
| Interfaz | React 19 + Vite 6, CSS propio (sin librerías de componentes ni de iconos) |
| Navegación | Enrutador propio con la History API (`src/router.jsx`) |
| Datos, acceso y fotos | Supabase mediante `@supabase/supabase-js` |
| Publicación | Vercel, automática con cada cambio en `main` |

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada, tours (cada uno con su aviso «Cuidemos Galápagos»), Nosotros, Isla Isabela y accesos rápidos |
| `/salidas` | Próximas salidas agrupadas por mes, con resumen por tour y botón de consulta por WhatsApp |
| `/galeria` | Carrusel con flechas, galería con filtros por categoría, visor ampliado y enlace para subir fotos |
| `/galeria/subir` | «Sube tu experiencia»: hasta 5 fotos por envío |
| `/contacto` | WhatsApp, correo, Instagram, Facebook, ubicación y preguntas frecuentes |
| `/terminos` | Términos y condiciones del sitio y de las fotos enviadas |
| *(dirección secreta)* | Panel de administración; ver [Panel de administración](#panel-de-administración) |

## Estructura del código

```
├── index.html                  Página base (carga src/main.jsx)
├── vite.config.js              Compilación; nombres de archivo aleatorios; cabeceras para npm start
├── vercel.json                 Compilación en Vercel, rutas y cabeceras de seguridad
├── assets/                     Archivos públicos (se sirven desde la raíz)
│   ├── icons/                  Icono de la pestaña y del móvil
│   └── images/                 Fotos del sitio y logo (orca-marca.png)
├── docs/logo-orca-original.jpg Logo original (archivo fuente, no se publica)
├── supabase/
│   ├── migrations/             Esquema completo de la base de datos, en orden
│   └── functions/subir-experiencia/index.ts   Recepción de fotos de visitantes
└── src/
    ├── main.jsx                Arranque: sitio público o panel según la dirección
    ├── App.jsx                 Rutas públicas y carga de datos
    ├── router.jsx              Navegación, enlaces internos y títulos de página
    ├── adminRoute.js           Huella SHA-256 de la dirección secreta del panel
    ├── site.js                 Contactos, licencia (Zallox) y utilidades de formato
    ├── photos.js               Categorías y fotos de respaldo de la galería
    ├── photoCheck.js           Validación y optimización de fotos en el navegador
    ├── PhotoCarousel.jsx       Carrusel «Un vistazo a Galápagos»
    ├── styles.css              Todos los estilos
    ├── lib/supabase.js         Cliente de Supabase y URL públicas de las fotos
    ├── components/
    │   ├── Layout.jsx          Cabecera, pie, cabecera de página y enlace a Zallox
    │   └── IsabelaSection.jsx  Sección «Isla Isabela»
    ├── pages/
    │   ├── Home.jsx, Departures.jsx, Gallery.jsx, UploadPhotos.jsx, Contact.jsx, Terms.jsx
    │   ├── Manage.jsx          Panel: acceso, pestañas, tours, salidas y revisión de fotos
    │   └── admin/
    │       ├── GalleryTab.jsx  Pestaña Galería del panel
    │       └── MfaCard.jsx     Pantallas de la verificación en dos pasos
    └── services/
        ├── site.js             Lectura pública: tours, salidas y galería
        ├── admin.js            Operaciones del panel (sesión, 2 pasos, tours, salidas, galería, revisión)
        ├── experiences.js      Envío de fotos a la Edge Function
        ├── mappers.js          Conversión entre filas de Supabase y el formato de la web
        └── mappers.test.js     Pruebas (npm test)
```

## Cómo funciona

### Sitio público

- **Arranque** (`main.jsx`): calcula la huella de la dirección actual. Si coincide con la del panel, descarga el código del panel; si no, muestra el sitio público.
- **Navegación** (`router.jsx`): cambia de página sin recargar, actualiza el título de la pestaña y lleva a la sección indicada tras el `#` (por ejemplo `/#destinos`). En Vercel, `vercel.json` redirige todas las rutas a `index.html`, así cualquier dirección se puede abrir directamente.
- **Datos** (`services/site.js`): al cargar se piden a Supabase los tours visibles, las salidas desde hoy (con la fecha de Galápagos) y las fotos publicadas. `mappers.js` los convierte al formato de la web: por ejemplo, agrupa las salidas por tour y resuelve la URL de cada foto. La galería se muestra primero con `photos.js` y se reemplaza por la de Supabase en cuanto llega.
- **Contenido fijo**: los textos de cada página están en `src/pages/`; los contactos y la licencia, en `src/site.js`; el aviso ambiental de cada tour lo elige `careTip()` en `Home.jsx` según sus actividades (snorkel, caminata o aves).

### Sube tu experiencia

1. **Navegador** (`photoCheck.js`): comprueba la firma real del archivo (JPG, PNG, WEBP o HEIC del iPhone), que se pueda abrir, que mida al menos 400 px por lado y que el original no pase de 25 MB. Después la **optimiza**: lado mayor de 1600 px, JPEG de calidad 0,82 y sin metadatos (se elimina la ubicación GPS).
2. **Envío** (`services/experiences.js`): manda las fotos, el nombre, el tour y el comentario a la Edge Function.
3. **Edge Function** (`supabase/functions/subir-experiencia`): solo acepta peticiones de la web publicada y de localhost. Repite las validaciones en el servidor (máximo 5 fotos de 10 MB, formato real, mínimo 400 px), limita a **3 envíos por hora por IP** (guardada solo como huella SHA-256) y **60 al día**, y guarda las fotos como pendientes en el bucket privado `envios`. Además borra los envíos que llevan más de 30 días sin revisar.
4. **Revisión** en el panel: *Aprobar* copia la foto al bucket `galeria`, la agrega a la galería con título, categoría, crédito y opción de carrusel, y borra el original; *Rechazar* la borra.

Para cambiar de almacenamiento en el futuro (otro proveedor o un NAS) basta con cambiar `services/experiences.js` y la Edge Function.

### Panel de administración

- **Dirección oculta:** no existe una ruta pública. `adminRoute.js` solo guarda la huella SHA-256 de la dirección (formato `/<código>/gestion/`, el código distingue mayúsculas); la dirección real está únicamente en el `.env` local, que nunca se sube. El código del panel se descarga aparte y solo en esa dirección, y la página lleva `noindex` y `no-referrer`.
- **Acceso en tres pasos:** correo y contraseña de Supabase Auth → **código de 6 dígitos** de una app de autenticación (la primera vez se configura con un código QR) → comprobación de que la cuenta está en la tabla `admins`.
- **Pestañas:**
  - **Fotos de visitantes:** muestra un contador de pendientes; el panel se abre aquí si hay fotos por revisar.
  - **Galería:** subir hasta 10 fotos a la vez (optimizadas), editar título y categoría, mostrar u ocultar, poner en el carrusel, cambiar el orden y borrar. No deja borrar una foto que use un tour.
  - **Salidas:** crear, editar y borrar fechas. Las pasadas se atenúan en el panel y desaparecen solas de la web.
  - **Tours:** crear, editar, ocultar y borrar. El identificador de un tour nuevo se genera a partir del título.

### Seguridad

- **Permisos en la base de datos:** todas las tablas y buckets tienen Row Level Security. Los visitantes solo leen lo público. Para crear, editar o borrar hace falta `private.is_admin()`, que exige estar en `admins` **y** haber pasado la verificación en dos pasos (sesión de nivel `aal2`). Manipular la web desde la consola no da más permisos.
- **Cabeceras** (`vercel.json`): política de contenido (CSP) que solo permite scripts propios y conexiones a Supabase, bloqueo de marcos externos contra el clickjacking (`frame-ancestors 'none'`, `X-Frame-Options`), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP` y HSTS.
- **Secretos:** `.gitignore` impide subir cualquier `.env`, claves, certificados y carpetas locales de Vercel o Supabase. La clave de servicio de Supabase solo existe dentro de la Edge Function.

## Base de datos (Supabase)

Proyecto **Islas Galapagos** (`lmgecsbrkpfkeifshxot`). El esquema completo está en [`supabase/migrations/`](supabase/migrations).

| Tabla | Contenido | Lectura pública |
| --- | --- | --- |
| `tours` | Título, destino, descripción, dificultad, actividades (máx. 4), foto, visible y orden | Solo los visibles |
| `departures` | Tour, fecha, hora, cupos (1–99) y nota; no se repite un mismo tour, fecha y hora | Solo las futuras de tours visibles |
| `gallery_photos` | Foto, título, detalle, categoría, carrusel, publicada, orden, origen y crédito | Solo las publicadas |
| `photo_submissions` | Envíos de visitantes: nombre, tour, comentario, autorización y estado | No |
| `submission_photos` | Fotos de cada envío (máx. 5, mín. 400 px) y su estado | No |
| `admins` | Cuentas de Supabase Auth con acceso al panel | No |

| Bucket | Uso |
| --- | --- |
| `galeria` | Público. Fotos que se ven en la web; solo los administradores suben o borran |
| `envios` | Privado. Fotos de visitantes pendientes; solo los administradores las ven |

Las fotos pueden ser del propio sitio (ruta que empieza por `/images/...`) o estar en el bucket `galeria` (ruta como `equipo/...` o `visitantes/...`); `lib/supabase.js` resuelve la URL correcta.

## Trabajar en local

Requiere **Node.js 20** o posterior. No hace falta configurar variables: la web usa el proyecto de Supabase por defecto.

```bash
npm install
npm run dev
```

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 con recarga automática |
| `npm test` | Pruebas de `services/mappers.js` |
| `npm run build` | Compila la web en `dist/` |
| `npm start` | Sirve la versión compilada en http://localhost:3001 con las mismas cabeceras que Vercel |

El panel en local está en `http://localhost:5173` seguido de la dirección secreta guardada en tu `.env`.

## Publicación

Vercel está conectado a este repositorio: cada cambio en `main` se compila (`npm run build`) y se publica solo en uno o dos minutos. La configuración (rutas, cabeceras y caché de un año para los archivos con hash) está en `vercel.json`.

## Tareas habituales

**Dar acceso a un administrador:** crea el usuario en Supabase (**Authentication → Users → Add user**, con *Auto Confirm User*) y agrégalo a `admins`. Al entrar por primera vez configurará su verificación en dos pasos.

```sql
insert into public.admins (user_id, name)
select id, 'Nombre' from auth.users where email = 'correo@ejemplo.com';
```

**Quitar el acceso a un administrador:**

```sql
delete from public.admins a using auth.users u
where a.user_id = u.id and u.email = 'correo@ejemplo.com';
```

**Si un administrador pierde el teléfono:** borra su factor de verificación en Supabase (**Authentication → Users**) o con SQL. La próxima vez que entre configurará uno nuevo.

```sql
delete from auth.mfa_factors where user_id = (select id from auth.users where email = 'correo@ejemplo.com');
```

**Cambiar la dirección del panel:** elige una nueva ruta (por ejemplo `/Ab3dEf7hJk9m/gestion`), calcula su huella y reemplázala en `src/adminRoute.js`. Guarda la ruta en tu `.env`, nunca en el código.

```bash
node -e "console.log(require('crypto').createHash('sha256').update('/Ab3dEf7hJk9m/gestion').digest('hex'))"
```

**Publicar en un dominio propio:** agrega el dominio a `ALLOWED_ORIGINS` en `supabase/functions/subir-experiencia/index.ts` y vuelve a desplegar la función; si no, la subida de fotos rechazará ese dominio.

**Cambiar contactos o licencia:** constantes de `src/site.js` (`WHATSAPP`, `EMAIL`, `INSTAGRAM`, `FACEBOOK`, `LICENSE_HOLDER`, `LICENSE_URL`).

**Cambiar las fotos de la galería:** desde la pestaña **Galería** del panel. Las fotos fijas de las páginas (portada, cabeceras) están en `assets/images/` y se referencian desde `src/pages/`.

## Licencia

Este sitio web fue **creado y se publica bajo la licencia de [Zallox](https://zallox.dev/)**. El diseño, el código, la estructura, los textos y la organización de los contenidos están protegidos por esa licencia; cualquier copia, redistribución, modificación o uso comercial requiere autorización previa y por escrito de Zallox.

Las fotografías, el nombre comercial Golden Ray I y sus datos de contacto pertenecen a sus respectivos titulares y se muestran con su autorización. Las condiciones de uso del sitio están en [`/terminos`](src/pages/Terms.jsx).

© Zallox. Todos los derechos reservados.
