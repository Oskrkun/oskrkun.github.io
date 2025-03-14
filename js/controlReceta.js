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

    // Si el contenedor no existe, crearlo
    if (!contenedorErrores) {
        contenedorErrores = document.createElement('div');
        contenedorErrores.id = 'contenedor-errores';

        // Estilos para el contenedor de errores flotante
        contenedorErrores.style.position = 'fixed'; // Fijo en la pantalla
        contenedorErrores.style.bottom = '20px'; // 20px desde la parte inferior
        contenedorErrores.style.right = '20px'; // 20px desde la derecha
        contenedorErrores.style.backgroundColor = '#ffebee'; // Fondo rojo claro
        contenedorErrores.style.padding = '10px'; // Espaciado interno
        contenedorErrores.style.borderRadius = '8px'; // Bordes redondeados
        contenedorErrores.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Sombra
        contenedorErrores.style.zIndex = '1000'; // Asegurar que esté por encima de otros elementos
        contenedorErrores.style.maxWidth = '300px'; // Ancho máximo
        contenedorErrores.style.overflowY = 'auto'; // Permitir desplazamiento vertical si hay muchos errores
        contenedorErrores.style.maxHeight = '200px'; // Altura máxima

        // Insertar el contenedor de errores en el body
        document.body.appendChild(contenedorErrores);
    }
}

// Función para actualizar la lista de errores en la interfaz
export function actualizarErrores() {
    const elementos = obtenerElementos(); // Obtener los elementos del DOM
    let contenedorErrores = elementos.contenedorErrores;

    // Si el contenedor no existe, crearlo
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
}

// Función para validar los inputs
export function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Limpiar el error anterior
    erroresActivos = erroresActivos.filter(error => !error.startsWith(`*${id}`));

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
}

