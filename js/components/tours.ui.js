// js/components/tours.ui.js
// Componente de renderizado de tours

console.log('📦 Cargando tours.ui.js...');

const ToursUI = {
  renderTours() {
    const toursGrid = document.getElementById('tours-grid');
    if (!toursGrid) {
      console.error('❌ No se encontró tours-grid');
      return;
    }

    const tours = ToursService.getAllTours();
    console.log(`✅ Renderizando ${tours.length} tours...`);

    toursGrid.innerHTML = '';

    tours.forEach(tour => {
      const card = this.createTourCard(tour);
      toursGrid.appendChild(card);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  createTourCard(tour) {
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
                    <div class="flex items-center gap-1">
                        <i data-lucide="clock" class="h-4 w-4"></i> ${tour.duration}
                    </div>
                    <div class="flex items-center gap-1">
                        <i data-lucide="info" class="h-4 w-4"></i> ${tour.difficulty}
                    </div>
                </div>
                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-500">Desde</p>
                        <p class="text-2xl font-bold text-cyan-700">$${tour.price}</p>
                    </div>
                    <button onclick="openModal(${tour.id})" class="bg-gray-900 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors duration-300">
                        Reservar
                    </button>
                </div>
            </div>
        `;

    return card;
  },

  filterByTag(tag) {
    const toursGrid = document.getElementById('tours-grid');
    if (!toursGrid) return;

    toursGrid.innerHTML = '';
    const tours = ToursService.filterToursByTag(tag);

    tours.forEach(tour => {
      const card = this.createTourCard(tour);
      toursGrid.appendChild(card);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }
};

// Hacer disponible globalmente
window.ToursUI = ToursUI;
window.renderTours = () => ToursUI.renderTours();

console.log('✅ tours.ui.js cargado');