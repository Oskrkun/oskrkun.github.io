// presupuesto.js
// Variable para establecer el máximo de ADD
// Oskrkun 17.56
const MAX_ADD = 3.25;
const MAX_ESF_CIL = 35.00; // Máximo valor para ESF y CIL

// Lista de errores activos
let erroresActivos = [];

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

    // Crear los span de advertencia dinámicamente
    crearAdvertencias();

    // Agregar eventos a los inputs
    const inputs = document.querySelectorAll('.vista-previa input');
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
}

// Función para crear los span de advertencia dinámicamente
function crearAdvertencias() {
    // Crear contenedores para las advertencias
    const contenedorLejos = document.createElement('div');
    contenedorLejos.id = 'advertencias-lejos';
    contenedorLejos.style.marginTop = '10px';

    const contenedorAdd = document.createElement('div');
    contenedorAdd.id = 'advertencias-add';
    contenedorAdd.style.marginTop = '10px';

    // Crear span para advertencia de EJE faltante (OD y OI)
    const advertenciaEjeOD = document.createElement('span');
    advertenciaEjeOD.id = 'advertencia-eje-od';
    advertenciaEjeOD.textContent = '*Falta el Eje del OD';
    advertenciaEjeOD.classList.add('advertenciaReceta'); // Agregar clase
    advertenciaEjeOD.style.display = 'none';

    const advertenciaEjeOI = document.createElement('span');
    advertenciaEjeOI.id = 'advertencia-eje-oi';
    advertenciaEjeOI.textContent = '*Falta el Eje del OI';
    advertenciaEjeOI.classList.add('advertenciaReceta'); // Agregar clase
    advertenciaEjeOI.style.display = 'none';

    // Crear span para advertencia de ESF/CIL fuera de rango
    const advertenciaMaxEsfCil = document.createElement('span');
    advertenciaMaxEsfCil.id = 'advertencia-max-esf-cil';
    advertenciaMaxEsfCil.textContent = '*Consultar con el laboratorio.';
    advertenciaMaxEsfCil.classList.add('advertenciaReceta'); // Agregar clase
    advertenciaMaxEsfCil.style.display = 'none';

    // Crear span para advertencia de ADD diferente
    const advertenciaAddDiferente = document.createElement('span');
    advertenciaAddDiferente.id = 'advertencia-add-diferente';
    advertenciaAddDiferente.textContent = '*Hay una ADD diferente establecida para cada ojo';
    advertenciaAddDiferente.classList.add('advertenciaReceta'); // Agregar clase
    advertenciaAddDiferente.style.display = 'none';

    // Agregar los span a los contenedores
    contenedorLejos.appendChild(advertenciaEjeOD);
    contenedorLejos.appendChild(advertenciaEjeOI);
    contenedorLejos.appendChild(advertenciaMaxEsfCil);

    contenedorAdd.appendChild(advertenciaAddDiferente);

    // Insertar los contenedores debajo de las tablas correspondientes
    const seccionLejos = document.getElementById('seccion-lejos');
    if (seccionLejos) {
        seccionLejos.insertAdjacentElement('afterend', contenedorLejos);
    }

    const seccionAdd = document.getElementById('seccion-add');
    if (seccionAdd) {
        seccionAdd.insertAdjacentElement('afterend', contenedorAdd);
    }
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

        // Calcular y actualizar la parte de "cerca" cuando se modifica ADD
        if (value !== '') {
            if (id.includes('od')) {
                calcularCercaOD();
            } else if (id.includes('oi')) {
                calcularCercaOI();
            }
        }

        // Mostrar advertencia si las ADD son diferentes
        mostrarAdvertenciaAddDiferente();
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

        // Mostrar advertencia si falta el EJE y hay CIL
        mostrarAdvertenciaEjeFaltante();
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

        // Calcular y actualizar la parte de "cerca" cuando se modifica ADD
        if (value !== '') {
            if (id.includes('od')) {
                calcularCercaOD();
            } else if (id.includes('oi')) {
                calcularCercaOI();
            }
        }

        // Mostrar advertencia si las ADD son diferentes
        mostrarAdvertenciaAddDiferente();
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

        // Mostrar advertencia si el valor es mayor a MAX_ESF_CIL
        const valorNumerico = parseFloat(valorAjustado);
        mostrarAdvertenciaMaxEsfCil(valorNumerico, id);
    }
}

// Función para mostrar advertencia si falta el EJE y hay CIL
function mostrarAdvertenciaEjeFaltante() {
    const cilOD = document.getElementById('od-lejos-cil').value.trim();
    const ejeOD = document.getElementById('od-lejos-eje').value.trim();
    const cilOI = document.getElementById('oi-lejos-cil').value.trim();
    const ejeOI = document.getElementById('oi-lejos-eje').value.trim();

    const advertenciaEjeOD = document.getElementById('advertencia-eje-od');
    const advertenciaEjeOI = document.getElementById('advertencia-eje-oi');

    if (advertenciaEjeOD) {
        if (cilOD !== '' && ejeOD === '') {
            advertenciaEjeOD.style.display = 'block';
        } else {
            advertenciaEjeOD.style.display = 'none';
        }
    }

    if (advertenciaEjeOI) {
        if (cilOI !== '' && ejeOI === '') {
            advertenciaEjeOI.style.display = 'block';
        } else {
            advertenciaEjeOI.style.display = 'none';
        }
    }
}

