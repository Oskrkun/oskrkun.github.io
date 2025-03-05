// presupuesto.js

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

    // Agregar eventos a los inputs
    const inputs = document.querySelectorAll('.vista-previa input');
    inputs.forEach(input => {
        input.addEventListener('input', validarInput);
    });

    console.log('Eventos agregados a los inputs.');
}

// Función para validar los inputs
function validarInput(event) {
    const input = event.target;
    const value = input.value.trim();
    const id = input.id;

    console.log(`Validando input con ID: ${id}, Valor: ${value}`);

    // Validar que el valor sea un número válido
    if (isNaN(value) || value === '') {
        console.error(`Error: El valor en ${id} no es un número válido.`);
        alert(`Error: El valor en ${id} no es un número válido.`);
        input.value = ''; // Limpiar el input si no es válido
        return;
    }

    // Aquí puedes agregar más validaciones específicas si es necesario
    console.log(`Input ${id} validado correctamente.`);
}

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});