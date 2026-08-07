import { supabase } from "../supabaseClient";

/**
 * جلب جميع عقود العملاء من جدول contracts الموحد بالسحابة
 */
export async function fetchAllClientsContracts() {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ خطأ في جلب بيانات العملاء من السحابة:", error.message);
    throw new Error(`تعذر جلب البيانات من السحابة: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.client_name,
    phone: row.client_phone,
    nationalId: row.national_id || "",
    address: row.address || "",
    guarantor: row.guarantor_name || "",
    guarantorPhone: row.guarantor_phone || "",
    item: row.item_name,
    cost: Number(row.cost_price || 0),
    sale: Number(row.sale_price || 0),
    down: Number(row.down_payment || 0),
    monthly: Number(row.monthly_installment || 0),
    contractDate: row.contract_date,
    notes: row.notes || "",
    status: row.status
  }));
}
