import { X } from 'lucide-react';
import type { Facets, FacetSelections } from '../lib/recipes';
import type { Facet } from '../lib/taxonomy';

interface Props {
  facets: Facets;
  active: FacetSelections;
  onChange: (next: FacetSelections) => void;
}

export default function TagFilter({ facets, active, onChange }: Props) {
  const groups: { label: string; group: Facet; values: string[] }[] = [
    { label: 'Course', group: 'course', values: facets.courses },
    { label: 'Cuisine', group: 'cuisine', values: facets.cuisines },
    { label: 'Dietary', group: 'dietary', values: facets.dietary },
  ];

  if (!groups.some((g) => g.values.length > 0)) return null;

  const toggle = (group: Facet, value: string) => {
    const next = { ...active };
    if (next[group] === value) delete next[group];
    else next[group] = value;
    onChange(next);
  };

  const anyActive = Object.keys(active).length > 0;

  return (
    <div className="space-y-3">
      {groups.map(
        (g) =>
          g.values.length > 0 && (
            <div
              key={g.group}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <span className="mr-1 w-16 text-right text-[11px] font-bold uppercase tracking-wider text-muted">
                {g.label}
              </span>
              {g.values.map((v) => {
                const selected = active[g.group] === v;
                return (
                  <Chip
                    key={v}
                    label={v}
                    selected={selected}
                    onClick={() => toggle(g.group, v)}
                  />
                );
              })}
            </div>
          ),
      )}

      {anyActive && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => onChange({})}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted underline-offset-4 hover:text-terracotta hover:underline"
          >
            <X size={13} /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${
        selected
          ? 'bg-terracotta text-paper'
          : 'border border-line bg-paper text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
