import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 shadow-sm">
      <Search size={18} className="text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, ingredient, or step…"
        className="w-full bg-transparent outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-muted hover:text-ink">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
