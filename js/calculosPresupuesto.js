// calculosPresupuesto.js
import { supabaseClient } from './supabaseConfig.js';

// Objeto para almacenar referencias a los elementos del DOM
const elementos = {
    productoIva: document.getElementById('producto-iva'),
    productoMultiplicador: document.getElementById('producto-multiplicador'),
    productoArmazon: document.getElementById('producto-armazon'),
    productoNombre: document.getElementById('producto-nombre'),
    productoTratamientos: document.getElementById('producto-tratamientos'),
    productoPrecioBase: document.getElementById('producto-precio-base'),
    productoArmado: document.getElementById('producto-armado'),
    precioCristales: document.getElementById('Precio-Cristales'),
    productoPrecioFinal: document.getElementById('producto-precio-final'),
    redondearPreciosCheckbox: document.getElementById('redondear-precios'),
    productTableTbody: document.querySelector('#productTable tbody')
};

// Función para redondear el precio a un número que termine en 90
function redondearPrecio(precio) {
    const redondeo = Math.ceil((precio + 10) / 100) * 100 - 10;
    return redondeo;
}

// Función para formatear un número al formato de moneda deseado ($ 20.090,00)
function formatearMoneda(numero) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

// Función para convertir un texto formateado a número
function desformatearMoneda(texto) {
    return parseFloat(texto.replace(/[^0-9,-]/g, '').replace(',', '.'));
}

// Función para validar que el input solo contenga números, puntos o comas
function validarInputNumerico(event) {
    const input = event.target;
    const valor = input.value;
    const nuevoValor = valor.replace(/[^0-9.,]/g, ''); // Solo permite números, puntos y comas
    input.value = nuevoValor;
}

// Función para limpiar el campo al enfocarse
function limpiarCampoAlEnfocarse(event) {
    const input = event.target;
    input.value = '';
}

// Función para restaurar el valor por defecto si el campo está vacío al perder el foco
function restaurarValorPorDefecto(event) {
    const input = event.target;
    if (input.value === '') {
        switch (input.id) {
            case 'producto-iva':
                input.value = '22';
                break;
            case 'producto-multiplicador':
                input.value = '2.2';
                break;
            case 'producto-armazon':
                input.value = formatearMoneda(0);
                break;
        }
    } else {
        // Formatear el valor si es necesario
        if (input.id === 'producto-armazon') {
            const valorNumerico = desformatearMoneda(input.value);
            input.value = formatearMoneda(valorNumerico);
        }
    }
}

// Función para manejar el clic en una fila de la tabla de productos
export function manejarSeleccionProducto() {
    if (elementos.productTableTbody) {
        elementos.productTableTbody.addEventListener('click', (event) => {
            const filaSeleccionada = event.target.closest('tr');
            if (filaSeleccionada) {
                console.log('Fila seleccionada:', filaSeleccionada); // Depuración: Verificar la fila seleccionada

                // Deseleccionar todas las filas primero
                elementos.productTableTbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));

                // Seleccionar la fila clickeada
                filaSeleccionada.classList.add('selected');
                rellenarCamposProductoSeleccionado(filaSeleccionada);
            } else {
                console.log('No se encontró una fila válida.'); // Depuración: No se encontró fila
            }
        });
    } else {
        console.error('No se encontró el tbody de la tabla de productos.'); // Depuración: Error en el tbody
    }
}

// Función para rellenar los campos del producto seleccionado
function rellenarCamposProductoSeleccionado(fila) {
    const nombre = fila.cells[0].textContent;
    const tratamientos = fila.cells[8].textContent;
    const precioTexto = fila.cells[7].textContent;
    const laboratorioId = fila.cells[3].getAttribute('data-laboratorio-id'); // Obtener el laboratorio_id

    console.log('Datos del producto seleccionado:', { nombre, tratamientos, precioTexto, laboratorioId }); // Depuración: Verificar datos del producto

    // Convertir el precio a número
    const precio = desformatearMoneda(precioTexto);
    console.log('Precio convertido:', precio); // Depuración: Verificar el precio convertido

    elementos.productoNombre.value = nombre;
    elementos.productoTratamientos.value = tratamientos;
    elementos.productoPrecioBase.value = precio;

    // Cargar la lista desplegable de montaje con el laboratorio_id
    cargarListaMontaje(laboratorioId);

    // Inicializar el IVA, multiplicador y armazón
    elementos.productoIva.value = '22';
    elementos.productoMultiplicador.value = '2.2';
    elementos.productoArmazon.value = formatearMoneda(0);

    // Calcular precios
    calcularPrecios();
}

