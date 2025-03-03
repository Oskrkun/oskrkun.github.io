// dashboard.js

import { supabaseClient } from './supabaseConfig.js';
import { initABM } from './abm.js'; // Importar la función de inicialización del ABM

// Variable de estado para controlar si una carga está en progreso
let cargaEnProgreso = false;

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        console.log('Usuario autenticado:', user);
        verificarSiEsAdmin(user);
        actualizarTextoUsuario(user); // Actualizar el texto del usuario en el logo
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

// Actualizar el texto del usuario en el logo
function actualizarTextoUsuario(user) {
    const logoElement = document.querySelector('.logo');
    const userIcon = document.getElementById('userIcon');
    const userRole = document.getElementById('userRole');
    const userEmail = document.getElementById('userEmail');

    if (logoElement && userIcon && userRole && userEmail) {
        // Verificar si el usuario es administrador
        const esAdmin = document.getElementById('abmButton').style.display !== 'none'; // Si el botón ABM está visible, es admin

        if (esAdmin) {
            userIcon.className = 'fas fa-user-shield'; // Ícono para administrador
            userRole.textContent = 'Admin:';
        } else {
            userIcon.className = 'fas fa-user'; // Ícono para usuario común
            userRole.textContent = 'Bienvenido:';
        }

        userEmail.textContent = user.email; // Mostrar el correo del usuario
    }
}

// Cargar contenido dinámico
async function cargarContenido(seccion) {
    // Si ya hay una carga en progreso, ignorar el clic
    if (cargaEnProgreso) {
        console.log('Carga en progreso, ignorando clic adicional.');
        return;
    }

    // Marcar que una carga está en progreso
    cargaEnProgreso = true;

    const contenidoPrincipal = document.getElementById('contenidoPrincipal');
    contenidoPrincipal.innerHTML = ''; // Limpiar contenido anterior antes de cargar uno nuevo

    try {
        // Cargar el contenido correspondiente
        switch (seccion) {
            case 'abm':
                // Cargar el CSS de ABM
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'css/abm.css'; // Ruta corregida para el CSS de ABM
                document.head.appendChild(link);

                // Cargar el HTML de ABM
                contenidoPrincipal.innerHTML = await fetch('./abm.html').then(res => res.text());

                // Esperar a que el DOM se actualice antes de inicializar el ABM
                await new Promise(resolve => setTimeout(resolve, 0)); // Pequeño retraso para asegurar que el DOM se haya actualizado

                // Inicializar el ABM después de cargar el contenido
                await initABM(); // Llamar a la función de inicialización del ABM
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
    } catch (error) {
        console.error('Error cargando contenido:', error);
    } finally {
        // Marcar que la carga ha terminado
        cargaEnProgreso = false;
    }
}

// Manejar el menú de hamburguesa
function toggleMenu() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.classList.toggle('active');
}

// Cerrar el menú de hamburguesa al hacer clic en un enlace
function cerrarMenu() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.classList.remove('active');
}

// Escuchar clics en los botones del menú
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();

    document.getElementById('abmButton').addEventListener('click', () => {
        cargarContenido('abm');
        cerrarMenu(); // Cerrar el menú al hacer clic
    });

    document.getElementById('agendaButton').addEventListener('click', () => {
        cargarContenido('agenda');
        cerrarMenu(); // Cerrar el menú al hacer clic
    });

    document.getElementById('presupuestoButton').addEventListener('click', () => {
        cargarContenido('presupuesto');
        cerrarMenu(); // Cerrar el menú al hacer clic
    });

    document.getElementById('clientesButton').addEventListener('click', () => {
        cargarContenido('clientes');
        cerrarMenu(); // Cerrar el menú al hacer clic
    });

    document.getElementById('armazonesButton').addEventListener('click', () => {
        cargarContenido('armazones');
        cerrarMenu(); // Cerrar el menú al hacer clic
    });

    document.getElementById('configButton').addEventListener('click', () => {
        cargarContenido('config');
        cerrarMenu(); // Cerrar el menú al hacer clic
    });

    // Manejar el botón de hamburguesa
    document.getElementById('menuToggle').addEventListener('click', toggleMenu);

    // Ajustar el menú al redimensionar la pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelector('.sidebar-menu').classList.remove('active');
        }
    });
});