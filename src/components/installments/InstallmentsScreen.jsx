import React, { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { ScreenHeader, BottomExitButton } from "../CommonUI";
import CustomerSearchHeader from "./CustomerSearchHeader";
import InstallmentsTable, { AllPaymentsRegisterModal } from "./InstallmentsTable";
import PaymentModal from "./PaymentModal";

export default function InstallmentsScreen({
  rows = [],
  payments = [],
  employees = [],
  storeInfo = {},
  onPay,
  onDeletePayment,
  onBack,
  t = {},
  styles = {},
  themeStyles = {}
}) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("نقداً / كاش");
  const [collector, setCollector] = useState("المشرف");

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);

  const isEN = useMemo(() => {
    return t?.lang === "en" || document.documentElement?.lang === "en";
  }, [t]);

  const numAmount = parseFloat(amount) || 0;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selected || numAmount <= 0) return;
    const cleanAmount = Math.round(numAmount);
    
    if (onPay) {
      const ok = await onPay(selected.id, cleanAmount, payDate, method, collector);
      if (ok) {
        // تجهيز الإيصال للعرض الفوري
        const remainingBefore = Number(selected.sale || 0) - Number(selected.down || 0) - Number(selected.totalPaid || 0);
        const remainingAfter = Math.max(0, remainingBefore - cleanAmount);
        
        setActiveReceipt({
          client: selected,
          payment: {
            amount: cleanAmount,
            payDate,
            method,
            collector,
            remainingAfter
          }
        });
        setAmount("");
      }
    }
  };

  const clientPayments = selected ? (payments || []).filter(p => String(p.clientId) === String(selected.id)) : [];

  return (
    <div style={styles.container || { maxWidth: 1100, margin: "0 auto" }}>
      <ScreenHeader
        title={t.pay || (isEN ? "Pay Installments" : "سداد الأقساط")}
        onBack={onBack}
        styles={styles}
        t={t}
      />

      {/* زر فتح سجل السداد الشامل العلوي */}
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setShowAllPayments(true)}
          style={{
            width: "100%",
            background: `linear-gradient(145deg, ${themeStyles.accentGold || "#d4af37"}, ${themeStyles.accent || "#c5a028"})`,
            color: "#111111",
            border: "none",
            borderRadius: themeStyles.borderRadius || 12,
            padding: "14px",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: themeStyles.buttonShadow || "0 4px 12px rgba(0,0,0,0.3)"
          }}
        >
          <FileText size={18} /> [ 🧾 {t.openAllPaymentsRegister || (isEN ? "Open All Clients Payment Register" : "فتح سجل السداد الشامل لجميع العملاء")} ]
        </button>
      </div>

      <div style={styles.card || { background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 18, padding: 22 }}>
        {/* المكون الأول: حقول البحث والإدخال والمؤشرات */}
        <CustomerSearchHeader
          rows={rows}
          selected={selected}
          setSelected={setSelected}
          amount={amount}
          setAmount={setAmount}
          payDate={payDate}
          setPayDate={setPayDate}
          method={method}
          setMethod={setMethod}
          collector={collector}
          setCollector={setCollector}
          employees={employees}
          onSubmitPayment={handleSubmitPayment}
          t={t}
          styles={styles}
          themeStyles={themeStyles}
        />

        {/* المكون الثاني: جدول تاريخ السداد الخاص بالعقد المختار */}
        <InstallmentsTable
          selected={selected}
          clientPayments={clientPayments}
          onShowReceipt={(client, payment) => setActiveReceipt({ client, payment })}
          onDeletePayment={onDeletePayment}
          t={t}
          themeStyles={themeStyles}
        />

        <BottomExitButton onBack={onBack} styles={styles} t={t} />
      </div>

      {/* المكون الثالث: نافذة إيصال القسط */}
      {activeReceipt && (
        <PaymentModal
          receipt={activeReceipt}
          storeInfo={storeInfo}
          onClose={() => setActiveReceipt(null)}
          themeStyles={themeStyles}
          t={t}
        />
      )}

      {/* سجل السداد الشامل لجميع العملاء */}
      {showAllPayments && (
        <AllPaymentsRegisterModal
          payments={payments}
          storeInfo={storeInfo}
          onClose={() => setShowAllPayments(false)}
          t={t}
          styles={styles}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}
