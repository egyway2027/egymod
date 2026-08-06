import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useCloudData() {
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 جلب بيانات الجداول بشكل منفصل ومباشر
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientsRes, contractsRes, employeesRes, partnersRes] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("contracts").select("*, installments(*)").order("created_at", { ascending: false }),
        supabase.from("employees").select("*").order("created_at", { ascending: false }),
        supabase.from("partners").select("*").order("created_at", { ascending: false })
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (contractsRes.data) setContracts(contractsRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
      if (partnersRes.data) setPartners(partnersRes.data);
    } catch (err) {
      console.error("❌ خطأ أثناء جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // 👤 عمليات العملاء (Clients)
  const addClient = async (clientData) => {
    const { data, error } = await supabase.from("clients").insert([{ ...clientData, status: "active" }]).select().single();
    if (!error && data) setClients((prev) => [data, ...prev]);
    return { success: !error, data, error };
  };

  // 📜 عمليات العقود (Contracts)
  const addContract = async (contractData) => {
    const { data, error } = await supabase.from("contracts").insert([{ ...contractData, status: "active" }]).select().single();
    if (!error && data) setContracts((prev) => [data, ...prev]);
    return { success: !error, data, error };
  };

  // 🏷️ تغيير حالة أي عنصر (نقل لسلة المهملات أو الأرشيف أو الاستعادة)
  const updateItemStatus = async (tableName, id, newStatus) => {
    const { error } = await supabase.from(tableName).update({ status: newStatus }).eq("id", id);
    if (!error) refreshAllData();
    return { success: !error, error };
  };

  return {
    clients,
    contracts,
    employees,
    partners,
    isLoading,
    refreshAllData,
    addClient,
    addContract,
    updateItemStatus
  };
}
