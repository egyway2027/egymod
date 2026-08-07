/**
 * =========================================================
 * 📌 الشاشة: الشاشة الرئيسية للاستعلام (Client Query Main Screen)
 * 📁 المسار: src/components/clientQuery/ClientQueryScreen.jsx
 * 📝 الوظيفة: إدارة شريط البحث، التبديل بين التبويبات (النشطة / الأرشيف)،
 *              ومعالجة تنبيه العقود المتعددة لنفس رقم الهاتف بالهيكلة الجديدة.
 * =========================================================
 */

import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, X, FileSpreadsheet, FileText, FolderArchive, Layers, Loader2, Edit, Save } from "lucide-react";
import { filterContracts, findContractsByPhone } from "../../services/clientQueryService";
import { fetchAllClientsContracts } from "../../services/clientFetchService";
import { supabase } from "../../supabaseClient";
import { AllClientsRegisterModal } from "./AllClientsRegisterModal";
import { ArchivedContractsView } from "./ArchivedContractsView";
import { ClientDetailCard } from "./ClientDetailCard";

export function ClientQueryScreen({ contracts = [], onUpdateContract, onBack, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [activeTab, setActiveTab] = useState("active"); // "active" | "archive"
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);

  // 🔄 الجلب المباشر والتخزين الداخلي
  const [fetchedContracts, setFetchedContracts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // 💾 دالة حفظ تعديلات البطاقة الأساسية مباشرة بداخل سحابة Supabase
  const handleSaveInlineContract = async (updatedData) => {
    try {
      const contractId = updatedData.id || selectedContract?.id;
      if (!contractId) return;

      const payload = {
        client_name: updatedData.client_name || updatedData.clientName || updatedData.name,
        client_phone: updatedData.client_phone || updatedData.clientPhone || updatedData.phone,
        item_name: updatedData.item_name || updatedData.itemName || updatedData.item,
        sale_price: Number(updatedData.sale_price ?? updatedData.salePrice ?? updatedData.sale ?? 0),
        cost_price: Number(updatedData.cost_price ?? updatedData.costPrice ?? updatedData.cost ?? 0),
        down_payment: Number(updatedData.down_payment ?? updatedData.downPayment ?? updatedData.down ?? 0),
        monthly_installment: Number(updatedData.monthly_installment ?? updatedData.monthlyInstallment ?? updatedData.monthly ?? 0),
        guarantor_name: updatedData.guarantor_name || updatedData.guarantorName || "",
        guarantor_phone: updatedData.guarantor_phone || updatedData.guarantorPhone || "",
        notes: updatedData.notes || ""
      };

      const { error } = await supabase
        .from("contracts")
        .update(payload)
        .eq("id", contractId);

      if (error) throw error;

      // 🔄 إعادة جلب العقود سحابياً لتثبيت البيانات المعدلة
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

  // التحكم في نافذة العقود المتعددة
  const [multiContractList, setMultiContractList] = useState([]);
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);

  // تطبيع وتوحيد شكل البيانات للعمل مع الجداول المفصولة والقديمة
  const normalizedContracts = useMemo(() => {
    const listToUse = fetchedContracts.length > 0 ? fetchedContracts : contracts;
    return (listToUse || []).map((c) => ({
      ...c,
      id: c.id,
      name: c.clientName || c.client_name || c.name || "عميل بدون اسم",
      phone: c.clientPhone || c.client_phone || c.phone || "",
      item: c.itemName || c.item_name || c.item || "",
      contractDate: c.contractDate || c.contract_date || c.created_at || "",
      status: c.status || (c.is_deleted ? "archived" : "active")
    }));
  }, [contracts]);

  // إحصاءات الأعداد للتبويبات
  const activeCount = useMemo(() => filterContracts(normalizedContracts, "", false).length, [normalizedContracts]);
  const archiveCount = useMemo(() => filterContracts(normalizedContracts, "", true).length, [normalizedContracts]);

  // ✅ قائمة اقتراحات آمنة تحمي من انهيار الشاشة البيضاء
const suggestions = useMemo(() => {
  const q = String(searchQuery || "").trim().toLowerCase();
  if (!q) return [];

  return (normalizedContracts || []).filter((item) => {
    const isArchived = item.status === "archived" || item.status === "deleted" || item.is_deleted;
    const isMatchTab = activeTab === "archive" ? isArchived : !isArchived;

    if (!isMatchTab) return false;

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
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setSelectedContract(null); // 🎯 إعادة إظهار قائمة الاقتراحات عند التعديل
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
          {searchQuery && !selectedContract && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchItem(item)}
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
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditClient({
                    id: selectedContract.id,
                    client_name: selectedContract.client_name || selectedContract.clientName || selectedContract.name || "",
                    client_phone: selectedContract.client_phone || selectedContract.clientPhone || selectedContract.phone || "",
                    item_name: selectedContract.item_name || selectedContract.itemName || selectedContract.item || "",
                    sale_price: selectedContract.sale_price || selectedContract.salePrice || selectedContract.sale || 0,
                    cost_price: selectedContract.cost_price || selectedContract.costPrice || selectedContract.cost || 0,
                    down_payment: selectedContract.down_payment || selectedContract.downPayment || selectedContract.down || 0,
                    monthly_installment: selectedContract.monthly_installment || selectedContract.monthlyInstallment || selectedContract.monthly || 0,
                    guarantor_name: selectedContract.guarantor_name || selectedContract.guarantorName || "",
                    guarantor_phone: selectedContract.guarantor_phone || selectedContract.guarantorPhone || ""
                  })}
                  style={{
                    background: "linear-gradient(135deg, #d69a5f, #b06a35)",
                    color: "#111111",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Edit size={16} /> تعديل بيانات العقد
                </button>
              </div>
              <ClientDetailCard
                contract={selectedContract}
                onSaveUpdate={(updated) => {
                  if (onUpdateContract) onUpdateContract(updated);
                  setSelectedContract(updated);
                }}
                t={t}
                themeStyles={themeStyles}
              />
            </div>
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
      {/* MODAL 3: EDIT CONTRACT DATA */}
      {editClient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }}>
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: 18, padding: 24, width: "100%", maxWidth: 550, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: `1px solid ${themeStyles.border || "#333333"}`, paddingBottom: 12 }}>
              <h3 style={{ margin: 0, color: themeStyles.accentGold || "#d4af37", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <Edit size={20} /> تعديل بيانات العقد والعميل
              </h3>
              <X style={{ cursor: "pointer", color: "#aaa" }} onClick={() => setEditClient(null)} />
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>اسم العميل</label>
                  <input type="text" value={editClient.client_name} onChange={(e) => setEditClient({ ...editClient, client_name: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>رقم الهاتف</label>
                  <input type="text" value={editClient.client_phone} onChange={(e) => setEditClient({ ...editClient, client_phone: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>اسم السلعة / المباع</label>
                <input type="text" value={editClient.item_name} onChange={(e) => setEditClient({ ...editClient, item_name: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>سعر البيع (إجمالي العقد)</label>
                  <input type="number" value={editClient.sale_price} onChange={(e) => setEditClient({ ...editClient, sale_price: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>سعر التكلفة الأصلي</label>
                  <input type="number" value={editClient.cost_price} onChange={(e) => setEditClient({ ...editClient, cost_price: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>المبلغ المقدم</label>
                  <input type="number" value={editClient.down_payment} onChange={(e) => setEditClient({ ...editClient, down_payment: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>القسط الشهري</label>
                  <input type="number" value={editClient.monthly_installment} onChange={(e) => setEditClient({ ...editClient, monthly_installment: e.target.value })} required style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>اسم الضامن</label>
                  <input type="text" value={editClient.guarantor_name} onChange={(e) => setEditClient({ ...editClient, guarantor_name: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#aaa", fontWeight: 700, display: "block", marginBottom: 4 }}>هاتف الضامن</label>
                  <input type="text" value={editClient.guarantor_phone} onChange={(e) => setEditClient({ ...editClient, guarantor_phone: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#141414", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button type="submit" disabled={loadingSave} style={{ flex: 1, background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#111", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Save size={16} /> {loadingSave ? "جاري الحفظ..." : "حفظ التعديلات سحابياً"}
                </button>
                <button type="button" onClick={() => setEditClient(null)} style={{ background: "#222", border: "1px solid #444", color: "#fff", borderRadius: 10, padding: "12px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientQueryScreen;
