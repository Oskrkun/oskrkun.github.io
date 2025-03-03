// dashboard.js

import { supabaseClient } from './supabaseConfig.js'; // Importar el cliente de Supabase
import { initABM } from './abm.js'; // Importar la función de inicialización del ABM

// Variable de estado para controlar si una carga está en progreso
let cargaEnProgreso = false;

// Definir los botones disponibles para cada tipo de usuario
const botonesPorTipoUsuario = {
    admin: [
        { id: 'abmButton', icon: 'fas fa-box', text: 'ABM', seccion: 'abm' }, // Botón ABM para administradores
        { id: 'agendaButton', icon: 'fas fa-calendar', text: 'AGENDA', seccion: 'agenda' }, // Botón Agenda para administradores
        { id: 'configButton', icon: 'fas fa-cog', text: 'CONFIG', seccion: 'config' }, // Botón Configuración para administradores
    ],
    usuario: [
        { id: 'presupuestoButton', icon: 'fas fa-dollar-sign', text: 'PRESUPUESTO', seccion: 'presupuesto' }, // Botón Presupuesto para usuarios comunes
        { id: 'clientesButton', icon: 'fas fa-users', text: 'CLIENTES', seccion: 'clientes' }, // Botón Clientes para usuarios comunes
        { id: 'armazonesButton', icon: 'fas fa-glasses', text: 'ARMAZONES', seccion: 'armazones' }, // Botón Armazones para usuarios comunes
    ],
};

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    console.log('Verificando autenticación del usuario...'); // Depuración: Inicio de la verificación

    // Obtener el usuario autenticado desde Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // Si hay un error o no hay usuario, redirigir al login
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario'); // Depuración: Error de autenticación
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        // Si el usuario está autenticado, mostrar información en la consola y verificar si es administrador
        console.log('Usuario autenticado:', user); // Depuración: Usuario autenticado
        await verificarSiEsAdmin(user); // Llamar a verificarSiEsAdmin
    }
}

// Verificar si el usuario es administrador y obtener su nick
async function verificarSiEsAdmin(user) {
    console.log('Verificando si el usuario es administrador...'); // Depuración: Inicio de la verificación de administrador

    // Consultar la tabla 'administradores' para obtener el user_id y el nick del usuario
    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id, nick') // Seleccionar user_id y nick
        .eq('user_id', user.id) // Filtrar por el ID del usuario autenticado
        .single(); // Obtener un solo registro

    if (adminError || !admin) {
        // Si hay un error o el usuario no es administrador, crear botones para usuario común
        console.error('Usuario no es administrador:', adminError ? adminError.message : 'No es administrador'); // Depuración: Usuario no es administrador
        crearBotones('usuario'); // Crear botones para usuario común
    } else {
        // Si el usuario es administrador, crear botones para administrador y actualizar la interfaz con el nick
        console.log('Usuario es administrador:', admin); // Depuración: Usuario es administrador
        crearBotones('admin'); // Crear botones para administrador
        actualizarTextoUsuario(user, admin.nick); // Actualizar el texto del usuario con el nick
    }
}

// Función modular para crear botones dinámicamente
function crearBotones(tipoUsuario) {
    console.log(`Creando botones para el tipo de usuario: ${tipoUsuario}`); // Depuración: Inicio de la creación de botones

    const sidebarMenu = document.getElementById('sidebarMenu');
    sidebarMenu.innerHTML = ''; // Limpiar el menú antes de agregar nuevos botones

    // Obtener los botones correspondientes al tipo de usuario
    const botones = botonesPorTipoUsuario[tipoUsuario];

    if (botones) {
        botones.forEach(boton => {
            const li = document.createElement('li'); // Crear un elemento <li> para el botón
            li.id = boton.id; // Asignar el ID del botón
            li.innerHTML = `<a href="#"><i class="${boton.icon}"></i><span>${boton.text}</span></a>`; // Asignar el ícono y el texto
            li.addEventListener('click', () => {
                cargarContenido(boton.seccion); // Cargar el contenido correspondiente al hacer clic
                cerrarMenu(); // Cerrar el menú de hamburguesa
            });
            sidebarMenu.appendChild(li); // Agregar el botón al menú
        });
    } else {
        console.error('No se encontraron botones para el tipo de usuario:', tipoUsuario); // Depuración: Error si no hay botones
    }
}

// Actualizar el texto del usuario en el logo
function actualizarTextoUsuario(user, nick = null) {
    console.log('Actualizando texto del usuario...'); // Depuración: Inicio de la actualización del texto

    const userIcon = document.getElementById('userIcon'); // Ícono del usuario
    const userRole = document.getElementById('userRole'); // Rol del usuario (Admin o Bienvenido)
    const userEmail = document.getElementById('userEmail'); // Correo electrónico o nick del usuario

    if (userIcon && userRole && userEmail) {
        // Verificar si el usuario es administrador (si hay botones de administrador)
        const esAdmin = botonesPorTipoUsuario.admin.some(boton => document.getElementById(boton.id));

        if (esAdmin) {
            // Si el usuario es administrador, mostrar el ícono de administrador y el nick
            userIcon.className = 'fas fa-user-shield'; // Ícono para administrador
            userRole.textContent = 'Admin:';
            userEmail.textContent = nick || user.email; // Usar el nick si existe, de lo contrario, usar el correo
            console.log('Texto actualizado (Admin):', userEmail.textContent); // Depuración: Texto actualizado
        } else {
            // Si el usuario no es administrador, mostrar el ícono de usuario común y el correo electrónico
            userIcon.className = 'fas fa-user'; // Ícono para usuario común
            userRole.textContent = 'Bienvenido:';
            userEmail.textContent = user.email; // Mostrar el correo del usuario
            console.log('Texto actualizado (Usuario común):', userEmail.textContent); // Depuración: Texto actualizado
        }
    } else {
        // Si no se encontraron los elementos del DOM, mostrar un mensaje de error en la consola
        console.error('No se encontraron los elementos del DOM para actualizar el texto del usuario.'); // Depuración: Error en el DOM
    }
}

// Cargar contenido dinámico
async function cargarContenido(seccion) {
    console.log(`Cargando contenido para la sección: ${seccion}`); // Depuración: Inicio de la carga de contenido

    // Si ya hay una carga en progreso, ignorar el clic
    if (cargaEnProgreso) {
        console.log('Carga en progreso, ignorando clic adicional.'); // Depuración: Carga en progreso
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
        console.error('Error cargando contenido:', error); // Depuración: Error al cargar contenido
    } finally {
        // Marcar que la carga ha terminado
        cargaEnProgreso = false;
        console.log('Carga finalizada.'); // Depuración: Carga finalizada
    }
}

// Manejar el menú de hamburguesa
function toggleMenu() {
    console.log('Alternando menú de hamburguesa...'); // Depuración: Alternar menú
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.classList.toggle('active');
}

// Cerrar el menú de hamburguesa al hacer clic en un enlace
function cerrarMenu() {
    console.log('Cerrando menú de hamburguesa...'); // Depuración: Cerrar menú
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.classList.remove('active');
}

// Escuchar clics en los botones del menú
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando dashboard...'); // Depuración: DOM cargado
    verificarAutenticacion(); // Verificar la autenticación del usuario

    // Manejar el botón de hamburguesa
    document.getElementById('menuToggle').addEventListener('click', toggleMenu);

    // Ajustar el menú al redimensionar la pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelector('.sidebar-menu').classList.remove('active');
        }
    });
});