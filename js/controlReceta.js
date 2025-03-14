// controlReceta.js

// Variables para establecer los máximos de ADD, ESF y CIL
export const MAX_ADD = 3.25;
export const MAX_ESF = 25.00; // Máximo valor para ESF
export const MAX_CIL = 8.00; // Máximo valor para CIL

// Lista de errores activos
export let erroresActivos = [];

// Función para obtener los elementos del DOM dinámicamente
export function obtenerElementos() {
    return {
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
        contenedorErrores: document.getElementById('contenedor-errores')
    };
}

// Función para crear los span de advertencia dinámicamente
export function crearAdvertencias() {
    let contenedorErrores = document.getElementById('contenedor-errores');

    if (!contenedorErrores) {
        contenedorErrores = document.createElement('div');
        contenedorErrores.id = 'contenedor-errores';

        // Estilos para el contenedor de errores flotante
        contenedorErrores.style.position = 'fixed';
        contenedorErrores.style.bottom = '20px';
        contenedorErrores.style.right = '20px';
        contenedorErrores.style.backgroundColor = '#ffebee';
        contenedorErrores.style.padding = '10px';
        contenedorErrores.style.borderRadius = '8px';
        contenedorErrores.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        contenedorErrores.style.zIndex = '1000';
        contenedorErrores.style.maxWidth = '300px';
        contenedorErrores.style.overflowY = 'auto';
        contenedorErrores.style.maxHeight = '200px';

        document.body.appendChild(contenedorErrores);
    }
}

// Función para actualizar la lista de errores en la interfaz
export function actualizarErrores() {
    const elementos = obtenerElementos();
    let contenedorErrores = elementos.contenedorErrores;

    if (!contenedorErrores) {
        crearAdvertencias();
        contenedorErrores = elementos.contenedorErrores;
    }

    if (!contenedorErrores) {
        console.error('No se encontró el contenedor de errores.');
        return;
    }

    // Limpiar el contenedor de errores
    contenedorErrores.innerHTML = '';

    // Mostrar cada error en el contenedor
    erroresActivos.forEach(error => {
        const spanError = document.createElement('span');
        spanError.textContent = error;
        spanError.classList.add('advertenciaReceta');
        spanError.style.display = 'block';
        contenedorErrores.appendChild(spanError);
    });

    // Eliminar el contenedor si no hay errores
    if (erroresActivos.length === 0 && contenedorErrores) {
        contenedorErrores.remove();
    }
}

// Función centralizada para validar todos los inputs
export function validarInputCentralizado(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Limpiar el error anterior relacionado con este input
    erroresActivos = erroresActivos.filter(error => !error.startsWith(`*${id}`));

    if (value === '') {
        // Si el input está vacío, no hay error
        return;
    }

    // Validación específica para EJE
    if (id.includes('eje')) {
        validarEje(input, value);
    }
    // Validación específica para ADD
    else if (id.includes('add')) {
        validarADD(input, value);
    }
    // Validación para ESF y CIL
    else {
        validarEsfOCil(input, value, id);
    }

    // Revisar errores y actualizar la parte de "cerca"
    revisarErroresYActualizarCerca();
}

// Función para validar el EJE
function validarEje(input, value) {
    if (!/^\d*$/.test(value)) {
        erroresActivos.push(`*${input.id}: Solo se permiten números.`);
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        erroresActivos.push(`*${input.id}: El valor debe estar entre 0 y 180.`);
        input.value = value.slice(0, -1);
    }
}

