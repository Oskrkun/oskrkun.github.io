// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Función para validar el inicio de sesión
async function validarLogin() {
    const usuario = document.getElementById('usuario').value;
    const contraseña = document.getElementById('contraseña').value;

    // Validar que los campos no estén vacíos
    if (!usuario || !contraseña) {
        mostrarError('Por favor, ingrese usuario y contraseña.');
        return;
    }

    // Consultar la base de datos para validar las credenciales
    const { data, error } = await supabaseClient
        .from('administradores')
        .select('*')
        .eq('usuario', usuario);

    if (error) {
        console.error('Error al validar credenciales:', error);
        mostrarError('Error al validar credenciales. Intente nuevamente.');
        return;
    }

    if (data.length === 0) {
        mostrarError('Usuario no encontrado.');
        return;
    }

    // Verificar la contraseña usando una función de PostgreSQL
    const admin = data[0];
    const { data: validacion, error: errorValidacion } = await supabaseClient
        .rpc('verificar_contraseña', {
            contraseña_ingresada: contraseña,
            contraseña_hash: admin.contraseña
        });

    if (errorValidacion) {
        console.error('Error al verificar contraseña:', errorValidacion);
        mostrarError('Error al verificar contraseña. Intente nuevamente.');
        return;
    }

    if (!validacion) {
        mostrarError('Contraseña incorrecta.');
        return;
    }

    // Si las credenciales son correctas, almacenar el token y redirigir al ABM
    const { data: { session }, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: usuario, // Asumiendo que el usuario es un email
        password: contraseña
    });

    if (authError) {
        console.error('Error al iniciar sesión:', authError);
        mostrarError('Error al iniciar sesión. Intente nuevamente.');
        return;
    }

    localStorage.setItem('supabaseAuthToken', session.access_token);
    window.location.href = 'ABM.html';
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const mensajeError = document.getElementById('mensaje-error');
    mensajeError.textContent = mensaje;
}