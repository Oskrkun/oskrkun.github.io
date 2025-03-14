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
    // Crear un contenedor único para las advertencias
    const contenedorErrores = document.createElement('div');
    contenedorErrores.id = 'contenedor-errores';
    contenedorErrores.style.marginTop = '10px';

    // Insertar el contenedor de errores debajo de la sección de cerca
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
        spanError.id = error.id; // Asignar un ID único al error
        spanError.classList.add('advertenciaReceta');
        spanError.style.display = 'block';
        contenedorErrores.appendChild(spanError);
    });

    console.log('Errores actualizados:', erroresActivos);
}

// Función para agregar un error con un ID único
function agregarError(id, mensaje) {
    const errorId = `${id}-${Date.now()}`; // ID único basado en el ID del input y la marca de tiempo
    const error = { id: errorId, message: mensaje };
    erroresActivos.push(error);
    console.log(`Error agregado: ${errorId} - ${mensaje}`);
}

// Función para eliminar errores por ID
function eliminarErroresPorId(id) {
    const erroresEliminados = erroresActivos.filter(error => error.id.startsWith(id));
    erroresActivos = erroresActivos.filter(error => !error.id.startsWith(id));
    console.log(`Errores eliminados para ${id}:`, erroresEliminados);
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
        actualizarErrores(); // Actualizar la lista de errores en la interfaz
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
    // Solo permitir números enteros entre 0 y 180
    if (!/^\d*$/.test(value)) {
        console.error(`Error: El valor en ${input.id} no es válido. Solo se permiten números.`);
        agregarError(input.id, `*${input.id}: Solo se permiten números.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }

    // Asegurar que el valor esté en el rango de 0 a 180
    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        console.error(`Error: El valor en ${input.id} debe estar entre 0 y 180.`);
        agregarError(input.id, `*${input.id}: El valor debe estar entre 0 y 180.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }
}

// Función para validar ADD
function validarADD(input, value) {
    // Solo permitir números positivos y punto decimal
    if (!/^\d*\.?\d*$/.test(value)) {
        console.error(`Error: El valor en ${input.id} no es válido. Solo se permiten números positivos y punto decimal.`);
        agregarError(input.id, `*${input.id}: Solo se permiten números positivos y punto decimal.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }

    // Asegurar que el valor esté en el rango de 0 a MAX_ADD
    const valorNumerico = parseFloat(value);
    if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
        console.error(`Error: El valor en ${input.id} debe estar entre 0 y ${MAX_ADD}.`);
        agregarError(input.id, `*${input.id}: El valor debe estar entre 0 y ${MAX_ADD}.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {
    // Limpiar errores anteriores relacionados con este input
    eliminarErroresPorId(id);

    // Validar el formato del valor
    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        console.error(`Error: El valor en ${id} no es válido. Solo se permiten números, +, - y punto decimal.`);
        agregarError(id, `*${id}: Solo se permiten números, +, - y punto decimal.`);
        input.value = value.slice(0, -1);
        return;
    }

    // Validar que no haya más de 2 cifras enteras
    const partes = value.split('.');
    const parteEntera = partes[0].replace(/[+-]/, ''); // Ignorar el signo
    if (parteEntera.length > 2) {
        console.error(`Error: El valor en ${id} no puede tener más de 2 cifras enteras.`);
        agregarError(id, `*${id}: No puede tener más de 2 cifras enteras.`);
        input.value = value.slice(0, -1);
        return;
    }

    // Validar el valor numérico
    const valorNumerico = parseFloat(value);
    mostrarAdvertenciaMaxEsfCil(valorNumerico, id);
}

// Función para ajustar el valor a pasos de 0.25
export function ajustarValorAPasos(valor) {
    if (valor === '' || valor === '+' || valor === '-') {
        return ''; // No ajustar si el valor está vacío o es solo un signo
    }

    const paso = 0.25;
    const valorNumerico = parseFloat(valor);
    const multiplicador = 1 / paso;
    const valorAjustado = Math.round(valorNumerico * multiplicador) / multiplicador;
    return valorAjustado.toFixed(2); // Asegurar que tenga 2 decimales
}

// Función para manejar el evento de foco (entrar al input)
export function onInputFocus(event) {
    const input = event.target;
    input.placeholder = ''; // Limpiar el placeholder al entrar

    // Limpiar el error correspondiente al input
    const id = input.id;
    eliminarErroresPorId(id);

    // Actualizar la lista de errores en la interfaz
    actualizarErrores();
}

// Función para manejar el evento de blur (salir del input)
export function onInputBlur(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Si el input está vacío, limpiar todos los errores relacionados
    if (value === '') {
        eliminarErroresPorId(id);
        actualizarErrores(); // Actualizar la lista de errores en la interfaz
        return; // Salir de la función para evitar más validaciones
    }

    // Resto de la lógica de validación...
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
    }

    revisarErroresYActualizarCerca();
}

// Función para mostrar u ocultar la sección de "cerca" en función de los valores de "ADD"
function actualizarVisibilidadCerca() {
    const addOD = elementos.addOD.value.trim();
    const addOI = elementos.addOI.value.trim();

    // Si hay algún valor en los campos de "ADD", mostrar la sección de "cerca"
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
    actualizarErrores(); // Actualizar la lista de errores en la interfaz
}

// Función para limpiar la parte de "cerca" cuando la ADD está vacía
export function limpiarCerca(ojo) {
    // Limpiar los campos de "cerca" para el ojo especificado
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

    // Limpiar errores anteriores relacionados con el eje
    eliminarErroresPorId('odLejosEje');
    eliminarErroresPorId('oiLejosEje');

    // Verificar si falta el EJE en OD
    if (cilOD !== '' && ejeOD === '') {
        agregarError('odLejosEje', mensajeErrorOD);
    }

    // Verificar si falta el EJE en OI
    if (cilOI !== '' && ejeOI === '') {
        agregarError('oiLejosEje', mensajeErrorOI);
    }
}

// Función para mostrar advertencia si las ADD son diferentes
export function mostrarAdvertenciaAddDiferente() {
    const addOD = parseFloat(elementos.addOD.value) || 0;
    const addOI = parseFloat(elementos.addOI.value) || 0;

    const mensajeError = '*Hay una ADD diferente establecida para cada ojo';

    // Verificar si las ADD son diferentes
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

    // Limpiar errores anteriores relacionados con este input
    eliminarErroresPorId(id);

    // Verificar si el valor está fuera de rango
    if (valorNumerico > maxValor || valorNumerico < -maxValor) {
        agregarError(id, mensajeError);
    }
}

// Función genérica para calcular y actualizar la parte de "cerca"
export function calcularCerca(ojo) {
    // Obtener los valores de ESF de "lejos" y ADD para el ojo especificado
    const esfLejos = parseFloat(elementos[`${ojo}LejosEsf`].value) || 0;
    const add = parseFloat(elementos[`add${ojo.toUpperCase()}`].value) || 0;

    // Calcular el valor de ESF para "cerca"
    const esfCerca = esfLejos + add;

    // Ajustar el valor a pasos de 0.25
    const esfCercaAjustado = ajustarValorAPasos(esfCerca.toString());

    // Actualizar el campo de ESF en "cerca" para el ojo especificado
    elementos[`${ojo}CercaEsf`].value = esfCercaAjustado;

    // Copiar el cilindro y el eje de "lejos" a "cerca" para el ojo especificado
    elementos[`${ojo}CercaCil`].value = elementos[`${ojo}LejosCil`].value;
    elementos[`${ojo}CercaEje`].value = elementos[`${ojo}LejosEje`].value;
}

// Función para sincronizar cambios entre "lejos", "cerca" y ADD
export function sincronizarCambios(event) {
    const input = event.target;
    const id = input.id;

    // Si se modifica ADD, actualizar "cerca"
    if (id.includes('add')) {
        const ojo = id.includes('od') ? 'od' : 'oi';
        const add = parseFloat(input.value) || 0;

        if (add !== 0) {
            calcularCerca(ojo); // Si hay ADD, calcular "cerca"
        } else {
            limpiarCerca(ojo); // Si la ADD está vacía, limpiar la parte de "cerca"
        }
    }

    // Si se modifica "lejos", no hacer nada a menos que ADD esté presente
    if (id.includes('lejos-esf')) {
        const ojo = id.includes('od') ? 'od' : 'oi';
        const add = parseFloat(elementos[`add${ojo.toUpperCase()}`].value) || 0;
        if (add !== 0) {
            calcularCerca(ojo);
        }
    }

    // Mostrar advertencia si las ADD son diferentes
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
    // Obtener los valores de los cilindros de "lejos"
    const cilOD = parseFloat(elementos.odLejosCil.value) || 0;
    const cilOI = parseFloat(elementos.oiLejosCil.value) || 0;

    // Verificar si los cilindros son del mismo signo o diferentes
    if (cilOD !== 0 && cilOI !== 0) {
        // Ambos cilindros tienen valores: transponer ambos
        if (cilOD > 0 && cilOI > 0) {
            // Ambos cilindros son positivos: cambiar ambos a negativos
            transponerOjo('od');
            transponerOjo('oi');
        } else if (cilOD < 0 && cilOI < 0) {
            // Ambos cilindros son negativos: cambiar ambos a positivos
            transponerOjo('od');
            transponerOjo('oi');
        } else if (cilOD > 0 || cilOI > 0) {
            // Uno de los cilindros es positivo: cambiar solo el positivo a negativo
            if (cilOD > 0) {
                cambiarSignoCilindro('od');
            }
            if (cilOI > 0) {
                cambiarSignoCilindro('oi');
            }
        }
    } else if (cilOD !== 0 || cilOI !== 0) {
        // Solo un cilindro tiene valor: transponer solo ese ojo
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
    const eje = parseInt(elementos[`${ojo}LejosEje`].value) || 0; // Si el eje está vacío, se toma como 0

    // Cambiar el signo del cilindro
    const cilTranspuesto = -cil;

    // Ajustar el eje
    const ejeTranspuesto = (eje <= 90) ? eje + 90 : eje - 90;

    // Calcular la nueva ESF
    const esfTranspuesto = esf + cil;

    // Asegurar que los valores positivos tengan el símbolo "+"
    const esfFormateado = formatearValor(esfTranspuesto);
    const cilFormateado = formatearValor(cilTranspuesto);

    // Actualizar los campos
    elementos[`${ojo}LejosEsf`].value = esfFormateado;
    elementos[`${ojo}LejosCil`].value = cilFormateado;
    elementos[`${ojo}LejosEje`].value = ejeTranspuesto;
}

// Función para cambiar el signo del cilindro (solo para un ojo)
function cambiarSignoCilindro(ojo) {
    const esf = parseFloat(elementos[`${ojo}LejosEsf`].value) || 0;
    const cil = parseFloat(elementos[`${ojo}LejosCil`].value) || 0;
    const eje = parseInt(elementos[`${ojo}LejosEje`].value) || 0; // Si el eje está vacío, se toma como 0

    // Cambiar el signo del cilindro
    const cilTranspuesto = -cil;

    // Ajustar el eje
    const ejeTranspuesto = (eje <= 90) ? eje + 90 : eje - 90;

    // Calcular la nueva ESF
    const esfTranspuesto = esf + cil;

    // Asegurar que los valores positivos tengan el símbolo "+"
    const esfFormateado = formatearValor(esfTranspuesto);
    const cilFormateado = formatearValor(cilTranspuesto);

    // Actualizar los campos
    elementos[`${ojo}LejosEsf`].value = esfFormateado;
    elementos[`${ojo}LejosCil`].value = cilFormateado;
    elementos[`${ojo}LejosEje`].value = ejeTranspuesto;
}

// Función para formatear valores (agregar "+" a valores positivos)
function formatearValor(valor) {
    if (valor > 0) {
        return `+${valor.toFixed(2)}`; // Agregar "+" a valores positivos
    } else if (valor < 0) {
        return valor.toFixed(2); // Mantener el "-" en valores negativos
    } else {
        return '0.00'; // Si es cero, devolver "0.00"
    }
}

// Función para sincronizar todo después de la transposición
export function sincronizarTodo() {
    // Revisar errores y actualizar la parte de "cerca"
    revisarErroresYActualizarCerca();

    // Mostrar advertencia si las ADD son diferentes
    mostrarAdvertenciaAddDiferente();
}