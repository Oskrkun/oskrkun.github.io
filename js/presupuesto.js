import { supabaseClient } from './supabaseConfig.js';

// Función para cargar los tipos de lentes
async function cargarTiposLentes() {
    console.log('Cargando tipos de lentes...');

    try {
        // Obtener datos de Supabase
        const { data: tiposLentes, error } = await supabaseClient.rpc('cargar_tipos_lentes');

        if (error) throw error;

        console.log('Tipos de lentes cargados:', tiposLentes);

        // Llenar la tabla de tipos de lentes
        const tipoLentesContainer = document.getElementById('tipoLentes');
        if (tipoLentesContainer) {
            tipoLentesContainer.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

            tiposLentes.forEach(tipoLente => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tipoLente.nombre}</td>
                    <td>
                        <input type="radio" id="tipoLente_${tipoLente.id}" name="tipoLente" value="${tipoLente.id}">
                    </td>
                `;
                tipoLentesContainer.appendChild(row);
            });

            // Agregar evento para permitir solo un checkbox seleccionado
            tipoLentesContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', function () {
                    if (this.checked) {
                        // Desmarcar todos los otros radios
                        tipoLentesContainer.querySelectorAll('input[type="radio"]').forEach(otherRadio => {
                            if (otherRadio !== this) {
                                otherRadio.checked = false;
                            }
                        });
                    }
                });
            });
        } else {
            console.error('Contenedor de tipos de lentes no encontrado.');
        }
    } catch (error) {
        console.error('Error cargando tipos de lentes:', error);
    }
}

// Llamar a la función para cargar tipos de lentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initPresupuesto();
    cargarTiposLentes(); // Cargar los tipos de lentes
});