// Función para mostrar advertencia si las ADD son diferentes
function mostrarAdvertenciaAddDiferente() {
    const addOD = parseFloat(document.getElementById('add-od').value) || 0;
    const addOI = parseFloat(document.getElementById('add-oi').value) || 0;

    const advertenciaAddDiferente = document.getElementById('advertencia-add-diferente');
    if (advertenciaAddDiferente) {
        if (addOD !== addOI) {
            advertenciaAddDiferente.style.display = 'block';
        } else {
            advertenciaAddDiferente.style.display = 'none';
        }
    }
}

// Función para mostrar advertencia si el valor de ESF o CIL supera MAX_ESF_CIL
function mostrarAdvertenciaMaxEsfCil(valorNumerico, id) {
    const advertenciaMaxEsfCil = document.getElementById('advertencia-max-esf-cil');
    if (advertenciaMaxEsfCil) {
        if (valorNumerico > MAX_ESF_CIL || valorNumerico < -MAX_ESF_CIL) {
            advertenciaMaxEsfCil.textContent = `*${id.includes('esf') ? 'ESF' : 'CIL'} demasiado alto. Consultar con el laboratorio.`;
            advertenciaMaxEsfCil.style.display = 'block';
        } else {
            advertenciaMaxEsfCil.style.display = 'none';
        }
    }
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

// Función para calcular y actualizar ADD basada en la diferencia entre "lejos" y "cerca" (OD)
function calcularAddOD() {
    // Obtener los valores de ESF de "lejos" y "cerca" para OD
    const esfLejosOD = parseFloat(document.getElementById('od-lejos-esf').value) || 0;
    const esfCercaOD = parseFloat(document.getElementById('od-cerca-esf').value) || 0;

    // Calcular ADD como la diferencia entre "cerca" y "lejos" para OD
    let addOD = esfCercaOD - esfLejosOD;

    // Asegurar que ADD no supere MAX_ADD
    if (addOD > MAX_ADD) {
        addOD = MAX_ADD;
        // Recalcular la parte de "cerca" con el valor máximo de ADD
        const esfCercaODAjustado = ajustarValorAPasos((esfLejosOD + addOD).toString());
        document.getElementById('od-cerca-esf').value = esfCercaODAjustado;
    }

    // Ajustar el valor de ADD a pasos de 0.25
    const addODAjustado = ajustarValorAPasos(addOD.toString());

    // Actualizar el campo de ADD para OD
    document.getElementById('add-od').value = addODAjustado;
}

// Función para calcular y actualizar ADD basada en la diferencia entre "lejos" y "cerca" (OI)
function calcularAddOI() {
    // Obtener los valores de ESF de "lejos" y "cerca" para OI
    const esfLejosOI = parseFloat(document.getElementById('oi-lejos-esf').value) || 0;
    const esfCercaOI = parseFloat(document.getElementById('oi-cerca-esf').value) || 0;

    // Calcular ADD como la diferencia entre "cerca" y "lejos" para OI
    let addOI = esfCercaOI - esfLejosOI;

    // Asegurar que ADD no supere MAX_ADD
    if (addOI > MAX_ADD) {
        addOI = MAX_ADD;
        // Recalcular la parte de "cerca" con el valor máximo de ADD
        const esfCercaOIAjustado = ajustarValorAPasos((esfLejosOI + addOI).toString());
        document.getElementById('oi-cerca-esf').value = esfCercaOIAjustado;
    }

    // Ajustar el valor de ADD a pasos de 0.25
    const addOIAjustado = ajustarValorAPasos(addOI.toString());

    // Actualizar el campo de ADD para OI
    document.getElementById('add-oi').value = addOIAjustado;
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

    // Si se modifica "cerca", actualizar ADD
    if (id.includes('cerca-esf') && input.value !== '') {
        if (id.includes('od')) {
            calcularAddOD();
        } else if (id.includes('oi')) {
            calcularAddOI();
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

    // Sincronizar el eje de "cerca" con "lejos" si se modifica "cerca"
    if (id.includes('cerca-eje')) {
        if (id.includes('od')) {
            document.getElementById('od-lejos-eje').value = input.value;
        } else if (id.includes('oi')) {
            document.getElementById('oi-lejos-eje').value = input.value;
        }
    }
}

// Función para agregar eventos de sincronización
function agregarEventosSincronizacion() {
    const inputsLejos = document.querySelectorAll('.seccion-lejos input');
    const inputsCerca = document.querySelectorAll('.seccion-cerca input');
    const inputsAdd = document.querySelectorAll('.seccion-add input');

    inputsLejos.forEach(input => {
        input.addEventListener('input', sincronizarCambios);
    });

    inputsCerca.forEach(input => {
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