import { createClient } from '@supabase/supabase-js';

// Environment variables are loaded by index.ts before this module is imported.
const supabaseUrl = process.env.SUPABASE_URL;
// Prefer the service-role key on the server so inserts/queries aren't blocked by
// RLS when we act on a verified user's behalf. Fall back to the anon key.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY environment variables',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function testConnection() {
  try {
    const { error } = await supabase.from('recipes').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  recipes table not found yet — run database_migrations.sql');
    } else {
      console.log('✅ Supabase connected successfully!');
    }
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}
