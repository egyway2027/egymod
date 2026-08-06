import React from "react";
import { Banknote, CheckCheck } from "lucide-react";
import { Field, DateInput, NameComboBox, LiveStat } from "../CommonUI";

// دالة تنظيف الأرقام من الفواصل
const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export default function CustomerSearchHeader({
  rows = [],
  selected,
  setSelected,
  amount,
  setAmount,
  payDate,
  setPayDate,
  method,
  setMethod,
  collector,
  setCollector,
  employees = [],
  onSubmitPayment,
  t = {},
  styles = {},
  themeStyles = {}
}) {
  const isEN = t?.lang === "en" || document.documentElement?.lang === "en";

  const numAmount = parseFloat(amount) || 0;
  const currentRemaining = selected ? Number(selected.remaining || 0) : 0;
  const remainingAfterPay = Math.max(0, currentRemaining - numAmount);
  const isPaidOffNow = selected && currentRemaining > 0 && remainingAfterPay === 0;

  return (
    <div className="cs-header-container" style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", boxSizing: "border-box" }}>
      {/* 🛡️ إجبار جميع العناصر الداخلية والمدخلات على الالتزام بالإطار ومنع أي بروز */}
      <style>{`
        .cs-header-container, .cs-header-container *, .cs-header-container *::before, .cs-header-container *::after {
          box-sizing: border-box !important;
        }
        .cs-header-container input, .cs-header-container select, .cs-header-container button {
          max-width: 100% !important;
        }
      `}</style>

      {/* اختيار العميل أو العقد */}
      <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
        <span style={styles.fieldLabel || { fontSize: 13.5, color: themeStyles.subText || "#aaaaaa", fontWeight: 700, display: "block", marginBottom: 6 }}>
          {t.selectClientOrContract || (isEN ? "Select Client or Contract" : "اختر العميل أو العقد")}
        </span>
        <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
          <NameComboBox
            items={rows}
            getLabel={(r) => `${r.name} — ${r.item}`}
            getSecondary={(r) => `${t.remaining || (isEN ? "Remaining" : "متبقي")} ${fmtCleanInt(r.remaining)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
            placeholder={t.searchClientPlaceholder || (isEN ? "Type client name..." : "اكتب اسم العميل...")}
            onSelect={(item) => { setSelected(item); setAmount(""); }}
            selectedLabel={selected ? `${selected.name} — ${selected.item}` : null}
            onClear={() => { setSelected(null); setAmount(""); }}
            styles={styles}
            t={t}
          />
        </div>
      </div>

      {selected && (
        <form onSubmit={onSubmitPayment} style={{ marginTop: 10, width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <label style={{ fontSize: 13.5, color: themeStyles.subText || "#aaaaaa", fontWeight: 700 }}>
                {t.paymentDate || (isEN ? "Payment Date" : "تاريخ السداد")}
              </label>
              <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
                <DateInput 
                  value={payDate} 
                  onChange={(e) => setPayDate(e.target.value)} 
                  required 
                  themeStyles={themeStyles} 
                  t={t} 
                  lang={isEN ? "en" : "ar"} 
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <label style={{ fontSize: 13.5, color: themeStyles.subText || "#aaaaaa", fontWeight: 700 }}>
                {t.paidAmount || (isEN ? "Amount Paid (EGP) *" : "المبلغ المدفوع (ج.م) *")}
              </label>
              <input
                type="number"
                step="1"
                style={{ 
                  width: "100%", 
                  height: 48,
                  background: themeStyles.inputBg || "#141414", 
                  border: `1px solid ${themeStyles.border || "#333333"}`, 
                  borderRadius: themeStyles.borderRadius || 10, 
                  padding: "0 14px", 
                  fontFamily: "inherit", 
                  outline: "none",
                  fontSize: 16, 
                  fontWeight: 800, 
                  color: themeStyles.accentGold || "#d4af37", 
                  boxSizing: "border-box" 
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* أزرار الإدخال السريع للمبلغ */}
          <div style={{ display: "flex", gap: 10, marginTop: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setAmount(String(Math.round(selected.monthly || 0)))}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(212, 175, 55, 0.08)",
                border: `1px solid ${themeStyles.accentGold || "rgba(212, 175, 55, 0.35)"}`,
                color: themeStyles.accentGold || "#d4af37",
                padding: "8px 16px", borderRadius: themeStyles.borderRadius || 20,
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
              }}
            >
              <Banknote size={16} />
              <span>{t.fullInstallmentBtn || (isEN ? "Full Installment" : "قسط كامل")}:</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>
                {fmtCleanInt(selected.monthly)} {t.currency || (isEN ? "EGP" : "ج.م")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAmount(String(Math.round(selected.remaining || 0)))}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                color: "#10b981",
                padding: "8px 16px", borderRadius: themeStyles.borderRadius || 20,
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
              }}
            >
              <CheckCheck size={16} />
              <span>{t.settleContractBtn || (isEN ? "Settle Contract" : "تصفية العقد")}:</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>
                {fmtCleanInt(selected.remaining)} {t.currency || (isEN ? "EGP" : "ج.م")}
              </span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <label style={{ fontSize: 13.5, color: themeStyles.subText || "#aaaaaa", fontWeight: 700 }}>
                {t.paymentMethod || (isEN ? "Payment Method" : "طريقة الدفع")}
              </label>
              <select 
                style={{ 
                  width: "100%", height: 48, background: themeStyles.inputBg || "#141414", 
                  border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: themeStyles.borderRadius || 10, 
                  padding: "0 14px", color: themeStyles.text || "#ffffff", fontFamily: "inherit", fontSize: 15, 
                  outline: "none", boxSizing: "border-box" 
                }} 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="نقداً / كاش">{t.cashMethod || (isEN ? "Cash" : "نقداً / كاش")}</option>
                <option value="فودافون كاش / إنستا باي">{t.walletMethod || (isEN ? "Vodafone Cash / InstaPay" : "فودافون كاش / إنستا باي")}</option>
                <option value="تحويل بنكي">{t.bankTransferMethod || (isEN ? "Bank Transfer" : "تحويل بنكي")}</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <label style={{ fontSize: 13.5, color: themeStyles.subText || "#aaaaaa", fontWeight: 700 }}>
                {t.collectorEmployee || (isEN ? "Collector / Employee" : "المحصل / الموظف")}
              </label>
              <select 
                style={{ 
                  width: "100%", height: 48, background: themeStyles.inputBg || "#141414", 
                  border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: themeStyles.borderRadius || 10, 
                  padding: "0 14px", color: themeStyles.text || "#ffffff", fontFamily: "inherit", fontSize: 15, 
                  outline: "none", boxSizing: "border-box" 
                }} 
                value={collector} 
                onChange={(e) => setCollector(e.target.value)}
              >
                <option value="المشرف">{t.generalSupervisor || (isEN ? "General Supervisor" : "المشرف العام")}</option>
                {employees && employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>{emp.name} ({emp.job || (isEN ? "Employee" : "موظف")})</option>
                ))}
              </select>
            </div>
          </div>

          {/* شريط الإحصائيات الحية */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, background: themeStyles.highlightBg, border: `1px dashed ${themeStyles.accent}`, borderRadius: themeStyles.borderRadius || 12, padding: 14, margin: "6px 0" }}>
            <LiveStat label={t.itemLabel || (isEN ? "Item" : "السلعة")} value={selected.item} themeStyles={themeStyles} />
            <LiveStat label={t.currentRemaining || (isEN ? "Current Remaining" : "المتبقي الحالي")} value={`${fmtCleanInt(currentRemaining)} ${t.currency || (isEN ? "EGP" : "ج.م")}`} themeStyles={themeStyles} />
            <LiveStat label={t.remainingAfterPay || (isEN ? "Remaining After Payment" : "المتبقي بعد هذا السداد")} value={`${fmtCleanInt(remainingAfterPay)} ${t.currency || (isEN ? "EGP" : "ج.م")}`} themeStyles={themeStyles} />
          </div>

          {isPaidOffNow && (
            <div style={{ background: "rgba(232,205,156,0.15)", border: `1px solid ${themeStyles.accentGold || "#d4af37"}`, color: themeStyles.accentGold || "#d4af37", padding: "10px", borderRadius: themeStyles.borderRadius || 10, textAlign: "center", fontWeight: 800, fontSize: 14, margin: "12px 0" }}>
              🏆 {t.contractSettledNotice || (isEN ? "This contract has been fully settled upon saving changes!" : "تم مخالصة وسداد هذا العقد بالكامل عند حفظ التغييرات!")}
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              width: "100%", background: `linear-gradient(145deg, ${themeStyles.accentGold}, ${themeStyles.accent})`, color: "#111111", border: "none", 
              borderRadius: themeStyles.borderRadius || 12, padding: "14px 20px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 14, fontFamily: "inherit" 
            }}
          >
            {t.recordAndPrintBtn || (isEN ? "Record Payment & Print Receipt" : "تسجيل السداد وطباعة الإيصال")}
          </button>
        </form>
      )}
    </div>
  );
}
