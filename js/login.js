// Verifica si Supabase está disponible
if (typeof supabase === 'undefined') {
    console.error('Error: Supabase no está cargado.');
    alert('Error de configuración. Por favor, recarga la página.');
} else {
    // Configura Supabase
    const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // Obtén el formulario de login
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error('Error: No se encontró el formulario de login.');
        alert('Error en la página. Por favor, recarga.');
    } else {
        // Escucha el evento de envío del formulario
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

            // Obtén los valores del formulario
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                // Intenta iniciar sesión con Supabase
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error('Error al iniciar sesión:', error.message); // Depuración
                    alert(`Error al iniciar sesión: ${error.message}`);
                } else {

                    // Guarda el token de sesión en localStorage
                    localStorage.setItem('supabaseAuthToken', data.session.access_token);

                    // Redirige a la página abm.html
                    window.location.href = 'dashboard.html';
                }
            } catch (err) {
                console.error('Error inesperado:', err); // Depuración
                alert('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
            }
        });
    }
}