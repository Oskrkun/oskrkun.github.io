// dashboard.js

import { verificarAutenticacion, obtenerRolYNick } from './usuarios.js';
import { crearBotones } from './botones.js';
import { cargarContenido } from './cargarContenido.js';

// Función para obtener el valor de un parámetro de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función principal para inicializar el dashboard
async function inicializarDashboard() {
    // Verificar si el usuario está autenticado
    const user = await verificarAutenticacion();
    if (!user) {
        console.error('Usuario no autenticado. Redirigiendo al login...');
        window.location.href = 'index.html'; // Redirigir al login si no hay usuario autenticado
        return;
    }

    // Obtener el rol y el nick del usuario
    const { rol, nick } = await obtenerRolYNick(user);
    const tipoUsuario = rol === 'admin' ? 'admin' : 'usuario'; // Determinar el tipo de usuario

    // Crear botones según el tipo de usuario
    crearBotones(tipoUsuario, cargarContenido);

    // Actualizar la interfaz con los datos del usuario
    actualizarTextoUsuario(user, nick, rol);

    // Verificar si hay un parámetro en la URL y cargar la sección correspondiente
    const seccion = obtenerParametroURL('seccion');
    if (seccion) {
        cargarContenido(seccion);
    }
}

// Función para actualizar la interfaz con los datos del usuario
function actualizarTextoUsuario(user, nick = null, rol = null) {
    const userIcon = document.getElementById('userIcon');
    const userRole = document.getElementById('userRole');
    const userEmail = document.getElementById('userEmail');

    if (userIcon && userRole && userEmail) {
        // Cambiar el ícono según el rol del usuario
        userIcon.className = rol === 'admin' ? 'fas fa-user-shield' : 'fas fa-user';

        // Mostrar el rol del usuario
        userRole.textContent = rol === 'admin' ? 'Admin:' : 'Bienvenido:';

        // Mostrar el nick si está disponible, de lo contrario, mostrar el correo
        userEmail.textContent = nick || user.email;
    } else {
        console.error('No se encontraron los elementos del DOM para actualizar el texto del usuario.');
    }
}

// Escuchar clics en los botones del menú
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el dashboard cuando el DOM esté listo
    inicializarDashboard();

    const menuToggle = document.getElementById('menuToggle');
    const sidebarMenu = document.querySelector('.sidebar-menu');

    // Manejar el botón de hamburguesa para mostrar/ocultar el menú lateral
    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que el clic se propague al documento
        sidebarMenu.classList.toggle('active');
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        if (!sidebarMenu.contains(event.target)) {
            sidebarMenu.classList.remove('active');
        }
    });

    // Ajustar el menú al redimensionar la pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebarMenu.classList.remove('active');
        }
    });
});