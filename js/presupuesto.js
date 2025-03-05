// presupuesto.js

// Función para inicializar la sección de presupuesto
export async function initPresupuesto() {
    console.log('Inicializando Presupuesto...');

    // Seleccionar todos los inputs de la sección "lejos"
    const inputsLejos = document.querySelectorAll('.seccion-lejos input');

    // Seleccionar todos los inputs de la sección "ADD"
    const inputsAdd = document.querySelectorAll('.seccion-add input');

    // Seleccionar todos los inputs de la sección "cerca"
    const inputsCerca = document.querySelectorAll('.seccion-cerca input');

    // Función para validar y formatear ESF y CIL
    function validarYFormatearESFCIL(input) {
        let valor = input.value.trim();

        // Si el valor está vacío, no hacer nada
        if (valor === '') return;

        // Verificar si el valor es un número válido
        if (!/^-?\d+(\.\d{1,2})?$/.test(valor)) {
            alert('Valor no válido para ESF/CIL. Debe ser un número en pasos de 0.25.');
            input.value = '';
            return;
        }

        // Convertir a número
        let numero = parseFloat(valor);

        // Verificar si el número es un múltiplo de 0.25
        if (Math.abs(numero * 100) % 25 !== 0) {
            alert('Valor no válido para ESF/CIL. Debe ser un múltiplo de 0.25.');
            input.value = '';
            return;
        }

        // Formatear el número a dos decimales
        input.value = numero >= 0 ? `+${numero.toFixed(2)}` : `${numero.toFixed(2)}`;
    }

    // Función para validar EJE
    function validarEJE(input) {
        let valor = input.value.trim();

        // Si el valor está vacío, no hacer nada
        if (valor === '') return;

        // Verificar si el valor es un número entero entre 0 y 180
        if (!/^\d+$/.test(valor) || parseInt(valor) < 0 || parseInt(valor) > 180) {
            alert('Valor no válido para EJE. Debe ser un número entero entre 0 y 180.');
            input.value = '';
            return;
        }

        // Formatear el número a dos decimales (aunque siempre será entero)
        input.value = parseInt(valor).toFixed(2);
    }

    // Función para validar y formatear ADD
    function validarYFormatearADD(input) {
        let valor = input.value.trim();

        // Si el valor está vacío, no hacer nada
        if (valor === '') return;

        // Verificar si el valor es un número positivo
        if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
            alert('Valor no válido para ADD. Debe ser un número positivo.');
            input.value = '';
            return;
        }

        // Convertir a número
        let numero = parseFloat(valor);

        // Verificar si el número es un múltiplo de 0.25
        if (Math.abs(numero * 100) % 25 !== 0) {
            alert('Valor no válido para ADD. Debe ser un múltiplo de 0.25.');
            input.value = '';
            return;
        }

        // Formatear el número a dos decimales
        input.value = `+${numero.toFixed(2)}`;
    }

    // Función para calcular y autocompletar la sección "cerca"
    function calcularCerca() {
        const esfLejosOD = document.querySelector('.seccion-lejos tr:nth-child(1) td:nth-child(2) input').value;
        const esfLejosOI = document.querySelector('.seccion-lejos tr:nth-child(2) td:nth-child(2) input').value;
        const addOD = document.querySelector('.seccion-add tr td:nth-child(2) input').value;
        const addOI = document.querySelector('.seccion-add tr td:nth-child(4) input').value;

        const cilLejosOD = document.querySelector('.seccion-lejos tr:nth-child(1) td:nth-child(3) input').value;
        const cilLejosOI = document.querySelector('.seccion-lejos tr:nth-child(2) td:nth-child(3) input').value;
        const ejeLejosOD = document.querySelector('.seccion-lejos tr:nth-child(1) td:nth-child(4) input').value;
        const ejeLejosOI = document.querySelector('.seccion-lejos tr:nth-child(2) td:nth-child(4) input').value;

        // Calcular ESF para cerca
        const esfCercaOD = parseFloat(esfLejosOD) + parseFloat(addOD);
        const esfCercaOI = parseFloat(esfLejosOI) + parseFloat(addOI);

        // Autocompletar cerca
        document.querySelector('.seccion-cerca tr:nth-child(1) td:nth-child(2) input').value = esfCercaOD.toFixed(2);
        document.querySelector('.seccion-cerca tr:nth-child(2) td:nth-child(2) input').value = esfCercaOI.toFixed(2);

        // Copiar CIL y EJE de lejos a cerca
        document.querySelector('.seccion-cerca tr:nth-child(1) td:nth-child(3) input').value = cilLejosOD;
        document.querySelector('.seccion-cerca tr:nth-child(2) td:nth-child(3) input').value = cilLejosOI;
        document.querySelector('.seccion-cerca tr:nth-child(1) td:nth-child(4) input').value = ejeLejosOD;
        document.querySelector('.seccion-cerca tr:nth-child(2) td:nth-child(4) input').value = ejeLejosOI;
    }

    // Añadir event listeners a los inputs de "lejos"
    inputsLejos.forEach(input => {
        input.addEventListener('blur', () => {
            const columna = input.parentElement.cellIndex;

            if (columna === 2 || columna === 3) {
                validarYFormatearESFCIL(input);
            } else if (columna === 4) {
                validarEJE(input);
            }
        });
    });

    // Añadir event listeners a los inputs de "ADD"
    inputsAdd.forEach(input => {
        input.addEventListener('blur', () => {
            validarYFormatearADD(input);
            calcularCerca();
        });
    });

    // Añadir event listeners a los inputs de "cerca" (solo para ESF)
    inputsCerca.forEach(input => {
        if (input.parentElement.cellIndex === 2) {
            input.addEventListener('blur', () => {
                calcularCerca();
            });
        }
    });
}