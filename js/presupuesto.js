// presupuesto.js

//Oskrkun 9.23.6.3.25

// Variables para establecer los máximos de ADD, ESF y CIL
const MAX_ADD = 3.25;
const MAX_ESF = 25.00; // Máximo valor para ESF
const MAX_CIL = 8.00; // Máximo valor para CIL

// Lista de errores activos
let erroresActivos = [];

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
            console.log('Botón presionado'); // Mensaje en consola
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

// Función para crear los span de advertencia dinámicamente
function crearAdvertencias() {
    // Crear un contenedor único para las advertencias
    const contenedorErrores = document.createElement('div');
    contenedorErrores.id = 'contenedor-errores';
    contenedorErrores.style.marginTop = '10px';

    // Insertar el contenedor de errores debajo de la sección de lejos
    const seccionLejos = document.getElementById('seccion-lejos');
    if (seccionLejos) {
        seccionLejos.insertAdjacentElement('afterend', contenedorErrores);
    }
}

// Función para actualizar la lista de errores en la interfaz
function actualizarErrores() {
    const contenedorErrores = document.getElementById('contenedor-errores');
    if (!contenedorErrores) return;

    // Limpiar el contenedor de errores
    contenedorErrores.innerHTML = '';

    // Mostrar cada error en el contenedor
    erroresActivos.forEach(error => {
        const spanError = document.createElement('span');
        spanError.textContent = error;
        spanError.classList.add('advertenciaReceta');
        spanError.style.display = 'block';
        spanError.style.color = 'red'; // Opcional: Cambiar el color para destacar los errores
        contenedorErrores.appendChild(spanError);
    });
}