// Función para cargar la lista desplegable de montaje desde Supabase
async function cargarListaMontaje(laboratorioId) {
    const selectMontaje = elementos.productoArmado;
    selectMontaje.innerHTML = ''; // Limpiar opciones anteriores

    console.log('Cargando lista de montaje para laboratorio ID:', laboratorioId); // Depuración: Verificar laboratorioId

    // Verificar si no se proporcionó un laboratorioId
    if (!laboratorioId) {
        console.log('No se proporcionó laboratorioId.'); // Depuración: No hay laboratorioId
        const option = document.createElement('option');
        option.value = 0; // Valor numérico 0 en lugar de cadena vacía
        option.textContent = 'No hay producto seleccionado';
        selectMontaje.appendChild(option);
        selectMontaje.disabled = true; // Deshabilitar el select si no hay producto seleccionado
        return; // Salir de la función
    }

    try {
        // Llamar a la función de Supabase para obtener los datos
        const { data, error } = await supabaseClient
            .rpc('get_laboratorio_info', { lab_id: laboratorioId, serv_id: 1 }); // Usar el laboratorio_id como parámetro

        if (error) {
            throw error;
        }

        console.log('Datos de montaje obtenidos:', data); // Depuración: Verificar datos obtenidos

        // Verificar si hay datos
        if (data && data.length > 0) {
            // Recorrer los datos y agregar opciones al select
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.precio; // Usar el precio directamente como valor
                option.textContent = `${item.descripcion} (${formatearMoneda(item.precio)})`;
                selectMontaje.appendChild(option);
            });

            // Seleccionar el primer elemento de la lista por defecto
            selectMontaje.selectedIndex = 0;

            // Habilitar el select si hay datos
            selectMontaje.disabled = false;

            // Agregar evento para recalcular al cambiar el armado
            selectMontaje.addEventListener('change', calcularPrecios);
        } else {
            console.warn('No se encontraron datos para el laboratorio y servicio especificados.'); // Depuración: No hay datos
            const option = document.createElement('option');
            option.value = 0; // Valor numérico 0 en lugar de cadena vacía
            option.textContent = 'No hay montajes disponibles';
            selectMontaje.appendChild(option);
            selectMontaje.disabled = true; // Deshabilitar el select si no hay datos
        }
    } catch (error) {
        console.error('Error al cargar la lista de montaje:', error.message); // Depuración: Error en la carga
        const option = document.createElement('option');
        option.value = 0; // Valor numérico 0 en lugar de cadena vacía
        option.textContent = 'Error al cargar los montajes';
        selectMontaje.appendChild(option);
        selectMontaje.disabled = true; // Deshabilitar el select si hay un error
    }
}

// Función para calcular los precios (cristales y final)
function calcularPrecios() {
    console.log('Calculando precios...'); // Depuración: Inicio del cálculo

    // Obtener valores
    const precioBase = parseFloat(elementos.productoPrecioBase.value) || 0;
    const armado = parseFloat(elementos.productoArmado.value) || 0; // Precio del montaje seleccionado
    const iva = parseFloat(elementos.productoIva.value) || 0;
    const multiplicador = parseFloat(elementos.productoMultiplicador.value) || 2.2;
    const precioArmazon = desformatearMoneda(elementos.productoArmazon.value) || 0;

    console.log('Valores obtenidos:', { precioBase, armado, iva, multiplicador, precioArmazon }); // Depuración: Verificar valores

    // Calcular precio de los cristales
    const precioConArmado = precioBase + armado; // Sumar el precio del montaje
    const precioConIva = precioConArmado * (1 + iva / 100);
    let precioCristales = precioConIva * multiplicador;

    console.log('Precio de cristales antes de redondear:', precioCristales); // Depuración: Precio antes de redondear

    // Redondear si es necesario
    if (elementos.redondearPreciosCheckbox && elementos.redondearPreciosCheckbox.checked) {
        precioCristales = redondearPrecio(precioCristales);
        console.log('Precio de cristales redondeado:', precioCristales); // Depuración: Precio redondeado
    }
    elementos.precioCristales.value = formatearMoneda(precioCristales);

    // Calcular precio final
    const precioFinal = precioCristales + precioArmazon;
    elementos.productoPrecioFinal.value = formatearMoneda(precioFinal);

    console.log('Precio final calculado:', precioFinal); // Depuración: Precio final
}

// Función para agregar eventos a los campos editables
export function agregarEventosCalculos() {
    const camposEditables = ['producto-iva', 'producto-multiplicador', 'producto-armazon'];
    camposEditables.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', validarInputNumerico);
            campo.addEventListener('focus', limpiarCampoAlEnfocarse);
            campo.addEventListener('blur', restaurarValorPorDefecto);
            campo.addEventListener('blur', calcularPrecios);
        } else {
            console.error(`No se encontró el campo con ID: ${id}`); // Depuración: Campo no encontrado
        }
    });

    // Agregar evento al checkbox de redondeo
    if (elementos.redondearPreciosCheckbox) {
        elementos.redondearPreciosCheckbox.addEventListener('change', calcularPrecios);
    }
}

// Función para inicializar la tabla de producto seleccionado
export function inicializarProductoSeleccionado() {
    console.log('Inicializando producto seleccionado...'); // Depuración: Inicio de la inicialización

    // Cargar la lista desplegable de montaje
    cargarListaMontaje();

    // Inicializar los campos editables con valores por defecto
    elementos.productoIva.value = '22'; // IVA por defecto
    elementos.productoMultiplicador.value = '2.2'; // Multiplicador por defecto
    elementos.productoArmazon.value = formatearMoneda(0); // Armazón por defecto

    // Seleccionar el primer valor de la lista de montaje
    if (elementos.productoArmado && elementos.productoArmado.options.length > 0) {
        elementos.productoArmado.selectedIndex = 0; // Seleccionar el primer elemento
    }

    // Calcular precios iniciales
    calcularPrecios();
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando...'); // Depuración: DOM cargado
    manejarSeleccionProducto();
    agregarEventosCalculos();
    inicializarProductoSeleccionado(); // Inicializar la tabla de producto seleccionado
});