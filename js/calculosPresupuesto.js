// calculosPresupuesto.js

// Función para manejar el clic en un producto de la lista
export function manejarSeleccionProducto() {
    const tbody = document.querySelector('#productTable tbody');
    if (tbody) {
        tbody.addEventListener('click', (event) => {
            const filaSeleccionada = event.target.closest('tr');
            if (filaSeleccionada && filaSeleccionada.parentElement === tbody) {
                // Si la fila ya está seleccionada, deseleccionarla y borrar los campos
                if (filaSeleccionada.classList.contains('selected')) {
                    filaSeleccionada.classList.remove('selected');
                    limpiarCamposProductoSeleccionado();
                } else {
                    // Deseleccionar todas las filas
                    tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                    // Seleccionar la fila clickeada
                    filaSeleccionada.classList.add('selected');
                    // Rellenar los campos del producto seleccionado
                    rellenarCamposProductoSeleccionado(filaSeleccionada);
                }
            }
        });
    }
}

// Función para rellenar los campos del producto seleccionado
function rellenarCamposProductoSeleccionado(fila) {
    const celdas = fila.querySelectorAll('td');
    const nombreProducto = celdas[0].textContent;
    const tratamientos = celdas[8].textContent;
    const precioBase = celdas[7].textContent.replace('$', '').trim();

    // Rellenar los campos del producto seleccionado
    document.getElementById('producto-nombre').value = nombreProducto;
    document.getElementById('producto-tratamientos').value = tratamientos;
    document.getElementById('producto-precio-base').value = precioBase;

    // Valores por defecto
    document.getElementById('producto-armado').value = 350;
    document.getElementById('producto-iva').value = 22;
    document.getElementById('producto-multiplicador').value = 2.5;
    document.getElementById('producto-armazon').value = 0;

    // Calcular el precio de los cristales y el precio final
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

    document.getElementById('Precio-Cristales').value = precioCristales.toFixed(2);
}

// Función para calcular el precio final
function calcularPrecioFinal() {
    const precioCristales = parseFloat(document.getElementById('Precio-Cristales').value) || 0;
    const precioArmazon = parseFloat(document.getElementById('producto-armazon').value) || 0;

    const precioFinal = precioCristales + precioArmazon;
    document.getElementById('producto-precio-final').value = precioFinal.toFixed(2);
}

// Agregar eventos para recalcular los precios cuando cambian los valores
export function agregarEventosCalculo() {
    const inputsCalculo = document.querySelectorAll('#productoSeleccionadoTable input');
    inputsCalculo.forEach(input => {
        input.addEventListener('input', () => {
            calcularPrecioCristales();
            calcularPrecioFinal();
        });
    });
}

// Inicializar el módulo
export function initCalculosPresupuesto() {
    manejarSeleccionProducto();
    agregarEventosCalculo();
}