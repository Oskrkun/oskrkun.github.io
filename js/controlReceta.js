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

// Función para validar los inputs
export function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

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
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        input.value = value.slice(0, -1);
        return;
    }
}

// Función para validar ADD
function validarADD(input, value) {
    if (!/^\d*\.?\d*$/.test(value)) {
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseFloat(value);
    if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
        input.value = value.slice(0, -1);
        return;
    }
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {

    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        input.value = value.slice(0, -1);
        return;
    }

    const partes = value.split('.');
    const parteEntera = partes[0].replace(/[+-]/, '');
    if (parteEntera.length > 2) {
        input.value = value.slice(0, -1);
        return;
    }

    const valorNumerico = parseFloat(value);
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
}

// Función para manejar el evento de blur (salir del input)
export function onInputBlur(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    if (value === '') {
        actualizarVisibilidadCerca();
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
    }
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

// Función para limpiar la parte de "cerca" cuando la ADD está vacía
export function limpiarCerca(ojo) {
    elementos[`${ojo}CercaEsf`].value = '';
    elementos[`${ojo}CercaCil`].value = '';
    elementos[`${ojo}CercaEje`].value = '';
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