/**
 * =========================================================
 * 📌 النافذة: مركز السجلات والتقارير الشامل (Central Records Menu)
 * 📁 المسار: src/components/modals/CentralRecordsMenu.jsx
 * 📝 الوظيفة: قائمة منسدلة/نافذة مركزية للوصول السريع لكافة
 *            سجلات وتقارير برنامج إيجيمود.
 * =========================================================
 */

import React from "react";
import { 
  FileText, 
  FolderArchive, 
  Receipt, 
  Users, 
  UserCheck, 
  Wallet, 
  TrendingUp, 
  X, 
  ChevronLeft 
} from "lucide-react";

export function CentralRecordsMenu({ isOpen, onClose, onSelectRecord, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  if (!isOpen) return null;

  // قائمة السجلات والتقارير الـ 7 الشاملة بالبرنامج
  const recordItems = [
    {
      id: "active_contracts",
      title: t.activeContracts || (isEN ? "Active Contracts Register" : "سجل العقود النشطة"),
      desc: isEN ? "Manage running installment sales & clients" : "إدارة مبيعات التقسيط الحالية والعقود الشغالة",
      icon: <FileText size={20} style={{ color: "#22c55e" }} />,
      tag: "نشط"
    },
    {
      id: "archived_contracts",
      title: t.archivedContracts || (isEN ? "Archived Contracts Register" : "سجل العقود المؤرشفة"),
      desc: isEN ? "Fully paid and completed contracts history" : "أرشيف العقود المسددة بالكامل والتصفيات",
      icon: <FolderArchive size={20} style={{ color: "#e8cd9c" }} />,
      tag: "أرشيف"
    },
    {
      id: "payment_records",
      title: t.paymentRecords || (isEN ? "Payments & Receipts Log" : "سجل عمليات السداد والتحصيل"),
      desc: isEN ? "Track cash flow and daily collected payments" : "حركة الخزينة والتحصيلات اليومية المباشرة",
      icon: <Receipt size={20} style={{ color: "#3b82f6" }} />,
      tag: "خزينة"
    },
    {
      id: "all_clients_register",
      title: t.allRegisterTitle || (isEN ? "Comprehensive Client Register" : "سجل بيانات العملاء الشامل"),
      desc: isEN ? "Excel-style grid for all client details" : "جدول تفصيلي شامل لكل العقول بأسلوب Excel",
      icon: <Users size={20} style={{ color: "#e07a5f" }} />,
      tag: "شامل"
    },
    {
      id: "employees_register",
      title: t.employeesRegister || (isEN ? "Employees & Staff Directory" : "سجل الموظفين والمستخدمين"),
      desc: isEN ? "Staff profiles, roles, and access control" : "بيانات الموظفين، الأدوار، وصلاحيات الحسابات",
      icon: <UserCheck size={20} style={{ color: "#a855f7" }} />,
      tag: "إدارة"
    },
    {
      id: "expenses_register",
      title: t.expensesRegister || (isEN ? "Payroll & Expenses Log" : "سجل المرتبات والمصروفات الإدارية"),
      desc: isEN ? "Operational costs, salaries, and company expenses" : "المصاريف التشغيلية، المرتبات، والمسحوبات",
      icon: <Wallet size={20} style={{ color: "#f97316" }} />,
      tag: "مصاريف"
    },
    {
      id: "profits_register",
      title: t.profitsRegister || (isEN ? "Net Profits & Partner Shares" : "سجل الأرباح وتوزيع الحصص"),
      desc: isEN ? "Net profit analysis and company partner distribution" : "تحليل صافي الأرباح وتوزيع أرباح الشركاء",
      icon: <TrendingUp size={20} style={{ color: "#10b981" }} />,
      tag: "أرباح"
    }
  ];

  const handleItemClick = (recordId) => {
    if (onSelectRecord) {
      onSelectRecord(recordId);
    }
    onClose();
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100vw", 
        height: "100vh", 
        background: "rgba(0,0,0,0.85)", 
        backdropFilter: "blur(6px)", 
        zIndex: 9999, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "15px" 
      }} 
      dir={isEN ? "ltr" : "rtl"}
    >
      <div 
        style={{ 
          width: "100%", 
          maxWidth: "750px", 
          maxHeight: "88vh", 
          background: themeStyles.card || "#1a1a1c", 
          border: `1px solid ${themeStyles.border || "#333333"}`, 
          borderRadius: "18px", 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(0,0,0,0.6)"
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416" }}>
          <div>
            <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "18px", fontWeight: 800 }}>
              {t.centralRecordsTitle || (isEN ? "Central Records & Reports Hub" : "مركز السجلات والتقارير الشامل")}
            </h3>
            <span style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginTop: "2px", display: "block" }}>
              اختر السجل المراد استعراضه من القائمة الموحدة
            </span>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* LIST ITEMS */}
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {recordItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: themeStyles.inputBg || "#121214",
                border: `1px solid ${themeStyles.border || "#2a2a2d"}`,
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: themeStyles.text || "#ffffff", fontSize: "14.5px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: themeStyles.subText || "#888888", marginTop: "3px" }}>
                    {item.desc}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(232,205,156,0.1)", color: themeStyles.accentGold || "#e8cd9c", border: "1px solid rgba(232,205,156,0.2)" }}>
                  {item.tag}
                </span>
                <ChevronLeft size={18} style={{ color: themeStyles.subText || "#888888", transform: isEN ? "rotate(180deg)" : "none" }} />
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${themeStyles.border || "#333333"}`, background: themeStyles.inputBg || "#141416", textAlign: "left" }}>
          <button type="button" onClick={onClose} style={{ background: themeStyles.card || "#222224", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.text || "#ffffff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "12.5px" }}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default CentralRecordsMenu;
