/**
 * =========================================================
 * 📌 النافذة: سلة المهملات الشاملة (Recycle Bin Modal)
 * 📁 المسار: src/components/modals/RecycleBinModal.jsx
 * 📝 الوظيفة: استرجاع أو حذف البيانات المحذوفة نهائياً.
 * =========================================================
 */

import React from "react";
import { Trash2, RotateCcw, AlertOctagon, X } from "lucide-react";

export function RecycleBinModal({ isOpen, onClose, deletedItems = [], onRestoreItem, onPermanentDelete, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }} dir={isEN ? "ltr" : "rtl"}>
      <div style={{ width: "100%", maxWidth: "850px", maxHeight: "88vh", background: themeStyles.card || "#1a1a1c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Trash2 style={{ color: "#e07a5f" }} size={22} />
            <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "17px", fontWeight: 800 }}>
              سلة المهملات الشاملة (Recycle Bin)
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <div style={{ overflowX: "auto", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "center" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121214", color: themeStyles.accentGold || "#e8cd9c" }}>
                  <th style={{ padding: "10px" }}>#</th>
                  <th style={{ padding: "10px" }}>الاسم / العنصر</th>
                  <th style={{ padding: "10px" }}>قسم المنشأ</th>
                  <th style={{ padding: "10px" }}>تاريخ الحذف</th>
                  <th style={{ padding: "10px" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {deletedItems.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "24px", color: "#888" }}>سلة المهملات فارغة حالياً.</td></tr>
                ) : (
                  deletedItems.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: `1px solid ${themeStyles.border || "#222224"}` }}>
                      <td style={{ padding: "10px", color: "#888" }}>{idx + 1}</td>
                      <td style={{ padding: "10px", fontWeight: 700 }}>{item.name || item.title || "عنصر محذوف"}</td>
                      <td style={{ padding: "10px", color: themeStyles.subText || "#aaa" }}>{item.type || "عقد ملغى"}</td>
                      <td style={{ padding: "10px", color: "#888" }}>{item.deletedAt || "اليوم"}</td>
                      <td style={{ padding: "10px", display: "flex", justifyContent: "center", gap: "8px" }}>
                        <button type="button" onClick={() => onRestoreItem && onRestoreItem(item)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(34, 197, 94, 0.15)", border: "1px solid #22c55e", color: "#22c55e", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}>
                          <RotateCcw size={13} /> استرجاع
                        </button>
                        <button type="button" onClick={() => onPermanentDelete && onPermanentDelete(item)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}>
                          <AlertOctagon size={13} /> حذف نهائي
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
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416", textAlign: "left" }}>
          <button type="button" onClick={onClose} style={{ background: themeStyles.card || "#222", border: "1px solid #444", color: "#fff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12.5px" }}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default RecycleBinModal;
