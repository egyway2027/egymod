import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useCloudData() {
  const [clientsList, setClientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 دالة جلب البيانات السحابية
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClientsList(data);
    }
    setIsLoading(false);
  }, []);

  // التحميل التلقائي فور تشغيل التطبيق
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ☁️ حفظ عقد جديد مع تحديث الواجهة فورياً
  const handleSaveClient = async (newClientData) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([newClientData])
        .select()
        .single();

      if (data && !error) {
        setClientsList((prev) => [data, ...prev]);
        return { success: true, contract: data };
      }
      return { success: false, error };
    } catch (err) {
      console.error("خطأ أثناء حفظ العقد:", err);
      return { success: false, error: err };
    }
  };

// ☁️ تحديث بيانات عقد مع طباعة النتيجة والتحديث الفوري
  const handleUpdateContract = async (updatedContract) => {
    try {
      const { id, ...updateData } = updatedContract;

      console.log("📤 جاري إرسال التحديث لـ Supabase للـ ID:", id, updateData);

      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        console.error("❌ خطأ صريح من Supabase أثناء التحديث:", error);
        return { success: false, error };
      }

      const updatedItem = data && data.length > 0 ? data[0] : updatedContract;

      setClientsList((prev) =>
        prev.map((c) => (String(c.id) === String(id) ? updatedItem : c))
      );

      console.log("✅ تم التحديث بنجاح سحابياً ومحلياً:", updatedItem);
      return { success: true, contract: updatedItem };
    } catch (err) {
      console.error("❌ خطأ غير متوقع أثناء تحديث العقد:", err);
      return { success: false, error: err };
    }
  };

  return {
    clientsList,
    isLoading,
    refreshData,
    handleSaveClient,
    handleUpdateContract
  };
}
