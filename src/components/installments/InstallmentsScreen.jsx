import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { ScreenHeader, BottomExitButton } from "../CommonUI";
import CustomerSearchHeader from "./CustomerSearchHeader";
import InstallmentsTable, { AllPaymentsRegisterModal } from "./InstallmentsTable";
import PaymentModal from "./PaymentModal";

export default function InstallmentsScreen({
  contracts: propContracts = [],
  onPay,
  onBack,
  t = {},
  themeStyles = {}
}) {
  const [localContracts, setLocalContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("نقداً / كاش");
  const [collector, setCollector] = useState("المشرف العام");

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // 🔄 جلب عقود هذه الشاشة مباشرة من قواعد البيانات سحابياً وبشكل مستقل
  const fetchLocalContracts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, clients(*), installments(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLocalContracts(data);
      } else if (propContracts.length > 0) {
        setLocalContracts(propContracts);
      }
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات سداد الأقساط:", err);
      if (propContracts.length > 0) setLocalContracts(propContracts);
    } finally {
      setLoading(false);
    }
  }, [propContracts]);

  useEffect(() => {
    fetchLocalContracts();
  }, [fetchLocalContracts]);

  // 📊 تطبيع البيانات وتجهيز السجلات الكاملة
  const rows = useMemo(() => {
    const sourceData = localContracts.length > 0 ? localContracts : propContracts;
    return (sourceData || []).map((c) => {
      const clientObj = c.clients || {};
      const instArr = Array.isArray(c.installments) ? c.installments : (Array.isArray(c.payments) ? c.payments : []);

      const sale = Number(c.sale || c.total || 0);
      const down = Number(c.down_payment || c.down || 0);
      const monthly = Number(c.monthly_installment || c.monthly || 0);

      let runningPaid = down;
      const enrichedPayments = instArr
        .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
        .map((i) => {
          const amt = Number(i.amount || 0);
          runningPaid += amt;
          const remAfter = Math.max(0, sale - runningPaid);
          const pDate = i.due_date || i.paid_at || i.date || i.payDate || i.created_at || new Date().toISOString().split("T")[0];

          return {
            ...i,
            id: i.id,
            contractId: c.id,
            clientName: clientObj.name || c.clientName || c.name || "عميل بدون اسم",
            itemName: c.item_name || c.itemName || c.item || "",
            amount: amt,
            payDate: pDate,
            date: pDate,
            method: i.payment_method || i.method || i.paymentMethod || i.pay_method || "نقداً / كاش",
            collector: i.collector || i.employee || i.collector_name || i.collectorName || "المشرف العام",
            remainingAfter: remAfter
          };
        });

      const totalPaid = runningPaid;
      const remainingAmount = Math.max(0, sale - totalPaid);

      return {
        ...c,
        id: c.id,
        name: clientObj.name || c.clientName || c.name || "عميل بدون اسم",
        clientName: clientObj.name || c.clientName || c.name || "عميل بدون اسم",
        phone: clientObj.phone || c.clientPhone || c.phone || "",
        item: c.item_name || c.itemName || c.item || "",
        itemName: c.item_name || c.itemName || c.item || "",
        sale,
        down,
        monthly,
        paidAmount: totalPaid,
        totalPaid,
        remainingAmount,
        remaining: remainingAmount,
        payments: enrichedPayments
      };
    });
  }, [localContracts, propContracts]);

  const activeSelectedRow = useMemo(() => {
    return rows.find((r) => String(r.id) === String(selectedId)) || null;
  }, [rows, selectedId]);

  // 🗑️ معالجة حذف القسط من السحابة
  const handleDeletePayment = async (paymentId) => {
    if (!paymentId) return;

    if (!window.confirm("هل أنت تأكد من رغبتك في حذف هذا القسط المسدد؟")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("installments")
        .delete()
        .eq("id", paymentId);

      if (!error) {
        await fetchLocalContracts();
      } else {
        alert("حدث خطأ أثناء حذف القسط من السحابة: " + (error.message || ""));
      }
    } catch (err) {
      console.error("❌ خطأ في عملية حذف القسط:", err);
      alert("حدث خطأ أثناء الاتصال بالسحابة");
    }
  };

  // 💳 معالجة السداد المباشر المستقل بالسحابة
  const handlePaySubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!activeSelectedRow) {
      alert("يرجى اختيار العقد أولاً");
      return;
    }

    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) {
      alert("يرجى كتابة المبلغ المدفوع");
      return;
    }

    try {
      // المحاولة الأولى: الحفظ مع جميع مسميات الأعمدة المحتملة بالسحابة
      let { error } = await supabase
        .from("installments")
        .insert([
          {
            contract_id: activeSelectedRow.id,
            amount: numAmount,
            due_date: payDate || new Date().toISOString().split("T")[0],
            payment_method: method || "نقداً / كاش",
            method: method || "نقداً / كاش",
            collector: collector || "المشرف العام",
            employee: collector || "المشرف العام",
            is_paid: true,
            paid_at: new Date().toISOString(),
            status: "paid"
          }
        ]);

      // محاولة احتياطية للأعمدة الأساسية (payment_method / collector)
      if (error) {
        const fallback1 = await supabase
          .from("installments")
          .insert([
            {
              contract_id: activeSelectedRow.id,
              amount: numAmount,
              due_date: payDate || new Date().toISOString().split("T")[0],
              payment_method: method || "نقداً / كاش",
              collector: collector || "المشرف العام",
              is_paid: true,
              paid_at: new Date().toISOString(),
              status: "paid"
            }
          ]);
        error = fallback1.error;
      }

      // محاولة احتياطية ثانية للأعمدة البديلة (method / employee)
      if (error) {
        const fallback2 = await supabase
          .from("installments")
          .insert([
            {
              contract_id: activeSelectedRow.id,
              amount: numAmount,
              due_date: payDate || new Date().toISOString().split("T")[0],
              method: method || "نقداً / كاش",
              employee: collector || "المشرف العام",
              is_paid: true,
              paid_at: new Date().toISOString(),
              status: "paid"
            }
          ]);
        error = fallback2.error;
      }

      if (!error) {
        const currentPaid = Number(activeSelectedRow.paidAmount || 0);
        const newPaid = currentPaid + numAmount;
        const newRem = Math.max(0, activeSelectedRow.sale - newPaid);

        // 🎯 فتح إيصال الطباعة فوراً ببيانات مكتملة 100%
        setActiveReceipt({
          client: {
            ...activeSelectedRow,
            totalPaid: newPaid,
            paidAmount: newPaid,
            remaining: newRem,
            remainingAmount: newRem
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
        
        // إعادة تحديث بيانات هذه الشاشة فوراً وبشكل مستقل
        await fetchLocalContracts();

        // التوافق مع الهوك الخارجي إن وجد
        if (typeof onPay === "function") {
          onPay({ contractId: activeSelectedRow.id, amount: numAmount, payDate, method, collector });
        }
      } else {
        alert("حدث خطأ أثناء حفظ القسط بالسحابة: " + (error.message || "خطأ غير معروف"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالسحابة");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <ScreenHeader title={t.pay || "سداد الأقساط"} onBack={onBack} t={t} />

      {/* زر فتح سجل السداد الشامل لجميع العملاء */}
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
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", color: themeStyles.accentGold || "#d4af37", gap: "10px" }}>
            <Loader2 size={24} className="animate-spin" />
            <span style={{ fontWeight: 700 }}>جاري تحميل بيانات الأقساط بالسحابة...</span>
          </div>
        ) : (
          <>
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
              onDeletePayment={handleDeletePayment}
              t={t}
              themeStyles={themeStyles}
            />
          </>
        )}

        <BottomExitButton onBack={onBack} t={t} />
      </div>

      {/* نافذة إيصال استلام القسط */}
      {activeReceipt && (
        <PaymentModal
          receipt={activeReceipt}
          storeInfo={{ name: "إيجيمود لإدارة الأقساط" }}
          onClose={() => setActiveReceipt(null)}
          themeStyles={themeStyles}
          t={t}
        />
      )}

      {/* سجل السداد الشامل لجميع العملاء */}
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
