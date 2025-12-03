# 🐢 Isabela Tours - Galápagos

> Una aplicación web moderna para la reserva y gestión de tours turísticos en la Isla Isabela, Galápagos.

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-yellow)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

## 📖 Descripción

Este proyecto es una plataforma web diseñada para conectar a turistas con las maravillas naturales de las Islas Galápagos. Permite a los usuarios explorar diferentes tours (como Los Túneles, Sierra Negra, Tintoreras), ver detalles, galerías de fotos y realizar reservas en línea.

Este es mi primer proyecto Fullstack, desarrollado como parte de mis estudios de Ingeniería en Tecnologías de la Información en la **ULEAM**.

## 📸 Capturas de Pantalla

*(Aquí iría una captura de la pantalla de inicio)*

## 🚀 Tecnologías Utilizadas

Este proyecto utiliza un stack moderno y eficiente:

* **Frontend:**
    * HTML5 Semántico.
    * CSS3 & **Tailwind CSS** (para diseño responsivo y estilos rápidos).
    * **JavaScript (ES6+)** (lógica del cliente, modales, interactividad).
    * **Lucide Icons** (iconografía vectorial ligera).
* **Backend / Base de Datos:**
    * **Supabase** (Base de datos PostgreSQL en la nube para guardar el historial de reservas).
* **Herramientas:**
    * Visual Studio Code.
    * Git & GitHub.

## ✨ Funcionalidades Principales

* ✅ **Catálogo de Tours:** Visualización dinámica de tours con precios, duración y dificultad.
* ✅ **Galería Interactiva:** Diseño tipo "Bento Grid" para mostrar fotos de los destinos.
* ✅ **Sistema de Reservas:** Formulario modal que guarda la información del cliente y el tour seleccionado directamente en Supabase.
* ✅ **Historial de Reservas:** El usuario puede ver el estado de sus solicitudes (Pendiente/Confirmada).
* ✅ **Diseño Responsivo:** Se adapta perfectamente a celulares y computadoras.
* ✅ **Slider Automático:** Sección Hero con transición de imágenes de fondo.

## 📂 Estructura del Proyecto

```text
/
├── css/
│   └── estilos.css       # Estilos personalizados y utilidades
├── js/
│   ├── datos_tours.js    # Array de objetos con la info de los tours
│   ├── Reservas.js       # Conexión con Supabase y lógica de guardado
│   ├── navegacion.js     # Manejo del SPA (Single Page Application)
│   └── inicializacion.js # Scripts de arranque
├── index.html            # Punto de entrada principal
└── README.md             # Documentación