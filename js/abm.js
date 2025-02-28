// abm.js

// Importar el cliente de Supabase desde el archivo de configuración
import { supabaseClient } from './supabaseConfig.js';

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
    window.location.href = '/'; // Redirigir al login si no hay sesión
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