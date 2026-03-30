// js/config/supabase.js
// El frontend ya NO llama a Supabase directamente.
// Todos los datos pasan por /api/* que usan la SERVICE_KEY en el servidor.
// Este archivo solo existe como compatibilidad — las funciones de servicio usan fetch('/api/...')

const SupabaseService = {
    isConfigured() { return true; }
};
window.SupabaseService = SupabaseService;
