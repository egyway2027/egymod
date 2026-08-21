import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

export function GlobalSearchModal({ isOpen, onClose, contracts = [], clientsList = [], onSelectResult, themeStyles = {}, t = {} }) {
  const [query, setQuery] = useState("");
  const isRTL = !t.lang || t.lang === "ar" || document.documentElement.dir === "rtl";
  const dataList = contracts.length > 0 ? contracts : clientsList;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return dataList.filter((item) => {
      const name = (item.client_name || item.clientName || item.name || "").toLowerCase();
      const phone = (item.client_phone || item.clientPhone || item.phone || "").toLowerCase();
      const itemTitle = (item.item_name || item.itemName || item.item || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || itemTitle.includes(q);
    });
  }, [dataList, query]);

  if (!isOpen) return null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "600px", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ color: themeStyles.accentGold || "#d69a5f", margin: 0, fontSize: "16px", fontWeight: 800 }}>
            {t.quickSearchTitle || t.globalSearch || "البحث السريع الشامل"}
          </h3>
          <X size={18} style={{ color: "#aaa", cursor: "pointer" }} onClick={onClose} />
        </div>

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder || "ابحث باسم العميل، الهاتف، أو السلعة..."}
            style={{ width: "100%", background: themeStyles.inputBg || "#1b1b1d", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: isRTL ? "12px 14px 12px 38px" : "12px 38px 12px 14px", color: "#fff", outline: "none", boxSizing: "border-box" }}
          />
          <Search size={16} style={{ position: "absolute", [isRTL ? "left" : "right"]: "12px", top: "50%", transform: "translateY(-50%)", color: "#666" }} />
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888", padding: "20px", fontSize: "13px" }}>
              {query ? (t.noDataFound || "لا توجد نتائج مطابقة") : (t.startTypingSearch || "ابدأ الكتابة للبحث...")}
            </div>
          ) : (
            results.map((r) => {
              const sale = Number(r.sale_price ?? r.salePrice ?? r.sale ?? r.total ?? 0);
              const down = Number(r.down_payment ?? r.downPayment ?? r.down ?? 0);
              const instArr = Array.isArray(r.installments) ? r.installments : (Array.isArray(r.payments) ? r.payments : []);
              const totalPaidInst = instArr
                .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
                .reduce((sum, i) => sum + Number(i.amount || 0), 0);
              const remainingVal = Math.max(0, sale - down - totalPaidInst);

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    if (typeof onSelectResult === "function") onSelectResult(r);
                    onClose();
                  }}
                  style={{ background: themeStyles.inputBg || "#1b1b1d", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: onSelectResult ? "pointer" : "default" }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>{r.client_name || r.clientName || r.name}</div>
                    <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{r.item_name || r.itemName || r.item} · {r.client_phone || r.clientPhone || r.phone}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: "13px" }}>
                    {(t.remainingShort || "المتبقي")}: {remainingVal.toLocaleString()} {t.currency || "ج.م"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
