import { supabase } from "../supabaseClient";

/**
 * حفظ وحفظ بيانات عميل وعقد جديد بجدول contracts الموحد
 * @param {Object} formData بيانات العميل المجمعة من الشاشة
 */
export async function insertClientContract(formData) {
  const { data, error } = await supabase
    .from("contracts")
    .insert([
      {
        client_name: formData.name || formData.clientName,
        client_phone: formData.phone || formData.clientPhone,
        national_id: formData.nationalId || formData.national_id || null,
        address: formData.address || null,
        guarantor_name: formData.guarantor || null,
        guarantor_phone: formData.guarantorPhone || null,
        item_name: formData.item || formData.itemName,
        cost_price: Number(formData.cost || 0),
        sale_price: Number(formData.sale || 0),
        down_payment: Number(formData.down || 0),
        monthly_installment: Number(formData.monthly || 0),
        contract_date: formData.contractDate,
        notes: formData.notes || "",
        status: "active"
      }
    ])
    .select();

  if (error) {
    console.error("❌ خطأ في حفظ بيانات العميل بالسحابة:", error.message);
    throw new Error(`تعذر حفظ البيانات بالسحابة: ${error.message}`);
  }

  return data[0];
}
