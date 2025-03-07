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
    sincronizarTodo
} from './controlReceta.js';

import {
    cargarTiposLentes,
    cargarTratamientos,
    cargarProductosFiltrados,
    formatearNumero,
    formatearPrecio,
    agregarEventosFiltrado
} from './controlProductos.js';

// Función para manejar la contracción/expansión de las secciones
function toggleSection(event) {
    // Asegúrate de que el evento se haya disparado correctamente
    if (!event || !event.currentTarget) {
        console.error('Evento no válido');
        return;
    }

    // Selecciona el ícono dentro del h2
    const icon = event.currentTarget.querySelector('.toggle-icon');
    if (!icon) {
        console.error('No se encontró el ícono .toggle-icon');
        return;
    }

    // Obtén el atributo data-target
    const targetId = icon.getAttribute('data-target');
    if (!targetId) {
        console.error('No se encontró el atributo data-target en el ícono');
        return;
    }

    // Encuentra el contenido de la sección
    const sectionContent = document.getElementById(targetId);
    if (!sectionContent) {
        console.error('No se encontró el contenido de la sección con el ID:', targetId);
        return;
    }

    // Encuentra la sección padre
    const section = sectionContent.parentElement;
    if (!section) {
        console.error('No se encontró la sección padre');
        return;
    }

    // Alternar la clase 'collapsed'
    if (section.classList.contains('collapsed')) {
        // Expandir la sección
        section.classList.remove('collapsed');
    } else {
        // Contraer la sección
        section.classList.add('collapsed');
    }
}

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

    // Crear los span de advertencia dinámicamente
    crearAdvertencias();

    // Deshabilitar los campos de "cerca"
    deshabilitarCamposCerca();

    // Agregar eventos a los inputs de "lejos" y "ADD"
    const inputs = document.querySelectorAll('.vista-previa input:not(.seccion-cerca input)');
    inputs.forEach(input => {
        input.addEventListener('input', validarInput);
        input.addEventListener('focus', onInputFocus);
        input.addEventListener('blur', onInputBlur);

        // Agregar evento para borrar el contenido al recibir el foco
        input.addEventListener('focus', function () {
            if (this.value !== '') {
                this.value = '';
            }
        });
    });

    console.log('Eventos agregados a los inputs.');

    // Agregar eventos para sincronizar cambios
    agregarEventosSincronizacion();

    // Mostrar advertencia si las ADD son diferentes
    mostrarAdvertenciaAddDiferente();

    // Agregar evento al botón de rotación
    agregarEventoBotonRotacion();

    // Cargar tipos de lentes desde Supabase
    await cargarTiposLentes();

    // Cargar tratamientos desde Supabase
    await cargarTratamientos();

    // Cargar productos filtrados
    await cargarProductosFiltrados();

    // Agregar eventos para filtrar productos cuando cambian las selecciones
    agregarEventosFiltrado();
}

// Función para agregar evento al botón de rotación
function agregarEventoBotonRotacion() {
    const botonRotacion = document.querySelector('#arrow-trasp button');
    if (botonRotacion) {
        botonRotacion.addEventListener('click', () => {
            console.log('Botón de transposición presionado');
            transponerReceta(); // Realizar la transposición
            sincronizarTodo(); // Sincronizar cambios después de la transposición
        });
    }
}

// Función para deshabilitar los campos de "cerca"
function deshabilitarCamposCerca() {
    const inputsCerca = document.querySelectorAll('.seccion-cerca input');
    inputsCerca.forEach(input => {
        input.disabled = true; // Deshabilitar los campos de "cerca"
    });
}

// Agregar eventos a los íconos de flecha
document.querySelectorAll('.toggle-icon').forEach(icon => {
    icon.addEventListener('click', toggleSection);
});

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});