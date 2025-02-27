const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiueiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

async function checkSession() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (user) {
    console.log('Sesión activa:', user);
  } else {
    console.log('No hay sesión activa:', error);
    // Redirigir a index.html si no hay sesión
    window.location.href = 'index.html';
  }
}

checkSession();