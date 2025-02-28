// abm.js

import { supabaseClient } from './supabaseConfig.js';

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        console.log('Usuario autenticado:', user);
        document.getElementById('sessionInfo').innerText = `Sesión activa para el usuario: ${user.email}`;
    }
}

// Verificar si el usuario es administrador
async function verificarSiEsAdmin() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = '/'; // Redirigir al login si no hay sesión
        return;
    }

    // Verificar si el usuario es un administrador
    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

    if (adminError || !admin) {
        console.error('Usuario no es administrador:', adminError ? adminError.message : 'No es administrador');
        document.getElementById('adminStatus').innerText = 'No tienes permisos de administrador.';
    } else {
        console.log('Usuario es administrador:', admin);
        document.getElementById('adminStatus').innerText = 'Eres un administrador.';
        cargarDatosFormulario();
        cargarProductos();
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

        // Llenar los tratamientos como checkboxes
        const tratamientosContainer = document.getElementById('tratamientos');
        tratamientos.data.forEach(tratamiento => {
            const div = document.createElement('div');
            div.innerHTML = `
                <input type="checkbox" id="tratamiento_${tratamiento.id}" name="tratamientos" value="${tratamiento.id}">
                <label for="tratamiento_${tratamiento.id}">${tratamiento.nombre}</label>
            `;
            tratamientosContainer.appendChild(div);
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
    const precio = document.getElementById('precio').value;
    const tratamientos = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => checkbox.nextElementSibling.textContent).join(', ');

    const vistaPrevia = document.getElementById('vistaPrevia');
    vistaPrevia.innerHTML = `
        <h3>Vista Previa del Producto</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Tipo de Lente:</strong> ${tipo_lente}</p>
        <p><strong>Material:</strong> ${material}</p>
        <p><strong>Índice de Refracción:</strong> ${indice_refraccion}</p>
        <p><strong>Laboratorio:</strong> ${laboratorio}</p>
        <p><strong>ESF Mínimo:</strong> ${min_esf}</p>
        <p><strong>ESF Máximo:</strong> ${max_esf}</p>
        <p><strong>CIL:</strong> ${cil}</p>
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
            const tratamientos = producto.tratamientos.join(', ');
            const precio = producto.precio || 'N/A'; // Obtener el precio más reciente
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.tipo_lente}</td>
                <td>${producto.material}</td>
                <td>${producto.indice_refraccion}</td>
                <td>${producto.laboratorio}</td>
                <td>${producto.min_esf}</td>
                <td>${producto.max_esf}</td>
                <td>${producto.cil}</td>
                <td>${precio}</td>
                <td>${tratamientos}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error