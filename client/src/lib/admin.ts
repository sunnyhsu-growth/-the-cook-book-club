import type { User } from '@supabase/supabase-js';

// Admins can edit/delete ANY recipe. The real enforcement is the Supabase RLS
// policy (which checks the same email); this just controls button visibility.
// Keep this list in sync with the recipes update/delete policies.
export const ADMIN_EMAILS = ['sunny_hsu@berkeley.edu'];

export function isAdmin(user: User | null): boolean {
  const email = user?.email?.toLowerCase();
  return !!email && ADMIN_EMAILS.includes(email);
}
