async function verificarSiEsAdmin() {
    // Obtener el usuario autenticado
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html';
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
        alert('No tienes permisos de administrador');
        window.location.href = 'index.html';
    } else {
        console.log('Usuario es administrador:', admin);
        // Aquí puedes permitir el acceso a las funciones de ABM
        mostrarOpcionesABM();
    }
}

// Función para mostrar las opciones de ABM (simulada)
function mostrarOpcionesABM() {
    console.log('Mostrando opciones de ABM...');
    // Aquí puedes mostrar las opciones de ABM en la interfaz de usuario
}

// Ejecutar la verificación de autenticación y si es administrador al cargar la página
verificarAutenticacion();
verificarSiEsAdmin();