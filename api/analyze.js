export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const { imageData, mediaType, backImageData, backMediaType } = req.body || {};

  if (!imageData || !mediaType) {
    return res.status(400).json({ error: "Missing imageData or mediaType" });
  }

  const PROMPT = `Du bist ein Experte für Pokémon-Karten-Grading und kennst CardMarket sowie PriceCharting sehr gut. Analysiere diese Karte.

WICHTIG — Identifikation ZUERST, anhand der Angaben am UNTEREN Kartenrand (nicht raten):
- Lies dort die Copyright-Jahreszahl, die Kartennummer im Format X/Y (X = Position im Set, Y = Setgröße) und das Set-Symbol. Diese drei Angaben bestimmen das Set. Nenne card_number exakt wie aufgedruckt.
- Die Jahreszahl grenzt die Ära ein. Achtung Verwechslungsgefahr beim Zusatz "ex": kleingeschriebenes "ex" + Jahr 2003–2006 → alte EX-Serie (EX Ruby & Sapphire bis EX Power Keepers); kleingeschriebenes "ex" + Jahr ab 2023 → Scarlet & Violet; großes "EX" + Jahr 2012–2016 → BW/XY-Ära. Ordne eine alte Karte NIEMALS einem aktuellen Set zu.
- Sprache anhand der Schrift auf der Karte bestimmen: japanische Schriftzeichen → "Japanese", deutsche Texte → "German", usw. Japanische Karten haben eigene Set-Namen und teils andere Nummernformate — gib dann das japanische Set an.
- Wenn das Set nicht eindeutig erkennbar ist: das anhand von Jahreszahl + Kartennummer wahrscheinlichste Set nennen, kein modernes Set als Standardannahme verwenden.

Für die Links gilt:
- CardMarket Singles-URL Format: https://www.cardmarket.com/de/Pokemon/Products/Singles/{Set-URL-Slug}/{Karten-URL-Slug}
  Beispiele:
  - Glurak aus Base Set: https://www.cardmarket.com/de/Pokemon/Products/Singles/Base-Set/Glurak
  - Pikachu VMAX aus Sword Shield: https://www.cardmarket.com/de/Pokemon/Products/Singles/Sword-Shield-Promo-Cards/Pikachu-VMAX
  - Zoroark-ex aus Scarlet Violet: https://www.cardmarket.com/de/Pokemon/Products/Singles/Scarlet-Violet/Zoroark-ex
  Regel: Leerzeichen → Bindestrich, Sonderzeichen weglassen, deutsche Kartennamen verwenden falls deutsche Karte
- PriceCharting URL Format: https://www.pricecharting.com/game/pokemon-{set-slug}/{kartenname-slug}
  Beispiele:
  - Charizard Base Set: https://www.pricecharting.com/game/pokemon-base-set/charizard-4
  - Pikachu VMAX: https://www.pricecharting.com/game/pokemon-swsh-promo/pikachu-vmax-44

Antworte NUR mit einem JSON-Objekt (kein Text, keine Backticks, kein Markdown):
{"card_name":"<Name>","card_name_en":"<EnglName>","set":"<Set>","set_code":"<Kürzel>","card_number":"<Nr z.B. 4/102>","language":"<German|English|Japanese>","rarity":"<Rarität>","psa_grade":<1-10>,"cardmarket_grade":"<Mint|Near Mint|Excellent|Good|Light Played|Played|Poor>","cardmarket_url":"<vollständige CardMarket URL direkt zur Karte>","pricecharting_url":"<vollständige PriceCharting URL direkt zur Karte>","pricecharting_psa_url":"<PriceCharting URL für PSA Slabs dieser Karte>","centering":{"front_left_right":"<z.B. 55/45>","front_top_bottom":"<z.B. 50/50>","back_left_right":"<>","back_top_bottom":"<>","assessment":"<Perfekt|Gut|Akzeptabel|Schlecht>","details":"<2 Sätze>"},"whitening":{"front_severity":"<Keine|Minimal|Leicht|Mittel|Stark>","back_severity":"<Keine|Minimal|Leicht|Mittel|Stark>","locations":"<wo>","details":"<2 Sätze>"},"front":{"corners":"<2 Sätze>","edges":"<2 Sätze>","surface":"<2 Sätze>","overall":"<>"},"back":{"corners":"<>","edges":"<>","surface":"<>","overall":"<>"},"investment_potential":"<Hoch|Mittel|Gering>","estimated_value_raw":"<z.B. 5-15 EUR>","estimated_value_graded":"<PSA 10 Wert>","submit_to_psa":<true|false>,"key_flaws":["<>","<>"],"tips":"<>"}

Wenn keine Pokémon-Karte erkannt: psa_grade=0.`;

  const content = [];
  content.push({ type: "text", text: backImageData ? "Vorderseite:" : "Vorderseite (keine Rückseite vorhanden):" });
  content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: imageData } });
  if (backImageData) {
    content.push({ type: "text", text: "Rückseite:" });
    content.push({ type: "image", source: { type: "base64", media_type: backMediaType || "image/jpeg", data: backImageData } });
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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(500).json({ error: `Anthropic error: ${data?.error?.message || response.status}` });
    }

    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();

    if (!clean) {
      console.error("Empty response from Anthropic");
      return res.status(500).json({ error: "Empty response from AI" });
    }

    const result = JSON.parse(clean);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
