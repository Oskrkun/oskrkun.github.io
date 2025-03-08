// calculosPresupuesto.js

// Función para manejar el clic en una fila de la tabla de productos
export function manejarSeleccionProducto() {
    console.log('Iniciando manejarSeleccionProducto...');
    const tbody = document.querySelector('#productTable tbody');
    if (tbody) {
        tbody.addEventListener('click', (event) => {
            console.log('Clic detectado en la tabla de productos.');
            const filaSeleccionada = event.target.closest('tr');
            if (filaSeleccionada) {
                console.log('Fila seleccionada:', filaSeleccionada);

                // Verificar si la fila ya está seleccionada
                const yaSeleccionada = filaSeleccionada.classList.contains('selected');

                // Deseleccionar todas las filas primero
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));

                // Si la fila no estaba seleccionada, seleccionarla
                if (!yaSeleccionada) {
                    console.log('Seleccionando la fila clickeada...');
                    filaSeleccionada.classList.add('selected');
                    rellenarCamposProductoSeleccionado(filaSeleccionada);
                } else {
                    console.log('Deseleccionando la fila y limpiando campos...');
                    limpiarCamposProductoSeleccionado();
                }
            } else {
                console.log('No se encontró una fila válida.');
            }
        });
    } else {
        console.error('No se encontró el tbody de la tabla de productos.');
    }
}

// Función para rellenar los campos del producto seleccionado
function rellenarCamposProductoSeleccionado(fila) {
    console.log('Rellenando campos del producto seleccionado...');
    const nombre = fila.cells[0].textContent;
    const tratamientos = fila.cells[8].textContent;
    const precio = fila.cells[7].textContent.replace('$', '').trim();

    console.log('Nombre del producto:', nombre);
    console.log('Tratamientos:', tratamientos);
    console.log('Precio:', precio);

    document.getElementById('producto-nombre').value = nombre;
    document.getElementById('producto-tratamientos').value = tratamientos;
    document.getElementById('producto-precio-base').value = precio;
    document.getElementById('producto-armado').value = '350';
    document.getElementById('producto-iva').value = '22';
    document.getElementById('producto-multiplicador').value = '2.5';
    document.getElementById('producto-armazon').value = '$0';

    console.log('Calculando precio de los cristales...');
    calcularPrecioCristales();
    console.log('Calculando precio final...');
    calcularPrecioFinal();
}

// Función para limpiar los campos del producto seleccionado
function limpiarCamposProductoSeleccionado() {
    console.log('Limpiando campos del producto seleccionado...');
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
    console.log('Calculando precio de los cristales...');
    const precioBase = parseFloat(document.getElementById('producto-precio-base').value) || 0;
    const armado = parseFloat(document.getElementById('producto-armado').value) || 0;
    const iva = parseFloat(document.getElementById('producto-iva').value) || 0;
    const multiplicador = parseFloat(document.getElementById('producto-multiplicador').value) || 2.5;

    console.log('Precio base:', precioBase);
    console.log('Armado:', armado);
    console.log('IVA:', iva);
    console.log('Multiplicador:', multiplicador);

    const precioConArmado = precioBase + armado;
    const precioConIva = precioConArmado * (1 + iva / 100);
    const precioCristales = precioConIva * multiplicador;

    console.log('Precio de los cristales:', precioCristales);
    document.getElementById('Precio-Cristales').value = `$${precioCristales.toFixed(2)}`;
}

// Función para calcular el precio final
function calcularPrecioFinal() {
    console.log('Calculando precio final...');
    const precioCristales = parseFloat(document.getElementById('Precio-Cristales').value.replace('$', '')) || 0;
    const precioArmazon = parseFloat(document.getElementById('producto-armazon').value.replace('$', '')) || 0;

    console.log('Precio de los cristales:', precioCristales);
    console.log('Precio del armazón:', precioArmazon);

    const precioFinal = precioCristales + precioArmazon;
    console.log('Precio final:', precioFinal);
    document.getElementById('producto-precio-final').value = `$${precioFinal.toFixed(2)}`;
}

// Función para agregar eventos a los campos editables
export function agregarEventosCalculos() {
    console.log('Agregando eventos a los campos editables...');
    const camposEditables = ['producto-armado', 'producto-iva', 'producto-multiplicador', 'producto-armazon'];
    camposEditables.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', () => {
                console.log(`Campo ${id} modificado.`);
                calcularPrecioCristales();
                calcularPrecioFinal();
            });
        } else {
            console.error(`No se encontró el campo con ID: ${id}`);
        }
    });
}

// Función para deshabilitar el clic en celdas deshabilitadas
export function deshabilitarClicEnCeldasDeshabilitadas() {
    console.log('Deshabilitando clic en celdas deshabilitadas...');
    const celdasDeshabilitadas = document.querySelectorAll('#productoSeleccionadoTable input[readonly]');
    celdasDeshabilitadas.forEach(celda => {
        celda.addEventListener('click', (event) => {
            console.log('Clic en celda deshabilitada detectado.');
            event.preventDefault();
            event.stopPropagation();
        });
    });
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado, inicializando...');
    manejarSeleccionProducto();
    agregarEventosCalculos();
    deshabilitarClicEnCeldasDeshabilitadas();
});