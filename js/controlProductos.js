// controlProductos.js
import { supabaseClient } from './supabaseConfig.js';
import { cargarProductosFiltrados } from './filtradoProductos.js';

// Almacenar elementos del DOM en variables
const h2Productos = document.querySelector('#ProductosSection h2');
const tratamientosContainer = document.getElementById('tratamientos');
const laboratorioSelect = document.getElementById('laboratorio-select');
const tipoLenteSelect = document.getElementById('tipo-lente-select');
const indiceRefraccionSelect = document.getElementById('indice-refraccion-select'); // Nueva constante
const inputsReceta = document.querySelectorAll('.vista-previa input');
const tipoLenteRadios = document.querySelectorAll('input[name="tipoLente"]');
const tratamientosCheckboxes = document.querySelectorAll('input[name="tratamientos"]');

// Función para actualizar el contador de productos en el h2
export function actualizarContadorProductos(cantidad) {
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
    // Evento para los radios de tipo de lente
    tipoLenteRadios.forEach(radio => {
        radio.addEventListener('change', cargarProductosFiltrados);
    });

    // Evento para los checkboxes de tratamientos
    tratamientosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', cargarProductosFiltrados);
    });

    // Evento para el select de laboratorio
    const laboratorioSelect = document.getElementById('laboratorio-select');
    if (laboratorioSelect) {
        laboratorioSelect.addEventListener('change', cargarProductosFiltrados);
    }

    // Evento para el select de índice de refracción
    const indiceRefraccionSelect = document.getElementById('indice-refraccion-select');
    if (indiceRefraccionSelect) {
        indiceRefraccionSelect.addEventListener('change', cargarProductosFiltrados);
    }
}

// Función para cargar los laboratorios desde Supabase
export async function cargarLaboratorios() {
    try {
        // Obtener datos de Supabase
        const { data: laboratorios, error } = await supabaseClient.rpc('cargar_laboratorios');

        if (error) throw error;

        // Llenar la lista desplegable de laboratorios
        if (laboratorioSelect) {
            laboratorioSelect.innerHTML = ''; // Limpiar la lista antes de agregar nuevos datos

            // Agregar la opción "Todos" como primer elemento
            const optionTodos = document.createElement('option');
            optionTodos.value = ''; // Valor vacío para representar "Todos"
            optionTodos.textContent = 'Todos';
            optionTodos.selected = true; // Seleccionar "Todos" por defecto
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

// Función para cargar los índices de refracción desde Supabase
export async function cargarIndicesRefraccion() {
    try {
        // Obtener datos de Supabase
        const { data: indicesRefraccion, error } = await supabaseClient.rpc('cargar_indices_refraccion');

        if (error) throw error;

        // Ordenar los índices de refracción por su valor
        indicesRefraccion.sort((a, b) => a.valor - b.valor);

        // Llenar la lista desplegable de índices de refracción
        if (indiceRefraccionSelect) {
            indiceRefraccionSelect.innerHTML = ''; // Limpiar la lista antes de agregar nuevos datos

            // Agregar la opción "Todos" como primer elemento
            const optionTodos = document.createElement('option');
            optionTodos.value = ''; // Valor vacío para representar "Todos"
            optionTodos.textContent = 'Todos';
            optionTodos.selected = true; // Seleccionada por defecto
            indiceRefraccionSelect.appendChild(optionTodos);

            // Agregar los índices de refracción
            indicesRefraccion.forEach(indice => {
                const option = document.createElement('option');
                option.value = indice.id;

                // Formatear el valor para que tenga siempre dos decimales
                const valorFormateado = parseFloat(indice.valor).toFixed(2);
                option.textContent = valorFormateado; // Mostrar el valor formateado

                indiceRefraccionSelect.appendChild(option);
            });
        } else {
            console.error('Elemento select de índices de refracción no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando índices de refracción:', error);
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
    inputsReceta.forEach(input => {
        input.addEventListener('blur', cargarProductosFiltrados);
    });
}