// abm.js

import { supabaseClient } from './supabaseConfig.js';

// Función para inicializar el ABM (Altas, Bajas y Modificaciones)
export async function initABM() {
    console.log('Inicializando ABM...');

    // Cargar datos del formulario (tipos de lentes, materiales, etc.)
    await cargarDatosFormulario();

    // Mostrar vista previa del producto
    mostrarVistaPrevia();

    // Cargar productos en la tabla
    await cargarProductos();

    // Manejar el envío del formulario
    const productForm = document.getElementById('productForm');
    if (productForm) {
        console.log('Formulario encontrado, agregando evento submit...');
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

            console.log('Formulario enviado, obteniendo datos...');

            // Obtener los valores del formulario
            const nombre = document.getElementById('nombre').value.trim(); // Trim para eliminar espacios en blanco
            const tipo_lente_id = document.getElementById('tipo_lente').value;
            const material_id = document.getElementById('material').value;
            const indice_refraccion_id = document.getElementById('indice_refraccion').value;
            const laboratorio_id = document.getElementById('laboratorio').value;
            const min_esf = parseFloat(document.getElementById('min_esf').value);
            const max_esf = parseFloat(document.getElementById('max_esf').value);
            const cil = parseFloat(document.getElementById('cil').value);
            const precio = parseFloat(document.getElementById('precio').value);
            const tratamientos = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => parseInt(checkbox.value));

            console.log('Datos del formulario:', {
                nombre,
                tipo_lente_id,
                material_id,
                indice_refraccion_id,
                laboratorio_id,
                min_esf,
                max_esf,
                cil,
                precio,
                tratamientos
            });

            // Verificar si el usuario está autenticado
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError || !user) {
                console.error('Usuario no autenticado:', userError ? userError.message : 'No hay usuario');
                alert('Error: Usuario no autenticado.');
                return;
            }

            console.log('Usuario autenticado:', user.id);

            // Llamar a la función de PostgreSQL para crear el producto
            console.log('Llamando a la función crear_producto en Supabase...');
            const response = await supabaseClient.rpc('crear_producto', {
                p_nombre: nombre || null, // Si el nombre está vacío, se envía null
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

            console.log('Respuesta completa de Supabase:', JSON.stringify(response, null, 2)); // Depuración detallada

            // Verificar si la respuesta contiene un error
            if (response.data && response.data.error) {
                console.error('Error creando producto:', response.data.error);
                alert('Error al crear el producto: ' + response.data.error);
            } else if (response.error) {
                // Manejar errores de Supabase (por ejemplo, problemas de conexión)
                console.error('Error de Supabase:', response.error);
                alert('Error de Supabase: ' + response.error.message);
            } else {
                // Si no hay errores, mostrar mensaje de éxito
                console.log('Producto creado correctamente.');
                alert('Producto creado correctamente.');
                await cargarProductos(); // Recargar la tabla de productos
            }
        });
    } else {
        console.error('Formulario no encontrado.');
    }
}

// Cargar datos para los selectores del formulario (tipos de lentes, materiales, etc.)
async function cargarDatosFormulario() {
    console.log('Cargando datos del formulario...');

    try {
        // Obtener datos de Supabase
        const tiposLentes = await supabaseClient.rpc('cargar_tipos_lentes');
        const materiales = await supabaseClient.rpc('cargar_materiales');
        const indicesRefraccion = await supabaseClient.rpc('cargar_indices_refraccion');
        const laboratorios = await supabaseClient.rpc('cargar_laboratorios');
        const tratamientos = await supabaseClient.rpc('cargar_tratamientos');

        console.log('Datos cargados:', {
            tiposLentes,
            materiales,
            indicesRefraccion,
            laboratorios,
            tratamientos
        });

        // Llenar los selectores del formulario
        llenarSelector('tipo_lente', tiposLentes.data);
        llenarSelector('material', materiales.data);
        llenarSelector('indice_refraccion', indicesRefraccion.data);
        llenarSelector('laboratorio', laboratorios.data);

        // Llenar los tratamientos como filas de la tabla
        const tratamientosContainer = document.getElementById('tratamientos');
        if (tratamientosContainer) {
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
        } else {
            console.error('Contenedor de tratamientos no encontrado.');
        }

        // Agregar evento para mostrar la vista previa cuando cambien los valores del formulario
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('input', mostrarVistaPrevia);
        } else {
            console.error('Formulario no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando datos del formulario:', error);
    }
}

