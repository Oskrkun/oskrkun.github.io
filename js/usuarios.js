// usuarios.js

import { supabaseClient } from './supabaseConfig.js';

// Verificar si el usuario está autenticado
export async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error('Usuario no autenticado:', error ? error.message : 'No hay usuario');
        window.location.href = 'index.html'; // Redirigir al login si no hay sesión
    } else {
        return user;
    }
}

// Función para obtener el rol y el nick del usuario
export async function obtenerRolYNick(user) {
    console.log('Obteniendo rol y nick del usuario:', user.id);

    // Llamar a la función de Supabase
    const { data, error } = await supabaseClient
        .rpc('obtener_rol_y_nick', { user_id: user.id });

    if (error) {
        console.error('Error al obtener rol y nick:', error);
        return { rol: null, nick: null };
    }

    if (data.length === 0) {
        console.log('El usuario no está registrado en la tabla de usuarios.');
        return { rol: null, nick: null };
    }

    const { nick, rol } = data[0];
    console.log('Usuario:', { nick, rol });
    return { rol, nick };
}