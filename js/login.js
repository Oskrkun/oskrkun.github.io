const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  try {
    const { user, error, session } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error de inicio de sesión:', error.message);
      alert('Error de inicio de sesión: ' + error.message);
    } else {
      console.log('Inicio de sesión exitoso:', user);
      // Redirigir a abm.html
      window.location.href = 'abm.html';
    }
  } catch (error) {
    console.error('Error inesperado:', error.message);
    alert('Ocurrió un error inesperado. Inténtalo de nuevo.');
  }
});