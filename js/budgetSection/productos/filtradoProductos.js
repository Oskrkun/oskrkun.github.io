import {
    formatearNumero,
    formatearPrecio,
    actualizarContadorProductos
} from '../resources/auxi.js';
import { obtenerProductosFiltrados } from '../../budgetSection/resources/supaFunctions.js';
import { estadoGlobal } from '../estadoGlobal.js'; // Importar el estado global

// Función para realizar la transposición oftalmológica
function transponerCilindricoVidaltec(esf, cil) {
    if (cil > 0) {
        const nuevoCil = -cil;
        const nuevoEsf = esf + cil;
        return { esf: nuevoEsf, cil: nuevoCil };
    }
    return { esf, cil };
}

function transponerCilindrico(esf, cil) {
    const nuevoCil = -cil;
    const nuevoEsf = esf + cil;
    return { esf: nuevoEsf, cil: nuevoCil };
}

// Función para filtrar productos por graduación (Laboratorio 2)
function filtrarPorGraduacionVidaltec(productos, odEsfValue, oiEsfValue, odCilValue, oiCilValue) {
    // Aplicar transposición si el cilindro es positivo
    const odTranspuesto = transponerCilindricoVidaltec(odEsfValue, odCilValue);
    const oiTranspuesto = transponerCilindricoVidaltec(oiEsfValue, oiCilValue);

    // Filtrar los productos
    return productos.filter(producto => {
        // Verificar que el OD cumpla con los rangos de ESF y CIL
        const odCumpleEsf = odTranspuesto.esf === null || (producto.min_esf <= odTranspuesto.esf && producto.max_esf >= odTranspuesto.esf);
        const odCumpleCil = odTranspuesto.cil === null || (producto.cil <= odTranspuesto.cil);

        // Verificar que el OI cumpla con los rangos de ESF y CIL
        const oiCumpleEsf = oiTranspuesto.esf === null || (producto.min_esf <= oiTranspuesto.esf && producto.max_esf >= oiTranspuesto.esf);
        const oiCumpleCil = oiTranspuesto.cil === null || (producto.cil <= oiTranspuesto.cil);

        // El producto es válido solo si ambos ojos cumplen con los rangos
        return odCumpleEsf && odCumpleCil && oiCumpleEsf && oiCumpleCil;
    });
}

// Función para filtrar por graduación (Laboratorio 4)
function filterByGraduationRodenstock(products, odEsfValue, oiEsfValue, odCilValue, oiCilValue) {
    // Función para verificar las condiciones de Rodenstock
    function verificarCondiciones(esf, cil, product) {
        // Filtro para ESF (esférico)
        const esfValid = (esf >= 0 && esf >= product.min_esf && esf <= product.max_esf) || // Para valores positivos
            (esf < 0 && esf >= product.min_esf); 

        // Filtro para CIL (cilíndrico)
        const cilValid = Math.abs(cil) <= product.cil; 

        // Validación de la suma de ESF y CIL
        const sum = Math.abs(esf) + Math.abs(cil); // Suma de |ESF| y |CIL|

        const sumValid = (esf >= 0 && sum <= product.max_esf) || // Para valores positivos
            (esf < 0 && sum <= Math.abs(product.min_esf)); // Para valores negativos

        return esfValid && cilValid && sumValid;
    }

    // Si el cilindro es negativo, hacer la transposición a positivo
    if (odCilValue < 0) {
        const odTranspuesto = transponerCilindrico(odEsfValue, odCilValue);
        odEsfValue = odTranspuesto.esf;
        odCilValue = Math.abs(odTranspuesto.cil); // Convertir CIL a positivo
    } else {
        odCilValue = Math.abs(odCilValue); // Asegurarse de que el CIL sea positivo
    }

    if (oiCilValue < 0) {
        const oiTranspuesto = transponerCilindrico(oiEsfValue, oiCilValue);
        oiEsfValue = oiTranspuesto.esf;
        oiCilValue = Math.abs(oiTranspuesto.cil); // Convertir CIL a positivo
    } else {
        oiCilValue = Math.abs(oiCilValue); // Asegurarse de que el CIL sea positivo
    }
    // Filtrar los productos con los valores correctos (ya transpuestos si era necesario)
    return products.filter(product => {

        // Verificar condiciones para OD y OI
        const odValid = verificarCondiciones(odEsfValue, odCilValue, product);
        const oiValid = verificarCondiciones(oiEsfValue, oiCilValue, product);

        // El producto es válido si ambos ojos cumplen con las condiciones
        const productoValido = odValid && oiValid;

        return productoValido;
    });
}

