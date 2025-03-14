// presupuesto.js
import { supabaseClient } from './supabaseConfig.js';
import {
    MAX_ADD,
    MAX_ESF,
    MAX_CIL,
    crearAdvertencias,
    validarInput,
    ajustarValorAPasos,
    onInputFocus,
    onInputBlur,
    revisarErroresYActualizarCerca,
    calcularCerca,
    sincronizarCambios,
    agregarEventosSincronizacion,
    esEsfOCil,
    transponerReceta,
    sincronizarTodo,
    limpiarCerca
} from './controlReceta.js';

import { cargarProductosFiltrados } from './filtradoProductos.js';

import {
    cargarTratamientos,
    formatearNumero,
    formatearPrecio,
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
        return;
    }

    const icon = event.currentTarget.querySelector('.toggle-icon');
    if (!icon) {
        return;
    }

    const targetId = icon.getAttribute('data-target');
    if (!targetId) {
        return;
    }

    const sectionContent = document.getElementById(targetId);
    if (!sectionContent) {
        return;
    }

    const section = sectionContent.parentElement;
    if (!section) {
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
    }
}

// Función para agregar evento al botón de rotación
function agregarEventoBotonRotacion() {
    const botonRotacion = document.querySelector('#arrow-trasp button');
    if (botonRotacion) {
        botonRotacion.addEventListener('click', () => {
            transponerReceta();
            sincronizarTodo();

            const eventoTranspuesto = new CustomEvent('recetaTranspuesta');
            document.dispatchEvent(eventoTranspuesto);
        });
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
        }
    }
}

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    // Crear el contenedor de errores
    crearAdvertencias();

    // Deshabilitar los campos de "cerca"
    deshabilitarCamposCerca();

    // Agregar eventos a los inputs
    const inputs = document.querySelectorAll('.vista-previa input:not(.seccion-cerca input)');
    inputs.forEach(input => {
        input.addEventListener('input', validarInput);
        input.addEventListener('focus', onInputFocus);
        input.addEventListener('blur', onInputBlur);

        input.addEventListener('focus', function () {
            if (this.value !== '') {
                this.value = '';
            }
        });
    });

    // Agregar eventos de sincronización
    agregarEventosSincronizacion();

    // Agregar eventos a los botones
    agregarEventoBotonRotacion();
    agregarEventoBotonBorrar();

    // Cargar tratamientos
    await cargarTratamientos();
    await cargarIndicesRefraccion();

    // Cargar laboratorios y tipos de lentes para las listas desplegables
    await cargarLaboratorios();
    await cargarTiposLentesSelect();

    // Agregar evento de cambio a la lista desplegable de tipos de lentes
    const tipoLenteSelect = document.getElementById('tipo-lente-select');
    if (tipoLenteSelect) {
        tipoLenteSelect.addEventListener('change', cargarProductosFiltrados);
    }

    // Agregar evento de cambio a la lista desplegable de laboratorios
    const laboratorioSelect = document.getElementById('laboratorio-select');
    if (laboratorioSelect) {
        laboratorioSelect.addEventListener('change', cargarProductosFiltrados);
    }

    // Cargar productos filtrados después de que las listas estén llenas
    await cargarProductosFiltrados();

    // Agregar eventos de filtrado y receta
    agregarEventosFiltrado();
    agregarEventosToggleSection();
    agregarEventosReceta();

    // Manejar la selección de productos y cálculos
    manejarSeleccionProducto();
    agregarEventosCalculos();
    inicializarProductoSeleccionado();

    // Llenar el campo "Vendedor" con el nick del usuario logueado
    await llenarVendedor();
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});