// Variables para establecer los máximos de ADD, ESF y CIL
export const MAX_ADD = 3.25;
export const MAX_ESF = 25.00; // Máximo valor para ESF
export const MAX_CIL = 8.00; // Máximo valor para CIL

// Lista de errores activos
export let erroresActivos = [];

// Elementos del DOM
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
    contenedorErrores: document.getElementById('contenedor-errores')
};

// Función para crear los span de advertencia dinámicamente
export function crearAdvertencias() {
    const contenedorErrores = document.createElement('div');
    contenedorErrores.id = 'contenedor-errores';
    contenedorErrores.style.marginTop = '10px';

    if (elementos.seccionCerca) {
        elementos.seccionCerca.insertAdjacentElement('afterend', contenedorErrores);
    } else {
        console.error('No se encontró la sección de cerca.');
    }
}

// Función para actualizar la lista de errores en la interfaz
export function actualizarErrores() {
    let contenedorErrores = document.getElementById('contenedor-errores');

    if (!contenedorErrores) {
        crearAdvertencias();
        contenedorErrores = document.getElementById('contenedor-errores');
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
        spanError.textContent = error.message;
        spanError.id = error.id;
        spanError.classList.add('advertenciaReceta');
        spanError.style.display = 'block';
        contenedorErrores.appendChild(spanError);
    });
}

// Función para agregar un error con un ID único
function agregarError(id, mensaje) {
    const errorId = `${id}`; // ID único basado en el ID del input
    const error = { id: errorId, message: mensaje };
    erroresActivos.push(error);
    console.log(`Error agregado: ${errorId} - ${mensaje}`);
}

// Función para eliminar errores por ID
function eliminarErroresPorId(id) {
    console.log(`Eliminando errores para el ID: ${id}`);
    erroresActivos = erroresActivos.filter(error => error.id !== id);
    console.log(`Errores restantes después de eliminar:`, erroresActivos);
}

// Función para validar los inputs
export function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Limpiar errores anteriores relacionados con este input
    eliminarErroresPorId(id);

    // Si el input está vacío, no hay necesidad de validar más
    if (value === '') {
        actualizarErrores();
        return;
    }

    // Resto de la lógica de validación...
    if (id.includes('eje')) {
        validarEje(input, value);
    } else if (id.includes('add')) {
        validarADD(input, value);
    } else {
        validarEsfOCil(input, value, id);
    }
}

// Función para validar el EJE
function validarEje(input, value) {
    if (!/^\d*$/.test(value)) {
        agregarError(input.id, `*${input.id}: Solo se permiten números.`);
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        agregarError(input.id, `*${input.id}: El valor debe estar entre 0 y 180.`);
        input.value = value.slice(0, -1);
        return;
    }
}