// Función principal para cargar productos filtrados
// filtradoProductos.js
export async function cargarProductosFiltrados() {
    try {
        // Leer los valores de la receta y los filtros desde el estado global
        const { od_lejos, oi_lejos } = estadoGlobal.receta;
        const { tipoLente, laboratorio, tratamientos, indiceRefraccion } = estadoGlobal.filtros;

        // Verificar si se ingresó una receta
        const hayReceta = od_lejos.esf !== null || od_lejos.cil !== null || oi_lejos.esf !== null || oi_lejos.cil !== null;

        // Obtener los productos desde Supabase
        const productos = await obtenerProductosFiltrados(tipoLente, laboratorio, tratamientos, indiceRefraccion);

        let productosFiltrados = productos;

        if (hayReceta) {
            // Aplicar controles según el laboratorio de cada producto
            productosFiltrados = productos.filter(producto => {
                if (laboratorio === '2' || producto.laboratorio_id === 2) {
                    // Control para Laboratorio 2 (Vidaltec)
                    return filtrarPorGraduacionVidaltec([producto], od_lejos.esf, oi_lejos.esf, od_lejos.cil, oi_lejos.cil).length > 0;
                } else if (laboratorio === '4' || producto.laboratorio_id === 4) {
                    // Control para Laboratorio 4 (Rodenstock)
                    return filterByGraduationRodenstock([producto], od_lejos.esf, oi_lejos.esf, od_lejos.cil, oi_lejos.cil).length > 0;
                } else {
                    // Sin control de graduación para otros laboratorios
                    return true;
                }
            });
        } else {
            // Si no hay receta, mostrar todos los productos
            productosFiltrados = productos;
        }

        // Llenar la tabla de productos
        const tbody = document.querySelector('#productTable tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            if (productosFiltrados && productosFiltrados.length > 0) {
                productosFiltrados.forEach(producto => {
                    const tratamientos = producto.tratamientos ? producto.tratamientos.join(', ') : '';
                    const precio = formatearPrecio(producto.precio);
                    const min_esf = formatearNumero(producto.min_esf);
                    const max_esf = formatearNumero(producto.max_esf);
                    const cil = formatearNumero(producto.cil);

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${producto.nombre}</td>
                        <td>${producto.tipo_lente}</td>
                        <td>${producto.material}</td>
                        <td data-laboratorio-id="${producto.laboratorio_id}">${producto.laboratorio}</td>
                        <td>${min_esf}</td>
                        <td>${max_esf}</td>
                        <td>${cil}</td>
                        <td>${precio}</td>
                        <td>${tratamientos}</td>
                    `;

                    row.addEventListener('click', () => {
                        if (row.classList.contains('selected')) {
                            row.classList.remove('selected');
                        } else {
                            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                            row.classList.add('selected');
                        }
                    });

                    tbody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="9" style="text-align: center;">No hay productos disponibles.</td>
                `;
                tbody.appendChild(row);
            }
        } else {
            console.error('Cuerpo de la tabla de productos no encontrado.');
        }

        // Actualizar el contador de productos
        actualizarContadorProductos(productosFiltrados.length);
    } catch (error) {
        console.error('Error cargando productos filtrados:', error);
    }
}