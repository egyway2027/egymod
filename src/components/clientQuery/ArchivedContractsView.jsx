/**
 * =========================================================
 * 📌 الشاشة: أرشيف العقود المنتهية (Archived Contracts View)
 * 📁 المسار: src/components/clientQuery/ArchivedContractsView.jsx
 * 📝 الوظيفة: عرض وتصفية وطباعة العقود التي تم سدادها بالكامل (المتبقي = 0).
 * =========================================================
 */

import React, { useState, useMemo } from "react";
import { Printer } from "lucide-react";
import { filterContracts, calculateTotals } from "../../services/clientQueryService";

export function ArchivedContractsView({ contracts = [], t = {}, themeStyles = {} }) {
  const [searchQuery, setSearchQuery] = useState("");
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const archiveList = useMemo(() => {
    return filterContracts(contracts, searchQuery, true);
  }, [contracts, searchQuery]);

  const totals = useMemo(() => calculateTotals(archiveList), [archiveList]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search & Print Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <button type="button" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #e07a5f, #d4af37)", color: "#111111", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: 800, fontSize: "13.5px", cursor: "pointer" }}>
          <Printer size={16} /> {t.printArchiveBtn || (isEN ? "Print Archive" : "طباعة أرشيف العقود")}
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchArchivePlaceholder || (isEN ? "Search archive clients, phone, item..." : "بحث بأسماء عملاء الأرشيف، الهاتف، أو السلعة...")}
          style={{ width: "320px", background: themeStyles.inputBg || "#121214", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 14px", color: themeStyles.text || "#ffffff", fontSize: "13.5px", outline: "none" }}
        />
      </div>

      {/* KPI Header Box */}
      <div style={{ background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "14px", padding: "18px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
          {t.appName || (isEN ? "Egymod Installment Management" : "إيجيمود لإدارة الأقساط")}
        </div>
        <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px", marginBottom: "14px" }}>
          {t.archivedContractsSubHeader || (isEN ? `Fully Paid Contracts Archive — Contracts Count (${archiveList.length})` : `أرشيف العقود المسددة بالكامل — عدد الأقساط (${archiveList.length})`)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          <div style={{ background: themeStyles.inputBg || "#121214", padding: "10px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
              {t.salePriceLabel || (isEN ? "Total Sale Price" : "سعر البيع *")}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.text || "#ffffff", marginTop: "4px" }}>{totals.totalSale} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
          </div>
          <div style={{ background: themeStyles.inputBg || "#121214", padding: "10px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#4caf50" }}>
              {t.totalCollectedLabel || (isEN ? "Total Collected" : "إجمالي المحصل")}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>{totals.totalPaid} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
          </div>
          <div style={{ background: themeStyles.inputBg || "#121214", padding: "10px", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
              {t.remainingInstallmentsLabel || (isEN ? "Total Remaining" : "إجمالي الأقساط المتبقية")}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>0 {t.currency || (isEN ? "EGP" : "ج.م")}</div>
          </div>
        </div>
      </div>

      {/* Archive Table */}
      <div style={{ overflowX: "auto", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "center" }}>
          <thead>
            <tr style={{ background: themeStyles.inputBg || "#121214", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
              <th style={{ padding: "10px" }}>ID #</th>
              <th style={{ padding: "10px" }}>{t.clientNameLabel || (isEN ? "Client Name *" : "اسم العميل *")}</th>
              <th style={{ padding: "10px" }}>{t.clientPhoneLabel || (isEN ? "Client Phone *" : "تليفون العميل *")}</th>
              <th style={{ padding: "10px" }}>{t.guarantorNameLabel || (isEN ? "Guarantor Name" : "اسم الضامن")}</th>
              <th style={{ padding: "10px" }}>{t.guarantorPhoneLabel || (isEN ? "Guarantor Phone" : "تليفون الضامن")}</th>
              <th style={{ padding: "10px" }}>{t.itemLabel || (isEN ? "Item *" : "السلعة *")}</th>
              <th style={{ padding: "10px" }}>{t.costPriceLabel || (isEN ? "Cost Price *" : "سعر التكلفة *")}</th>
              <th style={{ padding: "10px" }}>{t.salePriceLabel || (isEN ? "Sale Price *" : "سعر البيع *")}</th>
              <th style={{ padding: "10px" }}>{t.downPaymentLabel || (isEN ? "Down Payment *" : "المقدم *")}</th>
              <th style={{ padding: "10px" }}>{t.monthlyInstallmentLabel || (isEN ? "Monthly Installment" : "القسط الشهري")}</th>
            </tr>
          </thead>
          <tbody>
            {archiveList.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: `1px solid ${themeStyles.border || "#222224"}` }}>
                <td style={{ padding: "10px", fontSize: "11px", color: themeStyles.subText || "#888888" }}>{item.id || index + 1}</td>
                <td style={{ padding: "10px", fontWeight: 700 }}>{item.name}</td>
                <td style={{ padding: "10px" }} dir="ltr">{item.phone}</td>
                <td style={{ padding: "10px" }}>{item.guarantor || "-"}</td>
                <td style={{ padding: "10px" }} dir="ltr">{item.guarantorPhone || "-"}</td>
                <td style={{ padding: "10px", color: themeStyles.accentGold || "#e8cd9c" }}>{item.item}</td>
                <td style={{ padding: "10px" }}>{item.cost}</td>
                <td style={{ padding: "10px", fontWeight: 700 }}>{item.sale}</td>
                <td style={{ padding: "10px" }}>{item.down}</td>
                <td style={{ padding: "10px", color: "#e07a5f", fontWeight: 800 }}>{item.monthly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArchivedContractsView;
