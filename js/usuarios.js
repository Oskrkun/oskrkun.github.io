// usuarios.js

import { supabaseClient } from './supabaseConfig.js';

// Verificar si el usuario está autenticado
export async function verificarAutenticacion() {

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario'); // Depuración: Error de autenticación
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        return user;
    }
}

// Verificar si el usuario es administrador
export async function verificarSiEsAdmin(user) {
    console.log('Verificando si el usuario es administrador:', user.id);

    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id, nick')
        .eq('user_id', user.id)
        .single();

    if (adminError) {
        console.error('Error al verificar administrador:', adminError);
    } else if (!admin) {
        console.log('El usuario no es administrador.');
    } else {
        console.log('El usuario es administrador:', admin);
    }

    return { esAdmin: !!admin, nick: admin?.nick || null };
}