import { supabaseClient } from './supabaseConfig.js';
import {
    formatearNumero,
    formatearPrecio,
    actualizarContadorProductos
} from './controlProductos.js';

// Función para realizar la transposición oftalmológica
function transponerCilindrico(esf, cil) {
    if (cil > 0) {
        const nuevoCil = -cil;
        const nuevoEsf = esf + cil;
        return { esf: nuevoEsf, cil: nuevoCil };
    }
    return { esf, cil };
}

// Función para determinar el valor más alto de ESF o CIL
function obtenerValorMasAlto(valor1, valor2) {
    if (valor1 === null && valor2 === null) return null;
    if (valor1 === null) return valor2;
    if (valor2 === null) return valor1;
    return Math.min(valor1, valor2); // En ESF y CIL, el valor más alto es el más negativo
}

// Función para filtrar productos por graduación (Laboratorio 2)
function filtrarPorGraduacion(producto, esfMasAlto, cilMasAlto) {
    const cumpleEsf = esfMasAlto === null || (producto.min_esf <= esfMasAlto && producto.max_esf >= esfMasAlto);
    const cumpleCil = cilMasAlto === null || (producto.cil <= cilMasAlto);
    return cumpleEsf && cumpleCil;
}

// Función para validar productos según las reglas del Laboratorio 4
function validarLaboratorio4(producto, odTranspuesto, oiTranspuesto) {
    // Obtener los rangos de ESF y CIL del producto
    const minEsfProducto = producto.min_esf;
    const maxEsfProducto = producto.max_esf;
    const cilProducto = producto.cil;

    // Validar ESF y CIL para OD
    const esfOD = odTranspuesto.esf;
    const cilOD = odTranspuesto.cil;

    if (esfOD !== null && cilOD !== null) {
        // Verificar que el CIL no supere el máximo del producto
        if (Math.abs(cilOD) > cilProducto) {
            return false; // CIL fuera de rango
        }

        // Verificar que la suma de ESF y CIL esté dentro del rango de ESF del producto
        const sumaEsfCilOD = esfOD + cilOD;
        if (sumaEsfCilOD > maxEsfProducto || sumaEsfCilOD < minEsfProducto) {
            return false; // Suma fuera de rango
        }
    }

    // Validar ESF y CIL para OI
    const esfOI = oiTranspuesto.esf;
    const cilOI = oiTranspuesto.cil;

    if (esfOI !== null && cilOI !== null) {
        // Verificar que el CIL no supere el máximo del producto
        if (Math.abs(cilOI) > cilProducto) {
            return false; // CIL fuera de rango
        }

        // Verificar que la suma de ESF y CIL esté dentro del rango de ESF del producto
        const sumaEsfCilOI = esfOI + cilOI;
        if (sumaEsfCilOI > maxEsfProducto || sumaEsfCilOI < minEsfProducto) {
            return false; // Suma fuera de rango
        }
    }

    // Si pasa todas las validaciones, el producto es válido
    return true;
}

// Función principal para cargar productos filtrados
export async function cargarProductosFiltrados() {
    try {
        // Obtener el tipo de lente seleccionado desde la lista desplegable
        const tipoLenteSeleccionado = document.getElementById('tipo-lente-select').value;

        // Obtener el laboratorio seleccionado desde la lista desplegable
        const laboratorioSeleccionado = document.getElementById('laboratorio-select').value;

        // Obtener los tratamientos seleccionados
        const tratamientosSeleccionados = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => parseInt(checkbox.value));

        // Obtener los valores de ESF y CIL de la receta
        const odLejosEsf = parseFloat(document.getElementById('od-lejos-esf').value) || null;
        const odLejosCil = parseFloat(document.getElementById('od-lejos-cil').value) || null;
        const oiLejosEsf = parseFloat(document.getElementById('oi-lejos-esf').value) || null;
        const oiLejosCil = parseFloat(document.getElementById('oi-lejos-cil').value) || null;

        // Verificar si se ingresó una receta
        const hayReceta = odLejosEsf !== null || odLejosCil !== null || oiLejosEsf !== null || oiLejosCil !== null;

        // Obtener los productos desde Supabase
        const { data: productos, error } = await supabaseClient.rpc('cargar_productos_filtrados', {
            p_tipo_lente_id: tipoLenteSeleccionado || null,
            p_laboratorio_id: laboratorioSeleccionado || null,
            p_tratamientos: tratamientosSeleccionados.length > 0 ? tratamientosSeleccionados : null
        });

        if (error) throw error;

        let productosFiltrados = productos;

        if (hayReceta) {
            // Aplicar transposición solo si el laboratorio es el ID 2 (o en el futuro, otros laboratorios)
            let odTranspuesto = { esf: odLejosEsf, cil: odLejosCil };
            let oiTranspuesto = { esf: oiLejosEsf, cil: oiLejosCil };

            if (laboratorioSeleccionado === '2') {
                odTranspuesto = transponerCilindrico(odLejosEsf, odLejosCil);
                oiTranspuesto = transponerCilindrico(oiLejosEsf, oiLejosCil);
            }

            // Aplicar controles según el laboratorio seleccionado
            if (laboratorioSeleccionado === '2') {
                // Control para Laboratorio 2
                const esfMasAlto = obtenerValorMasAlto(odTranspuesto.esf, oiTranspuesto.esf);
                const cilMasAlto = obtenerValorMasAlto(odTranspuesto.cil, oiTranspuesto.cil);
                productosFiltrados = productos.filter(producto => filtrarPorGraduacion(producto, esfMasAlto, cilMasAlto));
            } else if (laboratorioSeleccionado === '4') {
                // Control para Laboratorio 4
                productosFiltrados = productos.filter(producto => validarLaboratorio4(producto, odTranspuesto, oiTranspuesto));
            } else {
                // Sin control de graduación para otros laboratorios
                productosFiltrados = productos;
            }
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