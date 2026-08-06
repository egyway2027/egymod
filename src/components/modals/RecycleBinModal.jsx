import React, { useState, useMemo } from "react";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";

export function RecycleBinModal({
  isOpen,
  onClose,
  clientsList = [],
  onUpdateContract,
  themeStyles = {},
  t = {}
}) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(null); // "restore" | "permanent_delete"
  const [isProcessing, setIsProcessing] = useState(false);

  // تصفية السجلات المحذوفة/المأرشفة فقط
  const trashedItems = useMemo(() => {
    return (clientsList || [])
      .filter(
        (c) =>
          c.status === "deleted" ||
          c.status === "archived" ||
          c.is_deleted === true ||
          c.is_deleted === "true"
      )
      .map((c) => ({
        ...c,
        name: c.clientName || c.name || "عميل بدون اسم",
        phone: c.clientPhone || c.phone || "",
        item: c.itemName || c.item || "غير محدد",
        remaining: Number(c.remainingAmount ?? c.remaining ?? 0)
      }));
  }, [clientsList]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trashedItems;
    return trashedItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.item.toLowerCase().includes(q)
    );
  }, [trashedItems, search]);

  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType) return;
    setIsProcessing(true);

    try {
      const payload = {
        ...selectedItem,
        id: selectedItem.id,
        is_deleted: actionType === "restore" ? false : true,
        status: actionType === "restore" ? "active" : "deleted",
        is_permanently_deleted: actionType === "permanent_delete"
      };

      if (onUpdateContract) {
        await onUpdateContract(payload);
      }
    } catch (err) {
      console.error("❌ خطأ أثناء معالجة عنصر المهملات:", err);
    } finally {
      setIsProcessing(false);
      setSelectedItem(null);
      setActionType(null);
    }
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
          maxWidth: "650px",
          background: themeStyles.card || "#1e1e1e",
          border: `1px solid ${themeStyles.border || "#333333"}`,
          borderRadius: "18px",
          padding: "20px"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Trash2 size={20} style={{ color: "#f87171" }} />
            <h3
              style={{
                color: themeStyles.accentGold || "#d69a5f",
                margin: 0,
                fontSize: "17px",
                fontWeight: 800
              }}
            >
              سلة المهملات الشاملة ({trashedItems.length})
            </h3>
          </div>
          <X size={18} style={{ color: "#aaa", cursor: "pointer" }} onClick={onClose} />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بداخل سلة المهملات..."
          style={{
            width: "100%",
            background: themeStyles.inputBg || "#1b1b1d",
            border: `1px solid ${themeStyles.border || "#333333"}`,
            borderRadius: "10px",
            padding: "10px 14px",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
            marginBottom: "14px",
            boxSizing: "border-box"
          }}
        />

        {/* Items List */}
        <div
          style={{
            maxHeight: "350px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888", padding: "30px", fontSize: "13px" }}>
              <AlertTriangle size={32} opacity={0.4} style={{ marginBottom: "8px" }} />
              <div>لا توجد عناصر بداخل سلة المهملات</div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: themeStyles.inputBg || "#1b1b1d",
                  border: `1px solid ${themeStyles.border || "#333333"}`,
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: "14px" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>
                    {item.item} · {item.phone || "بدون رقم"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setActionType("restore");
                    }}
                    style={{
                      background: "#143820",
                      border: "1px solid #22c55e55",
                      color: "#4ade80",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <RotateCcw size={14} /> استعادة
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setActionType("permanent_delete");
                    }}
                    style={{
                      background: "#3e1c24",
                      border: "1px solid #ef444455",
                      color: "#f87171",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Trash2 size={14} /> حذف نهائي
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Confirmation Modal */}
        {selectedItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px"
            }}
          >
            <div
              style={{
                background: themeStyles.card || "#1e1e1e",
                border: `1px solid ${themeStyles.border || "#333333"}`,
                borderRadius: "16px",
                padding: "20px",
                maxWidth: "400px",
                width: "100%"
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  color: actionType === "restore" ? "#4ade80" : "#f87171",
                  fontSize: "15px"
                }}
              >
                {actionType === "restore" ? "تأكيد الاستعادة" : "تحذير: تأكيد الحذف النهائي"}
              </h4>
              <p style={{ color: "#ccc", fontSize: "13px", lineHeight: "1.5" }}>
                {actionType === "restore"
                  ? `هل تريد استعادة عقد العميل (${selectedItem.name}) وإعادته للشاشات النشطة؟`
                  : `سيتم مسح عقد العميل (${selectedItem.name}) نهائياً من قاعدة البيانات والسحابة ولا يمكن التراجع.`}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmAction}
                  style={{
                    flex: 1,
                    background: actionType === "restore" ? "#143820" : "#3e1c24",
                    color: actionType === "restore" ? "#4ade80" : "#f87171",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {isProcessing ? "جاري التنفيذ..." : "تأكيد"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: themeStyles.inputBg || "#1b1b1d",
                    color: "#aaa",
                    border: `1px solid ${themeStyles.border || "#333"}`,
                    borderRadius: "8px",
                    padding: "10px 16px",
                    cursor: "pointer"
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecycleBinModal;
