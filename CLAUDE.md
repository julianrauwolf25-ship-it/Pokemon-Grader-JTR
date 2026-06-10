# CLAUDE.md — Kontext für Claude Code

Diese Datei wird von Claude Code automatisch als Projektkontext gelesen. Sie fasst alles Wichtige zusammen, damit du (Claude) sofort produktiv mitarbeiten kannst. Die ausführliche Doku steht in `PROJEKT-HANDBUCH.md`.

## Projekt in einem Satz

**Pokémon Card Grader** — eine KI-gestützte PWA, die Pokémon-Karten anhand von Fotos bewertet (PSA-Note, CardMarket-Zustand, Detailanalysen, Wertschätzung) und ein persönliches Portfolio mit Nutzerkonten bietet.

- **Live:** https://pokemon-grader-jtr.vercel.app
- **Repo:** github.com/julianrauwolf25-ship-it/Pokemon-Grader-JTR (Branch `main`)
- **Sprache der App & Kommunikation:** Deutsch

## Tech-Stack

- **Frontend:** React 18 + Vite 5, reines JSX, **Styling ausschließlich inline** (keine Tailwind/CSS-Frameworks, keine UI-Bibliothek)
- **Backend:** eine einzige Vercel Serverless Function `api/analyze.js` (Node.js) als Proxy zur Anthropic-API
- **Datenbank & Auth:** Supabase (PostgreSQL + Row Level Security)
- **KI:** Anthropic Claude (Bildanalyse)
- **Deployment:** Vercel, automatisch bei jedem Commit auf `main`

## Architektur (Datenfluss einer Bewertung)

```
Browser/PWA → React (App.jsx)
  → POST /api/analyze (Vercel Serverless, Proxy gegen CORS)
    → Anthropic API (Claude): Bild + Prompt → JSON-Bewertung
  → Anzeige im Grader
  → optional: Speichern in Supabase-Tabelle "portfolio"
```

Der Server-Proxy ist zwingend nötig, weil ein direkter Anthropic-Aufruf aus dem Browser an CORS scheitert.

## Dateistruktur

```
index.html              PWA-Grundgerüst + Service-Worker-Registrierung
package.json            Abhängigkeiten
vite.config.js          Vite-Konfiguration
api/analyze.js          Serverless-Funktion + Bewertungs-Prompt (Kernlogik der KI)
src/main.jsx            React-Einstiegspunkt
src/supabase.js         Supabase-Client (liest VITE_-Env-Variablen)
src/App.jsx             GESAMTE App in einer Datei (~645 Zeilen): Auth, Grader, Portfolio
public/manifest.json    PWA-Manifest
public/sw.js            Service Worker (Offline-Caching, /api/ ausgenommen)
public/icon-192.png     App-Icon (Binär, liegt nur im Repo)
public/icon-512.png     App-Icon (Binär, liegt nur im Repo)
database/*.sql          Supabase-Setup (Portfolio live; Developer/Korrekturen geplant)
```

`src/App.jsx` enthält vier logische Komponenten: `AuthScreen`, `PortfolioScreen`, `SaveModal`, `CorrectionPanel` (Developer-Korrektur) und die Haupt-`PokemonGrader`-Komponente.

## ⚠️ Wichtigste Stolperfalle: KI-Modellname

In `api/analyze.js` steht das Claude-Modell in der `model:`-Zeile.

- `claude-sonnet-4-20250514` → führte zu `not_found_error` (Key hat keinen Zugriff)
- **Funktionierend & live:** `claude-haiku-4-5-20251001`

**Regel:** Wenn die Analyse mit Fehler 500 / „Analyse fehlgeschlagen" abbricht, zuerst den Modellnamen verdächtigen. Logs unter Vercel → Logs (roter POST-Eintrag auf `/api/analyze`).

## Umgebungsvariablen

In Vercel gesetzt (Production). Lokal: in eine `.env`-Datei eintragen (siehe `.env.example`). **Niemals echte Keys committen.**

| Variable | Zweck | Seite |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude-API-Schlüssel | Server (`api/analyze.js`) |
| `VITE_SUPABASE_URL` | Supabase-Projekt-URL | Browser (`src/supabase.js`) |
| `VITE_SUPABASE_ANON_KEY` | Öffentlicher Supabase-Schlüssel (durch RLS sicher) | Browser |
| `SUPABASE_SERVICE_KEY` | Geheimer Supabase-Schlüssel (aktuell reserviert) | Server |

