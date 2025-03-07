// presupuesto.js
// Oskrkun 14.55.6.3.25
import { supabaseClient } from './supabaseConfig.js';
import {
    MAX_ADD,
    MAX_ESF,
    MAX_CIL,
    erroresActivos,
    crearAdvertencias,
    actualizarErrores,
    validarInput,
    ajustarValorAPasos,
    onInputFocus,
    onInputBlur,
    revisarErroresYActualizarCerca,
    mostrarAdvertenciaEjeFaltante,
    mostrarAdvertenciaAddDiferente,
    mostrarAdvertenciaMaxEsfCil,
    calcularCerca,
    sincronizarCambios,
    agregarEventosSincronizacion,
    esEsfOCil,
    transponerReceta,
    sincronizarTodo
} from './controlReceta.js';

// Función para inicializar el presupuesto
export async function initPresupuesto() {
    console.log('Inicializando presupuesto...');

    // Crear los span de advertencia dinámicamente
    crearAdvertencias();

    // Deshabilitar los campos de "cerca"
    deshabilitarCamposCerca();

    // Agregar eventos a los inputs de "lejos" y "ADD"
    const inputs = document.querySelectorAll('.vista-previa input:not(.seccion-cerca input)');
    inputs.forEach(input => {
        input.addEventListener('input', validarInput);
        input.addEventListener('focus', onInputFocus); // Evento al entrar al input
        input.addEventListener('blur', onInputBlur); // Evento al salir del input

        // Agregar evento para borrar el contenido al recibir el foco
        input.addEventListener('focus', function () {
            if (this.value !== '') {
                this.value = ''; // Borrar el contenido si no está vacío
            }
        });
    });

    console.log('Eventos agregados a los inputs.');

    // Agregar eventos para sincronizar cambios
    agregarEventosSincronizacion();

    // Mostrar advertencia si las ADD son diferentes
    mostrarAdvertenciaAddDiferente();

    // Agregar evento al botón de rotación
    agregarEventoBotonRotacion();

    // Cargar tipos de lentes desde Supabase
    await cargarTiposLentes();

    // Cargar tratamientos desde Supabase
    await cargarTratamientos();

    // Cargar productos filtrados
    await cargarProductosFiltrados();

    // Agregar eventos para filtrar productos cuando cambian las selecciones
    agregarEventosFiltrado();
}

// Función para agregar evento al botón de rotación
function agregarEventoBotonRotacion() {
    const botonRotacion = document.querySelector('#arrow-trasp button');
    if (botonRotacion) {
        botonRotacion.addEventListener('click', () => {
            console.log('Botón de transposición presionado');
            transponerReceta(); // Realizar la transposición
            sincronizarTodo(); // Sincronizar cambios después de la transposición
        });
    }
}

// Función para deshabilitar los campos de "cerca"
function deshabilitarCamposCerca() {
    const inputsCerca = document.querySelectorAll('.seccion-cerca input');
    inputsCerca.forEach(input => {
        input.disabled = true; // Deshabilitar los campos de "cerca"
    });
}

// Función para cargar los tipos de lentes desde Supabase
async function cargarTiposLentes() {
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
async function cargarTratamientos() {
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
                    // Aquí puedes agregar lógica para manejar la selección de tratamientos
                });
            });
        } else {
            console.error('Contenedor de tratamientos no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando tratamientos:', error);
    }
}

// Función para cargar productos filtrados
async function cargarProductosFiltrados() {
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

        // Llenar la tabla de productos
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
                // Si no hay productos, mostrar un mensaje en la tabla
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="9" style="text-align: center;">No hay productos disponibles.</td>
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

// Función para actualizar la lista de productos cuando cambian las selecciones
function agregarEventosFiltrado() {
    const tipoLenteRadios = document.querySelectorAll('input[name="tipoLente"]');
    const tratamientosCheckboxes = document.querySelectorAll('input[name="tratamientos"]');

    tipoLenteRadios.forEach(radio => {
        radio.addEventListener('change', cargarProductosFiltrados);
    });

    tratamientosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', cargarProductosFiltrados);
    });
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

// Función para manejar la contracción/expansión de las secciones
function toggleSection(event) {
    const icon = event.target;
    const targetId = icon.getAttribute('data-target');
    const sectionContent = document.getElementById(targetId);
    const section = sectionContent.parentElement;

    if (section.classList.contains('collapsed')) {
        // Expandir la sección
        section.classList.remove('collapsed');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        // Contraer la sección
        section.classList.add('collapsed');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// Agregar eventos a los íconos de flecha
document.querySelectorAll('.toggle-icon').forEach(icon => {
    icon.addEventListener('click', toggleSection);
});

// Inicializar el presupuesto cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});