import React, { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { ScreenHeader, BottomExitButton } from "../CommonUI";
import CustomerSearchHeader from "./CustomerSearchHeader";
import InstallmentsTable, { AllPaymentsRegisterModal } from "./InstallmentsTable";
import PaymentModal from "./PaymentModal";

export default function InstallmentsScreen({
  contracts = [],
  onPay, // دالة addPayment القادمة من useCloudData
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

  const selectedContract = useMemo(() => {
    return contracts.find((c) => String(c.id) === String(selectedId)) || null;
  }, [contracts, selectedId]);

  const rows = useMemo(() => {
    return contracts.map((c) => ({
      ...c,
      id: c.id,
      name: c.clientName || c.name || "عميل بدون اسم",
      phone: c.clientPhone || c.phone || "",
      item: c.itemName || c.item || "",
      sale: Number(c.sale || c.total || 0),
      down: Number(c.down || c.downPayment || 0),
      monthly: Number(c.monthly || c.monthlyInstallment || 0),
      paidAmount: Number(c.paidAmount || c.totalPaid || 0),
      remainingAmount: Number(c.remainingAmount || c.remaining || 0),
      payments: Array.isArray(c.payments) ? c.payments : []
    }));
  }, [contracts]);

  const activeSelectedRow = rows.find((r) => String(r.id) === String(selectedId)) || null;

  const handlePaySubmit = async (e) => {
  e.preventDefault();
  if (!selectedContract) return;

  const numAmount = Math.round(parseFloat(amount) || 0);
  if (numAmount <= 0) return;

  if (onPay) {
    const res = await onPay({
      contractId: selectedContract.id,
      amount: numAmount,
      payDate,
      method,
      collector
    });

    if (res?.success) {
      const currentPaid = Number(activeSelectedRow?.paidAmount || activeSelectedRow?.totalPaid || 0);
      const sale = Number(activeSelectedRow?.sale || activeSelectedRow?.total || 0);
      const down = Number(activeSelectedRow?.down || activeSelectedRow?.downPayment || 0);

      const newPaid = currentPaid + numAmount;
      const newRem = Math.max(0, sale - down - newPaid);

      // 🎯 فتح نافذة الإيصال فوراً ببيانات دقيقة ومكتملة
      setActiveReceipt({
        client: {
          ...activeSelectedRow,
          clientName: activeSelectedRow?.name || activeSelectedRow?.clientName,
          itemName: activeSelectedRow?.item || activeSelectedRow?.itemName,
          totalPaid: newPaid,
          paidAmount: newPaid,
          remaining: newRem,
          remainingAmount: newRem,
          sale,
          down
        },
        payment: {
          amount: numAmount,
          payDate,
          date: payDate,
          method,
          collector,
          remainingAfter: newRem
        }
      });

      setAmount("");
    }
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

      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: 18, padding: 22 }}>
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
          payments={rows.flatMap((r) => r.payments || [])}
          storeInfo={{ name: "إيجيمود لإدارة الأقساط" }}
          onClose={() => setShowAllPayments(false)}
          t={t}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}
