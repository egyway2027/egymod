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
  const [multipleContractsModal, setMultipleContractsModal] = useState({ open: false, contracts: [], clientName: "" });

  // 🔄 جلب العقود والأقساط مباشرة وفق الهيكلة الموحدة الجديدة بالسحابة
  const fetchLocalContracts = useCallback(async () => {
    setLoading(true);
    try {
      const [contractsRes, installmentsRes] = await Promise.all([
        supabase.from("contracts").select("*").order("created_at", { ascending: false }),
        supabase.from("installments").select("*").order("created_at", { ascending: true })
      ]);

      const contractsData = contractsRes.data || [];
      const installmentsData = installmentsRes.data || [];

      const mergedContracts = contractsData.map((contract) => {
        const matchedInstallments = installmentsData.filter(
          (inst) => String(inst.contract_id) === String(contract.id)
        );

        return {
          ...contract,
          installments: matchedInstallments
        };
      });

      setLocalContracts(mergedContracts);
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

  // 📊 تطبيع البيانات مع مسميات الجدول الموحد (client_name, sale_price, item_name)
  const rows = useMemo(() => {
    const sourceData = localContracts.length > 0 ? localContracts : propContracts;
    return (sourceData || []).map((c) => {
      const instArr = Array.isArray(c.installments) ? c.installments : (Array.isArray(c.payments) ? c.payments : []);

      const sale = Number(c.sale_price || c.sale || c.total || 0);
      const down = Number(c.down_payment || c.down || 0);
      const monthly = Number(c.monthly_installment || c.monthly || 0);
      const resolvedClientName = c.client_name || c.clientName || c.name || "عميل بدون اسم";
      const resolvedItemName = c.item_name || c.itemName || c.item || "";
      const resolvedPhone = c.client_phone || c.phone || "";

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
            clientName: resolvedClientName,
            itemName: resolvedItemName,
            item: resolvedItemName,
            item_name: resolvedItemName,
            amount: amt,
            payDate: pDate,
            date: pDate,
            method: i.payment_method || i.method || "نقداً / كاش",
            collector: i.collector || i.employee || "المشرف العام",
            remainingAfter: remAfter
          };
        });

      const totalPaid = runningPaid;
      const remainingAmount = Math.max(0, sale - totalPaid);

      return {
        ...c,
        id: c.id,
        name: resolvedClientName,
        clientName: resolvedClientName,
        phone: resolvedPhone,
        item: resolvedItemName,
        itemName: resolvedItemName,
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

  // 📑 دالة التحقق من عقود العميل المتعددة
  const handleSelectContract = useCallback((val) => {
    if (!val) {
      setSelectedId("");
      return;
    }
    const targetObj = typeof val === "object" ? val : rows.find((r) => String(r.id) === String(val));
    if (!targetObj) {
      setSelectedId("");
      return;
    }

    const clientName = (targetObj.clientName || targetObj.name || "").trim();
    const clientPhone = (targetObj.phone || targetObj.client_phone || "").trim();

    const matchedContracts = rows.filter((r) => {
      const sameName = clientName && (r.clientName || r.name || "").trim() === clientName;
      const samePhone = clientPhone && (r.phone || r.client_phone || "").trim() === clientPhone;
      return sameName || samePhone;
    });

    if (matchedContracts.length > 1) {
      setMultipleContractsModal({
        open: true,
        contracts: matchedContracts,
        clientName: clientName
      });
    } else {
      setSelectedId(targetObj.id);
    }
  }, [rows]);

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
      // 1️⃣ المحاولة الأولى: جدول installments بجميع الحقول
      let { error } = await supabase
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

      // 2️⃣ المحاولة الثانية: التحويل التلقائي لجدول payments البديل
      if (error) {
        const payRes = await supabase
          .from("payments")
          .insert([
            {
              contract_id: activeSelectedRow.id,
              amount: numAmount,
              pay_date: payDate || new Date().toISOString().split("T")[0],
              method: method || "نقداً / كاش",
              collector: collector || "المشرف العام"
            }
          ]);
        if (!payRes.error) error = null;
      }

      // 3️⃣ المحاولة الثالثة: جدول installments بالحقول الأساسية فقط
      if (error) {
        const fallback = await supabase
          .from("installments")
          .insert([
            {
              contract_id: activeSelectedRow.id,
              amount: numAmount,
              due_date: payDate || new Date().toISOString().split("T")[0],
              is_paid: true,
              status: "paid"
            }
          ]);
        error = fallback.error;
      }

      // 4️⃣ المحاولة الرابعة: جدول installments بالحد الأدنى المطلق
      if (error) {
        const minFallback = await supabase
          .from("installments")
          .insert([
            {
              contract_id: activeSelectedRow.id,
              amount: numAmount
            }
          ]);
        error = minFallback.error;
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
              setSelected={handleSelectContract}
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

      {/* 📑 نافذة اختيار العقد المطلوب عند وجود أكثر من عقد لنفس العميل */}
      {multipleContractsModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.accentGold || "#d0b689"}`, borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "520px", textAlign: "center" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(208, 182, 137, 0.15)", border: `1px solid ${themeStyles.accentGold || "#d0b689"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
              <span style={{ fontSize: "22px" }}>📑</span>
            </div>

            <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "17px", fontWeight: 800 }}>
              العميل ({multipleContractsModal.clientName}) لديه أكثر من عقد
            </h3>
            <p style={{ margin: "0 0 18px 0", color: themeStyles.subText || "#aaa", fontSize: "13px" }}>
              يرجى تحديد العقد والسلعة المطلوب سداد أقساطها الآن:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "50vh", overflowY: "auto", paddingRight: "4px" }}>
              {multipleContractsModal.contracts.map((contract, idx) => (
                <div
                  key={contract.id || idx}
                  onClick={() => {
                    setSelectedId(contract.id);
                    setMultipleContractsModal({ open: false, contracts: [], clientName: "" });
                  }}
                  style={{
                    background: themeStyles.inputBg || "#121214",
                    border: `1px solid ${themeStyles.border || "#333"}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    textAlign: "right",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "0.2s"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: themeStyles.accentGold || "#d0b689", fontSize: "14px" }}>
                      📦 السلعة: {contract.item || contract.itemName || contract.item_name || "غير محدد"}
                    </div>
                    <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaa", marginTop: "4px" }}>
                      تاريخ العقد: {contract.contract_date || contract.created_at?.split("T")[0] || "غير محدد"}
                    </div>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
                      {Number(contract.remainingAmount ?? contract.remaining ?? 0).toLocaleString()} ج.م
                    </div>
                    <span style={{ fontSize: "11px", color: "#4caf50", fontWeight: 700 }}>سداد هذا العقد ←</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMultipleContractsModal({ open: false, contracts: [], clientName: "" })}
              style={{ marginTop: "16px", background: "none", border: `1px solid ${themeStyles.border || "#333"}`, color: "#aaa", padding: "8px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
