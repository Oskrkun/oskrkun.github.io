// abm.js

import { supabaseClient } from './supabaseConfig.js';

// Función para inicializar el ABM
export async function initABM() {
    // Cargar datos del formulario
    await cargarDatosFormulario();

    // Mostrar vista previa del producto
    mostrarVistaPrevia();

    // Cargar productos en la tabla
    await cargarProductos();

    // Manejar el envío del formulario
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const tipo_lente_id = document.getElementById('tipo_lente').value;
            const material_id = document.getElementById('material').value;
            const indice_refraccion_id = document.getElementById('indice_refraccion').value;
            const laboratorio_id = document.getElementById('laboratorio').value;
            const min_esf = parseFloat(document.getElementById('min_esf').value);
            const max_esf = parseFloat(document.getElementById('max_esf').value);
            const cil = parseFloat(document.getElementById('cil').value);
            const precio = parseFloat(document.getElementById('precio').value);
            const tratamientos = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => parseInt(checkbox.value));

            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError || !user) {
                console.error('Usuario no autenticado:', userError ? userError.message : 'No hay usuario');
                return;
            }

            const response = await supabaseClient.rpc('crear_producto', {
                p_nombre: nombre,
                p_tipo_lente_id: tipo_lente_id,
                p_material_id: material_id,
                p_indice_refraccion_id: indice_refraccion_id,
                p_laboratorio_id: laboratorio_id,
                p_user_id: user.id,
                p_min_esf: min_esf,
                p_max_esf: max_esf,
                p_cil: cil,
                p_precio: precio,
                p_tratamientos: tratamientos
            });

            console.log('Respuesta completa de Supabase:', response); // Depuración

            if (response.error) {
                console.error('Error creando producto:', response.error);
                alert('Error al crear el producto: ' + response.error.message);
            } else {
                alert('Producto creado correctamente.');
                await cargarProductos(); // Recargar la tabla de productos
            }
        });
    }
}

// Cargar datos para los selectores del formulario
async function cargarDatosFormulario() {
    try {
        const tiposLentes = await supabaseClient.rpc('cargar_tipos_lentes');
        const materiales = await supabaseClient.rpc('cargar_materiales');
        const indicesRefraccion = await supabaseClient.rpc('cargar_indices_refraccion');
        const laboratorios = await supabaseClient.rpc('cargar_laboratorios');
        const tratamientos = await supabaseClient.rpc('cargar_tratamientos');

        // Llenar los selectores
        llenarSelector('tipo_lente', tiposLentes.data);
        llenarSelector('material', materiales.data);
        llenarSelector('indice_refraccion', indicesRefraccion.data);
        llenarSelector('laboratorio', laboratorios.data);

        // Llenar los tratamientos como filas de la tabla
        const tratamientosContainer = document.getElementById('tratamientos');
        tratamientos.data.forEach(tratamiento => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tratamiento.nombre}</td>
                <td>
                    <input type="checkbox" id="tratamiento_${tratamiento.id}" name="tratamientos" value="${tratamiento.id}">
                </td>
            `;
            tratamientosContainer.appendChild(row);
        });

        // Agregar evento para mostrar la vista previa
        document.getElementById('productForm').addEventListener('input', mostrarVistaPrevia);
    } catch (error) {
        console.error('Error cargando datos del formulario:', error);
    }
}

// Llenar un selector con datos
function llenarSelector(id, datos) {
    const selector = document.getElementById(id);
    datos.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre || item.valor;  // Usar 'valor' para índices de refracción
        selector.appendChild(option);
    });
}

// Mostrar vista previa del producto
function mostrarVistaPrevia() {
    const nombre = document.getElementById('nombre').value;
    const tipo_lente = document.getElementById('tipo_lente').options[document.getElementById('tipo_lente').selectedIndex].text;
    const material = document.getElementById('material').options[document.getElementById('material').selectedIndex].text;
    const indice_refraccion = document.getElementById('indice_refraccion').options[document.getElementById('indice_refraccion').selectedIndex].text;
    const laboratorio = document.getElementById('laboratorio').options[document.getElementById('laboratorio').selectedIndex].text;
    const min_esf = document.getElementById('min_esf').value;
    const max_esf = document.getElementById('max_esf').value;
    const cil = document.getElementById('cil').value;
    const precio = formatearPrecio(document.getElementById('precio').value); // Formatear el precio

    // Obtener los tratamientos seleccionados
    const tratamientos = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => {
        const fila = checkbox.closest('tr');
        const nombreTratamiento = fila.querySelector('td:first-child').textContent;
        return nombreTratamiento;
    }).join(', ');

    const vistaPrevia = document.getElementById('vistaPrevia');
    vistaPrevia.innerHTML = `
        <h3>Vista Previa del Producto</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Tipo de Lente:</strong> ${tipo_lente}</p>
        <p><strong>Material:</strong> ${material}</p>
        <p><strong>Índice de Refracción:</strong> ${indice_refraccion}</p>
        <p><strong>Laboratorio:</strong> ${laboratorio}</p>
        <p><strong>ESF Mínimo:</strong> ${formatearNumero(min_esf)}</p>
        <p><strong>ESF Máximo:</strong> ${formatearNumero(max_esf)}</p>
        <p><strong>CIL:</strong> ${formatearNumero(cil)}</p>
        <p><strong>Precio:</strong> ${precio}</p>
        <p><strong>Tratamientos:</strong> ${tratamientos}</p>
    `;
}

// Cargar productos en la tabla
async function cargarProductos() {
    try {
        const { data: productos, error } = await supabaseClient.rpc('cargar_productos');

        if (error) throw error;

        const tbody = document.querySelector('#productTable tbody');
        tbody.innerHTML = '';

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
                <td>${producto.indice_refraccion}</td>
                <td>${producto.laboratorio}</td>
                <td>${min_esf}</td>
                <td>${max_esf}</td>
                <td>${cil}</td>
                <td>${precio}</td>
                <td>${tratamientos}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// Función para formatear números con signo y dos decimales
function formatearNumero(numero) {
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
function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === '') return 'N/A';

    const num = parseFloat(precio);
    if (isNaN(num)) return 'N/A';

    return `$ ${num.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}