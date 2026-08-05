import React, { useState, useMemo } from "react";
import { Trash2, RotateCcw, Search, UserX, AlertTriangle, ArrowRight, X, Check } from "lucide-react";

export function DeleteClientScreen({
  clientsList = [],
  onUpdateContract,
  onBack,
  t = {},
  themeStyles = {}
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" | "trash"
  const [targetClient, setTargetClient] = useState(null);
  const [actionType, setActionType] = useState(null); // "soft_delete" | "restore" | "permanent_delete"
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔍 فصل العقود إلى نشطة ومحذوفة
  const { activeClients, trashedClients } = useMemo(() => {
    const active = [];
    const trashed = [];

  (clientsList || []).forEach((client) => {
      const isArchived = client.is_deleted === true || client.is_deleted === "true" || client.status === "archived" || client.status === "deleted";
      if (isArchived) {
        trashed.push(client);
      } else {
        active.push(client);
      }
    });

    return { activeClients: active, trashedClients: trashed };
  }, [clientsList]);

  // 🎯 القائمة المفلترة حسب التبويب والبحث
  const filteredList = useMemo(() => {
    const source = activeTab === "active" ? activeClients : trashedClients;
    const q = search.trim().toLowerCase();

    if (!q) return source;

    return source.filter((c) => {
      const name = (c.name || c.clientName || "").toLowerCase();
      const phone = (c.phone || c.clientPhone || "").toLowerCase();
      const item = (c.item || c.itemName || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || item.includes(q);
    });
  }, [activeTab, activeClients, trashedClients, search]);

  // ⚡ تنفيذ الإجراءات
  const handleConfirmAction = async () => {
    if (!targetClient || !actionType) return;
    setIsProcessing(true);

    try {
      if (actionType === "soft_delete") {
        await onUpdateContract({
          ...targetClient,
          is_deleted: true,
          status: "archived"
        });
      } else if (actionType === "restore") {
        await onUpdateContract({
          ...targetClient,
          is_deleted: false,
          status: "active"
        });
      } else if (actionType === "permanent_delete") {
        await onUpdateContract({
          ...targetClient,
          is_deleted: true,
          is_permanently_deleted: true
        });
      }
    } catch (err) {
      console.error("Error executing client status update:", err);
    } finally {
      setIsProcessing(false);
      setTargetClient(null);
      setActionType(null);
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: "16px 20px", fontFamily: "Cairo, sans-serif" }}>
      
      {/* 1. الشريط العلوي */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#141414",
          border: "1px solid #262626",
          borderRadius: 16,
          padding: "14px 20px",
          marginBottom: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#3e1c24", padding: 8, borderRadius: 10, color: "#f87171", display: "flex" }}>
            <UserX size={20} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#ffffff" }}>إدارة وحذف حسابات العملاء</span>
        </div>

        <button
          onClick={onBack}
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
            color: "#aaaaaa",
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <ArrowRight size={16} />
          <span>رجوع</span>
        </button>
      </header>

      {/* 2. شريط البحث والتبويبات */}
      <div
        style={{
          background: "#141414",
          border: "1px solid #262626",
          borderRadius: 16,
          marginBottom: 16,
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap-reverse",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
          <input
            style={{
              background: "#1a1a1a",
              border: "1px solid #333333",
              color: "#ffffff",
              padding: "10px 16px 10px 38px",
              borderRadius: 10,
              fontSize: 13,
              width: "100%",
              outline: "none",
              boxSizing: "border-box"
            }}
            placeholder="بحث باسم العميل أو التليفون أو السلعة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            style={{
              background: activeTab === "active" ? "#d69a5f" : "#1a1a1a",
              color: activeTab === "active" ? "#000000" : "#aaaaaa",
              border: `1px solid ${activeTab === "active" ? "#d69a5f" : "#333333"}`,
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            العملاء النشطون ({activeClients.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trash")}
            style={{
              background: activeTab === "trash" ? "#d69a5f" : "#1a1a1a",
              color: activeTab === "trash" ? "#000000" : "#aaaaaa",
              border: `1px solid ${activeTab === "trash" ? "#d69a5f" : "#333333"}`,
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            سلة المهملات ({trashedClients.length})
          </button>
        </div>
      </div>

      {/* 3. قائمة العملاء */}
      <div style={{ background: "#141414", border: "1px solid #262626", borderRadius: 16, padding: 16 }}>
        {filteredList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#888888" }}>
            <AlertTriangle size={36} opacity={0.4} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {activeTab === "active" ? "لا يوجد عملاء نشطون ينطبق عليهم البحث." : "سلة المهملات فارغة."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredList.map((client) => {
              const name = client.name || client.clientName || "عميل بدون اسم";
              const item = client.item || client.itemName || "غير محدد";
              const phone = client.phone || client.clientPhone || "بدون رقم";
              const remaining = Number(client.remaining || client.remainingAmount) || 0;

              return (
                <div
                  key={client.id}
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333333",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>{name}</div>
                    <div style={{ fontSize: 13, color: "#d69a5f", marginTop: 2 }}>
                      {item} · {phone}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#888888" }}>المتبقي عليه</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#d69a5f" }}>
                        {remaining.toLocaleString()} ج.م
                      </div>
                    </div>

                    {activeTab === "active" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetClient(client);
                          setActionType("soft_delete");
                        }}
                        style={{
                          background: "#3e1c24",
                          border: "1px solid #ef444455",
                          color: "#f87171",
                          padding: "8px 14px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <Trash2 size={14} />
                        <span>نقل للمهملات</span>
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetClient(client);
                            setActionType("restore");
                          }}
                          style={{
                            background: "#143820",
                            border: "1px solid #22c55e55",
                            color: "#4ade80",
                            padding: "8px 14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>استعادة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTargetClient(client);
                            setActionType("permanent_delete");
                          }}
                          style={{
                            background: "#3e1c24",
                            border: "1px solid #ef444455",
                            color: "#f87171",
                            padding: "8px 14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <Trash2 size={14} />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. نافذة تأكيد الإجراءات */}
      {targetClient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16
          }}
        >
          <div style={{ background: "#141414", border: "1px solid #262626", borderRadius: 18, padding: 20, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: actionType === "restore" ? "#4ade80" : "#f87171" }}>
                {actionType === "soft_delete" && "تأكيد نقل العميل لسلّة المهملات"}
                {actionType === "restore" && "تأكيد استعادة العميل"}
                {actionType === "permanent_delete" && "تأكيد الحذف النهائي"}
              </span>
              <X style={{ cursor: "pointer", color: "#888" }} onClick={() => setTargetClient(null)} />
            </div>

            <p style={{ color: "#cccccc", fontSize: 13, lineHeight: "1.6", marginBottom: 18 }}>
              {actionType === "soft_delete" && (
                <>هل أنت تأكد من نقل حساب العميل <strong>({targetClient.name || targetClient.clientName})</strong> إلى سلة المهملات؟ يمكنك استعادته لاحقاً في أي وقت.</>
              )}
              {actionType === "restore" && (
                <>هل تريد إعادة تنشيط حساب العميل <strong>({targetClient.name || targetClient.clientName})</strong> وإرجاعه للشاشات الرئيسية؟</>
              )}
              {actionType === "permanent_delete" && (
                <>تحذير: الحذف النهائي لعميل <strong>({targetClient.name || targetClient.clientName})</strong> سيؤدي لمسح كافة بيانات العقد تماماً من السحابة ولا يمكن التراجع عن هذا الإجراء!</>
              )}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                style={{
                  flex: 1,
                  background: actionType === "restore" ? "#143820" : "#3e1c24",
                  border: `1px solid ${actionType === "restore" ? "#22c55e55" : "#ef444455"}`,
                  color: actionType === "restore" ? "#4ade80" : "#f87171",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                {isProcessing ? "جاري التحديث..." : "تأكيد"}
              </button>

              <button
                type="button"
                onClick={() => setTargetClient(null)}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333333",
                  color: "#aaaaaa",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
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
  );
}

export default DeleteClientScreen;
