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
            console.error(`Error cargando galería ${islandId}:`, e);
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
                icon: '',
                description: (tour.tags || []).join(' · ') || tour.difficulty || '',
                wa: encodeURIComponent(`Hola, me interesa el ${tour.title}`),
            }));
        } catch (e) {
            console.error('Error cargando tours para galería:', e);
            return [];
        }
    },

    // Helper para comprimir imagen antes de subir para evitar error 413 Payload Too Large en Vercel
    async compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
        if (!file.type.startsWith('image/')) return file; // Only compress images
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Force JPEG for better compression, unless it's a small PNG etc.
                    // But to avoid 413, forcing jpeg is safer
                    canvas.toBlob(blob => {
                        if (blob) {
                            // Cambiar la extensión si es necesario
                            let newName = file.name;
                            if (!newName.toLowerCase().endsWith('.jpeg') && !newName.toLowerCase().endsWith('.jpg')) {
                                newName = newName.replace(/\.[^/.]+$/, "") + ".jpg";
                            }
                            resolve(new File([blob], newName, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        } else {
                            resolve(file); // Fallback
                        }
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => resolve(file); // Si falla, intenta con la original
            };
            reader.onerror = () => resolve(file);
        });
    },

    // Subir una foto a la galería de un tour
    async uploadPhoto(islandId, file) {
        try {
            // Comprimir la imagen antes de subirla
            file = await this.compressImage(file);
        } catch (e) {
            console.warn('Error comprimiendo imagen localmente, se intentará subir la original', e);
        }

        const formData = new FormData();
        formData.append('photo', file);
        // IMPORTANTE: NO incluir Content-Type manualmente con FormData.
        // El browser necesita poner ese header solo, con el boundary correcto.
        // Solo pasamos Authorization para autenticación con el servidor.
        const adminHdrs = typeof window.adminApiHeaders === 'function' ? window.adminApiHeaders() : {};
        const headers = {};
        if (adminHdrs.Authorization) headers.Authorization = adminHdrs.Authorization;
        if (adminHdrs['X-Admin-Secret']) headers['X-Admin-Secret'] = adminHdrs['X-Admin-Secret'];
        const res = await fetch(`/api/gallery/${islandId}/upload`, {
            method: 'POST',
            headers,
            body: formData,
        });
        
        if (!res.ok) {
            const errText = await res.text();
            let errMsg;
            try {
               const errObj = JSON.parse(errText);
               errMsg = errObj.error || 'Error al subir la foto';
            } catch (e) {
               // Si Vercel devuelve HTML "Request Entity Too Large", lo mostramos claro
               if (errText.includes('413') || errText.includes('Too Large')) {
                   errMsg = 'La imagen sigue siendo demasiado pesada para el servidor.';
               } else {
                   errMsg = errText.substring(0, 50) || 'Error al subir la foto';
               }
            }
            throw new Error(errMsg);
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
