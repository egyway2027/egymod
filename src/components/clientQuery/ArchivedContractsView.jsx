/**
 * =========================================================
 * 📌 المكون: شاشة أرشيف العقود المسددة (Archived Contracts View)
 * 📁 المسار: src/components/clientQuery/ArchivedContractsView.jsx
 * 📝 الوظيفة: عرض عقود العملاء المسددة بالكامل مترجمة.
 * =========================================================
 */

import React, { useState } from "react";
import { Printer, Search } from "lucide-react";

export function ArchivedContractsView({ archivedContracts = [], t, themeStyles }) {
  const [searchTerm, setSearchTerm] = useState("");
  const isRTL = document.documentElement.dir === "rtl";

  const filteredArchive = archivedContracts.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(term) ||
      (c.phone || "").includes(term) ||
      (c.item || "").toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: 24 }}>
      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <button
          onClick={() => window.print()}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: "linear-gradient(135deg, #d69a5f, #b06a35)", border: "none",
            borderRadius: 10, color: "#fff", fontWeight: 800, cursor: "pointer"
          }}
        >
          <Printer size={16} /> {t.printArchive}
        </button>

        <div style={{ position: "relative", minWidth: 260 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchArchivePlaceholder}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`,
              color: themeStyles.text, fontWeight: 700, fontSize: 13
            }}
          />
          <Search size={16} style={{ position: "absolute", top: 12, left: isRTL ? "auto" : 12, right: isRTL ? 12 : "auto", color: themeStyles.subText }} />
        </div>
      </div>

      <h3 style={{ textAlign: "center", margin: "0 0 16px 0", color: themeStyles.accentGold, fontSize: 18, fontWeight: 800 }}>
        {t.archiveTitle} ({archivedContracts.length})
      </h3>

      {/* Table */}
      {filteredArchive.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "start", fontSize: 13 }}>
            <thead>
              <tr style={{ background: themeStyles.inputBg, color: themeStyles.accentGold, borderBottom: `2px solid ${themeStyles.border}` }}>
                <th style={{ padding: 12 }}>{t.idHeader}</th>
                <th style={{ padding: 12 }}>{t.clientNameHeader}</th>
                <th style={{ padding: 12 }}>{t.clientPhoneHeader}</th>
                <th style={{ padding: 12 }}>{t.itemHeader}</th>
                <th style={{ padding: 12 }}>{t.salePriceHeader}</th>
                <th style={{ padding: 12 }}>{t.totalCollectedHeader}</th>
                <th style={{ padding: 12 }}>{t.contractStatusHeader}</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchive.map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                  <td style={{ padding: 12, fontSize: 11, color: themeStyles.subText }}>{c.id}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: 12 }}>{c.phone}</td>
                  <td style={{ padding: 12 }}>{c.item}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{c.sale} {t.currency}</td>
                  <td style={{ padding: 12, color: "#22c55e", fontWeight: 700 }}>{c.sale} {t.currency}</td>
                  <td style={{ padding: 12, color: "#22c55e", fontWeight: 800 }}>{t.contractPaidStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 30, color: themeStyles.subText, fontWeight: 700 }}>
          {t.noDataFound}
        </div>
      )}
    </div>
  );
}
