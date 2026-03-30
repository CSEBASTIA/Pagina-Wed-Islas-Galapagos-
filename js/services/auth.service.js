// js/services/auth.service.js
// Servicio de autenticación



const AUTH_STORAGE_KEY = 'isabela_user';

const AuthService = {
    getCurrentUser() {
        try {
            const user = localStorage.getItem(AUTH_STORAGE_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error leyendo usuario:', error);
            return null;
        }
    },

    login(credentials) {
        const userData = {
            name: credentials.name,
            email: credentials.email,
            loginAt: new Date().toISOString()
        };

        this.saveUser(userData);

        return userData;
    },

    register(userData) {
        const newUser = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            dateOfBirth: userData.dateOfBirth,
            createdAt: new Date().toISOString()
        };

        this.saveUser(newUser);

        return newUser;
    },

    logout() {
        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);

            return true;
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return false;
        }
    },

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    updateUserProfile(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        const updatedUser = {
            ...currentUser,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveUser(updatedUser);
        return updatedUser;
    },

    saveUser(userData) {
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Error guardando usuario:', error);
            return false;
        }
    },

    getUserInitials() {
        const user = this.getCurrentUser();
        if (!user || !user.name) return '?';
        return user.name.charAt(0).toUpperCase();
    },

    getUserFirstName() {
        const user = this.getCurrentUser();
        if (!user || !user.name) return 'Viajero';
        return user.name.split(' ')[0];
    }
};

// Hacer disponible globalmente
window.AuthService = AuthService;

// Para compatibilidad con código antiguo
Object.defineProperty(window, 'currentUser', {
    get() {
        return AuthService.getCurrentUser();
    }
});
