-- ============================================================
-- POKÉMON CARD GRADER — DATENBANK SETUP 2: DEVELOPER & KORREKTUREN
-- Status: NOCH NICHT AUSGEFÜHRT — NÄCHSTER SCHRITT
-- Auszuführen im Supabase SQL Editor
-- ============================================================
-- Dieses Setup aktiviert das Developer-Korrektur-System:
-- Ausgewählte Nutzer (Developer) können KI-Bewertungen korrigieren.
-- Die Korrekturen werden gesammelt und später zur Verbesserung
-- des Prompts / zum Training verwendet.
-- ============================================================

-- 1) PROFILES-TABELLE — erweitert Nutzer um Developer-Rolle
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  is_developer boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2) TRIGGER — erstellt automatisch ein Profil bei Registrierung
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) CORRECTIONS-TABELLE — speichert Developer-Korrekturen
create table public.corrections (
  id uuid default gen_random_uuid() primary key,
  developer_id uuid references auth.users(id) not null,
  card_name text,
  set_name text,
  card_number text,
  language text,
  image_data text,
  ai_psa_grade numeric,
  ai_cardmarket_grade text,
  corrected_psa_grade numeric,
  corrected_cardmarket_grade text,
  ai_rating smallint, -- Einordnung der KI-Bewertung: 1=passend, 2=okay, 3=nicht so gut, 4=falsch
  correction_reason text,
  key_issues text[],
  created_at timestamp with time zone default now()
);

alter table public.corrections enable row level security;

-- Insert nur für Developer: ohne den is_developer-Check könnte jeder
-- eingeloggte Nutzer per API Korrekturen einfügen.
create policy "Developers can insert corrections"
  on public.corrections for insert
  with check (
    auth.uid() = developer_id
    and exists (select 1 from public.profiles where id = auth.uid() and is_developer = true)
  );

create policy "Developers can view all corrections"
  on public.corrections for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_developer = true));


-- ============================================================
-- 4) NACH AUSFÜHRUNG: ERSTEN DEVELOPER FREISCHALTEN
-- ============================================================
-- Da der Trigger nur für NEUE Registrierungen Profile anlegt,
-- muss für bereits bestehende Accounts EINMALIG ein Profil
-- angelegt werden. Danach den eigenen Account zum Developer machen.
--
-- Schritt A: Profile für alle bestehenden Nutzer nachtragen
insert into public.profiles (id, full_name)
select id, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

-- Schritt B: Eigenen Account zum Developer machen
-- (E-Mail anpassen falls nötig)
update public.profiles
set is_developer = true
where id = (select id from auth.users where email = 'julianrauwolf25@gmail.com');
