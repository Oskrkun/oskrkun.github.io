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
                        scale: 2, // Aumentar la escala para mejor calidad
                        useCORS: true, // Permitir CORS para imágenes externas
                    }).then(canvas => {
                        // Verificar si el elemento todavía está en el DOM antes de eliminarlo
                        if (elemento.parentNode) {
                            document.body.removeChild(elemento); // Eliminar el elemento después de capturarlo
                        }

                        // Convertir el canvas a una imagen PNG
                        const imgData = canvas.toDataURL('image/png', 1.0);

                        // Acceder a jsPDF desde el objeto global
                        const { jsPDF } = window.jspdf;

                        // Calcular las dimensiones del contenido
                        const contentWidth = canvas.width; // Ancho del contenido en píxeles
                        const contentHeight = canvas.height; // Alto del contenido en píxeles

                        // Convertir las dimensiones de píxeles a milímetros (1 píxel ≈ 0.264583 mm)
                        const mmWidth = contentWidth * 0.264583;
                        const mmHeight = contentHeight * 0.264583;

                        // Crear un nuevo documento PDF con el tamaño personalizado
                        const doc = new jsPDF({
                            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait', // Orientación basada en las dimensiones
                            unit: 'mm',
                            format: [mmWidth, mmHeight], // Tamaño personalizado
                        });

                        // Agregar la imagen al PDF
                        doc.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);

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