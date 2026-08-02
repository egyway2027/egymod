import { createClient } from "@supabase/supabase-js";

// ⚠️ استبدل القيم بالروابط والمفاتيح الخاصة بمشروعك من Supabase (Project Settings -> API)
const SUPABASE_URL = "https://jvmowzfktfybjcvqnlcc.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_lqpryj6bARHXiqDveRUrVw_scmwGO-0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. جلب جميع العقود من السحابة
export const fetchContractsFromCloud = async () => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب البيانات سحابياً:", err.message);
    return [];
  }
};

// 2. حفظ عقد جديد بالسحابة
export const saveContractToCloud = async (contractData) => {
  try {
    const payload = {
      name: contractData.name,
      phone: contractData.phone,
      guarantor: contractData.guarantor || "",
      guarantorPhone: contractData.guarantorPhone || "",
      item: contractData.item,
      cost: Number(contractData.cost) || 0,
      sale: Number(contractData.sale) || 0,
      down: Number(contractData.down) || 0,
      monthly: Number(contractData.monthly) || 0,
      contractDate: contractData.contractDate || "",
      firstPayDate: contractData.firstPayDate || "",
      notes: contractData.notes || "",
      paidAmount: 0,
      remainingAmount: Math.max(0, (Number(contractData.sale) || 0) - (Number(contractData.down) || 0))
    };

    const { data, error } = await supabase
      .from("contracts")
      .insert([payload])
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error("خطأ في حفظ العقد بالسحابة:", err.message);
    throw err;
  }
};

// 3. تحديث عقد حالي بالسحابة
export const updateContractInCloud = async (contractData) => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .update({
        name: contractData.name,
        phone: contractData.phone,
        guarantor: contractData.guarantor,
        guarantorPhone: contractData.guarantorPhone,
        item: contractData.item,
        cost: Number(contractData.cost) || 0,
        sale: Number(contractData.sale) || 0,
        down: Number(contractData.down) || 0,
        monthly: Number(contractData.monthly) || 0,
        contractDate: contractData.contractDate,
        firstPayDate: contractData.firstPayDate,
        notes: contractData.notes
      })
      .eq("id", contractData.id)
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error("خطأ في تحديث البيانات بالسحابة:", err.message);
    throw err;
  }
};
