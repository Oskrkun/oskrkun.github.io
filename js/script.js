// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Configurar el token de autenticación si está disponible
const supabaseAuthToken = localStorage.getItem('supabaseAuthToken');
if (supabaseAuthToken) {
    // En versiones recientes de Supabase, no es necesario usar setAuth
    // Simplemente puedes iniciar sesión con el token si es necesario
    supabaseClient.auth.setSession(supabaseAuthToken)
        .then(response => {
            if (response.error) {
                console.error('Error al configurar la sesión:', response.error);
            } else {
                console.log('Sesión configurada correctamente');
            }
        });
}

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    console.log('Verificando autenticación...'); // Depuración
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error); // Depuración
        window.location.href = 'Index.html';
    } else {
        console.log('Usuario autenticado:', user); // Depuración
    }
}

// Función para cargar laboratorios en el menú desplegable
async function cargarLaboratorios() {
    console.log('Cargando laboratorios...'); // Depuración
    const { data, error } = await supabaseClient
        .from('laboratorios')
        .select('*');

    if (error) {
        console.error('Error al cargar laboratorios:', error); // Depuración
    } else {
        console.log('Laboratorios cargados:', data); // Depuración
        const select = document.getElementById('laboratorio');
        select.innerHTML = '<option value="">Seleccione un laboratorio</option>';
        data.forEach(lab => {
            const option = document.createElement('option');
            option.value = lab.id;
            option.textContent = lab.nombre;
            select.appendChild(option);
        });
    }
}

// Función para cargar tipos de lentes en el menú desplegable
async function cargarTiposLentes() {
    console.log('Cargando tipos de lentes...'); // Depuración
    const { data, error } = await supabaseClient
        .from('tipos_lentes')
        .select('*');

    if (error) {
        console.error('Error al cargar tipos de lentes:', error); // Depuración
    } else {
        console.log('Tipos de lentes cargados:', data); // Depuración
        const select = document.getElementById('tipo-cristal');
        select.innerHTML = '<option value="">Seleccione un tipo de cristal</option>';
        data.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.textContent = tipo.nombre;
            select.appendChild(option);
        });
    }
}

// Función para cargar materiales en el menú desplegable
async function cargarMateriales() {
    console.log('Cargando materiales...'); // Depuración
    const { data, error } = await supabaseClient
        .from('materiales')
        .select('*');

    if (error) {
        console.error('Error al cargar materiales:', error); // Depuración
    } else {
        console.log('Materiales cargados:', data); // Depuración
        const select = document.getElementById('material');
        select.innerHTML = '<option value="">Seleccione un material</option>';
        data.forEach(material => {
            const option = document.createElement('option');
            option.value = material.id;
            option.textContent = material.nombre;
            select.appendChild(option);
        });
    }
}

// Función para cargar índices de refracción en el menú desplegable
async function cargarIndicesRefraccion() {
    console.log('Cargando índices de refracción...'); // Depuración
    const { data, error } = await supabaseClient
        .from('indices_refraccion')
        .select('*');

    if (error) {
        console.error('Error al cargar índices de refracción:', error); // Depuración
    } else {
        console.log('Índices de refracción cargados:', data); // Depuración
        const select = document.getElementById('indice-refraccion');
        select.innerHTML = '<option value="">Seleccione un índice de refracción</option>';
        data.forEach(indice => {
            const option = document.createElement('option');
            option.value = indice.id;
            option.textContent = indice.valor;
            select.appendChild(option);
        });
    }
}

// Función para cargar tratamientos como checkboxes
async function cargarTratamientos() {
    console.log('Cargando tratamientos...'); // Depuración
    const { data, error } = await supabaseClient
        .from('tratamientos')
        .select('*');

    if (error) {
        console.error('Error al cargar tratamientos:', error); // Depuración
    } else {
        console.log('Tratamientos cargados:', data); // Depuración
        const container = document.getElementById('tratamientos-container');
        container.innerHTML = '';
        data.forEach(tratamiento => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `tratamiento-${tratamiento.id}`;
            checkbox.value = tratamiento.id;
            const label = document.createElement('label');
            label.htmlFor = `tratamiento-${tratamiento.id}`;
            label.textContent = tratamiento.nombre;
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }
}

// Función para cargar y mostrar los productos
async function cargarProductos() {
    console.log('Cargando productos...'); // Depuración
    const { data, error } = await supabaseClient
        .from('productos')
        .select(`
            *,
            laboratorios(nombre),
            tipos_lentes(nombre),
            materiales(nombre),
            indices_refraccion(valor),
            producto_tratamiento(tratamientos(nombre))
        `);

    if (error) {
        console.error('Error al cargar productos:', error); // Depuración
    } else {
        console.log('Productos cargados:', data); // Depuración
        const tbody = document.querySelector('#productos-table tbody');
        tbody.innerHTML = ''; // Limpiar filas existentes

        data.forEach(producto => {
            const row = document.createElement('tr');
            // Obtener los nombres de los tratamientos asociados al producto
            const tratamientos = producto.producto_tratamiento.map(pt => pt.tratamientos.nombre).join(', ');
            row.innerHTML = `
                <td>${producto.laboratorios.nombre}</td>
                <td>${producto.nombre}</td>
                <td>${producto.materiales.nombre}</td>
                <td>${producto.indices_refraccion.valor}</td>
                <td>${formatearNumeroConSigno(producto.esf_min)}</td>
                <td>${formatearNumeroConSigno(producto.esf_max)}</td>
                <td>${formatearNumeroConSigno(producto.cilindrico)}</td>
                <td>${tratamientos}</td>
                <td>${producto.precio.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Función para formatear números con signo
function formatearNumeroConSigno(valor) {
    if (valor === null || valor === undefined) return ''; // Manejar valores nulos o indefinidos
    const numero = parseFloat(valor);
    if (numero >= 0) {
        return `+${numero.toFixed(2)}`; // Agregar + a números positivos
    } else {
        return numero.toFixed(2); // Conservar - en números negativos
    }
}

// Llamar a las funciones para cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado'); // Depuración
    verificarAutenticacion();
    cargarLaboratorios();
    cargarTiposLentes();
    cargarMateriales();
    cargarIndicesRefraccion();
    cargarTratamientos();
    cargarProductos();
});