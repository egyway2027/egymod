import React, { useState } from "react";
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
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("نقداً / كاش");
  const [collector, setCollector] = useState("المشرف");

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // 1️⃣ العقد الأصلي المحدد مباشرة من قائمة السحابة
  const selectedContract = contracts.find((c) => String(c.id) === String(selectedId)) || null;

  // 2️⃣ صفوف الجدول والعرض
  const rows = contracts.map((c) => ({
    ...c,
    name: c.clientName || c.name || "",
    phone: c.clientPhone || c.phone || "",
    item: c.itemName || c.item || "",
    remaining: Number(c.remainingAmount ?? c.remaining ?? 0),
    monthly: Number(c.monthlyInstallment ?? c.monthly ?? 0),
    sale: Number(c.salePrice ?? c.sale ?? 0),
    down: Number(c.downPayment ?? c.down ?? 0),
    totalPaid: Number(c.totalPaid ?? 0)
  }));

  const activeSelectedRow = rows.find((r) => String(r.id) === String(selectedId)) || null;
  const allPayments = contracts.flatMap((c) => c.payments || []);

  // 3️⃣ دالة تنفيذ السداد المربوطة بـ handleUpdateContract
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;

    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    const currentRemaining = Number(selectedContract.remainingAmount ?? selectedContract.remaining ?? 0);
    const newRemaining = Math.max(0, currentRemaining - numAmount);
    const newTotalPaid = Math.round(Number(selectedContract.totalPaid || 0) + numAmount);
    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    const newPaymentRecord = {
      id: String(Date.now()),
      clientId: String(selectedContract.id),
      clientName: selectedContract.clientName || selectedContract.name || "",
      item: selectedContract.itemName || selectedContract.item || "",
      amount: numAmount,
      remainingAfter: newRemaining,
      payDate: paymentDateStr,
      method,
      collector
    };

    // كائن العقد الجديد المحدث بالكامل
    const updatedContract = {
      ...selectedContract,
      remainingAmount: newRemaining,
      remaining: newRemaining,
      totalPaid: newTotalPaid,
      payments: [...(selectedContract.payments || []), newPaymentRecord]
    };

    if (onUpdateContract) {
      const res = await onUpdateContract(updatedContract);
      if (res?.success) {
        setActiveReceipt({
          client: res.contract || updatedContract,
          payment: newPaymentRecord
        });
        setAmount("");
      }
    }
  };

  // 4️⃣ دالة حذف دفعة سداد
  const handleDeletePayment = async (paymentId) => {
    if (!selectedContract) return;

    const targetPayment = (selectedContract.payments || []).find((p) => String(p.id) === String(paymentId));
    if (!targetPayment) return;

    const payAmt = Number(targetPayment.amount || 0);
    const updatedPayments = (selectedContract.payments || []).filter((p) => String(p.id) !== String(paymentId));
    
    const currentRemaining = Number(selectedContract.remainingAmount ?? selectedContract.remaining ?? 0);
    const newRemaining = currentRemaining + payAmt;
    const newTotalPaid = Math.max(0, Number(selectedContract.totalPaid || 0) - payAmt);

    const updatedContract = {
      ...selectedContract,
      remainingAmount: newRemaining,
      remaining: newRemaining,
      totalPaid: newTotalPaid,
      payments: updatedPayments
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContract);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <ScreenHeader title={t.pay || "سداد الأقساط"} onBack={onBack} t={t} />

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
          <FileText size={18} /> [ 🧾 فتح سجل السداد الشامل لجميع العملاء ]
        </button>
      </div>

      <div style={{ background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 18, padding: 22 }}>
        <CustomerSearchHeader
          rows={rows}
          selected={activeSelectedRow}
          setSelected={(val) => setSelectedId(val ? val.id : "")}
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
          selected={activeSelectedRow}
          clientPayments={selectedContract?.payments || []}
          onShowReceipt={(client, payment) => setActiveReceipt({ client, payment })}
          onDeletePayment={(paymentId) => handleDeletePayment(paymentId)}
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
