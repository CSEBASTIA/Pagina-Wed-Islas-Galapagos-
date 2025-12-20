# 🏝️ Isabela Tours - Galápagos

Sistema de reservas de tours para Isla Isabela, Galápagos.

## 📁 Estructura del Proyecto

```
isabela-tours/
├── index.html                 # Página principal
├── .env                       # Variables de entorno (NO SUBIR A GIT)
├── .env.example              # Ejemplo de variables de entorno
├── .gitignore                # Archivos ignorados por Git
├── README.md
│
├── assets/
│   ├── images/               # Imágenes de tours y sitio
│   ├── icons/                # Iconos personalizados
│   └── fonts/                # Fuentes personalizadas
│
├── css/
│   ├── main.css             # Estilos principales (antes estilos.css) 
│   ├── base/                # Estilos base (reset, variables)// proximamente sera agregado 
│   └── pages/               # Estilos específicos por página// proximamente sera agregado 
│
└── js/
    ├── config/
    │   └── supabase.config.js    # Configuración Supabase
    │
    ├── services/                  # Capa de servicios (lógica de negocio)
    │   ├── tours.service.js       # Gestión de tours
    │   ├── bookings.service.js    # Gestión de reservas
    │   └── auth.service.js        # Gestión de autenticación
    │
    ├── components/                # Componentes UI
    │   ├── navigation.ui.js       # Navegación y vistas
    │   ├── tours.ui.js            # Renderizado de tours
    │   ├── booking-modal.ui.js    # Modal de reservas
    │   ├── history-modal.ui.js    # Historial de reservas
    │   ├── auth-modal.ui.js       # Modal de login/registro
    │   └── auth.ui.js             # UI de autenticación
    │
    └── main.js                    # Punto de entrada principal
```

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Luego edita `.env` y agrega tus credenciales de Supabase:

```bash
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_key_anonima
```

**⚠️ IMPORTANTE:** Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

### 2. Orden de carga de scripts en HTML

En tu `index.html`, los scripts deben cargarse en este orden:

```html
<!-- 1. Librerías externas -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://unpkg.com/lucide@latest"></script>

<!-- 2. Configuración -->
<script src="./js/config/supabase.config.js"></script>

<!-- 3. Servicios -->
<script src="./js/services/tours.service.js"></script>
<script src="./js/services/bookings.service.js"></script>
<script src="./js/services/auth.service.js"></script>

<!-- 4. Componentes UI -->
<script src="./js/components/navigation.ui.js"></script>
<script src="./js/components/tours.ui.js"></script>
<script src="./js/components/booking-modal.ui.js"></script>
<script src="./js/components/history-modal.ui.js"></script>
<script src="./js/components/auth-modal.ui.js"></script>
<script src="./js/components/auth.ui.js"></script>

<!-- 5. Inicialización (SIEMPRE AL FINAL) -->
<script src="./js/main.js"></script>
```

## 📦 Componentes y Servicios

### Servicios (Capa de Negocio)

#### `ToursService`
Gestiona los datos de tours:
- `getAllTours()` - Obtener todos los tours
- `getTourById(id)` - Obtener tour por ID
- `filterToursByTag(tag)` - Filtrar tours
- `calculateTotalPrice(id, guests)` - Calcular precio total

#### `BookingsService`
Gestiona las reservas:
- `getAllBookings()` - Obtener todas las reservas
- `createBooking(data)` - Crear nueva reserva
- `updateBookingStatus(id, status)` - Actualizar estado
- `getBookingsSortedByDate()` - Obtener reservas ordenadas

#### `AuthService`
Gestiona la autenticación:
- `getCurrentUser()` - Obtener usuario actual
- `login(credentials)` - Iniciar sesión
- `register(userData)` - Registrar usuario
- `logout()` - Cerrar sesión
- `isLoggedIn()` - Verificar si hay sesión

### Componentes UI

#### `Navigation`
Gestión de navegación:
```javascript
Navigation.showHome();
Navigation.showTours();
Navigation.showBlog();
Navigation.showContact();
```

#### `ToursUI`
Renderizado de tours:
```javascript
ToursUI.renderTours();
ToursUI.filterByTag('Snorkel');
```

#### `BookingModal`
Modal de reservas:
```javascript
BookingModal.open(tourId, isBlog);
BookingModal.close();
```

#### `HistoryModal`
Historial de reservas:
```javascript
HistoryModal.open();
HistoryModal.close();
```

#### `AuthModal`
Modal de autenticación:
```javascript
AuthModal.open('login');
AuthModal.open('register');
AuthModal.close();
```

## 🔧 Migración desde el Código Anterior

Si estás migrando desde el código anterior, los siguientes cambios son importantes:

### Funciones Globales (Compatibilidad)

El código nuevo mantiene compatibilidad con las funciones antiguas:

```javascript
// Anterior → Nuevo (automático)
renderTours() → ToursUI.renderTours()
openModal() → BookingModal.open()
closeModal() → BookingModal.close()
openHistoryModal() → HistoryModal.open()
showHome() → Navigation.showHome()
logout() → AuthUI.handleLogout()
```

### LocalStorage → Services

```javascript
// ❌ Anterior (directo)
localStorage.setItem('isabela_bookings', JSON.stringify(bookings));

// ✅ Nuevo (a través de servicio)
BookingsService.createBooking(bookingData);
```

## 🎨 Buenas Prácticas Implementadas

1. **Separación de responsabilidades**
   - Services: lógica de negocio
   - Components: lógica de UI
   - Config: configuración

2. **Nomenclatura en inglés**
   - Archivos y funciones en inglés
   - Comentarios y UI en español

3. **Variables de entorno seguras**
   - Credenciales en `.env`
   - `.env` en `.gitignore`

4. **Modularización**
   - Cada módulo tiene una responsabilidad única
   - Fácil de mantener y escalar

5. **Compatibilidad hacia atrás**
   - Funciones legacy siguen funcionando
   - Migración gradual posible

## 🛠️ Desarrollo

### Agregar un nuevo tour

Edita `js/services/tours.service.js`:

```javascript
const TOURS = [
    // ... tours existentes
    {
        id: 104,
        title: "Nuevo Tour",
        description: "Descripción...",
        price: 100,
        // ...
    }
];
```

### Agregar una nueva vista

1. Crea el HTML en `index.html`
2. Agrega la vista a `Navigation` en `navigation.ui.js`
3. Crea función para mostrarla

## 📝 Notas Importantes

- **Imágenes:** Actualiza las rutas de las imágenes de `file:///...` a rutas relativas `./assets/images/...`
- **Supabase:** Si no usas Supabase, puedes remover `supabase.config.js`
- **LocalStorage:** Los datos persisten en el navegador del cliente
- **Testing:** Abre la consola del navegador para ver logs de inicialización

## 🤝 Contribuir

1. Mantén la estructura de carpetas
2. Documenta tus funciones
3. Sigue la convención de nomenclatura
4. Prueba antes de hacer commit

## 📄 Licencia

Proyecto privado - Isabela Tours © 2024