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
    const { data: admin, error: adminError } = await supabaseClient
        .from('administradores')
        .select('user_id, nick')
        .eq('user_id', user.id)
        .single();

    if (adminError || !admin) {
        console.error('Usuario no es administrador:', adminError ? adminError.message : 'No es administrador'); // Depuración: Usuario no es administrador
        return { esAdmin: false, nick: null };
    } else {
        return { esAdmin: true, nick: admin.nick };
    }
}