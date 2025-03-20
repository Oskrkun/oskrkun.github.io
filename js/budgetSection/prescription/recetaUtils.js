// recetaUtils.js
import { estadoGlobal } from '../estadoGlobal.js';
import { ajustarValorAPasos } from './errorAux.js';

// Función para actualizar la parte de cerca cuando se ingresa ADD o se modifica lejos
export function actualizarCercaDesdeLejosOADD() {
    const addOD = parseFloat(document.getElementById('add-od').value) || null;
    const addOI = parseFloat(document.getElementById('add-oi').value) || null;

    // Actualizar OD Cerca solo si hay un ADD válido
    if (addOD !== null && addOD !== 0 && estadoGlobal.receta.od_lejos.esf !== null) {
        const esfCercaOD = estadoGlobal.receta.od_lejos.esf + addOD;
        document.getElementById('od-cerca-esf').value = esfCercaOD !== null ? ajustarValorAPasos(esfCercaOD.toString()) : '';
        estadoGlobal.receta.od_cerca.esf = esfCercaOD;
    } else {
        // Si no hay ADD, limpiar el campo de cerca
        document.getElementById('od-cerca-esf').value = '';
        estadoGlobal.receta.od_cerca.esf = null;
    }

    // Actualizar OI Cerca solo si hay un ADD válido
    if (addOI !== null && addOI !== 0 && estadoGlobal.receta.oi_lejos.esf !== null) {
        const esfCercaOI = estadoGlobal.receta.oi_lejos.esf + addOI;
        document.getElementById('oi-cerca-esf').value = esfCercaOI !== null ? ajustarValorAPasos(esfCercaOI.toString()) : '';
        estadoGlobal.receta.oi_cerca.esf = esfCercaOI;
    } else {
        // Si no hay ADD, limpiar el campo de cerca
        document.getElementById('oi-cerca-esf').value = '';
        estadoGlobal.receta.oi_cerca.esf = null;
    }

    // Mantener CIL y EJE iguales a los de lejos (solo si hay ADD válido)
    if (addOD !== null && addOD !== 0) {
        estadoGlobal.receta.od_cerca.cil = estadoGlobal.receta.od_lejos.cil;
        estadoGlobal.receta.od_cerca.eje = estadoGlobal.receta.od_lejos.eje;
        document.getElementById('od-cerca-cil').value = estadoGlobal.receta.od_cerca.cil !== null ? ajustarValorAPasos(estadoGlobal.receta.od_cerca.cil.toString()) : '';
        document.getElementById('od-cerca-eje').value = estadoGlobal.receta.od_cerca.eje || '';
    } else {
        // Si no hay ADD, limpiar los campos de CIL y EJE
        estadoGlobal.receta.od_cerca.cil = null;
        estadoGlobal.receta.od_cerca.eje = null;
        document.getElementById('od-cerca-cil').value = '';
        document.getElementById('od-cerca-eje').value = '';
    }

    if (addOI !== null && addOI !== 0) {
        estadoGlobal.receta.oi_cerca.cil = estadoGlobal.receta.oi_lejos.cil;
        estadoGlobal.receta.oi_cerca.eje = estadoGlobal.receta.oi_lejos.eje;
        document.getElementById('oi-cerca-cil').value = estadoGlobal.receta.oi_cerca.cil !== null ? ajustarValorAPasos(estadoGlobal.receta.oi_cerca.cil.toString()) : '';
        document.getElementById('oi-cerca-eje').value = estadoGlobal.receta.oi_cerca.eje || '';
    } else {
        // Si no hay ADD, limpiar los campos de CIL y EJE
        estadoGlobal.receta.oi_cerca.cil = null;
        estadoGlobal.receta.oi_cerca.eje = null;
        document.getElementById('oi-cerca-cil').value = '';
        document.getElementById('oi-cerca-eje').value = '';
    }
}

// Función para borrar toda la receta
export function borrarReceta() {
    // Limpiar campos de lejos
    document.getElementById('od-lejos-esf').value = '';
    document.getElementById('od-lejos-cil').value = '';
    document.getElementById('od-lejos-eje').value = '';
    document.getElementById('oi-lejos-esf').value = '';
    document.getElementById('oi-lejos-cil').value = '';
    document.getElementById('oi-lejos-eje').value = '';

    // Limpiar campos de cerca
    document.getElementById('od-cerca-esf').value = '';
    document.getElementById('od-cerca-cil').value = '';
    document.getElementById('od-cerca-eje').value = '';
    document.getElementById('oi-cerca-esf').value = '';
    document.getElementById('oi-cerca-cil').value = '';
    document.getElementById('oi-cerca-eje').value = '';

    // Limpiar campos de ADD
    document.getElementById('add-od').value = '';
    document.getElementById('add-oi').value = '';

    // Limpiar el estado global
    estadoGlobal.receta = {
        od_lejos: { esf: null, cil: null, eje: null },
        oi_lejos: { esf: null, cil: null, eje: null },
        od_add: null,
        oi_add: null,
        od_cerca: { esf: null, cil: null, eje: null },
        oi_cerca: { esf: null, cil: null, eje: null }
    };

    // Forzar la actualización de la interfaz
    actualizarInterfazDesdeEstadoGlobal();
}

