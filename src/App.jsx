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
const CM_COLORS = { "Mint": "#FFD700", "Near Mint": "#C8FFB0", "Excellent": "#90EE90", "Good": "#7EC8E3", "Light Played": "#FFB347", "Played": "#FF8C69", "Poor": "#FF6B6B" };

// ── THEME ──────────────────────────────────────────────────────────────────
const DARK = { bg: "#0a0a0f", bg2: "#0d0d15", border: "#1a1a22", text: "#e8e0d5", sub: "#3a3a52", card: "#111118", accent: "#d4a843" };
const LIGHT = { bg: "#f5f0e8", bg2: "#ffffff", border: "#e0d8c8", text: "#1a1410", sub: "#8a7a6a", card: "#faf7f0", accent: "#b8860b" };

// ── AUTH ───────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, theme }) {
  const T = theme === "light" ? LIGHT : DARK;
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
        if (data.user && !data.session) setSuccess("Bestätigungs-E-Mail gesendet!");
        else onAuth(data.user);
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const inp = { width: "100%", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: "3px", color: T.text, fontFamily: "'DM Mono', monospace", fontSize: "12px", padding: "12px", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", padding: "24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
      <div style={{ width: "100%", maxWidth: "420px", animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: T.sub, marginBottom: "12px" }}>PROFESSIONAL GRADING TOOL</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 900, margin: 0, color: T.text, lineHeight: 1.1 }}>
            Pokémon <span style={{ fontStyle: "italic", color: T.accent }}>Card Grader</span>
          </h1>
        </div>
        <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "32px", background: T.card }}>
          <div style={{ display: "flex", marginBottom: "28px", borderBottom: `1px solid ${T.border}` }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, background: "transparent", border: "none", borderBottom: mode === m ? `1px solid ${T.accent}` : "1px solid transparent", color: mode === m ? T.accent : T.sub, fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", padding: "10px", cursor: "pointer" }}>
                {m === "login" ? "ANMELDEN" : "REGISTRIEREN"}
              </button>
            ))}
          </div>
          {mode === "register" && <div style={{ marginBottom: "16px" }}><div style={{ fontSize: "8px", letterSpacing: "3px", color: T.sub, marginBottom: "6px" }}>NAME</div><input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" style={inp} /></div>}
          <div style={{ marginBottom: "16px" }}><div style={{ fontSize: "8px", letterSpacing: "3px", color: T.sub, marginBottom: "6px" }}>E-MAIL</div><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="deine@email.de" style={inp} /></div>
          <div style={{ marginBottom: "24px" }}><div style={{ fontSize: "8px", letterSpacing: "3px", color: T.sub, marginBottom: "6px" }}>PASSWORT</div><input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inp} /></div>
          {error && <div style={{ fontSize: "10px", color: "#FF6B6B", marginBottom: "16px" }}>{error}</div>}
          {success && <div style={{ fontSize: "10px", color: "#90EE90", marginBottom: "16px" }}>{success}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? T.border : T.accent, border: "none", borderRadius: "3px", color: loading ? T.sub : "#0a0a0f", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "10px", letterSpacing: "5px", padding: "16px", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "LADEN..." : mode === "login" ? "ANMELDEN" : "KONTO ERSTELLEN"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PORTFOLIO ──────────────────────────────────────────────────────────────
function PortfolioScreen({ user, theme }) {
  const T = theme === "light" ? LIGHT : DARK;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCard, setEditCard] = useState(null);
  const [editPurchase, setEditPurchase] = useState("");
  const [editSale, setEditSale] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterCM, setFilterCM] = useState("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });
    setCards(data || []);
    setLoading(false);
  };

  const startEdit = (card) => { setEditCard(card.id); setEditPurchase(card.purchase_price?.toString() || ""); setEditSale(card.sale_price?.toString() || ""); setEditNotes(card.notes || ""); };
  const saveEdit = async (id) => { setSaving(true); await supabase.from("portfolio").update({ purchase_price: editPurchase ? parseFloat(editPurchase) : null, sale_price: editSale ? parseFloat(editSale) : null, notes: editNotes }).eq("id", id); setEditCard(null); await loadCards(); setSaving(false); };
  const deleteCard = async (id) => { await supabase.from("portfolio").delete().eq("id", id); setDeleteConfirm(null); await loadCards(); };

  // Filter + Sort
  let filtered = cards.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || (c.card_name || "").toLowerCase().includes(q) || (c.set_name || "").toLowerCase().includes(q) || (c.card_number || "").toLowerCase().includes(q);
    const matchGrade = filterGrade === "all" || Math.round(c.psa_grade) === parseInt(filterGrade);
    const matchCM = filterCM === "all" || c.cardmarket_grade === filterCM;
    return matchSearch && matchGrade && matchCM;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "date_asc") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "psa_desc") return (b.psa_grade || 0) - (a.psa_grade || 0);
    if (sortBy === "psa_asc") return (a.psa_grade || 0) - (b.psa_grade || 0);
    if (sortBy === "purchase_desc") return (b.purchase_price || 0) - (a.purchase_price || 0);
    if (sortBy === "sale_desc") return (b.sale_price || 0) - (a.sale_price || 0);
    if (sortBy === "name_asc") return (a.card_name || "").localeCompare(b.card_name || "");
    return 0;
  });

  const totalPurchase = cards.reduce((s, c) => s + (c.purchase_price || 0), 0);
  const totalSale = cards.reduce((s, c) => s + (c.sale_price || 0), 0);
  const profit = totalSale - totalPurchase;

  const exportCSV = () => {
    setExporting(true);
    const headers = ["Karte", "Set", "Nr.", "Sprache", "PSA", "CardMarket", "Einkauf €", "Verkauf €", "Gewinn €", "Notizen", "Datum"];
    const rows = cards.map(c => [
      c.card_name || "", c.set_name || "", c.card_number || "", c.language || "",
      c.psa_grade || "", c.cardmarket_grade || "",
      c.purchase_price?.toFixed(2) || "", c.sale_price?.toFixed(2) || "",
      c.purchase_price && c.sale_price ? (c.sale_price - c.purchase_price).toFixed(2) : "",
      c.notes || "", new Date(c.created_at).toLocaleDateString("de-DE")
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pokemon-sammlung.csv"; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const inp = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: "3px", color: T.text, fontFamily: "'DM Mono', monospace", fontSize: "11px", padding: "8px 10px", outline: "none", width: "100%" };
  const selStyle = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: "3px", color: T.text, fontFamily: "'DM Mono', monospace", fontSize: "9px", padding: "8px 10px", outline: "none", cursor: "pointer" };

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", color: T.text }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {[{ label: "KARTEN", value: cards.length, color: T.text }, { label: "EINKAUF", value: `${totalPurchase.toFixed(2)} €`, color: "#FF8C69" }, { label: "VERKAUF", value: `${totalSale.toFixed(2)} €`, color: "#90EE90" }].map(({ label, value, color }) => (
          <div key={label} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "16px", textAlign: "center", background: T.card }}>
            <div style={{ fontSize: "7px", letterSpacing: "3px", color: T.sub, marginBottom: "6px" }}>{label}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {cards.length > 0 && (
        <div style={{ border: `1px solid ${profit >= 0 ? "#90EE9044" : "#FF6B6B44"}`, borderRadius: "4px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: profit >= 0 ? "#90EE9008" : "#FF6B6B08" }}>
          <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.sub }}>GEWINN / VERLUST</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: profit >= 0 ? "#90EE90" : "#FF6B6B" }}>{profit >= 0 ? "+" : ""}{profit.toFixed(2)} €</div>
        </div>
      )}

      {/* Search + Filter + Sort + Export */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", marginBottom: "12px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Karte suchen..." style={{ ...inp, fontSize: "12px", padding: "10px 14px" }} />
        <button onClick={exportCSV} disabled={exporting || cards.length === 0} style={{ background: T.accent, border: "none", borderRadius: "3px", color: "#0a0a0f", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "2px", padding: "10px 14px", cursor: cards.length === 0 ? "not-allowed" : "pointer", opacity: cards.length === 0 ? 0.4 : 1 }}>
          📊 CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selStyle}>
          <option value="date_desc">Neueste zuerst</option>
          <option value="date_asc">Älteste zuerst</option>
          <option value="psa_desc">PSA: Hoch → Tief</option>
          <option value="psa_asc">PSA: Tief → Hoch</option>
          <option value="purchase_desc">Einkauf: Teuerste</option>
          <option value="sale_desc">Verkauf: Teuerste</option>
          <option value="name_asc">Name A → Z</option>
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={selStyle}>
          <option value="all">Alle PSA</option>
          {[10,9,8,7,6,5,4,3,2,1].map(g => <option key={g} value={g}>PSA {g}</option>)}
        </select>
        <select value={filterCM} onChange={e => setFilterCM(e.target.value)} style={selStyle}>
          <option value="all">Alle CM</option>
          {CM_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "60px", color: T.sub, fontSize: "10px", letterSpacing: "4px" }}>LADE SAMMLUNG...</div>}

      {!loading && cards.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", border: `1px solid ${T.border}`, borderRadius: "4px", background: T.card }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🃏</div>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.sub }}>KEINE KARTEN IN DER SAMMLUNG</div>
          <div style={{ fontSize: "11px", color: T.sub, marginTop: "8px", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>Analysiere eine Karte und füge sie hinzu</div>
        </div>
      )}

      {!loading && cards.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", border: `1px solid ${T.border}`, borderRadius: "4px", background: T.card }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.sub }}>KEINE TREFFER</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(card => {
          const psaCfg = card.psa_grade ? PSA_GRADES[Math.round(card.psa_grade)] : null;
          const isEditing = editCard === card.id;
          const cardProfit = card.sale_price && card.purchase_price ? card.sale_price - card.purchase_price : null;
          return (
            <div key={card.id} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", overflow: "hidden", background: T.card }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto" }}>
                <div style={{ background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                  {card.image_data ? <img src={card.image_data} alt={card.card_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: "24px" }}>🃏</div>}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: T.text, marginBottom: "2px" }}>{card.card_name}</div>
                  <div style={{ fontSize: "9px", color: T.sub, marginBottom: "8px" }}>{card.set_name}{card.card_number ? ` · ${card.card_number}` : ""}</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {psaCfg && <span style={{ fontSize: "8px", letterSpacing: "2px", color: psaCfg.color, border: `1px solid ${psaCfg.color}44`, borderRadius: "3px", padding: "2px 7px" }}>PSA {card.psa_grade}</span>}
                    {card.cardmarket_grade && <span style={{ fontSize: "8px", color: CM_COLORS[card.cardmarket_grade] || "#aaa", border: `1px solid ${CM_COLORS[card.cardmarket_grade] || "#aaa"}44`, borderRadius: "3px", padding: "2px 7px" }}>{card.cardmarket_grade}</span>}
                    {cardProfit !== null && <span style={{ fontSize: "8px", color: cardProfit >= 0 ? "#90EE90" : "#FF6B6B", border: `1px solid ${cardProfit >= 0 ? "#90EE9044" : "#FF6B6B44"}`, borderRadius: "3px", padding: "2px 7px" }}>{cardProfit >= 0 ? "+" : ""}{cardProfit.toFixed(2)} €</span>}
                  </div>
                  {isEditing ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <div><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#FF8C69", marginBottom: "3px" }}>EINKAUF €</div><input value={editPurchase} onChange={e => setEditPurchase(e.target.value)} type="number" placeholder="0.00" style={inp} /></div>
                      <div><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#90EE90", marginBottom: "3px" }}>VERKAUF €</div><input value={editSale} onChange={e => setEditSale(e.target.value)} type="number" placeholder="0.00" style={inp} /></div>
                      <div style={{ gridColumn: "1 / -1" }}><div style={{ fontSize: "7px", letterSpacing: "2px", color: T.sub, marginBottom: "3px" }}>NOTIZEN</div><input value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Notizen..." style={inp} /></div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                      <div><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#FF8C69", marginBottom: "2px" }}>EINKAUF</div><div style={{ fontSize: "12px", color: card.purchase_price ? "#FF8C69" : T.sub }}>{card.purchase_price ? `${card.purchase_price.toFixed(2)} €` : "—"}</div></div>
                      <div><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#90EE90", marginBottom: "2px" }}>VERKAUF</div><div style={{ fontSize: "12px", color: card.sale_price ? "#90EE90" : T.sub }}>{card.sale_price ? `${card.sale_price.toFixed(2)} €` : "—"}</div></div>
                      {card.notes && <div style={{ flex: 1 }}><div style={{ fontSize: "7px", letterSpacing: "2px", color: T.sub, marginBottom: "2px" }}>NOTIZ</div><div style={{ fontSize: "10px", color: T.sub }}>{card.notes}</div></div>}
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center", borderLeft: `1px solid ${T.border}` }}>
                  {isEditing ? (
                    <><button onClick={() => saveEdit(card.id)} disabled={saving} style={{ background: T.accent, border: "none", borderRadius: "3px", color: "#0a0a0f", fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "2px", padding: "7px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>{saving ? "..." : "SPEICHERN"}</button>
                    <button onClick={() => setEditCard(null)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "3px", color: T.sub, fontFamily: "'DM Mono', monospace", fontSize: "7px", padding: "7px 10px", cursor: "pointer" }}>ABBR.</button></>
                  ) : deleteConfirm === card.id ? (
                    <><button onClick={() => deleteCard(card.id)} style={{ background: "#FF6B6B22", border: "1px solid #FF6B6B44", borderRadius: "3px", color: "#FF6B6B", fontFamily: "'DM Mono', monospace", fontSize: "7px", padding: "7px 10px", cursor: "pointer" }}>LÖSCHEN?</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "3px", color: T.sub, fontFamily: "'DM Mono', monospace", fontSize: "7px", padding: "7px 10px", cursor: "pointer" }}>NEIN</button></>
                  ) : (
                    <><button onClick={() => startEdit(card)} style={{ background: "transparent", border: `1px solid ${T.accent}44`, borderRadius: "3px", color: T.accent, fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "2px", padding: "7px 10px", cursor: "pointer" }}>EDIT</button>
                    <button onClick={() => setDeleteConfirm(card.id)} style={{ background: "transparent", border: "1px solid #FF6B6B22", borderRadius: "3px", color: "#FF6B6B66", fontFamily: "'DM Mono', monospace", fontSize: "7px", padding: "7px 10px", cursor: "pointer" }}>✕</button></>
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

// ── SAVE MODAL ─────────────────────────────────────────────────────────────
function SaveModal({ result, frontImg, user, onClose, onSaved, theme }) {
  const T = theme === "light" ? LIGHT : DARK;
  const [purchase, setPurchase] = useState("");
  const [sale, setSale] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const doSave = async () => {
    setSaving(true);
    await supabase.from("portfolio").insert({
      user_id: user.id, card_name: result.card_name, card_name_en: result.card_name_en,
      set_name: result.set, card_number: result.card_number, language: result.language,
      rarity: result.rarity, psa_grade: result.psa_grade, cardmarket_grade: result.cardmarket_grade,
      image_data: frontImg, centering_assessment: result.centering?.assessment,
      whitening_front: result.whitening?.front_severity, whitening_back: result.whitening?.back_severity,
      overall_front: result.front?.overall, overall_back: result.back?.overall,
      submit_to_psa: result.submit_to_psa,
      purchase_price: purchase ? parseFloat(purchase) : null,
      sale_price: sale ? parseFloat(sale) : null,
      notes: notes || null,
    });
    setSaving(false);
    onSaved();
  };

  const inp = { width: "100%", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: "3px", color: T.text, fontFamily: "'DM Mono', monospace", fontSize: "12px", padding: "10px 12px", outline: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "28px", width: "100%", maxWidth: "420px" }}>
        <div style={{ fontSize: "8px", letterSpacing: "4px", color: T.sub, marginBottom: "12px" }}>ZUR SAMMLUNG HINZUFÜGEN</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: T.text, marginBottom: "4px" }}>{result.card_name}</div>
        <div style={{ fontSize: "10px", color: T.sub, marginBottom: "20px" }}>{result.set} · PSA {result.psa_grade} · {result.cardmarket_grade}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#FF8C69", marginBottom: "6px" }}>EINKAUFSPREIS €</div><input value={purchase} onChange={e => setPurchase(e.target.value)} type="number" placeholder="0.00" style={inp} /></div>
          <div><div style={{ fontSize: "7px", letterSpacing: "2px", color: "#90EE90", marginBottom: "6px" }}>VERKAUFSPREIS €</div><input value={sale} onChange={e => setSale(e.target.value)} type="number" placeholder="0.00" style={inp} /></div>
        </div>
        <div style={{ marginBottom: "20px" }}><div style={{ fontSize: "7px", letterSpacing: "2px", color: T.sub, marginBottom: "6px" }}>NOTIZEN (OPTIONAL)</div><input value={notes} onChange={e => setNotes(e.target.value)} placeholder="z.B. Gekauft bei eBay..." style={inp} /></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "3px", color: T.sub, fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", padding: "14px", cursor: "pointer" }}>ABBRECHEN</button>
          <button onClick={doSave} disabled={saving} style={{ background: saving ? T.border : T.accent, border: "none", borderRadius: "3px", color: "#0a0a0f", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "9px", letterSpacing: "3px", padding: "14px", cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "..." : "SPEICHERN"}</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function PokemonGrader() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [activeTab, setActiveTab] = useState("grader");
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [frontB64, setFrontB64] = useState(null);
  const [backB64, setBackB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisTab, setAnalysisTab] = useState("overview");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const frontRef = useRef();
  const backRef = useRef();

  const T = theme === "light" ? LIGHT : DARK;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user || null); setAuthChecked(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user || null); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadPortfolioCount();
  }, [user, activeTab]);

  const loadPortfolioCount = async () => {
    const { count } = await supabase.from("portfolio").select("*", { count: "exact", head: true });
    setPortfolioCount(count || 0);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const handleFile = useCallback((file, side) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setSaved(false);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h * MAX / w); w = MAX; } else { w = Math.round(w * MAX / h); h = MAX; } }
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
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageData: frontB64.data, mediaType: frontB64.mediaType, backImageData: backB64?.data || null, backMediaType: backB64?.mediaType || null }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch { setResult({ error: true }); }
    setLoading(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); };

  if (!authChecked) return <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: "10px", letterSpacing: "4px", color: T.sub, fontFamily: "'DM Mono', monospace" }}>LADEN...</div></div>;
  if (!user) return <AuthScreen onAuth={setUser} theme={theme} />;

  const psaGrade = result?.psa_grade;
  const psaRounded = psaGrade ? Math.round(psaGrade) : null;
  const psaCfg = psaRounded && psaGrade > 0 ? PSA_GRADES[Math.min(10, Math.max(1, psaRounded))] : null;
  const cmGrade = result?.cardmarket_grade;
  const cmColor = cmGrade ? CM_COLORS[cmGrade] : null;
  const analysisTabs = ["overview", "centering", "whitening", "front", "back", "value"];
  const analysisTabLabels = { overview: "Übersicht", centering: "Centering", whitening: "Whitening", front: "Vorderseite", back: "Rückseite", value: "Wert" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Mono', monospace", color: T.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box}
        .uz:hover{border-color:${T.accent}88!important;background:${T.accent}08!important}
        .tb:hover{background:${T.card}!important;color:${T.sub}!important}
        .ab:hover:not([disabled]){transform:translateY(-1px);box-shadow:0 8px 40px ${T.accent}55!important}
      `}</style>

      {showSaveModal && result && (
        <SaveModal result={result} frontImg={frontImg} user={user} theme={theme}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => { setShowSaveModal(false); setSaved(true); loadPortfolioCount(); }} />
      )}

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "7px", letterSpacing: "5px", color: T.sub, marginBottom: "3px" }}>PROFESSIONAL GRADING TOOL</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 900, margin: 0, color: T.text }}>
            Pokémon <span style={{ fontStyle: "italic", color: T.accent }}>Card Grader</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={toggleTheme} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "3px", color: T.sub, fontFamily: "'DM Mono', monospace", fontSize: "14px", padding: "6px 10px", cursor: "pointer" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <div style={{ textAlign: "right", display: "none" }} className="user-info">
            <div style={{ fontSize: "7px", letterSpacing: "2px", color: T.sub }}>ANGEMELDET ALS</div>
            <div style={{ fontSize: "9px", color: T.sub }}>{user.user_metadata?.full_name || user.email}</div>
          </div>
          <div style={{ fontSize: "9px", color: T.sub }}>{user.user_metadata?.full_name || user.email?.split("@")[0]}</div>
          <button onClick={signOut} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "3px", color: T.sub, fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "2px", padding: "6px 12px", cursor: "pointer" }}>ABMELDEN</button>
        </div>
      </header>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
        {[{ id: "grader", label: "🔍 GRADER" }, { id: "portfolio", label: `🃏 SAMMLUNG${portfolioCount > 0 ? ` (${portfolioCount})` : ""}` }].map(tab => (
          <button key={tab.id} className="tb" onClick={() => setActiveTab(tab.id)} style={{ background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${T.accent}` : "2px solid transparent", color: activeTab === tab.id ? T.accent : T.sub, fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", padding: "12px 20px", cursor: "pointer", transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>
        {activeTab === "portfolio" && <PortfolioScreen user={user} theme={theme} />}

        {activeTab === "grader" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {[{ side: "front", img: frontImg, ref: frontRef, label: "VORDERSEITE", icon: "▣" }, { side: "back", img: backImg, ref: backRef, label: "RÜCKSEITE", icon: "▤", optional: true }].map(({ side, img, ref, label, icon, optional }) => (
                <div key={side}>
                  <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0], side)} />
                  <div className="uz" onClick={() => ref.current.click()} style={{ border: `1px solid ${img ? T.accent + "44" : T.border}`, borderRadius: "4px", padding: img ? "8px" : "28px 16px", textAlign: "center", cursor: "pointer", background: T.bg2, transition: "all 0.2s", minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                    {img ? (
                      <>
                        <img src={img} alt={label} style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain", borderRadius: "2px" }} />
                        <div style={{ position: "absolute", bottom: "6px", right: "6px", background: "#000000bb", border: `1px solid ${T.border}`, borderRadius: "3px", fontSize: "7px", padding: "2px 7px", letterSpacing: "2px", color: T.sub }}>ÄNDERN</div>
                        <div style={{ position: "absolute", top: "6px", left: "6px", background: T.accent + "18", border: `1px solid ${T.accent}33`, borderRadius: "3px", fontSize: "7px", padding: "2px 7px", letterSpacing: "2px", color: T.accent }}>{label} ✓</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: "20px", color: T.border, marginBottom: "8px" }}>{icon}</div>
                        <div style={{ fontSize: "8px", letterSpacing: "4px", color: T.sub, marginBottom: "2px" }}>{label}</div>
                        {optional && <div style={{ fontSize: "7px", color: T.border, letterSpacing: "2px" }}>OPTIONAL</div>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="ab" onClick={analyzeCard} disabled={!frontB64 || loading} style={{ width: "100%", marginBottom: "28px", background: (!frontB64 || loading) ? T.card : T.accent, border: `1px solid ${(!frontB64 || loading) ? T.border : T.accent}`, borderRadius: "4px", color: (!frontB64 || loading) ? T.sub : "#0a0a0f", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "9px", letterSpacing: "5px", padding: "15px", cursor: (!frontB64 || loading) ? "not-allowed" : "pointer", transition: "all 0.25s" }}>
              {loading ? "— ANALYSIERE —" : !frontB64 ? "— VORDERSEITE HOCHLADEN —" : `— KARTE ANALYSIEREN${backB64 ? " (BEIDE SEITEN)" : ""} —`}
            </button>

            {loading && <div style={{ textAlign: "center", padding: "50px 0", animation: "pulse 1.4s ease infinite" }}><div style={{ fontSize: "9px", letterSpacing: "8px", color: T.accent, marginBottom: "6px" }}>ANALYSIERE</div><div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub }}>PSA + CARDMARKET</div></div>}

            {result && !result.error && psaGrade > 0 && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 140px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: "24px" }}>
                  <div style={{ textAlign: "center", padding: "24px 16px" }}>
                    <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "4px" }}>PSA GRADE</div>
                    <div style={{ fontSize: "64px", fontFamily: "'Playfair Display', serif", fontWeight: 900, color: psaCfg?.color, lineHeight: 1, textShadow: `0 0 30px ${psaCfg?.glow}` }}>{psaGrade % 1 === 0 ? psaGrade : psaGrade.toFixed(1)}</div>
                    <div style={{ fontSize: "9px", letterSpacing: "2px", color: psaCfg?.color, marginTop: "2px" }}>{psaCfg?.emoji} {psaCfg?.label}</div>
                  </div>
                  <div style={{ padding: "24px 20px", borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "8px" }}>KARTE</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px,2vw,24px)", fontWeight: 700, color: T.text, marginBottom: "2px" }}>{result.card_name}</div>
                    <div style={{ fontSize: "9px", color: T.sub, marginBottom: "12px" }}>{result.set}{result.language ? ` · ${result.language}` : ""}</div>
                    {result.key_flaws?.filter(Boolean).length > 0 && <>{<div style={{ fontSize: "7px", letterSpacing: "3px", color: T.sub, marginBottom: "4px" }}>HAUPTMÄNGEL</div>}{result.key_flaws.filter(Boolean).map((f, i) => <div key={i} style={{ fontSize: "9px", color: "#FF8C69", marginBottom: "2px" }}>— {f}</div>)}</>}
                  </div>
                  <div style={{ textAlign: "center", padding: "24px 16px" }}>
                    <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "8px" }}>CARDMARKET</div>
                    <div style={{ fontSize: "10px", fontWeight: 500, color: cmColor || "#aaa", border: `1px solid ${cmColor ? cmColor + "44" : T.border}`, borderRadius: "3px", padding: "6px 10px", background: cmColor ? cmColor + "0e" : "transparent", marginBottom: "12px" }}>{cmGrade || "—"}</div>
                    <div style={{ fontSize: "7px", letterSpacing: "3px", color: T.sub, marginBottom: "4px" }}>PSA EINR.</div>
                    <div style={{ fontSize: "9px", color: result.submit_to_psa ? "#90EE90" : "#FF8C69" }}>{result.submit_to_psa ? "✓ EMPF." : "✗ NICHT"}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "8px" }}>CARDMARKET SKALA</div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {CM_GRADES.map(g => <div key={g} style={{ flex: 1, textAlign: "center", padding: "6px 1px", border: `1px solid ${g === cmGrade ? CM_COLORS[g] + "77" : T.border}`, borderRadius: "3px", background: g === cmGrade ? CM_COLORS[g] + "15" : "transparent", fontSize: "7px", color: g === cmGrade ? CM_COLORS[g] : T.sub }}>{g === cmGrade && <div style={{ fontSize: "5px", marginBottom: "1px" }}>▲</div>}{g}</div>)}
                  </div>
                </div>

                <button onClick={() => setShowSaveModal(true)} disabled={saved} style={{ width: "100%", marginBottom: "16px", background: saved ? "#90EE9022" : "#1a2a1a", border: `1px solid ${saved ? "#90EE9044" : "#2a3a2a"}`, borderRadius: "4px", color: saved ? "#90EE90" : "#90EE90", fontFamily: "'DM Mono', monospace", fontSize: "8px", letterSpacing: "4px", padding: "13px", cursor: saved ? "default" : "pointer" }}>
                  {saved ? "✓ ZUR SAMMLUNG HINZUGEFÜGT" : "+ ZUR SAMMLUNG HINZUFÜGEN"}
                </button>

                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: "16px", overflowX: "auto" }}>
                  {analysisTabs.map(t => <button key={t} className="tb" onClick={() => setAnalysisTab(t)} style={{ background: "transparent", border: "none", borderBottom: analysisTab === t ? `1px solid ${T.accent}` : "1px solid transparent", color: analysisTab === t ? T.accent : T.sub, fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "3px", padding: "9px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>{analysisTabLabels[t].toUpperCase()}</button>)}
                </div>

                <div style={{ animation: "fadeUp 0.25s ease" }}>
                  {analysisTab === "overview" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[{ label: "ZENTRIERUNG", value: result.centering?.assessment, sub: `V: ${result.centering?.front_left_right} · ${result.centering?.front_top_bottom}` }, { label: "WHITENING", value: `Vorne: ${result.whitening?.front_severity} · Hinten: ${result.whitening?.back_severity}`, sub: result.whitening?.locations }, { label: "VORDERSEITE", value: result.front?.overall }, { label: "RÜCKSEITE", value: result.back?.overall || "Keine Rückseite" }].map(({ label, value, sub }) => (
                        <div key={label} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "14px", background: T.card }}>
                          <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "6px" }}>{label}</div>
                          <div style={{ fontSize: "11px", color: T.text, lineHeight: 1.6 }}>{value}</div>
                          {sub && <div style={{ fontSize: "8px", color: T.sub, marginTop: "4px" }}>{sub}</div>}
                        </div>
                      ))}
                      <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "14px", gridColumn: "1 / -1", background: T.card }}>
                        <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "6px" }}>EMPFEHLUNG</div>
                        <div style={{ fontSize: "11px", color: T.text, lineHeight: 1.6 }}>{result.tips}</div>
                      </div>
                    </div>
                  )}
                  {analysisTab === "centering" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[{ label: "VORDERSEITE", lr: result.centering?.front_left_right, tb: result.centering?.front_top_bottom, accent: T.accent }, { label: "RÜCKSEITE", lr: result.centering?.back_left_right, tb: result.centering?.back_top_bottom, accent: "#7EC8E3" }].map(({ label, lr, tb, accent }) => (
                        <div key={label} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "20px", background: T.card }}>
                          <div style={{ fontSize: "7px", letterSpacing: "4px", color: accent, marginBottom: "16px" }}>{label}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {[{ l: "L / R", v: lr }, { l: "O / U", v: tb }].map(({ l, v }) => <div key={l}><div style={{ fontSize: "7px", letterSpacing: "2px", color: T.sub, marginBottom: "4px" }}>{l}</div><div style={{ fontSize: "22px", fontFamily: "'Playfair Display', serif", color: T.text }}>{v || "—"}</div></div>)}
                          </div>
                        </div>
                      ))}
                      <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "16px", gridColumn: "1 / -1", background: T.card }}>
                        <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "8px" }}>BEWERTUNG</div>
                        <div style={{ fontSize: "11px", color: T.text, lineHeight: 1.7, marginBottom: "10px" }}>{result.centering?.details}</div>
                        <span style={{ display: "inline-block", border: `1px solid ${T.accent}33`, borderRadius: "3px", padding: "4px 12px", fontSize: "8px", letterSpacing: "3px", color: T.accent }}>{result.centering?.assessment?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                  {analysisTab === "whitening" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[{ label: "VORDERSEITE", severity: result.whitening?.front_severity, accent: T.accent }, { label: "RÜCKSEITE", severity: result.whitening?.back_severity, accent: "#7EC8E3" }].map(({ label, severity, accent }) => {
                        const sC = { "Keine": "#90EE90", "Minimal": "#C8FFB0", "Leicht": "#FFD700", "Mittel": "#FFB347", "Stark": "#FF6B6B" };
                        return <div key={label} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "20px", textAlign: "center", background: T.card }}><div style={{ fontSize: "7px", letterSpacing: "4px", color: accent, marginBottom: "16px" }}>{label}</div><div style={{ fontSize: "24px", fontFamily: "'Playfair Display', serif", color: sC[severity] || T.sub }}>{severity || "—"}</div></div>;
                      })}
                      <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "16px", gridColumn: "1 / -1", background: T.card }}>
                        <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "4px" }}>STANDORTE</div>
                        <div style={{ fontSize: "10px", color: T.sub, marginBottom: "12px" }}>{result.whitening?.locations || "Kein Whitening"}</div>
                        <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "6px" }}>DETAILS</div>
                        <div style={{ fontSize: "11px", color: T.text, lineHeight: 1.7 }}>{result.whitening?.details}</div>
                      </div>
                    </div>
                  )}
                  {(analysisTab === "front" || analysisTab === "back") && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[{ label: "ECKEN", value: result[analysisTab]?.corners }, { label: "KANTEN", value: result[analysisTab]?.edges }, { label: "OBERFLÄCHE", value: result[analysisTab]?.surface }, { label: "GESAMT", value: result[analysisTab]?.overall }].map(({ label, value }) => (
                        <div key={label} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "14px", background: T.card }}>
                          <div style={{ fontSize: "7px", letterSpacing: "4px", color: T.sub, marginBottom: "6px" }}>{label}</div>
                          <div style={{ fontSize: "11px", color: T.text, lineHeight: 1.6 }}>{value || "Keine Daten"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {analysisTab === "value" && (() => {
                    const nameEn = result.card_name_en || result.card_name || "";
                    const set = result.set || ""; const cardNum = result.card_number || "";
                    const lang = result.language || "";
                    const cmLang = lang === "German" ? "de" : lang === "French" ? "fr" : lang === "Italian" ? "it" : lang === "Spanish" ? "es" : "en";
                    const cmUrl = `https://www.cardmarket.com/${cmLang}/Pokemon/Products/Search?searchString=${encodeURIComponent([result.card_name, result.set_code].filter(Boolean).join(" "))}`;
                    const pcRawUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent([nameEn, set, cardNum].filter(Boolean).join(" "))}`;
                    const pcGradedUrl = `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(nameEn + " " + set + " PSA")}`;
                    const lnk = (bg, bd, c) => ({ display: "block", textAlign: "center", padding: "9px", background: bg, border: `1px solid ${bd}`, borderRadius: "3px", color: c, fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "3px", textDecoration: "none" });
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        {[{ label: "KI ROHWERT", value: result.estimated_value_raw, color: T.text }, { label: "KI PSA 10", value: result.estimated_value_graded || "N/A", color: "#FFD700" }, { label: "INVESTITION", value: result.investment_potential, color: result.investment_potential === "Hoch" ? "#90EE90" : result.investment_potential === "Mittel" ? "#FFD700" : "#FF8C69" }].map(({ label, value, color }) => (
                          <div key={label} style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "16px", textAlign: "center", background: T.card }}>
                            <div style={{ fontSize: "7px", letterSpacing: "3px", color: T.sub, marginBottom: "8px" }}>{label}</div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(13px,1.6vw,19px)", color, fontWeight: 700 }}>{value}</div>
                          </div>
                        ))}
                        <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "14px", background: T.card }}>
                          <div style={{ fontSize: "9px", color: T.text, marginBottom: "4px" }}>🃏 CardMarket</div>
                          <div style={{ fontSize: "7px", color: T.sub, marginBottom: "10px" }}>RAW</div>
                          <a href={cmUrl} target="_blank" rel="noopener noreferrer" style={lnk("#005cff18", "#005cff44", "#5599ff")}>→ ÖFFNEN</a>
                        </div>
                        <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "14px", background: T.card }}>
                          <div style={{ fontSize: "9px", color: T.text, marginBottom: "4px" }}>📊 PriceCharting</div>
                          <div style={{ fontSize: "7px", color: T.sub, marginBottom: "10px" }}>RAW</div>
                          <a href={pcRawUrl} target="_blank" rel="noopener noreferrer" style={lnk("#d4a84315", "#d4a84333", T.accent)}>→ RAW</a>
                        </div>
                        <div style={{ border: `1px solid ${T.border}`, borderRadius: "4px", padding: "14px", background: T.card }}>
                          <div style={{ fontSize: "9px", color: T.text, marginBottom: "4px" }}>💎 PriceCharting</div>
                          <div style={{ fontSize: "7px", color: T.sub, marginBottom: "10px" }}>PSA SLAB</div>
                          <a href={pcGradedUrl} target="_blank" rel="noopener noreferrer" style={lnk("#FFD70010", "#FFD70033", "#FFD700")}>→ PSA</a>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button onClick={() => { setFrontImg(null); setBackImg(null); setFrontB64(null); setBackB64(null); setResult(null); setSaved(false); }} style={{ marginTop: "28px", width: "100%", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "4px", color: T.sub, fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "5px", padding: "12px", cursor: "pointer" }}>
                  — NEUE KARTE —
                </button>
              </div>
            )}
            {result?.error && (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#FF6B6B", marginBottom: "16px" }}>ANALYSE FEHLGESCHLAGEN</div>
                <button onClick={analyzeCard} style={{ background: "transparent", border: "1px solid #FF6B6B44", color: "#FF6B6B", fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "3px", padding: "10px 20px", cursor: "pointer", borderRadius: "3px" }}>NOCHMAL</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
