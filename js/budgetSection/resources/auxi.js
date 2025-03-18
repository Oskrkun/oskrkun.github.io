// Función para formatear números con signo y dos decimales
export function formatearNumero(numero) {
    if (numero === null || numero === undefined || numero === '') return 'N/A';

    const num = parseFloat(numero);
    if (isNaN(num)) return 'N/A';

    return num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always',
    });
}

const h2Productos = document.querySelector('#ProductosSection h2');
// Función para actualizar el contador de productos en el h2
export function actualizarContadorProductos(cantidad) {
    if (h2Productos) {
        // Buscar el span que contiene el contador
        let contadorSpan = h2Productos.querySelector('.contador-productos');
        
        // Si no existe, crearlo
        if (!contadorSpan) {
            contadorSpan = document.createElement('span');
            contadorSpan.classList.add('contador-productos');
            h2Productos.insertBefore(contadorSpan, h2Productos.querySelector('.toggle-icon'));
        }

        // Actualizar el texto del contador
        contadorSpan.textContent = `(${cantidad})`;
    } else {
        console.error('No se encontró el elemento h2 en la sección de productos.');
    }
}

// Función para formatear el precio con el símbolo $
export function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === '') return 'N/A';

    const num = parseFloat(precio);
    if (isNaN(num)) return 'N/A';

    return `$ ${num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
