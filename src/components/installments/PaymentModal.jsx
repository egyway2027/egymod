import React, { useState } from 'react';
import { X, Send, DollarSign } from 'lucide-react';

export default function PaymentModal({ installment, customer, onClose, onSubmitPayment, themeStyles = {} }) {
  const remainingForInst = installment.amount - installment.paid;
  const [payAmount, setPayAmount] = useState(remainingForInst);
  const [selectedTreasury, setSelectedTreasury] = useState('main');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (payAmount <= 0 || payAmount > remainingForInst) return;

    setIsSubmitting(true);
    await onSubmitPayment({
      installmentId: installment.id,
      amount: Number(payAmount),
      treasury: selectedTreasury,
      sendWhatsApp,
      customer
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: themeStyles.card || "#1e1e1e", width: "100%", maxWidth: "420px", borderRadius: "16px", border: `1px solid ${themeStyles.border || "#444"}`, overflow: "hidden" }}>
        
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontWeight: "800", color: themeStyles.text || "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            <DollarSign size={18} color="#d4af37" /> تحصيل القسط #{installment.number}
          </h3>
          <X size={20} style={{ cursor: "pointer", color: "#888" }} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>
            <span style={{ color: "#aaa", display: "block", fontSize: "11px" }}>العميل:</span>
            <span style={{ fontWeight: "700", color: themeStyles.text || "#fff" }}>{customer.name}</span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: themeStyles.text || "#fff" }}>
              المبلغ المدفوع (المتبقي: {remainingForInst.toLocaleString()} ج.م):
            </label>
            <input
              type="number"
              max={remainingForInst}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${themeStyles.border || "#444"}`,
                backgroundColor: themeStyles.inputBg || "#121212", color: "#d4af37", fontWeight: "800", fontSize: "18px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px", color: themeStyles.text || "#fff" }}>
              توجيه المبلغ إلى الخزينة:
            </label>
            <select
              value={selectedTreasury}
              onChange={(e) => setSelectedTreasury(e.target.value)}
              style={{
                width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${themeStyles.border || "#444"}`,
                backgroundColor: themeStyles.inputBg || "#121212", color: themeStyles.text || "#fff", fontSize: "13px", outline: "none"
              }}
            >
              <option value="main">🏢 الخزينة الرئيسية (نقدي)</option>
              <option value="bank">🏦 الحساب البنكي (CIB)</option>
              <option value="wallet">📱 محفظة فودافون كاش / إلكترونية</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <input
              type="checkbox"
              id="whatsappNotify"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="whatsappNotify" style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              <Send size={12} /> إرسال إيصال سداد تلقائي للعميل عبر الواتساب
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1, background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#fff",
                border: "none", padding: "12px", borderRadius: "8px", fontWeight: "800", cursor: "pointer"
              }}
            >
              {isSubmitting ? 'جاري التحصيل...' : 'تأكيد السداد'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "12px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
            >
              إلغاء
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
