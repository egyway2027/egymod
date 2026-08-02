/**
 * =========================================================
 * 📌 النافذة: سجل العملاء الشامل (Excel Mode Modal)
 * 📁 المسار: src/components/clientQuery/AllClientsRegisterModal.jsx
 * 📝 الوظيفة: عرض كافة بيانات العملاء في جدول تفصيلي شامل
 *            يشبه شيت Excel مع إحصاءات مالية وأمر طباعة.
 * =========================================================
 */

import React, { useState, useMemo } from "react";
import { Printer, X, ArrowRight } from "lucide-react";
import { calculateTotals } from "../../services/clientQueryService";

export function AllClientsRegisterModal({ isOpen, onClose, contracts = [], t = {}, themeStyles = {} }) {
  const [searchQuery, setSearchQuery] = useState("");
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contracts;
    return contracts.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.guarantor || "").toLowerCase().includes(q) ||
        (c.item || "").toLowerCase().includes(q) ||
        (c.id || "").toLowerCase().includes(q)
    );
  }, [contracts, searchQuery]);

  const totals = useMemo(() => calculateTotals(filteredList), [filteredList]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "15px",
        boxSizing: "border-box"
      }}
      dir={isEN ? "ltr" : "rtl"}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1150px",
          maxHeight: "92vh",
          background: themeStyles.card || "#1a1a1c",
          border: `1px solid ${themeStyles.border || "#333333"}`,
          borderRadius: themeStyles.borderRadius || "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <button type="button" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "6px", background: themeStyles.card || "#222224", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.text || "#ffffff", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
            <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.back || (isEN ? "Back" : "رجوع")}
          </button>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
            {t.allRegisterTitle || (isEN ? "Comprehensive Clients Register" : "سجل العملاء الشامل")}
          </h2>
          <button type="button" onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "50%", background: themeStyles.card || "#222224", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText || "#aaaaaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
            <button type="button" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #e07a5f, #d4af37)", color: "#111111", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: 800, fontSize: "13.5px", cursor: "pointer" }}>
              <Printer size={16} /> {t.printRegisterBtn || (isEN ? "Print Clients Register" : "طباعة سجل العملاء")}
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchByNamePlaceholder || (isEN ? "Search by name..." : "ابحث بالاسم...")}
              style={{ width: "280px", background: themeStyles.inputBg || "#121214", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 14px", color: themeStyles.text || "#ffffff", fontSize: "13.5px", outline: "none" }}
            />
          </div>

          {/* TOTALS HEADER */}
          <div style={{ background: themeStyles.inputBg || "#141416", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "14px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "4px" }}>
              {t.appName || (isEN ? "Egymod Installment Management" : "إيجيمود لإدارة الأقساط")}
            </div>
            <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginBottom: "14px" }}>
              {t.allClientsRegisterSubHeader || (isEN ? `Comprehensive Client Register — Contracts Count (${filteredList.length})` : `سجل بيانات العملاء الشامل — عدد الأقساط (${filteredList.length})`)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
                  {t.salePriceLabel || (isEN ? "Total Sale Price" : "سعر البيع *")}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.text || "#ffffff", marginTop: "4px" }}>{totals.totalSale} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
              </div>
              <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#4caf50" }}>
                  {t.totalCollectedLabel || (isEN ? "Total Collected" : "إجمالي المحصل")}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>{totals.totalPaid} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
              </div>
              <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#e07a5f" }}>
                  {t.remainingInstallmentsLabel || (isEN ? "Total Remaining" : "إجمالي الأقساط المتبقية")}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#e07a5f", marginTop: "4px" }}>{totals.totalRemaining} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
              </div>
            </div>
          </div>

          {/* TABLE */}
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
                {filteredList.map((item, index) => (
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

        <div style={{ padding: "12px 20px", borderTop: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <button type="button" onClick={onClose} style={{ width: "100%", background: themeStyles.card || "#222224", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", borderRadius: "10px", padding: "10px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.exitBottom || (isEN ? "Exit & Return to Main Dashboard" : "خروج والعودة للشاشة الرئيسية")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllClientsRegisterModal;
