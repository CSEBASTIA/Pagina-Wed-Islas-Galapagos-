// js/conexion.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// TUS CLAVES REALES
const supabaseUrl = 'https://uthtwemxslpdpcglelvw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aHR3ZW14c2xwZHBjZ2xlbHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTAwMTYsImV4cCI6MjA4MDM4NjAxNn0.9WEZZdm-WcyWGnANV7MPKWlSnwd13zVrzPc9H3uNZA8'

const supabase = createClient(supabaseUrl, supabaseKey)

// Función para guardar una reserva
async function guardarReserva() {
    // 1. Obtener lo que escribió el usuario en el HTML
    const nombre = document.getElementById('inputNombre').value;
    const tour = document.getElementById('inputTour').value;

    console.log("Intentando guardar:", nombre, tour);

    // 2. Enviarlo a Supabase
    const { data, error } = await supabase
        .from('reservas') // El nombre de la tabla que creamos en el Paso 1
        .insert([
            { nombre_cliente: nombre, tour_elegido: tour }
        ])

    // 3. Ver si funcionó
    if (error) {
        alert('Error: ' + error.message)
    } else {
        alert('¡Reserva guardada en Supabase!')
    }
}

// Esto hace que el botón funcione
window.guardarReserva = guardarReserva;