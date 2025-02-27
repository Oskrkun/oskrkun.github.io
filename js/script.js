// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Configurar el token de autenticación si está disponible
const supabaseAuthToken = localStorage.getItem('supabaseAuthToken');
if (supabaseAuthToken) {
    supabaseClient.auth.setSession({ access_token: supabaseAuthToken }) // Corrección aquí
        .then(response => {
            if (response.error) {
                console.error('Error al configurar la sesión:', response.error);
                window.location.href = '/Index.html'; // Redirigir si hay un error
            } else {
                console.log('Sesión configurada correctamente');
            }
        })
        .catch(error => {
            console.error('Error al configurar la sesión:', error);
            window.location.href = '/Index.html'; // Redirigir si hay un error
        });
}

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    console.log('Verificando autenticación...'); // Depuración
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error); // Depuración
        window.location.href = 'Index.html'; // Redirigir si no está autenticado
    } else {
        console.log('Usuario autenticado:', user); // Depuración
    }
}

// Variables para manejar los pasos del formulario
let currentStep = 1;

function nextStep(step) {
    console.log("nextStep llamado con:", step); // Depuración
    console.log("currentStep actual:", currentStep); // Depuración
    if (step < 1 || step > 5) {
        console.log("Paso fuera de rango"); // Depuración
        return;
    }
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${step}`).style.display = 'block';
    currentStep = step;
}

function prevStep(step) {
    console.log("prevStep llamado con:", step); // Depuración
    console.log("currentStep actual:", currentStep); // Depuración
    if (step < 1 || step > 5) {
        console.log("Paso fuera de rango"); // Depuración
        return;
    }
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${step}`).style.display = 'block';
    currentStep = step;
}

// Inicializar el formulario para mostrar el primer paso
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado'); // Depuración
    verificarAutenticacion();
    cargarLaboratorios();
    cargarTiposLentes();
    cargarMateriales();
    cargarIndicesRefraccion();
    cargarTratamientos();
    cargarProductos();

    // Ocultar todos los pasos excepto el primero
    for (let i = 2; i <= 5; i++) {
        document.getElementById(`step${i}`).style.display = 'none';
    }
});

// ... (resto de las funciones cargarLaboratorios, cargarTiposLentes, etc.) ...

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