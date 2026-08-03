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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* اختيار العميل أو العقد */}
      <div>
        <span style={styles.fieldLabel || { fontSize: 13.5, color: themeStyles.subText, fontWeight: 700, display: "block", marginBottom: 6 }}>
          {t.selectClientOrContract || (isEN ? "Select Client or Contract" : "اختر العميل أو العقد")}
        </span>
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

      {selected && (
        <form onSubmit={onSubmitPayment} style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
            <Field label={t.paymentDate || (isEN ? "Payment Date" : "تاريخ السداد")} styles={styles}>
              <DateInput 
                value={payDate} 
                onChange={(e) => setPayDate(e.target.value)} 
                required 
                themeStyles={themeStyles} 
                t={t} 
                lang={isEN ? "en" : "ar"} 
              />
            </Field>

            <Field label={t.paidAmount || (isEN ? "Amount Paid (EGP) *" : "المبلغ المدفوع (ج.م) *")} styles={styles}>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  step="1"
                  style={{ 
                    width: "100%", background: themeStyles.inputBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, 
                    borderRadius: themeStyles.borderRadius || 10, padding: "12px 14px", fontFamily: "inherit", outline: "none",
                    fontSize: 18, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" 
                  }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                />

                {/* أزرار الإدخال السريع للمبلغ */}
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", justifyContent: "flex-start" }}>
                  <button
                    type="button"
                    onClick={() => setAmount(String(Math.round(selected.monthly || 0)))}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      background: "rgba(212, 175, 55, 0.08)",
                      border: `1px solid ${themeStyles.accentGold || "rgba(212, 175, 55, 0.35)"}`,
                      color: themeStyles.accentGold || "#d4af37",
                      padding: "7px 16px", borderRadius: themeStyles.borderRadius || 20,
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
                      padding: "7px 16px", borderRadius: themeStyles.borderRadius || 20,
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
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <Field label={t.paymentMethod || (isEN ? "Payment Method" : "طريقة الدفع")} styles={styles}>
              <select 
                style={{ width: "100%", background: themeStyles.inputBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 10, padding: "12px 14px", color: themeStyles.text, fontFamily: "inherit", fontSize: 15, outline: "none" }} 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="نقداً / كاش">{t.cashMethod || (isEN ? "Cash" : "نقداً / كاش")}</option>
                <option value="فودافون كاش / إنستا باي">{t.walletMethod || (isEN ? "Vodafone Cash / InstaPay" : "فودافون كاش / إنستا باي")}</option>
                <option value="تحويل بنكي">{t.bankTransferMethod || (isEN ? "Bank Transfer" : "تحويل بنكي")}</option>
              </select>
            </Field>

            <Field label={t.collectorEmployee || (isEN ? "Collector / Employee" : "المحصل / الموظف")} styles={styles}>
              <select 
                style={{ width: "100%", background: themeStyles.inputBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 10, padding: "12px 14px", color: themeStyles.text, fontFamily: "inherit", fontSize: 15, outline: "none" }} 
                value={collector} 
                onChange={(e) => setCollector(e.target.value)}
              >
                <option value="المشرف">{t.generalSupervisor || (isEN ? "General Supervisor" : "المشرف العام")}</option>
                {employees && employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>{emp.name} ({emp.job || (isEN ? "Employee" : "موظف")})</option>
                ))}
              </select>
            </Field>
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
