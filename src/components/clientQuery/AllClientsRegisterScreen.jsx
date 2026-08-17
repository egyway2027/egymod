/**
 * =========================================================
 * 📌 الشاشة: سجل بيانات العملاء الشامل (مستقلة)
 * 📁 المسار: src/components/clientQuery/AllClientsRegisterScreen.jsx
 * =========================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { fetchAllClientsContracts } from "../../services/clientFetchService";
import { normalizeContracts } from "../../services/clientQueryService";
import { AllClientsRegisterModal } from "./AllClientsRegisterModal";

export function AllClientsRegisterScreen({ contracts = [], onBack, t = {}, themeStyles = {} }) {
  const [fetchedContracts, setFetchedContracts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingData(true);
        const data = await fetchAllClientsContracts();
        if (isMounted) setFetchedContracts(data || []);
      } catch (err) {
        console.error("❌ خطأ أثناء جلب سجل العملاء الشامل:", err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const normalizedContracts = useMemo(() => {
    const listToUse = fetchedContracts.length > 0 ? fetchedContracts : contracts;
    return normalizeContracts(listToUse);
  }, [fetchedContracts, contracts]);

  if (loadingData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 12, color: themeStyles.subText || "#aaaaaa" }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>جاري تحميل سجل العملاء...</span>
      </div>
    );
  }

  return (
    <AllClientsRegisterModal
      isOpen={true}
      onClose={onBack}
      contracts={normalizedContracts}
      t={t}
      themeStyles={themeStyles}
    />
  );
}

export default AllClientsRegisterScreen;
