import type { Facets, FacetSelection } from '../lib/recipes';
import type { Facet } from '../lib/taxonomy';

interface Props {
  facets: Facets;
  active: FacetSelection | null;
  onSelect: (sel: FacetSelection | null) => void;
}

export default function TagFilter({ facets, active, onSelect }: Props) {
  const groups: { label: string; group: Facet; values: string[] }[] = [
    { label: 'Course', group: 'course', values: facets.courses },
    { label: 'Cuisine', group: 'cuisine', values: facets.cuisines },
    { label: 'Dietary', group: 'dietary', values: facets.dietary },
  ];

  if (!groups.some((g) => g.values.length > 0)) return null;

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Chip label="All" selected={active === null} onClick={() => onSelect(null)} />
      </div>
      {groups.map(
        (g) =>
          g.values.length > 0 && (
            <div
              key={g.group}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                {g.label}
              </span>
              {g.values.map((v) => {
                const selected = active?.group === g.group && active.value === v;
                return (
                  <Chip
                    key={v}
                    label={v}
                    selected={selected}
                    onClick={() => onSelect(selected ? null : { group: g.group, value: v })}
                  />
                );
              })}
            </div>
          ),
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
