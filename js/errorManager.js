// errorManager.js

import { 
    obtenerElementos, 
    crearAdvertencias, 
    limpiarCerca, 
    sincronizarCambios, 
    erroresActivos 
} from './controlReceta.js';

// Función para mostrar u ocultar el contenedor de errores
function actualizarVisibilidadErrores() {
    const contenedorErrores = document.getElementById('contenedor-errores');
    if (contenedorErrores) {
        if (erroresActivos.length > 0) {
            contenedorErrores.style.display = 'block';
        } else {
            contenedorErrores.style.display = 'none';
        }
    }
}

// Función para agregar un error a la lista de errores activos
export function agregarError(mensaje) {
    if (!erroresActivos.includes(mensaje)) {
        erroresActivos.push(mensaje);
        actualizarErrores();
    }
}

// Función para eliminar un error de la lista de errores activos
export function eliminarError(mensaje) {
    erroresActivos = erroresActivos.filter(error => error !== mensaje);
    actualizarErrores();
}

// Función para actualizar el contenido del contenedor de errores
function actualizarErrores() {
    const contenedorErrores = document.getElementById('contenedor-errores');
    if (contenedorErrores) {
        contenedorErrores.innerHTML = ''; // Limpiar el contenido anterior

        erroresActivos.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.textContent = error;
            errorElement.style.color = 'red';
            errorElement.style.marginBottom = '5px';
            contenedorErrores.appendChild(errorElement);
        });

        actualizarVisibilidadErrores();
    }
}

// Función para limpiar los errores de un input específico
function limpiarErroresInput(inputId) {
    erroresActivos = erroresActivos.filter(error => !error.startsWith(`*${inputId}`));
    actualizarErrores();
}

// Función para manejar el evento de entrada en un input
function manejarEntradaInput(event) {
    const input = event.target;
    const inputId = input.id;

    // Limpiar el contenido del input al entrar
    input.value = '';

    // Limpiar los errores asociados a este input
    limpiarErroresInput(inputId);
}

// Función para manejar el evento de salida de un input
function manejarSalidaInput(event) {
    const input = event.target;
    const inputId = input.id;

    // Verificar si hay errores en el input después de salir
    // Aquí puedes agregar la lógica de validación específica para cada input
    // Por ejemplo, si el input es de tipo ESF, CIL, EJE, etc.
    // Si hay un error, agregarlo a la lista de errores activos
    // Ejemplo:
    if (inputId.includes('esf') && !validarEsf(input.value)) {
        agregarError(`*${inputId}: Valor de ESF no válido.`);
    }

    // Sincronizar los cambios en la receta
    sincronizarCambios(event);
}

// Función para agregar eventos a los inputs de la receta
export function agregarEventosInputs() {
    const elementos = obtenerElementos();

    // Obtener todos los inputs de la receta (lejos y cerca)
    const inputsReceta = [
        elementos.odLejosEsf, elementos.odLejosCil, elementos.odLejosEje,
        elementos.oiLejosEsf, elementos.oiLejosCil, elementos.oiLejosEje,
        elementos.odCercaEsf, elementos.odCercaCil, elementos.odCercaEje,
        elementos.oiCercaEsf, elementos.oiCercaCil, elementos.oiCercaEje,
        elementos.addOD, elementos.addOI
    ];

    inputsReceta.forEach(input => {
        if (input) {
            input.addEventListener('focus', manejarEntradaInput);
            input.addEventListener('blur', manejarSalidaInput);
        }
    });
}

// Función para inicializar el manager de errores
export function initErrorManager() {
    // Crear el contenedor de errores si no existe
    crearAdvertencias();

    // Agregar eventos a los inputs de la receta
    agregarEventosInputs();

    // Inicializar la visibilidad del contenedor de errores
    actualizarVisibilidadErrores();
}

// Inicializar el manager de errores cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initErrorManager();
});