// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Verificar la sesión
const sessionToken = localStorage.getItem('supabase_session_token');

if (!sessionToken) {
    // Si no hay token, redirigir al login
    window.location.href = 'index.html';
} else {
    // Verificar el token con Supabase
    supabase.auth.getUser(sessionToken).then(({ data, error }) => {
        if (error) {
            // Si hay un error, redirigir al login
            console.error('Error al verificar la sesión:', error.message);
            window.location.href = 'index.html';
        } else {
            // Mostrar la información del usuario
            document.getElementById('sessionInfo').innerText = `Sesión activa para el usuario: ${data.user.email}`;
        }
    });
}