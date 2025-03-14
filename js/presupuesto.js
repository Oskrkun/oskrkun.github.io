// presupuesto.js
import {
    transponerReceta,
    limpiarCerca,
    obtenerElementos,
    revisarErroresYActualizarCerca
} from './controlReceta.js';
import { initErrorManager } from './errorManager.js';
import { cargarProductosFiltrados } from './filtradoProductos.js';

import {
    cargarTratamientos,
    agregarEventosFiltrado,
    agregarEventosReceta,
    cargarLaboratorios,
    cargarTiposLentesSelect,
    cargarIndicesRefraccion
} from './controlProductos.js';

import { 
    manejarSeleccionProducto, 
    agregarEventosCalculos, 
    inicializarProductoSeleccionado
} from './calculosPresupuesto.js';

import { verificarAutenticacion, obtenerRolYNick } from './usuarios.js'; // Importar funciones actualizadas

// Función para manejar la contracción/expansión de las secciones
function toggleSection(event) {
    if (!event || !event.currentTarget) {
        console.error('Evento no válido');
        return;
    }

    const icon = event.currentTarget.querySelector('.toggle-icon');
    if (!icon) {
        console.error('No se encontró el ícono .toggle-icon');
        return;
    }

    const targetId = icon.getAttribute('data-target');
    if (!targetId) {
        console.error('No se encontró el atributo data-target en el ícono');
        return;
    }

    const sectionContent = document.getElementById(targetId);
    if (!sectionContent) {
        console.error('No se encontró el contenido de la sección con el ID:', targetId);
        return;
    }

    const section = sectionContent.parentElement;
    if (!section) {
        console.error('No se encontró la sección padre');
        return;
    }

    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
    } else {
        section.classList.add('collapsed');
    }
}

// Función para agregar eventos de clic a los títulos de las secciones
function agregarEventosToggleSection() {
    const headers = document.querySelectorAll('h2');
    headers.forEach(header => {
        if (header.querySelector('.toggle-icon')) {
            header.addEventListener('click', toggleSection);
        }
    });
}

// Función para borrar todos los inputs de "lejos" y "ADD"
function borrarReceta() {
    const inputsLejos = document.querySelectorAll('.seccion-lejos input');
    const inputsAdd = document.querySelectorAll('.seccion-add input');

    inputsLejos.forEach(input => {
        input.value = '';
    });

    inputsAdd.forEach(input => {
        input.value = '';
    });

    limpiarCerca('od');
    limpiarCerca('oi');

    revisarErroresYActualizarCerca();

    const eventoRecetaBorrada = new CustomEvent('recetaBorrada');
    document.dispatchEvent(eventoRecetaBorrada);
}

// Función para agregar el evento al botón de "refresh-erase"
function agregarEventoBotonBorrar() {
    const botonBorrar = document.querySelector('#refresh-erase button');
    if (botonBorrar) {
        botonBorrar.addEventListener('click', borrarReceta);
    } else {
        console.error('No se encontró el botón de borrar.');
    }
}

// Función para agregar evento al botón de rotación
function agregarEventoBotonRotacion() {
    const botonRotacion = document.querySelector('#arrow-trasp button');
    if (botonRotacion) {
        botonRotacion.addEventListener('click', () => {
            transponerReceta();

            const eventoTranspuesto = new CustomEvent('recetaTranspuesta');
            document.dispatchEvent(eventoTranspuesto);
        });
    } else {
        console.error('No se encontró el botón de rotación.');
    }
}

// Función para deshabilitar los campos de "cerca"
function deshabilitarCamposCerca() {
    const inputsCerca = document.querySelectorAll('.seccion-cerca input');
    inputsCerca.forEach(input => {
        input.disabled = true;
    });
}

// Función para llenar el campo "Vendedor" con el nick del usuario logueado
async function llenarVendedor() {
    const user = await verificarAutenticacion();
    if (user) {
        const { nick } = await obtenerRolYNick(user); // Obtener el nick del usuario
        const vendedorInput = document.getElementById('vendedor');
        if (vendedorInput) {
            vendedorInput.value = nick || user.email; // Usar el nick si existe, de lo contrario, el email
        } else {
            console.error('No se encontró el campo de Vendedor.');
        }
    } else {
        console.error('No se pudo obtener el usuario logueado.');
    }
}

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    // Deshabilitar los campos de "cerca"
    console.log('Deshabilitando campos de "cerca"...');
    deshabilitarCamposCerca();

    // Inicializar el manejador de errores
    initErrorManager();

    // Agregar eventos a los botones
    console.log('Agregando eventos a los botones...');
    agregarEventoBotonRotacion();
    agregarEventoBotonBorrar();

    // Cargar tratamientos
    console.log('Cargando tratamientos...');
    await cargarTratamientos();
    await cargarIndicesRefraccion();

    // Cargar laboratorios y tipos de lentes para las listas desplegables
    console.log('Cargando laboratorios y tipos de lentes...');
    await cargarLaboratorios();
    await cargarTiposLentesSelect();

    // Agregar evento de cambio a la lista desplegable de tipos de lentes
    const tipoLenteSelect = document.getElementById('tipo-lente-select');
    if (tipoLenteSelect) {
        tipoLenteSelect.addEventListener('change', cargarProductosFiltrados);
    } else {
        console.error('No se encontró la lista desplegable de tipos de lentes.');
    }

    // Agregar evento de cambio a la lista desplegable de laboratorios
    const laboratorioSelect = document.getElementById('laboratorio-select');
    if (laboratorioSelect) {
        laboratorioSelect.addEventListener('change', cargarProductosFiltrados);
    } else {
        console.error('No se encontró la lista desplegable de laboratorios.');
    }

    // Cargar productos filtrados después de que las listas estén llenas
    console.log('Cargando productos filtrados...');
    await cargarProductosFiltrados();

    // Agregar eventos de filtrado y receta
    console.log('Agregando eventos de filtrado y receta...');
    agregarEventosFiltrado();
    agregarEventosToggleSection();
    agregarEventosReceta();

    // Manejar la selección de productos y cálculos
    console.log('Manejando selección de productos y cálculos...');
    manejarSeleccionProducto();
    agregarEventosCalculos();
    inicializarProductoSeleccionado();

    // Llenar el campo "Vendedor" con el nick del usuario logueado
    console.log('Llenando campo "Vendedor"...');
    await llenarVendedor();
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});