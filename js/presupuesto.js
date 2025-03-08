// presupuesto.js
import { supabaseClient } from './supabaseConfig.js';
import {
    MAX_ADD,
    MAX_ESF,
    MAX_CIL,
    erroresActivos,
    crearAdvertencias,
    actualizarErrores,
    validarInput,
    ajustarValorAPasos,
    onInputFocus,
    onInputBlur,
    revisarErroresYActualizarCerca,
    mostrarAdvertenciaEjeFaltante,
    mostrarAdvertenciaAddDiferente,
    mostrarAdvertenciaMaxEsfCil,
    calcularCerca,
    sincronizarCambios,
    agregarEventosSincronizacion,
    esEsfOCil,
    transponerReceta,
    sincronizarTodo,
    limpiarCerca
} from './controlReceta.js';

import {
    cargarTiposLentes,
    cargarTratamientos,
    cargarProductosFiltrados,
    formatearNumero,
    formatearPrecio,
    agregarEventosFiltrado,
    agregarEventosReceta
} from './controlProductos.js';

import { 
    manejarSeleccionProducto, 
    agregarEventosCalculos, 
    deshabilitarClicEnCeldasDeshabilitadas,
	inicializarProductoSeleccionado
} from './calculosPresupuesto.js';

// Función para manejar la contracción/expansión de las secciones
function toggleSection(event) {
    console.log('Alternando sección...');
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
        console.log('Expandir la sección');
        section.classList.remove('collapsed');
    } else {
        console.log('Contraer la sección');
        section.classList.add('collapsed');
    }
}

// Función para agregar eventos de clic a los títulos de las secciones
function agregarEventosToggleSection() {
    console.log('Agregando eventos de clic a los títulos de las secciones...');
    const headers = document.querySelectorAll('h2');
    headers.forEach(header => {
        if (header.querySelector('.toggle-icon')) {
            header.addEventListener('click', toggleSection);
        }
    });
}

// Función para borrar todos los inputs de "lejos" y "ADD"
function borrarReceta() {
    console.log('Borrando receta...');
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

    console.log('Receta borrada.');

    revisarErroresYActualizarCerca();

    const eventoRecetaBorrada = new CustomEvent('recetaBorrada');
    document.dispatchEvent(eventoRecetaBorrada);
}

// Función para agregar el evento al botón de "refresh-erase"
function agregarEventoBotonBorrar() {
    console.log('Agregando evento al botón de borrar...');
    const botonBorrar = document.querySelector('#refresh-erase button');
    if (botonBorrar) {
        botonBorrar.addEventListener('click', borrarReceta);
    } else {
        console.error('No se encontró el botón de borrar.');
    }
}

// Función para agregar evento al botón de rotación
function agregarEventoBotonRotacion() {
    console.log('Agregando evento al botón de rotación...');
    const botonRotacion = document.querySelector('#arrow-trasp button');
    if (botonRotacion) {
        botonRotacion.addEventListener('click', () => {
            console.log('Botón de transposición presionado');
            transponerReceta();
            sincronizarTodo();

            const eventoTranspuesto = new CustomEvent('recetaTranspuesta');
            document.dispatchEvent(eventoTranspuesto);
        });
    } else {
        console.error('No se encontró el botón de rotación.');
    }
}

// Función para deshabilitar los campos de "cerca"
function deshabilitarCamposCerca() {
    console.log('Deshabilitando campos de "cerca"...');
    const inputsCerca = document.querySelectorAll('.seccion-cerca input');
    inputsCerca.forEach(input => {
        input.disabled = true;
    });
}

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

    crearAdvertencias();
    deshabilitarCamposCerca();

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

    console.log('Eventos agregados a los inputs.');

    agregarEventosSincronizacion();
    mostrarAdvertenciaAddDiferente();
    agregarEventoBotonRotacion();
    agregarEventoBotonBorrar();

    await cargarTiposLentes();
    await cargarTratamientos();
    await cargarProductosFiltrados();

    agregarEventosFiltrado();
    agregarEventosToggleSection();
    agregarEventosReceta();

    manejarSeleccionProducto();
    agregarEventosCalculos();
    deshabilitarClicEnCeldasDeshabilitadas();
	inicializarProductoSeleccionado();
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado, inicializando presupuesto...');
    initPresupuesto();
});