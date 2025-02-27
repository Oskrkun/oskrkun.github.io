// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Función para validar el inicio de sesión
async function validarLogin() {
    const usuario = document.getElementById('usuario').value.trim(); // Asegúrate de que sea un correo electrónico
    const contraseña = document.getElementById('contraseña').value.trim();

    // Validar que los campos no estén vacíos
    if (!usuario || !contraseña) {
        mostrarError('Por favor, ingrese usuario y contraseña.');
        return;
    }

    // Intentar iniciar sesión con Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: usuario, // Asegúrate de que esto sea un correo electrónico
        password: contraseña
    });

    if (error) {
        console.error('Error al iniciar sesión:', error.message);
        mostrarError('Error al iniciar sesión. Verifique sus credenciales.');
        return;
    }

    // Si el inicio de sesión es exitoso, guardar el token y redirigir al ABM
    localStorage.setItem('supabaseAuthToken', data.session.access_token);
    window.location.href = 'ABM.html';
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const mensajeError = document.getElementById('mensaje-error');
    mensajeError.textContent = mensaje;
}

// Llamar a la función validarLogin al hacer clic en el botón
document.getElementById('btn-login').addEventListener('click', async (e) => {
    e.preventDefault(); // Evitar que recargue la página
    await validarLogin();
});