import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <p className="eyebrow">The Cook Book Club</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Welcome in</h1>
      <p className="mt-2 text-center text-muted">
        Sign in to add recipes. Browsing is open to everyone — no account needed.
      </p>

      {sent ? (
        <div className="mt-8 flex w-full flex-col items-center gap-3 rounded-2xl border border-line bg-paper p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-sage/20 text-sage">
            <Check />
          </span>
          <p className="font-semibold">Check your email</p>
          <p className="text-sm text-muted">
            We sent a magic sign-in link to <strong>{email}</strong>.
          </p>
        </div>
      ) : (
        <div className="mt-8 w-full space-y-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-paper py-3 font-semibold text-ink transition hover:bg-cream"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={sendLink} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3">
            <Mail size={18} className="text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>
          {error && <p className="text-sm text-terracotta-dark">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-terracotta py-3 font-semibold text-paper transition hover:bg-terracotta-dark disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Email me a magic link'}
          </button>
          </form>
        </div>
      )}
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
