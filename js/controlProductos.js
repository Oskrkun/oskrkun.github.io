// controlProductos.js
import { supabaseClient } from './supabaseConfig.js';

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
                radio.addEventListener('change', function () {
                    if (this.checked) {
                        // Desmarcar todos los otros radios
                        tipoLentesContainer.querySelectorAll('input[type="radio"]').forEach(otherRadio => {
                            if (otherRadio !== this) {
                                otherRadio.checked = false;
                            }
                        });
                    }
                });
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
                checkbox.addEventListener('change', function () {
                    console.log('Tratamiento seleccionado:', this.value, this.checked);
                });
            });
        } else {
            console.error('Contenedor de tratamientos no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando tratamientos:', error);
    }
}

// Función para verificar si la receta está dentro de los rangos permitidos
function verificarRecetaEnRango(productos) {
    const esfOD = parseFloat(document.getElementById('od-lejos-esf').value) || null;
    const cilOD = parseFloat(document.getElementById('od-lejos-cil').value) || null;
    const esfOI = parseFloat(document.getElementById('oi-lejos-esf').value) || null;
    const cilOI = parseFloat(document.getElementById('oi-lejos-cil').value) || null;

    // Si no hay receta en ningún ojo, no hacer ninguna verificación
    if (esfOD === null && cilOD === null && esfOI === null && cilOI === null) {
        return true; // No hay receta, mostrar todos los productos
    }

    // Verificar si al menos un producto cumple con los rangos de la receta
    return productos.some(producto => {
        const minEsf = parseFloat(producto.min_esf) || -Infinity;
        const maxEsf = parseFloat(producto.max_esf) || Infinity;
        const cil = parseFloat(producto.cil) || Infinity;

        // Verificar OD
        const odEnRango = (esfOD === null || (esfOD >= minEsf && esfOD <= maxEsf)) &&
                          (cilOD === null || Math.abs(cilOD) <= cil);

        // Verificar OI
        const oiEnRango = (esfOI === null || (esfOI >= minEsf && esfOI <= maxEsf)) &&
                          (cilOI === null || Math.abs(cilOI) <= cil);

        return odEnRango || oiEnRango;
    });
}

// Función para cargar productos filtrados
export async function cargarProductosFiltrados() {
    console.log('Cargando productos filtrados...');

    try {
        // Obtener el tipo de lente seleccionado
        const tipoLenteSeleccionado = document.querySelector('input[name="tipoLente"]:checked')?.value;

        // Obtener los tratamientos seleccionados
        const tratamientosSeleccionados = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => parseInt(checkbox.value));

        // Llamar a la función de Supabase para obtener los productos filtrados
        const { data: productos, error } = await supabaseClient.rpc('cargar_productos_filtrados', {
            p_tipo_lente_id: tipoLenteSeleccionado || null,
            p_tratamientos: tratamientosSeleccionados.length > 0 ? tratamientosSeleccionados : null
        });

        if (error) throw error;

        console.log('Productos filtrados cargados:', productos);

        // Verificar si la receta está dentro de los rangos permitidos
        const recetaEnRango = verificarRecetaEnRango(productos);

        // Llenar la tabla de productos
        const tbody = document.querySelector('#productTable tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            // Verificar si hay productos y si la receta está en rango
            if (productos && productos.length > 0 && recetaEnRango) {
                productos.forEach(producto => {
                    const tratamientos = producto.tratamientos ? producto.tratamientos.join(', ') : '';
                    const precio = formatearPrecio(producto.precio); // Formatear el precio

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
                    tbody.appendChild(row);
                });
            } else {
                // Si no hay productos o la receta no está en rango, mostrar un mensaje en la tabla
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="9" style="text-align: center;">${productos.length === 0 ? 'No hay productos disponibles.' : 'La receta no está dentro de los rangos permitidos para los productos seleccionados.'}</td>
                `;
                tbody.appendChild(row);
            }
        } else {
            console.error('Cuerpo de la tabla de productos no encontrado.');
        }
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