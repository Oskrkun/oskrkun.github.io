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
    const { data: tiposLentes, error: errorTiposLentes } = await supabaseClient
        .from('tipos_lentes')
        .select('*');

    const { data: materiales, error: errorMateriales } = await supabaseClient
        .from('materiales')
        .select('*');

    const { data: indicesRefraccion, error: errorIndicesRefraccion } = await supabaseClient
        .from('indices_refraccion')
        .select('*');

    const { data: laboratorios, error: errorLaboratorios } = await supabaseClient
        .from('laboratorios')
        .select('*');

    const { data: tratamientos, error: errorTratamientos } = await supabaseClient
        .from('tratamientos')
        .select('*');

    if (errorTiposLentes || errorMateriales || errorIndicesRefraccion || errorLaboratorios || errorTratamientos) {
        console.error('Error cargando datos:', errorTiposLentes || errorMateriales || errorIndicesRefraccion || errorLaboratorios || errorTratamientos);
        return;
    }

    // Llenar los selectores
    llenarSelector('tipo_lente', tiposLentes);
    llenarSelector('material', materiales);
    llenarSelector('indices_refraccion', indicesRefraccion);
    llenarSelector('laboratorio', laboratorios);

    // Llenar los tratamientos como checkboxes
    const tratamientosContainer = document.getElementById('tratamientos');
    tratamientos.forEach(tratamiento => {
        const div = document.createElement('div');
        div.innerHTML = `
            <input type="checkbox" id="tratamiento_${tratamiento.id}" name="tratamientos" value="${tratamiento.id}">
            <label for="tratamiento_${tratamiento.id}">${tratamiento.nombre}</label>
        `;
        tratamientosContainer.appendChild(div);
    });
}

// Llenar un selector con datos
function llenarSelector(id, datos) {
    const selector = document.getElementById(id);
    datos.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre;
        selector.appendChild(option);
    });
}

// Cargar productos en la tabla
async function cargarProductos() {
    const { data: productos, error } = await supabaseClient
        .from('productos')
        .select(`
            id,
            nombre,
            tipos_lentes (nombre),
            materiales (nombre),
            indices_refraccion (valor),
            laboratorios (nombre),
            min_esf,
            max_esf,
            cil,
            precio,
            producto_tratamiento (tratamientos (nombre))
        `);

    if (error) {
        console.error('Error cargando productos:', error);
        return;
    }

    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    productos.forEach(producto => {
        const tratamientos = producto.producto_tratamiento.map(pt => pt.tratamientos.nombre).join(', ');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.tipos_lentes.nombre}</td>
            <td>${producto.materiales.nombre}</td>
            <td>${producto.indices_refraccion.valor}</td>
            <td>${producto.laboratorios.nombre}</td>
            <td>${producto.min_esf}</td>
            <td>${producto.max_esf}</td>
            <td>${producto.cil}</td>
            <td>${producto.precio}</td>
            <td>${tratamientos}</td>
        `;
        tbody.appendChild(row);
    });
}

// Manejar el envío del formulario
document.getElementById('productForm').addEventListener('submit', async (e) => {
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

    if (response.error) {
        console.error('Error creando producto:', response.error);
        alert('Error al crear el producto: ' + response.error.message);
    } else {
        alert('Producto creado correctamente.');
        cargarProductos(); // Recargar la tabla de productos
    }
});

// Ejecutar la verificación de autenticación y si es administrador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion().then(() => {
        verificarSiEsAdmin();
    });
});