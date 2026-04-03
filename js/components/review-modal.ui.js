// js/components/review-modal.ui.js
// Modal para dejar reseñas — guarda tour_id además del tour_name

const ReviewModal = {

    _tourName: '',
    _tourId: null,   // ← nuevo: guardamos el ID numérico del tour

    _ensureModal() {
        if (document.getElementById('review-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'review-modal';
        modal.className = 'fixed inset-0 z-[400] hidden items-center justify-center bg-black/70 backdrop-blur-sm px-4';
        modal.onclick = (e) => { if (e.target === modal) ReviewModal.close(); };

        modal.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-5 flex justify-between items-center">
                    <div>
                        <h2 class="text-gray-900 text-xl font-bold">Dejar Resena</h2>
                        <p id="review-tour-name" class="text-yellow-900 text-sm mt-0.5 font-medium"></p>
                    </div>
                    <button onclick="ReviewModal.close()" class="text-yellow-900/80 hover:text-yellow-900 text-2xl leading-none">&times;</button>
                </div>

                <div id="review-step-1" class="px-6 py-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tu Nombre *</label>
                        <input type="text" id="review-name" placeholder="¿Cómo te llamas?"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Calificación *</label>
                        <div class="flex gap-2" id="star-selector">
                            ${[1, 2, 3, 4, 5].map(n => `
                                <button type="button" onclick="ReviewModal.setRating(${n})"
                                    data-star="${n}"
                                    class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition">★</button>
                            `).join('')}
                        </div>
                        <input type="hidden" id="review-rating" value="0">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                        <textarea id="review-comment" rows="3" placeholder="Cuéntanos tu experiencia..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none resize-none transition"></textarea>
                    </div>

                    <div id="review-error" class="hidden text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"></div>

                    <div class="flex gap-3 pt-2">
                        <button onclick="ReviewModal.submit()"
                            class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-lg transition text-sm">
                            Enviar Resena
                        </button>
                        <button onclick="ReviewModal.close()"
                            class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition text-sm font-medium">
                            Cancelar
                        </button>
                    </div>
                </div>

                <div id="review-step-2" class="hidden px-6 py-10 text-center">
                    <div class="text-6xl mb-4">🎉</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">¡Gracias por tu reseña!</h3>
                    <p class="text-gray-500 mb-6">Tu opinión nos ayuda a mejorar y a otros viajeros a elegir mejor.</p>
                    <button onclick="ReviewModal.close()"
                        class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-8 py-3 rounded-lg transition">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Ahora acepta tourId como segundo parámetro (opcional para compatibilidad)
    open(tourName, tourId = null) {
        this._ensureModal();
        this._tourName = tourName;
        this._tourId = tourId ? parseInt(tourId) : null;

        document.getElementById('review-name').value = '';
        document.getElementById('review-rating').value = '0';
        document.getElementById('review-comment').value = '';
        document.getElementById('review-error').classList.add('hidden');
        document.getElementById('review-step-1').classList.remove('hidden');
        document.getElementById('review-step-2').classList.add('hidden');
        document.getElementById('review-tour-name').textContent = tourName;
        this.setRating(0);

        const modal = document.getElementById('review-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    close() {
        const modal = document.getElementById('review-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    setRating(value) {
        document.getElementById('review-rating').value = value;
        document.querySelectorAll('.star-btn').forEach(btn => {
            const star = parseInt(btn.dataset.star);
            btn.classList.toggle('text-yellow-400', star <= value);
            btn.classList.toggle('text-gray-300', star > value);
        });
    },

    async submit() {
        const name = document.getElementById('review-name').value.trim();
        const rating = parseInt(document.getElementById('review-rating').value);
        const comment = document.getElementById('review-comment').value.trim();
        const errEl = document.getElementById('review-error');

        errEl.classList.add('hidden');

        if (!name) {
            errEl.textContent = 'Por favor ingresa tu nombre';
            errEl.classList.remove('hidden');
            return;
        }
        if (!rating || rating < 1) {
            errEl.textContent = 'Por favor selecciona una calificación';
            errEl.classList.remove('hidden');
            return;
        }

        try {
            await ReviewsService.create({
                tour_name: this._tourName,
                tour_id: this._tourId,    // ← ahora se envía el ID numérico
                customer_name: name,
                rating,
                comment,
            });

            document.getElementById('review-step-1').classList.add('hidden');
            document.getElementById('review-step-2').classList.remove('hidden');

        } catch (err) {
            errEl.textContent = 'Error: ' + err.message;
            errEl.classList.remove('hidden');
        }
    }
};

window.ReviewModal = ReviewModal;