// Función para validar el EJE
function validarEje(input, value) {
    // Solo permitir números enteros entre 0 y 180
    if (!/^\d*$/.test(value)) {
        console.error(`Error: El valor en ${input.id} no es válido. Solo se permiten números.`);
        erroresActivos.push(`*${input.id}: Solo se permiten números.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }

    // Asegurar que el valor esté en el rango de 0 a 180
    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        console.error(`Error: El valor en ${input.id} debe estar entre 0 y 180.`);
        erroresActivos.push(`*${input.id}: El valor debe estar entre 0 y 180.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }
}

// Función para validar ADD
function validarADD(input, value) {
    // Solo permitir números positivos y punto decimal
    if (!/^\d*\.?\d*$/.test(value)) {
        console.error(`Error: El valor en ${input.id} no es válido. Solo se permiten números positivos y punto decimal.`);
        erroresActivos.push(`*${input.id}: Solo se permiten números positivos y punto decimal.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }

    // Asegurar que el valor esté en el rango de 0 a MAX_ADD
    const valorNumerico = parseFloat(value);
    if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
        console.error(`Error: El valor en ${input.id} debe estar entre 0 y ${MAX_ADD}.`);
        erroresActivos.push(`*${input.id}: El valor debe estar entre 0 y ${MAX_ADD}.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {
    // Permitir los símbolos +, - y punto decimal mientras se escribe
    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        console.error(`Error: El valor en ${id} no es válido. Solo se permiten números, +, - y punto decimal.`);
        erroresActivos.push(`*${id}: Solo se permiten números, +, - y punto decimal.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }

    // Validar que no haya valores de 3 cifras
    if (value.length > 5) { // Considerando el signo y el punto decimal
        console.error(`Error: El valor en ${id} no puede tener más de 2 cifras enteras.`);
        erroresActivos.push(`*${id}: No puede tener más de 2 cifras enteras.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return;
    }

    // Validar que el valor esté dentro del rango permitido
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
}

// Función para manejar el evento de blur (salir del input)
export function onInputBlur(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Validación específica para EJE
    if (id.includes('eje')) {
        if (value === '') {
            // No autocompletar con 0 si está vacío
            input.value = '';
        } else {
            const valorNumerico = parseInt(value, 10);
            if (valorNumerico < 0) {
                input.value = '0';
            } else if (valorNumerico > 180) {
                input.value = '180';
            }
        }
    }
    // Validación específica para ADD
    else if (id.includes('add')) {
        if (value === '') {
            input.value = ''; // Si está vacío, no hacer nada
        } else {
            // Asegurar que el valor esté en el rango de 0 a MAX_ADD
            const valorNumerico = parseFloat(value);
            if (valorNumerico < 0) {
                input.value = '0.00';
            } else if (valorNumerico > MAX_ADD) {
                input.value = MAX_ADD.toFixed(2);
            } else {
                // Ajustar el valor a pasos de 0.25
                const valorAjustado = ajustarValorAPasos(value);
                input.value = valorAjustado;
            }
        }
    }
    // Validación para ESF y CIL
    else if (esEsfOCil(id)) {
        if (value === '' || value === '+' || value === '-') {
            input.value = ''; // Si está vacío o solo tiene un signo, dejarlo vacío
            return;
        }

        // Asegurar que el valor tenga un signo
        let valorAjustado = ajustarValorAPasos(value);
        if (!valorAjustado.startsWith('+') && !valorAjustado.startsWith('-')) {
            valorAjustado = `+${valorAjustado}`;
        }

        input.value = valorAjustado;

        // Mostrar advertencia si el valor es mayor a MAX_ESF o MAX_CIL
        const valorNumerico = parseFloat(valorAjustado);
        mostrarAdvertenciaMaxEsfCil(valorNumerico, id);
    }

    // Revisar errores y actualizar la parte de "cerca"
    revisarErroresYActualizarCerca();
}

// Función para mostrar u ocultar la sección de "cerca" en función de los valores de "ADD"
function actualizarVisibilidadCerca() {
    const elementos = obtenerElementos(); // Obtener los elementos del DOM
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
    const elementos = obtenerElementos(); // Obtener los elementos del DOM

    // Revisar si falta el eje y hay cilindro
    mostrarAdvertenciaEjeFaltante();

    // Si hay ADD, actualizar la parte de "cerca"
    const addOD = parseFloat(elementos.addOD.value) || 0;
    const addOI = parseFloat(elementos.addOI.value) || 0;

    if (addOD !== 0) {
        calcularCerca('od');
    } else {
        limpiarCerca('od'); // Si la ADD está vacía, limpiar la parte de "cerca" del OD
    }

    if (addOI !== 0) {
        calcularCerca('oi');
    } else {
        limpiarCerca('oi'); // Si la ADD está vacía, limpiar la parte de "cerca" del OI
    }

    // Actualizar la visibilidad de la sección de "cerca"
    actualizarVisibilidadCerca();

    // Actualizar la lista de errores en la interfaz
    actualizarErrores();
}

// Función para limpiar la parte de "cerca" cuando la ADD está vacía
export function limpiarCerca(ojo) {
    const elementos = obtenerElementos(); // Obtener los elementos del DOM

    // Limpiar los campos de "cerca" para el ojo especificado
    elementos[`${ojo}CercaEsf`].value = '';
    elementos[`${ojo}CercaCil`].value = '';
    elementos[`${ojo}CercaEje`].value = '';
}

// Función para mostrar advertencia si falta el EJE y hay CIL
export function mostrarAdvertenciaEjeFaltante() {
    const elementos = obtenerElementos(); // Obtener los elementos del DOM
    const cilOD = elementos.odLejosCil.value.trim();
    const ejeOD = elementos.odLejosEje.value.trim();
    const cilOI = elementos.oiLejosCil.value.trim();
    const ejeOI = elementos.oiLejosEje.value.trim();

    const mensajeErrorOD = '*Falta el Eje del OD';
    const mensajeErrorOI = '*Falta el Eje del OI';

    // Verificar si falta el EJE en OD
    if (cilOD !== '' && ejeOD === '') {
        if (!erroresActivos.includes(mensajeErrorOD)) {
            erroresActivos.push(mensajeErrorOD);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeErrorOD);
    }

    // Verificar si falta el EJE en OI
    if (cilOI !== '' && ejeOI === '') {
        if (!erroresActivos.includes(mensajeErrorOI)) {
            erroresActivos.push(mensajeErrorOI);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeErrorOI);
    }

    // Actualizar la lista de errores en la interfaz
    actualizarErrores();
}

// Función para mostrar advertencia si las ADD son diferentes
export function mostrarAdvertenciaAddDiferente() {
    const elementos = obtenerElementos(); // Obtener los elementos del DOM
    const addOD = parseFloat(elementos.addOD.value) || 0;
    const addOI = parseFloat(elementos.addOI.value) || 0;

    const mensajeError = '*Hay una ADD diferente establecida para cada ojo';

    // Verificar si las ADD son diferentes
    if (addOD !== addOI) {
        if (!erroresActivos.includes(mensajeError)) {
            erroresActivos.push(mensajeError);
        }
    } else {
        erroresActivos = erroresActivos.filter(error => error !== mensajeError);
    }

    // Actualizar la lista de errores en la interfaz
    actualizarErrores();
}

// Función para mostrar advertencia si el valor de ESF o CIL supera MAX_ESF o MAX_CIL
export function mostrarAdvertenciaMaxEsfCil(valorNumerico, id) {
    const esfOCil = id.includes('esf') ? 'ESF' : 'CIL';
    const maxValor = id.includes('esf') ? MAX_ESF : MAX_CIL;
    const ojo = id.includes('od') ? 'OD' : 'OI';
    const mensajeError = `*${esfOCil} demasiado alto en ${ojo}. Consultar con el laboratorio.`;

    // Verificar si el valor está fuera de rango
    if (valorNumerico > maxValor || valorNumerico < -maxValor) {
        // Agregar el error a la lista de errores activos si no está ya presente
        if (!erroresActivos.includes(mensajeError)) {
            erroresActivos.push(mensajeError);
        }
    } else {
        // Si el valor está dentro del rango, eliminar el error de la lista
        erroresActivos = erroresActivos.filter(error => error !== mensajeError);
    }

    // Actualizar la lista de errores en la interfaz
    actualizarErrores();
}

// Función genérica para calcular y actualizar la parte de "cerca"
export function calcularCerca(ojo) {
    const elementos = obtenerElementos(); // Obtener los elementos del DOM

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
    const elementos = obtenerElementos(); // Obtener los elementos del DOM dinámicamente

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
    const elementos = obtenerElementos(); // Obtener los elementos del DOM

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
    const elementos = obtenerElementos(); // Obtener los elementos del DOM
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
    const elementos = obtenerElementos(); // Obtener los elementos del DOM
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