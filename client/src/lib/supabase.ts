import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables',
  );
}

// In-memory mutex replacing navigator.locks, which can wedge after Vite HMR.
// Preserves mutual exclusion so session-dependent queries don't deadlock.
const locks = new Map<string, Promise<unknown>>();

async function inMemoryLock<R>(
  name: string,
  _timeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  const existing = locks.get(name);
  if (existing) await existing;
  const promise = fn();
  locks.set(name, promise);
  try {
    return await promise;
  } finally {
    locks.delete(name);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { lock: inMemoryLock },
});
