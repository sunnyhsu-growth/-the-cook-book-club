import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, UtensilsCrossed, Plus, LogIn } from 'lucide-react';
import { listRecipes, listAllTags } from '../lib/recipes';
import type { Recipe } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import {
  Strawberry,
  Lemon,
  CitrusHalf,
  Whisk,
  ForkKnife,
  PeaPod,
  Sparkle,
  Herb,
  WavyLine,
  ScallopFrame,
} from '../components/Doodles';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only load (and reveal) recipes for signed-in users.
  useEffect(() => {
    if (!user) return;
    listAllTags().then(setTags).catch(() => {});
  }, [user, recipes.length]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      listRecipes({ search, tag: activeTag ?? undefined })
        .then((data) => {
          if (!cancelled) setRecipes(data);
        })
        .catch((e) => !cancelled && setError(e.message))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, search, activeTag]);

  return (
    <div className="relative overflow-hidden">
      {/* hand-drawn doodles scattered across the whole page */}
      <div className="pointer-events-none absolute inset-0 text-terracotta/80" aria-hidden="true">
        <Strawberry className="absolute left-[5%] top-[2%] h-16 w-16 -rotate-12" />
        <Lemon className="absolute right-[6%] top-[3%] h-16 w-16 rotate-6" />
        <Whisk className="absolute left-[14%] top-[12%] hidden h-16 w-16 -rotate-6 sm:block" />
        <ForkKnife className="absolute right-[15%] top-[11%] hidden h-16 w-16 rotate-12 sm:block" />
        <Herb className="absolute left-[2%] top-[22%] h-16 w-16" />
        <CitrusHalf className="absolute right-[3%] top-[24%] hidden h-16 w-16 md:block" />
        <PeaPod className="absolute left-[6%] top-[42%] hidden h-20 w-20 -rotate-6 md:block" />
        <Sparkle className="absolute right-[11%] top-[40%] hidden h-12 w-12 sm:block" />
        <Strawberry className="absolute right-[4%] top-[56%] h-16 w-16 rotate-6" />
        <Lemon className="absolute left-[3%] top-[58%] hidden h-16 w-16 -rotate-12 sm:block" />
        <Whisk className="absolute right-[7%] top-[72%] hidden h-20 w-20 rotate-6 md:block" />
        <Herb className="absolute left-[5%] top-[76%] h-16 w-16 -rotate-6" />
        <CitrusHalf className="absolute left-[24%] top-[90%] hidden h-14 w-14 lg:block" />
        <ForkKnife className="absolute right-[22%] top-[92%] hidden h-16 w-16 -rotate-12 lg:block" />
        <Sparkle className="absolute left-[46%] top-[88%] hidden h-10 w-10 lg:block" />
      </div>

      <div className="relative z-10">
        {/* hero — the family-cookbook cover (shown to everyone) */}
        <section className="mx-auto max-w-5xl px-4 pb-4 pt-12 text-center">
          <p className="eyebrow">Gather · Cook · Share</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
            The <span className="text-terracotta">Cook Book</span> Club
          </h1>
          <div className="mx-auto mt-4 h-2.5 w-44 text-terracotta">
            <WavyLine className="h-full w-full" />
          </div>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Born from the Berkeley community, we celebrate seasonal ingredients,
            meaningful gatherings, lifelong friendships, and the belief that cooking is
            one of the purest expressions of love.
          </p>
        </section>

        {authLoading ? (
          <div className="grid place-items-center py-20 text-muted">
            <Loader2 className="animate-spin" />
          </div>
        ) : !user ? (
          /* ── signed-out landing: invite to sign in, no recipes shown ── */
          <div className="mx-auto max-w-md px-4 pb-24 pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 text-lg font-semibold text-paper shadow-sm transition hover:bg-terracotta-dark"
            >
              <LogIn size={18} /> Sign in to explore
            </Link>
            <p className="mt-3 text-sm text-muted">
              Our recipe collection is members-only — sign in to browse every dish and add
              your own.
            </p>
          </div>
        ) : (
          /* ── signed-in: the searchable gallery ── */
          <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mx-auto max-w-xl">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="mt-4 flex justify-center">
              <TagFilter tags={tags} active={activeTag} onSelect={setActiveTag} />
            </div>

            {error && <p className="mt-6 text-center text-terracotta-dark">{error}</p>}

            {loading ? (
              <div className="grid place-items-center py-24 text-muted">
                <Loader2 className="animate-spin" />
              </div>
            ) : recipes.length === 0 ? (
              <ScallopFrame className="mx-auto mt-10 max-w-md p-3">
                <div className="rounded-2xl bg-paper p-10 text-center">
                  <UtensilsCrossed className="mx-auto text-line" size={40} />
                  <p className="mt-4 font-display text-xl">No recipes yet</p>
                  <p className="mt-1 text-sm text-muted">
                    {search || activeTag
                      ? 'Try a different search or tag.'
                      : 'Be the first to add one.'}
                  </p>
                  {!search && !activeTag && (
                    <Link
                      to="/add"
                      className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-terracotta px-5 py-2.5 font-semibold text-paper hover:bg-terracotta-dark"
                    >
                      <Plus size={16} /> Add a recipe
                    </Link>
                  )}
                </div>
              </ScallopFrame>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((r) => (
                  <ScallopFrame key={r.id} className="p-2.5">
                    <RecipeCard recipe={r} />
                  </ScallopFrame>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
