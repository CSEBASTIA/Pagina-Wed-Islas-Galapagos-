// js/services/gallery.service.js

const GalleryService = {

    async getPhotos(islandId) {
        try {
            const res = await fetch(`/api/gallery/${islandId}`);
            const data = await res.json();
            return data.photos || [];
        } catch (e) {
            console.error(`Error cargando galería ${islandId}:`, e);
            return [];
        }
    },

    async getIslandsFromTours() {
        try {
            const res = await fetch('/api/tours');
            const tours = await res.json();
            if (!Array.isArray(tours)) return [];
            return tours.map(tour => ({
                id: tour.id,
                name: tour.title,
                icon: '',
                description: (tour.tags || []).join(' · ') || tour.difficulty || '',
                wa: encodeURIComponent(`Hola, me interesa el ${tour.title}`),
            }));
        } catch (e) {
            console.error('Error cargando tours para galería:', e);
            return [];
        }
    },

    // Compresión agresiva: máx 1200px, calidad 0.65, con segunda pasada si sigue > 3.5MB
    async compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.65) {
        if (!file.type.startsWith('image/')) return file;

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let { width, height } = img;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                    // Reducir calidad en pasadas hasta quedar bajo 3.5 MB
                    const tryCompress = (q) => {
                        canvas.toBlob(blob => {
                            if (!blob) { resolve(file); return; }
                            if (blob.size > 3.5 * 1024 * 1024 && q > 0.3) {
                                tryCompress(parseFloat((q - 0.15).toFixed(2)));
                                return;
                            }
                            console.log(`Imagen comprimida a ${(blob.size / 1024).toFixed(0)} KB (calidad ${q})`);
                            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }));
                        }, 'image/jpeg', q);
                    };

                    tryCompress(quality);
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    },

    async uploadPhoto(islandId, file) {
        try {
            file = await this.compressImage(file);
        } catch (e) {
            console.warn('Compresión falló, usando original:', e);
        }

        const formData = new FormData();
        formData.append('photo', file);

        // NO poner Content-Type manualmente con FormData —
        // el navegador lo agrega solo con el multipart boundary correcto.
        const headers = {};
        if (typeof window.adminApiHeaders === 'function') {
            const h = window.adminApiHeaders();
            if (h.Authorization) headers.Authorization = h.Authorization;
        }

        const res = await fetch(`/api/gallery/${islandId}/upload`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Error ${res.status} al subir la foto`);
        }
        return await res.json();
    },

    async deletePhoto(islandId, filename) {
        const headers = {};
        if (typeof window.adminApiHeaders === 'function') {
            Object.assign(headers, window.adminApiHeaders());
        }
        const res = await fetch(`/api/gallery/${islandId}/${filename}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Error al eliminar la foto');
        }
        return await res.json();
    },
};

window.GalleryService = GalleryService;