// Función para validar ADD
function validarADD(input, value) {
    if (!/^\d*\.?\d*$/.test(value)) {
        agregarError(input.id, `*${input.id}: Solo se permiten números positivos y punto decimal.`);
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseFloat(value);
    if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
        agregarError(input.id, `*${input.id}: El valor debe estar entre 0 y ${MAX_ADD}.`);
        input.value = value.slice(0, -1);
        return;
    }
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {
    eliminarErroresPorId(id);

    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        agregarError(id, `*${id}: Solo se permiten números, +, - y punto decimal.`);
        input.value = value.slice(0, -1);
        return;
    }

    const partes = value.split('.');
    const parteEntera = partes[0].replace(/[+-]/, '');
    if (parteEntera.length > 2) {
        agregarError(id, `*${id}: No puede tener más de 2 cifras enteras.`);
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseFloat(value);
    mostrarAdvertenciaMaxEsfCil(valorNumerico, id);

    if (value === '') {
        eliminarErroresPorId('odLejosEje');
        eliminarErroresPorId('oiLejosEje');
    }
}

// Función para ajustar el valor a pasos de 0.25
export function ajustarValorAPasos(valor) {
    if (valor === '' || valor === '+' || valor === '-') {
        return '';
    }

    const paso = 0.25;
    const valorNumerico = parseFloat(valor);
    const multiplicador = 1 / paso;
    const valorAjustado = Math.round(valorNumerico * multiplicador) / multiplicador;
    return valorAjustado.toFixed(2);
}

// Función para manejar el evento de foco (entrar al input)
export function onInputFocus(event) {
    const input = event.target;
    input.placeholder = '';

    const id = input.id;
    eliminarErroresPorId(id);

    actualizarErrores();
}

// Función para manejar el evento de blur (salir del input)
export function onInputBlur(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    if (value === '') {
        eliminarErroresPorId(id);
        actualizarErrores();
        return;
    }

    if (id.includes('eje')) {
        if (value === '') {
            input.value = '';
        } else {
            const valorNumerico = parseInt(value, 10);
            if (valorNumerico < 0) {
                input.value = '0';
            } else if (valorNumerico > 180) {
                input.value = '180';
            }
        }
    } else if (id.includes('add')) {
        if (value === '') {
            input.value = '';
        } else {
            const valorNumerico = parseFloat(value);
            if (valorNumerico < 0) {
                input.value = '0.00';
            } else if (valorNumerico > MAX_ADD) {
                input.value = MAX_ADD.toFixed(2);
            } else {
                const valorAjustado = ajustarValorAPasos(value);
                input.value = valorAjustado;
            }
        }
    } else if (esEsfOCil(id)) {
        if (value === '' || value === '+' || value === '-') {
            input.value = '';
            return;
        }

        let valorAjustado = ajustarValorAPasos(value);
        if (!valorAjustado.startsWith('+') && !valorAjustado.startsWith('-')) {
            valorAjustado = `+${valorAjustado}`;
        }

        input.value = valorAjustado;

        const valorNumerico = parseFloat(valorAjustado);
        mostrarAdvertenciaMaxEsfCil(valorNumerico, id);

        if (value === '') {
            eliminarErroresPorId('odLejosEje');
            eliminarErroresPorId('oiLejosEje');
        }
    }

    revisarErroresYActualizarCerca();
}

// Función para mostrar u ocultar la sección de "cerca" en función de los valores de "ADD"
function actualizarVisibilidadCerca() {
    const addOD = elementos.addOD.value.trim();
    const addOI = elementos.addOI.value.trim();

    if (addOD !== '' || addOI !== '') {
        elementos.seccionCerca.classList.add('visible');
    } else {
        elementos.seccionCerca.classList.remove('visible');
    }
}

// Función para revisar errores y actualizar la parte de "cerca"
export function revisarErroresYActualizarCerca() {
    mostrarAdvertenciaEjeFaltante();
    mostrarAdvertenciaAddDiferente();
    actualizarVisibilidadCerca();
    actualizarErrores();
}

// Función para limpiar la parte de "cerca" cuando la ADD está vacía
export function limpiarCerca(ojo) {
    elementos[`${ojo}CercaEsf`].value = '';
    elementos[`${ojo}CercaCil`].value = '';
    elementos[`${ojo}CercaEje`].value = '';
}

// Función para mostrar advertencia si falta el EJE y hay CIL
export function mostrarAdvertenciaEjeFaltante() {
    const cilOD = elementos.odLejosCil.value.trim();
    const ejeOD = elementos.odLejosEje.value.trim();
    const cilOI = elementos.oiLejosCil.value.trim();
    const ejeOI = elementos.oiLejosEje.value.trim();

    const mensajeErrorOD = '*Falta el Eje del OD';
    const mensajeErrorOI = '*Falta el Eje del OI';

    eliminarErroresPorId('odLejosEje');
    eliminarErroresPorId('oiLejosEje');

    if (cilOD !== '' && ejeOD === '') {
        agregarError('odLejosEje', mensajeErrorOD);
    }

    if (cilOI !== '' && ejeOI === '') {
        agregarError('oiLejosEje', mensajeErrorOI);
    }
}

// Función para mostrar advertencia si las ADD son diferentes
export function mostrarAdvertenciaAddDiferente() {
    const addOD = parseFloat(elementos.addOD.value) || 0;
    const addOI = parseFloat(elementos.addOI.value) || 0;

    const mensajeError = '*Hay una ADD diferente establecida para cada ojo';

    if (addOD !== addOI) {
        if (!erroresActivos.some(error => error.message === mensajeError)) {
            agregarError('addDiferente', mensajeError);
        }
    } else {
        eliminarErroresPorId('addDiferente');
    }
}

// Función para mostrar advertencia si el valor de ESF o CIL supera MAX_ESF o MAX_CIL
export function mostrarAdvertenciaMaxEsfCil(valorNumerico, id) {
    const esfOCil = id.includes('esf') ? 'ESF' : 'CIL';
    const maxValor = id.includes('esf') ? MAX_ESF : MAX_CIL;
    const ojo = id.includes('od') ? 'OD' : 'OI';
    const mensajeError = `*${esfOCil} demasiado alto en ${ojo}. Consultar con el laboratorio.`;

    eliminarErroresPorId(id);

    if (valorNumerico > maxValor || valorNumerico < -maxValor) {
        agregarError(id, mensajeError);
    }
}

// Función genérica para calcular y actualizar la parte de "cerca"
export function calcularCerca(ojo) {
    const esfLejos = parseFloat(elementos[`${ojo}LejosEsf`].value) || 0;
    const add = parseFloat(elementos[`add${ojo.toUpperCase()}`].value) || 0;

    const esfCerca = esfLejos + add;
    const esfCercaAjustado = ajustarValorAPasos(esfCerca.toString());

    elementos[`${ojo}CercaEsf`].value = esfCercaAjustado;
    elementos[`${ojo}CercaCil`].value = elementos[`${ojo}LejosCil`].value;
    elementos[`${ojo}CercaEje`].value = elementos[`${ojo}LejosEje`].value;
}

// Función para sincronizar cambios entre "lejos", "cerca" y ADD
export function sincronizarCambios(event) {
    const input = event.target;
    const id = input.id;

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
}

// Función para agregar eventos de sincronización
export function agregarEventosSincronizacion() {
    const inputsLejos = document.querySelectorAll('.seccion-lejos input');
    const inputsAdd = document.querySelectorAll('.seccion-add input');

    inputsLejos.forEach(input => {
        input.addEventListener('input', sincronizarCambios);
    });

    inputsAdd.forEach(input => {
        input.addEventListener('input', sincronizarCambios);
    });
}

// Función para verificar si el input es ESF o CIL
export function esEsfOCil(id) {
    return id.includes('esf') || id.includes('cil');
}

// Función para transponer la receta
export function transponerReceta() {
    const cilOD = parseFloat(elementos.odLejosCil.value) || 0;
    const cilOI = parseFloat(elementos.oiLejosCil.value) || 0;

    if (cilOD !== 0 && cilOI !== 0) {
        if (cilOD > 0 && cilOI > 0) {
            transponerOjo('od');
            transponerOjo('oi');
        } else if (cilOD < 0 && cilOI < 0) {
            transponerOjo('od');
            transponerOjo('oi');
        } else if (cilOD > 0 || cilOI > 0) {
            if (cilOD > 0) {
                cambiarSignoCilindro('od');
            }
            if (cilOI > 0) {
                cambiarSignoCilindro('oi');
            }
        }
    } else if (cilOD !== 0 || cilOI !== 0) {
        if (cilOD !== 0) {
            transponerOjo('od');
        } else if (cilOI !== 0) {
            transponerOjo('oi');
        }
    }
}

// Función para transponer un ojo (transposición completa)
function transponerOjo(ojo) {
    const esf = parseFloat(elementos[`${ojo}LejosEsf`].value) || 0;
    const cil = parseFloat(elementos[`${ojo}LejosCil`].value) || 0;
    const eje = parseInt(elementos[`${ojo}LejosEje`].value) || 0;

    const cilTranspuesto = -cil;
    const ejeTranspuesto = (eje <= 90) ? eje + 90 : eje - 90;
    const esfTranspuesto = esf + cil;

    const esfFormateado = formatearValor(esfTranspuesto);
    const cilFormateado = formatearValor(cilTranspuesto);

    elementos[`${ojo}LejosEsf`].value = esfFormateado;
    elementos[`${ojo}LejosCil`].value = cilFormateado;
    elementos[`${ojo}LejosEje`].value = ejeTranspuesto;
}

// Función para cambiar el signo del cilindro (solo para un ojo)
function cambiarSignoCilindro(ojo) {
    const esf = parseFloat(elementos[`${ojo}LejosEsf`].value) || 0;
    const cil = parseFloat(elementos[`${ojo}LejosCil`].value) || 0;
    const eje = parseInt(elementos[`${ojo}LejosEje`].value) || 0;

    const cilTranspuesto = -cil;
    const ejeTranspuesto = (eje <= 90) ? eje + 90 : eje - 90;
    const esfTranspuesto = esf + cil;

    const esfFormateado = formatearValor(esfTranspuesto);
    const cilFormateado = formatearValor(cilTranspuesto);

    elementos[`${ojo}LejosEsf`].value = esfFormateado;
    elementos[`${ojo}LejosCil`].value = cilFormateado;
    elementos[`${ojo}LejosEje`].value = ejeTranspuesto;
}

// Función para formatear valores (agregar "+" a valores positivos)
function formatearValor(valor) {
    if (valor > 0) {
        return `+${valor.toFixed(2)}`;
    } else if (valor < 0) {
        return valor.toFixed(2);
    } else {
        return '0.00';
    }
}

// Función para sincronizar todo después de la transposición
export function sincronizarTodo() {
    revisarErroresYActualizarCerca();
    mostrarAdvertenciaAddDiferente();
}