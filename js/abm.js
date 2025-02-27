// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    // Obtener la sesión actual
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // Si el usuario no está autenticado, redirigir al inicio de sesión
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html';
    } else {
        // Si el usuario está autenticado, mostrar la información
        console.log('Usuario autenticado:', user);
        document.getElementById('sessionInfo').innerText = `Sesión activa para el usuario: ${user.email}`;
    }
}

// Ejecutar la verificación de autenticación al cargar la página
verificarAutenticacion();