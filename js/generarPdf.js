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

    console.log('Datos capturados:', {
        vendedor,
        cliente,
        producto,
        tratamientos,
        precioCristales,
        armazonModelo,
        precioArmazon,
        precioFinal,
    });

    // Obtener la fecha actual y formatearla
    const fecha = formatearFecha(new Date());
    console.log('Fecha formateada:', fecha);

    // Cargar la plantilla HTML desde la carpeta "res"
    console.log('Cargando plantilla HTML...');
    fetch('../res/plantilla-pdf.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
            }
            return response.text();
        })
        .then(plantilla => {
            console.log('Plantilla cargada correctamente.');

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

            console.log('Contenido de la plantilla reemplazado:', contenido);

            // Crear un elemento temporal para el contenido del PDF
            const elemento = document.createElement('div');
            elemento.classList.add('pdf-content'); // Aplica la clase para estilos específicos
            elemento.innerHTML = contenido;

            // Generar el PDF con jsPDF
            const { jsPDF } = window.jspdf; // Importar jsPDF desde el objeto global
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Usar html2canvas para convertir el HTML en una imagen
            html2canvas(elemento, {
                scale: 2, // Aumentar la escala para mejor calidad
                useCORS: true, // Permitir CORS para imágenes externas
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png', 1.0); // Convertir a imagen PNG

                // Añadir la imagen al PDF
                const imgWidth = 210; // Ancho de A4 en mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calcular altura proporcional

                doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                doc.save(`Presupuesto_${cliente}.pdf`); // Guardar el PDF

                console.log('PDF generado y descargado correctamente.');
            }).catch(error => {
                console.error('Error al generar el PDF:', error);
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