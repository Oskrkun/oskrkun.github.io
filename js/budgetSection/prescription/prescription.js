// prescription.js
import { estadoGlobal } from '../estadoGlobal.js';
import { cargarProductosFiltrados } from '../productos/filtradoProductos.js';
import { validarInput } from './errorAux.js';
import { 
    actualizarCercaDesdeLejosOADD, 
    borrarReceta, 
    copiarADD,
    actualizarEstadoGlobal,
    trasponerReceta // Importar la función de trasposición
} from './recetaUtils.js';

const elementos = {
    addOD: document.getElementById('add-od'),
    addOI: document.getElementById('add-oi'),
    odLejosEsf: document.getElementById('od-lejos-esf'),
    odLejosCil: document.getElementById('od-lejos-cil'),
    odLejosEje: document.getElementById('od-lejos-eje'),
    oiLejosEsf: document.getElementById('oi-lejos-esf'),
    oiLejosCil: document.getElementById('oi-lejos-cil'),
    oiLejosEje: document.getElementById('oi-lejos-eje'),
    odCercaEsf: document.getElementById('od-cerca-esf'),
    odCercaCil: document.getElementById('od-cerca-cil'),
    odCercaEje: document.getElementById('od-cerca-eje'),
    oiCercaEsf: document.getElementById('oi-cerca-esf'),
    oiCercaCil: document.getElementById('oi-cerca-cil'),
    oiCercaEje: document.getElementById('oi-cerca-eje'),
    seccionCerca: document.getElementById('seccion-cerca'),
    contenedorErrores: document.getElementById('contenedor-errores'),
    tratamientosContainer: document.getElementById('tratamientos'),
    laboratorioSelect: document.getElementById('laboratorio-select'),
    tipoLenteSelect: document.getElementById('tipo-lente-select'),
    indiceRefraccionSelect: document.getElementById('indice-refraccion-select')
};

// Función para manejar el autocompletado dinámico (solo para ESF, CIL y ADD)
function manejarAutocompletado(event) {
    const input = event.target;
    let value = input.value;

    // Verificar si el valor es un número válido
    if (/^[+-]?\d*\.?\d*$/.test(value)) {
        // Separar la parte entera y decimal
        let [entera, decimal = ''] = value.split('.');

        // Si el campo es ADD, completar automáticamente con .00 después del primer dígito
        if (input.id.includes('add')) {
            // Si el usuario ingresa un dígito y no hay decimales, completar con .00
            if (entera.length === 1 && decimal === '') {
                value = `${entera}.00`;
                input.value = value;
                input.setSelectionRange(value.indexOf('.') + 1, value.length);
                return;
            }
        } else {
            // Comportamiento para ESF y CIL
            // Si el usuario está ingresando un número de una o dos cifras
            if (decimal === '' && entera.length > 0) {
                // Si el usuario ingresa un punto, completar con .00 y seleccionar los decimales
                if (event.data === '.') {
                    value = `${entera}.00`;
                    input.value = value;
                    input.setSelectionRange(value.indexOf('.') + 1, value.length);
                    return;
                }

                // Si el usuario ingresa un segundo número, completar con .00 y seleccionar los decimales
                if (entera.replace('-', '').length === 2 && /[0-9]/.test(event.data)) {
                    value = `${entera}.00`;
                    input.value = value;
                    input.setSelectionRange(value.indexOf('.') + 1, value.length);
                    return;
                }
            }
        }

        // Si el usuario está ingresando decimales, sugerir valores de 0.25 en 0.25
        if (decimal.length > 0) {
            const decimalNumber = parseFloat(`0.${decimal}`);
            const steps = [0.00, 0.25, 0.50, 0.75];
            let closestStep = steps.reduce((prev, curr) => {
                return (Math.abs(curr - decimalNumber) < Math.abs(prev - decimalNumber) ? curr : prev);
            });

            value = `${entera}.${String(closestStep * 100).padStart(2, '0')}`;
            input.value = value;
            input.setSelectionRange(value.indexOf('.') + 1, value.length);
        }
    }
}

