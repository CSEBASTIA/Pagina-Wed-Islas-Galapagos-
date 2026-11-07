# Golden Ray I · Galápagos

Sitio informativo de tours hecho con **React + Vite** y una API en **Node.js + Express**. El sitio se navega por páginas:

| Ruta | Contenido |
| --- | --- |
| `/` | Portada, tours, Nosotros y accesos rápidos |
| `/salidas` | Salidas agrupadas por mes |
| `/galeria` | Carrusel con flechas y galería de fotos con visor ampliado |
| `/contacto` | Canales de contacto, ubicación y preguntas frecuentes |

Los precios se consultan con el negocio; no hay reservas automáticas, cuentas de cliente ni blog. Las fotos de la galería se definen en `src/photos.js`.

## Desarrollo local

Requiere Node.js 20 o posterior.

```bash
npm install
cp .env.example .env
npm run dev
```

- Sitio: http://localhost:5173
- Gestión privada: http://localhost:5173/gestion
- API local: http://localhost:3001/api/health

En PowerShell, copia el ejemplo con `Copy-Item .env.example .env`. Define una clave privada `ADMIN_SECRET` de al menos 16 caracteres. La clave **no** se guarda en el navegador. No se crea ningún usuario: quien conoce la clave puede gestionar los tours y las salidas.

## Producción

```bash
npm ci
npm run build
npm start
```

El servidor usa el puerto de `PORT` (3001 por defecto) y sirve `dist/` junto con la API. Debe ejecutarse en un hosting Node.js con **almacenamiento persistente**, porque los cambios se guardan en `data/site.json`. El antiguo despliegue serverless de Vercel no se usa con esta arquitectura: su sistema de archivos no es apropiado para este archivo de datos.

Variables:

| Variable | Uso |
| --- | --- |
| `ADMIN_SECRET` | Clave única del superusuario, mínimo 16 caracteres |
| `PORT` | Puerto HTTP, por defecto 3001 |
| `HOST` | Interfaz HTTP, por defecto `127.0.0.1` en desarrollo y `0.0.0.0` en producción |
| `DATA_FILE` | Ruta opcional del JSON persistente |

Respalda `data/site.json` periódicamente. En el primer arranque se crean seis tours a partir del contenido anterior; las fechas viejas del prototipo no se importan porque no representan disponibilidad vigente.

## Gestión

La ruta `/gestion` no aparece en el menú público. Permite crear, editar, ocultar y eliminar tours (descripción, duración, dificultad, actividades e imagen), además de crear, editar y eliminar fechas con hora y cupos. Las fechas pasadas se ocultan automáticamente del sitio público. Se pueden seleccionar las imágenes existentes de `assets/images/`.

La sesión de gestión usa una cookie `HttpOnly`, `SameSite=Strict` y caduca a las ocho horas. El servidor limita los intentos fallidos de inicio de sesión. Todas las modificaciones se validan en la API.
