import React, { useState, useMemo } from "react";
import { ArrowRight, X, UserPlus, Calculator, Save } from "lucide-react";

const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

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
  contractDate: new Date().toISOString().split("T")[0],
  firstPayDate: "",
  notes: ""
};

export function AddClientScreen({ onSave, onBack, t = {}, styles = {}, themeStyles = {} }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const isEN = useMemo(() => {
    return t?.lang === "en" || document.documentElement.lang === "en";
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
    if (!cDate) return;
    const d = new Date(cDate);
    d.setMonth(d.getMonth() + 1);
    const firstPay = d.toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, contractDate: cDate, firstPayDate: firstPay }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.item || !form.cost || !form.sale || !form.contractDate) {
      setError(t.fillRequiredFieldsError || (isEN ? "Please fill required fields and contract date!" : "يرجى ملء الحقول الأساسية وتاريخ التعاقد!"));
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

  // Dynamic Theme Styling Object
  const dynamicStyles = {
    container: {
      maxWidth: 950,
      margin: "0 auto",
      padding: "20px",
      fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif",
      color: themeStyles.text || "#ffffff"
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: themeStyles.card || "#1e1e1e",
      border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}`,
      color: themeStyles.accentGold || "#d4af37",
      padding: "9px 18px",
      borderRadius: themeStyles.borderRadius || 12,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 13,
      boxShadow: themeStyles.buttonShadow || "none"
    },
    card: {
      background: themeStyles.card || "#1e1e1e",
      border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}`,
      borderRadius: themeStyles.borderRadius || 18,
      padding: "24px",
      boxShadow: themeStyles.boxShadow || "0 8px 20px rgba(0,0,0,0.4)"
    },
    sectionLabel: {
      gridColumn: "1 / -1",
      color: themeStyles.accentGold || "#d4af37",
      fontWeight: 800,
      fontSize: 14,
      borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}`,
      paddingBottom: 8,
      marginTop: 12
    },
    fieldLabel: {
      fontSize: 13,
      color: themeStyles.subText || "#aaaaaa",
      fontWeight: 700,
      display: "flex",
      flexDirection: "column",
      gap: 6
    },
    input: {
      width: "100%",
      background: themeStyles.inputBg || "#252525",
      border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}`,
      borderRadius: themeStyles.borderRadius || 10,
      padding: "12px 14px",
      color: themeStyles.text || "#ffffff",
      fontFamily: "inherit",
      fontSize: 14,
      fontWeight: 600,
      outline: "none",
      boxShadow: themeStyles.inputShadow || "none"
    },
    liveBox: {
      gridColumn: "1 / -1",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: 12,
      background: themeStyles.highlightBg || "rgba(212,175,55,0.08)",
      border: `1px dashed ${themeStyles.accent || "#d4af37"}`,
      borderRadius: themeStyles.borderRadius || 12,
      padding: 14,
      margin: "12px 0"
    },
    saveBtn: {
      gridColumn: "1 / -1",
      background: `linear-gradient(135deg, ${themeStyles.accentGold || "#d4af37"}, ${themeStyles.accent || "#c5a028"})`,
      color: "#111111",
      border: "none",
      borderRadius: themeStyles.borderRadius || 12,
      padding: "14px",
      fontSize: 16,
      fontWeight: 800,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      boxShadow: themeStyles.buttonShadow || "none"
    }
  };

  return (
    <div style={dynamicStyles.container}>
      {/* HEADER BAR */}
      <div style={dynamicStyles.header}>
        <button onClick={onBack} style={dynamicStyles.backBtn}>
          <ArrowRight size={16} /> {t.back || (isEN ? "Back" : "رجوع")}
        </button>
        <h2 style={{ color: themeStyles.accentGold || "#d4af37", margin: 0, fontSize: 20, fontWeight: 800 }}>
          {t.addClient || (isEN ? "Add New Client" : "إضافة عميل جديد")}
        </h2>
      </div>

      <div style={dynamicStyles.card}>
        {error && (
          <div style={{ background: "rgba(224,122,95,0.15)", border: "1px solid #e07a5f", color: "#e07a5f", padding: 12, borderRadius: themeStyles.borderRadius || 10, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {/* CLIENT & GUARANTOR SECTION */}
          <div style={dynamicStyles.sectionLabel}>
            {t.clientAndGuarantorInfo || (isEN ? "Client & Guarantor Information" : "بيانات العميل والضامن")}
          </div>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.clientNameLabel || (isEN ? "Client Name *" : "اسم العميل *")}</span>
            <input
              style={dynamicStyles.input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.clientNamePlaceholder || (isEN ? "Enter full client name..." : "أدخل اسم العميل ثلاثياً...")}
              required
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.clientPhoneLabel || (isEN ? "Client Phone *" : "تليفون العميل *")}</span>
            <input
              style={dynamicStyles.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t.clientPhonePlaceholder || "01xxxxxxxxx"}
              required
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.guarantorNameLabel || (isEN ? "Guarantor Name" : "اسم الضامن")}</span>
            <input
              style={dynamicStyles.input}
              value={form.guarantor}
              onChange={(e) => setForm({ ...form, guarantor: e.target.value })}
              placeholder={t.guarantorNamePlaceholder || (isEN ? "Guarantor name (optional)..." : "اسم الضامن (اختياري)...")}
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.guarantorPhoneLabel || (isEN ? "Guarantor Phone" : "تليفون الضامن")}</span>
            <input
              style={dynamicStyles.input}
              value={form.guarantorPhone}
              onChange={(e) => setForm({ ...form, guarantorPhone: e.target.value })}
              placeholder={t.guarantorPhonePlaceholder || "01xxxxxxxxx"}
            />
          </label>

          {/* ITEM & FINANCIAL DETAILS SECTION */}
          <div style={dynamicStyles.sectionLabel}>
            {t.itemAndInstallmentInfo || (isEN ? "Item & Installment Details" : "بيانات السلعة والتقسيط")}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={dynamicStyles.fieldLabel}>
              <span>{t.itemLabel || (isEN ? "Item *" : "السلعة *")}</span>
              <input
                style={dynamicStyles.input}
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                placeholder={t.itemPlaceholder || (isEN ? "e.g., iPhone 13 / 55-inch TV..." : "مثال: هاتف أيفون 13 / شاشة 55 بوصة...")}
                required
              />
            </label>
          </div>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.costPriceLabel || (isEN ? "Cost Price *" : "سعر التكلفة *")}</span>
            <input
              type="number"
              step="1"
              style={dynamicStyles.input}
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.salePriceLabel || (isEN ? "Sale Price *" : "سعر البيع *")}</span>
            <input
              type="number"
              step="1"
              style={dynamicStyles.input}
              value={form.sale}
              onChange={(e) => setForm({ ...form, sale: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.downPaymentLabel || (isEN ? "Down Payment *" : "المقدم *")}</span>
            <input
              type="number"
              step="1"
              style={dynamicStyles.input}
              value={form.down}
              onChange={(e) => setForm({ ...form, down: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.monthlyInstallmentLabel || (isEN ? "Monthly Installment *" : "القسط الشهري *")}</span>
            <input
              type="number"
              step="1"
              style={dynamicStyles.input}
              value={form.monthly}
              onChange={(e) => setForm({ ...form, monthly: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          {/* DATES & NOTES SECTION */}
          <div style={dynamicStyles.sectionLabel}>
            {t.datesAndNotes || (isEN ? "Dates & Notes" : "التواريخ والملاحظات")}
          </div>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.contractDateLabel || (isEN ? "Contract Date *" : "تاريخ التعاقد *")}</span>
            <input
              type="date"
              style={dynamicStyles.input}
              value={form.contractDate}
              onChange={handleContractDate}
              required
            />
          </label>

          <label style={dynamicStyles.fieldLabel}>
            <span>{t.firstDueDateLabel || (isEN ? "First Due Date (Auto +1 Mo)" : "تاريخ أول قسط (تلقائي + شهر)")}</span>
            <input
              type="date"
              style={{ ...dynamicStyles.input, color: themeStyles.subText || "#888888" }}
              value={form.firstPayDate}
              disabled
              readOnly
            />
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={dynamicStyles.fieldLabel}>
              <span>{t.notesLabel || (isEN ? "Notes" : "ملاحظات")}</span>
              <input
                style={dynamicStyles.input}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t.detailsPlaceholder || (isEN ? "Any additional contract notes..." : "أي ملاحظات إضافية على العقد...")}
              />
            </label>
          </div>

          {/* LIVE COMPUTED STATS BAR */}
          <div style={dynamicStyles.liveBox}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" }}>
                {fmtCleanInt(live.profit)} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
              <div style={{ fontSize: 12, color: themeStyles.subText || "#aaa", marginTop: 4 }}>
                {t.totalProfitContract || (isEN ? "Net Contract Profit" : "صافي ربح العقد")}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" }}>
                {fmtCleanInt(live.remaining)} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
              <div style={{ fontSize: 12, color: themeStyles.subText || "#aaa", marginTop: 4 }}>
                {t.totalPortfolio || (isEN ? "Total Remaining Portfolio" : "إجمالي المتبقي للتقسيط")}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" }}>
                {fmtCleanInt(live.installmentsCount)}
              </div>
              <div style={{ fontSize: 12, color: themeStyles.subText || "#aaa", marginTop: 4 }}>
                {t.installmentCount || (isEN ? "Installments Count" : "عدد الأقساط")}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button type="submit" style={dynamicStyles.saveBtn}>
            <Save size={18} />
            <span>{t.saveClientBtn || (isEN ? "Save Contract & Client Cloud Data" : "حفظ بيانات العقد والعميل سحابياً")}</span>
          </button>
        </form>

        {/* BOTTOM EXIT BUTTON */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}` }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              width: "100%",
              background: themeStyles.inputBg || "#252525",
              border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}`,
              color: themeStyles.accentGold || "#d4af37",
              borderRadius: themeStyles.borderRadius || 12,
              padding: "12px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <ArrowRight size={16} /> {t.exitBottom || (isEN ? "Exit to Main Dashboard" : "رجوع للشاشة الرئيسية")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClientScreen;
