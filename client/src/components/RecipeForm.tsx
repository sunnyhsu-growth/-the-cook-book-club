import { Plus, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import type { RecipeDraft } from '../lib/types';
import ImageUpload from './ImageUpload';
import { useState } from 'react';

interface Props {
  draft: RecipeDraft;
  onChange: (draft: RecipeDraft) => void;
  currentImageUrl?: string | null;
  onImageSelect: (file: File | null) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}

export default function RecipeForm({
  draft,
  onChange,
  currentImageUrl,
  onImageSelect,
  onSubmit,
  submitting,
  submitLabel,
}: Props) {
  const [tagInput, setTagInput] = useState('');
  const set = (patch: Partial<RecipeDraft>) => onChange({ ...draft, ...patch });

  const numField = (v: string) => (v === '' ? null : Math.max(0, parseInt(v, 10) || 0));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      <ImageUpload
        label="Finished dish photo"
        currentUrl={currentImageUrl}
        onSelect={onImageSelect}
      />

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-muted">Title</label>
        <input
          required
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Grandma's lasagna"
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-lg outline-none focus:border-terracotta"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-muted">
          Description
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={2}
          placeholder="A short note about this recipe…"
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-terracotta"
        />
      </div>

      {/* times + servings */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'prep_minutes', label: 'Prep (min)' },
          { key: 'cook_minutes', label: 'Cook (min)' },
          { key: 'servings', label: 'Servings' },
        ].map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-sm font-semibold text-muted">
              {f.label}
            </label>
            <input
              type="number"
              min={0}
              value={(draft[f.key as keyof RecipeDraft] as number | null) ?? ''}
              onChange={(e) => set({ [f.key]: numField(e.target.value) } as Partial<RecipeDraft>)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-terracotta"
            />
          </div>
        ))}
      </div>

      {/* ingredients */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-muted">
          Ingredients
        </label>
        <div className="space-y-2">
          {draft.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ing.quantity}
                onChange={(e) => {
                  const next = [...draft.ingredients];
                  next[i] = { ...next[i], quantity: e.target.value };
                  set({ ingredients: next });
                }}
                placeholder="2 cups"
                className="w-28 rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-terracotta"
              />
              <input
                value={ing.item}
                onChange={(e) => {
                  const next = [...draft.ingredients];
                  next[i] = { ...next[i], item: e.target.value };
                  set({ ingredients: next });
                }}
                placeholder="flour"
                className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-terracotta"
              />
              <button
                type="button"
                onClick={() => set({ ingredients: draft.ingredients.filter((_, j) => j !== i) })}
                className="grid w-10 place-items-center rounded-lg text-muted hover:text-terracotta-dark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set({ ingredients: [...draft.ingredients, { quantity: '', item: '' }] })}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-terracotta hover:text-terracotta-dark"
        >
          <Plus size={15} /> Add ingredient
        </button>
      </div>

      {/* steps */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-muted">Steps</label>
        <div className="space-y-2">
          {draft.steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-terracotta/15 text-sm font-semibold text-terracotta">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => {
                  const next = [...draft.steps];
                  next[i] = e.target.value;
                  set({ steps: next });
                }}
                rows={2}
                placeholder="Describe this step…"
                className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-terracotta"
              />
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...draft.steps];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    set({ steps: next });
                  }}
                  className="text-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  disabled={i === draft.steps.length - 1}
                  onClick={() => {
                    const next = [...draft.steps];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    set({ steps: next });
                  }}
                  className="text-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowDown size={15} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => set({ steps: draft.steps.filter((_, j) => j !== i) })}
                className="grid w-10 place-items-center rounded-lg text-muted hover:text-terracotta-dark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set({ steps: [...draft.steps, ''] })}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-terracotta hover:text-terracotta-dark"
        >
          <Plus size={15} /> Add step
        </button>
      </div>

      {/* tags */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-muted">
          Tags (cuisine, meal, dietary)
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-sm capitalize text-terracotta-dark"
            >
              {tag}
              <button
                type="button"
                onClick={() => set({ tags: draft.tags.filter((t) => t !== tag) })}
              >
                <X size={13} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                e.preventDefault();
                const t = tagInput.trim().toLowerCase();
                if (!draft.tags.includes(t)) set({ tags: [...draft.tags, t] });
                setTagInput('');
              }
            }}
            placeholder="type & press Enter"
            className="min-w-[10rem] flex-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-sm outline-none focus:border-terracotta"
          />
        </div>
      </div>

      {/* notes */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-muted">
          Notes <span className="font-normal text-muted/70">— source, tips, variations</span>
        </label>
        <textarea
          value={draft.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={3}
          placeholder="e.g. From Grandma's recipe box. Great with vanilla ice cream."
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 outline-none focus:border-terracotta"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !draft.title.trim()}
        className="w-full rounded-xl bg-terracotta py-3 text-lg font-semibold text-paper transition hover:bg-terracotta-dark disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
