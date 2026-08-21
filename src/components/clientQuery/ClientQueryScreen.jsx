/**
 * =========================================================
 * 📌 الشاشة: الشاشة الرئيسية للاستعلام (Client Query Main Screen)
 * 📁 المسار: src/components/clientQuery/ClientQueryScreen.jsx
 * 📝 الوظيفة: إدارة شريط البحث، التبديل بين التبويبات (النشطة / الأرشيف)،
 *              ومعالجة تنبيه العقود المتعددة لنفس رقم الهاتف بالهيكلة الجديدة.
 * =========================================================
 */

import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, X, FileSpreadsheet, FileText, FolderArchive, Layers, Loader2 } from "lucide-react";
import { filterContracts, findContractsByPhone } from "../../services/clientQueryService";
import { fetchAllClientsContracts } from "../../services/clientFetchService";
import { supabase } from "../../supabaseClient";
import { AllClientsRegisterModal } from "./AllClientsRegisterModal";
import { ArchivedContractsView } from "./ArchivedContractsView";
import { ClientDetailCard } from "./ClientDetailCard";

export function ClientQueryScreen({ contracts = [], onUpdateContract, onBack, t = {}, themeStyles = {}, deepLink, onDeepLinkHandled }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [activeTab, setActiveTab] = useState("active"); // "active" | "archive"
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!deepLink) return;
    if (deepLink === "archive") {
      setActiveTab("archive");
      setSelectedContract(null);
    } else if (typeof deepLink === "object") {
      const raw = deepLink;
      const cName = raw.client_name || raw.clientName || raw.name || "عميل بدون اسم";
      const cPhone = raw.client_phone || raw.clientPhone || raw.phone || "";
      const cItem = raw.item_name || raw.itemName || raw.item || "";
      const cSale = Number(raw.sale_price ?? raw.salePrice ?? raw.sale ?? 0);
      const cCost = Number(raw.cost_price ?? raw.costPrice ?? raw.cost ?? 0);
      const cDown = Number(raw.down_payment ?? raw.downPayment ?? raw.down ?? 0);
      const cMonthly = Number(raw.monthly_installment ?? raw.monthlyInstallment ?? raw.monthly ?? 0);
      const cGName = raw.guarantor_name || raw.guarantorName || raw.guarantor || "";
      const cGPhone = raw.guarantor_phone || raw.guarantorPhone || "";
      const cNatId = raw.national_id || raw.nationalId || "";
      const cAddr = raw.address || "";
      const cDate = raw.contract_date || raw.contractDate || raw.created_at || "";
      const cFirstPay = raw.first_installment_date || raw.firstPayDate || raw.firstInstallmentDate || "";

      setSelectedContract({
        ...raw,
        id: raw.id,
        name: cName, client_name: cName, clientName: cName,
        phone: cPhone, client_phone: cPhone, clientPhone: cPhone,
        item: cItem, item_name: cItem, itemName: cItem,
        sale: cSale, sale_price: cSale, salePrice: cSale,
        cost: cCost, cost_price: cCost, costPrice: cCost,
        down: cDown, down_payment: cDown, downPayment: cDown,
        monthly: cMonthly, monthly_installment: cMonthly, monthlyInstallment: cMonthly,
        guarantor: cGName, guarantor_name: cGName, guarantorName: cGName,
        guarantorPhone: cGPhone, guarantor_phone: cGPhone,
        national_id: cNatId, nationalId: cNatId,
        address: cAddr,
        contractDate: cDate, contract_date: cDate,
        firstPayDate: cFirstPay, first_installment_date: cFirstPay, firstInstallmentDate: cFirstPay,
        notes: raw.notes || "",
        status: raw.status || (raw.is_deleted ? "archived" : "active"),
        installments: Array.isArray(raw.installments) ? raw.installments : []
      });
      setActiveTab("active");
    }
    if (typeof onDeepLinkHandled === "function") onDeepLinkHandled();
  }, [deepLink, onDeepLinkHandled]);

  // 🔄 الجلب المباشر والتخزين الداخلي
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
        console.error("❌ خطأ أثناء جلب عقود الاستعلام:", err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // 💾 دالة حفظ تعديلات العقد المباشرة بسحابة Supabase
  const handleSaveInlineContract = async (updatedData) => {
    try {
      const contractId = updatedData.id || selectedContract?.id;
      if (!contractId) return;

      const payload = {
        client_name: updatedData.client_name || updatedData.clientName || updatedData.name,
        client_phone: updatedData.client_phone || updatedData.clientPhone || updatedData.phone,
        national_id: updatedData.national_id || updatedData.nationalId || "",
        address: updatedData.address || "",
        item_name: updatedData.item_name || updatedData.itemName || updatedData.item,
        sale_price: Number(updatedData.sale_price ?? updatedData.salePrice ?? updatedData.sale ?? 0),
        cost_price: Number(updatedData.cost_price ?? updatedData.costPrice ?? updatedData.cost ?? 0),
        down_payment: Number(updatedData.down_payment ?? updatedData.downPayment ?? updatedData.down ?? 0),
        monthly_installment: Number(updatedData.monthly_installment ?? updatedData.monthlyInstallment ?? updatedData.monthly ?? 0),
        guarantor_name: updatedData.guarantor_name || updatedData.guarantorName || updatedData.guarantor || "",
        guarantor_phone: updatedData.guarantor_phone || updatedData.guarantorPhone || "",
        contract_date: updatedData.contract_date || updatedData.contractDate || "",
        first_installment_date: updatedData.first_installment_date || updatedData.firstPayDate || updatedData.firstInstallmentDate || "",
        notes: updatedData.notes || ""
      };

      const { error } = await supabase
        .from("contracts")
        .update(payload)
        .eq("id", contractId);

      if (error) throw error;

      // 🔄 إعادة جلب البيانات لتثبيت التعديل بالسحابة
      const data = await fetchAllClientsContracts();
      setFetchedContracts(data || []);

      const refreshed = (data || []).find((c) => String(c.id) === String(contractId));
      setSelectedContract(refreshed || updatedData);

      if (onUpdateContract) onUpdateContract(refreshed || updatedData);
    } catch (err) {
      console.error("❌ خطأ في حفظ التعديلات سحابياً:", err);
      alert("حدث خطأ أثناء حفظ التعديلات بالسحابة");
    }
  };

  // التحكم في نافذة العقود المتعددة
  const [multiContractList, setMultiContractList] = useState([]);
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);

  // تطبيع وتوحيد شكل البيانات ومعالجة كافة التواريخ والضامن
  const normalizedContracts = useMemo(() => {
    const listToUse = fetchedContracts.length > 0 ? fetchedContracts : contracts;
    return (listToUse || []).map((c) => {
      const cDate = c.contractDate || c.contract_date || c.created_at || "";
      const fInst = c.first_installment_date || c.firstPayDate || c.firstInstallmentDate || "";
      const gName = c.guarantor_name || c.guarantorName || c.guarantor || "";
      const gPhone = c.guarantor_phone || c.guarantorPhone || "";
      const natId = c.national_id || c.nationalId || "";
      const addr = c.address || "";

      return {
        ...c,
        id: c.id,
        name: c.clientName || c.client_name || c.name || "عميل بدون اسم",
        phone: c.clientPhone || c.client_phone || c.phone || "",
        national_id: natId,
        nationalId: natId,
        address: addr,
        item: c.itemName || c.item_name || c.item || "",
        contractDate: cDate,
        contract_date: cDate,
        firstPayDate: fInst,
        first_installment_date: fInst,
        firstInstallmentDate: fInst,
        guarantor: gName,
        guarantor_name: gName,
        guarantorName: gName,
        guarantorPhone: gPhone,
        guarantor_phone: gPhone,
        status: c.status || (c.is_deleted ? "archived" : "active")
      };
    });
  }, [fetchedContracts, contracts]);

  // إحصاءات الأعداد للتبويبات
  const activeCount = useMemo(() => filterContracts(normalizedContracts, "", false).length, [normalizedContracts]);
  const archiveCount = useMemo(() => filterContracts(normalizedContracts, "", true).length, [normalizedContracts]);

  // ✅ قائمة اقتراحات آمنة تحمي من انهيار الشاشة البيضاء
