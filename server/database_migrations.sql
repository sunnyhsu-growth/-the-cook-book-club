-- Recipe Book — database schema
-- Run this in the Supabase SQL editor (or psql) once.

create extension if not exists "pgcrypto";

-- ─── recipes ────────────────────────────────────────────────────────────────
create table if not exists public.recipes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  title            text not null,
  description      text default '',
  ingredients      jsonb not null default '[]'::jsonb,  -- [{quantity, item}]
  steps            jsonb not null default '[]'::jsonb,   -- ["step 1", "step 2"]
  prep_minutes     int,
  cook_minutes     int,
  servings         int,
  category         text,                                   -- primary course (one per recipe)
  tags             text[] not null default '{}',          -- cuisine + dietary
  notes            text default '',                        -- source, tips, variations
  image_url        text,                                   -- finished dish photo
  source_image_url text,                                   -- original captured photo
  status           text not null default 'published',      -- reserved for moderation
  created_at       timestamptz not null default now(),
  search_tsv       tsvector
);

-- ─── full-text search vector (maintained by trigger) ─────────────────────────
-- Casting jsonb -> text is not immutable, so we populate via trigger rather than
-- a generated column. to_tsvector tokenizes words and ignores JSON punctuation.
create or replace function public.recipes_search_tsv_update()
returns trigger language plpgsql as $$
begin
  new.search_tsv :=
      setweight(to_tsvector('english', coalesce(new.title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(new.category, '')), 'A')
    || setweight(to_tsvector('english', array_to_string(new.tags, ' ')), 'A')
    || setweight(to_tsvector('english', coalesce(new.description, '')), 'B')
    || setweight(to_tsvector('english', coalesce(new.ingredients::text, '')), 'B')
    || setweight(to_tsvector('english', coalesce(new.steps::text, '')), 'C')
    || setweight(to_tsvector('english', coalesce(new.notes, '')), 'C');
  return new;
end;
$$;

drop trigger if exists recipes_search_tsv_trg on public.recipes;
create trigger recipes_search_tsv_trg
  before insert or update on public.recipes
  for each row execute function public.recipes_search_tsv_update();

-- ─── indexes ─────────────────────────────────────────────────────────────────
create index if not exists recipes_search_tsv_idx on public.recipes using gin (search_tsv);
create index if not exists recipes_tags_idx       on public.recipes using gin (tags);
create index if not exists recipes_created_at_idx on public.recipes (created_at desc);

-- ─── row-level security ──────────────────────────────────────────────────────
alter table public.recipes enable row level security;

drop policy if exists "Recipes are readable by everyone" on public.recipes;
create policy "Recipes are readable by everyone"
  on public.recipes for select
  using (status = 'published');

drop policy if exists "Users can insert their own recipes" on public.recipes;
create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recipes" on public.recipes;
create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own recipes" on public.recipes;
create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);
