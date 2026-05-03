export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { imageData, mediaType, backImageData, backMediaType } = req.body;

  if (!imageData || !mediaType) {
    return res.status(400).json({ error: "Missing imageData or mediaType" });
  }

  const PROMPT = `Du bist ein Experte für Pokémon-Karten-Grading (PSA, BGS, CGC, CardMarket Standard). Analysiere diese Karte extrem detailliert.

Antworte NUR mit einem JSON-Objekt (kein Text, keine Backticks):
{
  "card_name": "<Exakter Kartenname>",
  "card_name_en": "<Englischer Kartenname>",
  "set": "<Vollständiger Set-Name>",
  "set_code": "<Set-Kürzel>",
  "card_number": "<Kartennummer z.B. 4/102>",
  "language": "<German | English | Japanese | French>",
  "rarity": "<Common | Uncommon | Rare | Holo Rare | Ultra Rare | Secret Rare | Promo>",
  "psa_grade": <1-10>,
  "cardmarket_grade": "<Mint | Near Mint | Excellent | Good | Light Played | Played | Poor>",
  "centering": {
    "front_left_right": "<z.B. 55/45>",
    "front_top_bottom": "<z.B. 50/50>",
    "back_left_right": "<links/rechts Rückseite>",
    "back_top_bottom": "<oben/unten Rückseite>",
    "assessment": "<Perfekt | Gut | Akzeptabel | Schlecht>",
    "details": "<2 Sätze>"
  },
  "whitening": {
    "front_severity": "<Keine | Minimal | Leicht | Mittel | Stark>",
    "back_severity": "<Keine | Minimal | Leicht | Mittel | Stark>",
    "locations": "<Wo genau?>",
    "details": "<2 Sätze>"
  },
  "front": {
    "corners": "<2 Sätze>",
    "edges": "<2 Sätze>",
    "surface": "<2 Sätze>",
    "overall": "<Gesamtzustand>"
  },
  "back": {
    "corners": "<Ecken>",
    "edges": "<Kanten>",
    "surface": "<Oberfläche>",
    "overall": "<Gesamtzustand>"
  },
  "investment_potential": "<Hoch | Mittel | Gering>",
  "estimated_value_raw": "<z.B. 5-15 EUR>",
  "estimated_value_graded": "<PSA 10 Wert>",
  "submit_to_psa": <true | false>,
  "key_flaws": ["<Mangel 1>", "<Mangel 2>"],
  "tips": "<Empfehlung>"
}`;

  const content = [];
  content.push({ type: "text", text: backImageData ? "Vorderseite:" : "Vorderseite (keine Rückseite):" });
  content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: imageData } });
  if (backImageData) {
    content.push({ type: "text", text: "Rückseite:" });
    content.push({ type: "image", source: { type: "base64", media_type: backMediaType, data: backImageData } });
  }
  content.push({ type: "text", text: PROMPT });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Analyse fehlgeschlagen" });
  }
}