Nur `VITE_`-Variablen landen im Frontend-Bundle. Supabase „Site URL" steht auf der Vercel-Adresse (sonst Redirect auf localhost bei E-Mail-Bestätigung).

## Lokale Entwicklung

```bash
npm install
# .env anlegen (siehe .env.example) mit den Supabase-Werten
npm run dev      # startet Vite-Dev-Server
```

Hinweis: `/api/analyze` läuft als Vercel-Funktion. Lokal kann mit `vercel dev` (Vercel CLI) die Serverless-Funktion mitgestartet werden; ein reines `npm run dev` bedient nur das Frontend.

## Coding-Konventionen

- **Styling immer inline** über `style={{ ... }}`. Es gibt zwei Theme-Objekte `DARK` und `LIGHT` in `App.jsx`; neue UI muss beide Themes respektieren (Werte aus dem aktiven `T`-Objekt nehmen).
- Bestehenden Stil beibehalten: Schriftarten DM Mono (Mono) und Playfair Display (Headlines), Akzentfarbe Gold (`#d4a843` dark / `#b8860b` light), viel Letter-Spacing, Großbuchstaben-Labels.
- Komponenten bleiben in `App.jsx`, solange die Datei überschaubar bleibt. Keine neue Abhängigkeit ohne Grund.
- Texte/Labels auf Deutsch.
- Bildkomprimierung im Browser (max 1200px, JPEG 0.85) ist bewusst so — beibehalten (verhindert 413-Fehler).

## Datenbank

- **`portfolio`** (live): gescannte Karten pro Nutzer, inkl. `purchase_price`, `sale_price`, `notes`. RLS: nur eigene Zeilen.
- **`profiles`** / **`corrections`** (geplant, SQL liegt bereit in `database/02_developer_corrections_setup.sql`).

## Aktuelle Aufgabe / Roadmap (Priorität von oben)

1. **Developer-Korrektur-System** (App-Seite umgesetzt, DB-Setup offen):
   - ✅ In `App.jsx` umgesetzt: beim Login wird `is_developer` aus `profiles` geladen (defensiv `false`, solange die Tabelle fehlt); Developer sehen nach der Analyse das `CorrectionPanel` (PSA-Dropdown 1–10, CardMarket-Dropdown, Grund-Feld, „Korrektur speichern" → Insert in `corrections`) und im Sammlung-Tab den Button „🛠 Korrekturen" (CSV-Export).
   - ⏳ Offen: `database/02_developer_corrections_setup.sql` im Supabase SQL Editor ausführen (legt `profiles` + `corrections` + Trigger + RLS an, macht ersten Account zum Developer). Vorher ist das Feature unsichtbar, die App läuft normal.
   - Zweck: gesammelte Korrekturen → laufende **Prompt-Verbesserung** in `api/analyze.js` (Claude selbst ist nicht trainierbar; eigenes Modell lohnt erst ab ~1000 Korrekturen).
2. **Direktlinks prüfen:** Der Prompt liefert bereits `cardmarket_url`, `pricecharting_url`, `pricecharting_psa_url`; `App.jsx` nutzt sie mit Such-Fallback. In der Praxis testen, ob die Links die richtige Kartenseite treffen, sonst Beispiel-URLs im Prompt nachschärfen.
3. **Backlog:** strengere Grading-Logik im Prompt (stark beschädigte Rückseite zieht Note stärker), Developer-Rolle auf weitere Nutzer ausweiten, PDF-Export. (Push-Benachrichtigungen bewusst verworfen.)

## Bekannte, bereits gelöste Probleme (nicht erneut „lösen")

- CORS → durch Server-Proxy `api/analyze.js` gelöst.
- 413 (Bild zu groß) → Browser-Komprimierung.
- E-Mail-Bestätigung ging auf `localhost:3000` → Supabase „Site URL" gesetzt.
- GitHub-Drag&Drop korrumpierte Textdateien → einzeln als Text anlegen.

## Workflow zum Deployen

Commit auf `main` → Vercel deployt automatisch (~30s). Bei Fehlern Vercel-Logs prüfen.
