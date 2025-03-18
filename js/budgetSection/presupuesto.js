// new Presupuesto
import * as dataLoader from './resources/dataLoader.js';
import { estadoGlobal } from './estadoGlobal.js';
import * as prescription from './prescription/prescription.js';
import * as filtradoProductos from './productos/filtradoProductos.js';
import * as calculosPresupuesto from './productos/calculosPresupuesto.js';


// Obtener los valores de ESF y CIL de la receta
const odLejosEsf = parseFloat(document.getElementById('od-lejos-esf').value) || null;
const odLejosCil = parseFloat(document.getElementById('od-lejos-cil').value) || null;
const oiLejosEsf = parseFloat(document.getElementById('oi-lejos-esf').value) || null;
const oiLejosCil = parseFloat(document.getElementById('oi-lejos-cil').value) || null;



//------Sección para manejar la contracción/expansión de las secciones-------------
function toggleSection(event) {
    if (!event || !event.currentTarget) {
        console.error('Evento no válido');
        return;
    }

    const icon = event.currentTarget.querySelector('.toggle-icon');
    if (!icon) {
        console.error('No se encontró el ícono .toggle-icon');
        return;
    }

    const targetId = icon.getAttribute('data-target');
    if (!targetId) {
        console.error('No se encontró el atributo data-target en el ícono');
        return;
    }

    const sectionContent = document.getElementById(targetId);
    if (!sectionContent) {
        console.error('No se encontró el contenido de la sección con el ID:', targetId);
        return;
    }

    const section = sectionContent.parentElement;
    if (!section) {
        console.error('No se encontró la sección padre');
        return;
    }

    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
    } else {
        section.classList.add('collapsed');
    }
}
function agregarEventosToggleSection() {    
// Función para agregar eventos de clic a los títulos de las secciones
    const headers = document.querySelectorAll('h2');
    headers.forEach(header => {
        if (header.querySelector('.toggle-icon')) {
            header.addEventListener('click', toggleSection);
        }
    });
}
//------Fin Sección para manejar la contracción/expansión de las secciones---------

// Código de inicialización del presupuesto
export async function initPresupuesto() {
    // Agregar eventos de clic a los títulos de las secciones
    agregarEventosToggleSection();

    // Llenar los select con los datos necesarios
    await dataLoader.llenarSelectTratamientos(); // Esperar a que se carguen los tratamientos
    await dataLoader.llenarSelectLaboratorios();
    await dataLoader.llenarSelectTiposLentes();
    await dataLoader.llenarSelectIndicesRefraccion();

    // Cargar productos filtrados
    await filtradoProductos.cargarProductosFiltrados(null, null, null, null);

    // Inicializar los eventos de la receta (prescription)
    prescription.initPrescription();

    // Manejar la selección de productos y cálculos
    calculosPresupuesto.manejarSeleccionProducto();
    calculosPresupuesto.agregarEventosCalculos();
    calculosPresupuesto.inicializarProductoSeleccionado();
    calculosPresupuesto.llenarVendedor();
}


// Asegúrate de que el DOM esté cargado antes de ejecutar initPresupuesto
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
});