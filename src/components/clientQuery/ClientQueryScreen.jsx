/**
 * =========================================================
 * 📌 الملف: شاشة الاستعلام الرئيسية (Client Query Screen)
 * 📁 المسار: src/components/clientQuery/ClientQueryScreen.jsx
 * 📝 الوظيفة: محرك البحث والتنقل مع ضبط الأبعاد والاتجهات (RTL/LTR).
 * =========================================================
 */

import React, { useState } from "react";
import { Search, ArrowRight, ArrowLeft, FileSpreadsheet, Layers, Archive, X } from "lucide-react";
import { ClientDetailCard } from "./ClientDetailCard";
import { AllClientsRegisterModal } from "./AllClientsRegisterModal";
import { ArchivedContractsView } from "./ArchivedContractsView";

export function ClientQueryScreen({ contracts = [], onUpdateContract, onBack, t, themeStyles }) {
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFullRegister, setShowFullRegister] = useState(false);

  const isRTL = document.documentElement.dir === "rtl";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const activeContracts = contracts.filter(c => (Number(c.remainingAmount) || 0) > 0);
  const archivedContracts = contracts.filter(c => (Number(c.remainingAmount) || 0) <= 0);

  const filteredActiveContracts = activeContracts.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(term) ||
      (c.phone || "").includes(term) ||
      (c.item || "").toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. الشريط العلوي Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: themeStyles.card, border: `1px solid ${themeStyles.border}`,
        borderRadius: themeStyles.cardRadius || 16, padding: "16px 24px", marginBottom: 20
      }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "transparent",
            border: `1px solid ${themeStyles.border}`, color: themeStyles.text,
            padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13
          }}
        >
          <BackIcon size={16} /> {t.back}
        </button>

        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" }}>
          {t.clientQueryTitle}
        </h2>

        <button
          onClick={onBack}
          style={{ background: "transparent", border: "none", color: themeStyles.subText, cursor: "pointer" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. زر فتح سجل بيانات العملاء الشامل */}
      <button
        onClick={() => setShowFullRegister(true)}
        style={{
          width: "100%", padding: "16px 24px", marginBottom: 20,
          background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 100%)",
          border: "none", borderRadius: themeStyles.buttonRadius || 14, color: "#fff",
          fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 4px 15px rgba(176, 106, 53, 0.3)"
        }}
      >
        <FileSpreadsheet size={20} /> {t.openFullRegisterExcel}
      </button>

      {/* 3. تبويبات التنقل */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 20px", borderRadius: themeStyles.buttonRadius || 12,
            border: `1px solid ${activeTab === "active" ? themeStyles.accentGold : themeStyles.border}`,
            background: activeTab === "active" ? themeStyles.accentGold : themeStyles.card,
            color: activeTab === "active" ? "#fff" : themeStyles.text,
            fontWeight: 800, fontSize: 14, cursor: "pointer"
          }}
        >
          <Layers size={18} /> {t.activeContracts} ({activeContracts.length})
        </button>

        <button
          onClick={() => setActiveTab("archived")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 20px", borderRadius: themeStyles.buttonRadius || 12,
            border: `1px solid ${activeTab === "archived" ? themeStyles.accentGold : themeStyles.border}`,
            background: activeTab === "archived" ? themeStyles.accentGold : themeStyles.card,
            color: activeTab === "archived" ? "#fff" : themeStyles.text,
            fontWeight: 800, fontSize: 14, cursor: "pointer"
          }}
        >
          <Archive size={18} /> {t.archivedContracts} ({archivedContracts.length})
        </button>
      </div>

      {/* 4. محتوى التبويب النشط */}
      {activeTab === "active" ? (
        <div>
          {/* مربع البحث مع التموضع المضبوط حركياً */}
          <div style={{
            background: themeStyles.card, border: `1px solid ${themeStyles.border}`,
            borderRadius: themeStyles.cardRadius || 16, padding: 20, marginBottom: 20
          }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: themeStyles.text, marginBottom: 8 }}>
              {t.searchPlaceholder}
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  width: "100%",
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: isRTL ? 16 : 42,
                  paddingRight: isRTL ? 42 : 16,
                  borderRadius: 10,
                  background: themeStyles.inputBg,
                  border: `1px solid ${themeStyles.border}`,
                  color: themeStyles.text,
                  fontWeight: 700,
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              />
              <Search
                size={18}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: isRTL ? "auto" : 14,
                  right: isRTL ? 14 : "auto",
                  color: themeStyles.subText,
                  pointerEvents: "none"
                }}
              />
            </div>
          </div>

          {/* قائمة كروت العقود النشطة */}
          {filteredActiveContracts.length > 0 ? (
            filteredActiveContracts.map((contract) => (
              <ClientDetailCard
                key={contract.id}
                contract={contract}
                onUpdateContract={onUpdateContract}
                t={t}
                themeStyles={themeStyles}
              />
            ))
          ) : (
            <div style={{
              background: themeStyles.card, border: `1px solid ${themeStyles.border}`,
              borderRadius: 16, padding: 40, textAlign: "center", color: themeStyles.subText, fontWeight: 700
            }}>
              {t.noDataFound}
            </div>
          )}
        </div>
      ) : (
        <ArchivedContractsView
          archivedContracts={archivedContracts}
          t={t}
          themeStyles={themeStyles}
        />
      )}

      {/* 5. مودال سجل العملاء الشامل */}
      {showFullRegister && (
        <AllClientsRegisterModal
          contracts={contracts}
          onClose={() => setShowFullRegister(false)}
          t={t}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}
