// presupuesto.js
// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

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

        // Asegurar que el valor esté en el rango de 0 a 3.25
        const valorNumerico = parseFloat(value);
        if (valorNumerico < 0 || valorNumerico > 3.25) {
            console.error(`Error: El valor en ${id} debe estar entre 0 y 3.25.`);
            input.value = value.slice(0, -1); // Eliminar el último carácter no válido
            return;
        }

        // Mostrar sugerencia en el placeholder mientras se escribe
        const valorAjustado = ajustarValorAPasos(value);
        input.placeholder = `Sugerencia: ${valorAjustado}`;

        // Calcular y actualizar la parte de "cerca" cuando se modifica ADD
        if (value !== '') {
            calcularCerca();
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

        // Mostrar sugerencia en el placeholder mientras se escribe
        if (esEsfOCil(input.id)) {
            const valorAjustado = ajustarValorAPasos(value);
            input.placeholder = `Sugerencia: ${valorAjustado}`;
        }
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
            input.value = '0'; // Si está vacío, poner 0
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
            // Asegurar que el valor esté en el rango de 0 a 3.25
            const valorNumerico = parseFloat(value);
            if (valorNumerico < 0) {
                input.value = '0.00';
            } else if (valorNumerico > 3.25) {
                input.value = '3.25';
            } else {
                // Ajustar el valor a pasos de 0.25
                const valorAjustado = ajustarValorAPasos(value);
                input.value = valorAjustado;
            }
        }

        // Calcular y actualizar la parte de "cerca" cuando se modifica ADD
        if (value !== '') {
            calcularCerca();
        }
    }
    // Validación para ESF y CIL
    else if (esEsfOCil(id)) {
        if (value === '' || value === '+' || value === '-') {
            input.value = '+0.00'; // Si está vacío o solo tiene un signo, poner +0.00
            return;
        }

        // Asegurar que el valor tenga un signo
        let valorAjustado = ajustarValorAPasos(value);
        if (!valorAjustado.startsWith('+') && !valorAjustado.startsWith('-')) {
            valorAjustado = `+${valorAjustado}`;
        }

        input.value = valorAjustado;
        input.placeholder = ''; // Limpiar el placeholder al salir

        console.log(`Valor ajustado a: ${valorAjustado}`);
    }
}

// Función para calcular y actualizar la parte de "cerca" basada en ADD
function calcularCerca() {
    // Obtener los valores de ESF de "lejos" y ADD
    const esfLejosOD = parseFloat(document.getElementById('od-lejos-esf').value) || 0;
    const esfLejosOI = parseFloat(document.getElementById('oi-lejos-esf').value) || 0;
    const addOD = parseFloat(document.getElementById('add-od').value) || 0;
    const addOI = parseFloat(document.getElementById('add-oi').value) || 0;

    // Calcular los valores de ESF para "cerca"
    const esfCercaOD = esfLejosOD + addOD;
    const esfCercaOI = esfLejosOI + addOI;

    // Ajustar los valores a pasos de 0.25
    const esfCercaODAjustado = ajustarValorAPasos(esfCercaOD.toString());
    const esfCercaOIAjustado = ajustarValorAPasos(esfCercaOI.toString());

    // Actualizar los campos de ESF en "cerca"
    document.getElementById('od-cerca-esf').value = esfCercaODAjustado;
    document.getElementById('oi-cerca-esf').value = esfCercaOIAjustado;

    // Copiar el cilindro y el eje de "lejos" a "cerca"
    document.getElementById('od-cerca-cil').value = document.getElementById('od-lejos-cil').value;
    document.getElementById('oi-cerca-cil').value = document.getElementById('oi-lejos-cil').value;
    document.getElementById('od-cerca-eje').value = document.getElementById('od-lejos-eje').value;
    document.getElementById('oi-cerca-eje').value = document.getElementById('oi-lejos-eje').value;
}

// Función para calcular y actualizar ADD basada en la diferencia entre "lejos" y "cerca"
function calcularAdd() {
    // Obtener los valores de ESF de "lejos" y "cerca"
    const esfLejosOD = parseFloat(document.getElementById('od-lejos-esf').value) || 0;
    const esfLejosOI = parseFloat(document.getElementById('oi-lejos-esf').value) || 0;
    const esfCercaOD = parseFloat(document.getElementById('od-cerca-esf').value) || 0;
    const esfCercaOI = parseFloat(document.getElementById('oi-cerca-esf').value) || 0;

    // Calcular ADD como la diferencia entre "cerca" y "lejos"
    const addOD = esfCercaOD - esfLejosOD;
    const addOI = esfCercaOI - esfLejosOI;

    // Ajustar los valores de ADD a pasos de 0.25
    const addODAjustado = ajustarValorAPasos(addOD.toString());
    const addOIAjustado = ajustarValorAPasos(addOI.toString());

    // Actualizar los campos de ADD
    document.getElementById('add-od').value = addODAjustado;
    document.getElementById('add-oi').value = addOIAjustado;
}

// Función para sincronizar cambios entre "lejos", "cerca" y ADD
function sincronizarCambios() {
    const input = event.target;
    const id = input.id;

    // Si se modifica ADD, actualizar "cerca"
    if (id.includes('add') && input.value !== '') {
        calcularCerca();
    }

    // Si se modifica "cerca", actualizar ADD
    if (id.includes('cerca-esf') && input.value !== '') {
        calcularAdd();
    }

    // Si se modifica "lejos", no hacer nada a menos que ADD esté presente
    if (id.includes('lejos-esf')) {
        const addOD = parseFloat(document.getElementById('add-od').value) || 0;
        const addOI = parseFloat(document.getElementById('add-oi').value) || 0;
        if (addOD !== 0 || addOI !== 0) {
            calcularCerca();
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