// Función para inicializar los eventos de la receta
export function initPrescription() {
    // Deshabilitar los inputs de cerca
    elementos.odCercaEsf.disabled = true;
    elementos.odCercaCil.disabled = true;
    elementos.odCercaEje.disabled = true;
    elementos.oiCercaEsf.disabled = true;
    elementos.oiCercaCil.disabled = true;
    elementos.oiCercaEje.disabled = true;

    // Agregar eventos a los inputs de la receta (solo inputs de texto)
    const inputsTexto = ['od-lejos-esf', 'od-lejos-cil', 'od-lejos-eje', 'oi-lejos-esf', 'oi-lejos-cil', 'oi-lejos-eje', 'add-od', 'add-oi'];
    inputsTexto.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Limpiar el input al ingresar (evento focus)
            input.addEventListener('focus', (event) => {
                event.target.value = ''; // Limpiar el input al ingresar
            });

            // Validación en tiempo real (evento input)
            input.addEventListener('input', (event) => {
                // Solo aplicar autocompletado si no es un campo de 'eje'
                if (!event.target.id.includes('eje') && /[0-9+-.]/.test(event.data)) {
                    manejarAutocompletado(event);
                }
            });

            // Validación y ajuste al salir del input (evento blur)
            input.addEventListener('blur', (event) => {
                const esValido = validarInput(event);
                if (esValido) {
                    // Actualizar el estado global
                    actualizarEstadoGlobal(event.target.id, event.target.value);

                    // Copiar el valor de ADD de un ojo al otro
                    copiarADD(event);

                    // Sincronizar la parte de cerca si hay ADD
                    actualizarCercaDesdeLejosOADD();

                    cargarProductosFiltrados(); // Llamar a la función para actualizar la lista de productos
                }
            });
        }
    });

    // Agregar eventos para los filtros (laboratorio, tipo de lente, etc.)
    elementos.laboratorioSelect.addEventListener('change', (event) => {
        estadoGlobal.filtros.laboratorio = event.target.value || null; // Si es "Todos", se asigna null
        cargarProductosFiltrados(); // Actualizar la lista de productos
    });

    elementos.tipoLenteSelect.addEventListener('change', (event) => {
        estadoGlobal.filtros.tipoLente = event.target.value || null; // Si es "Todos", se asigna null
        cargarProductosFiltrados(); // Actualizar la lista de productos
    });

    elementos.indiceRefraccionSelect.addEventListener('change', (event) => {
        const valorSeleccionado = event.target.value;

        if (valorSeleccionado === '') {
            estadoGlobal.filtros.indiceRefraccion = null;
        } else {
            estadoGlobal.filtros.indiceRefraccion = valorSeleccionado;
        }

        cargarProductosFiltrados(); // Actualizar la lista de productos
    });

    // Agregar eventos para los checkbox de tratamientos
    const tratamientosCheckboxes = document.querySelectorAll('#tratamientos input[type="checkbox"]');
    if (tratamientosCheckboxes.length > 0) {
        tratamientosCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const tratamiento = parseInt(event.target.value); // Asegurar que el valor sea un número

                if (event.target.checked) {
                    estadoGlobal.filtros.tratamientos.push(tratamiento);
                } else {
                    estadoGlobal.filtros.tratamientos = estadoGlobal.filtros.tratamientos.filter(t => t !== tratamiento);
                }

                cargarProductosFiltrados(); // Actualizar la lista de productos
            });
        });
    } else {
        console.error('No se encontraron checkboxes de tratamientos en el DOM.');
    }

    // Agregar evento al botón de borrar
    document.getElementById('refresh-erase').addEventListener('click', (event) => {
        event.preventDefault(); // Evitar el comportamiento por defecto del botón
        borrarReceta(); // Limpiar la receta
        cargarProductosFiltrados(); // Actualizar la lista de productos
    });

    // Agregar evento al botón de trasposición
    document.getElementById('arrow-trasp').addEventListener('click', (event) => {
        event.preventDefault(); // Evitar el comportamiento por defecto del botón
        trasponerReceta(); // Llamar a la función de trasposición
        cargarProductosFiltrados(); // Actualizar la lista de productos
    });
}