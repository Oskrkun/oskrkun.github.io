// presupuesto.js
//Oskrkun 14.16.6.3.25
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
        input.addEventListener('focus', onInputFocus); // Evento al entrar al input
        input.addEventListener('blur', onInputBlur); // Evento al salir del input

        // Agregar evento para borrar el contenido al recibir el foco
        input.addEventListener('focus', function () {
            if (this.value !== '') {
                this.value = ''; // Borrar el contenido si no está vacío
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

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});