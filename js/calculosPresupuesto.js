// calculosPresupuesto.js

// Función para manejar el clic en una fila de la tabla de productos
export function manejarSeleccionProducto() {
    const tbody = document.querySelector('#productTable tbody');
    if (tbody) {
        tbody.addEventListener('click', (event) => {
            const filaSeleccionada = event.target.closest('tr');
            if (filaSeleccionada && !filaSeleccionada.classList.contains('selected')) {
                // Deseleccionar todas las filas
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                // Seleccionar la fila clickeada
                filaSeleccionada.classList.add('selected');
                // Rellenar los campos del producto seleccionado
                rellenarCamposProductoSeleccionado(filaSeleccionada);
            } else if (filaSeleccionada && filaSeleccionada.classList.contains('selected')) {
                // Deseleccionar la fila y limpiar los campos
                filaSeleccionada.classList.remove('selected');
                limpiarCamposProductoSeleccionado();
            }
        });
    }
}

// Función para rellenar los campos del producto seleccionado
function rellenarCamposProductoSeleccionado(fila) {
    const nombre = fila.cells[0].textContent;
    const tratamientos = fila.cells[8].textContent;
    const precio = fila.cells[7].textContent.replace('$', '').trim();

    document.getElementById('producto-nombre').value = nombre;
    document.getElementById('producto-tratamientos').value = tratamientos;
    document.getElementById('producto-precio-base').value = precio;
    document.getElementById('producto-armado').value = '350';
    document.getElementById('producto-iva').value = '22';
    document.getElementById('producto-multiplicador').value = '2.5';
    document.getElementById('producto-armazon').value = '$0';

    calcularPrecioCristales();
    calcularPrecioFinal();
}

// Función para limpiar los campos del producto seleccionado
function limpiarCamposProductoSeleccionado() {
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-tratamientos').value = '';
    document.getElementById('producto-precio-base').value = '';
    document.getElementById('producto-armado').value = '';
    document.getElementById('producto-iva').value = '';
    document.getElementById('producto-multiplicador').value = '';
    document.getElementById('Precio-Cristales').value = '';
    document.getElementById('producto-armazon').value = '';
    document.getElementById('producto-precio-final').value = '';
}

// Función para calcular el precio de los cristales
function calcularPrecioCristales() {
    const precioBase = parseFloat(document.getElementById('producto-precio-base').value) || 0;
    const armado = parseFloat(document.getElementById('producto-armado').value) || 0;
    const iva = parseFloat(document.getElementById('producto-iva').value) || 0;
    const multiplicador = parseFloat(document.getElementById('producto-multiplicador').value) || 2.5;

    const precioConArmado = precioBase + armado;
    const precioConIva = precioConArmado * (1 + iva / 100);
    const precioCristales = precioConIva * multiplicador;

    document.getElementById('Precio-Cristales').value = `$${precioCristales.toFixed(2)}`;
}

// Función para calcular el precio final
function calcularPrecioFinal() {
    const precioCristales = parseFloat(document.getElementById('Precio-Cristales').value.replace('$', '')) || 0;
    const precioArmazon = parseFloat(document.getElementById('producto-armazon').value.replace('$', '')) || 0;

    const precioFinal = precioCristales + precioArmazon;
    document.getElementById('producto-precio-final').value = `$${precioFinal.toFixed(2)}`;
}

// Función para agregar eventos a los campos editables
export function agregarEventosCalculos() {
    const camposEditables = ['producto-armado', 'producto-iva', 'producto-multiplicador', 'producto-armazon'];
    camposEditables.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', () => {
                calcularPrecioCristales();
                calcularPrecioFinal();
            });
        }
    });
}

// Función para deshabilitar el clic en celdas deshabilitadas
export function deshabilitarClicEnCeldasDeshabilitadas() {
    const celdasDeshabilitadas = document.querySelectorAll('#productoSeleccionadoTable input[readonly]');
    celdasDeshabilitadas.forEach(celda => {
        celda.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    manejarSeleccionProducto();
    agregarEventosCalculos();
    deshabilitarClicEnCeldasDeshabilitadas();
});