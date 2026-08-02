/**
 * =========================================================
 * 📌 المكون: كارت تفاصيل وتعديل العقد (Client Detail Card)
 * 📁 المسار: src/components/clientQuery/ClientDetailCard.jsx
 * 📝 الوظيفة: عرض الموقف المالي وتعديل بيانات العقد مترجماً.
 * =========================================================
 */

import React, { useState, useEffect } from "react";
import { Edit3, Save, X } from "lucide-react";

export function ClientDetailCard({ contract, onUpdateContract, t, themeStyles }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...contract });

  useEffect(() => {
    setFormData({ ...contract });
  }, [contract]);

  const calculateFinances = (data) => {
    const sale = Number(data.sale) || 0;
    const down = Number(data.down) || 0;
    const paid = Number(data.paidAmount) || 0;
    const totalCollected = down + paid;
    const remaining = Math.max(0, sale - totalCollected);
    return { totalCollected, remaining };
  };

  const currentFinances = calculateFinances(formData);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const finances = calculateFinances(formData);
    const updatedPayload = {
      ...formData,
      cost: Number(formData.cost) || 0,
      sale: Number(formData.sale) || 0,
      down: Number(formData.down) || 0,
      monthly: Number(formData.monthly) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      remainingAmount: finances.remaining
    };

    onUpdateContract(updatedPayload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...contract });
    setIsEditing(false);
  };

  return (
    <div style={{
      background: themeStyles.card,
      border: `1px solid ${themeStyles.border}`,
      borderRadius: themeStyles.cardRadius || 16,
      padding: 24,
      marginBottom: 20
    }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" }}>
          {t.clientNameHeader}: {formData.name}
        </h3>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: `1px solid ${themeStyles.accentGold || "#d4af37"}`,
              color: themeStyles.accentGold || "#d4af37", padding: "8px 16px", borderRadius: 10,
              cursor: "pointer", fontWeight: 700, fontSize: 13
            }}
          >
            <Edit3 size={15} /> {t.editClientData}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#16a34a", border: "none", color: "#fff",
                padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13
              }}
            >
              <Save size={15} /> {t.saveChanges}
            </button>
            <button
              onClick={handleCancel}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#dc2626", border: "none", color: "#fff",
                padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13
              }}
            >
              <X size={15} /> {t.cancel}
            </button>
          </div>
        )}
      </div>

      {/* 1. بيانات العميل والضامن */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.clientNameHeader} *</label>
          <input
            disabled={!isEditing}
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.clientPhoneHeader} *</label>
          <input
            disabled={!isEditing}
            type="text"
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.guarantorNameHeader}</label>
          <input
            disabled={!isEditing}
            type="text"
            value={formData.guarantor || ""}
            onChange={(e) => handleChange("guarantor", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.guarantorPhoneHeader}</label>
          <input
            disabled={!isEditing}
            type="text"
            value={formData.guarantorPhone || ""}
            onChange={(e) => handleChange("guarantorPhone", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
      </div>

      {/* 2. بيانات السلعة والماليات */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.itemHeader} *</label>
        <input
          disabled={!isEditing}
          type="text"
          value={formData.item || ""}
          onChange={(e) => handleChange("item", e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.costPriceHeader} *</label>
          <input
            disabled={!isEditing}
            type="number"
            value={formData.cost || 0}
            onChange={(e) => handleChange("cost", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.salePriceHeader} *</label>
          <input
            disabled={!isEditing}
            type="number"
            value={formData.sale || 0}
            onChange={(e) => handleChange("sale", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.downPaymentHeader} *</label>
          <input
            disabled={!isEditing}
            type="number"
            value={formData.down || 0}
            onChange={(e) => handleChange("down", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: themeStyles.subText, marginBottom: 4 }}>{t.monthlyInstallmentHeader} *</label>
          <input
            disabled={!isEditing}
            type="number"
            value={formData.monthly || 0}
            onChange={(e) => handleChange("monthly", e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`, color: themeStyles.text, fontWeight: 700 }}
          />
        </div>
      </div>

      {/* 3. الموقف المالي الحقيقي */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{ background: themeStyles.inputBg, borderRadius: 12, padding: 16, border: `1px solid ${themeStyles.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: themeStyles.subText, fontWeight: 700 }}>{t.totalCollectedHeader}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>
            {currentFinances.totalCollected} {t.currency}
          </div>
        </div>

        <div style={{ background: themeStyles.inputBg, borderRadius: 12, padding: 16, border: `1px solid ${themeStyles.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: themeStyles.subText, fontWeight: 700 }}>{t.totalRemainingHeader}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#ef4444", marginTop: 4 }}>
            {currentFinances.remaining} {t.currency}
          </div>
        </div>

        <div style={{
          background: currentFinances.remaining <= 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(14, 116, 144, 0.1)",
          borderRadius: 12, padding: 16,
          border: `1px solid ${currentFinances.remaining <= 0 ? "#22c55e" : "#0e7490"}`,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 12, color: themeStyles.subText, fontWeight: 700 }}>{t.contractStatusHeader}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: currentFinances.remaining <= 0 ? "#22c55e" : "#38bdf8", marginTop: 6 }}>
            {currentFinances.remaining <= 0 ? t.contractPaidStatus : t.contractActiveStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
