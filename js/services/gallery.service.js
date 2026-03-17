// js/services/gallery.service.js
// Gestión de galerías de fotos por isla — API con el servidor local

const GalleryService = {

    // Islas disponibles
    islands: [
        { id: 'tortuga',    name: 'Isla Tortuga',     icon: '🐢', description: 'Santuario de aves' },
        { id: 'cormorant',  name: 'Punta Cormorant',  icon: '🦩', description: 'Playa y laguna'    },
        { id: 'hermanos',   name: 'Cuatro Hermanos',  icon: '🤿', description: 'Snorkel avanzado'  },
    ],

    // Obtener fotos de una isla desde el servidor
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

    // Subir una foto a una isla
    async uploadPhoto(islandId, file) {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch(`/api/gallery/${islandId}/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al subir la foto');
        }
        return await res.json();
    },

    // Eliminar una foto de una isla
    async deletePhoto(islandId, filename) {
        const res = await fetch(`/api/gallery/${islandId}/${filename}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al eliminar la foto');
        }
        return await res.json();
    },
};

window.GalleryService = GalleryService;
