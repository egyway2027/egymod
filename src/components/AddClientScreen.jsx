import React, { useState, useMemo } from "react";
import { ArrowRight, X } from "lucide-react";

const emptyForm = {
  name: "",
  phone: "",
  guarantor: "",
  guarantorPhone: "",
  item: "",
  cost: "",
  sale: "",
  down: "",
  monthly: "",
  contractDate: "",
  firstPayDate: "",
  notes: ""
};

// دالة مساعدة لنسق الأرقام بدون فواصل
const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export function AddClientScreen({ onSave, onBack, t = {}, themeStyles = {} }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [contractFocused, setContractFocused] = useState(false);

  // تحديد هل اللغة الحالية هي الإنجليزية لمنع أي تسرب نصي
  const isEN = useMemo(() => {
    return t?.lang === "en" || (typeof document !== "undefined" && document.documentElement.lang === "en");
  }, [t]);

  const live = useMemo(() => {
    const costNum = Math.round(parseFloat(form.cost) || 0);
    const saleNum = Math.round(parseFloat(form.sale) || 0);
    const downNum = Math.round(parseFloat(form.down) || 0);
    const monthlyNum = Math.round(parseFloat(form.monthly) || 0);

    const remaining = Math.max(0, saleNum - downNum);
    const profit = saleNum - costNum;
    const installmentsCount = monthlyNum > 0 ? Math.ceil(remaining / monthlyNum) : 0;

    return { profit, remaining, installmentsCount };
  }, [form]);

  function handleContractDate(e) {
    const cDate = e.target.value;
    if (!cDate) {
      setForm((prev) => ({ ...prev, contractDate: "", firstPayDate: "" }));
      return;
    }
    const d = new Date(cDate);
    d.setMonth(d.getMonth() + 1);
    const firstPay = d.toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, contractDate: cDate, firstPayDate: firstPay }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.item || !form.cost || !form.sale || !form.contractDate) {
      setError(t.fillRequiredFieldsError || (isEN ? "Please fill all required fields and contract date!" : "يرجى ملء الحقول الأساسية وتاريخ التعاقد!"));
      return;
    }
    setError("");
    if (onSave) {
      onSave({
        ...form,
        cost: Math.round(parseFloat(form.cost) || 0),
        sale: Math.round(parseFloat(form.sale) || 0),
        down: Math.round(parseFloat(form.down) || 0),
        monthly: Math.round(parseFloat(form.monthly) || 0)
      });
    }
  }

  const inputStyle = {
    width: "100%",
    background: themeStyles.inputBg || "#1b1b1d",
    border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`,
    borderRadius: themeStyles.borderRadius || "10px",
    padding: "12px 14px",
    color: themeStyles.text || "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    boxShadow: themeStyles.inputShadow || "none",
    transition: "all 0.25s ease"
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: themeStyles.subText || "#aaaaaa"
  };

  const sectionLabelStyle = {
    fontSize: "13.5px",
    fontWeight: 800,
    color: themeStyles.accentGold || "#e07a5f",
    marginTop: "6px",
    marginBottom: "4px"
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "10px 10px 40px", fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* SHADER HEADER WITH CLOSE BUTTON */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: themeStyles.card || "#1e1e1e",
            border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`,
            color: themeStyles.accentGold || "#e8cd9c",
            padding: "8px 16px", borderRadius: themeStyles.borderRadius || "10px",
            cursor: "pointer", fontWeight: 700, fontSize: "13px"
          }}
        >
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.back || (isEN ? "Back" : "رجوع")}
        </button>

        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          {t.addClient || (isEN ? "Add New Client" : "إضافة عميل جديد")}
        </h2>

        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px",
            borderRadius: "50%",
            background: themeStyles.card || "#1e1e1e",
            border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`,
            color: themeStyles.subText || "#aaaaaa",
            cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* CARD CONTAINER */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`, borderRadius: themeStyles.borderRadius || "18px", padding: "24px", boxShadow: themeStyles.boxShadow || "none" }}>
        {error && (
          <div style={{ background: "rgba(224,122,95,0.12)", border: "1px solid rgba(224,122,95,0.5)", color: "#e8a996", borderRadius: themeStyles.borderRadius || "10px", padding: "12px 14px", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* SECTION 1: CLIENT AND GUARANTOR */}
          <div style={sectionLabelStyle}>
            {t.clientAndGuarantorInfo || (isEN ? "Client & Guarantor Information" : "بيانات العميل والضامن")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <label style={labelStyle}>
              <span>{t.clientNameLabel || (isEN ? "Client Name *" : "اسم العميل *")}</span>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t.clientNamePlaceholder || (isEN ? "Enter full client name..." : "أدخل اسم العميل ثلاثياً...")}
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.clientPhoneLabel || (isEN ? "Client Phone *" : "تليفون العميل *")}</span>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={t.clientPhonePlaceholder || "01xxxxxxxxx"}
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.guarantorNameLabel || (isEN ? "Guarantor Name" : "اسم الضامن")}</span>
              <input
                style={inputStyle}
                value={form.guarantor}
                onChange={(e) => setForm({ ...form, guarantor: e.target.value })}
                placeholder={t.guarantorNamePlaceholder || (isEN ? "Guarantor name (optional)..." : "اسم الضامن (اختياري)...")}
              />
            </label>

            <label style={labelStyle}>
              <span>{t.guarantorPhoneLabel || (isEN ? "Guarantor Phone" : "تليفون الضامن")}</span>
              <input
                style={inputStyle}
                value={form.guarantorPhone}
                onChange={(e) => setForm({ ...form, guarantorPhone: e.target.value })}
                placeholder={t.guarantorPhonePlaceholder || "01xxxxxxxxx"}
              />
            </label>
          </div>

          {/* SECTION 2: ITEM AND FINANCIALS */}
          <div style={{ ...sectionLabelStyle, paddingTop: "8px", borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
            {t.itemAndInstallmentInfo || (isEN ? "Item & Installment Details" : "بيانات السلعة والتقسيط")}
          </div>

          <div>
            <label style={labelStyle}>
              <span>{t.itemLabel || (isEN ? "Item Name *" : "السلعة *")}</span>
              <input
                style={inputStyle}
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                placeholder={t.itemPlaceholder || (isEN ? "e.g., iPhone 13 / 55-inch TV..." : "مثال: هاتف أيفون 13 / شاشة 55 بوصة...")}
                required
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <label style={labelStyle}>
              <span>{t.costPriceLabel || (isEN ? "Cost Price *" : "سعر التكلفة *")}</span>
              <input
                type="number"
                step="1"
                style={inputStyle}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0"
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.salePriceLabel || (isEN ? "Sale Price *" : "سعر البيع *")}</span>
              <input
                type="number"
                step="1"
                style={inputStyle}
                value={form.sale}
                onChange={(e) => setForm({ ...form, sale: e.target.value })}
                placeholder="0"
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.downPaymentLabel || (isEN ? "Down Payment *" : "المقدم *")}</span>
              <input
                type="number"
                step="1"
                style={inputStyle}
                value={form.down}
                onChange={(e) => setForm({ ...form, down: e.target.value })}
                placeholder="0"
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.monthlyInstallmentLabel || (isEN ? "Monthly Installment *" : "القسط الشهري *")}</span>
              <input
                type="number"
                step="1"
                style={inputStyle}
                value={form.monthly}
                onChange={(e) => setForm({ ...form, monthly: e.target.value })}
                placeholder="0"
                required
              />
            </label>
          </div>

          {/* SECTION 3: DATES AND NOTES */}
          <div style={{ ...sectionLabelStyle, paddingTop: "8px", borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
            {t.datesAndNotes || (isEN ? "Dates & Notes" : "التواريخ والملاحظات")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            <label style={labelStyle}>
              <span>{t.contractDateLabel || (isEN ? "Contract Date *" : "تاريخ التعاقد *")}</span>
              <input
                type={form.contractDate || contractFocused ? "date" : "text"}
                style={{ ...inputStyle, textAlign: "center", colorScheme: themeStyles?.isLight ? "light" : "dark" }}
                value={form.contractDate}
                onFocus={() => setContractFocused(true)}
                onBlur={(e) => { if (!e.target.value) setContractFocused(false); }}
                onChange={handleContractDate}
                placeholder={isEN ? "YYYY-MM-DD" : "سنة - شهر - يوم"}
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.firstDueDateLabel || (isEN ? "First Due Date (Auto +1 Mo)" : "تاريخ أول قسط (تلقائي + شهر)")}</span>
              <input
                type={form.firstPayDate ? "date" : "text"}
                style={{ ...inputStyle, textAlign: "center", color: "#888888", cursor: "not-allowed", colorScheme: themeStyles?.isLight ? "light" : "dark" }}
                value={form.firstPayDate}
                placeholder={isEN ? "YYYY-MM-DD" : "سنة - شهر - يوم"}
                disabled
                readOnly
              />
            </label>
          </div>

          <div>
            <label style={labelStyle}>
              <span>{t.notesLabel || (isEN ? "Notes" : "ملاحظات")}</span>
              <input
                style={inputStyle}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t.detailsPlaceholder || (isEN ? "Any additional contract notes..." : "أي ملاحظات إضافية على العقد...")}
              />
            </label>
          </div>

          {/* LIVE KPI DASHBOARD */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px", background: themeStyles.highlightBg || "rgba(224, 122, 95, 0.08)",
            border: `1px dashed ${themeStyles.accentGold || "#e07a5f"}`, borderRadius: themeStyles.borderRadius || "12px",
            padding: "16px", marginTop: "6px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", fontVariantNumeric: "tabular-nums" }}>
                {fmtCleanInt(live.profit)} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
              <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                {t.totalProfitContract || (isEN ? "Net Contract Profit" : "صافي ربح العقد")}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", fontVariantNumeric: "tabular-nums" }}>
                {fmtCleanInt(live.remaining)} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
              <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                {t.totalPortfolio || (isEN ? "Total Remaining Portfolio" : "إجمالي الأقساط المتبقية")}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", fontVariantNumeric: "tabular-nums" }}>
                {fmtCleanInt(live.installmentsCount)}
              </div>
              <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                {t.installmentCount || (isEN ? "Installments Count" : "عدد الأقساط")}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            style={{
              background: `linear-gradient(145deg, ${themeStyles.accentGold || "#e07a5f"}, ${themeStyles.accent || "#c5a028"})`,
              color: "#111111", border: "none", borderRadius: themeStyles.borderRadius || "12px",
              padding: "14px 20px", fontSize: "15px", fontWeight: 800, cursor: "pointer",
              marginTop: "6px", fontFamily: "inherit", boxShadow: themeStyles.buttonShadow || "none"
            }}
          >
            {t.saveClientBtn || (isEN ? "Save Contract & Client Cloud Data" : "حفظ بيانات العقد والعميل سحابياً")}
          </button>
        </form>

        {/* BOTTOM EXIT BUTTON */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              width: "100%", background: themeStyles.inputBg || "#1b1b1d",
              border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`,
              color: themeStyles.accentGold || "#e8cd9c",
              borderRadius: themeStyles.borderRadius || "12px",
              padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "inherit"
            }}
          >
            <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.exitBottom || (isEN ? "Exit & Return to Main Dashboard" : "خروج والعودة للشاشة الرئيسية")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClientScreen;
