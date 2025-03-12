// controlProductos.js
import { supabaseClient } from './supabaseConfig.js';

// Función para actualizar el contador de productos en el h2
function actualizarContadorProductos(cantidad) {
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
    } else {
        console.error('No se encontró el elemento h2 en la sección de productos.');
    }
}

// Función para cargar los tratamientos desde Supabase
export async function cargarTratamientos() {

    try {
        // Obtener datos de Supabase
        const { data: tratamientos, error } = await supabaseClient.rpc('cargar_tratamientos');

        if (error) throw error;

        // Llenar la tabla de tratamientos
        const tratamientosContainer = document.getElementById('tratamientos');
        if (tratamientosContainer) {
            // Limpiar solo las filas de tratamientos, no las filas manuales
            const filasTratamientos = tratamientosContainer.querySelectorAll('tr.tratamiento-fila');
            filasTratamientos.forEach(fila => fila.remove());

            // Agregar los tratamientos
            tratamientos.forEach(tratamiento => {
                const row = document.createElement('tr');
                row.classList.add('tratamiento-fila'); // Agregar una clase para identificar las filas de tratamientos
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
    if (cil > 0) {
        // Transposición: cambiar el signo del CIL y ajustar el ESF
        const nuevoCil = -cil;
        const nuevoEsf = esf + cil;
        return { esf: nuevoEsf, cil: nuevoCil };
    }
    // Si el CIL es negativo, no se realiza la transposición
    return { esf, cil };
}

// Función para determinar el valor más alto de ESF o CIL
function obtenerValorMasAlto(valor1, valor2) {
    if (valor1 === null && valor2 === null) return null;
    if (valor1 === null) return valor2;
    if (valor2 === null) return valor1;
    return Math.min(valor1, valor2); // En ESF y CIL, el valor más alto es el más negativo
}

// Función para filtrar productos por graduación (ESF y CIL)
function filtrarPorGraduacion(producto, esfMasAlto, cilMasAlto) {
    // Verificar si el producto cumple con el ESF más alto
    const cumpleEsf = esfMasAlto === null || (producto.min_esf <= esfMasAlto && producto.max_esf >= esfMasAlto);
    
    // Verificar si el producto cumple con el CIL más alto
    const cumpleCil = cilMasAlto === null || (
        producto.cil <= cilMasAlto // CIL del producto debe ser más negativo o igual (menor o igual a -5)
    );

    // Devolver true si cumple con ambos filtros
    return cumpleEsf && cumpleCil;
}

// Función para cargar productos filtrados
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

        // Realizar la transposición oftalmológica si es necesario
        const odTranspuesto = transponerCilindrico(odLejosEsf, odLejosCil);
        const oiTranspuesto = transponerCilindrico(oiLejosEsf, oiLejosCil);

        // Determinar los valores más altos de ESF y CIL (después de la transposición)
        const esfMasAlto = obtenerValorMasAlto(odTranspuesto.esf, oiTranspuesto.esf);
        const cilMasAlto = obtenerValorMasAlto(odTranspuesto.cil, oiTranspuesto.cil);

        // Llamar a la función de Supabase para obtener los productos filtrados (tipo de lente, laboratorio y tratamientos)
        const { data: productos, error } = await supabaseClient.rpc('cargar_productos_filtrados', {
            p_tipo_lente_id: tipoLenteSeleccionado || null,
            p_laboratorio_id: laboratorioSeleccionado || null,
            p_tratamientos: tratamientosSeleccionados.length > 0 ? tratamientosSeleccionados : null
        });

        if (error) throw error;

        // Filtrar productos por graduación (ESF y CIL)
        const productosFiltrados = productos.filter(producto => filtrarPorGraduacion(producto, esfMasAlto, cilMasAlto));

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
                        <td data-laboratorio-id="${producto.laboratorio_id}">${producto.laboratorio}</td> <!-- Mostrar nombre y guardar ID -->
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
    const tipoLenteRadios = document.querySelectorAll('input[name="tipoLente"]');
    const tratamientosCheckboxes = document.querySelectorAll('input[name="tratamientos"]');

    tipoLenteRadios.forEach(radio => {
        radio.addEventListener('change', cargarProductosFiltrados);
    });

    tratamientosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', cargarProductosFiltrados);
    });
}

// Función para cargar los laboratorios desde Supabase
export async function cargarLaboratorios() {
    try {
        // Obtener datos de Supabase
        const { data: laboratorios, error } = await supabaseClient.rpc('cargar_laboratorios');

        if (error) throw error;

        // Llenar la lista desplegable de laboratorios
        const laboratorioSelect = document.getElementById('laboratorio-select');
        if (laboratorioSelect) {
            laboratorioSelect.innerHTML = ''; // Limpiar la lista antes de agregar nuevos datos

            // Agregar la opción "Todos" como primer elemento
            const optionTodos = document.createElement('option');
            optionTodos.value = ''; // Valor vacío para representar "Todos"
            optionTodos.textContent = 'Todos';
            optionTodos.selected = true; // Seleccionada por defecto
            laboratorioSelect.appendChild(optionTodos);

            // Agregar los laboratorios
            laboratorios.forEach(laboratorio => {
                const option = document.createElement('option');
                option.value = laboratorio.id;
                option.textContent = laboratorio.nombre;
                laboratorioSelect.appendChild(option);
            });
        } else {
            console.error('Elemento select de laboratorios no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando laboratorios:', error);
    }
}

// Función para cargar los tipos de lentes desde Supabase
export async function cargarTiposLentesSelect() {

    try {
        // Obtener datos de Supabase
        const { data: tiposLentes, error } = await supabaseClient.rpc('cargar_tipos_lentes');

        if (error) throw error;

        // Llenar la lista desplegable de tipos de lentes
        const tipoLenteSelect = document.getElementById('tipo-lente-select');
        if (tipoLenteSelect) {
            tipoLenteSelect.innerHTML = ''; // Limpiar la lista antes de agregar nuevos datos

            // Agregar la opción "Todos" como primer elemento
            const optionTodos = document.createElement('option');
            optionTodos.value = ''; // Valor vacío para representar "Todos"
            optionTodos.textContent = 'Todos';
            optionTodos.selected = true; // Seleccionada por defecto
            tipoLenteSelect.appendChild(optionTodos);

            // Agregar los tipos de lentes
            tiposLentes.forEach(tipoLente => {
                const option = document.createElement('option');
                option.value = tipoLente.id;
                option.textContent = tipoLente.nombre;
                tipoLenteSelect.appendChild(option);
            });
        } else {
            console.error('Elemento select de tipos de lentes no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando tipos de lentes:', error);
    }
}

// Escuchar el evento personalizado 'recetaTranspuesta'
document.addEventListener('recetaTranspuesta', () => {
    cargarProductosFiltrados();
});

// Escuchar el evento personalizado 'recetaBorrada'
document.addEventListener('recetaBorrada', () => {
    cargarProductosFiltrados();
});

// Función para agregar eventos de cambio en los inputs de la receta
export function agregarEventosReceta() {
    const inputsReceta = document.querySelectorAll('.vista-previa input');
    inputsReceta.forEach(input => {
        input.addEventListener('blur', cargarProductosFiltrados);
    });
}