import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

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

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        if (data.user && !data.session) setSuccess("Bestätigungs-E-Mail gesendet! Bitte bestätigen.");
        else onAuth(data.user);
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const inp = { width: "100%", background: "#0d0d15", border: "1px solid #1a1a22", borderRadius: "3px", color: "#e8e0d5", fontFamily: "'DM Mono', monospace", fontSize: "12px", padding: "12px", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", padding: "24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: "420px", animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#3a3a52", marginBottom: "12px" }}>PROFESSIONAL GRADING TOOL</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 900, margin: 0, color: "#e8e0d5", lineHeight: 1.1 }}>
            Pokémon <span style={{ fontStyle: "italic", color: "#d4a843" }}>Card Grader</span>
          </h1>
        </div>
        <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "32px" }}>
          <div style={{ display: "flex", marginBottom: "28px", borderBottom: "1px solid #1a1a22" }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, background: "transparent", border: "none", borderBottom: mode === m ? "1px solid #d4a843" : "1px solid transparent", color: mode === m ? "#d4a843" : "#3a3a52", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", padding: "10px", cursor: "pointer" }}>
                {m === "login" ? "ANMELDEN" : "REGISTRIEREN"}
              </button>
            ))}
          </div>
          {mode === "register" && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#5a5a72", marginBottom: "6px" }}>NAME</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" style={inp} />
            </div>
          )}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#5a5a72", marginBottom: "6px" }}>E-MAIL</div>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="deine@email.de" style={inp} />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#5a5a72", marginBottom: "6px" }}>PASSWORT</div>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inp} />
          </div>
          {error && <div style={{ fontSize: "10px", color: "#FF6B6B", marginBottom: "16px" }}>{error}</div>}
          {success && <div style={{ fontSize: "10px", color: "#90EE90", marginBottom: "16px" }}>{success}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "#111118" : "#d4a843", border: "none", borderRadius: "3px", color: loading ? "#3a3a52" : "#0a0a0f", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "10px", letterSpacing: "5px", padding: "16px", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "LADEN..." : mode === "login" ? "ANMELDEN" : "KONTO ERSTELLEN"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioScreen({ user }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCard, setEditCard] = useState(null);
  const [editPurchase, setEditPurchase] = useState("");
  const [editSale, setEditSale] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });
    setCards(data || []);
    setLoading(false);
  };

  const startEdit = (card) => {
    setEditCard(card.id);
    setEditPurchase(card.purchase_price?.toString() || "");
    setEditSale(card.sale_price?.toString() || "");
    setEditNotes(card.notes || "");
  };

  const saveEdit = async (id) => {
    setSaving(true);
    await supabase.from("portfolio").update({ purchase_price: editPurchase ? parseFloat(editPurchase) : null, sale_price: editSale ? parseFloat(editSale) : null, notes: editNotes }).eq("id", id);
    setEditCard(null);
    await loadCards();
    setSaving(false);
  };

  const deleteCard = async (id) => {
    await supabase.from("portfolio").delete().eq("id", id);
    setDeleteConfirm(null);
    await loadCards();
  };

  const totalPurchase = cards.reduce((s, c) => s + (c.purchase_price || 0), 0);
  const totalSale = cards.reduce((s, c) => s + (c.sale_price || 0), 0);
  const profit = totalSale - totalPurchase;
  const inp = { background: "#0d0d15", border: "1px solid #1a1a22", borderRadius: "3px", color: "#e8e0d5", fontFamily: "'DM Mono', monospace", fontSize: "11px", padding: "8px 10px", outline: "none", width: "100%" };

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", color: "#e8e0d5" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        {[{ label: "KARTEN", value: cards.length, color: "#e8e0d5" }, { label: "EINKAUF GESAMT", value: `${totalPurchase.toFixed(2)} €`, color: "#FF8C69" }, { label: "VERKAUF GESAMT", value: `${totalSale.toFixed(2)} €`, color: "#90EE90" }].map(({ label, value, color }) => (
          <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "7px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "8px" }}>{label}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {cards.length > 0 && (
        <div style={{ border: `1px solid ${profit >= 0 ? "#90EE9044" : "#FF6B6B44"}`, borderRadius: "4px", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: profit >= 0 ? "#90EE9008" : "#FF6B6B08" }}>
          <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#5a5a72" }}>GEWINN / VERLUST</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: profit >= 0 ? "#90EE90" : "#FF6B6B" }}>
            {profit >= 0 ? "+" : ""}{profit.toFixed(2)} €
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: "60px", color: "#3a3a52", fontSize: "10px", letterSpacing: "4px" }}>LADE SAMMLUNG...</div>}

      {!loading && cards.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", border: "1px solid #1a1a22", borderRadius: "4px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🃏</div>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#3a3a52" }}>KEINE KARTEN IN DER SAMMLUNG</div>
          <div style={{ fontSize: "11px", color: "#2a2a3a", marginTop: "8px", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>Analysiere eine Karte und füge sie hinzu</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {cards.map(card => {
          const psaCfg = card.psa_grade ? PSA_GRADES[Math.round(card.psa_grade)] : null;
          const isEditing = editCard === card.id;
          return (
            <div key={card.id} style={{ border: "1px solid #1a1a22", borderRadius: "4px", overflow: "hidden", animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "0" }}>
                <div style={{ background: "#0d0d15", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                  {card.image_data ? <img src={card.image_data} alt={card.card_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: "24px" }}>🃏</div>}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "#e8e0d5", marginBottom: "2px" }}>{card.card_name}</div>
                  <div style={{ fontSize: "9px", color: "#3a3a52", letterSpacing: "1px", marginBottom: "10px" }}>{card.set_name} {card.card_number ? `· ${card.card_number}` : ""}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                    {psaCfg && <span style={{ fontSize: "9px", letterSpacing: "2px", color: psaCfg.color, border: `1px solid ${psaCfg.color}44`, borderRadius: "3px", padding: "3px 8px" }}>PSA {card.psa_grade}</span>}
                    {card.cardmarket_grade && <span style={{ fontSize: "9px", color: CM_COLORS[card.cardmarket_grade] || "#aaa", border: `1px solid ${CM_COLORS[card.cardmarket_grade] || "#aaa"}44`, borderRadius: "3px", padding: "3px 8px" }}>{card.cardmarket_grade}</span>}
                  </div>
                  {isEditing ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#FF8C69", marginBottom: "4px" }}>EINKAUFSPREIS €</div>
                        <input value={editPurchase} onChange={e => setEditPurchase(e.target.value)} type="number" placeholder="0.00" style={inp} />
                      </div>
                      <div>
                        <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#90EE90", marginBottom: "4px" }}>VERKAUFSPREIS €</div>
                        <input value={editSale} onChange={e => setEditSale(e.target.value)} type="number" placeholder="0.00" style={inp} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#5a5a72", marginBottom: "4px" }}>NOTIZEN</div>
                        <input value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Eigene Notizen..." style={inp} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#FF8C69", marginBottom: "2px" }}>EINKAUF</div>
                        <div style={{ fontSize: "13px", color: card.purchase_price ? "#FF8C69" : "#2a2a3a" }}>{card.purchase_price ? `${card.purchase_price.toFixed(2)} €` : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#90EE90", marginBottom: "2px" }}>VERKAUF</div>
                        <div style={{ fontSize: "13px", color: card.sale_price ? "#90EE90" : "#2a2a3a" }}>{card.sale_price ? `${card.sale_price.toFixed(2)} €` : "—"}</div>
                      </div>
                      {card.notes && <div style={{ flex: 1 }}><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#5a5a72", marginBottom: "2px" }}>NOTIZ</div><div style={{ fontSize: "11px", color: "#7a7a8a" }}>{card.notes}</div></div>}
                    </div>
                  )}
                </div>
                <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center", borderLeft: "1px solid #1a1a22" }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(card.id)} disabled={saving} style={{ background: "#d4a843", border: "none", borderRadius: "3px", color: "#0a0a0f", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "2px", padding: "8px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{saving ? "..." : "SPEICHERN"}</button>
                      <button onClick={() => setEditCard(null)} style={{ background: "transparent", border: "1px solid #1a1a22", borderRadius: "3px", color: "#5a5a72", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "2px", padding: "8px 12px", cursor: "pointer" }}>ABBRECHEN</button>
                    </>
                  ) : deleteConfirm === card.id ? (
                    <>
                      <button onClick={() => deleteCard(card.id)} style={{ background: "#FF6B6B22", border: "1px solid #FF6B6B44", borderRadius: "3px", color: "#FF6B6B", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "1px", padding: "8px 12px", cursor: "pointer" }}>LÖSCHEN?</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ background: "transparent", border: "1px solid #1a1a22", borderRadius: "3px", color: "#5a5a72", fontFamily: "'DM Mono', monospace", fontSize: "8px", padding: "8px 12px", cursor: "pointer" }}>NEIN</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(card)} style={{ background: "transparent", border: "1px solid #d4a84344", borderRadius: "3px", color: "#d4a843", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "2px", padding: "8px 12px", cursor: "pointer" }}>EDIT</button>
                      <button onClick={() => setDeleteConfirm(card.id)} style={{ background: "transparent", border: "1px solid #FF6B6B22", borderRadius: "3px", color: "#FF6B6B66", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "2px", padding: "8px 12px", cursor: "pointer" }}>✕</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PokemonGrader() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("grader");
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [frontB64, setFrontB64] = useState(null);
  const [backB64, setBackB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisTab, setAnalysisTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const frontRef = useRef();
  const backRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleFile = useCallback((file, side) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setSaved(false);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const b64data = dataUrl.split(",")[1];
      URL.revokeObjectURL(objectUrl);
      if (side === "front") { setFrontImg(dataUrl); setFrontB64({ data: b64data, mediaType: "image/jpeg" }); }
      else { setBackImg(dataUrl); setBackB64({ data: b64data, mediaType: "image/jpeg" }); }
    };
    img.src = objectUrl;
  }, []);

  const analyzeCard = async () => {
    if (!frontB64) return;
    setLoading(true); setResult(null); setAnalysisTab("overview"); setSaved(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: frontB64.data, mediaType: frontB64.mediaType, backImageData: backB64?.data || null, backMediaType: backB64?.mediaType || null }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch { setResult({ error: true }); }
    setLoading(false);
  };

  const saveToPortfolio = async () => {
    if (!result || !user) return;
    setSaving(true);
    await supabase.from("portfolio").insert({
      user_id: user.id, card_name: result.card_name, card_name_en: result.card_name_en,
      set_name: result.set, card_number: result.card_number, language: result.language,
      rarity: result.rarity, psa_grade: result.psa_grade, cardmarket_grade: result.cardmarket_grade,
      image_data: frontImg, centering_assessment: result.centering?.assessment,
      whitening_front: result.whitening?.front_severity, whitening_back: result.whitening?.back_severity,
      overall_front: result.front?.overall, overall_back: result.back?.overall, submit_to_psa: result.submit_to_psa,
    });
    setSaving(false); setSaved(true);
  };

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); };

  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>LADEN...</div>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  const psaGrade = result?.psa_grade;
  const psaRounded = psaGrade ? Math.round(psaGrade) : null;
  const psaCfg = psaRounded && psaGrade > 0 ? PSA_GRADES[Math.min(10, Math.max(1, psaRounded))] : null;
  const cmGrade = result?.cardmarket_grade;
  const cmColor = cmGrade ? CM_COLORS[cmGrade] : null;
  const analysisTabs = ["overview", "centering", "whitening", "front", "back", "value"];
  const analysisTabLabels = { overview: "Übersicht", centering: "Centering", whitening: "Whitening", front: "Vorderseite", back: "Rückseite", value: "Wert" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Mono', monospace", color: "#e8e0d5", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box}
        .upload-zone:hover{border-color:#d4a84388!important;background:#d4a84308!important}
        .tab-btn:hover{background:#1a1a22!important;color:#8888aa!important}
        .analyze-btn:hover:not([disabled]){transform:translateY(-1px);box-shadow:0 8px 40px #d4a84355!important}
        .reset-btn:hover{border-color:#333!important;color:#5a5a72!important}
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a22", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#3a3a52", marginBottom: "4px" }}>PROFESSIONAL GRADING TOOL</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 900, margin: 0, color: "#e8e0d5" }}>
            Pokémon <span style={{ fontStyle: "italic", color: "#d4a843" }}>Card Grader</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "7px", letterSpacing: "2px", color: "#3a3a52" }}>ANGEMELDET ALS</div>
            <div style={{ fontSize: "10px", color: "#7a7a8a" }}>{user.user_metadata?.full_name || user.email}</div>
          </div>
          <button onClick={signOut} style={{ background: "transparent", border: "1px solid #1a1a22", borderRadius: "3px", color: "#3a3a52", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "2px", padding: "8px 14px", cursor: "pointer" }}>ABMELDEN</button>
        </div>
      </header>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a1a22" }}>
        {[{ id: "grader", label: "🔍 GRADER" }, { id: "portfolio", label: "🃏 MEINE SAMMLUNG" }].map(tab => (
          <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{ background: "transparent", border: "none", borderBottom: activeTab === tab.id ? "1px solid #d4a843" : "1px solid transparent", color: activeTab === tab.id ? "#d4a843" : "#3a3a52", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", padding: "14px 24px", cursor: "pointer", transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "portfolio" && <PortfolioScreen user={user} />}

        {activeTab === "grader" && (
          <>
            {/* Upload */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[{ side: "front", img: frontImg, ref: frontRef, label: "VORDERSEITE", icon: "▣" }, { side: "back", img: backImg, ref: backRef, label: "RÜCKSEITE", icon: "▤", optional: true }].map(({ side, img, ref, label, icon, optional }) => (
                <div key={side}>
                  <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0], side)} />
                  <div className="upload-zone" onClick={() => ref.current.click()} style={{ border: `1px solid ${img ? "#d4a84344" : "#1a1a22"}`, borderRadius: "4px", padding: img ? "10px" : "36px 20px", textAlign: "center", cursor: "pointer", background: "#0d0d15", transition: "all 0.2s", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                    {img ? (
                      <>
                        <img src={img} alt={label} style={{ maxHeight: "220px", maxWidth: "100%", objectFit: "contain", borderRadius: "2px" }} />
                        <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "#000000bb", border: "1px solid #222", borderRadius: "3px", fontSize: "8px", padding: "3px 8px", letterSpacing: "2px", color: "#666" }}>ÄNDERN</div>
                        <div style={{ position: "absolute", top: "8px", left: "8px", background: "#d4a84318", border: "1px solid #d4a84333", borderRadius: "3px", fontSize: "8px", padding: "3px 8px", letterSpacing: "2px", color: "#d4a843" }}>{label} ✓</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: "24px", color: "#222233", marginBottom: "10px" }}>{icon}</div>
                        <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#2a2a42", marginBottom: "4px" }}>{label}</div>
                        {optional && <div style={{ fontSize: "8px", color: "#1a1a28", letterSpacing: "2px" }}>OPTIONAL</div>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="analyze-btn" onClick={analyzeCard} disabled={!frontB64 || loading} style={{ width: "100%", marginBottom: "36px", background: (!frontB64 || loading) ? "#111118" : "#d4a843", border: "none", borderRadius: "4px", color: (!frontB64 || loading) ? "#2a2a38" : "#0a0a0f", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "10px", letterSpacing: "5px", padding: "16px", cursor: (!frontB64 || loading) ? "not-allowed" : "pointer", transition: "all 0.25s" }}>
              {loading ? "— ANALYSIERE —" : !frontB64 ? "— VORDERSEITE HOCHLADEN —" : `— KARTE ANALYSIEREN${backB64 ? " (BEIDE SEITEN)" : ""} —`}
            </button>

            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", animation: "pulse 1.4s ease infinite" }}>
                <div style={{ fontSize: "10px", letterSpacing: "8px", color: "#d4a843", marginBottom: "8px" }}>ANALYSIERE</div>
                <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#2a2a3a" }}>PSA + CARDMARKET</div>
              </div>
            )}

            {result && !result.error && psaGrade > 0 && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                {/* Grade Hero */}
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 160px", borderTop: "1px solid #1a1a22", borderBottom: "1px solid #1a1a22", marginBottom: "28px" }}>
                  <div style={{ textAlign: "center", padding: "28px 20px" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "6px" }}>PSA GRADE</div>
                    <div style={{ fontSize: "72px", fontFamily: "'Playfair Display', serif", fontWeight: 900, color: psaCfg?.color, lineHeight: 1, textShadow: `0 0 30px ${psaCfg?.glow}` }}>
                      {psaGrade % 1 === 0 ? psaGrade : psaGrade.toFixed(1)}
                    </div>
                    <div style={{ fontSize: "10px", letterSpacing: "2px", color: psaCfg?.color, marginTop: "4px" }}>{psaCfg?.emoji} {psaCfg?.label}</div>
                  </div>
                  <div style={{ padding: "28px 32px", borderLeft: "1px solid #1a1a22", borderRight: "1px solid #1a1a22" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>KARTE</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px,2.2vw,28px)", fontWeight: 700, color: "#e8e0d5", marginBottom: "4px" }}>{result.card_name}</div>
                    <div style={{ fontSize: "10px", color: "#3a3a52", marginBottom: "16px" }}>{result.set}{result.language ? ` · ${result.language}` : ""}</div>
                    {result.key_flaws?.filter(Boolean).length > 0 && (
                      <>{<div style={{ fontSize: "8px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "6px" }}>HAUPTMÄNGEL</div>}{result.key_flaws.filter(Boolean).map((f, i) => <div key={i} style={{ fontSize: "10px", color: "#FF8C69", marginBottom: "3px" }}>— {f}</div>)}</>
                    )}
                  </div>
                  <div style={{ textAlign: "center", padding: "28px 20px" }}>
                    <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>CARDMARKET</div>
                    <div style={{ fontSize: "11px", fontWeight: 500, color: cmColor || "#aaa", border: `1px solid ${cmColor ? cmColor + "44" : "#222"}`, borderRadius: "3px", padding: "8px 12px", background: cmColor ? cmColor + "0e" : "transparent", marginBottom: "16px" }}>{cmGrade || "—"}</div>
                    <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "6px" }}>PSA EINREICHUNG</div>
                    <div style={{ fontSize: "10px", color: result.submit_to_psa ? "#90EE90" : "#FF8C69" }}>{result.submit_to_psa ? "✓ EMPFOHLEN" : "✗ NICHT EMPF."}</div>
                  </div>
                </div>

                {/* CardMarket Scale */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>CARDMARKET SKALA</div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {CM_GRADES.map(g => (
                      <div key={g} style={{ flex: 1, textAlign: "center", padding: "8px 2px", border: `1px solid ${g === cmGrade ? CM_COLORS[g] + "77" : "#1a1a22"}`, borderRadius: "3px", background: g === cmGrade ? CM_COLORS[g] + "15" : "transparent", fontSize: "8px", color: g === cmGrade ? CM_COLORS[g] : "#2a2a3a" }}>
                        {g === cmGrade && <div style={{ fontSize: "6px", marginBottom: "2px" }}>▲</div>}
                        {g}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save to Portfolio */}
                <button onClick={saveToPortfolio} disabled={saving || saved} style={{ width: "100%", marginBottom: "20px", background: saved ? "#90EE9022" : saving ? "#111118" : "#1a2a1a", border: `1px solid ${saved ? "#90EE9044" : "#2a3a2a"}`, borderRadius: "4px", color: saved ? "#90EE90" : saving ? "#3a3a52" : "#90EE90", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "4px", padding: "14px", cursor: saved || saving ? "default" : "pointer" }}>
                  {saved ? "✓ ZUR SAMMLUNG HINZUGEFÜGT" : saving ? "SPEICHERN..." : "+ ZUR SAMMLUNG HINZUFÜGEN"}
                </button>

                {/* Analysis Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid #1a1a22", marginBottom: "20px", overflowX: "auto" }}>
                  {analysisTabs.map(t => (
                    <button key={t} className="tab-btn" onClick={() => setAnalysisTab(t)} style={{ background: "transparent", border: "none", borderBottom: analysisTab === t ? "1px solid #d4a843" : "1px solid transparent", color: analysisTab === t ? "#d4a843" : "#2a2a3a", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "3px", padding: "10px 18px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                      {analysisTabLabels[t].toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ animation: "fadeUp 0.25s ease" }}>
                  {analysisTab === "overview" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        { label: "ZENTRIERUNG", value: result.centering?.assessment, sub: `V: ${result.centering?.front_left_right} · ${result.centering?.front_top_bottom}` },
                        { label: "WHITENING", value: `Vorne: ${result.whitening?.front_severity} · Hinten: ${result.whitening?.back_severity}`, sub: result.whitening?.locations },
                        { label: "VORDERSEITE", value: result.front?.overall },
                        { label: "RÜCKSEITE", value: result.back?.overall || "Keine Rückseite" },
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

                  {analysisTab === "centering" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[{ label: "VORDERSEITE", lr: result.centering?.front_left_right, tb: result.centering?.front_top_bottom, accent: "#d4a843" }, { label: "RÜCKSEITE", lr: result.centering?.back_left_right, tb: result.centering?.back_top_bottom, accent: "#7EC8E3" }].map(({ label, lr, tb, accent }) => (
                        <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "24px" }}>
                          <div style={{ fontSize: "8px", letterSpacing: "4px", color: accent, marginBottom: "20px" }}>{label}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {[{ l: "LINKS / RECHTS", v: lr }, { l: "OBEN / UNTEN", v: tb }].map(({ l, v }) => (
                              <div key={l}><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#3a3a52", marginBottom: "6px" }}>{l}</div><div style={{ fontSize: "26px", fontFamily: "'Playfair Display', serif", color: "#e8e0d5" }}>{v || "—"}</div></div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px", gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "10px" }}>BEWERTUNG</div>
                        <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.7, marginBottom: "14px" }}>{result.centering?.details}</div>
                        <span style={{ display: "inline-block", border: "1px solid #d4a84333", borderRadius: "3px", padding: "5px 14px", fontSize: "9px", letterSpacing: "3px", color: "#d4a843" }}>{result.centering?.assessment?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {analysisTab === "whitening" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[{ label: "VORDERSEITE", severity: result.whitening?.front_severity, accent: "#d4a843" }, { label: "RÜCKSEITE", severity: result.whitening?.back_severity, accent: "#7EC8E3" }].map(({ label, severity, accent }) => {
                        const sColors = { "Keine": "#90EE90", "Minimal": "#C8FFB0", "Leicht": "#FFD700", "Mittel": "#FFB347", "Stark": "#FF6B6B" };
                        return (
                          <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "24px", textAlign: "center" }}>
                            <div style={{ fontSize: "8px", letterSpacing: "4px", color: accent, marginBottom: "20px" }}>{label}</div>
                            <div style={{ fontSize: "28px", fontFamily: "'Playfair Display', serif", color: sColors[severity] || "#555" }}>{severity || "—"}</div>
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

                  {(analysisTab === "front" || analysisTab === "back") && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[{ label: "ECKEN", value: result[analysisTab]?.corners }, { label: "KANTEN", value: result[analysisTab]?.edges }, { label: "OBERFLÄCHE", value: result[analysisTab]?.surface }, { label: "GESAMT", value: result[analysisTab]?.overall }].map(({ label, value }) => (
                        <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "18px" }}>
                          <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>{label}</div>
                          <div style={{ fontSize: "12px", color: "#b8b0a5", lineHeight: 1.6 }}>{value || "Keine Daten"}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysisTab === "value" && (() => {
                    const nameEn = result.card_name_en || result.card_name || "";
                    const set = result.set || "";
                    const cardNum = result.card_number || "";
                    const lang = result.language || "";
                    const cmLang = lang === "German" ? "de" : lang === "French" ? "fr" : lang === "Italian" ? "it" : lang === "Spanish" ? "es" : "en";
                    const cmUrl = `https://www.cardmarket.com/${cmLang}/Pokemon/Products/Search?searchString=${encodeURIComponent([result.card_name, result.set_code].filter(Boolean).join(" "))}`;
                    const pcRawUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent([nameEn, set, cardNum].filter(Boolean).join(" "))}`;
                    const pcGradedUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(nameEn + " " + set + " PSA")}`;
                    const lnk = (bg, bd, c) => ({ display: "block", textAlign: "center", padding: "10px", background: bg, border: `1px solid ${bd}`, borderRadius: "3px", color: c, fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "3px", textDecoration: "none" });
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        {[{ label: "KI-SCHÄTZUNG ROHWERT", value: result.estimated_value_raw, color: "#e8e0d5" }, { label: "KI-SCHÄTZUNG PSA 10", value: result.estimated_value_graded || "N/A", color: "#FFD700" }, { label: "INVESTITIONSPOTENZIAL", value: result.investment_potential, color: result.investment_potential === "Hoch" ? "#90EE90" : result.investment_potential === "Mittel" ? "#FFD700" : "#FF8C69" }].map(({ label, value, color }) => (
                          <div key={label} style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px", textAlign: "center" }}>
                            <div style={{ fontSize: "7px", letterSpacing: "3px", color: "#3a3a52", marginBottom: "12px" }}>{label}</div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(14px,1.8vw,22px)", color, fontWeight: 700 }}>{value}</div>
                          </div>
                        ))}
                        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "16px", margin: "4px 0" }}>
                          <div style={{ flex: 1, height: "1px", background: "#1a1a22" }} />
                          <div style={{ fontSize: "7px", letterSpacing: "4px", color: "#2a2a3a" }}>LIVE-PREISE</div>
                          <div style={{ flex: 1, height: "1px", background: "#1a1a22" }} />
                        </div>
                        <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px" }}>
                          <div style={{ fontSize: "10px", color: "#e8e0d5", marginBottom: "6px" }}>🃏 CardMarket</div>
                          <div style={{ fontSize: "9px", color: "#3a3a52", marginBottom: "12px" }}>RAW · ALLE ZUSTÄNDE</div>
                          <a href={cmUrl} target="_blank" rel="noopener noreferrer" style={lnk("#005cff18", "#005cff44", "#5599ff")}>→ CARDMARKET</a>
                        </div>
                        <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px" }}>
                          <div style={{ fontSize: "10px", color: "#e8e0d5", marginBottom: "6px" }}>📊 PriceCharting</div>
                          <div style={{ fontSize: "9px", color: "#3a3a52", marginBottom: "12px" }}>RAW · UNBEWERTET</div>
                          <a href={pcRawUrl} target="_blank" rel="noopener noreferrer" style={lnk("#d4a84315", "#d4a84333", "#d4a843")}>→ RAW PREISE</a>
                        </div>
                        <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "20px" }}>
                          <div style={{ fontSize: "10px", color: "#e8e0d5", marginBottom: "6px" }}>💎 PriceCharting</div>
                          <div style={{ fontSize: "9px", color: "#3a3a52", marginBottom: "12px" }}>PSA GRADED · SLABS</div>
                          <a href={pcGradedUrl} target="_blank" rel="noopener noreferrer" style={lnk("#FFD70010", "#FFD70033", "#FFD700")}>→ PSA PREISE</a>
                        </div>
                        <div style={{ border: "1px solid #1a1a22", borderRadius: "4px", padding: "18px", gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: "8px", letterSpacing: "4px", color: "#3a3a52", marginBottom: "8px" }}>PSA EINREICHUNG</div>
                          <div style={{ fontSize: "12px", color: result.submit_to_psa ? "#90EE90" : "#FF8C69", marginBottom: "8px" }}>{result.submit_to_psa ? "✓ Einreichung empfohlen" : "✗ Einreichung lohnt sich nicht"}</div>
                          <div style={{ fontSize: "11px", color: "#4a4a5a", lineHeight: 1.6 }}>{result.tips}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button className="reset-btn" onClick={() => { setFrontImg(null); setBackImg(null); setFrontB64(null); setBackB64(null); setResult(null); setSaved(false); }}
                  style={{ marginTop: "36px", width: "100%", background: "transparent", border: "1px solid #1a1a22", borderRadius: "4px", color: "#2a2a3a", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "5px", padding: "14px", cursor: "pointer", transition: "all 0.2s" }}>
                  — NEUE KARTE ANALYSIEREN —
                </button>
              </div>
            )}

            {result?.error && (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#FF6B6B", marginBottom: "20px" }}>ANALYSE FEHLGESCHLAGEN</div>
                <button onClick={analyzeCard} style={{ background: "transparent", border: "1px solid #FF6B6B44", color: "#FF6B6B", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "3px", padding: "12px 24px", cursor: "pointer", borderRadius: "3px" }}>NOCHMAL VERSUCHEN</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