// Función para copiar el valor de ADD de un ojo al otro
export function copiarADD(event) {
    if (event.target.id.includes('add')) {
        const idActual = event.target.id; // 'add-od' o 'add-oi'

        // Determinar el ID del ojo opuesto
        const idOpuesto = idActual === 'add-od' ? 'add-oi' : 'add-od'; // ID del ojo opuesto

        const valorADD = event.target.value;

        // Actualizar el input del ojo opuesto
        const inputOpuesto = document.getElementById(idOpuesto);
        if (inputOpuesto) {
            inputOpuesto.value = valorADD; // Actualizar el valor en el DOM

            // Forzar la actualización del DOM
            inputOpuesto.dispatchEvent(new Event('input'));

            // Actualizar el estado global del ojo opuesto
            actualizarEstadoGlobal(inputOpuesto.id, valorADD);
        } else {
            console.error(`No se encontró el input del ojo opuesto: ${idOpuesto}`);
        }
    }
}

// Función para actualizar el estado global
export function actualizarEstadoGlobal(id, value) {
    const partes = id.split('-');
    const ojo = partes[0]; // 'od' o 'oi'
    const tipo = partes[1]; // 'lejos', 'cerca', 'add'
    const campo = partes[2]; // 'esf', 'cil', 'eje' (o undefined si es 'add')

    // Si el tipo es 'add', actualizamos directamente od_add o oi_add
    if (tipo === 'add') {
        estadoGlobal.receta[`${ojo}_add`] = parseFloat(value) || null;
    } else {
        // Para otros tipos (lejos, cerca), actualizamos la estructura anidada
        if (!estadoGlobal.receta[`${ojo}_${tipo}`]) {
            // Si la estructura no existe, la inicializamos
            estadoGlobal.receta[`${ojo}_${tipo}`] = { esf: null, cil: null, eje: null };
        }
        estadoGlobal.receta[`${ojo}_${tipo}`][campo] = parseFloat(value) || null;
    }

    // Si se modificó un campo de lejos o ADD, recalcular la parte de cerca
    if (tipo === 'lejos' || tipo === 'add') {
        actualizarCercaDesdeLejosOADD();
    }
}

// Función para trasponer la receta de lejos
export function trasponerReceta() {
    // Trasponer OD Lejos
    if (estadoGlobal.receta.od_lejos.esf !== null && estadoGlobal.receta.od_lejos.cil !== null) {
        estadoGlobal.receta.od_lejos.esf = estadoGlobal.receta.od_lejos.esf + estadoGlobal.receta.od_lejos.cil;
        estadoGlobal.receta.od_lejos.cil = -estadoGlobal.receta.od_lejos.cil;
        estadoGlobal.receta.od_lejos.eje = estadoGlobal.receta.od_lejos.eje <= 90 ? estadoGlobal.receta.od_lejos.eje + 90 : estadoGlobal.receta.od_lejos.eje - 90;
    }

    // Trasponer OI Lejos
    if (estadoGlobal.receta.oi_lejos.esf !== null && estadoGlobal.receta.oi_lejos.cil !== null) {
        estadoGlobal.receta.oi_lejos.esf = estadoGlobal.receta.oi_lejos.esf + estadoGlobal.receta.oi_lejos.cil;
        estadoGlobal.receta.oi_lejos.cil = -estadoGlobal.receta.oi_lejos.cil;
        estadoGlobal.receta.oi_lejos.eje = estadoGlobal.receta.oi_lejos.eje <= 90 ? estadoGlobal.receta.oi_lejos.eje + 90 : estadoGlobal.receta.oi_lejos.eje - 90;
    }

    // Actualizar la interfaz de usuario
    actualizarInterfazDesdeEstadoGlobal();

    // Si hay ADD, recalcular la parte de cerca
    actualizarCercaDesdeLejosOADD();
}

// Función para actualizar la interfaz de usuario desde el estado global
function actualizarInterfazDesdeEstadoGlobal() {
    // Actualizar OD Lejos
    document.getElementById('od-lejos-esf').value = estadoGlobal.receta.od_lejos.esf !== null ? ajustarValorAPasos(estadoGlobal.receta.od_lejos.esf.toString()) : '';
    document.getElementById('od-lejos-cil').value = estadoGlobal.receta.od_lejos.cil !== null ? ajustarValorAPasos(estadoGlobal.receta.od_lejos.cil.toString()) : '';
    document.getElementById('od-lejos-eje').value = estadoGlobal.receta.od_lejos.eje || '';

    // Actualizar OI Lejos
    document.getElementById('oi-lejos-esf').value = estadoGlobal.receta.oi_lejos.esf !== null ? ajustarValorAPasos(estadoGlobal.receta.oi_lejos.esf.toString()) : '';
    document.getElementById('oi-lejos-cil').value = estadoGlobal.receta.oi_lejos.cil !== null ? ajustarValorAPasos(estadoGlobal.receta.oi_lejos.cil.toString()) : '';
    document.getElementById('oi-lejos-eje').value = estadoGlobal.receta.oi_lejos.eje || '';

    // Si hay ADD, recalcular la parte de cerca
    actualizarCercaDesdeLejosOADD();
}