-- ============================================================
-- POKÉMON CARD GRADER — DATENBANK SETUP 1: PORTFOLIO
-- Status: BEREITS AUSGEFÜHRT / LIVE
-- Auszuführen im Supabase SQL Editor
-- ============================================================

-- Portfolio Tabelle: speichert alle gescannten Karten pro Nutzer
create table public.portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  card_name text,
  card_name_en text,
  set_name text,
  card_number text,
  language text,
  rarity text,
  psa_grade numeric,
  cardmarket_grade text,
  image_data text,
  centering_assessment text,
  whitening_front text,
  whitening_back text,
  overall_front text,
  overall_back text,
  submit_to_psa boolean default false,
  purchase_price numeric,
  sale_price numeric,
  notes text,
  created_at timestamp with time zone default now()
);

-- Row Level Security aktivieren: Nutzer sehen nur eigene Karten
alter table public.portfolio enable row level security;

create policy "Users can view own cards"
  on public.portfolio for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.portfolio for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.portfolio for update
  using (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.portfolio for delete
  using (auth.uid() = user_id);
