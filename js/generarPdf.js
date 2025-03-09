// js/generarPdf.js

console.log('generarPdf.js cargado correctamente');

// Función para formatear la fecha en formato "dia/mes/año"
function formatearFecha(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
}

// Función para generar el PDF
export function generarPDF() {
    console.log('Generando PDF...');

    // Capturar los datos de la tabla
    const vendedor = document.getElementById('vendedor').value || "";
    const cliente = document.getElementById('cliente').value || "";
    const producto = document.getElementById('producto-nombre').value || "";
    const tratamientos = document.getElementById('producto-tratamientos').value || "";
    const precioCristales = document.getElementById('Precio-Cristales').value || "";
    const armazonModelo = document.getElementById('armazon-modelo').value || "";
    const precioArmazon = document.getElementById('producto-armazon').value || "";
    const precioFinal = document.getElementById('producto-precio-final').value || "";

    // Obtener la fecha actual y formatearla
    const fecha = formatearFecha(new Date());

    // Cargar la plantilla HTML
    fetch('../res/plantilla-pdf.html')
        .then(response => response.text())
        .then(plantilla => {
            // Reemplazar los placeholders con los datos capturados
            const contenido = plantilla
                .replace('{{fecha}}', fecha)
                .replace('{{vendedor}}', vendedor)
                .replace('{{cliente}}', cliente)
                .replace('{{producto}}', producto)
                .replace('{{Tratamientos}}', tratamientos)
                .replace('{{precioCristales}}', precioCristales)
                .replace('{{armazonModelo}}', armazonModelo)
                .replace('{{precioArmazon}}', precioArmazon)
                .replace('{{precioFinal}}', precioFinal);

            // Crear un elemento temporal para el contenido del PDF
            const elemento = document.createElement('div');
            elemento.classList.add('pdf-content');
            elemento.innerHTML = contenido;

            // Agregar el elemento al DOM (fuera de la pantalla)
            elemento.style.position = 'absolute';
            elemento.style.left = '-9999px';
            document.body.appendChild(elemento);

            // Esperar a que las imágenes se carguen
            const images = elemento.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
                return new Promise((resolve, reject) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = reject;
                    }
                });
            });

            Promise.all(imagePromises)
                .then(() => {
                    // Generar el PDF
                    html2canvas(elemento, {
                        scale: 2,
                        useCORS: true,
                    }).then(canvas => {
                        // Verificar si el elemento todavía está en el DOM antes de eliminarlo
                        if (elemento.parentNode) {
                            document.body.removeChild(elemento); // Eliminar el elemento después de capturarlo
                        }

                        // Convertir el canvas a una imagen PNG
                        const imgData = canvas.toDataURL('image/png', 1.0);

                        // Acceder a jsPDF desde el objeto global
                        const { jsPDF } = window.jspdf;

                        // Crear un nuevo documento PDF
                        const doc = new jsPDF({
                            orientation: 'portrait',
                            unit: 'mm',
                            format: 'a4',
                        });

                        // Calcular las dimensiones de la imagen para que se ajuste al PDF
                        const imgWidth = 210; // Ancho de A4 en mm
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;

                        // Agregar la imagen al PDF
                        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

                        // Guardar el PDF
                        doc.save(`Presupuesto_${cliente}.pdf`);

                        console.log('PDF generado y descargado correctamente.');
                    }).catch(error => {
                        console.error('Error al generar el PDF:', error);
                        // Asegurarse de eliminar el elemento en caso de error
                        if (elemento.parentNode) {
                            document.body.removeChild(elemento);
                        }
                    });
                })
                .catch(error => {
                    console.error('Error al cargar imágenes:', error);
                    // Asegurarse de eliminar el elemento en caso de error
                    if (elemento.parentNode) {
                        document.body.removeChild(elemento);
                    }
                });
        })
        .catch(error => {
            console.error('Error al cargar la plantilla:', error);
        });
}

// Esperar a que el DOM esté completamente cargado antes de agregar el evento
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('Buscando el botón de generar PDF...');
        const botonGenerarPDF = document.getElementById('generar-pdf');
        if (botonGenerarPDF) {
            console.log('Botón de generar PDF encontrado, agregando evento...');
            botonGenerarPDF.addEventListener('click', generarPDF);
        } else {
            console.error('No se encontró el botón de generar PDF.');
        }
    }, 1000); // Espera 1 segundo antes de buscar el botón
});