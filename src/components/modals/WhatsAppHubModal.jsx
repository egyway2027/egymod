import React, { useState, useMemo } from "react";
import { MessageSquare, Send, X } from "lucide-react";

export function WhatsAppHubModal({
  isOpen,
  onClose,
  clientsList = [],
  themeStyles = {},
  t = {}
}) {
  const [filterType, setFilterType] = useState("all_active"); // "all_active" | "with_remaining"
  const [customText, setCustomText] = useState("");

  // تصفية العملاء النشطين
  const activeClients = useMemo(() => {
    return (clientsList || []).filter(
      (c) => c.status === "active" || !c.status
    );
  }, [clientsList]);

  const targetClients = useMemo(() => {
    if (filterType === "with_remaining") {
      return activeClients.filter(
        (c) => Number(c.remainingAmount ?? c.remaining ?? 0) > 0
      );
    }
    return activeClients;
  }, [activeClients, filterType]);

  const handleSendSingleWhatsApp = (client) => {
    const name = client.clientName || client.name || "العميل";
    const item = client.itemName || client.item || "السلعة";
    const remaining = Number(client.remainingAmount ?? c.remaining ?? 0);
    const monthly = Number(client.monthlyInstallment ?? client.monthly ?? 0);

    const defaultMsg = `السلام عليكم ورحمة الله، أستاذ/ة ${name}.\nنود تذكيركم بمستحقات قسط (${item})، القسط الشهري: ${monthly} ج.م، المتبقي الكلي: ${remaining} ج.م.\nشاكرين تعاونكم معنا!`;
    const finalMsg = customText.trim() ? customText : defaultMsg;

    const phoneClean = (client.clientPhone || client.phone || "").replace(/\D/g, "");
    if (!phoneClean) return;

    window.open(`https://wa.me/2${phoneClean}?text=${encodeURIComponent(finalMsg)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: themeStyles.card || "#1e1e1e",
          border: `1px solid ${themeStyles.border || "#333333"}`,
          borderRadius: "18px",
          padding: "20px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={20} style={{ color: "#25D366" }} />
            <h3
              style={{
                color: themeStyles.accentGold || "#d69a5f",
                margin: 0,
                fontSize: "17px",
                fontWeight: 800
              }}
            >
              مركز إرسال تذكيرات الواتساب
            </h3>
          </div>
          <X size={18} style={{ color: "#aaa", cursor: "pointer" }} onClick={onClose} />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            type="button"
            onClick={() => setFilterType("all_active")}
            style={{
              flex: 1,
              background: filterType === "all_active" ? "#25D366" : themeStyles.inputBg || "#1b1b1d",
              color: filterType === "all_active" ? "#000" : "#fff",
              border: `1px solid ${themeStyles.border || "#333"}`,
              borderRadius: "8px",
              padding: "8px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            جميع العقود النشطة ({activeClients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("with_remaining")}
            style={{
              flex: 1,
              background: filterType === "with_remaining" ? "#25D366" : themeStyles.inputBg || "#1b1b1d",
              color: filterType === "with_remaining" ? "#000" : "#fff",
              border: `1px solid ${themeStyles.border || "#333"}`,
              borderRadius: "8px",
              padding: "8px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            المتبقي عليهم أقساط فقط ({targetClients.length})
          </button>
        </div>

        {/* Custom Text Area */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
            نص الرسالة المخصص (اتركه فارغاً لاستخدام الرسالة التلقائية):
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="اكتب رسالة خاصة هنا لتصل لكل عميل..."
            rows={3}
            style={{
              width: "100%",
              background: themeStyles.inputBg || "#1b1b1d",
              border: `1px solid ${themeStyles.border || "#333333"}`,
              borderRadius: "10px",
              padding: "10px",
              color: "#fff",
              fontSize: "13px",
              outline: "none",
              resize: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Client List */}
        <div
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {targetClients.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888", padding: "20px", fontSize: "13px" }}>
              لا يوجد عملاء مطبق عليهم التصفية الحالية
            </div>
          ) : (
            targetClients.map((client) => {
              const name = client.clientName || client.name || "عميل بدون اسم";
              const phone = client.clientPhone || client.phone || "";
              const item = client.itemName || client.item || "";
              const remaining = Number(client.remainingAmount ?? client.remaining ?? 0);

              return (
                <div
                  key={client.id}
                  style={{
                    background: themeStyles.inputBg || "#1b1b1d",
                    border: `1px solid ${themeStyles.border || "#333333"}`,
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: "13.5px" }}>{name}</div>
                    <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>
                      {item} · {phone || "بدون رقم"} · متبقي: {remaining} ج.م
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendSingleWhatsApp(client)}
                    disabled={!phone}
                    style={{
                      background: phone ? "#143820" : "#222",
                      border: `1px solid ${phone ? "#25D366" : "#444"}`,
                      color: phone ? "#25D366" : "#666",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: phone ? "pointer" : "not-allowed",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Send size={13} /> إرسال
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppHubModal;
