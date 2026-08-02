/**
 * =========================================================
 * 📌 النافذة: مركز الواتساب الذكي (WhatsApp Anti-Ban Hub)
 * 📁 المسار: src/components/modals/WhatsAppHubModal.jsx
 * 📝 الوظيفة: إرسال تنبيهات المتأخرين يدوياً أو آلياً
 *            مع خوارزمية التمهيل الزمني للحماية من الحظر.
 * =========================================================
 */

import React, { useState } from "react";
import { Send, X, ShieldAlert, CheckCircle2, Clock, Play, Pause } from "lucide-react";

export function WhatsAppHubModal({ isOpen, onClose, overdueContracts = [], t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(20); // فاصل أمان افتراضي 20 ثانية

  if (!isOpen) return null;

  // تجهيز نص الرسالة المخصصة للعميل
  const generateMessage = (client) => {
    return encodeURIComponent(
      `مرحباً السيد/ة ${client.name}،\n` +
      `نود تذكيركم بحلول موعد قسط (${client.item}) المستحق بمبلغ ${client.monthly} ${t.currency || "ج.م"}.\n` +
      `يرجى التكرم بالسداد في أقرب وقت لتجنب الغرامات.\n` +
      `شكراً لتفهمكم — إدارة إيجيمود.`
    );
  };

  // إرسال يدوي مباشر لعميل واحد
  const handleSingleSend = (client) => {
    const cleanPhone = (client.phone || "").replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone;
    const url = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${generateMessage(client)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }} dir={isEN ? "ltr" : "rtl"}>
      <div style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Send style={{ color: "#25D366" }} size={22} />
            <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "17px", fontWeight: 800 }}>
              مركز الواتساب الذكي (WhatsApp Smart Hub)
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* ANTI-BAN CONTROL BANNER */}
        <div style={{ padding: "16px 20px", background: "rgba(37, 211, 102, 0.08)", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#25D366", fontSize: "13px", fontWeight: 700 }}>
            <ShieldAlert size={18} />
            <span>نظام الحماية من الحظر مفعّل: فاصل زمني بين الرسائل ({delaySeconds} ثانية)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "12px", color: "#aaa" }}>تأخير الأمان:</label>
            <select value={delaySeconds} onChange={(e) => setDelaySeconds(Number(e.target.value))} style={{ background: themeStyles.inputBg || "#121214", color: "#fff", border: "1px solid #444", borderRadius: "6px", padding: "4px 8px", fontSize: "12px" }}>
              <option value={15}>15 ثانية (سريع)</option>
              <option value={20}>20 ثانية (موصى به)</option>
              <option value={30}>30 ثانية (أمان عالي)</option>
            </select>
          </div>
        </div>

        {/* CLIENTS LIST */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <div style={{ overflowX: "auto", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "center" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121214", color: themeStyles.accentGold || "#e8cd9c" }}>
                  <th style={{ padding: "10px" }}>#</th>
                  <th style={{ padding: "10px" }}>اسم العميل</th>
                  <th style={{ padding: "10px" }}>الهاتف</th>
                  <th style={{ padding: "10px" }}>السلعة</th>
                  <th style={{ padding: "10px" }}>القسط المستحق</th>
                  <th style={{ padding: "10px" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {overdueContracts.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "20px", color: "#888" }}>لا يوجد عملاء متأخرين عن السداد حالياً.</td></tr>
                ) : (
                  overdueContracts.map((client, idx) => (
                    <tr key={client.id || idx} style={{ borderBottom: `1px solid ${themeStyles.border || "#222224"}` }}>
                      <td style={{ padding: "10px", color: "#888" }}>{idx + 1}</td>
                      <td style={{ padding: "10px", fontWeight: 700 }}>{client.name}</td>
                      <td style={{ padding: "10px" }} dir="ltr">{client.phone}</td>
                      <td style={{ padding: "10px", color: themeStyles.accentGold || "#e8cd9c" }}>{client.item}</td>
                      <td style={{ padding: "10px", color: "#e07a5f", fontWeight: 800 }}>{client.monthly} {t.currency || "ج.م"}</td>
                      <td style={{ padding: "10px" }}>
                        <button type="button" onClick={() => handleSingleSend(client)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25D366", color: "#111", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 800, fontSize: "11.5px" }}>
                          <Send size={13} /> إرسال الآن
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>إجمالي قائمة المتأخرين: {overdueContracts.length} عميل</span>
          <button type="button" onClick={onClose} style={{ background: themeStyles.card || "#222", border: "1px solid #444", color: "#fff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12.5px" }}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppHubModal;
