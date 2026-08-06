import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { CustomDatePicker } from "./CustomDatePicker";

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

const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export function AddClientScreen({ onSave, onBack, t = {}, themeStyles = {} }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const isEN = t?.currency === "EGP";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = isEN ? "en" : "ar";
      document.documentElement.dir = isEN ? "ltr" : "rtl";
    }
  }, [isEN]);

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
      const costNum = Math.round(parseFloat(form.cost) || 0);
      const saleNum = Math.round(parseFloat(form.sale) || 0);
      const downNum = Math.round(parseFloat(form.down) || 0);
      const monthlyNum = Math.round(parseFloat(form.monthly) || 0);

      onSave({
        ...form,
        clientName: form.name,
        clientPhone: form.phone,
        itemName: form.item,
        cost: costNum,
        sale: saleNum,
        total: saleNum,
        down: downNum,
        downPayment: downNum,
        monthly: monthlyNum,
        monthlyInstallment: monthlyNum
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
    transition: "all 0.25s ease",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: themeStyles.subText || "#aaaaaa",
    boxSizing: "border-box"
  };

  const sectionLabelStyle = {
    fontSize: "13.5px",
    fontWeight: 800,
    color: themeStyles.accentGold || "#e07a5f",
    marginTop: "16px",
    marginBottom: "12px",
    borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`,
    paddingBottom: "8px"
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "10px", fontFamily: "'Cairo', 'Tajawal', sans-serif", boxSizing: "border-box" }}>
      <style>{` * { box-sizing: border-box; } `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: themeStyles.card || "#1e1e1e", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", padding: "8px 16px", borderRadius: themeStyles.borderRadius || "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.back || (isEN ? "Back" : "رجوع")}
        </button>
        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          {t.addClient || (isEN ? "Add New Client" : "إضافة عميل جديد")}
        </h2>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#1e1e1e", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText || "#aaaaaa", cursor: "pointer" }}>
          <X size={18} />
        </button>
      </div>

      {/* MAIN CARD */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`, borderRadius: themeStyles.borderRadius || "18px", padding: "24px", boxShadow: themeStyles.boxShadow || "none" }}>
        {error && (
          <div style={{ background: "rgba(224,122,95,0.12)", border: "1px solid rgba(224,122,95,0.5)", color: "#e8a996", borderRadius: themeStyles.borderRadius || "10px", padding: "12px 14px", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column" }}>
          
          {/* SECTION 1: Client Data */}
          <div style={{ ...sectionLabelStyle, marginTop: "0" }}>
            {t.clientAndGuarantorInfo || (isEN ? "Client & Guarantor Information" : "بيانات العميل والضامن")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <label style={labelStyle}>
              <span>{t.clientNameLabel || (isEN ? "Client Name *" : "اسم العميل *")}</span>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.clientNamePlaceholder || (isEN ? "Enter full client name..." : "أدخل اسم العميل ثلاثياً...")} required />
            </label>
            <label style={labelStyle}>
              <span>{t.clientPhoneLabel || (isEN ? "Client Phone *" : "تليفون العميل *")}</span>
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" required />
            </label>
            <label style={labelStyle}>
              <span>{t.guarantorNameLabel || (isEN ? "Guarantor Name" : "اسم الضامن")}</span>
              <input style={inputStyle} value={form.guarantor} onChange={(e) => setForm({ ...form, guarantor: e.target.value })} placeholder={t.guarantorNamePlaceholder || (isEN ? "Guarantor name (optional)..." : "اسم الضامن (اختياري)...")} />
            </label>
            <label style={labelStyle}>
              <span>{t.guarantorPhoneLabel || (isEN ? "Guarantor Phone" : "تليفون الضامن")}</span>
              <input style={inputStyle} value={form.guarantorPhone} onChange={(e) => setForm({ ...form, guarantorPhone: e.target.value })} placeholder="01xxxxxxxxx" />
            </label>
          </div>

          {/* SECTION 2: Item & Financials */}
          <div style={sectionLabelStyle}>
            {t.itemAndInstallmentInfo || (isEN ? "Item & Installment Details" : "بيانات السلعة والتقسيط")}
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>
              <span>{t.itemLabel || (isEN ? "Item Name *" : "السلعة *")}</span>
              <input style={inputStyle} value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder={t.itemPlaceholder || (isEN ? "e.g., iPhone 13 / 55-inch TV..." : "مثال: هاتف أيفون 13 / شاشة 55 بوصة...")} required />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
            <label style={labelStyle}>
              <span>{t.costPriceLabel || (isEN ? "Cost Price *" : "سعر التكلفة *")}</span>
              <input type="number" step="1" style={inputStyle} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" required />
            </label>
            <label style={labelStyle}>
              <span>{t.salePriceLabel || (isEN ? "Sale Price *" : "سعر البيع *")}</span>
              <input type="number" step="1" style={inputStyle} value={form.sale} onChange={(e) => setForm({ ...form, sale: e.target.value })} placeholder="0" required />
            </label>
            <label style={labelStyle}>
              <span>{t.downPaymentLabel || (isEN ? "Down Payment *" : "المقدم *")}</span>
              <input type="number" step="1" style={inputStyle} value={form.down} onChange={(e) => setForm({ ...form, down: e.target.value })} placeholder="0" required />
            </label>
            <label style={labelStyle}>
              <span>{t.monthlyInstallmentLabel || (isEN ? "Monthly Installment *" : "القسط الشهري *")}</span>
              <input type="number" step="1" style={inputStyle} value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} placeholder="0" required />
            </label>
          </div>

          {/* SECTION 3: Dates & Notes */}
          <div style={sectionLabelStyle}>
            {t.datesAndNotes || (isEN ? "Dates & Notes" : "التواريخ والملاحظات")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
            <label style={labelStyle}>
              <span>{t.contractDateLabel || (isEN ? "Contract Date *" : "تاريخ التعاقد *")}</span>
              <CustomDatePicker
                value={form.contractDate}
                onChange={handleContractDate}
                isEN={isEN}
                placeholder={isEN ? "YYYY-MM-DD" : "سنة - شهر - يوم"}
                themeStyles={themeStyles}
                inputStyle={inputStyle}
                required
              />
            </label>

            <label style={labelStyle}>
              <span>{t.firstDueDateLabel || (isEN ? "First Due Date (Auto +1 Mo)" : "تاريخ أول قسط (تلقائي + شهر)")}</span>
              <CustomDatePicker
                value={form.firstPayDate}
                isEN={isEN}
                placeholder={isEN ? "YYYY-MM-DD" : "سنة - شهر - يوم"}
                themeStyles={themeStyles}
                inputStyle={{ ...inputStyle, color: themeStyles.subText || "#888888" }}
                disabled
              />
            </label>
          </div>

          <div>
            <label style={labelStyle}>
              <span>{t.notesLabel || (isEN ? "Notes" : "ملاحظات")}</span>
              <input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t.detailsPlaceholder || (isEN ? "Any additional contract notes..." : "أي ملاحظات إضافية على العقد...")} />
            </label>
          </div>

          {/* LIVE KPI DASHBOARD */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", background: themeStyles.highlightBg || "rgba(212,175,55,0.08)", border: `1px dashed ${themeStyles.accentGold || "#d4af37"}`, borderRadius: themeStyles.borderRadius || "12px", padding: "16px", marginTop: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#d4af37", fontVariantNumeric: "tabular-nums" }}>{fmtCleanInt(live.profit)} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
              <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>{t.totalProfitContract || (isEN ? "Net Contract Profit" : "صافي ربح العقد")}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#d4af37", fontVariantNumeric: "tabular-nums" }}>{fmtCleanInt(live.remaining)} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
              <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>{t.totalPortfolio || (isEN ? "Total Remaining Portfolio" : "إجمالي الأقساط المتبقية")}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: themeStyles.accentGold || "#d4af37", fontVariantNumeric: "tabular-nums" }}>{fmtCleanInt(live.installmentsCount)}</div>
              <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>{t.installmentCount || (isEN ? "Installments Count" : "عدد الأقساط")}</div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" style={{ background: `linear-gradient(145deg, ${themeStyles.accentGold || "#e07a5f"}, ${themeStyles.accent || "#c5a028"})`, color: "#111111", border: "none", borderRadius: themeStyles.borderRadius || "12px", padding: "14px 20px", fontSize: "15px", fontWeight: 800, cursor: "pointer", marginTop: "16px", fontFamily: "inherit", boxShadow: themeStyles.buttonShadow || "none" }}>
            {t.saveClientBtn || (isEN ? "Save Contract & Client Cloud Data" : "حفظ بيانات العقد والعميل سحابياً")}
          </button>
        </form>

        {/* BOTTOM EXIT BUTTON */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}` }}>
          <button type="button" onClick={onBack} style={{ width: "100%", background: themeStyles.inputBg || "#1b1b1d", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", borderRadius: themeStyles.borderRadius || "12px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit" }}>
            <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.exitBottom || (isEN ? "Exit & Return to Main Dashboard" : "خروج والعودة للشاشة الرئيسية")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClientScreen;
