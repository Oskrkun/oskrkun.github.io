// presupuesto.js

// Función para inicializar la sección de presupuesto
export async function initPresupuesto() {
    console.log('Inicializando Presupuesto...');

    // Agregar placeholders a todos los inputs
    agregarPlaceholders();

    // Agregar event listeners para los inputs
    agregarEventListeners();

    // Ejemplo de cómo podrías cargar datos de presupuestos
    await cargarPresupuestos();
}

// Función para agregar placeholders a todos los inputs
function agregarPlaceholders() {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.placeholder = '+0.00';
    });
}

// Función para agregar event listeners a los inputs
function agregarEventListeners() {
    const inputsLejos = document.querySelectorAll('.seccion-lejos input[type="text"]');
    const inputsCerca = document.querySelectorAll('.seccion-cerca input[type="text"]');
    const inputsAdd = document.querySelectorAll('.seccion-add input[type="text"]');

    // Event listeners para los inputs de "lejos"
    inputsLejos.forEach(input => {
        input.addEventListener('input', () => {
            formatearNumero(input);
            validarEje(input);
        });
    });

    // Event listeners para los inputs de "cerca"
    inputsCerca.forEach(input => {
        input.addEventListener('input', () => {
            formatearNumero(input);
            validarEje(input);
            actualizarAddDesdeCerca(input);
        });
    });

    // Event listeners para los inputs de "ADD"
    inputsAdd.forEach(input => {
        input.addEventListener('input', () => {
            formatearNumero(input);
            actualizarCercaDesdeAdd(input);
        });
    });
}

// Función para formatear el número en pasos de 0.25
function formatearNumero(input) {
    let valor = parseFloat(input.value);
    if (!isNaN(valor)) {
        valor = Math.round(valor / 0.25) * 0.25; // Redondear al múltiplo de 0.25 más cercano
        input.value = (valor >= 0 ? '+' : '') + valor.toFixed(2); // Formatear a +X.XX o -X.XX
    }
}

// Función para validar el eje (debe estar entre 0 y 180)
function validarEje(input) {
    if (input.parentElement.classList.contains('eje')) {
        let valor = parseFloat(input.value);
        if (valor < 0) {
            input.value = '0';
        } else if (valor > 180) {
            input.value = '180';
        }
    }
}

// Función para actualizar la parte de "cerca" cuando se introduce el ADD
function actualizarCercaDesdeAdd(input) {
    const fila = input.closest('tr');
    const addOD = parseFloat(fila.querySelector('input').value);
    const addOI = parseFloat(fila.querySelectorAll('input')[1].value);

    const lejosOD = parseFloat(document.querySelector('.seccion-lejos input').value);
    const lejosOI = parseFloat(document.querySelectorAll('.seccion-lejos input')[1].value);

    if (!isNaN(addOD)) {
        const cercaOD = lejosOD + addOD;
        document.querySelector('.seccion-cerca input').value = (cercaOD >= 0 ? '+' : '') + cercaOD.toFixed(2);
    }

    if (!isNaN(addOI)) {
        const cercaOI = lejosOI + addOI;
        document.querySelectorAll('.seccion-cerca input')[1].value = (cercaOI >= 0 ? '+' : '') + cercaOI.toFixed(2);
    }
}

// Función para actualizar el ADD cuando se introduce la parte de "cerca"
function actualizarAddDesdeCerca(input) {
    const fila = input.closest('tr');
    const cercaOD = parseFloat(fila.querySelector('input').value);
    const cercaOI = parseFloat(fila.querySelectorAll('input')[1].value);

    const lejosOD = parseFloat(document.querySelector('.seccion-lejos input').value);
    const lejosOI = parseFloat(document.querySelectorAll('.seccion-lejos input')[1].value);

    if (!isNaN(cercaOD)) {
        const addOD = cercaOD - lejosOD;
        document.querySelector('.seccion-add input').value = (addOD >= 0 ? '+' : '') + addOD.toFixed(2);
    }

    if (!isNaN(cercaOI)) {
        const addOI = cercaOI - lejosOI;
        document.querySelectorAll('.seccion-add input')[1].value = (addOI >= 0 ? '+' : '') + addOI.toFixed(2);
    }
}

// Función para cargar presupuestos (ejemplo)
async function cargarPresupuestos() {
    console.log('Cargando presupuestos...');
    // Aquí podrías hacer una llamada a una API o base de datos para obtener los presupuestos.
    // Por ahora, solo mostramos un mensaje en la consola.
}