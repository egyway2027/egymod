/**
 * =========================================================
 * 📌 الملف: هك البيانات السحابية والتحديث اللحظي (Cloud Data Hook)
 * 📁 المسار: src/hooks/useCloudData.js
 * 📝 الوظيفة: إدارة الجلب والتحديث اللحظي المباشر للبيانات
 *            من Supabase بدون الحاجة لإعادة تحميل الصفحة.
 * =========================================================
 */

import { useState, useEffect, useCallback } from "react";
import {
  fetchContractsFromCloud,
  saveContractToCloud,
  updateContractInCloud
} from "../services/cloudService";

export function useCloudData() {
  const [clientsList, setClientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 دالة جلب البيانات السحابية
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchContractsFromCloud();
    setClientsList(data);
    setIsLoading(false);
  }, []);

  // التحميل التلقائي فور تشغيل التطبيق
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ☁️ حفظ عقد جديد مع تحديث الواجهة فورياً
  const handleSaveClient = async (newClientData) => {
    try {
      const savedContract = await saveContractToCloud(newClientData);
      if (savedContract) {
        setClientsList((prev) => [savedContract, ...prev]);
        return { success: true, contract: savedContract };
      }
    } catch (err) {
      console.error("خطأ أثناء حفظ العقد:", err);
      return { success: false, error: err };
    }
  };

  // ☁️ تحديث بيانات عقد مع عكس الأرقام على الشاشة فوراً
  const handleUpdateContract = async (updatedContract) => {
    try {
      const saved = await updateContractInCloud(updatedContract);
      if (saved) {
        setClientsList((prev) =>
          prev.map((c) => (c.id === saved.id ? saved : c))
        );
        return { success: true, contract: saved };
      }
    } catch (err) {
      console.error("خطأ أثناء تحديث العقد:", err);
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
