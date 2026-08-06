import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useCloudData() {
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 جلب وتجميع البيانات المترابطة من السحابة
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const normalized = contractsRes.data.map((c) => {
  const clientObj = c.clients || {};
  const instArr = Array.isArray(c.installments) ? c.installments : [];

  const sale = Number(c.sale || c.total || 0);
  const cost = Number(c.cost || 0);
  const down = Number(c.down_payment || 0);
  const monthly = Number(c.monthly_installment || 0);

  // حساب الأقساط المسددة المكتملة وإثراء بيانات كل قسط
  let runningPaid = down;
  const enrichedPayments = instArr
    .filter((i) => i.is_paid || i.status === "paid")
    .map((i) => {
      const amt = Number(i.amount || 0);
      runningPaid += amt;
      const remAfter = Math.max(0, sale - runningPaid);

      return {
        ...i,
        id: i.id,
        contractId: c.id,
        clientName: clientObj.name || "عميل بدون اسم",
        itemName: c.item_name || "",
        amount: amt,
        payDate: i.due_date || i.paid_at || i.created_at || new Date().toISOString().split("T")[0],
        date: i.due_date || i.paid_at || i.created_at || new Date().toISOString().split("T")[0],
        method: i.payment_method || i.method || "نقداً / كاش",
        collector: i.collector || i.employee || "المشرف العام",
        remainingAfter: remAfter
      };
    });

  const totalPaid = runningPaid;
  const remaining = Math.max(0, sale - totalPaid);

  return {
    ...c,
    id: c.id,
    client_id: c.client_id,
    name: clientObj.name || "عميل بدون اسم",
    clientName: clientObj.name || "عميل بدون اسم",
    phone: clientObj.phone || "",
    clientPhone: clientObj.phone || "",
    guarantor: c.guarantor || "",
    guarantorPhone: c.guarantor_phone || "",
    item: c.item_name || "",
    itemName: c.item_name || "",
    cost,
    sale,
    total: sale,
    down,
    downPayment: down,
    monthly,
    monthlyInstallment: monthly,
    paidAmount: totalPaid,
    totalPaid,
    remainingAmount: remaining,
    remaining,
    contractDate: c.contract_date || c.created_at,
    notes: c.notes || "",
    status: c.status || "active",
    payments: enrichedPayments
  };
});

        setClientsList(normalized);
      }
    } catch (err) {
      console.error("❌ خطأ أثناء جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // ➕ حفظ العميل والعقد
  const handleSaveClient = async (newClientData) => {
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from("clients")
        .insert([{
          name: newClientData.name || newClientData.clientName,
          phone: newClientData.phone || newClientData.clientPhone,
          status: "active"
        }])
        .select()
        .single();

      if (clientErr || !clientData) {
        return { success: false, error: clientErr };
      }

      const saleVal = Number(newClientData.sale || newClientData.total || 0);
      const { data: contractData, error: contractErr } = await supabase
        .from("contracts")
        .insert([{
          client_id: clientData.id,
          item_name: newClientData.item || newClientData.itemName,
          cost: Number(newClientData.cost || 0),
          sale: saleVal,
          total: saleVal,
          down_payment: Number(newClientData.down || newClientData.downPayment || 0),
          monthly_installment: Number(newClientData.monthly || newClientData.monthlyInstallment || 0),
          guarantor: newClientData.guarantor || "",
          guarantor_phone: newClientData.guarantorPhone || "",
          contract_date: newClientData.contractDate || new Date().toISOString().split("T")[0],
          notes: newClientData.notes || "",
          status: "active"
        }])
        .select()
        .single();

      if (contractErr) {
        return { success: false, error: contractErr };
      }

      await refreshAllData();
      return { success: true, contract: contractData };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // 🏷️ تحديث العقد
  const handleUpdateContract = async (updatedContract) => {
    try {
      if (updatedContract.is_permanently_deleted) {
        const { error } = await supabase.from("contracts").delete().eq("id", updatedContract.id);
        if (!error) await refreshAllData();
        return { success: !error };
      }

      const payload = {};
      if (updatedContract.status) payload.status = updatedContract.status;
      if (updatedContract.is_deleted !== undefined) payload.status = updatedContract.is_deleted ? "deleted" : "active";

      const { error } = await supabase.from("contracts").update(payload).eq("id", updatedContract.id);
      if (!error) await refreshAllData();
      return { success: !error, error };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // 💳 إضافة قسط مسدد مباشرة بجدول installments مع حفظ المحصل وطريقة الدفع
const addPayment = async ({ contractId, amount, payDate, method, collector }) => {
  try {
    const { data, error } = await supabase
      .from("installments")
      .insert([
        {
          contract_id: contractId,
          amount: Number(amount || 0),
          due_date: payDate || new Date().toISOString().split("T")[0],
          payment_method: method || "نقداً / كاش",
          collector: collector || "المشرف العام",
          is_paid: true,
          paid_at: new Date().toISOString(),
          status: "paid"
        }
      ])
      .select()
      .single();

    if (!error) {
      await refreshAllData();
      return { success: true, data };
    }
    return { success: false, error };
  } catch (err) {
    return { success: false, error: err };
  }
};

  // 🎯 تصدير كافة الدوال للاستخدام في الشاشات
  return {
    clients,
    contracts,
    clientsList,
    installments,
    employees,
    partners,
    isLoading,
    refreshAllData,
    handleSaveClient,
    handleUpdateContract,
    addPayment
  };
}
