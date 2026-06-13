import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CookBook } from './Doodles';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <span className="text-terracotta-dark">
            <CookBook className="h-9 w-9" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            The Cook Book Club
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/add"
                className="flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-paper transition hover:bg-terracotta-dark"
              >
                <Plus size={16} /> Add recipe
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:text-ink"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              <LogIn size={16} /> Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
