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
      console.error("❌ خطأ أثناء حفظ العقد:", error);
      return { success: false, error };
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
// ☁️ تحديث بيانات أو حالة عقد (نقل للمهملات / استعادة / تعديل)
  const handleUpdateContract = async (updatedContract) => {
    try {
      const { id, is_permanently_deleted, ...updateData } = updatedContract;

      // 🔴 1. طلب الحذف النهائي
      if (is_permanently_deleted) {
        return await handleDeleteContract(id);
      }

      // 🎯 2. عزل حقول الأرشفة فقط لتفادي رفض الأعمدة الزائدة في Supabase
      let payload = {};

      if ("is_deleted" in updateData || "status" in updateData) {
        payload = {
          is_deleted: Boolean(updateData.is_deleted),
          status: updateData.status || (updateData.is_deleted ? "archived" : "active")
        };
      } else {
        payload = { ...updateData };
      }

      console.log("📤 جاري إرسال التحديث لـ Supabase للـ ID:", id, payload);

      let { data, error } = await supabase
        .from("contracts")
        .update(payload)
        .eq("id", id)
        .select();

      // 🟢 3. محاولة استدراكية تلقائية في حال كان الجدول يملك عموداً واحداً فقط من العمودين
      if (error) {
        console.warn("⚠️ محاولة التحديث بـ is_deleted فقط...", error);
        const retryDeleted = await supabase
          .from("contracts")
          .update({ is_deleted: Boolean(updateData.is_deleted) })
          .eq("id", id)
          .select();

        if (!retryDeleted.error && retryDeleted.data) {
          data = retryDeleted.data;
          error = null;
        } else {
          console.warn("⚠️ محاولة التحديث بـ status فقط...");
          const retryStatus = await supabase
            .from("contracts")
            .update({ status: updateData.status || (updateData.is_deleted ? "archived" : "active") })
            .eq("id", id)
            .select();

          if (!retryStatus.error && retryStatus.data) {
            data = retryStatus.data;
            error = null;
          }
        }
      }

      if (error) {
        console.error("❌ فشل التحديث في Supabase:", error);
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
