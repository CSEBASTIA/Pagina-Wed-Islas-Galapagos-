// api/_supabase.js  — cliente Supabase para Vercel Serverless Functions
// Las variables de entorno se configuran en el panel de Vercel (NO en el código)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ2Vjc2Jya3Bma2VpZnNoeG90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc4MTQ1NCwiZXhwIjoyMDg5MzU3NDU0fQ.Q9tY7HqE_AgnzW2j6YlowLDtYJQ7yWGOtooCMLsH2R4 // service_role key (solo en servidor)

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);