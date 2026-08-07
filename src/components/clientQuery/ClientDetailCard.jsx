/**
 * =========================================================
 * 📌 المكون: كارت تفاصيل وتعديل العقد (Client Detail & Edit Card)
 * 📁 المسار: src/components/clientQuery/ClientDetailCard.jsx
 * 📝 الوظيفة: عرض موقف العقد المالي، وإتاحة وضع التعديل المباشر
 *            لبيانات العميل والسلعة والتواريخ للحفظ السحابي.
 * =========================================================
 */

import React, { useState } from "react";
import { Edit3, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { CustomDatePicker } from "../CustomDatePicker";
import { getContractStatus } from "../../services/clientQueryService";
import { supabase } from "../../supabaseClient";

export function ClientDetailCard({ contract, onSaveUpdate, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleContractDateChange = (valOrEvent) => {
    const cDate = typeof valOrEvent === "string" ? valOrEvent : valOrEvent?.target?.value || "";
    if (!cDate) {
      setEditForm((prev) => ({ ...prev, contractDate: "", contract_date: "", firstPayDate: "", first_installment_date: "" }));
      return;
    }
    const d = new Date(cDate);
    let firstPay = "";
    if (!isNaN(d.getTime())) {
      d.setMonth(d.getMonth() + 1);
      firstPay = d.toISOString().split("T")[0];
    }
    setEditForm((prev) => ({ ...prev, contractDate: cDate, contract_date: cDate, firstPayDate: firstPay, first_installment_date: firstPay }));
  };

  // حساب المبالغ والماليات المحصلة والمتبقية بدقة محاسبية
  const salePrice = Number(contract.sale ?? contract.sale_price ?? contract.salePrice ?? 0);
  const downPayment = Number(contract.down ?? contract.down_payment ?? contract.downPayment ?? 0);

  // جمع الأقساط المسددة بمرونة تشمل جميع حقول سجلات السداد بجدول الاقساط
  const paidInstallmentsSum = React.useMemo(() => {
    const list = contract.installments || contract.payments || [];
    if (!Array.isArray(list) || list.length === 0) return 0;

    return list.reduce((sum, inst) => {
      if (inst.is_paid === false || inst.status === "unpaid" || inst.status === "cancelled") {
        return sum;
      }
      const amt = Number(
        inst.amount ??
        inst.amount_paid ??
        inst.paid_amount ??
        inst.payment_amount ??
        contract.monthly ??
        contract.monthly_installment ??
        0
      );
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [contract]);

  const totalCollected = downPayment + paidInstallmentsSum;
  const remainingPortfolio = Math.max(0, salePrice - totalCollected);

  // حساب وقراءة تاريخ أول قسط
  const contractDateVal = contract.contractDate || contract.contract_date || contract.start_date || "";
  const displayFirstPayDate = React.useMemo(() => {
    if (contract.firstPayDate && contract.firstPayDate !== "NULL") return contract.firstPayDate;
    if (contract.first_installment_date && contract.first_installment_date !== "NULL") return contract.first_installment_date;
    if (contract.firstInstallmentDate && contract.firstInstallmentDate !== "NULL") return contract.firstInstallmentDate;

    if (!contractDateVal || contractDateVal === "-") return "-";
    const d = new Date(contractDateVal);
    if (isNaN(d.getTime())) return "-";
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  }, [contract, contractDateVal]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const clientId = contract.client_id || contract.clients?.id;
      const contractId = contract.id;

      // 1. تحديث جدول العملاء بالسحابة (clients)
      if (clientId) {
        await supabase
          .from("clients")
          .update({
            name: editForm.name,
            phone: editForm.phone,
            guarantor_name: editForm.guarantor,
            guarantor_phone: editForm.guarantorPhone
          })
          .eq("id", clientId);
      }

      // 2. تحديث جدول العقود بالسحابة (contracts)
      const gNameVal = editForm.guarantor || editForm.guarantor_name || editForm.guarantorName || "";
      const gPhoneVal = editForm.guarantorPhone || editForm.guarantor_phone || "";
      const cDateVal = editForm.contractDate || editForm.contract_date || "";
      const fPayVal = editForm.firstPayDate || editForm.first_installment_date || "";

      if (contractId) {
        await supabase
          .from("contracts")
          .update({
            client_name: editForm.name,
            client_phone: editForm.phone,
            guarantor_name: gNameVal,
            guarantor_phone: gPhoneVal,
            item_name: editForm.item,
            item: editForm.item,
            cost: Number(editForm.cost || 0),
            cost_price: Number(editForm.cost || 0),
            sale: Number(editForm.sale || 0),
            sale_price: Number(editForm.sale || 0),
            total: Number(editForm.sale || 0),
            down: Number(editForm.down || 0),
            down_payment: Number(editForm.down || 0),
            monthly: Number(editForm.monthly || 0),
            monthly_installment: Number(editForm.monthly || 0),
            contract_date: cDateVal,
            first_installment_date: fPayVal,
            start_date: cDateVal,
            notes: editForm.notes
          })
          .eq("id", contractId);
      }

      // 3. توحيد البيانات لتحديث العرض المباشر
      const updatedFull = {
        ...contract,
        ...editForm,
        name: editForm.name,
        clientName: editForm.name,
        phone: editForm.phone,
        clientPhone: editForm.phone,
        guarantor: gNameVal,
        guarantor_name: gNameVal,
        guarantorName: gNameVal,
        guarantorPhone: gPhoneVal,
        guarantor_phone: gPhoneVal,
        item: editForm.item,
        itemName: editForm.item,
        cost: Number(editForm.cost || 0),
        sale: Number(editForm.sale || 0),
        down: Number(editForm.down || 0),
        monthly: Number(editForm.monthly || 0),
        contractDate: cDateVal,
        contract_date: cDateVal,
        firstPayDate: fPayVal,
        first_installment_date: fPayVal,
        notes: editForm.notes
      };

      if (onSaveUpdate) {
        await onSaveUpdate(updatedFull);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("❌ خطأ أثناء حفظ تعديلات العميل بالسحابة:", err);
      alert("حدث خطأ أثناء حفظ التعديلات بالسحابة.");
    } finally {
      setSaving(false);
    }
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
          <button 
            type="button" 
            onClick={() => {
              const gName = contract.guarantor || contract.guarantor_name || contract.guarantorName || contract.clients?.guarantor_name || "";
              const gPhone = contract.guarantorPhone || contract.guarantor_phone || contract.clients?.guarantor_phone || "";
              const cDate = contract.contractDate || contract.contract_date || contract.start_date || "";
              let fPay = contract.firstPayDate || contract.first_installment_date || contract.firstInstallmentDate || "";
              if (!fPay && cDate) {
                const d = new Date(cDate);
                if (!isNaN(d.getTime())) {
                  d.setMonth(d.getMonth() + 1);
                  fPay = d.toISOString().split("T")[0];
                }
              }

              setEditForm({
                ...contract,
                name: contract.name || contract.clientName || contract.client_name || "",
                phone: contract.phone || contract.clientPhone || contract.client_phone || "",
                guarantor: gName,
                guarantor_name: gName,
                guarantorName: gName,
                guarantorPhone: gPhone,
                guarantor_phone: gPhone,
                item: contract.item || contract.itemName || contract.item_name || "",
                cost: contract.cost ?? contract.cost_price ?? 0,
                sale: contract.sale ?? contract.sale_price ?? contract.total ?? 0,
                down: contract.down ?? contract.down_payment ?? 0,
                monthly: contract.monthly ?? contract.monthly_installment ?? 0,
                contractDate: cDate,
                contract_date: cDate,
                firstPayDate: fPay,
                first_installment_date: fPay,
                notes: contract.notes || ""
              });
              setIsEditing(true);
            }} 
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(224,122,95,0.15)", border: "1px solid #e07a5f", color: "#e07a5f", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12.5px", fontWeight: 700 }}
          >
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
          <input style={inputStyle} disabled={!isEditing} value={isEditing ? editForm.guarantor : (contract.guarantor || contract.guarantor_name || contract.guarantorName || "-")} onChange={(e) => setEditForm({ ...editForm, guarantor: e.target.value, guarantor_name: e.target.value, guarantorName: e.target.value })} />
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
                {totalCollected} {t.currency || (isEN ? "EGP" : "ج.م")}
              </div>
            </div>
            <div style={{ background: themeStyles.inputBg || "#121214", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
                {t.remainingInstallmentsLabel || (isEN ? "Total Remaining" : "إجمالي الأقساط المتبقية")}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#e07a5f", marginTop: "4px" }}>
                {remainingPortfolio} {t.currency || (isEN ? "EGP" : "ج.م")}
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
          <input style={inputStyle} disabled value={isEditing ? editForm.firstPayDate : displayFirstPayDate} />
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
        <button 
          type="button" 
          onClick={handleSave} 
          disabled={saving}
          style={{ 
            width: "100%", 
            background: "linear-gradient(135deg, #e07a5f, #d4af37)", 
            color: "#111111", 
            border: "none", 
            borderRadius: "10px", 
            padding: "12px", 
            fontSize: "14px", 
            fontWeight: 800, 
            cursor: saving ? "wait" : "pointer", 
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {saving ? "جاري حفظ التعديلات..." : (t.saveToCloudBtn || (isEN ? "Save Changes to Cloud" : "حفظ التعديلات بالسحابة"))}
        </button>
      )}
    </div>
  );
}

export default ClientDetailCard;