// Función para validar los inputs
function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    console.log(`Validando input con ID: ${id}, Valor: ${value}`);

    // Validación específica para EJE
    if (id.includes('eje')) {
        // Solo permitir números enteros entre 0 y 180
        if (!/^\d*$/.test(value)) {
            console.error(`Error: El valor en ${id} no es válido. Solo se permiten números.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }

        // Asegurar que el valor esté en el rango de 0 a 180
        const valorNumerico = parseInt(value, 10);
        if (valorNumerico < 0 || valorNumerico > 180) {
            console.error(`Error: El valor en ${id} debe estar entre 0 y 180.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }
    }
    // Validación específica para ADD
    else if (id.includes('add')) {
        // Solo permitir números positivos y punto decimal
        if (!/^\d*\.?\d*$/.test(value)) {
            console.error(`Error: El valor en ${id} no es válido. Solo se permiten números positivos y punto decimal.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }

        // Asegurar que el valor esté en el rango de 0 a MAX_ADD
        const valorNumerico = parseFloat(value);
        if (valorNumerico < 0 || valorNumerico > MAX_ADD) {
            console.error(`Error: El valor en ${id} debe estar entre 0 y ${MAX_ADD}.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }
    }
    // Validación para ESF y CIL
    else {
        // Permitir los símbolos +, - y punto decimal mientras se escribe
        if (!/^[+-]?\d*\.?\d*$/.test(value)) {
            console.error(`Error: El valor en ${id} no es válido. Solo se permiten números, +, - y punto decimal.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }

        // Validar que no haya valores de 3 cifras
        if (value.length > 5) { // Considerando el signo y el punto decimal
            console.error(`Error: El valor en ${id} no puede tener más de 2 cifras enteras.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }

        // Validar que el valor esté dentro del rango permitido
        const valorNumerico = parseFloat(value);
        mostrarAdvertenciaMaxEsfCil(valorNumerico, id);
    }

    console.log(`Input ${id} validado correctamente.`);
}

// Función para ajustar el valor a pasos de 0.25
function ajustarValorAPasos(valor) {
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
function onInputFocus(event) {
    const input = event.target;
    console.log(`Entrando al input con ID: ${input.id}`);
    input.placeholder = ''; // Limpiar el placeholder al entrar
}

// Función para manejar el evento de blur (salir del input)
function onInputBlur(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;
    console.log(`Saliendo del input con ID: ${id}, Valor: ${value}`);

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

// Función para revisar errores y actualizar la parte de "cerca"
function revisarErroresYActualizarCerca() {
    // Revisar si falta el eje y hay cilindro
    mostrarAdvertenciaEjeFaltante();

    // Si hay ADD, actualizar la parte de "cerca"
    const addOD = parseFloat(document.getElementById('add-od').value) || 0;
    const addOI = parseFloat(document.getElementById('add-oi').value) || 0;

    if (addOD !== 0) {
        calcularCercaOD();
    }
    if (addOI !== 0) {
        calcularCercaOI();
    }

    // Actualizar la lista de errores en la interfaz
    actualizarErrores();
}

// Función para mostrar advertencia si falta el EJE y hay CIL
function mostrarAdvertenciaEjeFaltante() {
    const cilOD = document.getElementById('od-lejos-cil').value.trim();
    const ejeOD = document.getElementById('od-lejos-eje').value.trim();
    const cilOI = document.getElementById('oi-lejos-cil').value.trim();
    const ejeOI = document.getElementById('oi-lejos-eje').value.trim();

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
function mostrarAdvertenciaAddDiferente() {
    const addOD = parseFloat(document.getElementById('add-od').value) || 0;
    const addOI = parseFloat(document.getElementById('add-oi').value) || 0;

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
function mostrarAdvertenciaMaxEsfCil(valorNumerico, id) {
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

// Función para calcular y actualizar la parte de "cerca" basada en ADD (OD)
function calcularCercaOD() {
    // Obtener los valores de ESF de "lejos" y ADD para OD
    const esfLejosOD = parseFloat(document.getElementById('od-lejos-esf').value) || 0;
    const addOD = parseFloat(document.getElementById('add-od').value) || 0;

    // Calcular el valor de ESF para "cerca" en OD
    const esfCercaOD = esfLejosOD + addOD;

    // Ajustar el valor a pasos de 0.25
    const esfCercaODAjustado = ajustarValorAPasos(esfCercaOD.toString());

    // Actualizar el campo de ESF en "cerca" para OD
    document.getElementById('od-cerca-esf').value = esfCercaODAjustado;

    // Copiar el cilindro y el eje de "lejos" a "cerca" para OD
    document.getElementById('od-cerca-cil').value = document.getElementById('od-lejos-cil').value;
    document.getElementById('od-cerca-eje').value = document.getElementById('od-lejos-eje').value;
}

// Función para calcular y actualizar la parte de "cerca" basada en ADD (OI)
function calcularCercaOI() {
    // Obtener los valores de ESF de "lejos" y ADD para OI
    const esfLejosOI = parseFloat(document.getElementById('oi-lejos-esf').value) || 0;
    const addOI = parseFloat(document.getElementById('add-oi').value) || 0;

    // Calcular el valor de ESF para "cerca" en OI
    const esfCercaOI = esfLejosOI + addOI;

    // Ajustar el valor a pasos de 0.25
    const esfCercaOIAjustado = ajustarValorAPasos(esfCercaOI.toString());

    // Actualizar el campo de ESF en "cerca" para OI
    document.getElementById('oi-cerca-esf').value = esfCercaOIAjustado;

    // Copiar el cilindro y el eje de "lejos" a "cerca" para OI
    document.getElementById('oi-cerca-cil').value = document.getElementById('oi-lejos-cil').value;
    document.getElementById('oi-cerca-eje').value = document.getElementById('oi-lejos-eje').value;
}

// Función para sincronizar cambios entre "lejos", "cerca" y ADD
function sincronizarCambios(event) {
    const input = event.target;
    const id = input.id;

    // Si se modifica ADD, actualizar "cerca"
    if (id.includes('add') && input.value !== '') {
        if (id.includes('od')) {
            calcularCercaOD();
        } else if (id.includes('oi')) {
            calcularCercaOI();
        }
    }

    // Si se modifica "lejos", no hacer nada a menos que ADD esté presente
    if (id.includes('lejos-esf')) {
        if (id.includes('od')) {
            const addOD = parseFloat(document.getElementById('add-od').value) || 0;
            if (addOD !== 0) {
                calcularCercaOD();
            }
        } else if (id.includes('oi')) {
            const addOI = parseFloat(document.getElementById('add-oi').value) || 0;
            if (addOI !== 0) {
                calcularCercaOI();
            }
        }
    }

    // Mostrar advertencia si las ADD son diferentes
    mostrarAdvertenciaAddDiferente();
}

// Función para agregar eventos de sincronización
function agregarEventosSincronizacion() {
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
function esEsfOCil(id) {
    return id.includes('esf') || id.includes('cil');
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});