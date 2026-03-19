// js/config/supabase.js
// NOTA: En el frontend solo se usa la clave ANON (pública).
// La clave SERVICE_ROLE nunca va al frontend — solo en las Vercel Functions (servidor).
//
// Reemplaza los valores de abajo con los de tu proyecto Supabase:
//   Supabase Dashboard → Settings → API → Project URL y anon/public key

console.log('📦 Cargando supabase.js (frontend)...');

// ⚠️  ESTAS SON LAS ÚNICAS CREDENCIALES QUE VAN AL FRONTEND (clave anon, es pública)
const SUPABASE_URL = 'https://lmgecsbrkpfkeifshxot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ2Vjc2Jya3Bma2VpZnNoeG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE0NTQsImV4cCI6MjA4OTM1NzQ1NH0.xcsOXoSmhwloInSoHOWtOLxXqTJsslG8mrYKfSwZdPo';

// El frontend ya NO llama a Supabase directamente.
// Todos los datos pasan por /api/* (Vercel Functions) que usan la SERVICE_KEY en el servidor.
// Este archivo solo existe como compatibilidad — las funciones de servicio usan fetch('/api/...')

const SupabaseService = {
    isConfigured() { return true; }
};
window.SupabaseService = SupabaseService;

console.log('✅ supabase.js cargado (modo API-only, sin llamadas directas al frontend)');
//siempre usar fetch('/api/...') para llamar a supabase
