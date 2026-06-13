import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  Flame,
  Users,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  UtensilsCrossed,
  Play,
  MapPin,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { getRecipe, deleteRecipe } from '../lib/recipes';
import type { Recipe } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../lib/admin';
import { youtubeEmbedUrl, youtubeSearchUrl } from '../lib/youtube';
import { groceryMapsUrl } from '../lib/maps';
import { ScallopFrame } from '../components/Doodles';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getRecipe(id)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="grid place-items-center py-24 text-muted">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!recipe)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-muted">
        <p className="font-display text-2xl">Recipe not found</p>
        <Link to="/" className="mt-4 inline-block text-terracotta hover:underline">
          ← Back to all recipes
        </Link>
      </div>
    );

  const canManage = user?.id === recipe.user_id || isAdmin(user);
  const meta = [
    recipe.prep_minutes != null && {
      icon: <Clock size={18} />,
      label: 'Prep',
      value: `${recipe.prep_minutes} min`,
    },
    recipe.cook_minutes != null && {
      icon: <Flame size={18} />,
      label: 'Cook',
      value: `${recipe.cook_minutes} min`,
    },
    recipe.servings != null && {
      icon: <Users size={18} />,
      label: 'Serves',
      value: `${recipe.servings}`,
    },
  ].filter(Boolean) as { icon: ReactNode; label: string; value: string }[];

  async function handleDelete() {
    if (!recipe || !confirm('Delete this recipe? This cannot be undone.')) return;
    await deleteRecipe(recipe.id);
    navigate('/');
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> All recipes
      </Link>

      <ScallopFrame className="p-3">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-72 w-full rounded-2xl object-cover sm:h-96"
          />
        ) : (
          <div className="grid h-56 place-items-center rounded-2xl bg-cream text-line">
            <UtensilsCrossed size={48} />
          </div>
        )}
      </ScallopFrame>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Recipe</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-2 text-muted">{recipe.description}</p>
          )}
          {recipe.contributor && (
            <p className="mt-2 text-sm text-muted">
              Contributed by{' '}
              <span className="font-semibold text-terracotta-dark">{recipe.contributor}</span>
            </p>
          )}
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-2">
            <Link
              to={`/edit/${recipe.id}`}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-ink"
              title="Edit"
            >
              <Pencil size={16} />
            </Link>
            <button
              onClick={handleDelete}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-terracotta-dark"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {recipe.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-blush px-3 py-1 text-sm capitalize text-terracotta-dark"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {meta.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-6 rounded-2xl border border-line bg-paper px-6 py-4">
          {meta.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="text-terracotta">{m.icon}</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{m.label}</p>
                <p className="font-semibold">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 sm:grid-cols-[1fr_1.4fr]">
        {/* ingredients */}
        <section>
          <h2 className="font-display text-2xl font-semibold">Ingredients</h2>
          <ul className="mt-4 space-y-2.5">
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} className="flex gap-2 border-b border-line pb-2.5 text-sm">
                {ing.quantity && (
                  <span className="font-semibold text-terracotta">{ing.quantity}</span>
                )}
                <span>{ing.item}</span>
              </li>
            ))}
          </ul>
          <a
            href={groceryMapsUrl(recipe.tags)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-terracotta/50 px-4 py-2 text-sm font-semibold text-terracotta-dark transition hover:bg-blush"
          >
            <MapPin size={15} /> Find ingredients near you
          </a>
        </section>

        {/* steps */}
        <section>
          <h2 className="font-display text-2xl font-semibold">Method</h2>
          <ol className="mt-4 space-y-5">
            {recipe.steps?.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-terracotta/15 font-display font-semibold text-terracotta">
                  {i + 1}
                </span>
                <p className="pt-1 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* how-to video */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">How to cook it</h2>
        {(() => {
          const embed = recipe.video_url ? youtubeEmbedUrl(recipe.video_url) : null;
          if (embed) {
            return (
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-line">
                <iframe
                  src={embed}
                  title="How-to video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          if (recipe.video_url) {
            return (
              <a
                href={recipe.video_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 font-semibold text-paper hover:bg-terracotta-dark"
              >
                <Play size={16} /> Watch the video
              </a>
            );
          }
          return (
            <div className="mt-3">
              <a
                href={youtubeSearchUrl(recipe.title)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 font-semibold text-paper hover:bg-terracotta-dark"
              >
                <Play size={16} /> Watch how to make it
              </a>
              <p className="mt-2 text-xs text-muted">
                No video added by the author — these are the closest cooking videos we
                could find on YouTube.
              </p>
            </div>
          );
        })()}
      </section>

      {recipe.notes && (
        <section className="mt-10 rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-xl font-semibold">Notes</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">
            {recipe.notes}
          </p>
        </section>
      )}
    </article>
  );
}
