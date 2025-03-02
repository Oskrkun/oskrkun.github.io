// dashboard.js

import { supabaseClient } from './supabaseConfig.js';

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        console.log('Usuario autenticado:', user);
        verificarSiEsAdmin(user);
    }
}

// Verificar si el usuario es administrador
async function verificarSiEsAdmin(user) {
    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

    if (adminError || !admin) {
        console.error('Usuario no es administrador:', adminError ? adminError.message : 'No es administrador');
        ocultarBotonesAdmin(); // Ocultar botones de administrador
    } else {
        console.log('Usuario es administrador:', admin);
    }
}

// Ocultar botones de administrador si el usuario no es admin
function ocultarBotonesAdmin() {
    document.getElementById('abmButton').style.display = 'none';
    document.getElementById('agendaButton').style.display = 'none';
    document.getElementById('configButton').style.display = 'none';
}

// Cargar contenido dinámico
async function cargarContenido(seccion) {
    const contenidoPrincipal = document.getElementById('contenidoPrincipal');
    contenidoPrincipal.innerHTML = '';