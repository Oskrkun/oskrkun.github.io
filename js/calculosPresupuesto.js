// calculosPresupuesto.js

// Array con los precios de montaje
const ListaPrecioMontaje = [
    { nombre: 'Monofocal', precio: 230 },
    { nombre: 'Laboratorio', precio: 250 },
    { nombre: 'Bifocal', precio: 280 },
    { nombre: 'Progresivos', precio: 355 },
    { nombre: 'Armado Especial', precio: 560 }
];

// Función para redondear el precio a un número que termine en 90
function redondearPrecio(precio) {
    const redondeo = Math.ceil((precio + 10) / 100) * 100 - 10;
    return redondeo;
}

// Función para formatear el precio con el símbolo de moneda
function formatearPrecio(precio) {
    return `$${precio.toFixed(2)}`;
}

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

                // Deseleccionar todas las filas primero
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));

                // Seleccionar la fila clickeada
                console.log('Seleccionando la fila clickeada...');
                filaSeleccionada.classList.add('selected');
                rellenarCamposProductoSeleccionado(filaSeleccionada);
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

    // Cargar la lista desplegable de montaje
    cargarListaMontaje();

    // Inicializar el IVA, multiplicador y armazón
    document.getElementById('producto-iva').value = '22';
    document.getElementById('producto-multiplicador').value = '2.2';
    document.getElementById('producto-armazon').value = '$ 0.00';

    console.log('Calculando precio de los cristales...');
    calcularPrecioCristales();
    console.log('Calculando precio final...');
    calcularPrecioFinal();
}

// Función para cargar la lista desplegable de montaje
function cargarListaMontaje() {
    const selectMontaje = document.getElementById('producto-armado');
    selectMontaje.innerHTML = ''; // Limpiar opciones anteriores

    ListaPrecioMontaje.forEach(item => {
        const option = document.createElement('option');
        option.value = item.precio;
        option.textContent = `${item.nombre} (${formatearPrecio(item.precio)})`;
        selectMontaje.appendChild(option);
    });

    // Seleccionar el primer elemento de la lista por defecto
    selectMontaje.selectedIndex = 0;

    // Agregar evento para recalcular al cambiar el armado
    selectMontaje.addEventListener('change', () => {
        calcularPrecioCristales();
        calcularPrecioFinal();
    });
}

// Función para inicializar la tabla de producto seleccionado
export function inicializarProductoSeleccionado() {
    console.log('Inicializando la tabla de producto seleccionado...');

    // Cargar la lista desplegable de montaje
    cargarListaMontaje();

    // Inicializar los campos editables con valores por defecto
    document.getElementById('producto-iva').value = '22'; // IVA por defecto
    document.getElementById('producto-multiplicador').value = '2.2'; // Multiplicador por defecto
    document.getElementById('producto-armazon').value = '$ 0.00'; // Armazón por defecto

    // Seleccionar el primer valor de la lista de montaje
    const selectMontaje = document.getElementById('producto-armado');
    if (selectMontaje && selectMontaje.options.length > 0) {
        selectMontaje.selectedIndex = 0; // Seleccionar el primer elemento
    }

    // Calcular precios iniciales
    calcularPrecioCristales();
    calcularPrecioFinal();
}

// Función para calcular el precio de los cristales
function calcularPrecioCristales() {
    console.log('Calculando precio de los cristales...');
    const precioBase = parseFloat(document.getElementById('producto-precio-base').value) || 0;
    const armado = parseFloat(document.getElementById('producto-armado').value) || 0;
    const iva = parseFloat(document.getElementById('producto-iva').value) || 0;
    const multiplicador = parseFloat(document.getElementById('producto-multiplicador').value) || 2.2;

    console.log('Precio base:', precioBase);
    console.log('Armado:', armado);
    console.log('IVA:', iva);
    console.log('Multiplicador:', multiplicador);

    const precioConArmado = precioBase + armado;
    const precioConIva = precioConArmado * (1 + iva / 100);
    let precioCristales = precioConIva * multiplicador;

    // Verificar si el redondeo está activo
    const redondearPreciosCheckbox = document.getElementById('redondear-precios');
    if (redondearPreciosCheckbox && redondearPreciosCheckbox.checked) {
        precioCristales = redondearPrecio(precioCristales);
    }

    console.log('Precio de los cristales:', precioCristales);
    document.getElementById('Precio-Cristales').value = formatearPrecio(precioCristales);
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
    document.getElementById('producto-precio-final').value = formatearPrecio(precioFinal);
}

// Función para agregar eventos a los campos editables
export function agregarEventosCalculos() {
    console.log('Agregando eventos a los campos editables...');
    const camposEditables = ['producto-iva', 'producto-multiplicador', 'producto-armazon'];
    camposEditables.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', () => {
                console.log(`Campo ${id} modificado.`);
                calcularPrecioCristales();
                calcularPrecioFinal();
            });
            campo.addEventListener('blur', () => {
                if (campo.value && !isNaN(campo.value)) {
                    campo.value = formatearPrecio(parseFloat(campo.value));
                }
            });
        } else {
            console.error(`No se encontró el campo con ID: ${id}`);
        }
    });

    // Agregar evento al checkbox de redondeo
    const redondearPreciosCheckbox = document.getElementById('redondear-precios');
    if (redondearPreciosCheckbox) {
        redondearPreciosCheckbox.addEventListener('change', () => {
            calcularPrecioCristales();
            calcularPrecioFinal();
        });
    }
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado, inicializando...');
    manejarSeleccionProducto();
    agregarEventosCalculos();
    inicializarProductoSeleccionado(); // Inicializar la tabla de producto seleccionado
});