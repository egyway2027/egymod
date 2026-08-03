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

  // 1. تحديد العقد الحالي المختار من مصفوفة العقود السحابية
  const selectedContract = useMemo(() => {
    return contracts.find((c) => String(c.id) === String(selectedId)) || null;
  }, [contracts, selectedId]);

  // 2. إعداد الصفوف للعرض في قائمة البحث والجدول
  const rows = useMemo(() => {
    return contracts.map((c) => {
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
        totalPaid: paidVal,
        remaining: Number(c.remainingAmount ?? c.remaining ?? remCalc),
        monthly: Number(c.monthlyInstallment ?? c.monthly ?? 0),
        sale: saleVal,
        down: downVal
      };
    });
  }, [contracts]);

  const activeSelectedRow = rows.find((r) => String(r.id) === String(selectedId)) || null;

  // جميع المدفوعات المسجلة عبر كل العقود
  const allPayments = useMemo(() => {
    return contracts.flatMap((c) => c.payments || []);
  }, [contracts]);

  // 3. إضافة عملية السداد وتحديث خانة المسدد والمتبقي في العقد
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;

    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    // حساب المسدد والمتبقي الجديد لملف العميل
    const previousPaid = Number(selectedContract.totalPaid ?? selectedContract.total_paid ?? 0);
    const newTotalPaid = previousPaid + numAmount;

    const totalPrice = Number(selectedContract.salePrice ?? selectedContract.sale ?? 0);
    const downPayment = Number(selectedContract.downPayment ?? selectedContract.down ?? 0);
    const newRemaining = Math.max(0, totalPrice - downPayment - newTotalPaid);

    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    // عنصر السداد الجديد
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

    // تجهيز العقد بنفس الهيكل الأصلي
    const updatedContract = {
      ...selectedContract,
      totalPaid: newTotalPaid,
      total_paid: newTotalPaid,
      remainingAmount: newRemaining,
      remaining: newRemaining,
      payments: [...(selectedContract.payments || []), newPaymentRecord]
    };

    // إرسال العقد للتحديث السحابي المباشر
    if (onUpdateContract) {
      await onUpdateContract(updatedContract);
    }

    setActiveReceipt({
      client: updatedContract,
      payment: newPaymentRecord
    });
    setAmount("");
  };

  // 4. حذف السداد وإعادة تجميع المسدد والمتبقي
  const handleDeletePayment = async (paymentId) => {
    if (!selectedContract) return;

    const targetPayment = (selectedContract.payments || []).find((p) => String(p.id) === String(paymentId));
    if (!targetPayment) return;

    const payAmt = Number(targetPayment.amount || 0);
    const updatedPayments = (selectedContract.payments || []).filter((p) => String(p.id) !== String(paymentId));

    const previousPaid = Number(selectedContract.totalPaid ?? selectedContract.total_paid ?? 0);
    const newTotalPaid = Math.max(0, previousPaid - payAmt);

    const totalPrice = Number(selectedContract.salePrice ?? selectedContract.sale ?? 0);
    const downPayment = Number(selectedContract.downPayment ?? selectedContract.down ?? 0);
    const newRemaining = Math.max(0, totalPrice - downPayment - newTotalPaid);

    const updatedContract = {
      ...selectedContract,
      totalPaid: newTotalPaid,
      total_paid: newTotalPaid,
      remainingAmount: newRemaining,
      remaining: newRemaining,
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
