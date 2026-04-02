// js/admin-api-headers.js
// Envía el JWT guardado en sessionStorage como Bearer token.
// Reemplaza el antiguo ADMIN_SECRET.

(function () {
    window.adminApiHeaders = function adminApiHeaders() {
        try {
            const token = (sessionStorage.getItem('admin_jwt') || '').trim();
            return token ? { Authorization: 'Bearer ' + token } : {};
        } catch {
            return {};
        }
    };
})();