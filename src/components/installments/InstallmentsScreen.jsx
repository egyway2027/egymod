import React, { useState, useEffect, useMemo } from "react";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "../../utils";
import { ScreenHeader, BottomExitButton } from "../CommonUI";
import CustomerSearchHeader from "./CustomerSearchHeader";
import InstallmentsTable, { AllPaymentsRegisterModal } from "./InstallmentsTable";
import PaymentModal from "./PaymentModal";

export default function InstallmentsScreen({
  onBack,
  t = {},
  themeStyles = {}
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [storeInfo] = useState({ name: "إيجيمود لإدارة الأقساط" });

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

  // 🌐 1. جلب البيانات المباشر الخاص بشاشة السداد فقط من السحابة
  const fetchCloudData = async () => {
    setLoading(true);
    try {
      const { data: clientsData } = await supabase.from("clients").select("*");
      const { data: paymentsData } = await supabase.from("payments").select("*");
      const { data: empData } = await supabase.from("employees").select("*");

      if (clientsData) {
        const formatted = clientsData.map((c) => {
          const saleVal = Number(c.salePrice ?? c.sale ?? 0);
          const downVal = Number(c.downPayment ?? c.down ?? 0);
          const paidVal = Number(c.totalPaid ?? c.total_paid ?? 0);
          const remCalc = Math.max(0, saleVal - downVal - paidVal);

          return {
            ...c,
            id: c.id,
            name: c.name || c.clientName || c.client_name || "عميل بدون اسم",
            phone: c.phone || c.clientPhone || "",
            item: c.item || c.itemName || "",
            remaining: Number(c.remainingAmount ?? c.remaining ?? remCalc),
            monthly: Number(c.monthlyInstallment ?? c.monthly ?? 0),
            sale: saleVal,
            down: downVal,
            totalPaid: paidVal
          };
        });
        setRows(formatted);

        if (selected) {
          const updatedSel = formatted.find((r) => String(r.id) === String(selected.id));
          if (updatedSel) setSelected(updatedSel);
        }
      }

      if (paymentsData) setPayments(paymentsData);
      if (empData) setEmployees(empData);
    } catch (err) {
      console.error("Error fetching installment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, []);

  // ☁️ 2. حفظ وتسجيل السداد المباشر في السحابة
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    const numAmount = Math.round(parseFloat(amount) || 0);
    if (!selected || numAmount <= 0) return;

    const currentRemaining = Number(selected.remaining || 0);
    if (numAmount > currentRemaining) {
      alert(isEN ? "Amount exceeds remaining debt!" : "المبلغ المدخل أكبر من المديونية المتبقية!");
      return;
    }

    const newRemaining = Math.max(0, currentRemaining - numAmount);
    const newTotalPaid = Math.round(Number(selected.totalPaid || 0) + numAmount);
    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    try {
      // أ) تحديث العميل في جدول clients
      const { error: updateErr } = await supabase
        .from("clients")
        .update({
          totalPaid: newTotalPaid,
          remainingAmount: newRemaining,
          remaining: newRemaining
        })
        .eq("id", selected.id);

      if (updateErr) {
        await supabase
          .from("clients")
          .update({
            total_paid: newTotalPaid,
            remaining_amount: newRemaining
          })
          .eq("id", selected.id);
      }

      // ب) إدخال السداد في جدول payments
      const newPaymentRecord = {
        id: String(Date.now()),
        clientId: String(selected.id),
        clientName: selected.name,
        item: selected.item,
        amount: numAmount,
        remainingAfter: newRemaining,
        payDate: paymentDateStr,
        method: method || "نقداً / كاش",
        collector: collector || "المشرف"
      };

      await supabase.from("payments").insert([newPaymentRecord]);

      // ج) تجهيز فتح الإيصال
      setActiveReceipt({
        client: { ...selected, totalPaid: newTotalPaid, remaining: newRemaining },
        payment: {
          amount: numAmount,
          payDate: paymentDateStr,
          method,
          collector,
          remainingAfter: newRemaining
        }
      });

      setAmount("");
      await fetchCloudData();
    } catch (err) {
      console.error("Payment save error:", err);
      alert(isEN ? "Failed to save payment to cloud!" : "حدث خطأ أثناء حفظ عملية السداد بالسحابة!");
    }
  };

  // 🗑️ 3. حذف الدفعة المباشر من السحابة
  const handleDeletePayment = async (paymentId, clientId, payAmount) => {
    if (!window.confirm(isEN ? "Are you sure you want to delete this payment?" : "هل أنت متأكد من حذف هذه الدفعة؟")) return;

    try {
      const client = rows.find((c) => String(c.id) === String(clientId));
      if (client) {
        const numAmount = Math.round(Number(payAmount) || 0);
        const newTotalPaid = Math.max(0, Math.round(Number(client.totalPaid || 0) - numAmount));
        const newRemaining = Math.round(Number(client.remaining || 0) + numAmount);

        await supabase.from("payments").delete().eq("id", paymentId);
        await supabase
          .from("clients")
          .update({
            totalPaid: newTotalPaid,
            remainingAmount: newRemaining,
            remaining: newRemaining
          })
          .eq("id", clientId);
      }

      await fetchCloudData();
    } catch (err) {
      console.error("Delete payment error:", err);
    }
  };

  const clientPayments = selected
    ? payments.filter((p) => String(p.clientId || p.client_id) === String(selected.id))
    : [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <ScreenHeader
        title={t.pay || (isEN ? "Pay Installments" : "سداد الأقساط")}
        onBack={onBack}
        t={t}
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12 }}>
          <Loader2 size={32} className="animate-spin" style={{ color: themeStyles.accentGold || "#d4af37" }} />
          <span style={{ fontSize: 14, color: themeStyles.subText || "#aaa" }}>
            {isEN ? "Loading cloud installment data..." : "جاري تحميل بيانات الأقساط من السحابة..."}
          </span>
        </div>
      ) : (
        <>
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

          <div style={{ background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 18, padding: 22 }}>
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
              onSubmitPayment={handlePaySubmit}
              t={t}
              themeStyles={themeStyles}
            />

            <InstallmentsTable
              selected={selected}
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
              storeInfo={storeInfo}
              onClose={() => setActiveReceipt(null)}
              themeStyles={themeStyles}
              t={t}
            />
          )}

          {showAllPayments && (
            <AllPaymentsRegisterModal
              payments={payments}
              storeInfo={storeInfo}
              onClose={() => setShowAllPayments(false)}
              t={t}
              themeStyles={themeStyles}
            />
          )}
        </>
      )}
    </div>
  );
}
