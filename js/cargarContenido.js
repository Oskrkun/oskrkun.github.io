// cargarContenido.js

import { initABM } from './abm.js'; // Importar la función de inicialización del ABM

// Variable de estado para controlar si una carga está en progreso
let cargaEnProgreso = false;

// Función para cargar contenido dinámico
export async function cargarContenido(seccion) {
    console.log(`Cargando contenido para la sección: ${seccion}`); // Depuración: Inicio de la carga de contenido

    // Si ya hay una carga en progreso, ignorar el clic
    if (cargaEnProgreso) {
        console.log('Carga en progreso, ignorando clic adicional.'); // Depuración: Carga en progreso
        return;
    }

    // Marcar que una carga está en progreso
    cargaEnProgreso = true;

    const contenidoPrincipal = document.getElementById('contenidoPrincipal');
    contenidoPrincipal.innerHTML = ''; // Limpiar contenido anterior antes de cargar uno nuevo

    try {
        // Cargar el contenido correspondiente según la sección seleccionada
        switch (seccion) {
            case 'abm':
                // Cargar el CSS de ABM
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'css/abm.css';
                document.head.appendChild(link);

                // Cargar el HTML de ABM
                contenidoPrincipal.innerHTML = await fetch('./abm.html').then(res => res.text());

                // Esperar a que el DOM se actualice antes de inicializar el ABM
                await new Promise(resolve => setTimeout(resolve, 0)); // Pequeño retraso para asegurar que el DOM se haya actualizado

                // Inicializar el ABM después de cargar el contenido
                await initABM(); // Llamar a la función de inicialización del ABM
                break;

            case 'agenda':
                contenidoPrincipal.innerHTML = await fetch('agenda.html').then(res => res.text());
                await import('./agenda.js');
                break;

            case 'presupuesto':
				// Cargar el CSS de Presupuesto
				const linkPresupuesto = document.createElement('link');
				linkPresupuesto.rel = 'stylesheet';
				linkPresupuesto.href = 'css/presupuesto.css';
				document.head.appendChild(linkPresupuesto);

				// Cargar el HTML de Presupuesto
				contenidoPrincipal.innerHTML = await fetch('presupuesto.html').then(res => res.text());

				// Esperar a que el DOM se actualice antes de inicializar el Presupuesto
				await new Promise(resolve => setTimeout(resolve, 0));

				// Cargar la librería jsPDF
				const scriptJsPDF = document.createElement('script');
				//scriptJsPDF.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
				scriptJsPDF.src = './js/jspdf.umd.min.js';
				scriptJsPDF.onload = () => {
					console.log('jsPDF cargado correctamente');
				};
				scriptJsPDF.onerror = (error) => {
					console.error('Error al cargar jsPDF:', error);
				};
				document.head.appendChild(scriptJsPDF);

				// Cargar la librería html2canvas
				const scriptHtml2Canvas = document.createElement('script');
				scriptHtml2Canvas.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
				scriptHtml2Canvas.onload = () => {
					console.log('html2canvas cargado correctamente');
				};
				scriptHtml2Canvas.onerror = (error) => {
					console.error('Error al cargar html2canvas:', error);
				};
				document.head.appendChild(scriptHtml2Canvas);

				// Inicializar el Presupuesto después de cargar el contenido
				await import('./presupuesto.js').then(module => module.initPresupuesto());

				// Cargar el script para generar PDF
				await import('../js/generarPdf.js').then(module => {
					console.log('generarPdf.js cargado correctamente');
					// Vincular el evento click al botón
					const botonGenerarPDF = document.getElementById('generar-pdf');
					if (botonGenerarPDF) {
						console.log('Botón de generar PDF encontrado, agregando evento...');
						botonGenerarPDF.addEventListener('click', module.generarPDF);
					} else {
						console.error('No se encontró el botón de generar PDF.');
					}
				}).catch(error => {
					console.error('Error al cargar generarPdf.js:', error);
				});
				break;

            case 'clientes':
                contenidoPrincipal.innerHTML = await fetch('clientes.html').then(res => res.text());
                await import('./clientes.js');
                break;

            case 'armazones':
                contenidoPrincipal.innerHTML = await fetch('armazones.html').then(res => res.text());
                await import('./armazones.js');
                break;

            case 'config':
                contenidoPrincipal.innerHTML = await fetch('config.html').then(res => res.text());
                await import('./config.js');
                break;

            default:
                contenidoPrincipal.innerHTML = '<p>Selecciona una opción del menú.</p>';
        }
    } catch (error) {
        console.error('Error cargando contenido:', error); // Depuración: Error al cargar contenido
    } finally {
        // Marcar que la carga ha terminado
        cargaEnProgreso = false;
        console.log('Carga finalizada.'); // Depuración: Carga finalizada
    }
}