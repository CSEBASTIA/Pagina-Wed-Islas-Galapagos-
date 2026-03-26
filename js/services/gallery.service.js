// js/services/gallery.service.js
// Gestión de galerías de fotos por tour — API con el servidor local

const GalleryService = {

    // Obtener fotos de un tour/isla desde el servidor
    // islandId puede ser un ID numérico de tour (ej: 107) o un slug legacy (ej: 'tortuga')
    async getPhotos(islandId) {
        try {
            const res = await fetch(`/api/gallery/${islandId}`);
            const data = await res.json();
            return data.photos || [];
        } catch (e) {
            console.error(`❌ Error cargando galería ${islandId}:`, e);
            return [];
        }
    },

    // Obtener lista dinámica de todos los tours disponibles como galerías
    async getIslandsFromTours() {
        try {
            const res = await fetch('/api/tours');
            const tours = await res.json();
            if (!Array.isArray(tours)) return [];
            return tours.map(tour => ({
                id: tour.id,            // slug numérico para la galería
                name: tour.title,
                icon: '🌊',
                description: (tour.tags || []).join(' · ') || tour.difficulty || '',
                wa: encodeURIComponent(`Hola, me interesa el ${tour.title} 🌊`),
            }));
        } catch (e) {
            console.error('❌ Error cargando tours para galería:', e);
            return [];
        }
    },

    // Subir una foto a la galería de un tour
    async uploadPhoto(islandId, file) {
        const formData = new FormData();
        formData.append('photo', file);
        const headers = {
            ...(typeof window.adminApiHeaders === 'function' ? window.adminApiHeaders() : {}),
        };
        const res = await fetch(`/api/gallery/${islandId}/upload`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al subir la foto');
        }
        return await res.json();
    },

    // Eliminar una foto de la galería de un tour
    async deletePhoto(islandId, filename) {
        const headers = {
            ...(typeof window.adminApiHeaders === 'function' ? window.adminApiHeaders() : {}),
        };
        const res = await fetch(`/api/gallery/${islandId}/${filename}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al eliminar la foto');
        }
        return await res.json();
    },
};

window.GalleryService = GalleryService;
