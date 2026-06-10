# Pokémon Card Grader — Projekt-Handbuch & Übergabedokument

> **Zweck dieses Dokuments:** Vollständige Übergabe des Projekts, sodass die Arbeit nahtlos (z. B. in Cowork Projects) fortgesetzt werden kann. Es enthält die komplette Architektur, alle Zugangsdaten-Referenzen, den aktuellen Stand, bekannte Probleme und die offene Roadmap.

**Stand:** Juni 2026
**Eigentümer:** Juli (Rauwolf)
**Status:** Live & funktionsfähig — Erweiterung „Developer-Korrektur-System" in Arbeit

---

## 1. Was ist die App?

Der **Pokémon Card Grader** ist eine KI-gestützte Web-App (PWA), die Pokémon-Sammelkarten anhand von Fotos bewertet. Der Nutzer fotografiert eine Karte (Vorder- und optional Rückseite), und die App liefert eine professionelle Einschätzung im Stil der bekannten Grading-Dienste.

**Kernfunktionen:**

- **KI-Bewertung** einer Karte nach PSA-Skala (1–10) und CardMarket-Zustand (Mint bis Poor)
- Detailanalyse zu Zentrierung (Centering), Whitening, Ecken, Kanten und Oberfläche — getrennt für Vorder- und Rückseite
- Wertschätzung (Rohwert, PSA-10-Wert) und Investitionspotenzial
- Direktlinks zu CardMarket und PriceCharting für Live-Preise
- Empfehlung, ob sich eine PSA-Einreichung lohnt
- **Nutzerkonten** (Registrierung/Login, bleibt angemeldet)
- **Portfolio/Sammlung**: gescannte Karten speichern, mit Einkaufs- und Verkaufspreis, Notizen, Gewinn-/Verlust-Berechnung, Suche, Filter, Sortierung und CSV-Export
- **Hell-/Dunkel-Theme**
- Installierbar auf Handy (PWA, „Zum Homescreen hinzufügen")

---

## 2. Live-Zugänge & Infrastruktur

| Dienst | Beschreibung | Adresse |
|---|---|---|
| **Live-App** | Öffentlich erreichbare Website | https://pokemon-grader-jtr.vercel.app |
| **GitHub** | Quellcode-Repository (Branch: `main`) | github.com/julianrauwolf25-ship-it/Pokemon-Grader-JTR |
| **Vercel** | Hosting & automatisches Deployment | vercel.com/julianrauwolf25-ship-its-projects/pokemon-grader-jtr |
| **Supabase** | Datenbank & Authentifizierung (Region: EU, Irland) | https://lvaumwlbvoxwqmuqglyj.supabase.co |
| **Anthropic** | KI-API (Claude) für die Bewertung | console.anthropic.com |

**Account:** julianrauwolf25@gmail.com (überall identisch, GitHub-Login bei Vercel/Supabase)

> **Wichtig zu Zugangsdaten:** Die eigentlichen Schlüssel (API-Keys, Datenbank-Passwort) sind **nicht** in diesem Dokument abgedruckt. Sie liegen sicher als Umgebungsvariablen in Vercel und in deiner persönlichen Notiz. Siehe Abschnitt 6.

---

## 3. Funktionsweise (technischer Ablauf einer Bewertung)

1. **Foto-Upload** — Der Nutzer wählt im Browser ein Bild (Kamera oder Galerie). Das Bild wird direkt im Browser auf max. 1200 px verkleinert und als JPEG (Qualität 0,85) komprimiert. Das verhindert „413 Content Too Large"-Fehler.
2. **Anfrage an den eigenen Server** — Der Browser schickt das Bild als Base64-String an die Serverless-Funktion `/api/analyze` (läuft auf Vercel). Dieser Zwischenschritt ist nötig, weil ein direkter Aufruf der Anthropic-API aus dem Browser an CORS-Sicherheitsregeln scheitert.
3. **Anfrage an Claude** — Die Serverless-Funktion ergänzt das Bild um einen ausführlichen Prompt (genaue Anweisung, was zu bewerten ist und in welchem JSON-Format geantwortet werden soll) und ruft die Anthropic-API auf.
4. **KI-Analyse** — Claude analysiert das Foto wie ein Gutachter und gibt strukturiertes JSON zurück (PSA-Note, CardMarket-Zustand, Centering, Whitening, Werte, Links usw.).
5. **Anzeige** — Die App zeigt das Ergebnis in Reitern an (Übersicht, Centering, Whitening, Vorderseite, Rückseite, Wert).
6. **Speichern (optional)** — Über „Zur Sammlung hinzufügen" wird die Karte mitsamt Einkaufs-/Verkaufspreis in der Supabase-Datenbank gespeichert.

**Wichtige Einschränkung:** Claude sieht ausschließlich, was auf dem Foto erkennbar ist. Schlechte Beleuchtung, Reflexionen oder Unschärfe führen zu ungenaueren Ergebnissen. Es ist kein echtes physisches Grading.

---

## 4. Technische Architektur

```
Nutzer (Browser/Handy als PWA)
        │
        ▼
React-Frontend (Vite)  ──────────────┐
  - Login/Registrierung               │  Supabase JS Client
  - Grader (Foto → Analyse)           │  (Auth + Datenbank)
  - Portfolio (Sammlung)              ▼
        │                        Supabase
        │  POST /api/analyze     - Auth (E-Mail/Passwort)
        ▼                        - Tabelle "portfolio"
Vercel Serverless Function       - (geplant) "profiles", "corrections"
  (api/analyze.js)
        │
        ▼
Anthropic API (Claude)
  - Bild + Prompt → JSON-Bewertung
```

**Tech-Stack:**

- **Frontend:** React 18 + Vite 5 (reines JSX, Styling inline, keine zusätzliche UI-Bibliothek)
- **Backend:** Vercel Serverless Function (Node.js) als Proxy zur Anthropic-API
- **Datenbank & Auth:** Supabase (PostgreSQL + Row Level Security)
- **KI:** Anthropic Claude (Modell siehe Abschnitt 7 — wichtig!)
- **Hosting/CI:** Vercel, automatisches Deployment bei jedem Git-Commit auf `main`
- **PWA:** manifest.json + Service Worker (sw.js) für Installierbarkeit

---

## 5. Dateistruktur des Projekts

```
pokemon-grader/
├── index.html                  PWA-Grundgerüst, Service-Worker-Registrierung
├── package.json                Abhängigkeiten (React, Supabase, Vite)
├── vite.config.js              Vite-Konfiguration
├── api/
│   └── analyze.js              Serverless-Funktion: Proxy zur Anthropic-API,
│                               enthält den Bewertungs-Prompt
├── src/
│   ├── main.jsx                React-Einstiegspunkt
│   ├── supabase.js             Supabase-Client-Initialisierung
│   └── App.jsx                 Komplette App: Auth, Grader, Portfolio (~645 Zeilen)
├── public/
│   ├── manifest.json           PWA-Manifest
│   ├── sw.js                   Service Worker (Offline-Caching)
│   ├── icon-192.png            App-Icon
│   └── icon-512.png            App-Icon
└── database/
    ├── 01_portfolio_setup.sql              (bereits ausgeführt)
    └── 02_developer_corrections_setup.sql  (nächster Schritt)
```

> **Hinweis:** Die beiden Icon-Dateien (`icon-192.png`, `icon-512.png`) sind Binärdateien und in diesem Übergabepaket nicht enthalten. Sie liegen bereits auf GitHub und müssen nicht neu erzeugt werden.

---

## 6. Umgebungsvariablen (Environment Variables)

Diese sind in Vercel hinterlegt (Settings → Environment Variables) und steuern die App. Ohne sie funktioniert die App nicht.

| Variable | Zweck | Wo verwendet |
|---|---|---|
| `ANTHROPIC_API_KEY` | Schlüssel für die Claude-API | `api/analyze.js` (Server) |
| `VITE_SUPABASE_URL` | Adresse der Supabase-Datenbank | `src/supabase.js` (Browser) |
| `VITE_SUPABASE_ANON_KEY` | Öffentlicher Supabase-Schlüssel (sicher für Browser dank RLS) | `src/supabase.js` (Browser) |
| `SUPABASE_SERVICE_KEY` | Geheimer Supabase-Schlüssel (für Serverfunktionen reserviert) | aktuell nicht aktiv genutzt |

**Die tatsächlichen Werte** stehen in der Vercel-Oberfläche und in deiner persönlichen Notiz. Variablen mit Präfix `VITE_` werden in den Frontend-Code eingebaut; alle anderen bleiben serverseitig.

**Zusätzliche Supabase-Einstellung:** Unter Authentication → URL Configuration ist die „Site URL" auf `https://pokemon-grader-jtr.vercel.app` gesetzt. Das ist wichtig, damit Bestätigungs-E-Mails nicht fälschlich auf `localhost:3000` verweisen.

---

## 7. ⚠️ Wichtig: KI-Modell-Hinweis

In `api/analyze.js` wird das Claude-Modell festgelegt (Zeile mit `model:`). Hier gab es während der Entwicklung ein zentrales Problem:

- Der Wert `claude-sonnet-4-20250514` führte zu einem `not_found_error` (kein Zugriff mit dem vorhandenen API-Key).
- **Funktionierende Lösung (live im Einsatz):** `claude-haiku-4-5-20251001`

**Merke:** Wenn die Analyse plötzlich mit „Analyse fehlgeschlagen" / Fehler 500 abbricht, ist fast immer der Modellname die Ursache. Dann in den Vercel-Logs prüfen (Logs → roter POST-Eintrag) und ggf. auf ein verfügbares Modell wechseln. Verfügbare Modelle können sich ändern; im Zweifel in der Anthropic-Konsole nachschauen, welche Modelle der Key nutzen darf.

Die in diesem Paket enthaltene `api/analyze.js` ist auf das funktionierende `claude-haiku-4-5-20251001` gesetzt.

---

## 8. Aktueller Funktionsumfang (fertig & live)

**Grader-Reiter:**
- Upload Vorder-/Rückseite (Rückseite optional), Kamera oder Galerie auf dem Handy
- Bildkomprimierung im Browser
- Analyse mit PSA-Hero-Anzeige, CardMarket-Skala, Reitern (Übersicht, Centering, Whitening, Vorderseite, Rückseite, Wert)
- Direktlinks zu CardMarket & PriceCharting (Raw + PSA)
- „Zur Sammlung hinzufügen" über Modal mit Einkaufs-/Verkaufspreis & Notizen

**Sammlung/Portfolio-Reiter:**
- Statistik-Karten: Anzahl, Einkauf gesamt, Verkauf gesamt, Gewinn/Verlust
- Suchfeld (Name, Set, Nummer)
- Sortierung (7 Optionen: Datum, PSA, Einkauf, Verkauf, Name)
- Filter nach PSA-Note und CardMarket-Zustand
- Gewinn-/Verlust-Badge pro Karte
- Bearbeiten (Preise/Notizen) und Löschen mit Bestätigung
- CSV-Export der gesamten Sammlung (Excel-kompatibel mit BOM)
- Kartenanzahl als Badge am Reiter

**Allgemein:**
- Registrierung/Login per E-Mail, Passwort, Name; Sitzung bleibt erhalten
- Hell-/Dunkel-Theme (in localStorage gespeichert)
- PWA: auf dem Handy installierbar

---

## 9. Offene Roadmap & nächste Schritte

### 9.1 Developer-Korrektur-System (in Arbeit — direkt als Nächstes)

**Hintergrund:** Die KI bewertet stark beschädigte Karten manchmal zu gut (Beispiel aus der Praxis: eine Arceus LV.X mit gefalteter, beschädigter Rückseite wurde als PSA 5 / „Light Played" bewertet, obwohl sie „Poor" / PSA 1–2 ist). Vermutete Ursachen: Die KI mittelt Vorder- und Rückseite, und unscharfe Fotos verschleiern den echten Zustand.

**Lösungsansatz (vereinbart):** Ein Feedback-Loop, bei dem ausgewählte „Developer"-Nutzer KI-Bewertungen korrigieren können. Diese Korrekturen werden gesammelt und genutzt, um den Prompt gezielt zu verbessern.

**Wichtige Erkenntnis zum „Training":** Claude selbst lässt sich nicht direkt trainieren (es ist Anthropics Modell). Ein eigenes Klassifikationsmodell lohnt sich erst ab ca. 1000 Korrekturen. **Kurzfristig am wirksamsten ist die Prompt-Verbesserung** auf Basis gesammelter Korrekturen (z. B. Regel ergänzen: „Rückseite gefaltet → maximal PSA 2"). Langfristig können die gesammelten Daten als Fine-Tuning-Datensatz oder als Feedback an Anthropic dienen.

