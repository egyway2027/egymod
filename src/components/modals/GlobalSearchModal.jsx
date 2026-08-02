/**
 * =========================================================
 * 📌 النافذة: البحث الشامل عابر الشاشات (Global Search Modal)
 * 📁 المسار: src/components/modals/GlobalSearchModal.jsx
 * 📝 الوظيفة: بحث فوري في العقود والعملاء والمصروفات.
 * =========================================================
 */

import React, { useState, useMemo } from "react";
import { Search, X, ArrowLeft } from "lucide-react";

export function GlobalSearchModal({ isOpen, onClose, contracts = [], onSelectResult, t = {}, themeStyles = {} }) {
  const [query, setQuery] = useState("");
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return contracts.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.item || "").toLowerCase().includes(q) ||
        (c.guarantor || "").toLowerCase().includes(q)
    );
  }, [contracts, query]);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "80px", padding: "15px" }} dir={isEN ? "ltr" : "rtl"}>
      <div style={{ width: "100%", maxWidth: "700px", background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        
        {/* SEARCH INPUT BAR */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#121214" }}>
          <Search size={20} style={{ color: themeStyles.accentGold || "#e8cd9c" }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث فوراً باسم العميل، رقم التليفون، أو السلعة..."
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "15px", fontWeight: 700 }}
          />
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* RESULTS LIST */}
        <div style={{ maxHeight: "350px", overflowY: "auto", padding: "10px" }}>
          {!query ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666", fontSize: "13px" }}>اكتب كلمتك للبحث اللحظي بجميع سجلات النظام...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: "13px" }}>لم يتم العثور على نتائج مطابقة للبحث.</div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => { if (onSelectResult) onSelectResult(item); onClose(); }}
                style={{ padding: "12px 16px", borderRadius: "8px", background: themeStyles.inputBg || "#141416", marginBottom: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #2a2a2d" }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", fontSize: "14px" }}>{item.name} — {item.item}</div>
                  <div style={{ fontSize: "11.5px", color: "#aaa", marginTop: "2px" }} dir="ltr">{item.phone}</div>
                </div>
                <ArrowLeft size={16} style={{ color: themeStyles.subText || "#aaaaaa" }} />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default GlobalSearchModal;
