// controlProductos.js
import { supabaseClient } from './supabaseConfig.js';

// Función para actualizar el contador de productos en el h2
function actualizarContadorProductos(cantidad) {
    console.log('Actualizando contador de productos...');
    const h2Productos = document.querySelector('#ProductosSection h2');
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
        console.log(`Contador de productos actualizado a: ${cantidad}`);
    } else {
        console.error('No se encontró el elemento h2 en la sección de productos.');
    }
}

// Función para cargar los tipos de lentes desde Supabase
export async function cargarTiposLentes() {
    console.log('Cargando tipos de lentes...');

    try {
        // Obtener datos de Supabase
        const { data: tiposLentes, error } = await supabaseClient.rpc('cargar_tipos_lentes');

        if (error) throw error;

        console.log('Tipos de lentes cargados:', tiposLentes);

        // Llenar la tabla de tipos de lentes
        const tipoLentesContainer = document.getElementById('tipoLentes');
        if (tipoLentesContainer) {
            tipoLentesContainer.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            tiposLentes.forEach(tipoLente => {
                console.log(`Agregando tipo de lente: ${tipoLente.nombre}`);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tipoLente.nombre}</td>
                    <td>
                        <input type="radio" id="tipoLente_${tipoLente.id}" name="tipoLente" value="${tipoLente.id}">
                    </td>
                `;
                tipoLentesContainer.appendChild(row);
            });

            // Agregar evento para permitir solo un checkbox seleccionado
            tipoLentesContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', cargarProductosFiltrados);
            });
        } else {
            console.error('Contenedor de tipos de lentes no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando tipos de lentes:', error);
    }
}

// Función para cargar los tratamientos desde Supabase
export async function cargarTratamientos() {
    console.log('Cargando tratamientos...');

    try {
        // Obtener datos de Supabase
        const { data: tratamientos, error } = await supabaseClient.rpc('cargar_tratamientos');

        if (error) throw error;

        console.log('Tratamientos cargados:', tratamientos);

        // Llenar la tabla de tratamientos
        const tratamientosContainer = document.getElementById('tratamientos');
        if (tratamientosContainer) {
            tratamientosContainer.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            tratamientos.forEach(tratamiento => {
                console.log(`Agregando tratamiento: ${tratamiento.nombre}`);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tratamiento.nombre}</td>
                    <td>
                        <input type="checkbox" id="tratamiento_${tratamiento.id}" name="tratamientos" value="${tratamiento.id}">
                    </td>
                `;
                tratamientosContainer.appendChild(row);
            });

            // Agregar evento para manejar la selección de tratamientos
            tratamientosContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', cargarProductosFiltrados);
            });
        } else {
            console.error('Contenedor de tratamientos no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando tratamientos:', error);
    }
}

// Función para realizar la transposición oftalmológica
function transponerCilindrico(esf, cil) {
    console.log(`Transponiendo valores - ESF: ${esf}, CIL: ${cil}`);
    if (cil > 0) {
        // Transposición: cambiar el signo del CIL y ajustar el ESF
        const nuevoCil = -cil;
        const nuevoEsf = esf + cil;
        console.log(`Valores transpuestos - Nuevo ESF: ${nuevoEsf}, Nuevo CIL: ${nuevoCil}`);
        return { esf: nuevoEsf, cil: nuevoCil };
    }
    // Si el CIL es negativo, no se realiza la transposición
    console.log('No se necesita transposición, CIL ya es negativo.');
    return { esf, cil };
}

// Función para determinar el valor más alto de ESF o CIL
function obtenerValorMasAlto(valor1, valor2) {
    console.log(`Comparando valores para obtener el más alto: ${valor1} y ${valor2}`);
    if (valor1 === null && valor2 === null) return null;
    if (valor1 === null) return valor2;
    if (valor2 === null) return valor1;
    return Math.min(valor1, valor2); // En ESF y CIL, el valor más alto es el más negativo
}

// Función para filtrar productos por graduación (ESF y CIL)
function filtrarPorGraduacion(producto, esfMasAlto, cilMasAlto) {
    console.log(`Filtrando producto: ${producto.nombre}`);
    console.log(`ESF más alto: ${esfMasAlto}, CIL más alto: ${cilMasAlto}`);
    console.log(`Producto - min_esf: ${producto.min_esf}, max_esf: ${producto.max_esf}, cil: ${producto.cil}`);

    // Verificar si el producto cumple con el ESF más alto
    const cumpleEsf = esfMasAlto === null || (producto.min_esf <= esfMasAlto && producto.max_esf >= esfMasAlto);
    console.log(`¿Cumple con ESF? ${cumpleEsf}`);

    // Verificar si el producto cumple con el CIL más alto
    const cumpleCil = cilMasAlto === null || (
        producto.cil <= cilMasAlto // CIL del producto debe ser más negativo o igual (menor o igual a -5)
    );
    console.log(`¿Cumple con CIL? ${cumpleCil}`);

    // Devolver true si cumple con ambos filtros
    return cumpleEsf && cumpleCil;
}

