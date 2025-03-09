// js/generarPdf.js

// Función para formatear la fecha en formato "dia/mes/año"
function formatearFecha(date) {
    const dia = String(date.getDate()).padStart(2, '0'); // Asegura 2 dígitos para el día
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Asegura 2 dígitos para el mes
    const año = date.getFullYear(); // Obtiene el año completo
    return `${dia}/${mes}/${año}`; // Retorna la fecha en formato "dia/mes/año"
}

// Función para generar el PDF
function generarPDF() {
    console.log('Generando PDF...');

    // Capturar los datos de la tabla
    const vendedor = document.getElementById('vendedor').value;
    const cliente = document.getElementById('cliente').value;
    const producto = document.getElementById('producto-nombre').value;
    const tratamientos = document.getElementById('producto-tratamientos').value;
    const precioCristales = document.getElementById('Precio-Cristales').value;
    const armazonModelo = document.getElementById('armazon-modelo').value;
    const precioArmazon = document.getElementById('producto-armazon').value;
    const precioFinal = document.getElementById('producto-precio-final').value;

    // Obtener la fecha actual y formatearla
    const fecha = formatearFecha(new Date());

    // Cargar la plantilla HTML desde la carpeta "res"
    fetch('../res/plantilla-pdf.html') // Ruta ajustada
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
            elemento.innerHTML = contenido;

            // Configuración de html2pdf
            const opciones = {
                margin: 10,
                filename: `Presupuesto_${cliente}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generar el PDF
            html2pdf().set(opciones).from(elemento).save();
        })
        .catch(error => {
            console.error('Error al cargar la plantilla:', error);
        });
}

// Asignar la función al botón de PDF
document.getElementById('generar-pdf').addEventListener('click', generarPDF);