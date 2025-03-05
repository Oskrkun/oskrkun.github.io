// presupuesto.js

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

    // Agregar eventos a los inputs
    const inputs = document.querySelectorAll('.vista-previa input');
    inputs.forEach(input => {
        input.addEventListener('input', manejarInput);
        input.addEventListener('blur', manejarBlur); // Evento cuando el input pierde el foco
    });

    console.log('Eventos agregados a los inputs.');
}

// Función para manejar el evento input
function manejarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    console.log(`Validando input con ID: ${id}, Valor: ${value}`);

    // Si el valor no es un número válido, limpiar el input
    if (isNaN(value) {
        console.error(`Error: El valor en ${id} no es un número válido.`);
        input.value = '';
        return;
    }

    // Autocompletar el valor mientras el usuario escribe
    const valorFormateado = formatearValor(value);
    input.value = valorFormateado;

    console.log(`Input ${id} validado correctamente. Valor formateado: ${valorFormateado}`);
}

// Función para manejar el evento blur (cuando el input pierde el foco)
function manejarBlur(event) {
    const input = event.target;
    const value = input.value.trim();

    // Si el input está vacío, no hacer nada
    if (value === '') return;

    // Autocompletar el valor cuando el input pierde el foco
    const valorFormateado = formatearValor(value);
    input.value = valorFormateado;

    console.log(`Input ${input.id} completado al perder el foco. Valor formateado: ${valorFormateado}`);
}

// Función para formatear el valor según las reglas
function formatearValor(valor) {
    // Si el valor está vacío, devolver vacío
    if (valor === '') return '';

    // Convertir el valor a número
    let numero = parseFloat(valor);

    // Si no es un número válido, devolver vacío
    if (isNaN(numero)) return '';

    // Redondear a múltiplos de 0.25
    numero = Math.round(numero * 4) / 4;

    // Formatear el número con dos decimales y signo +
    return `+${numero.toFixed(2)}`;
}