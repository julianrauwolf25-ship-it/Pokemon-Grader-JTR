# Pokémon Card Grader

KI-gestützte Web-App (PWA) zur Bewertung von Pokémon-Sammelkarten anhand von Fotos. Liefert PSA-Note (1–10), CardMarket-Zustand, Detailanalysen (Centering, Whitening, Ecken/Kanten/Oberfläche), Wertschätzungen und Direktlinks zu CardMarket/PriceCharting. Mit Nutzerkonten und persönlichem Portfolio.

**Live:** https://pokemon-grader-jtr.vercel.app

> Für die vollständige Projektdokumentation, Architektur, Zugänge und die Roadmap siehe **`PROJEKT-HANDBUCH.md`**.

## Tech-Stack

- React 18 + Vite 5 (Frontend)
- Vercel Serverless Function (`api/analyze.js`) als Proxy zur Anthropic-API
- Supabase (PostgreSQL + Auth)
- Anthropic Claude (Bildanalyse)

## Projektstruktur

```
index.html              PWA-Grundgerüst
package.json            Abhängigkeiten
vite.config.js          Vite-Konfiguration
api/analyze.js          Serverless-Funktion + Bewertungs-Prompt
src/main.jsx            React-Einstiegspunkt
src/supabase.js         Supabase-Client
src/App.jsx             Gesamte App (Auth, Grader, Portfolio)
public/manifest.json    PWA-Manifest
public/sw.js            Service Worker
database/*.sql          Datenbank-Setup (Portfolio + Developer/Korrekturen)
```

## Umgebungsvariablen (in Vercel gesetzt)

| Variable | Zweck |
|---|---|
| `ANTHROPIC_API_KEY` | Claude-API-Schlüssel (Server) |
| `VITE_SUPABASE_URL` | Supabase-Projekt-URL |
| `VITE_SUPABASE_ANON_KEY` | Öffentlicher Supabase-Schlüssel |
| `SUPABASE_SERVICE_KEY` | Geheimer Supabase-Schlüssel (reserviert) |

## Wichtiger Hinweis: KI-Modell

In `api/analyze.js` muss ein gültiges Claude-Modell stehen. Funktionierend & live: `claude-haiku-4-5-20251001`. Bei Fehler 500 in der Analyse zuerst den Modellnamen prüfen (Vercel-Logs).

## Deployment

Automatisch über Vercel bei jedem Commit auf `main`.

## Status

Live & funktionsfähig. In Arbeit: Developer-Korrektur-System (siehe `PROJEKT-HANDBUCH.md`, Abschnitt 9).
