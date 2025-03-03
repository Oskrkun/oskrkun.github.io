// dashboard.js

import { verificarAutenticacion, verificarSiEsAdmin } from './usuarios.js';
import { crearBotones } from './botones.js';
import { cargarContenido } from './cargarContenido.js';

// Función principal para inicializar el dashboard
async function inicializarDashboard() {
    const user = await verificarAutenticacion(); // Verificar autenticación
    if (!user) return; // Si no hay usuario, salir

    const { esAdmin, nick } = await verificarSiEsAdmin(user); // Verificar si es administrador
    const tipoUsuario = esAdmin ? 'admin' : 'usuario'; // Determinar el tipo de usuario

    crearBotones(tipoUsuario, cargarContenido); // Crear botones según el tipo de usuario
    actualizarTextoUsuario(user, nick); // Actualizar la interfaz con el nombre del usuario
}

// Actualizar el texto del usuario en el logo
function actualizarTextoUsuario(user, nick = null) {
    const userIcon = document.getElementById('userIcon');
    const userRole = document.getElementById('userRole');
    const userEmail = document.getElementById('userEmail');

    if (userIcon && userRole && userEmail) {
        userIcon.className = nick ? 'fas fa-user-shield' : 'fas fa-user'; // Ícono para administrador o usuario común
        userRole.textContent = nick ? 'Admin:' : 'Bienvenido:';
        userEmail.textContent = nick || user.email; // Mostrar el nick si es administrador, de lo contrario, el correo
    } else {
        console.error('No se encontraron los elementos del DOM para actualizar el texto del usuario.');
    }
}

// Escuchar clics en los botones del menú
document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard(); // Inicializar el dashboard cuando el DOM esté listo

    // Manejar el botón de hamburguesa
    document.getElementById('menuToggle').addEventListener('click', () => {
        const sidebarMenu = document.querySelector('.sidebar-menu');
        sidebarMenu.classList.toggle('active');
    });

    // Ajustar el menú al redimensionar la pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelector('.sidebar-menu').classList.remove('active');
        }
    });
});