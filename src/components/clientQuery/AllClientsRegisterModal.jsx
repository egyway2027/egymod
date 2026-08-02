/**
 * =========================================================
 * 📌 المكون: مودال سجل العملاء الشامل (All Clients Register)
 * 📁 المسار: src/components/clientQuery/AllClientsRegisterModal.jsx
 * 📝 الوظيفة: جدول Excel المطور لجميع العملاء، يدعم الطباعة والترجمة.
 * =========================================================
 */

import React from "react";
import { Printer, X, ArrowRight, ArrowLeft } from "lucide-react";

export function AllClientsRegisterModal({ contracts = [], onClose, t, themeStyles }) {
  const isRTL = document.documentElement.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const totalSale = contracts.reduce((acc, c) => acc + (Number(c.sale) || 0), 0);
  const totalCollected = contracts.reduce((acc, c) => acc + ((Number(c.down) || 0) + (Number(c.paidAmount) || 0)), 0);
  const totalRemaining = contracts.reduce((acc, c) => acc + (Number(c.remainingAmount) || 0), 0);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: themeStyles.card, border: `1px solid ${themeStyles.border}`,
        borderRadius: themeStyles.cardRadius || 20, padding: 24,
        width: "100%", maxWidth: 1250, maxHeight: "90vh", overflowY: "auto"
      }}>
        {/* Header Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "transparent",
              border: `1px solid ${themeStyles.border}`, color: themeStyles.text,
              padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700
            }}
          >
            <BackIcon size={16} /> {t.back}
          </button>

          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: themeStyles.accentGold }}>
            {t.allClientsRegisterTitle}
          </h3>

          <X style={{ cursor: "pointer", color: themeStyles.subText }} onClick={onClose} />
        </div>

        {/* Print Action */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
              background: "linear-gradient(135deg, #d69a5f, #b06a35)", border: "none",
              borderRadius: 10, color: "#fff", fontWeight: 800, cursor: "pointer"
            }}
          >
            <Printer size={16} /> {t.printRegister}
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ background: themeStyles.inputBg, padding: 16, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: themeStyles.subText }}>{t.salePriceHeader}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: themeStyles.text, marginTop: 4 }}>{totalSale} {t.currency}</div>
          </div>
          <div style={{ background: themeStyles.inputBg, padding: 16, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: themeStyles.subText }}>{t.totalCollectedHeader}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>{totalCollected} {t.currency}</div>
          </div>
          <div style={{ background: themeStyles.inputBg, padding: 16, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: themeStyles.subText }}>{t.totalRemainingHeader}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444", marginTop: 4 }}>{totalRemaining} {t.currency}</div>
          </div>
        </div>

        {/* Excel Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "start", fontSize: 13 }}>
            <thead>
              <tr style={{ background: themeStyles.inputBg, color: themeStyles.accentGold, borderBottom: `2px solid ${themeStyles.border}` }}>
                <th style={{ padding: 12 }}>{t.idHeader}</th>
                <th style={{ padding: 12 }}>{t.clientNameHeader}</th>
                <th style={{ padding: 12 }}>{t.clientPhoneHeader}</th>
                <th style={{ padding: 12 }}>{t.guarantorNameHeader}</th>
                <th style={{ padding: 12 }}>{t.guarantorPhoneHeader}</th>
                <th style={{ padding: 12 }}>{t.itemHeader}</th>
                <th style={{ padding: 12 }}>{t.costPriceHeader}</th>
                <th style={{ padding: 12 }}>{t.salePriceHeader}</th>
                <th style={{ padding: 12 }}>{t.downPaymentHeader}</th>
                <th style={{ padding: 12 }}>{t.monthlyInstallmentHeader}</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                  <td style={{ padding: 12, fontSize: 11, color: themeStyles.subText }}>{c.id}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: 12 }}>{c.phone}</td>
                  <td style={{ padding: 12 }}>{c.guarantor || "-"}</td>
                  <td style={{ padding: 12 }}>{c.guarantorPhone || "-"}</td>
                  <td style={{ padding: 12 }}>{c.item}</td>
                  <td style={{ padding: 12 }}>{c.cost}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{c.sale}</td>
                  <td style={{ padding: 12 }}>{c.down}</td>
                  <td style={{ padding: 12, color: themeStyles.accentGold, fontWeight: 700 }}>{c.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: 14, marginTop: 20, background: themeStyles.inputBg,
            border: `1px solid ${themeStyles.border}`, color: themeStyles.accentGold,
            borderRadius: 12, fontWeight: 800, cursor: "pointer"
          }}
        >
          {t.exitDashboard}
        </button>
      </div>
    </div>
  );
}