// Función para cargar productos filtrados
export async function cargarProductosFiltrados() {
    console.log('Cargando productos filtrados...');

    try {
        // Obtener el tipo de lente seleccionado
        const tipoLenteSeleccionado = document.querySelector('input[name="tipoLente"]:checked')?.value;
        console.log('Tipo de lente seleccionado:', tipoLenteSeleccionado);

        // Obtener los tratamientos seleccionados
        const tratamientosSeleccionados = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => parseInt(checkbox.value));
        console.log('Tratamientos seleccionados:', tratamientosSeleccionados);

        // Obtener los valores de ESF y CIL de la receta
        const odLejosEsf = parseFloat(document.getElementById('od-lejos-esf').value) || null;
        const odLejosCil = parseFloat(document.getElementById('od-lejos-cil').value) || null;
        const oiLejosEsf = parseFloat(document.getElementById('oi-lejos-esf').value) || null;
        const oiLejosCil = parseFloat(document.getElementById('oi-lejos-cil').value) || null;

        console.log('Valores de la receta - OD ESF:', odLejosEsf, 'OD CIL:', odLejosCil);
        console.log('Valores de la receta - OI ESF:', oiLejosEsf, 'OI CIL:', oiLejosCil);

        // Realizar la transposición oftalmológica si es necesario
        const odTranspuesto = transponerCilindrico(odLejosEsf, odLejosCil);
        const oiTranspuesto = transponerCilindrico(oiLejosEsf, oiLejosCil);

        console.log('Valores transpuestos - OD:', odTranspuesto);
        console.log('Valores transpuestos - OI:', oiTranspuesto);

        // Determinar los valores más altos de ESF y CIL (después de la transposición)
        const esfMasAlto = obtenerValorMasAlto(odTranspuesto.esf, oiTranspuesto.esf);
        const cilMasAlto = obtenerValorMasAlto(odTranspuesto.cil, oiTranspuesto.cil);

        console.log('ESF más alto:', esfMasAlto);
        console.log('CIL más alto:', cilMasAlto);

        // Llamar a la función de Supabase para obtener los productos filtrados (tratamientos y tipo de lente)
        const { data: productos, error } = await supabaseClient.rpc('cargar_productos_filtrados', {
            p_tipo_lente_id: tipoLenteSeleccionado || null,
            p_tratamientos: tratamientosSeleccionados.length > 0 ? tratamientosSeleccionados : null
        });

        if (error) throw error;

        console.log('Productos filtrados cargados:', productos);

        // Filtrar productos por graduación (ESF y CIL)
        const productosFiltrados = productos.filter(producto => filtrarPorGraduacion(producto, esfMasAlto, cilMasAlto));

        console.log('Productos filtrados por ESF y CIL:', productosFiltrados);

        // Llenar la tabla de productos
        const tbody = document.querySelector('#productTable tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            if (productosFiltrados && productosFiltrados.length > 0) {
                productosFiltrados.forEach(producto => {
                    console.log(`Agregando producto a la tabla: ${producto.nombre}`);
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
                        <td>${producto.laboratorio}</td>
                        <td>${min_esf}</td>
                        <td>${max_esf}</td>
                        <td>${cil}</td>
                        <td>${precio}</td>
                        <td>${tratamientos}</td>
                    `;

                    // Agregar evento de clic a la fila
					row.addEventListener('click', () => {
						// Si la fila ya está seleccionada, deseleccionarla
						if (row.classList.contains('selected')) {
							row.classList.remove('selected');
						} else {
							// Deseleccionar todas las filas
							tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
							// Seleccionar la fila clickeada
							row.classList.add('selected');
						}
					});
					

                    tbody.appendChild(row);
                });
            } else {
                console.log('No hay productos disponibles después del filtrado.');
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

// Función para agregar eventos de filtrado
export function agregarEventosFiltrado() {
    console.log('Agregando eventos de filtrado...');
    const tipoLenteRadios = document.querySelectorAll('input[name="tipoLente"]');
    const tratamientosCheckboxes = document.querySelectorAll('input[name="tratamientos"]');

    tipoLenteRadios.forEach(radio => {
        radio.addEventListener('change', cargarProductosFiltrados);
    });

    tratamientosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', cargarProductosFiltrados);
    });
}

// Escuchar el evento personalizado 'recetaTranspuesta'
document.addEventListener('recetaTranspuesta', () => {
    console.log('Receta transpuesta detectada, actualizando lista de productos...');
    cargarProductosFiltrados();
});

// Escuchar el evento personalizado 'recetaBorrada'
document.addEventListener('recetaBorrada', () => {
    console.log('Receta borrada detectada, actualizando lista de productos...');
    cargarProductosFiltrados();
});

// Función para agregar eventos de cambio en los inputs de la receta
export function agregarEventosReceta() {
    console.log('Agregando eventos de cambio en los inputs de la receta...');
    const inputsReceta = document.querySelectorAll('.vista-previa input');
    inputsReceta.forEach(input => {
        input.addEventListener('blur', cargarProductosFiltrados);
    });
}