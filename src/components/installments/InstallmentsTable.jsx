import React from 'react';
import { DollarSign, Check, AlertTriangle, Clock } from 'lucide-react';

export default function InstallmentsTable({ installments, onPayClick, themeStyles = {} }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><Check size={14}/> مدفوع بالكامل</span>;
      case 'PARTIAL':
        return <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={14}/> سداد جزئي</span>;
      case 'OVERDUE':
        return <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><AlertTriangle size={14}/> متأخر</span>;
      default:
        return <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>مستحق</span>;
    }
  };

  return (
    <div style={{ background: themeStyles.card || "#1e1e1e", borderRadius: "14px", border: `1px solid ${themeStyles.border || "#333"}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontWeight: "800", fontSize: "16px", color: themeStyles.text || "#fff" }}>📅 جدول ترتيب الأقساط</h3>
        <span style={{ fontSize: "12px", color: "#aaa" }}>إجمالي الأقساط: {installments.length}</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "14px", color: themeStyles.text || "#fff" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${themeStyles.border || "#333"}`, color: "#aaa", fontSize: "12px" }}>
              <th style={{ padding: "12px 16px" }}>رقم القسط</th>
              <th style={{ padding: "12px 16px" }}>تاريخ الاستحقاق</th>
              <th style={{ padding: "12px 16px" }}>القيمة الأصلية</th>
              <th style={{ padding: "12px 16px" }}>المدفوع</th>
              <th style={{ padding: "12px 16px" }}>المتبقي</th>
              <th style={{ padding: "12px 16px" }}>الحالة</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "#888" }}>لا توجد أقساط مسجلة لهذا العميل.</td>
              </tr>
            ) : (
              installments.map((inst) => (
                <tr key={inst.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#222"}` }}>
                  <td style={{ padding: "14px 16px", fontWeight: "700" }}>قسط #{inst.number}</td>
                  <td style={{ padding: "14px 16px" }}>{inst.dueDate}</td>
                  <td style={{ padding: "14px 16px", fontWeight: "700" }}>{inst.amount.toLocaleString()} ج.م</td>
                  <td style={{ padding: "14px 16px", color: "#10b981", fontWeight: "700" }}>{inst.paid.toLocaleString()} ج.م</td>
                  <td style={{ padding: "14px 16px", color: "#ef4444", fontWeight: "700" }}>{(inst.amount - inst.paid).toLocaleString()} ج.م</td>
                  <td style={{ padding: "14px 16px" }}>{getStatusBadge(inst.status)}</td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {inst.status !== 'PAID' ? (
                      <button
                        onClick={() => onPayClick(inst)}
                        style={{
                          background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#fff",
                          border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: "700",
                          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px"
                        }}
                      >
                        <DollarSign size={14} /> سداد
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>تم السداد ✓</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
