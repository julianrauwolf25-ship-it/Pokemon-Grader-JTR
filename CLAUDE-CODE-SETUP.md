# Mit Claude Code weiterarbeiten — Einrichtung & Anleitung

Diese Anleitung bringt dich von Null bis zum produktiven Arbeiten am Pokémon Card Grader mit **Claude Code** (dem Kommandozeilen-Tool von Anthropic, das direkt in deinem Projektordner arbeitet).

---

## Was du brauchst

- **Einen Rechner** (macOS, Linux oder Windows). Auf Windows läuft Claude Code am besten über **WSL** (Windows Subsystem for Linux) oder Git für Windows.
- **Ein bezahltes Anthropic-Konto** — Claude Code ist nicht im kostenlosen Plan enthalten. Es funktioniert mit Claude Pro/Max, Team/Enterprise oder einem Anthropic-Console-Konto mit API-Guthaben. <cite index="3-1">Claude Code requires a paid account: Claude Pro, Claude Max, Claude Teams, Claude Enterprise, or an Anthropic Console account with API credits — the free Claude.ai plan does not include Claude Code access.</cite>
- **Git** (empfohlen, um das Repo zu klonen).

---

## Schritt 1 — Claude Code installieren

Es gibt zwei Wege. Anthropic empfiehlt inzwischen den **nativen Installer** (braucht kein Node.js, aktualisiert sich selbst).

**Variante A — Nativer Installer (empfohlen):**

- macOS/Linux (im Terminal):
  ```bash
  curl -fsSL https://claude.ai/install.sh | bash
  ```
- Windows: WSL einrichten und dort denselben Befehl ausführen, oder Git für Windows verwenden.

**Variante B — über npm** (falls du npm ohnehin nutzt). <cite index="3-1,5-1">Erfordert Node.js 18 oder neuer; installiere mit `npm install -g @anthropic-ai/claude-code` und verwende niemals `sudo`.</cite> Bei Rechte-Fehlern (EACCES) nicht mit sudo arbeiten, sondern nvm verwenden oder das npm-Prefix auf ein eigenes Verzeichnis setzen.

**Installation prüfen:**
```bash
claude --version
```

---

## Schritt 2 — Projekt auf den Rechner holen

Der gesamte Code liegt bereits auf GitHub. Am saubersten klonst du das Repo:

```bash
git clone https://github.com/julianrauwolf25-ship-it/Pokemon-Grader-JTR.git
cd Pokemon-Grader-JTR
```

> Falls du lieber mit dem mitgelieferten Übergabepaket startest: entpacke das ZIP und öffne den Ordner stattdessen.

**Wichtig — die Doku- und Hilfsdateien ins Repo legen:** Die folgenden Dateien aus diesem Paket sind noch **nicht** im GitHub-Repo und sollten dort ergänzt werden, damit Claude Code sie als Kontext nutzt:

- `CLAUDE.md` (wird von Claude Code automatisch gelesen — am wichtigsten!)
- `PROJEKT-HANDBUCH.md`
- `README.md` (ggf. ersetzen)
- `.env.example`
- `.gitignore`
- der Ordner `database/` mit den beiden SQL-Dateien

Kopiere sie in den Projektordner und committe sie.

---

## Schritt 3 — Abhängigkeiten & lokale Umgebung

```bash
npm install
```

Dann eine lokale `.env`-Datei anlegen (Vorlage: `.env.example`). Trage die echten Werte ein (aus Vercel → Settings → Environment Variables bzw. deiner Notiz):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
SUPABASE_SERVICE_KEY=...
```

> **Niemals** die echte `.env` committen — sie ist über `.gitignore` ausgeschlossen.

**Lokal starten:**
```bash
npm run dev        # Frontend (Vite)
```

Die Bewertungsfunktion `/api/analyze` ist eine Vercel-Serverless-Funktion. Damit sie lokal mitläuft, brauchst du die Vercel CLI:
```bash
npm i -g vercel
vercel dev         # startet Frontend + Serverless-Funktion zusammen
```

---

## Schritt 4 — Claude Code starten

Im Projektordner einfach:
```bash
claude
```

Beim ersten Start führt dich Claude Code durch die Anmeldung (Browser-Login mit deinem Anthropic-Konto). Danach liest Claude Code automatisch die `CLAUDE.md` und kennt damit den kompletten Projektkontext.

---

## Schritt 5 — Sinnvolle erste Aufgaben (Prompts für Claude Code)

Beispiele, die du Claude Code direkt geben kannst:

- **Developer-System bauen (Hauptaufgabe):**
  > „Lies CLAUDE.md und PROJEKT-HANDBUCH.md. Implementiere das Developer-Korrektur-System gemäß Roadmap-Punkt 1: lade beim Login `is_developer` aus der Tabelle `profiles`, zeige für Developer nach der Analyse ein Korrektur-Panel (PSA-Dropdown 1–10, CardMarket-Dropdown, Grund-Textfeld, Speichern-Button, der in die Tabelle `corrections` schreibt) und ergänze einen CSV-Export der Korrekturen. Halte dich an die bestehenden Inline-Style-Konventionen und beide Themes."

- **Datenbank vorbereiten:** Die SQL aus `database/02_developer_corrections_setup.sql` im Supabase SQL Editor ausführen (das macht Claude Code nicht für dich — das läuft in der Supabase-Weboberfläche).

- **Direktlinks testen/verbessern:**
  > „Prüfe die CardMarket- und PriceCharting-Linkgenerierung im Wert-Reiter und im Prompt in api/analyze.js. Schlage Verbesserungen vor, damit die Links zuverlässiger die richtige Kartenseite treffen."

---

## Schritt 6 — Änderungen live bringen

Claude Code arbeitet lokal. Wenn du zufrieden bist:

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Vercel deployt automatisch bei jedem Push auf `main` (~30 Sekunden). Status: Vercel → Deployments. Bei Fehlern: Vercel → Logs.

> Claude Code kann diese Git-Schritte auf Wunsch auch selbst ausführen — du kannst es einfach bitten, die Änderungen zu committen und zu pushen.

---

## Wichtigste Erinnerung

Wenn die Analyse mit Fehler 500 abbricht: zuerst den **Modellnamen** in `api/analyze.js` prüfen. Funktionierend ist `claude-haiku-4-5-20251001`. Details in `CLAUDE.md` und `PROJEKT-HANDBUCH.md`.

---

## Offizielle Dokumentation

- Claude Code Übersicht: https://docs.claude.com/en/docs/claude-code/overview
- npm-Paket: https://www.npmjs.com/package/@anthropic-ai/claude-code
- Installations-Troubleshooting: https://support.claude.com/en/articles/14552646-troubleshoot-claude-code-installation-and-authentication
