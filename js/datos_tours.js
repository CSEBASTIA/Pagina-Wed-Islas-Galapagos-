// datos_tours.js
// Datos de tours + render dinámico de las tarjetas

const TOURS = [
    {
        id: 101,
        title: "Tour Cuatro Hermanos",
        description: "Snorkel avanzado en islotes volcánicos. Hogar de mantarrayas y tortugas.",
        price: 160,
        duration: "5 Horas",
        rating: 4.9,
        reviews: 85,
        image: "file:///C:/Users/sedas/Documents/Isalas Isabelas/imagenes/Cuatro hermanos.jpeg",
        tags: ["Snorkel", "Aventura", "Fauna"],
        difficulty: "Moderado"
    },
    {
        id: 102,
        title: "Tour Punta Cormorant",
        description: "Playas de arena verde y blanca, flamencos y snorkel en la Corona del Diablo.",
        price: 130,
        duration: "4 Horas",
        rating: 4.8,
        reviews: 110,
        image: "file:///C:/Users/sedas/Documents/Isalas Isabelas/imagenes/punta cormorant.jpeg",
        tags: ["Playa", "Caminata", "Snorkel"],
        difficulty: "Fácil"
    },
    {
        id: 103,
        title: "Tour Isla Tortuga",
        description: "Avistamiento de aves en un cráter colapsado. Ideal para fotografía.",
        price: 90,
        duration: "3 Horas",
        rating: 4.7,
        reviews: 60,
        image: "file:///C:/Users/sedas/Documents/Isalas Isabelas/imagenes/isla tortuga.jpeg",
        tags: ["Aves", "Paseo", "Relax"],
        difficulty: "Fácil"
    }
];





const BLOG_TOURS = {
    101: {
        id: 101,
        title: "Tour Cuatro Hermanos",
        offers: "Incluye transporte, equipo de snorkel, box lunch, guía.",
        departure: "07:30 AM",
        arrival: "12:30 PM",
        price: 160,
        image: "file:///C:/Users/sedas/Documents/Isalas Isabelas/imagenes/cuatro hermano 2.jpeg"
    },
    102: {
        id: 102,
        title: "Tour Punta Cormorant",
        offers: "Caminata escénica, Playa de la Harina, snorkel.",
        departure: "08:00 AM",
        arrival: "12:00 PM",
        price: 130,
        image: "file:///C:/Users/sedas/Documents/Isalas Isabelas/imagenes/la de los pajaros.jpeg"
    },
    103: {
        id: 103,
        title: "Tour Isla Tortuga",
        offers: "Recorrido marítimo, avistamiento de aves, pesca vivencial.",
        departure: "02:00 PM",
        arrival: "05:00 PM",
        price: 90,
        image: "file:///C:/Users/sedas/Documents/Isalas Isabelas/imagenes/tortuga2.jpeg"
    }
};

// Renderiza las tarjetas de tours en el grid principal
function renderTours() {
    const toursGrid = document.getElementById('tours-grid');
    if (!toursGrid) return;

    toursGrid.innerHTML = '';

    TOURS.forEach(tour => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group flex flex-col h-full border border-gray-100";
        card.innerHTML = `
            <div class="relative h-60 overflow-hidden">
                <img src="${tour.image}" alt="${tour.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <i data-lucide="star" class="h-4 w-4 text-yellow-400 fill-current"></i>
                    <span class="text-sm font-bold text-gray-800">${tour.rating}</span>
                    <span class="text-xs text-gray-500">(${tour.reviews})</span>
                </div>
                <div class="absolute bottom-4 left-4 flex gap-2">
                    ${tour.tags.map(tag => `<span class="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/20">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-bold text-gray-800 leading-tight">${tour.title}</h3>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${tour.description}</p>
                <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div class="flex items-center gap-1"><i data-lucide="clock" class="h-4 w-4"></i> ${tour.duration}</div>
                    <div class="flex items-center gap-1"><i data-lucide="info" class="h-4 w-4"></i> ${tour.difficulty}</div>
                </div>
                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div><p class="text-xs text-gray-500">Desde</p><p class="text-2xl font-bold text-cyan-700">$${tour.price}</p></div>
                    <button onclick="openModal(${tour.id})" class="bg-gray-900 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors duration-300">Reservar</button>
                </div>
            </div>
        `;
        toursGrid.appendChild(card);
    });
}
