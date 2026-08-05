import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useCloudData() {
  const [clientsList, setClientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 دالة جلب البيانات السحابية مع معالجة وتطبيع البيانات المرجعة
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // 🧹 تطبيع البيانات لتفادي قيم null وتصفير الأقساط عند التحميل
        const normalizedData = data.map((item) => {
          let inst = item.installments;
          if (typeof inst === "string") {
            try { inst = JSON.parse(inst); } catch { inst = []; }
          }
          inst = Array.isArray(inst) ? inst : [];

          const total = Number(item.total) || 0;
          const downPayment = Number(item.downPayment || item.down_payment) || 0;
          
          const paidFromInstallments = inst.filter(i => i.paid).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
          const totalPaidCalculated = downPayment + paidFromInstallments;
          const remainingCalculated = Math.max(0, total - totalPaidCalculated);

          return {
            ...item,
            installments: inst,
            remaining: item.remaining ?? item.remainingAmount ?? remainingCalculated,
            totalPaid: item.totalPaid ?? totalPaidCalculated
          };
        });

        setClientsList(normalizedData);
      } else if (error) {
        console.error("❌ خطأ أثناء جلب العقود من Supabase:", error);
      }
    } catch (err) {
      console.error("❌ خطأ غير متوقع أثناء جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

// ☁️ حفظ عقد جديد
  const handleSaveClient = async (newClientData) => {
    try {
      const { clientName, clientPhone, itemName, remainingAmount, ...cleanData } = newClientData || {};

      const installments = Array.isArray(newClientData?.installments) ? newClientData.installments : [];
      const total = Number(newClientData?.total) || 0;
      const downPayment = Number(newClientData?.downPayment) || 0;
      const remaining = newClientData?.remaining ?? (total - downPayment);

      const payload = {
        ...cleanData,
        installments,
        total,
        downPayment,
        remaining,
        totalPaid: newClientData?.totalPaid ?? downPayment,
        is_deleted: false,
        status: "active"
      };

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

      const fullContract = {
        ...newClientData,
        ...(data || {}),
        installments,
        remaining,
        totalPaid: payload.totalPaid
      };

      setClientsList((prev) => [fullContract, ...prev]);
      console.log("✅ تم حفظ العقد الجديد بنجاح مع الأقساط:", fullContract);
      return { success: true, contract: fullContract };
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
