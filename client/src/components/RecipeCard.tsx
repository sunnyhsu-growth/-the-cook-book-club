import { Link } from 'react-router-dom';
import { Clock, UtensilsCrossed } from 'lucide-react';
import type { Recipe } from '../lib/types';

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group flex h-full break-inside-avoid flex-col overflow-hidden rounded-2xl bg-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-cream">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-line">
            <UtensilsCrossed size={40} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="line-clamp-2 text-sm text-muted">{recipe.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock size={13} /> {totalTime} min
            </span>
          )}
          {recipe.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blush px-2 py-0.5 text-xs capitalize text-terracotta-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
