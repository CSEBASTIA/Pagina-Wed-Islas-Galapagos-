// 1. OJO: NO debe haber ninguna línea que diga "import..." aquí arriba.
// Usamos la variable global 'supabase' que cargó el script del CDN en el HTML.
const { createClient } = supabase

// 2. TUS CREDENCIALES (Asegúrate que sean las tuyas)
const supabaseUrl = 'https://uthtwemxslpdpcglelvw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aHR3ZW14c2xwZHBjZ2xlbHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTAwMTYsImV4cCI6MjA4MDM4NjAxNn0.9WEZZdm-WcyWGnANV7MPKWlSnwd13zVrzPc9H3uNZA8'

const _supabase = createClient(supabaseUrl, supabaseKey)

// 3. LA FUNCIÓN (Tiene que llamarse igual que en el onclick del HTML)
async function guardarReserva() {
    console.log("Botón presionado, intentando guardar..."); // Mensaje para la consola

    const nombre = document.getElementById('inputNombre').value;
    const tour = document.getElementById('inputTour').value;

    if (!nombre || !tour) {
        alert("Por favor escribe algo en los campos");
        return;
    }

    const { data, error } = await _supabase
        .from('reservas')
        .insert([{ nombre_cliente: nombre, tour_elegido: tour }]);

    if (error) {
        console.error("Error Supabase:", error);
        alert('Error: ' + error.message);
    } else {
        console.log("Éxito:", data);
        alert('¡Guardado en la nube! Revisa tu Supabase.');
    }
}