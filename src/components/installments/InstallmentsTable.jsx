import React, { useState, useMemo } from "react";
import { Printer, Trash2 } from "lucide-react";
import { CustomDatePicker } from "../CustomDatePicker";
import { Field, DateInput } from "../CommonUI";

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
  const isEN = t?.lang === "en" || document.documentElement?.lang === "en";

  if (!selected || clientPayments.length === 0) return null;

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: themeStyles.accentGold, marginTop: 10, marginBottom: 16 }}>
        {t.paymentHistoryTitle || (isEN ? "Contract Payment History" : "سجل السداد لهذا العقد")} ({fmtCleanInt(clientPayments.length)} {t.installmentsPaidCount || (isEN ? "Paid Installments" : "أقساط مسددة")})
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text, textAlign: "right", fontSize: 14 }}>
          <thead>
            <tr style={{ background: themeStyles.inputBg, color: themeStyles.accentGold, borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` }}>
              <th style={{ padding: "10px 12px" }}>{t.paymentDate || (isEN ? "Date" : "التاريخ")}</th>
              <th style={{ padding: "10px 12px" }}>{t.paidAmount || (isEN ? "Amount Paid" : "المبلغ المدفوع")}</th>
              <th style={{ padding: "10px 12px" }}>{t.remainingAfter || (isEN ? "Remaining After" : "المتبقي بعدها")}</th>
              <th style={{ padding: "10px 12px" }}>{t.methodAndCollector || (isEN ? "Method / Collector" : "طريقة الدفع/المحصل")}</th>
              <th style={{ padding: "10px 12px", textAlign: "center" }}>{t.action || (isEN ? "Actions" : "إجراءات")}</th>
            </tr>
          </thead>
          <tbody>
            {clientPayments.slice().reverse().map((p) => (
              <tr key={p.id} style={{ borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` }}>
                <td style={{ padding: "10px 12px" }}>{p.payDate || (isEN ? "Payment" : "سداد")}</td>
                <td style={{ padding: "10px 12px", color: themeStyles.accentGold, fontWeight: 800 }}>{fmtCleanInt(p.amount)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                <td style={{ padding: "10px 12px" }}>{fmtCleanInt(p.remainingAfter)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: themeStyles.subText }}>{p.method} · {p.collector}</td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={() => onShowReceipt && onShowReceipt(selected, p)}
                      style={{ background: themeStyles.highlightBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.accent}`, color: themeStyles.accentGold, padding: "6px 12px", borderRadius: themeStyles.borderRadius || 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Printer size={13} /> {t.print || (isEN ? "Print" : "طباعة")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePayment && onDeletePayment(p.id, selected.id, p.amount)}
                      style={{ background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb", padding: "6px 12px", borderRadius: themeStyles.borderRadius || 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Trash2 size={13} /> {t.delete || (isEN ? "Delete" : "حذف")}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isEN = t?.lang === "en" || document.documentElement?.lang === "en";

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 20, width: "100%", maxWidth: 1000, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: themeStyles.accentGold, margin: 0 }}>
            {t.openAllPaymentsRegister || (isEN ? "Comprehensive Payments Register" : "سجل السداد الشامل لجميع العملاء")}
          </h2>
          <button type="button" onClick={onClose} style={{ background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.accentGold, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
            {t.back || "رجوع"} ←
          </button>
        </div>

        <div style={{ background: themeStyles.inputBg, padding: 16, borderRadius: 12, marginBottom: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <input
            style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, padding: "10px 14px", borderRadius: 8, maxWidth: 300, outline: "none", fontSize: 14 }}
            placeholder={t.searchPaymentsPlaceholder || (isEN ? "Search by client or item..." : "بحث باسم العميل أو السلعة...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: themeStyles.subText || "#aaaaaa" }}>
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
                  padding: "8px 12px",
                  color: themeStyles.text || "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  minWidth: "160px"
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: themeStyles.subText || "#aaaaaa" }}>
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
                  padding: "8px 12px",
                  color: themeStyles.text || "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  minWidth: "160px"
                }}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ background: `linear-gradient(145deg, ${themeStyles.accentGold || "#d4af37"}, ${themeStyles.accent || "#c5a028"})`, color: "#111111", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Printer size={16} /> {t.printPaymentsStatement || (isEN ? "Print Payments Statement" : "طباعة كشف السداد")}
          </button>
        </div>

        <div id="printable-area" style={{ background: themeStyles.card, padding: 16, borderRadius: 12, border: `1px solid ${themeStyles.border}` }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: themeStyles.accentGold, margin: 0 }}>{storeInfo?.name || "إيجيمود لإدارة الأقساط"}</h2>
            <div style={{ fontSize: 13, color: themeStyles.subText, marginTop: 4 }}>
              {t.paymentsRegisterTitle || (isEN ? "Comprehensive Payments & Collections Register" : "سجل المدفوعات والتحصيلات الشامل")} — {t.totalPaidSoFar || (isEN ? "Total Collected" : "إجمالي التحصيل")}: ({fmtCleanInt(totalCollected)} {t.currency || (isEN ? "EGP" : "ج.م")})
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text, textAlign: "right", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg, color: themeStyles.accentGold, borderBottom: `2px solid ${themeStyles.accent}` }}>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.paymentDate || (isEN ? "Date" : "تاريخ السداد")}</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.clientNameLabel || (isEN ? "Client Name" : "اسم العميل *")}</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.itemLabel || (isEN ? "Item" : "السلعة *")}</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.paidAmount || (isEN ? "Amount Paid" : "المبلغ المدفوع (ج.م) *")}</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.remainingAfter || (isEN ? "Remaining After" : "المتبقي بعدها")}</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.paymentMethod || (isEN ? "Payment Method" : "طريقة الدفع")}</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{t.collectorEmployee || (isEN ? "Collector / Employee" : "المحصل / الموظف")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: themeStyles.subText }}>{t.noPaymentsFiltered || (isEN ? "No payment records match the filter." : "لا توجد عمليات سداد مسجلة بهذه الفلترة.")}</td></tr>
                ) : (
                  filteredPayments.slice().reverse().map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border}`, background: idx % 2 === 0 ? "transparent" : themeStyles.highlightBg }}>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{p.payDate}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}`, fontWeight: 800, color: themeStyles.accentGold }}>{p.clientName}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{p.item}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}`, fontWeight: 800, color: "#bfe8cd" }}>{fmtCleanInt(p.amount)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{fmtCleanInt(p.remainingAfter)} {t.currency || (isEN ? "EGP" : "ج.م")}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}` }}>{p.method}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border}`, color: themeStyles.subText }}>{p.collector}</td>
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
