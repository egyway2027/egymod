import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useCloudData() {
  const [clientsList, setClientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 دالة جلب البيانات السحابية
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClientsList(data);
      } else if (error) {
        console.error("❌ خطأ أثناء جلب العقود من Supabase:", error);
      }
    } catch (err) {
      console.error("❌ خطأ غير متوقع أثناء جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // التحميل التلقائي فور تشغيل التطبيق
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ☁️ حفظ عقد جديد مع تنقية البيانات لضمان القبول في Supabase
  const handleSaveClient = async (newClientData) => {
    try {
      // 🧹 تصفية الحقول الخاصة بالواجهة فقط حتى لا ترفضها قاعدة البيانات
      const uiOnlyFields = ["clientName", "clientPhone", "itemName", "remainingAmount", "remaining", "totalPaid"];
      const payload = {};

      Object.keys(newClientData || {}).forEach((key) => {
        if (!uiOnlyFields.includes(key)) {
          payload[key] = newClientData[key];
        }
      });

      // إسناد القيم الافتراضية
      payload.is_deleted = false;
      payload.status = "active";

      console.log("📤 جاري حفظ العقد الجديد في Supabase:", payload);

      const { data, error } = await supabase
        .from("contracts")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("❌ خطأ Supabase أثناء حفظ العقد:", error.message);
        return { success: false, error };
      }

      if (data) {
        const fullContract = { ...newClientData, ...data };
        setClientsList((prev) => [fullContract, ...prev]);
        console.log("✅ تم حفظ العقد الجديد بنجاح:", fullContract);
        return { success: true, contract: fullContract };
      }

      return { success: false };
    } catch (err) {
      console.error("❌ خطأ غير متوقع أثناء حفظ العقد:", err);
      return { success: false, error: err };
    }
  };
// 🗑️ دالة الحذف النهائي الحقيقي من قاعدة بيانات Supabase
  const handleDeleteContract = async (clientId) => {
    try {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", clientId);

      if (error) {
        console.error("❌ خطأ أثناء الحذف النهائي:", error);
        return { success: false, error };
      }

      setClientsList((prev) => prev.filter((c) => String(c.id) !== String(clientId)));
      return { success: true };
    } catch (err) {
      console.error("❌ خطأ غير متوقع أثناء الحذف النهائي:", err);
      return { success: false, error: err };
    }
  };
// ☁️ تحديث بيانات أو حالة عقد (سلة المهملات / استعادة / تعديل)
  const handleUpdateContract = async (updatedContract) => {
    try {
      const { id, is_permanently_deleted, ...updateData } = updatedContract;

      if (is_permanently_deleted) {
        return await handleDeleteContract(id);
      }

      // 🧹 تصفية الكائن وإرسال الحقول المقبولة سحابياً فقط
      const payload = {};
      
      if (updateData.is_deleted !== undefined) payload.is_deleted = Boolean(updateData.is_deleted);
      if (updateData.status !== undefined) payload.status = updateData.status;

      // تجميع بقية حقول العقد واستبعاد حقول الواجهة المحسوبة
      const uiOnlyFields = ["clientName", "clientPhone", "itemName", "remainingAmount", "remaining", "totalPaid"];
      Object.keys(updateData).forEach((key) => {
        if (!uiOnlyFields.includes(key)) {
          payload[key] = updateData[key];
        }
      });

      console.log("📤 جاري إرسال التحديث المنقى لـ Supabase للـ ID:", id, payload);

      const { data, error } = await supabase
        .from("contracts")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) {
        console.error("❌ خطأ صريح من Supabase:", error.message);
        return { success: false, error };
      }

      const updatedItem = data && data.length > 0 ? data[0] : updatedContract;

      setClientsList((prev) =>
        prev.map((c) => (String(c.id) === String(id) ? { ...c, ...updatedContract, ...updatedItem } : c))
      );

      console.log("✅ تم الحفظ سحابياً بنجاح ولم يختفِ بعد الريفريش:", updatedItem);
      return { success: true, contract: updatedItem };
    } catch (err) {
      console.error("❌ خطأ أثناء تحديث العقد:", err);
      return { success: false, error: err };
    }
  };

  return {
    clientsList,
    isLoading,
    refreshData,
    handleSaveClient,
    handleUpdateContract,
    handleDeleteContract
  };
}
