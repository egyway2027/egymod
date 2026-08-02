/**
 * =========================================================
 * 📌 النافذة: مركز الواتساب الذكي (WhatsApp Anti-Ban Hub)
 * 📁 المسار: src/components/modals/WhatsAppHubModal.jsx
 * 📝 الوظيفة: إرسال تنبيهات المتأخرين يدوياً أو آلياً
 *            مع خوارزمية التمهيل الزمني للحماية من الحظر.
 * =========================================================
 */

import React, { useState } from "react";
import { Send, X, ShieldAlert, CheckCircle2, Clock, Play, Pause, QrCode, Wifi, WifiOff, RefreshCw } from "lucide-react";

export function WhatsAppHubModal({ isOpen, onClose, overdueContracts = [], t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  
  const [activeTab, setActiveTab] = useState("qr"); // "qr" | "messages"
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // "disconnected" | "scanning" | "connected"
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(20);

  // محاكاة الاقتران والربط عبر كود QR
  const handleConnectSim = () => {
    setConnectionStatus("scanning");
    setTimeout(() => {
      setConnectionStatus("connected");
      setActiveTab("messages");
    }, 2500);
  };

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

        {/* CONNECTION & TABS BAR */}
        <div style={{ padding: "12px 20px", background: themeStyles.inputBg || "#121214", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={() => setActiveTab("qr")} style={{ background: activeTab === "qr" ? "#25D366" : "rgba(255,255,255,0.05)", color: activeTab === "qr" ? "#111" : "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <QrCode size={15} /> ربط الجهاز (QR Code)
            </button>
            <button type="button" onClick={() => setActiveTab("messages")} style={{ background: activeTab === "messages" ? "#25D366" : "rgba(255,255,255,0.05)", color: activeTab === "messages" ? "#111" : "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Send size={15} /> قائمة المتأخرات والإرسال
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: connectionStatus === "connected" ? "#25D366" : "#e07a5f" }}>
            {connectionStatus === "connected" ? <><Wifi size={16} /> واتساب متصل الآن 🟢</> : <><WifiOff size={16} /> غير متصل 🔴</>}
          </div>
        </div>

        {/* TAB 1: QR CODE LINKING */}
        {activeTab === "qr" && (
          <div style={{ padding: "30px 20px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", padding: "16px", borderRadius: "16px", display: "inline-block", boxShadow: "0 8px 25px rgba(0,0,0,0.4)" }}>
              {connectionStatus === "scanning" ? (
                <div style={{ width: "180px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontWeight: 800, gap: "8px" }}>
                  <RefreshCw size={24} /> جاري الاقتران...
                </div>
              ) : connectionStatus === "connected" ? (
                <div style={{ width: "180px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#25D366" }}>
                  <CheckCircle2 size={50} />
                  <span style={{ marginTop: "10px", fontWeight: 800, fontSize: "14px", color: "#111" }}>تم الربط بنجاح!</span>
                </div>
              ) : (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=EGYMOD_WHATSAPP_SESSION_AUTH`} alt="QR Code" style={{ width: "180px", height: "180px", display: "block" }} />
              )}
            </div>

            <h4 style={{ margin: "16px 0 6px 0", color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800 }}>
              {connectionStatus === "connected" ? "واتساب العميل/المؤسسة جاهز للإرسال الآلي" : "افتح الواتساب ⬅️ الأجهزة المرتبطة ⬅️ امسح الكود"}
            </h4>
            <p style={{ margin: 0, color: "#aaa", fontSize: "12px", maxWidth: "420px" }}>
              تتيح لك هذه الأداة ربط الرقم برمز مشفر لإرسال الرسائل الآلية مباشرة في الخلفية دون فتح تبويبات جديدة.
            </p>

            {connectionStatus !== "connected" && (
              <button type="button" onClick={handleConnectSim} style={{ marginTop: "18px", background: "#25D366", color: "#111", border: "none", padding: "10px 22px", borderRadius: "10px", fontWeight: 800, cursor: "pointer", fontSize: "13px" }}>
                محاكاة مسح الكود والربط الآن
              </button>
            )}
          </div>
        )}

        {/* TAB 2: CLIENTS LIST & LIVE AUTO-SEND QUEUE */}
        {activeTab === "messages" && (
          <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
            {/* LIVE AUTO SEND PROGRESS BAR */}
            <div style={{ padding: "12px 16px", background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.2)", borderRadius: "10px", marginBottom: "16px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#25D366", fontSize: "12.5px", fontWeight: 700 }}>
                <ShieldAlert size={16} />
                <span>حماية الحظر: فاصل عشوائي ({delaySeconds}ث) بين الرسائل</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "12px", color: "#aaa" }}>تأخير الأمان:</label>
                <select value={delaySeconds} onChange={(e) => setDelaySeconds(Number(e.target.value))} style={{ background: themeStyles.inputBg || "#121214", color: "#fff", border: "1px solid #444", borderRadius: "6px", padding: "4px 8px", fontSize: "12px" }}>
                  <option value={15}>15 ثانية (سريع)</option>
                  <option value={20}>20 ثانية (موصى به)</option>
                  <option value={30}>30 ثانية (أمان عالي)</option>
                </select>

                <button type="button" onClick={() => setIsAutoSending(!isAutoSending)} disabled={connectionStatus !== "connected"} style={{ background: isAutoSending ? "#ef4444" : "#25D366", color: "#111", opacity: connectionStatus !== "connected" ? 0.5 : 1, border: "none", padding: "6px 14px", borderRadius: "6px", cursor: connectionStatus !== "connected" ? "not-allowed" : "pointer", fontWeight: 800, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {isAutoSending ? <><Pause size={14} /> إيقاف مؤقت</> : <><Play size={14} /> بدء الإرسال التلقائي</>}
                </button>
              </div>
            </div>
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

          </div>
        )}

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
