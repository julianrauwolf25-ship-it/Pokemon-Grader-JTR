import { useState, useRef, useCallback } from "react";

const PSA_GRADES = {
  10: { label: "Gem Mint", color: "#FFD700", glow: "#FFD70066", emoji: "💎" },
  9:  { label: "Mint", color: "#C8FFB0", glow: "#80FF4066", emoji: "✨" },
  8:  { label: "NM-MT", color: "#90EE90", glow: "#00CC4466", emoji: "🌟" },
  7:  { label: "Near Mint", color: "#7EC8E3", glow: "#00AAFF55", emoji: "⭐" },
  6:  { label: "EX-MT", color: "#ADD8E6", glow: "#0088CC44", emoji: "👍" },
  5:  { label: "Excellent", color: "#DDA0DD", glow: "#AA00AA44", emoji: "✔️" },
  4:  { label: "VG-EX", color: "#FFB347", glow: "#FF880044", emoji: "🟡" },
  3:  { label: "Very Good", color: "#FF8C69", glow: "#FF440033", emoji: "⚠️" },
  2:  { label: "Good", color: "#FF6B6B", glow: "#FF000033", emoji: "❌" },
  1:  { label: "Poor", color: "#999999", glow: "#44444433", emoji: "💔" },
};

const CM_GRADES = ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played", "Poor"];
const CM_COLORS = {
  "Mint": "#FFD700", "Near Mint": "#C8FFB0", "Excellent": "#90EE90",
  "Good": "#7EC8E3", "Light Played": "#FFB347", "Played": "#FF8C69", "Poor": "#FF6B6B"
};

const PROMPT = `Du bist ein Experte für Pokémon-Karten-Grading (PSA, BGS, CGC, CardMarket Standard). Analysiere diese Karte extrem detailliert.

Antworte NUR mit einem JSON-Objekt (kein Text, keine Backticks):
{
  "card_name": "<Exakter Kartenname wie auf der Karte, z.B. Glurak, Charizard, Pikachu>",
  "card_name_en": "<Englischer Kartenname falls nicht englisch, z.B. Charizard>",
  "set": "<Vollständiger Set-Name, z.B. Base Set, Jungle, Fossil, Neo Genesis, EX Dragon, Sword & Shield>",
  "set_code": "<Offizielles Set-Kürzel falls sichtbar, z.B. BS, JU, FO, NG, EXD, SSH — oder leer lassen>",
  "card_number": "<Kartennummer falls sichtbar, z.B. 4/102 oder 006/165>",
  "language": "<Sprache: German | English | Japanese | French | Italian | Spanish | Portuguese>",
  "rarity": "<Rarität: Common | Uncommon | Rare | Holo Rare | Ultra Rare | Secret Rare | Promo>",
  "psa_grade": <1-10, eine Dezimalstelle möglich z.B. 8.5>,
  "cardmarket_grade": "<Mint | Near Mint | Excellent | Good | Light Played | Played | Poor>",
  "centering": {
    "front_left_right": "<z.B. 55/45 oder 60/40>",
    "front_top_bottom": "<z.B. 50/50>",
    "back_left_right": "<links/rechts Rückseite>",
    "back_top_bottom": "<oben/unten Rückseite>",
    "assessment": "<Perfekt | Gut | Akzeptabel | Schlecht>",
    "details": "<Detaillierte Beschreibung in 2 Sätzen>"
  },
  "whitening": {
    "front_severity": "<Keine | Minimal | Leicht | Mittel | Stark>",
    "back_severity": "<Keine | Minimal | Leicht | Mittel | Stark>",
    "locations": "<Wo genau ist Whitening sichtbar?>",
    "details": "<Detaillierte Beschreibung in 2 Sätzen>"
  },
  "front": {
    "corners": "<Beschreibung der 4 Ecken, 2 Sätze>",
    "edges": "<Beschreibung der Kanten, 2 Sätze>",
    "surface": "<Kratzer, Glanz, Print-Fehler, 2 Sätze>",
    "overall": "<Gesamtzustand Vorderseite>"
  },
  "back": {
    "corners": "<Ecken Rückseite>",
    "edges": "<Kanten Rückseite>",
    "surface": "<Oberfläche Rückseite>",
    "overall": "<Gesamtzustand Rückseite>"
  },
  "investment_potential": "<Hoch | Mittel | Gering>",
  "estimated_value_raw": "<geschätzter Wert unbewertet in EUR, z.B. 5-15 EUR>",
  "estimated_value_graded": "<geschätzter Wert bei PSA 10 in EUR falls relevant>",
  "submit_to_psa": <true | false>,
  "key_flaws": ["<Hauptmangel 1>", "<Hauptmangel 2>"],
  "tips": "<Konkrete Empfehlung>"
}

Wenn nur eine Seite sichtbar ist, analysiere was du siehst. Wenn keine Pokémon-Karte: psa_grade=0.`;

