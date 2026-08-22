import React, { useState, useMemo } from "react";
import { Printer, Trash2 } from "lucide-react";
import { CustomDatePicker } from "../CustomDatePicker";
import { Field, DateInput } from "../CommonUI";
import { useIsMobile } from "../../hooks/useIsMobile";

const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export default function InstallmentsTable({
  selected,
  clientPayments = [],
  onShowReceipt,
  onDeletePayment,
  t = {},
  themeStyles = {}
}) {
  const isMobile = useIsMobile();
  const isEN = t?.lang === "en" || document.documentElement?.lang === "en" || document.documentElement?.dir === "ltr";

  if (!selected || clientPayments.length === 0) return null;

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ marginTop: isMobile ? 12 : 20, paddingTop: isMobile ? 10 : 16, borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
      <h3 style={{ fontSize: isMobile ? 13 : 16, fontWeight: 800, color: themeStyles.accentGold, marginTop: isMobile ? 4 : 10, marginBottom: isMobile ? 8 : 16 }}>
        {t.paymentHistoryTitle || (isEN ? "Contract Payment History" : "سجل السداد لهذا العقد")} ({fmtCleanInt(clientPayments.length)} {t.installmentsPaidCount || (isEN ? "Paid" : "أقساط مسددة")})
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text, textAlign: isEN ? "left" : "right", fontSize: isMobile ? 11 : 14 }}>
          <thead>
            <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold, borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
              <th style={{ padding: isMobile ? "6px 4px" : "10px 12px", whiteSpace: "nowrap" }}>{t.paymentDate || (isEN ? "Date" : "التاريخ")}</th>
              <th style={{ padding: isMobile ? "6px 4px" : "10px 12px", whiteSpace: "nowrap" }}>{t.paidAmount || (isEN ? "Amount" : "المبلغ")}</th>
              <th style={{ padding: isMobile ? "6px 4px" : "10px 12px", whiteSpace: "nowrap" }}>{t.remainingAfter || (isEN ? "Remaining" : "المتبقي")}</th>
              <th style={{ padding: isMobile ? "6px 4px" : "10px 12px", whiteSpace: "nowrap" }}>{t.methodAndCollector || (isEN ? "Method" : "طريقة الدفع/المحصل")}</th>
              <th style={{ padding: isMobile ? "6px 4px" : "10px 12px", textAlign: "center", whiteSpace: "nowrap" }}>{t.action || (isEN ? "Actions" : "إجراءات")}</th>
            </tr>
          </thead>
          <tbody>
            {clientPayments.slice().reverse().map((p) => (
              <tr key={p.id} style={{ borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
                <td style={{ padding: isMobile ? "6px 4px" : "10px 12px", whiteSpace: "nowrap" }}>{p.payDate || (isEN ? "Payment" : "سداد")}</td>
                <td style={{ padding: isMobile ? "6px 4px" : "10px 12px", color: themeStyles.accentGold, fontWeight: 800, whiteSpace: "nowrap" }}>{fmtCleanInt(p.amount)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                <td style={{ padding: isMobile ? "6px 4px" : "10px 12px", whiteSpace: "nowrap" }}>{fmtCleanInt(p.remainingAfter)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                <td style={{ padding: isMobile ? "6px 4px" : "10px 12px", fontSize: isMobile ? 10 : 12, color: themeStyles.subText, whiteSpace: "nowrap" }}>{p.method} · {p.collector}</td>
                <td style={{ padding: isMobile ? "6px 4px" : "10px 12px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: isMobile ? 4 : 6, justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => onShowReceipt && onShowReceipt(selected, p)}
                      style={{ background: themeStyles.highlightBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.accent}`, color: themeStyles.accentGold, padding: isMobile ? "4px 8px" : "6px 12px", borderRadius: themeStyles.borderRadius || 8, fontSize: isMobile ? 10 : 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <Printer size={isMobile ? 11 : 13} /> {t.print || (isEN ? "Print" : "طباعة")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePayment && onDeletePayment(p.id, selected.id, p.amount)}
                      style={{ background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb", padding: isMobile ? "4px 8px" : "6px 12px", borderRadius: themeStyles.borderRadius || 8, fontSize: isMobile ? 10 : 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <Trash2 size={isMobile ? 11 : 13} /> {t.delete || (isEN ? "Delete" : "حذف")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// شاشة سجل السداد الشامل لجميع العملاء (All Payments Register)
export function AllPaymentsRegisterModal({ payments = [], storeInfo = {}, onClose, t = {}, styles = {}, themeStyles = {} }) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isEN = t?.lang === "en" || document.documentElement?.lang === "en" || document.documentElement?.dir === "ltr";

  const filteredPayments = useMemo(() => {
    return (payments || []).filter(p => {
      if (fromDate && p.payDate < fromDate) return false;
      if (toDate && p.payDate > toDate) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchName = (p.clientName || "").toLowerCase().includes(term);
        const matchItem = (p.item || "").toLowerCase().includes(term);
        return matchName || matchItem;
      }
      return true;
    });
  }, [payments, fromDate, toDate, searchTerm]);

  const totalCollected = useMemo(() => {
    return filteredPayments.reduce((s, p) => s + Math.round(Number(p.amount || 0)), 0);
  }, [filteredPayments]);

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: isMobile ? 8 : 16 }}>
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`, borderRadius: themeStyles.borderRadius || (isMobile ? 14 : 20), width: "100%", maxWidth: 1000, maxHeight: isMobile ? "94vh" : "90vh", overflowY: "auto", padding: isMobile ? "12px 10px" : 24 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 10 : 16 }}>
          <h2 style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: themeStyles.accentGold, margin: 0 }}>
            {t.openAllPaymentsRegister || (isEN ? "Payments Register" : "سجل السداد الشامل لجميع العملاء")}
          </h2>
          <button type="button" onClick={onClose} style={{ background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold, padding: isMobile ? "4px 10px" : "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 11 : 13 }}>
            {t.back || (isEN ? "Back" : "رجوع")} {isEN ? "→" : "←"}
          </button>
        </div>

        <div style={{ background: themeStyles.inputBg || "#141414", padding: isMobile ? "10px 8px" : 16, borderRadius: 12, marginBottom: isMobile ? 10 : 16, display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
          <input
            style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.text || "#ffffff", padding: isMobile ? "8px 10px" : "10px 14px", borderRadius: 8, width: "100%", outline: "none", fontSize: isMobile ? 12 : 14, boxSizing: "border-box" }}
            placeholder={t.searchPaymentsPlaceholder || (isEN ? "Search by client or item..." : "بحث باسم العميل أو السلعة...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* حقول من تاريخ وإلى تاريخ في صف أفقي واحد على الموبايل */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 6 : 14, width: "100%", boxSizing: "border-box" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: isMobile ? "11px" : "12.5px", fontWeight: 700, color: themeStyles.subText || "#aaaaaa" }}>
              <span>{t.fromDate || (isEN ? "From Date" : "من تاريخ")}</span>
              <CustomDatePicker
                value={fromDate}
                onChange={(valOrEvent) => {
                  const val = typeof valOrEvent === "string" ? valOrEvent : valOrEvent?.target?.value || valOrEvent?.value || "";
                  setFromDate(val);
                }}
                isEN={isEN}
                themeStyles={themeStyles}
                inputStyle={{
                  background: themeStyles.card || "#1e1e1e",
                  border: `1px solid ${themeStyles.border || "#333333"}`,
                  borderRadius: "8px",
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  color: themeStyles.text || "#ffffff",
                  fontSize: isMobile ? "11px" : "13px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: isMobile ? "11px" : "12.5px", fontWeight: 700, color: themeStyles.subText || "#aaaaaa" }}>
              <span>{t.toDate || (isEN ? "To Date" : "إلى تاريخ")}</span>
              <CustomDatePicker
                value={toDate}
                onChange={(valOrEvent) => {
                  const val = typeof valOrEvent === "string" ? valOrEvent : valOrEvent?.target?.value || valOrEvent?.value || "";
                  setToDate(val);
                }}
                isEN={isEN}
                themeStyles={themeStyles}
                inputStyle={{
                  background: themeStyles.card || "#1e1e1e",
                  border: `1px solid ${themeStyles.border || "#333333"}`,
                  borderRadius: "8px",
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  color: themeStyles.text || "#ffffff",
                  fontSize: isMobile ? "11px" : "13px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            style={{ background: `linear-gradient(145deg, ${themeStyles.accentGold || "#d4af37"}, ${themeStyles.accent || "#c5a028"})`, color: "#111111", border: "none", borderRadius: 10, padding: isMobile ? "8px 14px" : "10px 18px", fontWeight: 800, fontSize: isMobile ? 12 : 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}
          >
            <Printer size={16} /> {t.printPaymentsStatement || (isEN ? "Print Statement" : "طباعة كشف السداد")}
          </button>
        </div>

        <div id="printable-area" style={{ background: themeStyles.card || "#1e1e1e", padding: isMobile ? "10px 8px" : 16, borderRadius: 12, border: `1px solid ${themeStyles.border || "#333333"}` }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 8 : 14 }}>
            <h2 style={{ fontSize: isMobile ? 15 : 20, fontWeight: 800, color: themeStyles.accentGold, margin: 0 }}>{storeInfo?.name || t.appName || (isEN ? "Pro Installment Management" : "إيجيمود لإدارة الأقساط")}</h2>
            <div style={{ fontSize: isMobile ? 11 : 13, color: themeStyles.subText, marginTop: 2 }}>
              {t.paymentsRegisterTitle || (isEN ? "Payments Register" : "سجل المدفوعات والتحصيلات")} — {t.totalPaidSoFar || (isEN ? "Total" : "إجمالي التحصيل")}: ({fmtCleanInt(totalCollected)} {t.currency || (isEN ? "EGP" : "ج.م")})
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text, textAlign: isEN ? "left" : "right", fontSize: isMobile ? 11 : 13.5 }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold, borderBottom: `2px solid ${themeStyles.accent || "#d4af37"}` }}>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.paymentDate || (isEN ? "Date" : "تاريخ السداد")}</th>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.clientNameLabel || (isEN ? "Client" : "اسم العميل")}</th>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.itemLabel || (isEN ? "Item" : "السلعة")}</th>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.paidAmount || (isEN ? "Amount" : "المبلغ المدفوع")}</th>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.remainingAfter || (isEN ? "Remaining" : "المتبقي")}</th>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.paymentMethod || (isEN ? "Method" : "طريقة الدفع")}</th>
                  <th style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{t.collectorEmployee || (isEN ? "Collector" : "المحصل")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 14, textAlign: "center", color: themeStyles.subText }}>{t.noPaymentsFiltered || (isEN ? "No payment records match." : "لا توجد عمليات سداد مسجلة.")}</td></tr>
                ) : (
                  filteredPayments.slice().reverse().map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: idx % 2 === 0 ? "transparent" : (themeStyles.highlightBg || "rgba(255,255,255,0.03)") }}>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{p.payDate}</td>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, fontWeight: 800, color: themeStyles.accentGold, whiteSpace: "nowrap" }}>{p.clientName}</td>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{p.item}</td>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, fontWeight: 800, color: "#bfe8cd", whiteSpace: "nowrap" }}>{fmtCleanInt(p.amount)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{fmtCleanInt(p.remainingAfter)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, whiteSpace: "nowrap" }}>{p.method}</td>
                      <td style={{ padding: isMobile ? "6px 4px" : "10px", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText, whiteSpace: "nowrap" }}>{p.collector}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
