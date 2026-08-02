/**
 * =========================================================
 * 📌 المكون: كارت تفاصيل وتعديل العقد (Client Detail & Edit Card)
 * 📁 المسار: src/components/clientQuery/ClientDetailCard.jsx
 * 📝 الوظيفة: عرض موقف العقد المالي، وإتاحة وضع التعديل المباشر
 *            لبيانات العميل والسلعة والتواريخ للحفظ السحابي.
 * =========================================================
 */

import React, { useState } from "react";
import { Edit3, CheckCircle, XCircle } from "lucide-react";
import { CustomDatePicker } from "../CustomDatePicker";
import { getContractStatus } from "../../services/clientQueryService";

export function ClientDetailCard({ contract, onSaveUpdate, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...contract });

  if (!contract) return null;

  const status = getContractStatus(contract, isEN);

  const inputStyle = {
    width: "100%",
    background: themeStyles.inputBg || "#121214",
    border: `1px solid ${themeStyles.border || "#333333"}`,
    borderRadius: "10px",
    padding: "10px 12px",
    color: themeStyles.text || "#ffffff",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "12.5px",
    fontWeight: 700,
    color: themeStyles.subText || "#aaaaaa"
  };

  const handleContractDateChange = (e) => {
    const cDate = e.target.value;
    if (!cDate) {
      setEditForm((prev) => ({ ...prev, contractDate: "", firstPayDate: "" }));
      return;
    }
    const d = new Date(cDate);
    d.setMonth(d.getMonth() + 1);
    const firstPay = d.toISOString().split("T")[0];
    setEditForm((prev) => ({ ...prev, contractDate: cDate, firstPayDate: firstPay }));
  };

  const handleSave = () => {
    if (onSaveUpdate) {
      onSaveUpdate(editForm);
    }
    setIsEditing(false);
  };

  return (
    <div style={{ background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginTop: "16px" }}>
      {/* Header Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, paddingBottom: "12px" }}>
        <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800 }}>
          {isEditing 
            ? `${t.editClientDataTitle || (isEN ? "Edit Client Data:" : "تعديل بيانات العميل:")} ${contract.name}` 
            : `${t.clientDataTitle || (isEN ? "Client Contract Details:" : "بيانات عقد العميل:")} ${contract.name}`}
        </h3>
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(224,122,95,0.15)", border: "1px solid #e07a5f", color: "#e07a5f", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12.5px", fontWeight: 700 }}>
            <Edit3 size={14} /> {t.editClientDataBtn || (isEN ? "Edit Client Data" : "تعديل بيانات العميل")}
          </button>
        ) : (
          <button type="button" onClick={() => setIsEditing(false)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.08)", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.text || "#ffffff", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12.5px", fontWeight: 700 }}>
            <XCircle size={14} /> {t.cancelEdit || (isEN ? "Cancel Editing" : "إلغاء التعديل")}
          </button>
        )}
      </div>

      {/* SECTION 1: Client Info */}
      <div style={{ color: themeStyles.accentGold || "#e07a5f", fontSize: "13px", fontWeight: 800, marginBottom: "10px" }}>
        {t.clientAndGuarantorSection || (isEN ? "Client & Guarantor Information" : "بيانات العميل والضامن")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <label style={labelStyle}>
          <span>{t.clientNameLabel || (isEN ? "Client Name *" : "اسم العميل *")}</span>
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.name : contract.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
        </label>
        <label style={labelStyle}>
          <span>{t.clientPhoneLabel || (isEN ? "Client Phone *" : "تليفون العميل *")}</span>
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.phone : contract.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
        </label>
        <label style={labelStyle}>
          <span>{t.guarantorNameLabel || (isEN ? "Guarantor Name" : "اسم الضامن")}</span>
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.guarantor : (contract.guarantor || "-")} onChange={(e) => setEditForm({ ...editForm, guarantor: e.target.value })} />
        </label>
        <label style={labelStyle}>
          <span>{t.guarantorPhoneLabel || (isEN ? "Guarantor Phone" : "تليفون الضامن")}</span>
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.guarantorPhone : (contract.guarantorPhone || "-")} onChange={(e) => setEditForm({ ...editForm, guarantorPhone: e.target.value })} />
        </label>
      </div>

      {/* SECTION 2: Item & Financials */}
      <div style={{ color: themeStyles.accentGold || "#e07a5f", fontSize: "13px", fontWeight: 800, marginBottom: "10px" }}>
        {t.itemAndFinancialsSection || (isEN ? "Item & Financial Details" : "بيانات السلعة والماليات")}
      </div>
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>
          <span>{t.itemLabel || (isEN ? "Item *" : "السلعة *")}</span>
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.item : contract.item} onChange={(e) => setEditForm({ ...editForm, item: e.target.value })} />
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <label style={labelStyle}>
          <span>{t.costPriceLabel || (isEN ? "Cost Price *" : "سعر التكلفة *")}</span>
          <input style={inputStyle} disabled={!isEditing} type="number" value={isEditing ? editForm.cost : contract.cost} onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })} />
        </label>
        <label style={labelStyle}>
          <span>{t.salePriceLabel || (isEN ? "Sale Price *" : "سعر البيع *")}</span>
          <input style={inputStyle} disabled={!isEditing} type="number" value={isEditing ? editForm.sale : contract.sale} onChange={(e) => setEditForm({ ...editForm, sale: e.target.value })} />
        </label>
        <label style={labelStyle}>
          <span>{t.downPaymentLabel || (isEN ? "Down Payment *" : "المقدم *")}</span>
          <input style={inputStyle} disabled={!isEditing} type="number" value={isEditing ? editForm.down : contract.down} onChange={(e) => setEditForm({ ...editForm, down: e.target.value })} />
        </label>
        <label style={labelStyle}>
          <span>{t.monthlyInstallmentLabel || (isEN ? "Monthly Installment *" : "القسط الشهري *")}</span>
          <input style={inputStyle} disabled={!isEditing} type="number" value={isEditing ? editForm.monthly : contract.monthly} onChange={(e) => setEditForm({ ...editForm, monthly: e.target.value })} />
        </label>
      </div>

      {/* SECTION 3: Live Position */}
      {!isEditing && (
        <>
          <div style={{ color: themeStyles.accentGold || "#e07a5f", fontSize: "13px", fontWeight: 800, marginBottom: "10px" }}>
            {t.liveFinancialPositionSection || (isEN ? "Actual Financial Position" : "الموقف المالي الحقيقي")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: themeStyles.inputBg || "#121214", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
                {t.totalCollectedLabel || (isEN ? "Total Collected" : "إجمالي المحصل")}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>
                {contract.paidAmount || (Number(contract.sale) - Number(contract.remainingAmount || 0))} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
            </div>
            <div style={{ background: themeStyles.inputBg || "#121214", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
                {t.remainingInstallmentsLabel || (isEN ? "Total Remaining" : "إجمالي الأقساط المتبقية")}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#e07a5f", marginTop: "4px" }}>
                {contract.remainingAmount ?? (Number(contract.sale) - Number(contract.down))} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
            </div>
            <div style={{ background: status.bg, border: `1px solid ${status.border}`, padding: "10px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
                {t.contractStatusLabel || (isEN ? "Contract Status" : "حالة العقد")}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: status.color, marginTop: "4px" }}>{status.label}</div>
            </div>
          </div>
        </>
      )}

      {/* SECTION 4: Dates & Notes */}
      <div style={{ color: themeStyles.accentGold || "#e07a5f", fontSize: "13px", fontWeight: 800, marginBottom: "10px" }}>
        {t.datesAndNotesSection || (isEN ? "Dates & Notes" : "التواريخ والملاحظات")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "12px" }}>
        <label style={labelStyle}>
          <span>{t.contractDateLabel || (isEN ? "Contract Date *" : "تاريخ التعاقد *")}</span>
          {isEditing ? (
            <CustomDatePicker value={editForm.contractDate} onChange={handleContractDateChange} isEN={isEN} themeStyles={themeStyles} inputStyle={inputStyle} />
          ) : (
            <input style={inputStyle} disabled value={contract.contractDate || "-"} />
          )}
        </label>
        <label style={labelStyle}>
          <span>{t.firstPayDateLabel || (isEN ? "First Pay Date (Auto +1 Month)" : "تاريخ أول قسط (تلقائي + شهر)")}</span>
          <input style={inputStyle} disabled value={isEditing ? editForm.firstPayDate : (contract.firstPayDate || "-")} />
        </label>
      </div>
      <div>
        <label style={labelStyle}>
          <span>{t.notesLabel || (isEN ? "Notes" : "ملاحظات")}</span>
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.notes : (contract.notes || (t.noNotesPlaceholder || (isEN ? "None" : "لا يوجد")))} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
        </label>
      </div>

      {/* SAVE BUTTON */}
      {isEditing && (
        <button type="button" onClick={handleSave} style={{ width: "100%", background: "linear-gradient(135deg, #e07a5f, #d4af37)", color: "#111111", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", marginTop: "16px" }}>
          {t.saveToCloudBtn || (isEN ? "Save Changes to Cloud" : "حفظ التعديلات بالسحابة")}
        </button>
      )}
    </div>
  );
}

export default ClientDetailCard;
