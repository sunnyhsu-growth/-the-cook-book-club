import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, LogIn, Download } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../lib/admin';
import { fetchAllRecipes } from '../lib/recipes';
import { CookBook } from './Doodles';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const rows = await fetchAllRecipes();
      const blob = new Blob([JSON.stringify(rows, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `cookbookclub-backup-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('export failed:', e);
      alert('Export failed — please try again.');
    } finally {
      setExporting(false);
    }
  }

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
              {isAdmin(user) && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:text-ink disabled:opacity-60"
                  title="Export all recipes (backup)"
                >
                  <Download size={16} />
                </button>
              )}
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
