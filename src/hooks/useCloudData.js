/**
 * =========================================================
 * 📌 الملف: هك البيانات السحابية والتحديث اللحظي (Cloud Data Hook)
 * 📁 المسار: src/hooks/useCloudData.js
 * 📝 الوظيفة: إدارة الجلب والتحديث اللحظي المباشر للبيانات
 *            من Supabase بدون الحاجة لإعادة تحميل الصفحة.
 * =========================================================
 */

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

  // ☁️ تحديث بيانات عقد مع عكس الأرقام على الشاشة فوراً
 const handleUpdateContract = async (updatedContract) => {
    try {
      const { id, ...updateData } = updatedContract;

      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (data && !error) {
        setClientsList((prev) =>
          prev.map((c) => (String(c.id) === String(data.id) ? data : c))
        );
        return { success: true, contract: data };
      }

      console.error("خطأ Supabase أثناء التحديث:", error);
      return { success: false, error };
    } catch (err) {
      console.error("خطأ أثناء تحديث العقد:", err);
      return { success: false, error: err };
    }
  };
