const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Faltan variables de entorno en .env.local');
    return;
  }

  console.log('Testing connection to:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.from('clientes').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ Conexión exitosa, pero la tabla "clientes" no existe aún (debes correr el SQL).');
      } else {
        console.error('❌ Error de conexión:', error.message);
      }
    } else {
      console.log('✅ ¡Conexión exitosa! Tablas detectadas.');
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testConnection();
