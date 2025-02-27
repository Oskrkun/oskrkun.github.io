// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        console.log('Usuario autenticado:', user);
        document.getElementById('sessionInfo').innerText = `Sesión activa para el usuario: ${user.email}`;
    }
}

// Verificar si el usuario es administrador
async function verificarSiEsAdmin() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
        return;
    }

    // Verificar si el usuario es un administrador
    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

    if (adminError || !admin) {
        console.error('Usuario no es administrador:', adminError ? adminError.message : 'No es administrador');
        document.getElementById('adminStatus').innerText = 'No tienes permisos de administrador.';
    } else {
        console.log('Usuario es administrador:', admin);
        document.getElementById('adminStatus').innerText = 'Eres un administrador.';
        mostrarOpcionesABM(); // Mostrar las opciones de ABM
    }
}

// Función para mostrar las opciones de ABM
function mostrarOpcionesABM() {
    console.log('Mostrando opciones de ABM...');
    document.getElementById('abmOptions').style.display = 'block'; // Mostrar el contenedor de ABM
}

// Ejecutar la verificación de autenticación y si es administrador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion().then(() => {
        verificarSiEsAdmin();
    });
});