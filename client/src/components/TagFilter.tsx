interface Props {
  tags: string[];
  active: string | null;
  onSelect: (tag: string | null) => void;
}

export default function TagFilter({ tags, active, onSelect }: Props) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="All" selected={active === null} onClick={() => onSelect(null)} />
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          selected={active === tag}
          onClick={() => onSelect(active === tag ? null : tag)}
        />
      ))}
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
