-- ============================================================
-- POKÉMON CARD GRADER — MIGRATION 3: KI-EINORDNUNG
-- Nur nötig, wenn 02_developer_corrections_setup.sql bereits
-- VOR dieser Erweiterung ausgeführt wurde.
-- Auszuführen im Supabase SQL Editor.
-- ============================================================
-- Fügt der corrections-Tabelle die Einordnung der KI-Bewertung
-- hinzu: 1=passend, 2=okay, 3=nicht so gut, 4=falsch.

alter table public.corrections
  add column if not exists ai_rating smallint;