export default function PokemonGrader() {
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [frontB64, setFrontB64] = useState(null);
  const [backB64, setBackB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const frontRef = useRef();
  const backRef = useRef();

  const handleFile = useCallback((file, side) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const b64data = dataUrl.split(",")[1];
      if (side === "front") {
        setFrontImg(dataUrl);
        setFrontB64({ data: b64data, mediaType: file.type });
      } else {
        setBackImg(dataUrl);
        setBackB64({ data: b64data, mediaType: file.type });
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeCard = async () => {
    if (!frontB64) return;
    setLoading(true);
    setResult(null);
    setActiveTab("overview");

    const content = [];
    content.push({ type: "text", text: backB64 ? "Vorderseite der Karte:" : "Vorderseite der Karte (keine Rückseite vorhanden):" });
    content.push({ type: "image", source: { type: "base64", media_type: frontB64.mediaType, data: frontB64.data } });
    if (backB64) {
      content.push({ type: "text", text: "Rückseite der Karte:" });
      content.push({ type: "image", source: { type: "base64", media_type: backB64.mediaType, data: backB64.data } });
    }
    content.push({ type: "text", text: PROMPT });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content }] }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setResult({ error: true }); }
    setLoading(false);
  };

  const psaGrade = result?.psa_grade;
  const psaRounded = psaGrade ? Math.round(psaGrade) : null;
  const psaCfg = psaRounded && psaGrade > 0 ? PSA_GRADES[Math.min(10, Math.max(1, psaRounded))] : null;
  const cmGrade = result?.cardmarket_grade;
  const cmColor = cmGrade ? CM_COLORS[cmGrade] : null;

  const tabs = ["overview", "centering", "whitening", "front", "back", "value"];
  const tabLabels = { overview: "Übersicht", centering: "Centering", whitening: "Whitening", front: "Vorderseite", back: "Rückseite", value: "Wert" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e8e0d5",
      overflowX: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        .tab-btn:hover { background: #1a1a22 !important; color: #8888aa !important; }
        .upload-zone:hover { border-color: #d4a84388 !important; background: #d4a84308 !important; }
        .analyze-btn:hover:not([disabled]) { transform: translateY(-1px); box-shadow: 0 8px 40px #d4a84355 !important; }
        .reset-btn:hover { border-color: #333 !important; color: #5a5a72 !important; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1a1a22",
        padding: "28px 40px 24px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#3a3a52", marginBottom: "6px" }}>
            PROFESSIONAL GRADING TOOL
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 3.5vw, 42px)",
            fontWeight: 900, margin: 0, color: "#e8e0d5",
            letterSpacing: "-0.5px", lineHeight: 1.1,
          }}>
            Pokémon <span style={{ fontStyle: "italic", color: "#d4a843" }}>Card Grader</span>
          </h1>
        </div>
        <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#2a2a38", textAlign: "right", lineHeight: 2.2 }}>
          PSA · BGS · CGC<br />CARDMARKET STANDARD
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Upload Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {[
            { side: "front", img: frontImg, ref: frontRef, label: "VORDERSEITE", icon: "▣" },
            { side: "back",  img: backImg,  ref: backRef,  label: "RÜCKSEITE",   icon: "▤", optional: true },
          ].map(({ side, img, ref, label, icon, optional }) => (
            <div key={side}>
              <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0], side)} />
              <div className="upload-zone" onClick={() => ref.current.click()} style={{
                border: `1px solid ${img ? "#d4a84344" : "#1a1a22"}`,
                borderRadius: "4px", padding: img ? "10px" : "36px 20px",
                textAlign: "center", cursor: "pointer", background: "#0d0d15",
                transition: "all 0.2s", minHeight: "140px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", position: "relative", overflow: "hidden",
              }}>
                {img ? (
                  <>
                    <img src={img} alt={label} style={{
                      maxHeight: "220px", maxWidth: "100%",
                      objectFit: "contain", borderRadius: "2px", display: "block",
                    }} />
                    <div style={{
                      position: "absolute", bottom: "8px", right: "8px",
                      background: "#000000bb", border: "1px solid #222",
                      borderRadius: "3px", fontSize: "8px", padding: "3px 8px",
                      letterSpacing: "2px", color: "#666",
                    }}>ÄNDERN</div>
                    <div style={{
                      position: "absolute", top: "8px", left: "8px",
                      background: "#d4a84318", border: "1px solid #d4a84333",
                      borderRadius: "3px", fontSize: "8px", padding: "3px 8px",
                      letterSpacing: "2px", color: "#d4a843",
                    }}>{label} ✓</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "24px", color: "#222233", marginBottom: "10px" }}>{icon}</div>
                    <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#2a2a42", marginBottom: "4px" }}>{label}</div>
                    {optional && <div style={{ fontSize: "8px", color: "#1a1a28", letterSpacing: "2px" }}>OPTIONAL</div>}
                    <div style={{ fontSize: "8px", color: "#1e1e2e", marginTop: "6px" }}>klicken zum hochladen</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Analyze Button */}
        <button className="analyze-btn" onClick={analyzeCard} disabled={!frontB64 || loading} style={{
          width: "100%", marginBottom: "36px",
          background: (!frontB64 || loading) ? "#111118" : "#d4a843",
          border: "none", borderRadius: "4px",
          color: (!frontB64 || loading) ? "#2a2a38" : "#0a0a0f",
          fontFamily: "'DM Mono', monospace", fontWeight: 500,
          fontSize: "10px", letterSpacing: "5px", padding: "16px",
          cursor: (!frontB64 || loading) ? "not-allowed" : "pointer",
          transition: "all 0.25s",
        }}>
          {loading ? "— ANALYSIERE —"
            : !frontB64 ? "— VORDERSEITE HOCHLADEN —"
            : `— KARTE ANALYSIEREN${backB64 ? " (BEIDE SEITEN)" : ""} —`}
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "pulse 1.4s ease infinite" }}>
            <div style={{ fontSize: "10px", letterSpacing: "8px", color: "#d4a843", marginBottom: "8px" }}>ANALYSIERE</div>
            <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#2a2a3a" }}>
              {backB64 ? "VORDER- UND RÜCKSEITE" : "VORDERSEITE"} · PSA + CARDMARKET
            </div>
          </div>
        )}

        {/* Results */}
        {result && !result.error && psaGrade > 0 && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Grade Hero */}
            <div style={{
              display: "grid", gridTemplateColumns: "160px 1fr 160px",
              gap: "0", alignItems: "center",
              borderTop: "1px solid #1a1a22", borderBottom: "1px solid #1a1a22",
              marginBottom: "28px",
            }}>
              {/* PSA */}
              <div style={{ textAlign: "center", padding: "28px 20px" }}>
                <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "6px" }}>PSA GRADE</div>
                <div style={{
                  fontSize: "72px", fontFamily: "'Playfair Display', serif", fontWeight: 900,
                  color: psaCfg?.color || "#fff", lineHeight: 1,
                  textShadow: `0 0 30px ${psaCfg?.glow || "#ffffff22"}`,
                }}>
                  {psaGrade % 1 === 0 ? psaGrade : psaGrade.toFixed(1)}
                </div>
                <div style={{ fontSize: "10px", letterSpacing: "2px", color: psaCfg?.color, marginTop: "4px" }}>
                  {psaCfg?.emoji} {psaCfg?.label}
                </div>
              </div>

              {/* Card Info */}
              <div style={{ padding: "28px 32px", borderLeft: "1px solid #1a1a22", borderRight: "1px solid #1a1a22" }}>
                <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>KARTE</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(18px, 2.2vw, 30px)",
                  fontWeight: 700, color: "#e8e0d5", marginBottom: "4px", lineHeight: 1.2,
                }}>
                  {result.card_name}
                </div>
                <div style={{ fontSize: "10px", color: "#3a3a52", letterSpacing: "1px", marginBottom: "16px" }}>
                  {result.set}{result.language && result.language !== "Unbekannt" ? ` · ${result.language}` : ""}
                </div>
                {result.key_flaws?.filter(Boolean).length > 0 && (
                  <>
                    <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "6px" }}>HAUPTMÄNGEL</div>
                    {result.key_flaws.filter(Boolean).map((f, i) => (
                      <div key={i} style={{ fontSize: "10px", color: "#FF8C69", marginBottom: "3px" }}>— {f}</div>
                    ))}
                  </>
                )}
              </div>

              {/* CardMarket */}
              <div style={{ textAlign: "center", padding: "28px 20px" }}>
                <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>CARDMARKET</div>
                <div style={{
                  fontSize: "11px", fontWeight: 500, letterSpacing: "1px",
                  color: cmColor || "#aaa",
                  border: `1px solid ${cmColor ? cmColor + "44" : "#222"}`,
                  borderRadius: "3px", padding: "8px 12px",
                  background: cmColor ? cmColor + "0e" : "transparent", marginBottom: "16px",
                }}>
                  {cmGrade || "—"}
                </div>
                <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "6px" }}>PSA EINREICHUNG</div>
                <div style={{ fontSize: "10px", letterSpacing: "1px", color: result.submit_to_psa ? "#90EE90" : "#FF8C69" }}>
                  {result.submit_to_psa ? "✓ EMPFOHLEN" : "✗ NICHT EMPF."}
                </div>
              </div>
            </div>

            {/* CardMarket Scale Bar */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>CARDMARKET SKALA</div>
              <div style={{ display: "flex", gap: "4px" }}>
                {CM_GRADES.map(g => (
                  <div key={g} style={{
                    flex: 1, textAlign: "center", padding: "8px 2px",
                    border: `1px solid ${g === cmGrade ? CM_COLORS[g] + "77" : "#1a1a22"}`,
                    borderRadius: "3px",
                    background: g === cmGrade ? CM_COLORS[g] + "15" : "transparent",
                    fontSize: "8px", letterSpacing: "0.5px",
                    color: g === cmGrade ? CM_COLORS[g] : "#2a2a3a",
                    fontWeight: g === cmGrade ? 500 : 400,
                    transition: "all 0.2s",
                  }}>
                    {g === cmGrade && <div style={{ fontSize: "6px", marginBottom: "2px" }}>▲</div>}
                    {g}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #1a1a22", marginBottom: "20px", overflowX: "auto" }}>
              {tabs.map(t => (
                <button key={t} className="tab-btn" onClick={() => setActiveTab(t)} style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === t ? "1px solid #d4a843" : "1px solid transparent",
                  color: activeTab === t ? "#d4a843" : "#2a2a3a",
                  fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "3px",
                  padding: "10px 18px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}>
                  {tabLabels[t].toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div style={{ animation: "fadeUp 0.25s ease" }}>

              {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { label: "ZENTRIERUNG", value: result.centering?.assessment, sub: `V: ${result.centering?.front_left_right} · ${result.centering?.front_top_bottom}` },
                    { label: "WHITENING", value: `Vorne: ${result.whitening?.front_severity} · Hinten: ${result.whitening?.back_severity}`, sub: result.whitening?.locations },
                    { label: "VORDERSEITE", value: result.front?.overall },
                    { label: "RÜCKSEITE", value: result.back?.overall || "Keine Rückseite analysiert" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "18px" }}>
                      <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>{label}</div>
                      <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.6 }}>{value}</div>
                      {sub && <div style={{ fontSize: "9px", color: "#3a3a4a", marginTop: "6px" }}>{sub}</div>}
                    </div>
                  ))}
                  <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "18px", gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>EMPFEHLUNG</div>
                    <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.6 }}>{result.tips}</div>
                  </div>
                </div>
              )}

              {activeTab === "centering" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { label: "VORDERSEITE", lr: result.centering?.front_left_right, tb: result.centering?.front_top_bottom, accent: "#d4a843" },
                    { label: "RÜCKSEITE", lr: result.centering?.back_left_right, tb: result.centering?.back_top_bottom, accent: "#7EC8E3" },
                  ].map(({ label, lr, tb, accent }) => (
                    <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "24px" }}>
                      <div style={{ fontSize: "8px", letterSpacing: "4px", color: accent, marginBottom: "20px" }}>{label}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        {[{ l: "LINKS / RECHTS", v: lr }, { l: "OBEN / UNTEN", v: tb }].map(({ l, v }) => (
                          <div key={l}>
                            <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#3a3a52", marginBottom: "6px" }}>{l}</div>
                            <div style={{ fontSize: "26px", fontFamily: "'Playfair Display', serif", color: "#e8e0d5" }}>{v || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px", gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>BEWERTUNG</div>
                    <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.7, marginBottom: "14px" }}>{result.centering?.details}</div>
                    <span style={{ display: "inline-block", border: "1px solid #d4a84333", borderRadius: "3px", padding: "5px 14px", fontSize: "9px", letterSpacing: "3px", color: "#d4a843" }}>
                      {result.centering?.assessment?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "whitening" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { label: "VORDERSEITE", severity: result.whitening?.front_severity, accent: "#d4a843" },
                    { label: "RÜCKSEITE", severity: result.whitening?.back_severity, accent: "#7EC8E3" },
                  ].map(({ label, severity, accent }) => {
                    const sColors = { "Keine": "#90EE90", "Minimal": "#C8FFB0", "Leicht": "#FFD700", "Mittel": "#FFB347", "Stark": "#FF6B6B" };
                    return (
                      <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "24px", textAlign: "center" }}>
                        <div style={{ fontSize: "8px", letterSpacing: "4px", color: accent, marginBottom: "20px" }}>{label}</div>
                        <div style={{
                          fontSize: "28px", fontFamily: "'Playfair Display', serif",
                          color: sColors[severity] || "#555", marginBottom: "4px",
                        }}>{severity || "—"}</div>
                        <div style={{ fontSize: "8px", letterSpacing: "2px", color: "#2a2a3a" }}>SCHWEREGRAD</div>
                      </div>
                    );
                  })}
                  <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px", gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "6px" }}>STANDORTE</div>
                    <div style={{ fontSize: "11px", color: "#5a5a6a", marginBottom: "14px" }}>{result.whitening?.locations || "Kein Whitening erkannt"}</div>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>DETAILS</div>
                    <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.7 }}>{result.whitening?.details}</div>
                  </div>
                </div>
              )}

              {(activeTab === "front" || activeTab === "back") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { label: "ECKEN", value: result[activeTab]?.corners },
                    { label: "KANTEN", value: result[activeTab]?.edges },
                    { label: "OBERFLÄCHE", value: result[activeTab]?.surface },
                    { label: "GESAMT", value: result[activeTab]?.overall },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "18px" }}>
                      <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>{label}</div>
                      <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.6 }}>{value || "Keine Daten"}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "value" && (() => {
                // Build the most precise search strings possible
                const nameEn = result.card_name_en || result.card_name || "";
                const nameLoc = result.card_name || "";
                const set = result.set || "";
                const setCode = result.set_code || "";
                const cardNum = result.card_number || "";
                const lang = result.language || "";

                // CardMarket: use localized name + set, language filter for non-English
                const cmLang = lang === "German" ? "de" : lang === "French" ? "fr" : lang === "Italian" ? "it" : lang === "Spanish" ? "es" : "en";
                const cmSearchTerm = [nameLoc, setCode].filter(Boolean).join(" ");
                const cmUrl = `https://www.cardmarket.com/${cmLang}/Pokemon/Products/Search?searchString=${encodeURIComponent(cmSearchTerm)}`;

                // PriceCharting: always English name for best results
                // With card number it jumps almost directly to the right card
                const pcBase = [nameEn, set, cardNum].filter(Boolean).join(" ");
                const pcRawUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(pcBase)}`;
                const pcGradedUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(nameEn + " " + set + " PSA")}`;

                // Search hint shown to user
                const searchHint = [nameEn, setCode || set, cardNum].filter(Boolean).join(" · ");
                const linkStyle = (bg, border, color) => ({
                  display: "block", textAlign: "center", padding: "10px",
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: "3px", color,
                  fontFamily: "'DM Mono', monospace", fontSize: "8px",
                  letterSpacing: "3px", textDecoration: "none",
                });
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    {[
                      { label: "KI-SCHÄTZUNG ROHWERT", value: result.estimated_value_raw, color: "#e8e0d5", note: `Unbewertet · ${result.cardmarket_grade || ""}` },
                      { label: "KI-SCHÄTZUNG PSA 10", value: result.estimated_value_graded || "N/A", color: "#FFD700", note: `PSA ${result.psa_grade || ""} Slab` },
                      { label: "INVESTITIONSPOTENZIAL", value: result.investment_potential,
                        color: result.investment_potential === "Hoch" ? "#90EE90" : result.investment_potential === "Mittel" ? "#FFD700" : "#FF8C69",
                        note: "KI-Einschätzung" },
                    ].map(({ label, value, color, note }) => (
                      <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px", textAlign: "center" }}>
                        <div style={{ fontSize: "7px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "12px" }}>{label}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(14px, 1.8vw, 22px)", color, fontWeight: 700, marginBottom: "6px" }}>{value}</div>
                        <div style={{ fontSize: "7px", letterSpacing: "1px", color: "#2a2a3a" }}>{note}</div>
                      </div>
                    ))}

                    <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "16px", margin: "4px 0" }}>
                      <div style={{ flex: 1, height: "1px", background: "#1a1a22" }} />
                      <div style={{ fontSize: "7px", letterSpacing: "4px", color: "#2a2a3a" }}>LIVE-PREISE NACHSCHLAGEN</div>
                      <div style={{ flex: 1, height: "1px", background: "#1a1a22" }} />
                    </div>

                    {searchHint && (
                      <div style={{ gridColumn: "1 / -1", background: "#ffffff04", border: "1px solid #1a1a22", borderRadius: "4px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#3a3a52", whiteSpace: "nowrap" }}>SUCHBEGRIFF</div>
                        <div style={{ fontSize: "11px", color: "#6a6a7a", fontFamily: "'DM Mono', monospace" }}>{searchHint}</div>
                        {result.rarity && <div style={{ marginLeft: "auto", fontSize: "8px", letterSpacing: "2px", color: "#d4a843", whiteSpace: "nowrap" }}>{result.rarity}</div>}
                      </div>
                    )}

                    <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#005cff18", border: "1px solid #005cff33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🃏</div>
                        <div>
                          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#e8e0d5" }}>CardMarket</div>
                          <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#3a3a52" }}>RAW · ALLE ZUSTÄNDE</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "10px", color: "#5a5a6a", lineHeight: 1.6, marginBottom: "6px" }}>
                        Aktuelle Marktpreise für <span style={{ color: "#c8c0b5" }}>{nameLoc}</span>
                      </div>
                      {cardNum && <div style={{ fontSize: "9px", color: "#3a3a4a", marginBottom: "14px" }}>Nr. {cardNum} · {set}</div>}
                      {!cardNum && <div style={{ fontSize: "9px", color: "#3a3a4a", marginBottom: "14px" }}>{set}</div>}
                      <a href={cmUrl} target="_blank" rel="noopener noreferrer" style={linkStyle("#005cff18", "#005cff44", "#5599ff")}>
                        → AUF CARDMARKET ÖFFNEN
                      </a>
                    </div>

                    <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#d4a84318", border: "1px solid #d4a84333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📊</div>
                        <div>
                          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#e8e0d5" }}>PriceCharting</div>
                          <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#3a3a52" }}>RAW · UNBEWERTET</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "10px", color: "#5a5a6a", lineHeight: 1.6, marginBottom: "6px" }}>
                        Rohpreise für <span style={{ color: "#c8c0b5" }}>{nameEn}</span>
                      </div>
                      {cardNum && <div style={{ fontSize: "9px", color: "#3a3a4a", marginBottom: "14px" }}>Nr. {cardNum} · präzise Suche</div>}
                      {!cardNum && <div style={{ fontSize: "9px", color: "#3a3a4a", marginBottom: "14px" }}>Unbewertet · mit Preisverlauf</div>}
                      <a href={pcRawUrl} target="_blank" rel="noopener noreferrer" style={linkStyle("#d4a84315", "#d4a84333", "#d4a843")}>
                        → RAW PREISE ANSEHEN
                      </a>
                    </div>

                    <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#FFD70018", border: "1px solid #FFD70033", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>💎</div>
                        <div>
                          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#e8e0d5" }}>PriceCharting</div>
                          <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#3a3a52" }}>PSA GRADED · SLABS</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "10px", color: "#5a5a6a", lineHeight: 1.6, marginBottom: "6px" }}>
                        PSA-Slab Preise für <span style={{ color: "#c8c0b5" }}>{nameEn}</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "#3a3a4a", marginBottom: "14px" }}>PSA 10 · PSA 9 · mit Markthistorie</div>
                      <a href={pcGradedUrl} target="_blank" rel="noopener noreferrer" style={linkStyle("#FFD70010", "#FFD70033", "#FFD700")}>
                        → PSA PREISE ANSEHEN
                      </a>
                    </div>

                    <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "18px", gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>PSA EINREICHUNG</div>
                      <div style={{ fontSize: "12px", color: result.submit_to_psa ? "#90EE90" : "#FF8C69", marginBottom: "8px" }}>
                        {result.submit_to_psa ? "✓ Einreichung bei PSA empfohlen" : "✗ PSA-Einreichung lohnt sich voraussichtlich nicht"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#4a4a5a", lineHeight: 1.6 }}>{result.tips}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button className="reset-btn" onClick={() => { setFrontImg(null); setBackImg(null); setFrontB64(null); setBackB64(null); setResult(null); }} style={{
              marginTop: "36px", width: "100%", background: "transparent",
              border: "1px solid #1a1a22", borderRadius: "4px", color: "#2a2a3a",
              fontFamily: "'DM Mono', monospace", fontSize: "8px",
              letterSpacing: "5px", padding: "14px", cursor: "pointer", transition: "all 0.2s",
            }}>
              — NEUE KARTE ANALYSIEREN —
            </button>
          </div>
        )}

        {result?.error && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#FF6B6B", marginBottom: "20px" }}>
              ANALYSE FEHLGESCHLAGEN
            </div>
            <button onClick={analyzeCard} style={{
              background: "transparent", border: "1px solid #FF6B6B44", color: "#FF6B6B",
              fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "3px",
              padding: "12px 24px", cursor: "pointer", borderRadius: "3px",
            }}>NOCHMAL VERSUCHEN</button>
          </div>
        )}
      </main>
    </div>
  );
}
