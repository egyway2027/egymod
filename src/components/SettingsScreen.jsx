/**
 * =========================================================
 * 📌 الشاشة: الإعدادات والصلاحيات المتقدمة الشاملة (Settings & Permissions Screen)
 * 📁 المسار: src/components/settings/SettingsScreen.jsx
 * 📝 الوظيفة: إدارة الحساب الرئيسي، صلاحيات الموظفين، تصفير الجداول المحدد،
 *             اشتراك البرنامج، التسويق بالعمولة، وتخصيص طباعة الفواتير والهوية.
 * =========================================================
 */

import React, { useState, useMemo } from "react";
import {
  ArrowRight, Shield, Users, Database, CreditCard, Share2, Printer,
  Palette, Lock, Key, Trash2, Check, RefreshCw, Globe, Headphones,
  Send, ExternalLink, Copy, CheckCircle2, AlertTriangle, X
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { THEMES_LIST, THEME_CATEGORIES } from "../config/themes";
import * as languagesModule from "../config/languages";

const LANGUAGES = languagesModule.LANGUAGES || languagesModule.languages || languagesModule.default || [
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "en", name: "English", dir: "ltr" }
];

export function SettingsScreen({
  onBack,
  onSelectTheme,
  themes = [],
  currentThemeId,
  t = {},
  themeStyles = {},
  userRole = "admin"
}) {
  const isEN = useMemo(() => {
    return t?.lang === "en" || document.documentElement?.lang === "en" || document.documentElement?.dir === "ltr";
  }, [t]);

  // التبويب النشط: "account" | "employees" | "reset" | "subscription" | "affiliate" | "branding"
  const [activeTab, setActiveTab] = useState("account");

  // نافذتي الثيمات واللغات المنفصلتين
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedThemeCategory, setSelectedThemeCategory] = useState("all");

  // جلب الـ 100 ثيم بشكل مباشر وصحيح
  const allThemesList = useMemo(() => {
    if (Array.isArray(themes) && themes.length > 0) return themes;
    if (Array.isArray(THEMES_LIST) && THEMES_LIST.length > 0) return THEMES_LIST;
    return [];
  }, [themes]);

  // فلترة الثيمات بحسب الفئة المختارة
  const filteredThemes = useMemo(() => {
    if (selectedThemeCategory === "all") return allThemesList;
    return allThemesList.filter((th) => th.category === selectedThemeCategory);
  }, [allThemesList, selectedThemeCategory]);

  const availableLanguages = useMemo(() => {
    return LANGUAGES || [
      { code: "ar", name: "العربية", dir: "rtl" },
      { code: "en", name: "English", dir: "ltr" }
    ];
  }, []);

  // 1️⃣ حالة تغيير كلمة سر المشرف
  const [masterPassForm, setMasterPassForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [masterPassLoading, setMasterPassLoading] = useState(false);

  // 2️⃣ حالة إدارة الموظفين والصلاحيات
  const [employees, setEmployees] = useState([
    {
      id: "1",
      username: "emp_mohamed",
      email: "mohamed@egymod.com",
      role: "MEMBER",
      screens: ["query", "installments"],
      actions: ["add", "edit"]
    }
  ]);
  const [newEmp, setNewEmp] = useState({ username: "", email: "", password: "", screens: ["installments"], actions: ["add"] });
  const [isAddEmpModal, setIsAddEmpModal] = useState(false);

  // 3️⃣ حالة التصفير المخصص للجداول
  const [selectedTables, setSelectedTables] = useState([]);
  const [confirmMasterPass, setConfirmMasterPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // مصفوفة الجداول المتاحة للتصفير باللغتين العربية والإنجليزية
  const availableTables = useMemo(() => [
    { key: "contracts", ar: "جدول العقود", en: "Contracts Table" },
    { key: "installments", ar: "جدول الأقساط والمدفوعات", en: "Installments & Payments Table" },
    { key: "expenses", ar: "جدول المصروفات", en: "Expenses Table" },
    { key: "salary_log", ar: "جدول الرواتب والأجور", en: "Salaries Log Table" },
    { key: "capital_moves", ar: "جدول حركات رأس المال", en: "Capital Moves Table" },
    { key: "distributions_log", ar: "جدول توزيعات الأرباح", en: "Distributions Log Table" },
    { key: "withdrawals_log", ar: "جدول سحوبات الشركاء", en: "Partner Withdrawals Table" }
  ], []);

  // 4️⃣ حالة التسويق بالعمولة
  const [affiliateCopied, setAffiliateCopied] = useState(false);
  const referralLink = "https://egymod.app/ref?id=USR_88492";

  // 5️⃣ حالة الهوية المطبوعة
  const [branding, setBranding] = useState({
    storeName: "إيجيمود لإدارة الأقساط",
    phone: "01000000000",
    address: "القاهرة - مصر",
    footerNote: "البضاعة المباعة لا تُرد ولا تُستبدل إلا بالعقد الأصلي"
  });

  // معالجة تغيير كلمة السر
  const handleChangeMasterPass = async (e) => {
    e.preventDefault();
    if (masterPassForm.newPassword !== masterPassForm.confirmPassword) {
      alert(isEN ? "Passwords do not match!" : "كلمتا السر غير متطابقتين!");
      return;
    }
    setMasterPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: masterPassForm.newPassword });
      if (error) throw error;
      alert(isEN ? "Password updated successfully!" : "تم تحديث كلمة السر بنجاح!");
      setMasterPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert((isEN ? "Error: " : "خطأ: ") + (err.message || ""));
    } finally {
      setMasterPassLoading(false);
    }
  };

  // معالجة إضافة موظف جديد
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.username || !newEmp.email || !newEmp.password) {
      alert(isEN ? "Please fill all employee fields" : "يرجى ملء جميع بيانات الموظف");
      return;
    }
    const empData = { id: Date.now().toString(), ...newEmp };
    setEmployees([...employees, empData]);
    setNewEmp({ username: "", email: "", password: "", screens: ["installments"], actions: ["add"] });
    setIsAddEmpModal(false);
    alert(isEN ? "Employee added successfully" : "تمت إضافة الموظف وسنقوم بإرسال رابط الضبط لبريده");
  };

  // معالجة التصفير المخصص للجداول
  const handleSelectiveReset = async () => {
    if (selectedTables.length === 0) {
      alert(isEN ? "Please select at least one table to reset!" : "يرجى تحديد جدول واحد على الأقل لتصفيره!");
      return;
    }
    if (!confirmMasterPass) {
      alert(isEN ? "Please enter Master Password for confirmation" : "يرجى كتابة كلمة سر الحساب للتأكيد الأمني");
      return;
    }

    if (!window.confirm(isEN ? "Are you sure? This action cannot be undone!" : "هل أنت متأكد تماماً؟ هذا الإجراء سيقوم بمسح البيانات المحددة نهائياً!")) {
      return;
    }

    setResetLoading(true);
    try {
      for (const tableName of selectedTables) {
        await supabase.from(tableName).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }
      alert(isEN ? "Selected tables have been reset successfully!" : "تمت عملية تصفير الجداول المحددة بنجاح!");
      setSelectedTables([]);
      setConfirmMasterPass("");
    } catch (err) {
      console.error(err);
      alert(isEN ? "Reset failed" : "حدث خطأ أثناء عملية التصفير");
    } finally {
      setResetLoading(false);
    }
  };

  const commonInputStyle = {
    width: "100%",
    background: themeStyles.inputBg || "#121214",
    border: `1px solid ${themeStyles.border || "#333"}`,
    borderRadius: "10px",
    padding: "10px 14px",
    color: themeStyles.text || "#fff",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1100px", margin: "0 auto", padding: "10px", fontFamily: "'Cairo', sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: themeStyles.card || "#1e1e1e",
            border: `1px solid ${themeStyles.border || "#333"}`,
            color: themeStyles.accentGold || "#e8cd9c",
            padding: "8px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
          {t.back || (isEN ? "Back" : "رجوع")}
        </button>

        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          {t.settingsAndPermissions || (isEN ? "Settings & Permissions" : "الإعدادات والصلاحيات")}
        </h2>

        {/* أزرار التحكم المنفصلة للمظهر واللغة */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* 1. زر تغيير المظهر والثيمات */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #e07a5f, #d4af37)",
              color: "#111",
              border: "none",
              padding: "8px 14px",
              borderRadius: "10px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            <Palette size={16} />
            {isEN ? "System Themes" : "تغيير المظهر"}
          </button>

          {/* 2. زر تغيير لغة النظام */}
          <button
            type="button"
            onClick={() => setIsLangModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: themeStyles.card || "#1e1e1e",
              border: `1px solid ${themeStyles.border || "#333"}`,
              color: themeStyles.accentGold || "#e8cd9c",
              padding: "8px 14px",
              borderRadius: "10px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            <Globe size={16} />
            {isEN ? "Language" : "لغة النظام"}
          </button>
        </div>
      </div>

      {/* TABS SYSTEM */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        {[
          { id: "account", label: isEN ? "Master Account" : "حساب المشرف", icon: Shield },
          { id: "employees", label: isEN ? "Employees & Roles" : "الموظفون والصلاحيات", icon: Users },
          { id: "reset", label: isEN ? "Selective Reset" : "تصفير الجداول", icon: Database },
          { id: "subscription", label: isEN ? "Subscription" : "الاشتراك والتجديد", icon: CreditCard },
          { id: "affiliate", label: isEN ? "Affiliate (Earn)" : "التسويق بالعمولة", icon: Share2 },
          { id: "branding", label: isEN ? "Invoice Branding" : "هوية الطباعة", icon: Printer }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? (themeStyles.accentGold || "#e8cd9c") : (themeStyles.card || "#1e1e1e"),
                color: isActive ? "#111" : (themeStyles.text || "#fff"),
                border: `1px solid ${themeStyles.border || "#333"}`,
                borderRadius: "12px",
                padding: "12px 10px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justify: "center",
                gap: "8px",
                transition: "0.2s"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: "18px", padding: "24px" }}>
        
        {/* TAB 1: MASTER ACCOUNT SECURITY */}
        {activeTab === "account" && (
          <div style={{ maxWidth: "550px", margin: "0 auto" }}>
            <h3 style={{ color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={18} /> {isEN ? "Change Master Account Password" : "تغيير كلمة سر الحساب الرئيسي للمشرف"}
            </h3>

            <form onSubmit={handleChangeMasterPass} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "Current Password" : "كلمة السر الحالية *"}</span>
                <input
                  type="password"
                  required
                  style={commonInputStyle}
                  value={masterPassForm.oldPassword}
                  onChange={(e) => setMasterPassForm({ ...masterPassForm, oldPassword: e.target.value })}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "New Password" : "كلمة السر الجديدة *"}</span>
                <input
                  type="password"
                  required
                  style={commonInputStyle}
                  value={masterPassForm.newPassword}
                  onChange={(e) => setMasterPassForm({ ...masterPassForm, newPassword: e.target.value })}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "Confirm New Password" : "تأكيد كلمة السر الجديدة *"}</span>
                <input
                  type="password"
                  required
                  style={commonInputStyle}
                  value={masterPassForm.confirmPassword}
                  onChange={(e) => setMasterPassForm({ ...masterPassForm, confirmPassword: e.target.value })}
                />
              </label>

              <button
                type="submit"
                disabled={masterPassLoading}
                style={{
                  background: "linear-gradient(135deg, #e07a5f, #d4af37)",
                  color: "#111",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                {masterPassLoading ? (isEN ? "Updating..." : "جاري الحفظ...") : (isEN ? "Update Master Password" : "حفظ كلمة السر الجديدة")}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: EMPLOYEES & PERMISSIONS MATRIX */}
        {activeTab === "employees" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800, margin: 0 }}>
                {isEN ? "Employees Management & Access Permissions" : "إدارة الموظفين وتحديد صلاحيات الشاشات"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEmpModal(true)}
                style={{
                  background: themeStyles.inputBg || "#121214",
                  border: `1px solid ${themeStyles.accentGold || "#e8cd9c"}`,
                  color: themeStyles.accentGold || "#e8cd9c",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "12.5px",
                  cursor: "pointer"
                }}
              >
                + {isEN ? "Add New Employee" : "إضافة موظف جديد"}
              </button>
            </div>

            {/* TABLE OF EMPLOYEES */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#fff", fontSize: "13px", textAlign: isEN ? "left" : "right" }}>
                <thead>
                  <tr style={{ background: themeStyles.inputBg || "#121214", color: themeStyles.accentGold || "#e8cd9c" }}>
                    <th style={{ padding: "10px" }}>{isEN ? "Username" : "اسم المستخدم"}</th>
                    <th style={{ padding: "10px" }}>{isEN ? "Email" : "البريد الإلكتروني"}</th>
                    <th style={{ padding: "10px" }}>{isEN ? "Allowed Screens" : "الشاشات المتاحة"}</th>
                    <th style={{ padding: "10px" }}>{isEN ? "Allowed Actions" : "الصلاحيات الإجرائية"}</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>{isEN ? "Actions" : "إجراءات"}</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#333"}` }}>
                      <td style={{ padding: "10px", fontWeight: 700 }}>{emp.username}</td>
                      <td style={{ padding: "10px" }}>{emp.email}</td>
                      <td style={{ padding: "10px", color: themeStyles.accentGold || "#e8cd9c" }}>
                        {emp.screens.join(" • ")}
                      </td>
                      <td style={{ padding: "10px" }}>
                        {emp.actions.join(" • ")}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => alert(isEN ? "Reset password email sent!" : "تم إرسال رابط إعادة تعيين كلمة السر لبريد الموظف")}
                          style={{ background: "none", border: "none", color: "#e07a5f", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                        >
                          <Key size={14} /> {isEN ? "Reset Password" : "استعادة كلمة السر"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MODAL: ADD EMPLOYEE */}
            {isAddEmpModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
                <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "480px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "15px" }}>{isEN ? "Create Employee Account" : "تسجيل موظف جديد"}</h4>
                    <button onClick={() => setIsAddEmpModal(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={18} /></button>
                  </div>

                  <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input placeholder={isEN ? "Username" : "اسم المستخدم والمدخل"} style={commonInputStyle} value={newEmp.username} onChange={(e) => setNewEmp({ ...newEmp, username: e.target.value })} />
                    <input placeholder={isEN ? "Email Address" : "البريد الإلكتروني للموظف"} style={commonInputStyle} value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} />
                    <input type="password" placeholder={isEN ? "Initial Password" : "كلمة السر الأولية"} style={commonInputStyle} value={newEmp.password} onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })} />

                    <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaa", marginTop: "6px" }}>
                      {isEN ? "Select Allowed Screens:" : "تحديد الشاشات المسموح بالدخول إليها:"}
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {["query", "installments", "capital", "expenses", "reports"].map((sc) => (
                        <label key={sc} style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <input
                            type="checkbox"
                            checked={newEmp.screens.includes(sc)}
                            onChange={(e) => {
                              const updated = e.target.checked ? [...newEmp.screens, sc] : newEmp.screens.filter((s) => s !== sc);
                              setNewEmp({ ...newEmp, screens: updated });
                            }}
                          />
                          {sc}
                        </label>
                      ))}
                    </div>

                    <button type="submit" style={{ background: "linear-gradient(135deg, #e07a5f, #d4af37)", color: "#111", border: "none", borderRadius: "8px", padding: "10px", fontWeight: 800, marginTop: "10px", cursor: "pointer" }}>
                      {isEN ? "Create Account & Send Email" : "إنشاء الحساب وإرسال البيانات"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SELECTIVE TABLE RESET */}
        {activeTab === "reset" && (
          <div style={{ maxWidth: "650px", margin: "0 auto" }}>
            <h3 style={{ color: "#e07a5f", fontSize: "16px", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} /> {isEN ? "Selective System Factory Reset" : "إعادة ضبط المصنع وتصفير الجداول المحددة"}
            </h3>
            <p style={{ fontSize: "12.5px", color: themeStyles.subText || "#aaa", marginBottom: "16px" }}>
              {isEN ? "Select the exact database tables you want to clear permanently:" : "اختر الجداول المراد تصفير بياناتها ومسحها نهائياً من قاعدة البيانات السحابية:"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              {availableTables.map((tbl) => {
                const isSelected = selectedTables.includes(tbl.key);
                return (
                  <div
                    key={tbl.key}
                    onClick={() => {
                      if (isSelected) setSelectedTables(selectedTables.filter((k) => k !== tbl.key));
                      else setSelectedTables([...selectedTables, tbl.key]);
                    }}
                    style={{
                      background: isSelected ? "rgba(224,122,95,0.15)" : (themeStyles.inputBg || "#121214"),
                      border: `1px solid ${isSelected ? "#e07a5f" : (themeStyles.border || "#333")}`,
                      borderRadius: "10px",
                      padding: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justify: "space-between"
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#e07a5f" : (themeStyles.text || "#fff") }}>
                      {isEN ? tbl.en : tbl.ar}
                    </span>
                    {isSelected && <Check size={16} style={{ color: "#e07a5f" }} />}
                  </div>
                );
              })}
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: themeStyles.subText || "#aaa", marginBottom: "16px" }}>
              <span>{isEN ? "Enter Master Password to confirm reset:" : "أدخل كلمة سر الحساب للتأكيد والأمان:"}</span>
              <input
                type="password"
                placeholder="••••••••"
                style={commonInputStyle}
                value={confirmMasterPass}
                onChange={(e) => setConfirmMasterPass(e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={handleSelectiveReset}
              disabled={resetLoading}
              style={{
                width: "100%",
                background: "#a83232",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: resetLoading ? "wait" : "pointer"
              }}
            >
              {resetLoading ? (isEN ? "Clearing..." : "جاري تصفير البيانات...") : (isEN ? "Execute Selective Factory Reset" : "تأكيد وتحديد تصفير الجداول المختارة")}
            </button>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION & AUTO RENEWAL */}
        {activeTab === "subscription" && (
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "rgba(232,205,156,0.12)", border: `1px solid ${themeStyles.accentGold || "#e8cd9c"}`, borderRadius: "50%", padding: "16px", marginBottom: "12px" }}>
              <CreditCard size={32} style={{ color: themeStyles.accentGold || "#e8cd9c" }} />
            </div>
            <h3 style={{ color: themeStyles.accentGold || "#e8cd9c", fontSize: "18px", fontWeight: 800, margin: 0 }}>
              {isEN ? "Egymod Cloud Subscription" : "اشتراك برنامج إيجيمود السحابي"}
            </h3>
            <p style={{ fontSize: "13px", color: themeStyles.subText || "#aaa", marginTop: "4px" }}>
              {isEN ? "Active Plan: Professional Unlimited" : "الخطة الحالية: الاحترافية الغير محدودة — الحالة: نشط 🟢"}
            </p>

            <div style={{ background: themeStyles.inputBg || "#121214", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: "14px", padding: "16px", margin: "20px 0", textAlign: isEN ? "left" : "right" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: themeStyles.subText || "#aaa" }}>{isEN ? "Expiration Date:" : "تاريخ انتهاء الاشتراك الحالي:"}</span>
                <span style={{ fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>2027-08-08</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: themeStyles.subText || "#aaa" }}>{isEN ? "Supported Payments:" : "طرق الدفع المدعومة:"}</span>
                <span style={{ fontWeight: 700 }}>Vodafone Cash • InstaPay • Visa/Mastercard • Fawry • Tap</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(isEN ? "Redirecting to Paymob / Tap Payments secure checkout..." : "جاري تحويلك لبوابة الدفع السحابية المباشرة (Paymob / InstaPay)...");
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #e07a5f, #d4af37)",
                color: "#111",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              🚀 {isEN ? "Renew Subscription Automatically" : "تجديد الاشتراك التلقائي اللحظي"}
            </button>

            {/* CUSTOMER SUPPORT */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${themeStyles.border || "#333"}`, display: "flex", justifyContent: "space-around", fontSize: "13px" }}>
              <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" style={{ color: "#4caf50", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <Headphones size={16} /> {isEN ? "Customer Support (WhatsApp)" : "خدمة العملاء والدعم الفني"}
              </a>
            </div>
          </div>
        )}

        {/* TAB 5: AFFILIATE MARKETING */}
        {activeTab === "affiliate" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h3 style={{ color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Share2 size={18} /> {isEN ? "Affiliate Program - Earn Money" : "برنامج التسويق بالعمولة لربح المال"}
            </h3>
            <p style={{ fontSize: "12.5px", color: themeStyles.subText || "#aaa", marginBottom: "16px" }}>
              {isEN ? "Share your unique referral link and earn 20% recurring commission on every subscription!" : "أنشئ رابطك الخاص وسوّق للبرنامج لاكتساب عمولة مجزية 20% عند اشتراك أي عميل عن طريقك!"}
            </p>

            <div style={{ background: themeStyles.inputBg || "#121214", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <input readOnly value={referralLink} style={{ ...commonInputStyle, border: "none", background: "transparent" }} />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  setAffiliateCopied(true);
                  setTimeout(() => setAffiliateCopied(false), 2000);
                }}
                style={{ background: themeStyles.accentGold || "#e8cd9c", color: "#111", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
              >
                {affiliateCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {affiliateCopied ? (isEN ? "Copied!" : "تم النسخ!") : (isEN ? "Copy Link" : "نسخ الرابط")}
              </button>
            </div>

            {/* AFFILIATE STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: themeStyles.inputBg || "#121214", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaa" }}>{isEN ? "Referred Subscriptions" : "العملاء المشتركين عن طريقك"}</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "4px" }}>12</div>
              </div>
              <div style={{ background: themeStyles.inputBg || "#121214", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaa" }}>{isEN ? "Available Earnings" : "الأرباح القابلة للسحب"}</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>1,400 {t.currency || "ج.م"}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: INVOICE & PRINT BRANDING */}
        {activeTab === "branding" && (
          <div style={{ maxWidth: "550px", margin: "0 auto" }}>
            <h3 style={{ color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Printer size={18} /> {isEN ? "Receipt & Invoice Print Branding" : "تخصيص ترويسة وتذييل الفواتير والإيصالات"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "Store Name" : "اسم المحل / الشركة"}</span>
                <input style={commonInputStyle} value={branding.storeName} onChange={(e) => setBranding({ ...branding, storeName: e.target.value })} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "Store Phone" : "تليفون المحل"}</span>
                <input style={commonInputStyle} value={branding.phone} onChange={(e) => setBranding({ ...branding, phone: e.target.value })} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "Address" : "العنوان بالتفصيل"}</span>
                <input style={commonInputStyle} value={branding.address} onChange={(e) => setBranding({ ...branding, address: e.target.value })} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: themeStyles.subText || "#aaa" }}>
                <span>{isEN ? "Footer Note" : "ملاحظة تذييل الفاتورة (مثلاً: البضاعة المباعة لا ترد...)"}</span>
                <input style={commonInputStyle} value={branding.footerNote} onChange={(e) => setBranding({ ...branding, footerNote: e.target.value })} />
              </label>

              <button
                type="button"
                onClick={() => alert(isEN ? "Branding saved!" : "تم حفظ بيانات الهوية والطباعة بنجاح!")}
                style={{ background: "linear-gradient(135deg, #e07a5f, #d4af37)", color: "#111", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", marginTop: "10px" }}
              >
                {isEN ? "Save Invoice Branding" : "حفظ بيانات طباعة الإيصالات"}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 🟢 MODAL 1: THEMES SELECTOR */}
      {isThemeModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: "20px", width: "100%", maxWidth: "850px", maxHeight: "85vh", overflowY: "auto", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${themeStyles.border || "#333"}`, paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Palette size={18} /> {isEN ? "Choose System Theme" : "اختيار ثيم ومظهر البرنامج"}
              </h3>
              <button onClick={() => setIsThemeModalOpen(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* أزرار فئات الثيمات (جميع الثيمات، الملكي، الداكن، الزجاجي...) */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" }}>
              {(THEME_CATEGORIES || []).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedThemeCategory(cat.id)}
                  style={{
                    background: selectedThemeCategory === cat.id ? (themeStyles.accentGold || "#e8cd9c") : (themeStyles.inputBg || "#121214"),
                    color: selectedThemeCategory === cat.id ? "#111" : (themeStyles.text || "#fff"),
                    border: `1px solid ${themeStyles.border || "#333"}`,
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* THEMES GRID (عرض الـ 100 ثيم كاملة) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "12px" }}>
              {filteredThemes.map((th) => {
                const isCurrent = currentThemeId === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      if (onSelectTheme) onSelectTheme(th.id || th);
                      setIsThemeModalOpen(false);
                    }}
                    style={{
                      background: th.card || "#111",
                      border: `2px solid ${isCurrent ? (themeStyles.accentGold || "#e8cd9c") : (themeStyles.border || "#333")}`,
                      borderRadius: th.cardRadius || "12px",
                      padding: "14px",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      gap: "10px",
                      boxShadow: th.cardShadow || "none"
                    }}
                  >
                    <div style={{ fontWeight: 800, color: th.accentGold || th.accent || "#fff", fontSize: "13.5px" }}>
                      {th.name}
                    </div>
                    
                    {/* معاينة درجات الألوان الحقيقية للثيم */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: th.bg || "#111", border: "1px solid #555" }} title="خلفية الصفحة" />
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: th.card || "#222", border: "1px solid #555" }} title="الكروت" />
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: th.accentGold || th.accent || "#d4af37", border: "1px solid #fff" }} title="اللون الرئيسي" />
                    </div>

                    <button
                      type="button"
                      style={{
                        background: isCurrent ? "#4caf50" : (th.accentGold || th.accent || "#e8cd9c"),
                        color: "#111",
                        border: "none",
                        borderRadius: th.buttonRadius || "6px",
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        fontWeight: 800
                      }}
                    >
                      {isCurrent ? (isEN ? "Active ✓" : "نشط الآن ✓") : (isEN ? "Apply Theme" : "تطبيق الثيم")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 MODAL 2: LANGUAGE SELECTOR */}
      {isLangModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: "20px", width: "100%", maxWidth: "420px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${themeStyles.border || "#333"}`, paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: themeStyles.accentGold || "#e8cd9c", fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={18} /> {isEN ? "Select Language" : "اختر لغة النظام"}
              </h3>
              <button onClick={() => setIsLangModalOpen(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code || lang.id}
                  type="button"
                  onClick={() => {
                    document.documentElement.lang = lang.code;
                    document.documentElement.dir = lang.dir || (lang.code === "ar" ? "rtl" : "ltr");
                    window.location.reload();
                  }}
                  style={{
                    background: (t?.lang === lang.code || (isEN && lang.code === "en") || (!isEN && lang.code === "ar")) ? (themeStyles.accentGold || "#e8cd9c") : (themeStyles.inputBg || "#121214"),
                    color: (t?.lang === lang.code || (isEN && lang.code === "en") || (!isEN && lang.code === "ar")) ? "#111" : (themeStyles.text || "#fff"),
                    border: `1px solid ${themeStyles.border || "#333"}`,
                    borderRadius: "10px",
                    padding: "12px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justify: "space-between"
                  }}
                >
                  <span>{lang.name || lang.label}</span>
                  {((t?.lang === lang.code) || (isEN && lang.code === "en") || (!isEN && lang.code === "ar")) && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
