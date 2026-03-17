// js/components/admin-panel.ui.js
// Panel de administración de tours — async (Supabase + localStorage)

console.log('📦 Cargando admin-panel.ui.js...');

const AdminPanel = {

    // ══════════════════════════════════════════════════════════════════════════
    // ESTADÍSTICAS
    // ══════════════════════════════════════════════════════════════════════════
    async updateStats() {
        const el = document.getElementById('admin-stats');
        if (!el) return;

        const tours = await ToursService.getAllTours();
        const avg = (field) => tours.length
            ? Math.round(tours.reduce((a, t) => a + (Number(t[field]) || 0), 0) / tours.length)
            : 0;
        const avgF = (field) => tours.length
            ? (tours.reduce((a, t) => a + (Number(t[field]) || 0), 0) / tours.length).toFixed(1)
            : '—';

        el.innerHTML = [
            { label: 'Tours Activos', value: tours.length, icon: '🗺️' },
            { label: 'Rating Promedio', value: `${avgF('rating')} ⭐`, icon: '⭐' },
            { label: 'Total Reviews', value: tours.reduce((a, t) => a + (t.reviews || 0), 0), icon: '📝' },
        ].map(s => `
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-5 flex items-center gap-4">
                <span class="text-3xl">${s.icon}</span>
                <div>
                    <p class="text-gray-400 text-xs">${s.label}</p>
                    <p class="text-2xl font-bold text-white">${s.value}</p>
                </div>
            </div>`).join('');
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LISTA DE TOURS
    // ══════════════════════════════════════════════════════════════════════════
    async renderTours() {
        const container = document.getElementById('admin-tours-list');
        if (!container) return;

        // Spinner
        container.innerHTML = `
            <div class="flex justify-center items-center py-12">
                <div class="flex flex-col items-center gap-3 text-gray-400">
                    <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-sm">Cargando tours...</p>
                </div>
            </div>`;

        const tours = await ToursService.getAllTours();
        console.log(`🗺️ Admin renderTours: ${tours.length} tours`);

        if (!tours.length) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <p class="text-4xl mb-3">🗺️</p>
                    <p>No hay tours. Usa <b>Restaurar Tours Originales</b> o crea uno nuevo.</p>
                </div>`;
            return;
        }

        container.innerHTML = tours.map(tour => `
            <div id="tour-row-${tour.id}"
                 class="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-cyan-500/40 transition">

                <img src="${tour.image || ''}" alt="${tour.title}"
                     class="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                     onerror="this.src='https://placehold.co/96x80/1f2937/6b7280?text=Tour'">

                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-bold text-lg truncate">${tour.title}</h4>
                    <p class="text-gray-400 text-sm truncate mt-0.5">${tour.description || ''}</p>
                    <div class="flex flex-wrap gap-4 mt-2 text-sm">
                        <span class="text-gray-400">⏱ ${tour.duration || '—'}</span>
                        <span class="text-gray-400">🛫 ${tour.departure || '—'}</span>
                        <span class="text-gray-400">🛬 ${tour.arrival || '—'}</span>
                        <span class="text-gray-500">⭐ ${tour.rating} (${tour.reviews})</span>
                    </div>
                    <div class="flex gap-1 mt-2 flex-wrap">
                        ${(tour.tags || []).map(t =>
            `<span class="bg-cyan-900/40 text-cyan-300 text-xs px-2 py-0.5 rounded">${t}</span>`
        ).join('')}
                    </div>
                </div>

                <div class="flex gap-2 flex-shrink-0">
                    <button onclick="AdminPanel.openEditModal(${tour.id})"
                        class="bg-cyan-600/20 hover:bg-cyan-600/50 text-cyan-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        ✏️ Editar
                    </button>
                    <button onclick="AdminPanel.confirmDelete(${tour.id}, '${(tour.title || '').replace(/'/g, "\\'")}')"
                        class="bg-red-600/20 hover:bg-red-600/50 text-red-300 hover:text-red-100 px-4 py-2 rounded-lg text-sm font-medium transition">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ══════════════════════════════════════════════════════════════════════════
    // ELIMINAR
    // ══════════════════════════════════════════════════════════════════════════
    async confirmDelete(id, title) {
        if (!confirm(`¿Eliminar el tour "${title}"?\n\nSe eliminará de la base de datos y la página principal.`)) return;
        this._setLoading(id, true);
        await ToursService.deleteTour(id);

        // ── Re-renderizar admin ──
        await this.updateStats();
        await this.renderTours();

        // ── Re-renderizar página principal si está cargada ──
        if (typeof ToursUI !== 'undefined') {
            ToursUI._allTours = []; // limpiar caché
            await ToursUI.renderTours();
        }

        this._toast(`🗑️ Tour "${title}" eliminado`);
    },

    _setLoading(id, on) {
        const row = document.getElementById(`tour-row-${id}`);
        if (row) row.style.opacity = on ? '0.5' : '1';
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MODAL DE EDICIÓN
    // ══════════════════════════════════════════════════════════════════════════
    async openEditModal(id) {
        const tour = await ToursService.getTourById(id);
        if (!tour) return;

        let modal = document.getElementById('edit-tour-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'edit-tour-modal';
            modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4';
            document.body.appendChild(modal);
        }

        const esc = (v) => (v || '').toString().replace(/"/g, '&quot;');

        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="AdminPanel.closeEditModal()"></div>
            <div class="relative bg-gray-800 rounded-2xl border border-gray-600 shadow-2xl w-full max-w-lg z-10 overflow-hidden">
                <div class="border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold text-white">✏️ Editar Tour</h3>
                        <p class="text-sm text-gray-400 truncate max-w-xs">${tour.title}</p>
                    </div>
                    <button onclick="AdminPanel.closeEditModal()" class="text-gray-400 hover:text-white transition p-1">✕</button>
                </div>
                <form onsubmit="AdminPanel.saveEdit(event, ${id})" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Título</label>
                        <input id="edit-title" type="text" value="${esc(tour.title)}"
                            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">⏱ Duración</label>
                            <input id="edit-duration" type="text" value="${esc(tour.duration)}"
                                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">🛫 Hora de Salida</label>
                            <input id="edit-departure" type="text" value="${esc(tour.departure)}" placeholder="07:30 AM"
                                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">🛬 Hora de Llegada</label>
                            <input id="edit-arrival" type="text" value="${esc(tour.arrival)}" placeholder="12:30 PM"
                                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">📝 Descripción</label>
                        <textarea id="edit-description" rows="2"
                            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 outline-none resize-none">${esc(tour.description)}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">🖼 URL de Imagen</label>
                        <input id="edit-image" type="text" value="${esc(tour.image)}"
                            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 outline-none">
                    </div>
                    <div class="flex gap-3 pt-2">
                        <button type="submit"
                            class="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-lg transition">
                            💾 Guardar Cambios
                        </button>
                        <button type="button" onclick="AdminPanel.closeEditModal()"
                            class="px-5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2.5 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    closeEditModal() {
        const modal = document.getElementById('edit-tour-modal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
    },

    async saveEdit(e, id) {
        e.preventDefault();
        const get = (elId) => document.getElementById(elId)?.value?.trim();
        const changes = {};
        const title = get('edit-title'); if (title) changes.title = title;
        const dur = get('edit-duration'); if (dur) changes.duration = dur;
        const dep = get('edit-departure'); if (dep) changes.departure = dep;
        const arr = get('edit-arrival'); if (arr) changes.arrival = arr;
        const desc = get('edit-description'); if (desc !== undefined) changes.description = desc;
        const img = get('edit-image'); if (img) changes.image = img;

        // Deshabilitar botón mientras guarda
        const btn = e.target.querySelector('[type=submit]');
        if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

        const updated = await ToursService.updateTour(id, changes);
        this.closeEditModal();

        if (updated) {
            await this.updateStats();
            await this.renderTours();
            // Re-renderizar página principal   
            if (typeof ToursUI !== 'undefined') {
                ToursUI._allTours = [];
                await ToursUI.renderTours();
            }
            this._toast(`✅ Tour actualizado: "${updated.title}"`);
        } else {
            this._toast('❌ Error al actualizar el tour');
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // CREAR NUEVO TOUR
    // ══════════════════════════════════════════════════════════════════════════
    async submitTourForm(e) {
        e.preventDefault();
        e.stopPropagation();

        const get = (id) => (document.getElementById(id)?.value || '').trim();

        const title = get('tour-title');
        const duration = get('tour-duration');
        const desc = get('tour-description');
        const image = get('tour-image');
        const departure = get('tour-departure');
        const arrival = get('tour-arrival');
        const tagsRaw = get('tour-tags');
        const diff = get('tour-difficulty') || 'Moderado';
        const rating = parseFloat(get('tour-rating')) || 5.0;

        if (!title) {
            alert('⚠️ El título es obligatorio.');
            return false;
        }

        // Deshabilitar botón mientras guarda
        const btn = e.target.querySelector('[type=submit]');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando...'; }

        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : ['Tour'];

        try {
            const newTour = await ToursService.addTour({
                title, duration, description: desc,
                image, tags, difficulty: diff, rating, departure, arrival
            });

            console.log('✅ Tour creado:', newTour);

            // Ocultar formulario y limpiar
            document.getElementById('admin-tour-form')?.classList.add('hidden');
            e.target.reset();

            await this.updateStats();
            await this.renderTours();
            // Re-renderizar página principal
            if (typeof ToursUI !== 'undefined') {
                ToursUI._allTours = [];
                await ToursUI.renderTours();
            }
            this._toast(`✅ Tour "${newTour.title}" guardado en la base de datos`);
        } catch (err) {
            console.error('❌ Error al crear tour:', err);
            this._toast('❌ Error al guardar el tour');
        }

        if (btn) { btn.disabled = false; btn.textContent = '💾 Guardar Tour'; }
        return false;
    },

    // ══════════════════════════════════════════════════════════════════════════
    // TOAST
    // ══════════════════════════════════════════════════════════════════════════
    _toast(msg) {
        let t = document.getElementById('admin-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'admin-toast';
            t.className = 'fixed bottom-6 right-6 bg-gray-900 border border-gray-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[300] transition-all duration-300';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
        clearTimeout(t._timer);
        t._timer = setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateY(8px)';
        }, 3500);
    }
};

window.AdminPanel = AdminPanel;
console.log('✅ admin-panel.ui.js cargado (async)');
