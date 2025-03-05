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
    console.log(`Saliendo del input con ID: ${input.id}, Valor: ${value}`);

    // Solo aplicar corrección a ESF y CIL
    if (esEsfOCil(input.id)) {
        if (value === '' || value === '+' || value === '-') {
            input.value = ''; // Limpiar si solo hay un signo
            return;
        }

        // Ajustar el valor a pasos de 0.25
        const valorAjustado = ajustarValorAPasos(value);
        input.value = valorAjustado;
        input.placeholder = ''; // Limpiar el placeholder al salir

        console.log(`Valor ajustado a: ${valorAjustado}`);
    }
}

// Función para verificar si el input es ESF o CIL
function esEsfOCil(id) {
    return id.includes('esf') || id.includes('cil');
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});