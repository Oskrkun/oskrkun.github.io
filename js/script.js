// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Configurar el token de autenticación si está disponible
const supabaseAuthToken = localStorage.getItem('supabaseAuthToken');
if (supabaseAuthToken) {
    supabaseClient.auth.setAuth(supabaseAuthToken);
}

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // Si el usuario no está autenticado, redirigir al inicio de sesión
        window.location.href = 'Index.html';
    }
}

// Función para cargar los productos en la tabla
async function cargarProductos() {
    const { data, error } = await supabaseClient
        .from('productos')
        .select('*, laboratorios(nombre), tipos_lentes(nombre), materiales(nombre), indices_refraccion(valor)');

    if (error) {
        console.error('Error al cargar productos:', error.message);
        alert('No se pudieron cargar los productos. Verifique la conexión con Supabase.');
        return;
    }

    if (!data || data.length === 0) {
        console.warn('No se encontraron productos.');
        alert('No hay productos disponibles para mostrar.');
        return;
    }

    const tbody = document.querySelector('#productos-table tbody');
    tbody.innerHTML = ''; // Limpiar las filas existentes

    data.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.laboratorios?.nombre || 'Sin laboratorio'}</td>
            <td>${producto.nombre}</td>
            <td>${producto.materiales?.nombre || 'Sin material'}</td>
            <td>${producto.indices_refraccion?.valor || 'Sin índice'}</td>
            <td>${formatearNumeroConSigno(producto.esf_min)}</td>
            <td>${formatearNumeroConSigno(producto.esf_max)}</td>
            <td>${formatearNumeroConSigno(producto.cilindrico)}</td>
            <td></td> <!-- Tratamientos -->
            <td>${producto.precio?.toFixed(2) || '0.00'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Función para mostrar los números con un signo (+/-)
function formatearNumeroConSigno(valor) {
    if (valor === null || valor === undefined) return ''; // Manejar valores nulos o indefinidos
    const numero = parseFloat(valor);
    if (numero >= 0) {
        return `+${numero.toFixed(2)}`; // Agregar + a números positivos
    } else {
        return numero.toFixed(2); // Conservar - en números negativos
    }
}

// Llamar a la función principal de autenticación y cargar productos
document.addEventListener('DOMContentLoaded', async () => {
    await verificarAutenticacion();
    await cargarProductos();
});