import { supabaseClient } from '../../supabaseConfig.js';



// Función para obtener la información del laboratorio
export async function obtenerLaboratorioInfo(laboratorioId, servicioId) {
    try {
        const { data, error } = await supabaseClient.rpc('get_laboratorio_info', {
            lab_id: laboratorioId,
            serv_id: servicioId
        });

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error obteniendo información del laboratorio:', error);
        return []; // Devolver un array vacío en caso de error
    }
}

//------Sección para cargar los productos filtrados--------------------------------
export async function obtenerProductosFiltrados(tipoLenteId, laboratorioId, tratamientos, indiceRefraccionId) {
    const { data, error } = await supabaseClient.rpc('cargar_productos_filtrados', {
        p_tipo_lente_id: tipoLenteId || null,
        p_laboratorio_id: laboratorioId || null,
        p_tratamientos: tratamientos.length > 0 ? tratamientos : null,
        p_indice_refraccion_id: indiceRefraccionId || null,
    });
    if (error) throw error;
    return data;
}

// Función para obtener la lista de tratamientos desde Supabase
export async function listaDeTratamientos() {
    try {
        // Obtener datos de Supabase
        const { data: tratamientos, error } = await supabaseClient.rpc('cargar_tratamientos');

        if (error) throw error;

        // Devolver la lista de tratamientos
        return tratamientos;
    } catch (error) {
        console.error('Error obteniendo lista de tratamientos:', error);
        return []; // Devolver un array vacío en caso de error
    }
}

// Función para obtener la lista de laboratorios desde Supabase
export async function listaDeLaboratorios() {
    try {
        // Obtener datos de Supabase
        const { data: laboratorios, error } = await supabaseClient.rpc('cargar_laboratorios');

        if (error) throw error;

        // Devolver la lista de laboratorios
        return laboratorios;
    } catch (error) {
        console.error('Error obteniendo lista de laboratorios:', error);
        return []; // Devolver un array vacío en caso de error
    }
}

// Función para obtener la lista de tipos de lentes desde Supabase
export async function listaDeTiposLentes() {
    try {
        // Obtener datos de Supabase
        const { data: tiposLentes, error } = await supabaseClient.rpc('cargar_tipos_lentes');

        if (error) throw error;

        // Devolver la lista de tipos de lentes
        return tiposLentes;
    } catch (error) {
        console.error('Error obteniendo lista de tipos de lentes:', error);
        return []; // Devolver un array vacío en caso de error
    }
}

// Función para obtener la lista de índices de refracción desde Supabase
export async function listaDeIndicesRefraccion() {
    try {
        // Obtener datos de Supabase
        const { data: indicesRefraccion, error } = await supabaseClient.rpc('cargar_indices_refraccion');

        if (error) throw error;

        // Ordenar los índices de refracción por su valor
        indicesRefraccion.sort((a, b) => a.valor - b.valor);

        // Devolver la lista de índices de refracción
        return indicesRefraccion;
    } catch (error) {
        console.error('Error obteniendo lista de índices de refracción:', error);
        return []; // Devolver un array vacío en caso de error
    }
}