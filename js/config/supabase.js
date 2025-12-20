// js/config/supabase.config.js
// Configuración de Supabase

console.log('📦 Cargando supabase.config.js...');

// Credenciales de Supabase
const SUPABASE_URL = 'https://uthtwemxslpdpcglelvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aHR3ZW14c2xwZHBjZ2xlbHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTAwMTYsImV4cCI6MjA4MDM4NjAxNn0.9WEZZdm-WcyWGnANV7MPKWlSnwd13zVrzPc9H3uNZA8';

let supabaseClient = null;

// Inicializar Supabase si está disponible
if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado');
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
    }
} else {
    console.log('ℹ️ Supabase no configurado - usando localStorage');
}

// Servicio de Supabase
const SupabaseService = {
    getClient() {
        return supabaseClient;
    },

    isConfigured() {
        return supabaseClient !== null;
    },

    async testConnection() {
        if (!supabaseClient) {
            return false;
        }

        try {
            const { error } = await supabaseClient.from('bookings').select('count');
            if (error && error.code !== 'PGRST116') {
                console.error('Error de conexión:', error);
                return false;
            }
            console.log('✅ Conexión a Supabase exitosa');
            return true;
        } catch (error) {
            console.error('Error al probar conexión:', error);
            return false;
        }
    }
};

// Hacer disponible globalmente
window.SupabaseService = SupabaseService;

console.log('✅ supabase.config.js cargado');