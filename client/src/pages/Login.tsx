import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) setError(res.error.message);
    // On success the auth listener sets the user and the effect above redirects.
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <p className="eyebrow">The Cook Book Club</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Welcome in</h1>
      <p className="mt-2 text-center text-muted">
        Sign in to browse the collection and add your own recipes.
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-paper py-3.5 font-semibold text-ink transition hover:bg-cream"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex w-full items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handlePassword} className="w-full space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3">
          <Mail size={18} className="text-muted" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full bg-transparent py-3 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3">
          <Lock size={18} className="text-muted" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full bg-transparent py-3 outline-none"
          />
        </div>
        {error && <p className="text-sm text-terracotta-dark">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-terracotta py-3 font-semibold text-paper transition hover:bg-terracotta-dark disabled:opacity-60"
        >
          {busy
            ? 'Please wait…'
            : mode === 'signup'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'signup' ? 'signin' : 'signup');
          setError(null);
        }}
        className="mt-4 text-sm text-muted hover:text-ink"
      >
        {mode === 'signup'
          ? 'Already have an account? Sign in'
          : 'New here? Create an account'}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}
