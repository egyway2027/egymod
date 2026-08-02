/**
 * =========================================================
 * 📌 الملف: خدمة الربط السحابي (Supabase Cloud Service)
 * 📁 المسار: src/services/cloudService.js
 * 📝 الوظيفة: الاتصال بقاعدة بيانات Supabase، جلب العقود،
 *            إضافة عقود جديدة، وتحديث البيانات سحابياً.
 * =========================================================
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jvmowzfktfybjcvqnlcc.supabase.co";
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
    const saleNum = Number(contractData.sale) || 0;
    const downNum = Number(contractData.down) || 0;

    const payload = {
      name: contractData.name,
      phone: contractData.phone,
      guarantor: contractData.guarantor || "",
      guarantorPhone: contractData.guarantorPhone || "",
      item: contractData.item,
      cost: Number(contractData.cost) || 0,
      sale: saleNum,
      down: downNum,
      monthly: Number(contractData.monthly) || 0,
      contractDate: contractData.contractDate || "",
      firstPayDate: contractData.firstPayDate || "",
      notes: contractData.notes || "",
      paidAmount: 0,
      remainingAmount: Math.max(0, saleNum - downNum)
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

// 3. تحديث عقد حالي بالسحابة (مع إعادة حساب المتبقي تلقائياً)
export const updateContractInCloud = async (contractData) => {
  try {
    const saleNum = Number(contractData.sale) || 0;
    const downNum = Number(contractData.down) || 0;
    const paidNum = Number(contractData.paidAmount) || 0;
    
    // إعادة حساب المبلغ المتبقي المستحق تلقائياً بعد أي تعديل
    const newRemaining = Math.max(0, saleNum - downNum - paidNum);

    const { data, error } = await supabase
      .from("contracts")
      .update({
        name: contractData.name,
        phone: contractData.phone,
        guarantor: contractData.guarantor || "",
        guarantorPhone: contractData.guarantorPhone || "",
        item: contractData.item,
        cost: Number(contractData.cost) || 0,
        sale: saleNum,
        down: downNum,
        monthly: Number(contractData.monthly) || 0,
        contractDate: contractData.contractDate,
        firstPayDate: contractData.firstPayDate,
        notes: contractData.notes,
        remainingAmount: newRemaining
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
