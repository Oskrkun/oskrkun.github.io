// Función para validar los inputs
export function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    // Si el input está vacío, no hay necesidad de validar más
    if (value === '') {
        return true; // Considerar vacío como válido
    }

    let esValido = false;

    // Resto de la lógica de validación...
    if (id.includes('eje')) {
        esValido = validarEje(input, value);
    } else if (id.includes('add')) {
        esValido = validarADD(input, value);
    } else {
        esValido = validarEsfOCil(input, value, id);
    }

    // Si el valor es válido, ajustar el valor a pasos de 0.25 (solo para ESF, CIL y ADD)
    if (esValido && !id.includes('eje')) {
        const valorAjustado = ajustarValorAPasos(value);
        input.value = valorAjustado; // Actualizar el valor del input con el valor ajustado
    }

    return esValido;
}

// Función para validar el EJE
function validarEje(input, value) {
    // Solo permitir números enteros entre 0 y 180
    if (!/^\d*$/.test(value)) {
        console.error(`Error: El valor en ${input.id} no es válido. Solo se permiten números.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return false;
    }

    // Asegurar que el valor esté en el rango de 0 a 180
    const valorNumerico = parseInt(value, 10);
    if (valorNumerico < 0 || valorNumerico > 180) {
        console.error(`Error: El valor en ${input.id} debe estar entre 0 y 180.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return false;
    }

    return true;
}

// Función para validar ADD
function validarADD(input, value) {
    // Solo permitir números positivos y punto decimal
    if (!/^\d*\.?\d*$/.test(value)) {
        console.error(`Error: El valor en ${input.id} no es válido. Solo se permiten números positivos y punto decimal.`);
        input.value = value.slice(0, -1); // Eliminar el último carácter no válido
        return false;
    }

    return true;
}

// Función para validar ESF y CIL
function validarEsfOCil(input, value, id) {
    // Validar el formato del valor
    if (!/^[+-]?\d*\.?\d*$/.test(value)) {
        console.error(`Error: El valor en ${id} no es válido. Solo se permiten números, +, - y punto decimal.`);
        input.value = value.slice(0, -1);
        return false;
    }

    // Validar que no haya más de 2 cifras enteras
    const partes = value.split('.');
    const parteEntera = partes[0].replace(/[+-]/, ''); // Ignorar el signo
    if (parteEntera.length > 2) {
        console.error(`Error: El valor en ${id} no puede tener más de 2 cifras enteras.`);
        input.value = value.slice(0, -1);
        return false;
    }

    // Validar el valor numérico
    const valorNumerico = parseFloat(value);
    return true;
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