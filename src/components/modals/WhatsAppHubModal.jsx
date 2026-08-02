/**
 * =========================================================
 * 📌 النافذة: مركز الواتساب الذكي (WhatsApp Smart Hub)
 * 📁 المسار: src/components/modals/WhatsAppHubModal.jsx
 * 📝 الوظيفة: طابور إرسال آلي موجه للعملاء المتأخرين
 *            مع عداد أمان تنازلي للحماية من الحظر.
 * =========================================================
 */

import React, { useState, useEffect } from "react";
import { Send, X, ShieldAlert, CheckCircle2, Play, Pause, RotateCcw, MessageSquare } from "lucide-react";

export function WhatsAppHubModal({ isOpen, onClose, overdueContracts = [], t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [isAutoSending, setIsAutoSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(20);
  const [countdown, setCountdown] = useState(20);

  // إعادة ضبط الطابور عند إغلاق النافذة أو فتحها
  useEffect(() => {
    if (!isOpen) {
      setIsAutoSending(false);
      setCurrentIndex(0);
      setSentCount(0);
    }
  }, [isOpen]);

  // تجهيز نص الرسالة المخصصة للعميل
  const generateMessage = (client) => {
    return encodeURIComponent(
      `مرحباً السيد/ة ${client.name}،\n` +
      `نود تذكيركم بحلول موعد قسط (${client.item}) المستحق بمبلغ ${client.monthly} ${t.currency || "ج.م"}.\n` +
      `يرجى التكرم بالسداد في أقرب وقت لتجنب الغرامات.\n` +
      `شكراً لتفهمكم — إدارة إيجيمود.`
    );
  };

  // إرسال مباشر لعميل واحد
  const handleSingleSend = (client) => {
    const cleanPhone = (client.phone || "").replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone;
    const url = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${generateMessage(client)}`;
    window.open(url, "_blank");
  };

  // محرك طابور الإرسال التلقائي
  useEffect(() => {
    let timer = null;

    if (isAutoSending && overdueContracts.length > 0 && currentIndex < overdueContracts.length) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // فتح محادثة العميل الحالي عند انتهاء العداد
        const currentClient = overdueContracts[currentIndex];
        if (currentClient) {
          handleSingleSend(currentClient);
          setSentCount((prev) => prev + 1);
        }

        // الانتقال للعميل التالي وتصفير العداد
        if (currentIndex + 1 < overdueContracts.length) {
          setCurrentIndex((prev) => prev + 1);
          setCountdown(delaySeconds);
        } else {
          // انتهت القائمة بالكامل
          setIsAutoSending(false);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isAutoSending, countdown, currentIndex, overdueContracts, delaySeconds]);

  if (!isOpen) return null;

  const totalClients = overdueContracts.length;
  const progressPercent = totalClients > 0 ? Math.round((sentCount / totalClients) * 100) : 0;

  const handleStartQueue = () => {
    if (currentIndex >= totalClients) {
      setCurrentIndex(0);
      setSentCount(0);
    }
    setCountdown(delaySeconds);
    setIsAutoSending(true);
  };

  const handleResetQueue = () => {
    setIsAutoSending(false);
    setCurrentIndex(0);
    setSentCount(0);
    setCountdown(delaySeconds);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }} dir={isEN ? "ltr" : "rtl"}>
      <div style={{ width: "100%", maxWidth: "920px", maxHeight: "90vh", background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "18px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 12px 35px rgba(0,0,0,0.6)" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare style={{ color: "#25D366" }} size={22} />
            <div>
              <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "17px", fontWeight: 800 }}>
                مركز الواتساب الذكي — طابور الإرسال الموجه
              </h3>
              <span style={{ fontSize: "11.5px", color: "#888", display: "block", marginTop: "2px" }}>
                نظام حماية ضد الحظر بفاصل زمني تلقائي بين الرسائل
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* CONTROLS & PROGRESS BANNER */}
        <div style={{ padding: "16px 22px", background: themeStyles.inputBg || "#121214", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            
            {/* ANTI-BAN DELAY SELECTOR */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} style={{ color: "#25D366" }} />
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff" }}>فاصل الأمان:</span>
              <select
                value={delaySeconds}
                disabled={isAutoSending}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDelaySeconds(val);
                  setCountdown(val);
                }}
                style={{ background: themeStyles.card || "#1a1a1c", color: "#fff", border: "1px solid #444", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", outline: "none" }}
              >
                <option value={15}>15 ثانية (سريع)</option>
                <option value={20}>20 ثانية (موصى به)</option>
                <option value={30}>30 ثانية (أمان عالي)</option>
              </select>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isAutoSending ? (
                <button type="button" onClick={() => setIsAutoSending(false)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 800, fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Pause size={15} /> إيقاف مؤقت
                </button>
              ) : (
                <button type="button" onClick={handleStartQueue} disabled={totalClients === 0} style={{ background: totalClients === 0 ? "#555" : "#25D366", color: "#111", border: "none", padding: "8px 18px", borderRadius: "8px", cursor: totalClients === 0 ? "not-allowed" : "pointer", fontWeight: 800, fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Play size={15} /> {currentIndex > 0 ? "استئناف الإرسال" : "بدء طابور الإرسال الآلي"}
                </button>
              )}

              <button type="button" onClick={handleResetQueue} style={{ background: "rgba(255,255,255,0.08)", color: "#aaa", border: "1px solid #444", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <RotateCcw size={14} /> إعادة ضبط
              </button>
            </div>
          </div>

          {/* PROGRESS BAR & COUNTDOWN */}
          {totalClients > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#aaa", marginBottom: "6px" }}>
                <span>التقدم: {sentCount} من {totalClients} عميل ({progressPercent}%)</span>
                {isAutoSending && (
                  <span style={{ color: "#25D366" }}>إرسال العميل التالي بعد: {countdown} ثانية</span>
                )}
              </div>
              <div style={{ width: "100%", height: "8px", background: "#222", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", background: "#25D366", transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}
        </div>

        {/* CLIENTS TABLE */}
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
                  <th style={{ padding: "10px" }}>حالة الإرسال</th>
                  <th style={{ padding: "10px" }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {totalClients === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "24px", color: "#888" }}>لا يوجد عملاء متأخرين عن السداد حالياً.</td></tr>
                ) : (
                  overdueContracts.map((client, idx) => {
                    const isCurrent = idx === currentIndex && isAutoSending;
                    const isDone = idx < currentIndex;

                    return (
                      <tr key={client.id || idx} style={{ borderBottom: `1px solid ${themeStyles.border || "#222224"}`, background: isCurrent ? "rgba(37, 211, 102, 0.08)" : "transparent" }}>
                        <td style={{ padding: "10px", color: "#888" }}>{idx + 1}</td>
                        <td style={{ padding: "10px", fontWeight: 700 }}>{client.name}</td>
                        <td style={{ padding: "10px" }} dir="ltr">{client.phone}</td>
                        <td style={{ padding: "10px", color: themeStyles.accentGold || "#e8cd9c" }}>{client.item}</td>
                        <td style={{ padding: "10px", color: "#e07a5f", fontWeight: 800 }}>{client.monthly} {t.currency || "ج.م"}</td>
                        <td style={{ padding: "10px" }}>
                          {isDone ? (
                            <span style={{ color: "#25D366", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={14} /> تم الإرسال
                            </span>
                          ) : isCurrent ? (
                            <span style={{ color: "#e8cd9c", fontWeight: 700 }}>جاري الإرسال ({countdown}ث)</span>
                          ) : (
                            <span style={{ color: "#666" }}>في الانتظار</span>
                          )}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <button type="button" onClick={() => handleSingleSend(client)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25D366", color: "#111", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 800, fontSize: "11.5px" }}>
                            <Send size={13} /> إرسال مباشر
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>إجمالي المتأخرين: {totalClients} عميل</span>
          <button type="button" onClick={onClose} style={{ background: themeStyles.card || "#222", border: "1px solid #444", color: "#fff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12.5px" }}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppHubModal;
