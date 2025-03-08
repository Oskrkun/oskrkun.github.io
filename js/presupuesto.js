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
	limpiarCerca,
    revisarErroresYActualizarCerca
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

// Función para agregar eventos de clic a los títulos de las secciones
function agregarEventosToggleSection() {
    // Selecciona todos los h2 que contienen íconos de flecha
    const headers = document.querySelectorAll('h2');
    headers.forEach(header => {
        // Verifica si el h2 contiene un ícono .toggle-icon
        if (header.querySelector('.toggle-icon')) {
            // Agrega el evento de clic al h2
            header.addEventListener('click', toggleSection);
        }
    });
}

// Función para borrar todos los inputs de "lejos" y "ADD"
function borrarReceta() {
    console.log('Borrando receta...');

    // Seleccionar todos los inputs de "lejos" y "ADD"
    const inputsLejos = document.querySelectorAll('.seccion-lejos input');
    const inputsAdd = document.querySelectorAll('.seccion-add input');

    // Borrar los valores de los inputs de "lejos"
    inputsLejos.forEach(input => {
        input.value = ''; // Limpiar el valor del input
    });

    // Borrar los valores de los inputs de "ADD"
    inputsAdd.forEach(input => {
        input.value = ''; // Limpiar el valor del input
    });

    // Limpiar la parte de "cerca" para ambos ojos
    limpiarCerca('od');
    limpiarCerca('oi');

    console.log('Receta borrada.');

    // Revisar errores y actualizar la parte de "cerca"
    revisarErroresYActualizarCerca();

    // Disparar un evento personalizado para notificar que la receta fue borrada
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

    // Agregar evento al botón de borrar
    agregarEventoBotonBorrar();

    // Cargar tipos de lentes desde Supabase
    await cargarTiposLentes();

    // Cargar tratamientos desde Supabase
    await cargarTratamientos();

    // Cargar productos filtrados
    await cargarProductosFiltrados();

    // Agregar eventos para filtrar productos cuando cambian las selecciones
    agregarEventosFiltrado();

    // Agregar eventos de clic a los títulos de las secciones
    agregarEventosToggleSection();

    // Agregar eventos de cambio en los inputs de la receta
    agregarEventosReceta();
}

// Función para agregar evento al botón de rotación
function agregarEventoBotonRotacion() {
    const botonRotacion = document.querySelector('#arrow-trasp button');
    if (botonRotacion) {
        botonRotacion.addEventListener('click', () => {
            console.log('Botón de transposición presionado');
            transponerReceta(); // Realizar la transposición
            sincronizarTodo(); // Sincronizar cambios después de la transposición

            // Disparar un evento personalizado para notificar que la receta fue transpuesta
            const eventoTranspuesto = new CustomEvent('recetaTranspuesta');
            document.dispatchEvent(eventoTranspuesto);
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

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});