// login.js

// Importar el cliente de Supabase desde el archivo de configuración
import { supabaseClient } from './supabaseConfig.js';

// Verifica si Supabase está disponible
if (typeof supabase === 'undefined') {
    console.error('Error: Supabase no está cargado.');
    alert('Error de configuración. Por favor, recarga la página.');
} else {
    // Obtén el formulario de login
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error('Error: No se encontró el formulario de login.');
        alert('Error en la página. Por favor, recarga.');
    } else {
        // Escucha el evento de envío del formulario
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

            // Obtén los valores del formulario
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Intentando iniciar sesión con:', email); // Depuración

            try {
                // Intenta iniciar sesión con Supabase
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error('Error al iniciar sesión:', error.message); // Depuración
                    alert(`Error al iniciar sesión: ${error.message}`);
                } else {
                    console.log('Inicio de sesión exitoso:', data); // Depuración

                    // Guarda el token de sesión en localStorage
                    localStorage.setItem('supabaseAuthToken', data.session.access_token);

                    // Redirige a la página abm.html
                    window.location.href = 'abm.html';
                }
            } catch (err) {
                console.error('Error inesperado:', err); // Depuración
                alert('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
            }
        });
    }
}