// Función para validar ADD
function validarADD(input, value) {
    if (!/^\d*\.?\d*$/.test(value)) {
        erroresActivos.push(`*${input.id}: Solo se permiten números positivos y punto decimal.`);
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseFloat(value);
    if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
        erroresActivos.push(`*${input.id}: El valor debe estar entre 0 y ${MAX_ADD}.`);
        input.value = value.slice(0, -1);
    }
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {
    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        erroresActivos.push(`*${id}: Solo se permiten números, +, - y punto decimal.`);
        input.value = value.slice(0, -1);
        return;
    }

    if (value.length > 5) {
        erroresActivos.push(`*${id}: No puede tener más de 2 cifras enteras.`);
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseFloat(value);
    mostrarAdvertenciaMaxEsfCil(valorNumerico, id);
}

// Función para mostrar advertencia si el valor de ESF o CIL supera MAX_ESF o MAX_CIL
export function mostrarAdvertenciaMaxEsfCil(valorNumerico, id) {
    const esfOCil = id.includes('esf') ? 'ESF' : 'CIL';
    const maxValor = id.includes('esf') ? MAX_ESF : MAX_CIL;
    const ojo = id.includes('od') ? 'OD' : 'OI';
    const mensajeError = `*${esfOCil} demasiado alto en ${ojo}. Consultar con el laboratorio.`;

    if (valorNumerico > maxValor || valorNumerico < -maxValor) {
        if (!erroresActivos.includes(mensajeError)) {
            erroresActivos.push(mensajeError);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeError);
    }

    actualizarErrores();
}

// Función para revisar errores y actualizar la parte de "cerca"
export function revisarErroresYActualizarCerca() {
    const elementos = obtenerElementos();

    mostrarAdvertenciaEjeFaltante();

    const addOD = parseFloat(elementos.addOD.value) || 0;
    const addOI = parseFloat(elementos.addOI.value) || 0;

    if (addOD !== 0) {
        calcularCerca('od');
    } else {
        limpiarCerca('od');
    }

    if (addOI !== 0) {
        calcularCerca('oi');
    } else {
        limpiarCerca('oi');
    }

    actualizarVisibilidadCerca();
    actualizarErrores();
}

// Función para limpiar la parte de "cerca" cuando la ADD está vacía
export function limpiarCerca(ojo) {
    const elementos = obtenerElementos();
    elementos[`${ojo}CercaEsf`].value = '';
    elementos[`${ojo}CercaCil`].value = '';
    elementos[`${ojo}CercaEje`].value = '';
}

// Función para mostrar advertencia si falta el EJE y hay CIL
export function mostrarAdvertenciaEjeFaltante() {
    const elementos = obtenerElementos();
    const cilOD = elementos.odLejosCil.value.trim();
    const ejeOD = elementos.odLejosEje.value.trim();
    const cilOI = elementos.oiLejosCil.value.trim();
    const ejeOI = elementos.oiLejosEje.value.trim();

    const mensajeErrorOD = '*Falta el Eje del OD';
    const mensajeErrorOI = '*Falta el Eje del OI';

    if (cilOD !== '' && ejeOD === '') {
        if (!erroresActivos.includes(mensajeErrorOD)) {
            erroresActivos.push(mensajeErrorOD);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeErrorOD);
    }

    if (cilOI !== '' && ejeOI === '') {
        if (!erroresActivos.includes(mensajeErrorOI)) {
            erroresActivos.push(mensajeErrorOI);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeErrorOI);
    }

    actualizarErrores();
}

// Función para mostrar advertencia si las ADD son diferentes
export function mostrarAdvertenciaAddDiferente() {
    const elementos = obtenerElementos();
    const addOD = parseFloat(elementos.addOD.value) || 0;
    const addOI = parseFloat(elementos.addOI.value) || 0;

    const mensajeError = '*Hay una ADD diferente establecida para cada ojo';

    if (addOD !== addOI) {
        if (!erroresActivos.includes(mensajeError)) {
            erroresActivos.push(mensajeError);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeError);
    }

    actualizarErrores();
}

// Función para sincronizar cambios entre "lejos", "cerca" y ADD
export function sincronizarCambios(event) {
    const input = event.target;
    const id = input.id;
    const elementos = obtenerElementos();

    if (id.includes('add')) {
        const ojo = id.includes('od') ? 'od' : 'oi';
        const add = parseFloat(input.value) || 0;

        if (add !== 0) {
            calcularCerca(ojo);
        } else {
            limpiarCerca(ojo);
        }
    }

    if (id.includes('lejos-esf')) {
        const ojo = id.includes('od') ? 'od' : 'oi';
        const add = parseFloat(elementos[`add${ojo.toUpperCase()}`].value) || 0;
        if (add !== 0) {
            calcularCerca(ojo);
        }
    }

    mostrarAdvertenciaAddDiferente();
    revisarErroresYActualizarCerca();
}

// Función para agregar eventos de delegación
export function agregarEventosDelegacion() {
    const contenedorRecetas = document.querySelector('.vista-previa');
    if (contenedorRecetas) {
        contenedorRecetas.addEventListener('input', validarInputCentralizado);
        contenedorRecetas.addEventListener('focus', onInputFocus, true);
        contenedorRecetas.addEventListener('blur', onInputBlur, true);
    } else {
        console.error('No se encontró el contenedor de recetas.');
    }
}