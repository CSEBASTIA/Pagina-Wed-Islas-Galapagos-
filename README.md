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
| `/gestion` | Panel privado para tours y salidas (no aparece en el menú) |

## Tecnología

- **Frontend:** React 19 + Vite 6, con navegación por páginas sin dependencias extra (`src/router.jsx`).
- **API:** Node.js + Express (`server/`), con datos en `data/site.json`.
- **Estilos:** CSS propio (`src/styles.css`), sin librerías de componentes ni de iconos.

## Estructura

```
├── assets/images/          Fotos del sitio (se sirven en /images)
├── server/
│   ├── index.js            API Express y servidor de producción
│   ├── store.js            Lectura y escritura de data/site.json
│   ├── seed.js             Tours iniciales e imágenes permitidas
│   └── index.test.js       Pruebas de la API
└── src/
    ├── main.jsx            Punto de entrada (sitio público o /gestion)
    ├── App.jsx             Rutas y carga de datos
    ├── router.jsx          Navegación, enlaces y títulos de página
    ├── site.js             Contactos, licencia y utilidades
    ├── photos.js           Fotos de la galería y del carrusel
    ├── photoCheck.js       Validación de fotos subidas por visitantes
    ├── PhotoCarousel.jsx   Carrusel «Un vistazo a Galápagos»
    ├── components/         Cabecera, pie, cabecera de páginas e Isla Isabela
    ├── pages/              Inicio, Salidas, Galería, Subir fotos, Contacto, Términos y Gestión
    ├── services/           Integraciones (envío de fotos)
    └── styles.css
```

## Desarrollo local

Requiere Node.js 20 o posterior.

```bash
npm install
cp .env.example .env
npm run dev
```

En PowerShell, copia el ejemplo con `Copy-Item .env.example .env` y define `ADMIN_SECRET` con una clave privada de al menos 16 caracteres.

- Sitio: http://localhost:5173
- Gestión privada: http://localhost:5173/gestion
- API: http://localhost:3001/api/health

| Comando | Uso |
| --- | --- |
| `npm run dev` | API y Vite a la vez, con recarga automática |
| `npm test` | Pruebas de la API |
| `npm run build` | Compila el sitio en `dist/` |
| `npm start` | Servidor de producción (API + `dist/`) |

## Contenido editable

- **Contactos, licencia y mapa:** constantes en `src/site.js` (`WHATSAPP`, `EMAIL`, `INSTAGRAM`, `FACEBOOK`, `LICENSE_HOLDER`, `LICENSE_URL`). Al completar `LICENSE_URL`, «Zallox» se convierte en un enlace en el pie de página y en los términos.
- **Icono y logo:** la orca de `assets/images/logo-orca.png` se usa como icono de la pestaña (`assets/icons/`) y como logo junto a «GOLDEN RAY I» (`assets/images/orca-marca.png`).
- **Galería y carrusel:** `src/photos.js`. Las fotos marcadas con `featured: true` también aparecen en el carrusel.
- **Isla Isabela:** `src/components/IsabelaSection.jsx`.
- **Aviso «Cuidemos Galápagos» de cada tour:** función `careTip` en `src/pages/Home.jsx`; elige el consejo según las actividades del tour.
- **Tours y salidas:** desde `/gestion`. Las salidas pasadas se ocultan solas.

## Sube tu experiencia

La página `/galeria/subir` acepta hasta **5 fotos** por envío. Antes de aceptar un archivo, el navegador comprueba su firma binaria (JPG, PNG o WEBP), que se pueda abrir como imagen, que mida al menos 400 px por lado y que no pese más de 10 MB. Además, pide autorización expresa para publicar las fotos.

El envío todavía no está conectado: `src/services/experiences.js` es el punto de integración con Supabase Storage. Cuando se active, el servidor debe repetir las mismas validaciones y guardar las fotos como pendientes de revisión antes de publicarlas.

## Gestión

`/gestion` permite crear, editar, ocultar y eliminar tours y salidas con una clave única (`ADMIN_SECRET`). No hay usuarios: la sesión usa una cookie `HttpOnly` y `SameSite=Strict` que caduca a las ocho horas, el servidor limita los intentos fallidos y valida todos los cambios.

## Producción

```bash
npm ci
npm run build
npm start
```

El servidor sirve `dist/` y la API en el puerto `PORT` (3001 por defecto). Necesita un hosting Node.js con almacenamiento persistente, porque los datos se guardan en `data/site.json`. En un hosting estático o serverless como Vercel se publican las páginas, pero los tours y las salidas no cargan hasta que se conecten con Supabase.

| Variable | Uso |
| --- | --- |
| `ADMIN_SECRET` | Clave de gestión, mínimo 16 caracteres |
| `PORT` | Puerto HTTP, por defecto 3001 |
| `HOST` | Interfaz HTTP: `127.0.0.1` en desarrollo y `0.0.0.0` con `NODE_ENV=production` |
| `DATA_FILE` | Ruta opcional del archivo de datos |

## Pendiente

- Publicar y actualizar **Próximas salidas** desde Supabase.
- Activar el envío de **Sube tu experiencia** y la revisión de fotos.
- Reemplazar las fotos de la galería por las definitivas.

## Licencia

Este sitio web fue **creado y se publica bajo la licencia de [Zallox](https://zallox.dev/)**. El diseño, el código, la estructura, los textos y la organización de los contenidos están protegidos por esa licencia; cualquier copia, redistribución, modificación o uso comercial requiere autorización previa y por escrito de Zallox.

Las fotografías, el nombre comercial Golden Ray I y sus datos de contacto pertenecen a sus respectivos titulares y se muestran con su autorización. Las condiciones de uso del sitio están en [`/terminos`](src/pages/Terms.jsx).

© Zallox. Todos los derechos reservados.
