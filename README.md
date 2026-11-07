# Golden Ray I · Tours en Galápagos

> **Sitio web creado y publicado bajo la licencia de [Zallox](https://zallox.dev/).**
> Su diseño, código, estructura, textos y organización de contenidos son propiedad de Zallox y se usan bajo su licencia. No se permite copiarlo, redistribuirlo ni usarlo con fines comerciales sin autorización escrita de Zallox.

Sitio informativo de **Golden Ray I**, lancha y equipo local de Puerto Villamil, Isla Isabela (Galápagos). Presenta los tours, las próximas salidas, una galería de fotos, la información de contacto y una página para que los pasajeros compartan sus fotos. Los precios y las reservas se coordinan directamente con el negocio por WhatsApp; el sitio no tiene pagos, cuentas de cliente ni reservas automáticas.

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada, tours con aviso de cuidado ambiental, Nosotros, Isla Isabela y accesos rápidos |
| `/salidas` | Próximas salidas agrupadas por mes, con resumen por tour |
| `/galeria` | Carrusel con flechas, galería con filtros y visor ampliado, y enlace para subir fotos |
| `/galeria/subir` | «Sube tu experiencia»: hasta 5 fotos por envío, validadas en el navegador |
| `/contacto` | WhatsApp, correo, Instagram, Facebook, ubicación y preguntas frecuentes |
| `/terminos` | Términos y condiciones del sitio web y su información |
| *(ruta secreta)* | Panel privado para tours y salidas; ver «Gestión» |

## Tecnología

- **Frontend:** React 19 + Vite 6, con navegación por páginas sin dependencias extra (`src/router.jsx`).
- **Datos y acceso:** Supabase (Postgres, Auth y Storage) mediante `@supabase/supabase-js`. No hay servidor propio: la web es estática y se publica en Vercel.
- **Estilos:** CSS propio (`src/styles.css`), sin librerías de componentes ni de iconos.

## Estructura

```
├── assets/images/          Fotos del sitio (se sirven en /images)
├── supabase/migrations/    Esquema de la base de datos (SQL)
├── vercel.json             Compilación y rutas en Vercel
└── src/
    ├── main.jsx            Punto de entrada (sitio público o panel privado)
    ├── adminRoute.js       Huella SHA-256 de la ruta secreta del panel
    ├── App.jsx             Rutas y carga de datos
    ├── router.jsx          Navegación, enlaces y títulos de página
    ├── site.js             Contactos, licencia y utilidades
    ├── lib/supabase.js     Cliente de Supabase y URL de las fotos
    ├── photos.js           Fotos de respaldo de la galería (las reales están en Supabase)
    ├── photoCheck.js       Validación de fotos subidas por visitantes
    ├── PhotoCarousel.jsx   Carrusel «Un vistazo a Galápagos»
    ├── components/         Cabecera, pie, cabecera de páginas e Isla Isabela
    ├── pages/              Inicio, Salidas, Galería, Subir fotos, Contacto, Términos y Gestión
    ├── services/           Datos públicos, panel, envío de fotos y conversiones (con pruebas)
    └── styles.css
```

## Desarrollo local

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

No hace falta configurar nada: la web se conecta al proyecto de Supabase «Islas Galapagos» con su clave publicable. Para usar otro proyecto, copia `.env.example` a `.env` y completa las variables.

- Sitio: http://localhost:5173
- Panel privado: dirección secreta guardada en tu `.env` (cuenta de administrador de Supabase)

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm test` | Pruebas de la conversión de datos |
| `npm run build` | Compila el sitio en `dist/` |
| `npm start` | Sirve la versión compilada en http://localhost:3001 |

## Contenido editable

- **Contactos, licencia y mapa:** constantes en `src/site.js` (`WHATSAPP`, `EMAIL`, `INSTAGRAM`, `FACEBOOK`, `LICENSE_HOLDER`, `LICENSE_URL`). Al completar `LICENSE_URL`, «Zallox» se convierte en un enlace en el pie de página y en los términos.
- **Icono y logo:** la orca de `assets/images/logo-orca.png` se usa como icono de la pestaña (`assets/icons/`) y como logo junto a «GOLDEN RAY I» (`assets/images/orca-marca.png`).
- **Galería y carrusel:** tabla `gallery_photos` de Supabase. Las fotos con `featured` también aparecen en el carrusel. `src/photos.js` solo se usa mientras carga o si Supabase no responde.
- **Isla Isabela:** `src/components/IsabelaSection.jsx`.
- **Aviso «Cuidemos Galápagos» de cada tour:** función `careTip` en `src/pages/Home.jsx`; elige el consejo según las actividades del tour.
- **Tours y salidas:** desde el panel privado. Las salidas pasadas se ocultan solas.

## Sube tu experiencia

La página `/galeria/subir` acepta hasta **5 fotos** por envío:

1. **En el navegador** (`src/photoCheck.js`) se comprueba la firma binaria (JPG, PNG o WEBP), que la foto se pueda abrir, que mida al menos 400 px por lado y que el original no pese más de 25 MB. Luego se **optimiza**: lado mayor de 1600 px, JPEG de calidad 0,82 y sin metadatos (se elimina la ubicación GPS). Dos fotos de 12 MB quedan en unos 600 KB.
2. **En Supabase**, la Edge Function `subir-experiencia` ([`supabase/functions/subir-experiencia`](supabase/functions/subir-experiencia/index.ts)) repite las validaciones (máx. 10 MB, mín. 400 px, formato real), limita a **3 envíos por hora por IP** (guardada como huella SHA-256) y **60 al día**, y guarda las fotos como pendientes en el bucket privado `envios`. Además borra los envíos sin revisar con más de 30 días.
3. **En el panel**, la sección «Fotos de visitantes» muestra las pendientes. *Aprobar* copia la foto al bucket `galeria`, la agrega a la galería (título, categoría, crédito y opción de carrusel) y borra el original; *Rechazar* la borra.

Para cambiar de almacenamiento más adelante (otro proveedor o un NAS), solo hay que cambiar `src/services/experiences.js` y la función.

## Gestión

El panel privado permite crear, editar, ocultar y eliminar tours y salidas.

**Dirección oculta:** el panel no tiene una ruta pública. En el código solo está la huella SHA-256 de su dirección (`src/adminRoute.js`), así que no se puede deducir leyendo el repositorio ni inspeccionando la web; la dirección real está en el `.env` local. El código del panel se descarga aparte, con nombre aleatorio, solo al entrar por esa ruta, y la página lleva `noindex` y `no-referrer`. Para cambiar la dirección, calcula la huella de la nueva ruta con el comando que indica `src/adminRoute.js`.

**Acceso:** Se entra con una cuenta de **Supabase Auth** (correo y contraseña) que esté registrada en la tabla `admins`; una cuenta que no esté en esa tabla ve «Cuenta sin acceso». Los cambios se guardan directamente en Supabase y la base de datos rechaza cualquier escritura que no venga de un administrador. Los identificadores de los tours nuevos se generan a partir del título (por ejemplo, `los-tuneles`).

## Producción

La web se publica en **Vercel** desde la rama `main`: `vercel.json` compila con `npm run build`, sirve `dist/` y redirige todas las rutas a `index.html`, así `/salidas`, `/galeria` o el panel funcionan al abrirlos directamente. Los datos vienen de Supabase, por lo que no hace falta ningún servidor ni variable de entorno.

## Base de datos (Supabase)

Proyecto de Supabase: **Islas Galapagos** (`lmgecsbrkpfkeifshxot`). El esquema completo está en [`supabase/migrations/`](supabase/migrations), en el orden en que se aplicó.

| Tabla | Contenido | Acceso público |
| --- | --- | --- |
| `tours` | Tours, con foto, dificultad, actividades, visibilidad y orden | Solo los visibles |
| `departures` | Salidas: tour, fecha, hora, cupos y nota. No se repite un mismo tour, fecha y hora | Solo las futuras de tours visibles |
| `gallery_photos` | Fotos de la galería; `featured` = también en el carrusel | Solo las publicadas |
| `photo_submissions` | Envíos de «Sube tu experiencia» (nombre, tour, comentario, autorización) | Ninguno |
| `submission_photos` | Fotos de cada envío (máximo 5, mínimo 400 px, hasta 10 MB) con estado pendiente, aprobada o rechazada | Ninguno |
| `admins` | Usuarios de Supabase Auth que pueden usar el panel | Ninguno |

| Bucket | Uso |
| --- | --- |
| `galeria` | Público: fotos que se muestran en la web. Solo los administradores suben o borran |
| `envios` | Privado: fotos de visitantes pendientes de revisión. Solo los administradores las ven |

- Los permisos se controlan con Row Level Security: los visitantes solo leen; crear, editar y borrar exige ser administrador (`private.is_admin()`).
- Las fotos de los visitantes llegan por la Edge Function `subir-experiencia`, que usa la clave de servicio y repite las validaciones del formulario.
- Las tablas de la web anterior están en el esquema `legacy`, que no se expone por la API.
- Para dar acceso a un administrador: crea el usuario en Supabase (**Authentication → Users → Add user**) y agrégalo a la tabla `admins`:

  ```sql
  insert into public.admins (user_id, name)
  select id, 'Nombre' from auth.users where email = 'correo@ejemplo.com';
  ```

## Pendiente

- Copia de seguridad de las fotos (por ejemplo, en un NAS propio).
- Reemplazar las fotos de la galería por las definitivas.

## Licencia

Este sitio web fue **creado y se publica bajo la licencia de [Zallox](https://zallox.dev/)**. El diseño, el código, la estructura, los textos y la organización de los contenidos están protegidos por esa licencia; cualquier copia, redistribución, modificación o uso comercial requiere autorización previa y por escrito de Zallox.

Las fotografías, el nombre comercial Golden Ray I y sus datos de contacto pertenecen a sus respectivos titulares y se muestran con su autorización. Las condiciones de uso del sitio están en [`/terminos`](src/pages/Terms.jsx).

© Zallox. Todos los derechos reservados.
