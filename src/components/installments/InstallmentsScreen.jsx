import React, { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { ScreenHeader, BottomExitButton } from "../CommonUI";
import CustomerSearchHeader from "./CustomerSearchHeader";
import InstallmentsTable, { AllPaymentsRegisterModal } from "./InstallmentsTable";
import PaymentModal from "./PaymentModal";

export default function InstallmentsScreen({
  contracts = [],
  onUpdateContract,
  onBack,
  t = {},
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

  // 1️⃣ توحيد قراءة وتنسيق بيانات العملاء كما في ملف المشروع الرئيسي
  const rows = useMemo(() => {
    return (contracts || []).map((c) => {
      const saleVal = Number(c.salePrice ?? c.sale ?? 0);
      const downVal = Number(c.downPayment ?? c.down ?? 0);
      const paidVal = Number(c.totalPaid ?? c.total_paid ?? 0);
      const remCalc = Math.max(0, saleVal - downVal - paidVal);

      return {
        ...c,
        id: c.id,
        name: c.clientName || c.name || "عميل بدون اسم",
        phone: c.clientPhone || c.phone || "",
        item: c.itemName || c.item || "",
        remaining: Number(c.remainingAmount ?? c.remaining ?? remCalc),
        monthly: Number(c.monthlyInstallment ?? c.monthly ?? 0),
        sale: saleVal,
        down: downVal,
        totalPaid: paidVal,
        payments: c.payments || []
      };
    });
  }, [contracts]);

  // متابعة العميل المحدد وتحديث بياناته فورياً عند التحديث السحابي
  const activeSelected = useMemo(() => {
    if (!selected) return null;
    return rows.find((r) => String(r.id) === String(selected.id)) || selected;
  }, [rows, selected]);

  // تجميع كافة المدفوعات من جميع العقود
  const allPayments = useMemo(() => {
    return (contracts || []).flatMap((c) => 
      (c.payments || []).map((p) => ({
        ...p,
        clientId: String(p.clientId || c.id),
        clientName: p.clientName || c.clientName || c.name || "عميل",
        item: p.item || c.itemName || c.item || ""
      }))
    );
  }, [contracts]);

  // 2️⃣ دالة حفظ السداد وإرسال التحديث لـ handleUpdateContract
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    const numAmount = Math.round(parseFloat(amount) || 0);
    if (!activeSelected || numAmount <= 0) return;

    const currentRemaining = Number(activeSelected.remaining || 0);
    const newRemaining = Math.max(0, currentRemaining - numAmount);
    const newTotalPaid = Math.round(Number(activeSelected.totalPaid || 0) + numAmount);
    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    const newPaymentRecord = {
      id: String(Date.now()),
      clientId: String(activeSelected.id),
      clientName: activeSelected.name,
      item: activeSelected.item,
      amount: numAmount,
      remainingAfter: newRemaining,
      payDate: paymentDateStr,
      method: method || "نقداً / كاش",
      collector: collector || "المشرف"
    };

    const existingPayments = Array.isArray(activeSelected.payments) ? activeSelected.payments : [];
    const updatedPayments = [...existingPayments, newPaymentRecord];

    // الهيكل المطابق تماماً لقاعدة بيانات المشروع
    const updatedContract = {
      ...activeSelected,
      remainingAmount: newRemaining,
      remaining: newRemaining,
      totalPaid: newTotalPaid,
      total_paid: newTotalPaid,
      payments: updatedPayments
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContract);
    }

    setActiveReceipt({
      client: { ...activeSelected, totalPaid: newTotalPaid, remaining: newRemaining },
      payment: newPaymentRecord
    });
    setAmount("");
  };

  // 3️⃣ دالة حذف الدفعة وتعديل الرصيد بالسحابة
  const handleDeletePayment = async (paymentId, clientId, payAmount) => {
    const client = contracts.find((c) => String(c.id) === String(clientId));
    if (!client) return;

    const numAmount = Math.round(Number(payAmount) || 0);
    const existingPayments = Array.isArray(client.payments) ? client.payments : [];
    const updatedPayments = existingPayments.filter((p) => String(p.id) !== String(paymentId));
    
    const currentRemaining = Number(client.remainingAmount ?? client.remaining ?? 0);
    const newRemaining = currentRemaining + numAmount;
    const newTotalPaid = Math.max(0, Number(client.totalPaid ?? client.total_paid ?? 0) - numAmount);

    if (onUpdateContract) {
      await onUpdateContract({
        ...client,
        remainingAmount: newRemaining,
        remaining: newRemaining,
        totalPaid: newTotalPaid,
        total_paid: newTotalPaid,
        payments: updatedPayments
      });
    }
  };

  const clientPayments = activeSelected
    ? (activeSelected.payments || [])
    : [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <ScreenHeader title={t.pay || (isEN ? "Pay Installments" : "سداد الأقساط")} onBack={onBack} t={t} />

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
            gap: 8
          }}
        >
          <FileText size={18} /> [ 🧾 {t.openAllPaymentsRegister || (isEN ? "Open All Clients Payment Register" : "فتح سجل السداد الشامل لجميع العملاء")} ]
        </button>
      </div>

      <div style={{ background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 18, padding: 22 }}>
        <CustomerSearchHeader
          rows={rows}
          selected={activeSelected}
          setSelected={setSelected}
          amount={amount}
          setAmount={setAmount}
          payDate={payDate}
          setPayDate={setPayDate}
          method={method}
          setMethod={setMethod}
          collector={collector}
          setCollector={setCollector}
          employees={[]}
          onSubmitPayment={handlePaySubmit}
          t={t}
          themeStyles={themeStyles}
        />

        <InstallmentsTable
          selected={activeSelected}
          clientPayments={clientPayments}
          onShowReceipt={(client, payment) => setActiveReceipt({ client, payment })}
          onDeletePayment={handleDeletePayment}
          t={t}
          themeStyles={themeStyles}
        />

        <BottomExitButton onBack={onBack} t={t} />
      </div>

      {activeReceipt && (
        <PaymentModal
          receipt={activeReceipt}
          storeInfo={{ name: "إيجيمود لإدارة الأقساط" }}
          onClose={() => setActiveReceipt(null)}
          themeStyles={themeStyles}
          t={t}
        />
      )}

      {showAllPayments && (
        <AllPaymentsRegisterModal
          payments={allPayments}
          storeInfo={{ name: "إيجيمود لإدارة الأقساط" }}
          onClose={() => setShowAllPayments(false)}
          t={t}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}