**Konkreter Umsetzungsplan:**

1. **Datenbank vorbereiten** — `database/02_developer_corrections_setup.sql` im Supabase SQL Editor ausführen. Das legt an:
   - Tabelle `profiles` (mit `is_developer`-Flag) + automatischer Trigger, der bei Registrierung ein Profil anlegt
   - Tabelle `corrections` (speichert KI-Bewertung vs. korrigierte Bewertung, Grund, Bild, Datum)
   - RLS-Policies (nur Developer dürfen Korrekturen schreiben/alle lesen)
   - Das mitgelieferte SQL trägt am Ende automatisch Profile für bestehende Accounts nach und macht `julianrauwolf25@gmail.com` zum ersten Developer.
2. **App erweitern (`src/App.jsx`):**
   - Beim Login `is_developer` aus `profiles` laden.
   - Nur für Developer: nach der Analyse ein Korrektur-Panel anzeigen (PSA-Dropdown 1–10, CardMarket-Dropdown, Grund-Textfeld, Button „Korrektur speichern" → Insert in `corrections`).
   - CSV-Export der `corrections`-Tabelle (analog zum Portfolio-Export).
3. **Laufende Prompt-Verbesserung:** Korrekturen regelmäßig sichten und konkrete Regeln in den Prompt in `api/analyze.js` einbauen.

### 9.2 Bereits vorbereitet, noch zu prüfen: Direktlinks

Der Prompt in `api/analyze.js` wurde so erweitert, dass Claude **fertige Direktlinks** zu CardMarket und PriceCharting mitliefert (`cardmarket_url`, `pricecharting_url`, `pricecharting_psa_url`). `App.jsx` nutzt diese Links und fällt auf eine Suche zurück, falls sie fehlen. Diese Änderung ist in den Dateien dieses Pakets enthalten. **Offen:** in der Praxis testen, ob die generierten Direktlinks zuverlässig die richtige Kartenseite treffen — und falls nicht, die Beispiel-URLs im Prompt nachschärfen.

### 9.3 Weitere Ideen (Backlog)

- Strengere Grading-Logik im Prompt (z. B. stark beschädigte Rückseite zieht Gesamtnote stärker nach unten) — als Alternative oder Ergänzung zum Developer-System
- Developer-Zugriff auf weitere Nutzer ausweiten (Rolle ist bereits über `is_developer` skalierbar)
- Export zusätzlich als PDF
- (Bewusst verworfen: Push-Benachrichtigungen)

---

## 10. Arbeits-Workflow (wie man Änderungen live bringt)

Der Code liegt auf GitHub; Vercel deployt automatisch bei jedem Commit auf `main`.

**Standard-Ablauf für eine Code-Änderung:**

1. Geänderte Datei lokal vorbereiten (z. B. aus diesem Paket).
2. Auf GitHub die entsprechende Datei öffnen → Stift-Symbol (Bearbeiten) → kompletten Inhalt ersetzen → „Commit changes".
   - Neue Datei: „Add file" → „Create new file" → Pfad inkl. Ordner angeben (z. B. `src/supabase.js`).
   - Bei vielen/ großen Dateien: „Add file" → „Upload files" und Datei hochladen.
3. Vercel startet automatisch ein Deployment (~30 Sekunden). Status unter Vercel → Deployments.
4. Bei Fehlern: Vercel → Logs (Build- oder Runtime-Fehler) prüfen.

**Wichtige, bereits gelöste Stolperfallen (zur Erinnerung):**

- **CORS-Fehler** beim direkten API-Aufruf → gelöst durch den Server-Proxy `api/analyze.js`.
- **GitHub-Drag&Drop** lud manche Dateien als korrupte Binärdateien hoch (package.json, index.html) → einzeln über „Create new file" als Text neu anlegen.
- **GitHub legt keine Ordner per Drag&Drop an** → Dateien mit Pfad-Präfix anlegen (z. B. `src/App.jsx`).
- **413 (Bild zu groß)** → Bildkomprimierung im Browser (bereits umgesetzt).
- **Redirect auf localhost:3000** bei E-Mail-Bestätigung → Supabase „Site URL" auf die Vercel-Adresse setzen.
- **Doppelte Bestätigungsmail bleibt aus** → bei bereits registrierter E-Mail einfach normal anmelden.

---

## 11. Datenbankschema (Übersicht)

**Tabelle `portfolio`** (live): speichert gescannte Karten pro Nutzer. Felder u. a.: `user_id`, `card_name`, `set_name`, `card_number`, `psa_grade`, `cardmarket_grade`, `image_data`, `purchase_price`, `sale_price`, `notes`, `created_at`. RLS: Nutzer sehen/bearbeiten nur eigene Karten.

**Tabelle `profiles`** (geplant): `id`, `full_name`, `is_developer`, `created_at`. Wird automatisch bei Registrierung befüllt.

**Tabelle `corrections`** (geplant): `developer_id`, Karten-Infos, `ai_psa_grade`, `ai_cardmarket_grade`, `corrected_psa_grade`, `corrected_cardmarket_grade`, `correction_reason`, `key_issues`, `created_at`. RLS: nur Developer.

Vollständige Definitionen in den beiden SQL-Dateien im Ordner `database/`.

---

## 12. Schnellstart für die Fortsetzung

Wenn du in einem neuen Projekt-Kontext weiterarbeitest, ist die empfohlene Reihenfolge:

1. **Dieses Dokument** als Kontext bereitstellen.
2. **`database/02_developer_corrections_setup.sql`** in Supabase ausführen (Developer-System aktivieren).
3. In **`src/App.jsx`** das Developer-Korrektur-Panel ergänzen (siehe 9.1, Schritt 2).
4. Direktlinks in der Praxis testen (siehe 9.2).
5. Erste gesammelte Korrekturen sichten → Prompt in **`api/analyze.js`** verfeinern.

---

*Ende des Übergabedokuments. Alle Quelldateien liegen im beiliegenden Projektordner bzw. ZIP.*
