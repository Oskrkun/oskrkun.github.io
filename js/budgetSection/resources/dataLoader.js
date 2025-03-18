//dataLoaders.js

import * as supaFunctions from './supaFunctions.js';
import{
    supabaseClient
} from '../../supabaseConfig.js';

// Obtener los contenedores
const tratamientosContainer = document.getElementById('tratamientos');
const laboratorioSelect = document.getElementById('laboratorio-select');
const tipoLenteSelect = document.getElementById('tipo-lente-select');
const indiceRefraccionSelect = document.getElementById('indice-refraccion-select');




//------Sección para mostrar los indices de refracción en un select-----------------
export async function llenarSelectIndicesRefraccion() {    

    if (!indiceRefraccionSelect) {
        console.error('Elemento select de índices de refracción no encontrado.');
        return;
    }

    // Obtener la lista de índices de refracción
    const indicesRefraccion = await supaFunctions.listaDeIndicesRefraccion();

    // Limpiar la lista antes de agregar nuevos datos
    indiceRefraccionSelect.innerHTML = '';

    // Agregar la opción "Todos" como primer elemento
    const optionTodos = document.createElement('option');
    optionTodos.value = ''; // Valor vacío para representar "Todos"
    optionTodos.textContent = 'Todos';
    optionTodos.selected = true; // Seleccionada por defecto
    indiceRefraccionSelect.appendChild(optionTodos);

    // Agregar los índices de refracción al <select>
    indicesRefraccion.forEach(indice => {
        const option = document.createElement('option');
        option.value = indice.id; // Usar el ID para filtrar

        // Formatear el valor para que tenga siempre dos decimales
        const valorFormateado = parseFloat(indice.valor).toFixed(2);
        option.textContent = valorFormateado; // Mostrar el valor formateado

        indiceRefraccionSelect.appendChild(option);
    });
}
//------Sección para mostrar los tipos de lentes en un select-----------------------
export async function llenarSelectTiposLentes() {    

    if (!tipoLenteSelect) {
        console.error('Elemento select de tipos de lentes no encontrado.');
        return;
    }

    // Obtener la lista de tipos de lentes
    const tiposLentes = await supaFunctions.listaDeTiposLentes();

    // Limpiar la lista antes de agregar nuevos datos
    tipoLenteSelect.innerHTML = '';

    // Agregar la opción "Todos" como primer elemento
    const optionTodos = document.createElement('option');
    optionTodos.value = ''; // Valor vacío para representar "Todos"
    optionTodos.textContent = 'Todos';
    optionTodos.selected = true; // Seleccionada por defecto
    tipoLenteSelect.appendChild(optionTodos);

    // Agregar los tipos de lentes al <select>
    tiposLentes.forEach(tipoLente => {
        const option = document.createElement('option');
        option.value = tipoLente.id; // Usar el ID para filtrar
        option.textContent = tipoLente.nombre; // Mostrar el nombre en la lista
        tipoLenteSelect.appendChild(option);
    });
}
//------Sección para mostrar los laboratorios en un select--------------------------
export async function llenarSelectLaboratorios() {

    if (!laboratorioSelect) {
        console.error('Elemento select de laboratorios no encontrado.');
        return;
    }

    // Obtener la lista de laboratorios
    const laboratorios = await supaFunctions.listaDeLaboratorios();

    // Limpiar la lista antes de agregar nuevos datos
    laboratorioSelect.innerHTML = '';

    // Agregar la opción "Todos" como primer elemento
    const optionTodos = document.createElement('option');
    optionTodos.value = ''; // Valor vacío para representar "Todos"
    optionTodos.textContent = 'Todos';
    optionTodos.selected = true; // Seleccionar "Todos" por defecto
    laboratorioSelect.appendChild(optionTodos);

    // Agregar los laboratorios al <select>
    laboratorios.forEach(laboratorio => {
        const option = document.createElement('option');
        option.value = laboratorio.id; // Usar el ID para filtrar
        option.textContent = laboratorio.nombre; // Mostrar el nombre en la lista
        laboratorioSelect.appendChild(option);
    });
}
//------Sección para mostrar los tratamientos en una tabla-------------------------
export async function llenarSelectTratamientos() {
    if (!tratamientosContainer) {
        console.error('Contenedor de tratamientos no encontrado.');
        return;
    }

    // Obtener la lista de tratamientos desde Supabase
    const tratamientos = await supaFunctions.listaDeTratamientos();

    // Limpiar solo las filas de tratamientos, no las filas manuales (Laboratorio, Tipo de Lente, Índice de Refracción)
    const filasTratamientos = tratamientosContainer.querySelectorAll('tr.tratamiento-fila');
    filasTratamientos.forEach(fila => fila.remove());

    // Agregar los tratamientos al contenedor
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
}