// Llenar un selector con datos
function llenarSelector(id, datos) {
    console.log(`Llenando selector ${id} con datos...`);
    const selector = document.getElementById(id);
    if (selector) {
        datos.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre || item.valor;  // Usar 'valor' para índices de refracción
            selector.appendChild(option);
        });
    } else {
        console.error(`Selector ${id} no encontrado.`);
    }
}

// Mostrar vista previa del producto
function mostrarVistaPrevia() {
    console.log('Mostrando vista previa del producto...');

    const nombre = document.getElementById('nombre')?.value;
    const tipo_lente = document.getElementById('tipo_lente')?.options[document.getElementById('tipo_lente')?.selectedIndex]?.text;
    const material = document.getElementById('material')?.options[document.getElementById('material')?.selectedIndex]?.text;
    const indice_refraccion = document.getElementById('indice_refraccion')?.options[document.getElementById('indice_refraccion')?.selectedIndex]?.text;
    const laboratorio = document.getElementById('laboratorio')?.options[document.getElementById('laboratorio')?.selectedIndex]?.text;
    const min_esf = document.getElementById('min_esf')?.value;
    const max_esf = document.getElementById('max_esf')?.value;
    const cil = document.getElementById('cil')?.value;
    const precio = formatearPrecio(document.getElementById('precio')?.value); // Formatear el precio

    // Obtener los tratamientos seleccionados
    const tratamientos = Array.from(document.querySelectorAll('input[name="tratamientos"]:checked')).map(checkbox => {
        const fila = checkbox.closest('tr');
        const nombreTratamiento = fila.querySelector('td:first-child').textContent;
        return nombreTratamiento;
    }).join(', ');

    const vistaPrevia = document.getElementById('vistaPrevia');
    if (vistaPrevia) {
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
    } else {
        console.error('Contenedor de vista previa no encontrado.');
    }
}

// Cargar productos en la tabla
async function cargarProductos() {
    console.log('Cargando productos en la tabla...');

    try {
        const { data: productos, error } = await supabaseClient.rpc('cargar_productos');

        if (error) throw error;

        console.log('Productos cargados:', productos);

        const tbody = document.querySelector('#productTable tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            // Verificar si hay productos
            if (productos && productos.length > 0) {
                productos.forEach(producto => {
                    const tratamientos = producto.tratamientos ? producto.tratamientos.join(', ') : '';
                    const precio = formatearPrecio(producto.precio); // Formatear el precio

                    const min_esf = formatearNumero(producto.min_esf);
                    const max_esf = formatearNumero(producto.max_esf);
                    const cil = formatearNumero(producto.cil);

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${producto.id}</td> <!-- Mostrar el ID del producto -->
                        <td>${producto.nombre}</td>
                        <td>${producto.tipo_lente}</td>
                        <td>${producto.material}</td>
                        <td>${producto.laboratorio}</td>
                        <td>${min_esf}</td>
                        <td>${max_esf}</td>
                        <td>${cil}</td>
                        <td>${precio}</td>
                        <td>${tratamientos}</td>
                        <td>
                            <i class="fas fa-trash-alt" style="color: red; cursor: pointer;" data-producto-id="${producto.id}"></i>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Agregar evento para eliminar productos
                tbody.querySelectorAll('.fa-trash-alt').forEach(icon => {
                    icon.addEventListener('click', async (e) => {
                        const productoId = e.target.getAttribute('data-producto-id');
                        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

                        if (userError || !user) {
                            console.error('Usuario no autenticado:', userError ? userError.message : 'No hay usuario');
                            alert('Error: Usuario no autenticado.');
                            return;
                        }

                        const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
                        if (confirmacion) {
                            const response = await supabaseClient.rpc('eliminar_producto', {
                                p_producto_id: productoId,
                                p_user_id: user.id
                            });

                            if (response.data && response.data.error) {
                                console.error('Error eliminando producto:', response.data.error);
                                alert('Error al eliminar el producto: ' + response.data.error);
                            } else if (response.error) {
                                console.error('Error de Supabase:', response.error);
                                alert('Error de Supabase: ' + response.error.message);
                            } else {
                                console.log('Producto eliminado correctamente.');
                                alert('Producto eliminado correctamente.');
                                await cargarProductos(); // Recargar la tabla de productos
                            }
                        }
                    });
                });
            } else {
                // Si no hay productos, mostrar un mensaje en la tabla
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="11" style="text-align: center;">No hay productos disponibles.</td>
                `;
                tbody.appendChild(row);
            }
        } else {
            console.error('Cuerpo de la tabla de productos no encontrado.');
        }
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