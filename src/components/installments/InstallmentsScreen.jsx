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
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("نقداً / كاش");
  const [collector, setCollector] = useState("المشرف");

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // 1️⃣ العقد المحدد من قائمة السحابة الأصلية
  const selectedContract = useMemo(() => {
    return contracts.find((c) => String(c.id) === String(selectedId)) || null;
  }, [contracts, selectedId]);

  // 2️⃣ تجهيز البيانات للعرض بالواجهة بناءً على حقول جدول contracts الفعلي
  const rows = useMemo(() => {
    return contracts.map((c) => {
      const saleVal = Number(c.sale || 0);
      const downVal = Number(c.down || 0);
      const paidVal = Number(c.paidAmount ?? c.paid_amount ?? c.totalPaid ?? 0);
      const remVal = Number(c.remainingAmount ?? (saleVal - downVal - paidVal));

      return {
        ...c,
        id: c.id,
        name: c.name || c.clientName || "عميل بدون اسم",
        phone: c.phone || c.clientPhone || "",
        item: c.item || c.itemName || "",
        sale: saleVal,
        down: downVal,
        monthly: Number(c.monthly || 0),
        paidAmount: paidVal,
        totalPaid: paidVal,
        remainingAmount: remVal,
        remaining: remVal,
        payments: Array.isArray(c.payments) ? c.payments : []
      };
    });
  }, [contracts]);

  const activeSelectedRow = rows.find((r) => String(r.id) === String(selectedId)) || null;

  // جميع المدفوعات المسجلة عبر كل العقود
  const allPayments = useMemo(() => {
    return contracts.flatMap((c) => {
      const payArr = Array.isArray(c.payments) ? c.payments : [];
      return payArr.map((p) => ({
        ...p,
        clientId: String(p.clientId || c.id),
        clientName: p.clientName || c.name || "",
        item: p.item || c.item || ""
      }));
    });
  }, [contracts]);

  // 3️⃣ إضافة عملية السداد وتحديث خانتي paidAmount و remainingAmount بالسحابة
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;

    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    // الحسابات المباشرة
    const prevPaid = Number(selectedContract.paidAmount ?? selectedContract.totalPaid ?? 0);
    const newPaid = prevPaid + numAmount;

    const totalPrice = Number(selectedContract.sale || 0);
    const downPrice = Number(selectedContract.down || 0);
    const newRemaining = Math.max(0, totalPrice - downPrice - newPaid);

    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    const newPaymentRecord = {
      id: String(Date.now()),
      clientId: String(selectedContract.id),
      clientName: selectedContract.name || "",
      item: selectedContract.item || "",
      amount: numAmount,
      remainingAfter: newRemaining,
      payDate: paymentDateStr,
      method,
      collector
    };

    const existingPayments = Array.isArray(selectedContract.payments) ? selectedContract.payments : [];

    // كائن العقد المحدث بهياكل الحقول الحقيقية للسحابة
    const updatedContract = {
      ...selectedContract,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      payments: [...existingPayments, newPaymentRecord]
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContract);
    }

    setActiveReceipt({
      client: updatedContract,
      payment: newPaymentRecord
    });
    setAmount("");
  };

  // 4️⃣ حذف دفعة سداد وإعادة احتساب المبالغ
  const handleDeletePayment = async (paymentId) => {
    if (!selectedContract) return;

    const existingPayments = Array.isArray(selectedContract.payments) ? selectedContract.payments : [];
    const targetPayment = existingPayments.find((p) => String(p.id) === String(paymentId));
    if (!targetPayment) return;

    const payAmt = Number(targetPayment.amount || 0);
    const updatedPayments = existingPayments.filter((p) => String(p.id) !== String(paymentId));

    const prevPaid = Number(selectedContract.paidAmount ?? selectedContract.totalPaid ?? 0);
    const newPaid = Math.max(0, prevPaid - payAmt);

    const totalPrice = Number(selectedContract.sale || 0);
    const downPrice = Number(selectedContract.down || 0);
    const newRemaining = Math.max(0, totalPrice - downPrice - newPaid);

    const updatedContract = {
      ...selectedContract,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
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
