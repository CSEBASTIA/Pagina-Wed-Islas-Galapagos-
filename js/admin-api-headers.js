(function () {
    window.adminApiHeaders = function adminApiHeaders() {
        try {
            const secret = (sessionStorage.getItem('admin_api_secret') || '').trim();
            return secret ? { Authorization: 'Bearer ' + secret } : {};
        } catch {
            return {};
        }
    };
})();
