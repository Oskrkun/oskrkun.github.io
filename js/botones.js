// botones.js

// Lista de botones disponibles para cada tipo de usuario
export const botonesPorTipoUsuario = {
    admin: [
        { id: 'abmButton', icon: 'fas fa-box', text: 'ABM', seccion: 'abm' },
        { id: 'agendaButton', icon: 'fas fa-calendar', text: 'AGENDA', seccion: 'agenda' },
        { id: 'configButton', icon: 'fas fa-cog', text: 'CONFIG', seccion: 'config' },
        { id: 'presupuestoButton', icon: 'fas fa-dollar-sign', text: 'PRESUPUESTO', seccion: 'presupuesto' },
        { id: 'clientesButton', icon: 'fas fa-users', text: 'CLIENTES', seccion: 'clientes' },
        { id: 'armazonesButton', icon: 'fas fa-glasses', text: 'ARMAZONES', seccion: 'armazones' },
    ],
    usuario: [
        { id: 'presupuestoButton', icon: 'fas fa-dollar-sign', text: 'PRESUPUESTO', seccion: 'presupuesto' },
        { id: 'clientesButton', icon: 'fas fa-users', text: 'CLIENTES', seccion: 'clientes' },
        { id: 'armazonesButton', icon: 'fas fa-glasses', text: 'ARMAZONES', seccion: 'armazones' },
    ],
};

// Función para crear botones dinámicamente
export function crearBotones(tipoUsuario, cargarContenido) {
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

// Función para cerrar el menú de hamburguesa
function cerrarMenu() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    sidebarMenu.classList.remove('active');
}