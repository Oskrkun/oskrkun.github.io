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
    contenidoPrincipal.innerHTML = ''; // Limpiar contenido anterior

    // Cargar el contenido correspondiente
    switch (seccion) {
        case 'abm':
            // Cargar el CSS de ABM
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/abm.css';
            document.head.appendChild(link);

            // Cargar el HTML de ABM
            contenidoPrincipal.innerHTML = await fetch('abm.html').then(res => res.text());

            // Cargar el JS de ABM
            await import('./abm.js');
            break;
        case 'agenda':
            contenidoPrincipal.innerHTML = await fetch('agenda.html').then(res => res.text());
            await import('./agenda.js');
            break;
        case 'presupuesto':
            contenidoPrincipal.innerHTML = await fetch('presupuesto.html').then(res => res.text());
            await import('./presupuesto.js');
            break;
        case 'clientes':
            contenidoPrincipal.innerHTML = await fetch('clientes.html').then(res => res.text());
            await import('./clientes.js');
            break;
        case 'armazones':
            contenidoPrincipal.innerHTML = await fetch('armazones.html').then(res => res.text());
            await import('./armazones.js');
            break;
        case 'config':
            contenidoPrincipal.innerHTML = await fetch('config.html').then(res => res.text());
            await import('./config.js');
            break;
        default:
            contenidoPrincipal.innerHTML = '<p>Selecciona una opción del menú.</p>';
    }
}

// Manejar el menú de hamburguesa
function toggleMenu() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.classList.toggle('active');
}

// Escuchar clics en los botones del menú
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();

    document.getElementById('abmButton').addEventListener('click', () => cargarContenido('abm'));
    document.getElementById('agendaButton').addEventListener('click', () => cargarContenido('agenda'));
    document.getElementById('presupuestoButton').addEventListener('click', () => cargarContenido('presupuesto'));
    document.getElementById('clientesButton').addEventListener('click', () => cargarContenido('clientes'));
    document.getElementById('armazonesButton').addEventListener('click', () => cargarContenido('armazones'));
    document.getElementById('configButton').addEventListener('click', () => cargarContenido('config'));

    // Manejar el botón de hamburguesa
    document.getElementById('menuToggle').addEventListener('click', toggleMenu);

    // Ajustar el menú al redimensionar la pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelector('.sidebar-menu').classList.remove('active');
        }
    });
});