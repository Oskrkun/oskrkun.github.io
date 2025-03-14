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
    mostrarAdvertenciaEjeFaltante,
    mostrarAdvertenciaMaxEsfCil,
    calcularCerca,
    sincronizarCambios,
    agregarEventosSincronizacion,
    esEsfOCil,
    transponerReceta,
    sincronizarTodo,
    limpiarCerca,
    elementos
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

    // Limpiar campos de "cerca" manualmente
    elementos.odCercaEsf.value = '';
    elementos.odCercaCil.value = '';
    elementos.odCercaEje.value = '';
    elementos.oiCercaEsf.value = '';
    elementos.oiCercaCil.value = '';
    elementos.oiCercaEje.value = '';

    // Mostrar advertencias necesarias
    mostrarAdvertenciaEjeFaltante();

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

// Función para actualizar errores y mostrar/ocultar el contenedor
function actualizarErroresYContenedor() {
    const contenedorErrores = document.getElementById('contenedor-errores');
    if (erroresActivos.length === 0) {
        contenedorErrores.style.display = 'none'; // Ocultar el contenedor
    } else {
        contenedorErrores.style.display = 'block'; // Mostrar el contenedor
    }
}

// Función para mostrar errores en el contenedor
function mostrarErrores() {
    const contenedorErrores = document.getElementById('contenedor-errores');
    contenedorErrores.innerHTML = ''; // Limpiar el contenido anterior

    if (erroresActivos.length > 0) {
        erroresActivos.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.textContent = error.message;
            contenedorErrores.appendChild(errorElement);
        });
        contenedorErrores.style.display = 'block'; // Mostrar el contenedor
    } else {
        contenedorErrores.style.display = 'none'; // Ocultar el contenedor
    }
}

// Evento de clic para limpiar errores
function agregarEventoLimpiarErrores() {
    const contenedorErrores = document.getElementById('contenedor-errores');
    if (contenedorErrores) {
        contenedorErrores.addEventListener('click', () => {
            // Limpiar el array de errores
            erroresActivos.length = 0;

            // Limpiar el contenido del contenedor de errores en el DOM
            contenedorErrores.innerHTML = '';

            // Ocultar el contenedor de errores
            contenedorErrores.style.display = 'none';

            // Borrar la receta (igual que el botón de "refresh-erase")
            borrarReceta();

            console.log('Errores limpiados del array y del DOM, y receta borrada.');
        });
    }
}

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    // Crear el contenedor de errores
    crearAdvertencias();

    // Verificar que el contenedor de errores esté presente
    const contenedorErrores = document.getElementById('contenedor-errores');
    if (!contenedorErrores) {
        console.error('El contenedor de errores no se creó correctamente.');
        return;
    }

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

    // Agregar evento para limpiar errores al hacer clic en el contenedor
    agregarEventoLimpiarErrores();
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});