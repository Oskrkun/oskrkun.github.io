// dashboard.js

import { supabaseClient } from './supabaseConfig.js';
import { initABM } from './abm.js'; // Importar la función de inicialización del ABM

// Variable de estado para controlar si una carga está en progreso
let cargaEnProgreso = false;

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    // Obtener el usuario autenticado desde Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // Si hay un error o no hay usuario, redirigir al login
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        // Si el usuario está autenticado, mostrar información en la consola y verificar si es administrador
        console.log('Usuario autenticado:', user);
        await verificarSiEsAdmin(user); // Llamar a verificarSiEsAdmin
    }
}

// Verificar si el usuario es administrador y obtener su nick
async function verificarSiEsAdmin(user) {
    // Consultar la tabla 'administradores' para obtener el user_id y el nick del usuario
    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id, nick') // Seleccionar user_id y nick
        .eq('user_id', user.id) // Filtrar por el ID del usuario autenticado
        .single(); // Obtener un solo registro

    if (adminError || !admin) {
        // Si hay un error o el usuario no es administrador, ocultar los botones de administrador
        console.error('Usuario no es administrador:', adminError ? adminError.message : 'No es administrador');
        ocultarBotonesAdmin(); // Ocultar botones de administrador
    } else {
        // Si el usuario es administrador, mostrar información en la consola y actualizar la interfaz con el nick
        console.log('Usuario es administrador:', admin);
        actualizarTextoUsuario(user, admin.nick); // Pasar el nick a la función actualizarTextoUsuario
    }
}

// Ocultar botones de administrador si el usuario no es admin
function ocultarBotonesAdmin() {
    // Ocultar los botones de ABM, Agenda y Configuración si el usuario no es administrador
    document.getElementById('abmButton').style.display = 'none';
    document.getElementById('agendaButton').style.display = 'none';
    document.getElementById('configButton').style.display = 'none';
}

// Actualizar el texto del usuario en el logo
function actualizarTextoUsuario(user, nick = null) {
    // Obtener los elementos del DOM que se van a actualizar
    const userIcon = document.getElementById('userIcon'); // Ícono del usuario
    const userRole = document.getElementById('userRole'); // Rol del usuario (Admin o Bienvenido)
    const userEmail = document.getElementById('userEmail'); // Correo electrónico o nick del usuario

    // Depuración: Verificar si los elementos del DOM se encontraron correctamente
    console.log('Elemento userIcon:', userIcon);
    console.log('Elemento userRole:', userRole);
    console.log('Elemento userEmail:', userEmail);
    console.log('Nick recibido:', nick); // Verificar si el nick se está pasando correctamente

    if (userIcon && userRole && userEmail) {
        // Verificar si el usuario es administrador (si el botón ABM está visible)
        const esAdmin = document.getElementById('abmButton').style.display !== 'none';

        if (esAdmin) {
            // Si el usuario es administrador, mostrar el ícono de administrador y el nick
            userIcon.className = 'fas fa-user-shield'; // Ícono para administrador
            userRole.textContent = 'Admin:';
            userEmail.textContent = nick || user.email; // Usar el nick si existe, de lo contrario, usar el correo
            console.log('Texto actualizado (Admin):', userEmail.textContent); // Depuración: Verificar el texto actualizado
        } else {
            // Si el usuario no es administrador, mostrar el ícono de usuario común y el correo electrónico
            userIcon.className = 'fas fa-user'; // Ícono para usuario común
            userRole.textContent = 'Bienvenido:';
            userEmail.textContent = user.email; // Mostrar el correo del usuario
            console.log('Texto actualizado (Usuario común):', userEmail.textContent); // Depuración: Verificar el texto actualizado
        }
    } else {
        // Si no se encontraron los elementos del DOM, mostrar un mensaje de error en la consola
        console.error('No se encontraron los elementos del DOM para actualizar el texto del usuario.');
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
        // Cargar el contenido correspondiente según la sección seleccionada
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
    // Verificar la autenticación del usuario cuando el DOM esté listo
    verificarAutenticacion();

    // Asignar eventos a los botones del menú
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