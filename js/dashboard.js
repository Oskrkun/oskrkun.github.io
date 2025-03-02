import { supabaseClient } from './supabaseConfig.js';

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        console.log('Usuario autenticado:', user);
        document.getElementById('sessionInfo').innerText = `Sesión activa para el usuario: ${user.email}`;
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
        document.getElementById('adminStatus').innerText = 'No tienes permisos de administrador.';
        ocultarBotonesAdmin();
    } else {
        console.log('Usuario es administrador:', admin);
        document.getElementById('adminStatus').innerText = 'Eres un administrador.';
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
            await import('./abm.js');
            contenidoPrincipal.innerHTML = await fetch('abm.html').then(res => res.text());
            break;
        case 'agenda':
            await import('./agenda.js');
            contenidoPrincipal.innerHTML = await fetch('agenda.html').then(res => res.text());
            break;
        case 'presupuesto':
            await import('./presupuesto.js');
            contenidoPrincipal.innerHTML = await fetch('presupuesto.html').then(res => res.text());
            break;
        case 'clientes':
            await import('./clientes.js');
            contenidoPrincipal.innerHTML = await fetch('clientes.html').then(res => res.text());
            break;
        case 'armazones':
            await import('./armazones.js');
            contenidoPrincipal.innerHTML = await fetch('armazones.html').then(res => res.text());
            break;
        case 'config':
            await import('./config.js');
            contenidoPrincipal.innerHTML = await fetch('config.html').then(res => res.text());
            break;
        default:
            contenidoPrincipal.innerHTML = '<p>Selecciona una opción del menú.</p>';
    }
}

// Manejar el menú de hamburguesa
function toggleMenu() {
    const menuLateral = document.getElementById('menuLateral');
    menuLateral.classList.toggle('abierto');
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
    document.getElementById('hamburguesaButton').addEventListener('click', toggleMenu);
});