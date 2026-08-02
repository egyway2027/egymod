/**
 * =========================================================
 * 📌 النافذة: مركز الواتساب السحابي الذكي (Multi-Tenant Cloud Hub)
 * 📁 المسار: src/components/modals/WhatsAppHubModal.jsx
 * 📝 الوظيفة: ربط رقم التاجر عبر QR حقيقي، وإرسال الرسائل
 *            آلياً في الخلفية مع دعم متعدد التجار وإلغاء الربط.
 * =========================================================
 */

import React, { useState, useEffect } from "react";
import { Send, X, ShieldAlert, CheckCircle2, QrCode, Wifi, WifiOff, RefreshCw, Server, LogOut } from "lucide-react";

// 🌐 ضع رابط سيرفر Render المرفوع هنا
const SERVER_URL = "https://egymod-whatsapp-server.onrender.com"; 

export function WhatsAppHubModal({ isOpen, onClose, overdueContracts = [], merchantId = "merchant_default", t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [activeTab, setActiveTab] = useState("qr");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [qrCodeData, setQrCodeData] = useState("");
  const [isServerLoading, setIsServerLoading] = useState(true);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(20);

  // 🔄 الاستعلام عن حالة اتصال رقم التاجر الخاص بالمعرّف merchantId
  useEffect(() => {
    let interval = null;

    if (isOpen) {
      const fetchStatus = async () => {
        try {
          const res = await fetch(`${SERVER_URL}/status?merchantId=${merchantId}`);
          const data = await res.json();
          setConnectionStatus(data.status);
          if (data.qr) setQrCodeData(data.qr);
          setIsServerLoading(false);

          if (data.status === "connected" && activeTab === "qr") {
            setActiveTab("messages");
          }
        } catch (err) {
          setIsServerLoading(true);
        }
      };

      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }

    return () => clearInterval(interval);
  }, [isOpen, activeTab, merchantId]);

  // 🚀 بدء الإرسال الجماعي أونلاين عبر رقم التاجر المقترن
  const handleStartCloudSend = async () => {
    if (overdueContracts.length === 0) return;

    setIsSendingBulk(true);
    try {
      const res = await fetch(`${SERVER_URL}/send-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: merchantId,
          clients: overdueContracts,
          delay: delaySeconds,
          currency: t.currency || "ج.م"
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("تم بدء عملية الإرسال التلقائي في الخلفية بنجاح عبر حساب الواتساب الخاص بك!");
      } else {
        alert("خطأ: " + data.error);
      }
    } catch (err) {
      alert("تعذر الاتصال بالسيرفر السحابي.");
    } finally {
      setIsSendingBulk(false);
    }
  };

  // 🔴 فك اقتران / تسجيل خروج الواتساب للتاجر
  const handleLogout = async () => {
    if (!window.confirm("هل أنت تأكد من رغبتك في فك اقتران هذا الرقم بالواتساب؟")) return;

    setIsLoggingOut(true);
    try {
      const res = await fetch(`${SERVER_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: merchantId })
      });

      const data = await res.json();
      if (data.success) {
        setConnectionStatus("disconnected");
        setQrCodeData("");
        setActiveTab("qr");
        alert("تم فك اقتران الرقم بنجاح!");
      }
    } catch (err) {
      alert("حدث خطأ أثناء فك الاقتران.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }} dir={isEN ? "ltr" : "rtl"}>
      <div style={{ width: "100%", maxWidth: "920px", maxHeight: "90vh", background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Send style={{ color: "#25D366" }} size={22} />
            <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "17px", fontWeight: 800 }}>
              مركز الواتساب السحابي للتاجر (WhatsApp Cloud Hub)
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* TABS & CONNECTION BAR */}
        <div style={{ padding: "12px 20px", background: themeStyles.inputBg || "#121214", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={() => setActiveTab("qr")} style={{ background: activeTab === "qr" ? "#25D366" : "rgba(255,255,255,0.05)", color: activeTab === "qr" ? "#111" : "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <QrCode size={15} /> ربط الرقم (QR Code)
            </button>
            <button type="button" onClick={() => setActiveTab("messages")} style={{ background: activeTab === "messages" ? "#25D366" : "rgba(255,255,255,0.05)", color: activeTab === "messages" ? "#111" : "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Send size={15} /> قائمة المتأخرات والإرسال
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>
              {isServerLoading ? (
                <span style={{ color: "#e8cd9c", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Server size={15} /> جاري تهيئة السيرفر...
                </span>
              ) : connectionStatus === "connected" ? (
                <span style={{ color: "#25D366", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Wifi size={16} /> الرقم متصل ومقترن 🟢
                </span>
              ) : (
                <span style={{ color: "#e07a5f", display: "flex", alignItems: "center", gap: "6px" }}>
                  <WifiOff size={16} /> غير مقترن 🔴
                </span>
              )}
            </div>

            {connectionStatus === "connected" && (
              <button type="button" onClick={handleLogout} disabled={isLoggingOut} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                <LogOut size={13} /> {isLoggingOut ? "جاري الخروج..." : "فك الاقتران"}
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: REAL QR CODE */}
        {activeTab === "qr" && (
          <div style={{ padding: "30px 20px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", padding: "16px", borderRadius: "16px", display: "inline-block", boxShadow: "0 8px 25px rgba(0,0,0,0.4)" }}>
              {connectionStatus === "connected" ? (
                <div style={{ width: "180px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#25D366" }}>
                  <CheckCircle2 size={50} />
                  <span style={{ marginTop: "10px", fontWeight: 800, fontSize: "14px", color: "#111" }}>الرقم مرتبط بنجاح!</span>
                </div>
              ) : qrCodeData ? (
                <img src={qrCodeData} alt="Real QR Code" style={{ width: "180px", height: "180px", display: "block" }} />
              ) : (
                <div style={{ width: "180px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#111", gap: "8px" }}>
                  <RefreshCw size={24} />
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>جاري جلب كود الـ QR...</span>
                </div>
              )}
            </div>

            <h4 style={{ margin: "16px 0 6px 0", color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800 }}>
              {connectionStatus === "connected" ? "رقم الواتساب جاهز للإرسال الآلي للعملاء" : "افتح الواتساب ⬅️ الأجهزة المرتبطة ⬅️ امسح الكود"}
            </h4>
            <p style={{ margin: 0, color: "#aaa", fontSize: "12px", maxWidth: "440px" }}>
              هذا الكود يربط رقم محلك برفق وسرية تامة على خادم سحابي مستقل، للإرسال التلقائي دون فتح تبويبات إضافية.
            </p>
          </div>
        )}

        {/* TAB 2: CLIENTS & CLOUD SEND */}
        {activeTab === "messages" && (
          <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
            
            <div style={{ padding: "12px 16px", background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.2)", borderRadius: "10px", marginBottom: "16px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#25D366", fontSize: "12.5px", fontWeight: 700 }}>
                <ShieldAlert size={16} />
                <span>حماية الحظر: فاصل أمان ({delaySeconds} ثانية) بين كل رسالة</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "12px", color: "#aaa" }}>تأخير الأمان:</label>
                <select value={delaySeconds} onChange={(e) => setDelaySeconds(Number(e.target.value))} style={{ background: themeStyles.inputBg || "#121214", color: "#fff", border: "1px solid #444", borderRadius: "6px", padding: "4px 8px", fontSize: "12px" }}>
                  <option value={15}>15 ثانية (سريع)</option>
                  <option value={20}>20 ثانية (موصى به)</option>
                  <option value={30}>30 ثانية (أمان عالي)</option>
                </select>

                <button type="button" onClick={handleStartCloudSend} disabled={connectionStatus !== "connected" || isSendingBulk || overdueContracts.length === 0} style={{ background: connectionStatus === "connected" ? "#25D366" : "#555", color: "#111", border: "none", padding: "8px 18px", borderRadius: "8px", cursor: connectionStatus === "connected" ? "pointer" : "not-allowed", fontWeight: 800, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Send size={14} /> {isSendingBulk ? "جاري الإرسال..." : "بدء الإرسال الآلي"}
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
                  </tr>
                </thead>
                <tbody>
                  {overdueContracts.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: "20px", color: "#888" }}>لا يوجد عملاء متأخرين عن السداد حالياً.</td></tr>
                  ) : (
                    overdueContracts.map((client, idx) => (
                      <tr key={client.id || idx} style={{ borderBottom: `1px solid ${themeStyles.border || "#222224"}` }}>
                        <td style={{ padding: "10px", color: "#888" }}>{idx + 1}</td>
                        <td style={{ padding: "10px", fontWeight: 700 }}>{client.name}</td>
                        <td style={{ padding: "10px" }} dir="ltr">{client.phone}</td>
                        <td style={{ padding: "10px", color: themeStyles.accentGold || "#e8cd9c" }}>{client.item}</td>
                        <td style={{ padding: "10px", color: "#e07a5f", fontWeight: 800 }}>{client.monthly} {t.currency || "ج.م"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>إجمالي المتأخرين: {overdueContracts.length} عميل</span>
          <button type="button" onClick={onClose} style={{ background: themeStyles.card || "#222", border: "1px solid #444", color: "#fff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12.5px" }}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppHubModal;
