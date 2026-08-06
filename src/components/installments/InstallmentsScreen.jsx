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

  // 1️⃣ العقد الأصلي المحدد من القائمة
  const selectedContract = useMemo(() => {
    return contracts.find((c) => String(c.id) === String(selectedId)) || null;
  }, [contracts, selectedId]);

  // 2️⃣ تطبيع صفوف العرض بالواجهة لتدعم الهيكلة الجداول الجديدة والقديمة
  const rows = useMemo(() => {
    return contracts.map((c) => {
      const saleVal = Number(c.total ?? c.sale ?? c.sale_price ?? 0);
      const downVal = Number(c.down_payment ?? c.down ?? 0);

      const rawPayments = Array.isArray(c.payments)
        ? c.payments
        : Array.isArray(c.installments)
        ? c.installments.filter((i) => i.is_paid || i.paid)
        : [];

      const paidVal = Number(
        c.paidAmount ??
          c.paid_amount ??
          c.totalPaid ??
          rawPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      );

      const remVal = Math.max(0, saleVal - downVal - paidVal);

      return {
        ...c,
        id: c.id,
        name: c.clientName || c.client_name || c.name || "عميل بدون اسم",
        phone: c.clientPhone || c.client_phone || c.phone || "",
        item: c.item_name || c.itemName || c.item || "",
        sale: saleVal,
        down: downVal,
        monthly: Number(c.monthly_installment ?? c.monthlyInstallment ?? c.monthly ?? 0),
        paidAmount: paidVal,
        totalPaid: paidVal,
        remainingAmount: remVal,
        remaining: remVal,
        payments: rawPayments
      };
    });
  }, [contracts]);

  const activeSelectedRow = rows.find((r) => String(r.id) === String(selectedId)) || null;

  // 3️⃣ تجميع كافّة الدفعات للتقرير الشامل
  const allPayments = useMemo(() => {
    return rows.flatMap((r) => {
      const payArr = Array.isArray(r.payments) ? r.payments : [];
      return payArr.map((p) => ({
        ...p,
        clientId: String(p.clientId || p.contract_id || r.id),
        clientName: p.clientName || r.name || "",
        item: p.item || r.item || ""
      }));
    });
  }, [rows]);

  // 4️⃣ عملية السداد المحدثة
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;

    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    const activeRow = activeSelectedRow || {};
    const prevPaid = Number(activeRow.paidAmount || 0);
    const newPaid = prevPaid + numAmount;
    const newRemaining = Math.max(0, Number(activeRow.sale || 0) - Number(activeRow.down || 0) - newPaid);

    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    const newPaymentRecord = {
      id: String(Date.now()),
      contract_id: selectedContract.id,
      clientId: String(selectedContract.id),
      clientName: activeRow.name,
      item: activeRow.item,
      amount: numAmount,
      remainingAfter: newRemaining,
      payDate: paymentDateStr,
      due_date: paymentDateStr,
      is_paid: true,
      method,
      collector
    };

    const existingPayments = Array.isArray(activeRow.payments) ? activeRow.payments : [];
    const updatedPaymentsList = [...existingPayments, newPaymentRecord];

    const updatedContractPayload = {
      ...selectedContract,
      id: selectedContract.id,
      totalPaid: newPaid,
      paidAmount: newPaid,
      paid_amount: newPaid,
      remainingAmount: newRemaining,
      remaining: newRemaining,
      payments: updatedPaymentsList
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContractPayload);
    }

    setActiveReceipt({
      client: {
        ...updatedContractPayload,
        name: activeRow.name,
        phone: activeRow.phone,
        item: activeRow.item,
        totalPaid: newPaid,
        remaining: newRemaining
      },
      payment: newPaymentRecord
    });

    setAmount("");
  };

  // 5️⃣ حذف الدفعة
  const handleDeletePayment = async (paymentId) => {
    if (!selectedContract || !activeSelectedRow) return;

    const existingPayments = Array.isArray(activeSelectedRow.payments) ? activeSelectedRow.payments : [];
    const targetPayment = existingPayments.find((p) => String(p.id) === String(paymentId));
    if (!targetPayment) return;

    const payAmt = Number(targetPayment.amount || 0);
    const prevPaid = Number(activeSelectedRow.paidAmount || 0);
    const newPaid = Math.max(0, prevPaid - payAmt);
    const newRemaining = Math.max(0, Number(activeSelectedRow.sale || 0) - Number(activeSelectedRow.down || 0) - newPaid);

    const updatedPaymentsList = existingPayments.filter((p) => String(p.id) !== String(paymentId));

    const updatedContractPayload = {
      ...selectedContract,
      id: selectedContract.id,
      totalPaid: newPaid,
      paidAmount: newPaid,
      paid_amount: newPaid,
      remainingAmount: newRemaining,
      remaining: newRemaining,
      payments: updatedPaymentsList
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContractPayload);
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
          clientPayments={activeSelectedRow?.payments || []}
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
