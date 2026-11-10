// Test para ver qué datos hay en calendario
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-key'
);

(async () => {
  const { data, error } = await supabase
    .from('Calendario')
    .select('fecha, tipo_dia, horario')
    .eq('tipo_dia', 'especial')
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Días especiales:', JSON.stringify(data, null, 2));
  }
})();
