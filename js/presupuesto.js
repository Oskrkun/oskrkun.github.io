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
        calcularCerca();
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
            input.value = '0.00'; // Si está vacío, poner 0.00
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
        calcularCerca();
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

// Función para calcular y actualizar la parte de "cerca"
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
}

// Función para verificar si el input es ESF o CIL
function esEsfOCil(id) {
    return id.includes('esf') || id.includes('cil');
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});