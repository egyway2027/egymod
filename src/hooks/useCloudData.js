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

  // 🔄 جلب البيانات المترابطة من السحابة بجملة JOIN واحدة
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientsRes, contractsRes, installmentsRes, employeesRes, partnersRes] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("contracts").select("*, clients(*), installments(*)").order("created_at", { ascending: false }),
        supabase.from("installments").select("*").order("created_at", { ascending: false }),
        supabase.from("employees").select("*").order("created_at", { ascending: false }),
        supabase.from("partners").select("*").order("created_at", { ascending: false })
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
      if (partnersRes.data) setPartners(partnersRes.data);
      if (installmentsRes.data) setInstallments(installmentsRes.data);

      if (contractsRes.data) {
        setContracts(contractsRes.data);

        // 🎯 دمج بيانات العميل والعقد في كائن واحد موحد لكل الشاشات
        const normalized = contractsRes.data.map((c) => {
          const clientObj = c.clients || {};
          const instArr = Array.isArray(c.installments) ? c.installments : [];

          const sale = Number(c.sale || c.total || 0);
          const cost = Number(c.cost || 0);
          const down = Number(c.down_payment || 0);
          const monthly = Number(c.monthly_installment || 0);

          const paidFromInst = instArr
            .filter((i) => i.is_paid)
            .reduce((sum, i) => sum + Number(i.amount || 0), 0);

          const totalPaid = down + paidFromInst;
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
            payments: instArr
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

  // ➕ حفظ العميل والعقد في جدولين مستقلين مع الربط
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

  // 🏷️ تحديث بيانات أو حالة العقد
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
    handleUpdateContract
  };
}
