// js/config/supabase.js
// NOTA: En el frontend solo se usa la clave ANON (pública).
// La clave SERVICE_ROLE nunca va al frontend — solo en las Vercel Functions (servidor).
//
// Reemplaza los valores de abajo con los de tu proyecto Supabase:
//   Supabase Dashboard → Settings → API → Project URL y anon/public key

console.log('📦 Cargando supabase.js (frontend)...');

// ⚠️  ESTAS SON LAS ÚNICAS CREDENCIALES QUE VAN AL FRONTEND (clave anon, es pública)
const SUPABASE_URL = 'https://uthtwemxslpdpcglelvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aHR3ZW14c2xwZHBjZ2xlbHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTAwMTYsImV4cCI6MjA4MDM4NjAxNn0.9WEZZdm-WcyWGnANV7MPKWlSnwd13zVrzPc9H3uNZA8';

// El frontend ya NO llama a Supabase directamente.
// Todos los datos pasan por /api/* (Vercel Functions) que usan la SERVICE_KEY en el servidor.
// Este archivo solo existe como compatibilidad — las funciones de servicio usan fetch('/api/...')

const SupabaseService = {
    isConfigured() { return true; }
};
window.SupabaseService = SupabaseService;

console.log('✅ supabase.js cargado (modo API-only, sin llamadas directas al frontend)');