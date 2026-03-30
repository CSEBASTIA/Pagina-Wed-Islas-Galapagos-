// js/components/tours.ui.js
// ════════════════════════════════════════════════════════════════════════════
//  PATRÓN DE DISEÑO STRATEGY — Filtrado de Tours
// ════════════════════════════════════════════════════════════════════════════
//
//  Context  : ToursUI  (usa la estrategia activa para filtrar/ordenar)
//  Strategy : FilterStrategy (interfaz)
//  Concrete :
//    · AllToursStrategy       — muestra todos
//    · TagFilterStrategy      — filtra por etiqueta
//    · PriceFilterStrategy    — ordena por precio (menor → mayor)
//    · DifficultyStrategy     — filtra por nivel de dificultad
//
// ════════════════════════════════════════════════════════════════════════════



// ── Estrategias de Filtrado ───────────────────────────────────────────────────

/** Muestra todos los tours sin filtrar */
class AllToursStrategy {
    getName() { return 'Todos'; }
    async apply(tours) { return tours; }
}

/** Filtra por etiqueta/tag específico */
class TagFilterStrategy {
    constructor(tag) { this.tag = tag; }
    getName() { return this.tag; }
    async apply(tours) {
        return tours.filter(t => (t.tags || []).includes(this.tag));
    }
}

/** Ordena de menor a mayor precio */
class PriceFilterStrategy {
    getName() { return 'Menor Precio'; }
    async apply(tours) {
        return [...tours].sort((a, b) => a.price - b.price);
    }
}

/** Filtra solo por nivel de dificultad */
class DifficultyStrategy {
    constructor(level) { this.level = level; }
    getName() { return this.level; }
    async apply(tours) {
        return tours.filter(t => t.difficulty === this.level);
    }
}

// ── Contexto (ToursUI usa la estrategia activa) ───────────────────────────────

const ToursUI = {

    // Estrategia activa (por defecto: mostrar todos)
    _strategy: new AllToursStrategy(),
    _allTours: [],   // caché de todos los tours de la BD

    // ── Cambiar estrategia en tiempo de ejecución ────────────────────────────
    setStrategy(strategy) {
        this._strategy = strategy;

    },

    // ── Cargar tours desde la BD y renderizar ────────────────────────────────
    async renderTours(tours) {
        const grid = document.getElementById('tours-grid');
        if (!grid) return;

        // Spinner
        grid.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-16">
                <div class="flex flex-col items-center gap-3 text-gray-400">
                    <div class="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-sm font-medium">Cargando destinos...</p>
                </div>
            </div>`;

        try {
            // Si no se pasan tours, cargar todos desde la BD y cachear
            if (!tours) {
                this._allTours = await ToursService.getAllTours();
            } else {
                this._allTours = tours;
            }

            // Aplicar la estrategia activa
            const filtered = await this._strategy.apply(this._allTours);


            grid.innerHTML = '';
            if (!filtered.length) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <p class="text-4xl mb-3"></p>
                        <p class="text-white/70 text-lg">No hay tours para este filtro.</p>
                    </div>`;
                return;
            }
            filtered.forEach(tour => grid.appendChild(this.createTourCard(tour)));

        } catch (err) {
            console.error('Error cargando tours:', err);
            grid.innerHTML = `<p class="col-span-full text-center text-red-400 py-12">Error al cargar tours.</p>`;
        }

        if (window.lucide) lucide.createIcons();

        // Generar botones de filtro dinámicamente desde los tags de la BD
        this._renderFilterButtons();
    },

    // ── Ocultar botones de filtro (desactivados) ─────────────────────────────
    _renderFilterButtons() {
        // Los filtros están desactivados — se limpia el contenedor
        const container = document.getElementById('tour-filter-buttons');
        if (container) container.innerHTML = '';
    },

    // ── Aplicar filtro y re-renderizar ────────────────────────────────────────
    async _applyFilter(strategy) {
        this.setStrategy(strategy);
        const filtered = await strategy.apply(this._allTours);
        const grid = document.getElementById('tours-grid');
        if (!grid) return;
        grid.innerHTML = '';
        if (!filtered.length) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <p class="text-4xl mb-3"></p>
                    <p class="text-white/70 text-lg">No hay tours para "${strategy.getName()}".</p>
                </div>`;
        } else {
            filtered.forEach(tour => grid.appendChild(this.createTourCard(tour)));
        }
        if (window.lucide) lucide.createIcons();
        this._renderFilterButtons(); // Actualizar estado activo del botón
    },

    // ── Crear tarjeta de tour ────────────────────────────────────────────────
    createTourCard(tour) {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group flex flex-col h-full border border-gray-100";

        card.innerHTML = `
            <div class="relative h-60 overflow-hidden">
                <img src="${tour.image || ''}" alt="${tour.title}"
                     class="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                     onerror="this.src='https://placehold.co/400x240/e2e8f0/94a3b8?text=Tour'" />
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <i data-lucide="star" class="h-4 w-4 text-yellow-400 fill-current"></i>
                    <span class="text-sm font-bold text-gray-800">${tour.rating}</span>
                    <span class="text-xs text-gray-500">(${tour.reviews})</span>
                </div>
                <div class="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                    ${(tour.tags || []).map(tag =>
            `<span class="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/20">${tag}</span>`
        ).join('')}
                </div>
            </div>
           <div class="p-6 flex-1 flex flex-col">
    <h3 class="text-xl font-bold text-gray-800 leading-tight mb-2">${tour.title}</h3>
    <p class="text-gray-600 text-sm mb-6 line-clamp-2">${tour.description || ''}</p>
    <div class="mt-auto pt-4 border-t border-gray-100">
        <button onclick="ReviewModal.open('${tour.title.replace(/'/g, "\\'")}')"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-bold rounded-lg transition shadow"
        >
            Dejar Resena
        </button>
    </div>
</div>
    `;
        return card;
    },

    // ── Observer: cambios en localStorage (cross-tab sync) ───────────────────
    startObserver() {
        window.addEventListener('storage', async (event) => {
            if (event.key === 'isabela_tours') {

                this._allTours = [];              // limpiar caché
                await this.renderTours();
            }
        });

    },

    // ── Alias legacy ─────────────────────────────────────────────────────────
    async filterByTag(tag) {
        await this._applyFilter(new TagFilterStrategy(tag));
    },
};

// Exponer clases de estrategias globalmente (para usar en onclick HTML)
window.AllToursStrategy = AllToursStrategy;
window.TagFilterStrategy = TagFilterStrategy;
window.PriceFilterStrategy = PriceFilterStrategy;
window.DifficultyStrategy = DifficultyStrategy;

window.ToursUI = ToursUI;
window.renderTours = () => ToursUI.renderTours();

ToursUI.startObserver();
