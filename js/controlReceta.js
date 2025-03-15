// Variables para establecer los máximos de ADD, ESF y CIL
export const MAX_ADD = 3.25;
export const MAX_ESF = 25.00; // Máximo valor para ESF
export const MAX_CIL = 8.00; // Máximo valor para CIL

// Lista de errores activos
export let erroresActivos = [];

// Elementos del DOM
export const elementos = {
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

// Función para crear el contenedor de errores
export function crearAdvertencias() {
    // Verificar si el contenedor de errores ya existe
    let contenedorErrores = document.getElementById('contenedor-errores');
    if (contenedorErrores) {
        return; // Si ya existe, no hacer nada
    }

    // Crear un contenedor único para las advertencias
    contenedorErrores = document.createElement('div');
    contenedorErrores.id = 'contenedor-errores';

    // Agregar el ícono de FontAwesome (X) en la esquina superior derecha
    const iconoCerrar = document.createElement('i');
    iconoCerrar.className = 'fas fa-times cerrar-icono'; // Clases de FontAwesome

    // Agregar evento de clic al ícono para cerrar el contenedor
    iconoCerrar.addEventListener('click', () => {
        erroresActivos.length = 0; // Limpiar todos los errores
        actualizarErrores(); // Actualizar la lista de errores
        contenedorErrores.style.display = 'none'; // Ocultar el contenedor
    });

    // Agregar el ícono al contenedor
    contenedorErrores.appendChild(iconoCerrar);

    // Insertar el contenedor de errores en el cuerpo del documento
    document.body.appendChild(contenedorErrores);
}

// Función para actualizar la lista de errores en la interfaz
export function actualizarErrores() {
    let contenedorErrores = document.getElementById('contenedor-errores');
    if (!contenedorErrores) {
        crearAdvertencias();
        contenedorErrores = document.getElementById('contenedor-errores');
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

    // Mostrar u ocultar el contenedor según si hay errores
    if (erroresActivos.length === 0) {
        contenedorErrores.style.display = 'none';
    } else {
        contenedorErrores.style.display = 'block';
    }

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
    erroresActivos = erroresActivos.filter(error => !error.id.startsWith(id));
    console.log(`Errores eliminados para ${id}`);
}

// Función para manejar el evento de foco (entrar al input)
export function onInputFocus(event) {
    const input = event.target;
    const id = input.id;

    // Limpiar errores asociados a este input al entrar
    eliminarErroresPorId(id);
    actualizarErrores();
}

// Función para manejar el evento de blur (salir del input)
export function onInputBlur(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Validar el input al salir
    if (id.includes('eje')) {
        validarEje(input, value);
    } else if (id.includes('add')) {
        validarADD(input, value);
    } else if (esEsfOCil(id)) {
        validarEsfOCil(input, value, id);
    }

    // Actualizar la lista de errores
    actualizarErrores();
}

// Función para validar el EJE
function validarEje(input, value) {
    // Solo permitir números enteros entre 0 y 180
    if (!/^\d*$/.test(value)) {
        agregarError(input.id, `*${input.id}: Solo se permiten números.`);
        return;
    }

    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        agregarError(input.id, `*${input.id}: El valor debe estar entre 0 y 180.`);
        return;
    }
}

// Función para validar ADD
function validarADD(input, value) {
    // Solo permitir números positivos y punto decimal
    if (!/^\d*\.?\d*$/.test(value)) {
        agregarError(input.id, `*${input.id}: Solo se permiten números positivos y punto decimal.`);
        return;
    }

    const valorNumerico = parseFloat(value);
    if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
        agregarError(input.id, `*${input.id}: El valor debe estar entre 0 y ${MAX_ADD}.`);
        return;
    }
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {
    // Validar el formato del valor
    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        agregarError(id, `*${id}: Solo se permiten números, +, - y punto decimal.`);
        return;
    }

    // Validar que no haya más de 2 cifras enteras
    const partes = value.split('.');
    const parteEntera = partes[0].replace(/[+-]/, ''); // Ignorar el signo
    if (parteEntera.length > 2) {
        agregarError(id, `*${id}: No puede tener más de 2 cifras enteras.`);
        return;
    }

    // Validar el valor numérico
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
        agregarError(id, mensajeError);
    }
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

// Función para limpiar la parte de "cerca" cuando la ADD está vacía
export function limpiarCerca(ojo) {
    // Limpiar los campos de "cerca" para el ojo especificado
    elementos[`${ojo}CercaEsf`].value = '';
    elementos[`${ojo}CercaCil`].value = '';
    elementos[`${ojo}CercaEje`].value = '';
}

// Función para calcular y actualizar la parte de "cerca"
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

// Función para mostrar advertencia si falta el EJE y hay CIL
export function mostrarAdvertenciaEjeFaltante() {
    const cilOD = elementos.odLejosCil.value.trim();
    const ejeOD = elementos.odLejosEje.value.trim();
    const cilOI = elementos.oiLejosCil.value.trim();
    const ejeOI = elementos.oiLejosEje.value.trim();

    const mensajeErrorOD = '*Falta el Eje del OD';
    const mensajeErrorOI = '*Falta el Eje del OI';

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

// Función para validar los inputs
export function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Limpiar errores anteriores relacionados con este input
    eliminarErroresPorId(id);

   // Si el input está vacío, no hay necesidad de validar más
   if (value === '') {
    // Si el input es CIL, también limpiar el error del EJE asociado
    if (id.includes('cil')) {
        const ejeId = id.replace('cil', 'eje'); // Obtener el ID del EJE asociado
        eliminarErroresPorId(ejeId); // Limpiar el error del EJE
    }
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
    mostrarAdvertenciaEjeFaltante();
    mostrarAdvertenciaAddDiferente();
}