const suggestions = useMemo(() => {
  const q = String(searchQuery || "").trim().toLowerCase();

  return (normalizedContracts || []).filter((item) => {
    if (!item) return false;
    const isArchived = item.status === "archived" || item.status === "deleted" || item.is_deleted;
    const isMatchTab = activeTab === "archive" ? isArchived : !isArchived;

    if (!isMatchTab) return false;
    if (!q) return true;

    const name = String(item.name || "").toLowerCase();
    const phone = String(item.phone || "").toLowerCase();
    const itemName = String(item.item || "").toLowerCase();

    return name.includes(q) || phone.includes(q) || itemName.includes(q);
  });
}, [normalizedContracts, searchQuery, activeTab]);

  // ✅ معالجة اختيار العميل مع حماية الأرقام الفارغة
const handleSelectSearchItem = (contract) => {
  const phone = String(contract.phone || "").trim();
  
  if (phone) {
    const matched = (normalizedContracts || []).filter(
      (c) => String(c.phone || "").trim() === phone
    );

    if (matched.length > 1) {
      setMultiContractList(matched);
      setIsMultiModalOpen(true);
      return;
    }
  }

  setSelectedContract(contract);
};

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "10px", fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} /> {t.back || (isEN ? "Back" : "رجوع")}
        </button>
        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          {t.clientQueryTitle || (isEN ? "Client Query & Inquiry" : "استعلام عن عميل")}
        </h2>
        <button type="button" onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText || "#aaaaaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {/* TOP EXCEL BANNER BUTTON */}
      <button
        type="button"
        onClick={() => setIsExcelModalOpen(true)}
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #e07a5f, #d4af37)",
          color: "#111111",
          border: "none",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "14px",
          fontWeight: 800,
          cursor: "pointer",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: "0 4px 15px rgba(224,122,95,0.2)"
        }}
      >
        <FileSpreadsheet size={18} />
        [ 📊 {t.openFullRegisterExcel || (isEN ? "Open Full Client Register - Excel Mode" : "فتح سجل بيانات العملاء الشامل - نمط Excel")} ]
      </button>

      {/* TABS NAVIGATION */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => { setActiveTab("active"); setSelectedContract(null); }}
          style={{
            background: activeTab === "active" ? (themeStyles.accentGold || "#e8cd9c") : (themeStyles.card || "#1e1e1e"),
            color: activeTab === "active" ? "#111111" : (themeStyles.text || "#ffffff"),
            border: `1px solid ${themeStyles.border || "#333333"}`,
            borderRadius: "12px",
            padding: "12px",
            fontWeight: 800,
            fontSize: "13.5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <FileText size={16} />
          {t.activeContracts || (isEN ? "Active Contracts" : "العقود النشطة")} ({activeCount})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("archive"); setSelectedContract(null); }}
          style={{
            background: activeTab === "archive" ? (themeStyles.accentGold || "#e8cd9c") : (themeStyles.card || "#1e1e1e"),
            color: activeTab === "archive" ? "#111111" : (themeStyles.text || "#ffffff"),
            border: `1px solid ${themeStyles.border || "#333333"}`,
            borderRadius: "12px",
            padding: "12px",
            fontWeight: 800,
            fontSize: "13.5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <FolderArchive size={16} />
          {t.archivedContracts || (isEN ? "Fully Paid Contracts Archive" : "أرشيف العقود المسددة بالكامل")} ({archiveCount})
        </button>
      </div>

      {/* TAB CONTENT 1: ACTIVE CONTRACTS QUERY */}
      {activeTab === "active" && (
        <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "18px", padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: themeStyles.subText || "#aaaaaa", marginBottom: "8px" }}>
              {t.searchPlaceholder || (isEN ? "Search by client name, phone, or item..." : "ابحث باسم العميل أو رقم التليفون أو السلعة")}
            </label>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => {
              setShowDropdown(true);
              setSelectedContract(null);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedContract(null);
              setShowDropdown(true);
            }}
  placeholder={t.searchPlaceholder || (isEN ? "Search by client name, phone, or item..." : "بحث باسم العميل أو التليفون أو السلعة...")}
  style={{
    width: "100%",
    background: themeStyles.inputBg || "#1b1b1d",
    border: `1px solid ${themeStyles.border || "#333333"}`,
    borderRadius: "10px",
    padding: "12px 14px",
    color: themeStyles.text || "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  }}
/>
          </div>

          {/* LOADER INDICATOR */}
          {loadingData && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", color: themeStyles.accentGold || "#e8cd9c", fontSize: "13px", fontWeight: 700 }}>
              <Loader2 size={18} className="animate-spin" /> جاري جلب العقود من السحابة...
            </div>
          )}

          {/* SUGGESTIONS LIST */}
          {(showDropdown || searchQuery) && !selectedContract && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
              {suggestions.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => {
                    handleSelectSearchItem(item);
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    background: themeStyles.inputBg || "#1b1b1d",
                    border: `1px solid ${themeStyles.border || "#333333"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontWeight: 700, color: themeStyles.accentGold || "#e8cd9c" }}>{item.name} — {item.item}</span>
                  <span style={{ fontSize: "12px", color: themeStyles.subText || "#888888" }} dir="ltr">{item.phone}</span>
                </div>
              ))}
            </div>
          )}

          {/* SELECTED CONTRACT DETAIL */}
          {selectedContract && (
            <ClientDetailCard
              contract={selectedContract}
              onSaveUpdate={handleSaveInlineContract}
              t={t}
              themeStyles={themeStyles}
            />
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ARCHIVED CONTRACTS */}
      {activeTab === "archive" && (
        <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "18px", padding: "20px" }}>
          <ArchivedContractsView contracts={normalizedContracts} t={t} themeStyles={themeStyles} />
        </div>
      )}

      {/* MODAL 1: EXCEL REGISTER */}
      <AllClientsRegisterModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        contracts={normalizedContracts}
        t={t}
        themeStyles={themeStyles}
      />

      {/* MODAL 2: MULTI-CONTRACT SELECTION FOR SAME PHONE */}
      {isMultiModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "500px", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800 }}>
                {t.multiContractAlertTitle || (isEN ? "Notice: Client has multiple contracts with this phone" : "تنبيه: العميل لديه أكثر من عقد برقم التليفون")}
              </h3>
              <button type="button" onClick={() => setIsMultiModalOpen(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "16px" }}>
              {t.multiContractAlertDesc || (isEN ? "Please select the contract you want to view and edit from the following list:" : "يرجى اختيار العقد المراد الاستعلام عن بياناته وتعديله من القائمة التالية:")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {multiContractList.map((c, idx) => (
                <button
                  key={c.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedContract(c);
                    setIsMultiModalOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    background: themeStyles.inputBg || "#1b1b1d",
                    border: `1px solid ${themeStyles.border || "#333333"}`,
                    borderRadius: "10px",
                    color: themeStyles.text || "#ffffff",
                    cursor: "pointer",
                    textAlign: isEN ? "left" : "right"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
                      {(t.itemHeader || (isEN ? "Item" : "السلعة"))}: {c.item}
                    </div>
                    <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888", marginTop: "2px" }}>
                      {(t.contractDateHeader || (isEN ? "Contract Date" : "تاريخ التعاقد"))}: {c.contractDate || "-"}
                    </div>
                  </div>
                  <Layers size={18} style={{ color: themeStyles.accentGold || "#e07a5f" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientQueryScreen;
