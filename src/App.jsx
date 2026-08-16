/**
 * =========================================================
 * 📌 الملف: الشاشة الرئيسية للنظام (Main App Container)
 * 📁 المسار: src/App.jsx
 * 📝 الوظيفة: الموزع الرئيسي للشاشات المربوط بـ 15 لغة و 100 ثيم + نظام الأوضاع المزدوج (عادي / Pro)
 * =========================================================
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  UserPlus, CreditCard, Search, CalendarClock, UserX, Trash2, Wallet, Users, Briefcase, Settings, Power, TrendingUp, Calculator, Globe, Palette, X, MessageSquare, FolderKanban, CheckCircle2, Archive, LayoutDashboard, Menu, ArrowRight
} from "lucide-react";
import { fetchAllClientsContracts } from "./services/clientFetchService";
import { supabase } from "./supabaseClient";
import { AddClientScreen } from "./components/AddClientScreen";
import { ClientQueryScreen } from "./components/clientQuery/ClientQueryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import InstallmentsScreen from "./components/installments/InstallmentsScreen";
import MonthlyDues from "./components/MonthlyDues";
import OverdueScreen from "./components/overdue/OverdueScreen";
import { WhatsAppHubModal } from "./components/modals/WhatsAppHubModal";
import { RecycleBinModal } from "./components/modals/RecycleBinModal";
import { GlobalSearchModal } from "./components/modals/GlobalSearchModal";
import { CentralRecordsMenu } from "./components/modals/CentralRecordsMenu";
import DeleteClientScreen from "./components/DeleteClientScreen";
import {
  TreasuryMainScreen,
  PartnersScreen,
  ExpensesScreen,
  EmployeesMergedScreen,
  ProfitDistributionScreen
} from "./components/treasury";
import { App as CapacitorApp } from "@capacitor/app";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { useNavigation } from "./hooks/useNavigation";
import { useThemeAndLang } from "./hooks/useThemeAndLang";
import { useIsMobile } from "./hooks/useIsMobile";

export function App() {
  const { currentScreen, navigateTo, handleBack } = useNavigation("dashboard");
  const [clientsList, setClientsList] = useState([]);

  const isMobile = useIsMobile();

  // 🔄 نظام التبديل بين الوضع العادي و Pro للديسكتوب والويب
  const [displayMode, setDisplayMode] = useState(() => {
    return localStorage.getItem("app_display_mode") || "normal";
  });

  const handleModeChange = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem("app_display_mode", mode);
  };

  // 📂 حالة القائمة الجانبية بالتحويم الذكي
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".tb-dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  // 🔄 إبلاغ نظام التحديثات الهوائية بأن التطبيق يشتغل بنجاح لمنع الـ Rollback
  useEffect(() => {
    CapacitorUpdater.notifyAppReady();
  }, []);

  // 📌 حالات تنبيه الخروج عند الضغط على زر الرجوع في الموبايل
  const [showExitHint, setShowExitHint] = useState(false);
  const [lastBackPress, setLastBackPress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [contractsRes, installmentsRes, distRes] = await Promise.all([
          supabase.from("contracts").select("*").order("created_at", { ascending: false }),
          supabase.from("installments").select("*").order("created_at", { ascending: true }),
          supabase.from("distributions_log").select("*")
        ]);

        const contractsData = contractsRes.data || [];
        const installmentsData = installmentsRes.data || [];
        const distData = distRes.data || [];

        const merged = contractsData.map((contract) => {
          const matchedInst = installmentsData.filter(
            (inst) => String(inst.contract_id) === String(contract.id)
          );
          return {
            ...contract,
            installments: matchedInst,
            distributions: distData
          };
        });

        if (isMounted) {
          setClientsList(merged);
        }
      } catch (err) {
        console.error("❌ خطأ أثناء جلب بيانات الصفحة الرئيسية:", err);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [currentScreen]);

  // 🌐🎨 محرك اللغات الـ 15 والثيمات الـ 100
  const {
    currentLang,
    changeLang,
    currentThemeId,
    changeTheme,
    t,
    themeStyles,
    isRTL,
    LANGUAGES,
    THEMES_LIST,
    THEME_CATEGORIES
  } = useThemeAndLang();

  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activeThemeTab, setActiveThemeTab] = useState("regular");

  // 📌 حالات الاختصارات والنوافذ الجديدة
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showRecycleBinModal, setShowRecycleBinModal] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [showCentralRecordsModal, setShowCentralRecordsModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);

  // 🌟 نافذة التنبيه المخصصة بوسط الشاشة
  const [successModal, setSuccessModal] = useState({ open: false, title: "", msg: "" });

  // 📱 التحكم في زر الرجوع الفيزيائي لأجهزة الأندرويد
  useEffect(() => {
    let backListener;
    async function setupBackButton() {
      try {
        backListener = await CapacitorApp.addListener("backButton", () => {
          if (showWhatsAppModal) { setShowWhatsAppModal(false); return; }
          if (showRecycleBinModal) { setShowRecycleBinModal(false); return; }
          if (showGlobalSearchModal) { setShowGlobalSearchModal(false); return; }
          if (showCentralRecordsModal) { setShowCentralRecordsModal(false); return; }
          if (showLangModal) { setShowLangModal(false); return; }
          if (showThemeModal) { setShowThemeModal(false); return; }
          if (showCalcModal) { setShowCalcModal(false); return; }

          if (currentScreen !== "dashboard") {
            handleBack();
            return;
          }

          const now = Date.now();
          if (now - lastBackPress < 2000) {
            CapacitorApp.exitApp();
          } else {
            setLastBackPress(now);
            setShowExitHint(true);
            setTimeout(() => setShowExitHint(false), 2000);
          }
        });
      } catch (err) {
        // بيئة الويب
      }
    }
    setupBackButton();
    return () => {
      if (backListener && typeof backListener.remove === "function") {
        backListener.remove();
      }
    };
  }, [currentScreen, showWhatsAppModal, showRecycleBinModal, showGlobalSearchModal, showCentralRecordsModal, showLangModal, showThemeModal, showCalcModal, lastBackPress]);

  // أزرار شبكة التحكم الرئيسية
  const buttons = [
    { key: "addClient", label: t.addClient || "إضافة عميل جديد", icon: UserPlus, tone: "dark" },
    { key: "pay", label: t.pay || "سداد الأقساط", icon: CreditCard, tone: "gold" },
    { key: "search", label: t.search || "استعلام عن عميل", icon: Search, tone: "silver" },
    { key: "monthlyDues", label: t.monthlyDues || "مستحقات هذا الشهر", icon: CalendarClock, tone: "copper" },
    { key: "lateClients", label: t.lateClients || "المتأخرين عن السداد", icon: UserX, tone: "rose" },
    { key: "deleteClient", label: t.deleteClient || "حذف حساب عميل", icon: Trash2, tone: "gold" },
    { key: "treasury", label: t.treasury || "توزيع الأرباح والخزينة", icon: Wallet, tone: "roseDark" },
    { key: "treasuryPartners", label: t.treasuryPartners || "الشركاء ورأس المال", icon: Users, tone: "copper" },
    { key: "treasuryEmployees", label: t.treasuryEmployees || "شؤون الموظفين والرواتب", icon: Briefcase, tone: "silver" },
    { key: "settings", label: t.settings || "الإعدادات والصلاحيات", icon: Settings, tone: "tan" },
    { key: "whatsapp", label: "مركز الواتساب الذكي", icon: MessageSquare, tone: "roseLight" },
    { key: "exit", label: t.exit || "تسجيل الخروج", icon: Power, tone: "dark" },
  ];

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const netProfit = useMemo(() => {
    const totalCollectedProfits = (clientsList || []).reduce((acc, curr) => {
      const sale = Number(curr.sale_price ?? curr.salePrice ?? curr.sale ?? 0);
      const cost = Number(curr.cost_price ?? curr.costPrice ?? curr.cost ?? 0);
      const down = Number(curr.down_payment ?? curr.downPayment ?? curr.down ?? 0);

      const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
      const totalPaidInst = instArr
        .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);

      if (sale <= 0) return acc;
      return acc + Math.round((down + totalPaidInst) * ((sale - cost) / sale));
    }, 0);

    const allDistributions = clientsList?.[0]?.distributions || [];
    const totalDistributedSoFar = allDistributions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    return Math.max(0, totalCollectedProfits - totalDistributedSoFar);
  }, [clientsList]);

  const monthlyDues = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    return (clientsList || []).reduce((acc, curr) => {
      if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;

      const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
      const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);
      const monthly = Number(curr.monthly_installment || curr.monthlyInstallment || curr.monthly || 0);

      const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);

      const paidFromInst = instArr
        .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const totalPaid = paidFromInst > 0 ? paidFromInst : Number(curr.totalPaid || curr.total_paid || 0);

      const remaining = Math.max(0, sale - down - totalPaid);
      if (remaining <= 0 || monthly <= 0) return acc;

      const paidThisMonth = instArr
        .filter((i) => {
          if (!i.is_paid && i.status !== "paid" && !(Number(i.amount) > 0)) return false;
          const dateVal = i.paid_at || i.due_date || i.date || i.payDate || i.created_at;
          if (!dateVal) return false;
          const d = new Date(dateVal);
          return d.getFullYear() === curYear && d.getMonth() === curMonth;
        })
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);

      const requiredThisMonth = Math.min(monthly, remaining);
      const netDueThisMonth = Math.max(0, requiredThisMonth - paidThisMonth);

      return acc + netDueThisMonth;
    }, 0);
  }, [clientsList]);

  // مكونات الشاشات الفرعية النشطة
  const renderCurrentScreenComponent = () => {
    switch (currentScreen) {
      case "addClient":
        return (
          <AddClientScreen
            onSuccess={() => {
              setSuccessModal({ open: true, title: "تمت العملية بنجاح", msg: "تم حفظ بيانات العقد بنجاح بالسحابة!" });
              handleBack();
            }}
            onBack={handleBack}
            t={t}
            themeStyles={themeStyles}
          />
        );
      case "clientQuery":
        return <ClientQueryScreen onBack={handleBack} t={t} themeStyles={themeStyles} />;
      case "pay":
        return <InstallmentsScreen contracts={clientsList} onBack={handleBack} t={t} themeStyles={themeStyles} />;
      case "monthlyDues":
        return <MonthlyDues clientsList={clientsList} onOpenPaymentModal={() => navigateTo("pay")} onBack={handleBack} />;
      case "deleteClient":
        return <DeleteClientScreen clientsList={clientsList} onBack={handleBack} t={t} themeStyles={themeStyles} />;
      case "overdue":
        return <OverdueScreen contracts={clientsList} clientsList={clientsList} onBack={handleBack} t={t} themeStyles={themeStyles} />;
      case "treasury":
        return <TreasuryMainScreen onNavigate={navigateTo} onBack={handleBack} t={t} themeStyles={themeStyles} />;
      case "treasuryPartners":
        return <PartnersScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
      case "treasuryEmployees":
        return <EmployeesMergedScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
      case "treasuryExpenses":
        return <ExpensesScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
      case "treasuryDistribute":
        return <ProfitDistributionScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
      case "settings":
        return (
          <SettingsScreen
            currentLang={currentLang}
            changeLang={changeLang}
            currentThemeId={currentThemeId}
            changeTheme={changeTheme}
            t={t}
            themeStyles={themeStyles}
            isRTL={isRTL}
            LANGUAGES={LANGUAGES}
            THEMES_LIST={THEMES_LIST}
            THEME_CATEGORIES={THEME_CATEGORIES}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: themeStyles.bg || "#0b0b0d", color: themeStyles.text || "#ffffff", fontFamily: "Cairo, sans-serif", boxSizing: "border-box" }}>

      {/* ========================================================================= */}
      {/* 📱 1. وضع الموبايل المستقل 100% (نفس التصميم المريح والممتد رأسياً) */}
      {/* ========================================================================= */}
      {isMobile ? (
        <div style={{ width: "100%", height: "100%", overflowY: "auto", padding: "6px 8px", boxSizing: "border-box" }}>
          {currentScreen !== "dashboard" ? (
            renderCurrentScreenComponent()
          ) : (
            <div style={{ maxWidth: 1100, margin: "0 auto", minHeight: "calc(100vh - 12px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {/* هيدر الموبايل */}
              <header style={{
                background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)",
                borderRadius: 14, padding: "10px 12px", marginBottom: 6, color: "#fff", display: "flex", flexDirection: "column", gap: 8
              }}>
                <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: "#ffffff", letterSpacing: "0.2px" }}>
                  {(t.welcome || "مرحباً،")} {(t.generalSupervisor || "المشرف العام")}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                  <button type="button" onClick={() => setShowLangModal(true)} title={currentLangObj.name} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>
                    <span>{currentLangObj.flag || "🌐"}</span>
                  </button>

                  <button type="button" onClick={() => setShowThemeModal(true)} title="الثيمات" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Palette size={17} />
                  </button>

                  <button type="button" onClick={() => setShowGlobalSearchModal(true)} title="البحث الشامل" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Search size={17} />
                  </button>

                  <button type="button" onClick={() => setShowCentralRecordsModal(true)} title="مركز السجلات" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <FolderKanban size={17} />
                  </button>

                  <button type="button" onClick={() => setShowRecycleBinModal(true)} title="سلة المهملات" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={17} />
                  </button>

                  <button type="button" onClick={() => setShowCalcModal(true)} title="الآلة الحاسبة" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(212,175,55,0.4)", color: "#fef08a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Calculator size={17} />
                  </button>
                </div>
              </header>

              {/* كروت المؤشرات المالية */}
              <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 6 }}>
                <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 14, padding: "8px 4px", textAlign: "center" }}>
                  <TrendingUp size={17} color={themeStyles.accentGold || "#d0b689"} />
                  <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {netProfit.toLocaleString()} <span style={{ fontSize: 9, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 2 }}>الأرباح</div>
                </div>

                <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 14, padding: "8px 4px", textAlign: "center" }}>
                  <CalendarClock size={17} color={themeStyles.accentGold || "#d0b689"} />
                  <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {monthlyDues.toLocaleString()} <span style={{ fontSize: 9, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 2 }}>المستحقات</div>
                </div>

                <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 14, padding: "8px 4px", textAlign: "center" }}>
                  <Wallet size={17} color={themeStyles.accentGold || "#d0b689"} />
                  <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {(clientsList || []).reduce((acc, curr) => {
                      if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;
                      const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
                      const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);
                      const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
                      const paidFromInst = instArr.filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0).reduce((sum, i) => sum + Number(i.amount || 0), 0);
                      return acc + Math.max(0, sale - down - paidFromInst);
                    }, 0).toLocaleString()} <span style={{ fontSize: 9, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 2 }}>المتبقي</div>
                </div>
              </section>

              {/* شبكة أزرار الموبايل الـ 12 */}
              <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, flex: 1 }}>
                {buttons.map((b) => {
                  const Icon = b.icon;
                  return (
                    <button
                      key={b.key}
                      onClick={() => {
                        if (b.key === "whatsapp") setShowWhatsAppModal(true);
                        else if (b.key === "search") navigateTo("clientQuery");
                        else if (b.key === "lateClients") navigateTo("overdue");
                        else if (b.key === "exit") { /* خروج */ }
                        else navigateTo(b.key);
                      }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                        background: b.tone === "gold" ? "linear-gradient(135deg, #d69a5f, #b06a35)" : b.tone === "copper" ? "linear-gradient(135deg, #b06a35, #7a4a1f)" : b.tone === "silver" ? "#d1d5db" : b.tone === "rose" ? "#fca5a5" : b.tone === "roseDark" ? "#9f1239" : (themeStyles.card || "#1e1e1e"),
                        color: (b.tone === "silver" || b.tone === "rose") ? "#111111" : "#ffffff",
                        border: `1px solid ${themeStyles.border || "#333333"}`, 
                        borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontFamily: "inherit", minHeight: 52, boxSizing: "border-box"
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 800, textAlign: "right", flex: 1, lineHeight: 1.3 }}>{b.label}</span>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={16} />
                      </span>
                    </button>
                  );
                })}
              </section>
            </div>
          )}
        </div>
      ) : displayMode === "pro" ? (
        /* ========================================================================= */
        /* 💻 2. وضع Pro على الويب والديسكتوب (مطابق تماماً للتصميم الكلاسيكي) */
        /* ========================================================================= */
        <div style={{ width: "100%", height: "100%", overflowY: "auto", padding: "20px 32px", boxSizing: "border-box" }}>
          {currentScreen !== "dashboard" ? (
            renderCurrentScreenComponent()
          ) : (
            <div style={{ maxWidth: 1150, margin: "0 auto" }}>
              {/* مبدل الأوضاع العلوي */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <div style={{ display: "flex", background: "#1a1a20", borderRadius: 20, padding: 3, border: "1px solid #2e2e38" }}>
                  <button type="button" onClick={() => handleModeChange("normal")} style={{ border: "none", background: "transparent", color: "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 16, cursor: "pointer" }}>عادي</button>
                  <button type="button" onClick={() => handleModeChange("pro")} style={{ border: "none", background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#fff", fontFamily: "Cairo, sans-serif", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 16, cursor: "pointer", boxShadow: "0 2px 10px rgba(214,154,95,0.35)" }}>Pro</button>
                </div>
              </div>

              {/* الهيدر الذهبي لـ Pro */}
              <header style={{
                background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)",
                borderRadius: 18, padding: "18px 24px", marginBottom: 20, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(0,0,0,0.35)", padding: "7px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 800, color: "#ffffff" }}>
                    {(t.welcome || "مرحباً،")} {(t.generalSupervisor || "المشرف العام")}
                  </div>

                  <button onClick={() => setShowLangModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <Globe size={15} /> <span>{currentLangObj.flag} {currentLangObj.name}</span>
                  </button>

                  <button onClick={() => setShowThemeModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <Palette size={15} /> <span>{t.appThemes || "ثيمات النظام"}</span>
                  </button>

                  <button onClick={() => setShowGlobalSearchModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <Search size={15} /> <span>البحث الشامل</span>
                  </button>

                  <button onClick={() => setShowCentralRecordsModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <FolderKanban size={15} /> <span>مركز السجلات</span>
                  </button>

                  <button onClick={() => setShowRecycleBinModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                    <Trash2 size={15} /> <span>سلة المهملات</span>
                  </button>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 21, fontWeight: 800, color: "#ffffff" }}>{t.appName || "نظام إدارة الأقساط والمبيعات"}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.85, color: "#ffffff" }}>Cloud Enterprise Active</div>
                </div>

                <div onClick={() => setShowCalcModal(true)} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="الآلة الحاسبة">
                  <Calculator size={22} />
                </div>
              </header>

              {/* كروت Pro الثلاثية */}
              <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: 22, textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", color: themeStyles.accentGold || "#d69a5f" }}><TrendingUp size={20} /></div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                    {netProfit.toLocaleString()} <span style={{ fontSize: 14, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: 5 }}>صافي الأرباح حتى اليوم</div>
                  <div style={{ fontSize: 11.5, color: "#8a8a94", marginTop: 2 }}>إجمالي أرباح العقود والتحصيلات الصافية</div>
                </div>

                <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: 22, textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", color: themeStyles.accentGold || "#d69a5f" }}><CalendarClock size={20} /></div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                    {monthlyDues.toLocaleString()} <span style={{ fontSize: 14, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: 5 }}>مستحقات هذا الشهر</div>
                  <div style={{ fontSize: 11.5, color: "#8a8a94", marginTop: 2 }}>المطلوب تحصيله حالياً</div>
                </div>

                <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: 22, textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", color: themeStyles.accentGold || "#d69a5f" }}><Wallet size={20} /></div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                    {(clientsList || []).reduce((acc, curr) => {
                      if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;
                      const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
                      const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);
                      const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
                      const paidFromInst = instArr.filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0).reduce((sum, i) => sum + Number(i.amount || 0), 0);
                      return acc + Math.max(0, sale - down - paidFromInst);
                    }, 0).toLocaleString()} <span style={{ fontSize: 14, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: 5 }}>إجمالي الأقساط المتبقية</div>
                  <div style={{ fontSize: 11.5, color: "#8a8a94", marginTop: 2 }}>المبالغ المتبقية في ذمة العملاء</div>
                </div>
              </section>

              {/* شبكة أزرار Pro الـ 12 الملونة */}
              <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {buttons.map((b) => {
                  const Icon = b.icon;
                  return (
                    <button
                      key={b.key}
                      onClick={() => {
                        if (b.key === "whatsapp") setShowWhatsAppModal(true);
                        else if (b.key === "search") navigateTo("clientQuery");
                        else if (b.key === "lateClients") navigateTo("overdue");
                        else if (b.key === "exit") { /* خروج */ }
                        else navigateTo(b.key);
                      }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: b.tone === "gold" ? "linear-gradient(135deg, #d69a5f, #b06a35)" : b.tone === "copper" ? "linear-gradient(135deg, #b06a35, #7a4a1f)" : b.tone === "silver" ? "#d1d5db" : b.tone === "rose" ? "#fca5a5" : b.tone === "roseDark" ? "#9f1239" : (themeStyles.card || "#18181c"),
                        color: (b.tone === "silver" || b.tone === "rose") ? "#111111" : "#ffffff",
                        border: `1px solid ${themeStyles.border || "#232328"}`,
                        borderRadius: 14, padding: "18px 22px", fontFamily: "inherit", fontSize: 15.5, fontWeight: 800, cursor: "pointer", minHeight: 66
                      }}
                    >
                      <span>{b.label}</span>
                      <span style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={17} />
                      </span>
                    </button>
                  );
                })}
              </section>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 💻 3. الوضع العادي (Sidebar Fullscreen + Smart Hover Push Layout) */
        /* ========================================================================= */
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden" }}>
          {/* الشريط العلوي (Topbar) */}
          <div style={{ height: 60, flex: "0 0 60px", background: themeStyles.card || "#131316", borderBottom: `1px solid ${themeStyles.border || "#232328"}`, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", position: "relative", zIndex: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧮</div>
              <b style={{ fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", color: "#fff" }}>نظام الأقساط</b>
            </div>

            {/* 1. مركز السجلات */}
            <div className="tb-dropdown-container" style={{ position: "relative" }}>
              <button onClick={() => setOpenDropdown(openDropdown === "records" ? null : "records")} style={{ display: "flex", alignItems: "center", gap: 6, background: openDropdown === "records" ? "#22222a" : "transparent", border: "none", color: openDropdown === "records" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12.5, fontWeight: 700, padding: "8px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>
                <FolderKanban size={15} /> <span>مركز السجلات</span> <span style={{ fontSize: 9 }}>▼</span>
              </button>
              {openDropdown === "records" && (
                <div style={{ position: "absolute", top: 48, right: 0, minWidth: 220, background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 12, boxShadow: "0 16px 36px rgba(0,0,0,0.6)", padding: 8, zIndex: 100 }}>
                  <div style={{ fontSize: 11, color: themeStyles.accentGold || "#d69a5f", fontWeight: 800, padding: "6px 10px 8px 10px", borderBottom: "1px solid #25252c", marginBottom: 4 }}>السجلات الشاملة</div>
                  <div onClick={() => { navigateTo("clientQuery"); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>سجل العقود النشطة</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>عرض</span></div>
                  <div onClick={() => { navigateTo("pay"); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>سجل سداد الأقساط</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>عرض</span></div>
                  <div onClick={() => { setShowCentralRecordsModal(true); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>جميع السجلات والتقارير</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>‹</span></div>
                </div>
              )}
            </div>

            {/* 2. سلة المهملات */}
            <div className="tb-dropdown-container" style={{ position: "relative" }}>
              <button onClick={() => setOpenDropdown(openDropdown === "bin" ? null : "bin")} style={{ display: "flex", alignItems: "center", gap: 6, background: openDropdown === "bin" ? "#22222a" : "transparent", border: "none", color: openDropdown === "bin" ? "#fca5a5" : "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12.5, fontWeight: 700, padding: "8px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Trash2 size={15} /> <span>سلة المهملات</span> <span style={{ fontSize: 9 }}>▼</span>
              </button>
              {openDropdown === "bin" && (
                <div style={{ position: "absolute", top: 48, right: 0, minWidth: 220, background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 12, boxShadow: "0 16px 36px rgba(0,0,0,0.6)", padding: 8, zIndex: 100 }}>
                  <div style={{ fontSize: 11, color: "#fca5a5", fontWeight: 800, padding: "6px 10px 8px 10px", borderBottom: "1px solid #25252c", marginBottom: 4 }}>العناصر المحذوفة</div>
                  <div onClick={() => { setShowRecycleBinModal(true); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>سلة مهملات العقود</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>استرجاع</span></div>
                  <div onClick={() => { setShowRecycleBinModal(true); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>سلة مهملات المصروفات</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>استرجاع</span></div>
                </div>
              )}
            </div>

            {/* 3. الأرشيف */}
            <div className="tb-dropdown-container" style={{ position: "relative" }}>
              <button onClick={() => setOpenDropdown(openDropdown === "archive" ? null : "archive")} style={{ display: "flex", alignItems: "center", gap: 6, background: openDropdown === "archive" ? "#22222a" : "transparent", border: "none", color: openDropdown === "archive" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12.5, fontWeight: 700, padding: "8px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Archive size={15} /> <span>الأرشيف</span> <span style={{ fontSize: 9 }}>▼</span>
              </button>
              {openDropdown === "archive" && (
                <div style={{ position: "absolute", top: 48, right: 0, minWidth: 220, background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 12, boxShadow: "0 16px 36px rgba(0,0,0,0.6)", padding: 8, zIndex: 100 }}>
                  <div style={{ fontSize: 11, color: themeStyles.accentGold || "#d69a5f", fontWeight: 800, padding: "6px 10px 8px 10px", borderBottom: "1px solid #25252c", marginBottom: 4 }}>السجلات المؤرشفة</div>
                  <div onClick={() => { navigateTo("clientQuery"); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>العقود المنتهية والمخالصة</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>عرض</span></div>
                  <div onClick={() => { navigateTo("clientQuery"); setOpenDropdown(null); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}><span>أرشيف الحسابات المسواة</span><span style={{ color: "#8a8a94", fontSize: 10.5 }}>عرض</span></div>
                </div>
              )}
            </div>

            {/* 4. الثيمات */}
            <div className="tb-dropdown-container" style={{ position: "relative" }}>
              <button onClick={() => setShowThemeModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12.5, fontWeight: 700, padding: "8px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Palette size={15} /> <span>الثيمات</span>
              </button>
            </div>

            {/* 5. اللغة */}
            <div className="tb-dropdown-container" style={{ position: "relative" }}>
              <button onClick={() => setShowLangModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12.5, fontWeight: 700, padding: "8px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Globe size={15} /> <span>{currentLangObj.flag} {currentLangObj.name}</span>
              </button>
            </div>

            <div style={{ flex: 1 }}></div>

            {/* مبدل الوضع عادي / Pro */}
            <div style={{ display: "flex", background: "#1a1a20", borderRadius: 20, padding: 3, border: "1px solid #2e2e38", marginLeft: 14 }}>
              <button type="button" onClick={() => handleModeChange("normal")} style={{ border: "none", background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#fff", fontFamily: "Cairo, sans-serif", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 16, cursor: "pointer", boxShadow: "0 2px 10px rgba(214,154,95,0.35)" }}>عادي</button>
              <button type="button" onClick={() => handleModeChange("pro")} style={{ border: "none", background: "transparent", color: "#8a8a94", fontFamily: "Cairo, sans-serif", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 16, cursor: "pointer" }}>Pro</button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
              👤 المشرف العام
            </div>
          </div>

          {/* الجسم: القائمة الجانبية + مساحة العمل */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", width: "100%" }}>
            
            {/* القائمة الجانبية بالتحويم الذكي التلقائي */}
            <aside
              onMouseEnter={() => setSidebarExpanded(true)}
              onMouseLeave={() => setSidebarExpanded(false)}
              style={{
                width: sidebarExpanded ? 260 : 68,
                background: themeStyles.card || "#131316",
                borderLeft: `1px solid ${themeStyles.border || "#232328"}`,
                display: "flex",
                flexDirection: "column",
                transition: "width 0.26s cubic-bezier(0.4, 0, 0.2, 1)",
                overflow: "hidden",
                flexShrink: 0,
                position: "relative",
                zIndex: 10
              }}
            >
              {/* رأس القائمة */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarExpanded ? "space-between" : "center", padding: "12px 14px", borderBottom: `1px solid ${themeStyles.border || "#232328"}`, height: 56, flex: "0 0 56px", boxSizing: "border-box" }}>
                {sidebarExpanded && <div style={{ fontSize: 13.5, fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap" }}>القائمة الرئيسية</div>}
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1c1c22", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: themeStyles.accentGold || "#d69a5f", border: "1px solid #2e2e36", flexShrink: 0 }}>
                  <Menu size={16} />
                </div>
              </div>

              {/* عناصر القائمة الجانبية */}
              <div style={{ padding: "10px 8px", overflowY: sidebarExpanded ? "auto" : "hidden", flex: 1, overflowX: "hidden" }}>
                {/* 1. لوحة التحكم */}
                <div onClick={() => navigateTo("dashboard")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "dashboard" ? 800 : 700, color: currentScreen === "dashboard" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "dashboard" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "dashboard" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>لوحة التحكم الرئيسية</span>}
                </div>

                {/* 2. إضافة عميل جديد */}
                <div onClick={() => navigateTo("addClient")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "addClient" ? 800 : 700, color: currentScreen === "addClient" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "addClient" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "addClient" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <UserPlus size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>إضافة عميل جديد</span>}
                </div>

                {/* 3. سداد الأقساط */}
                <div onClick={() => navigateTo("pay")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "pay" ? 800 : 700, color: currentScreen === "pay" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "pay" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "pay" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <CreditCard size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>سداد الأقساط</span>}
                </div>

                {/* 4. استعلام عن عميل */}
                <div onClick={() => navigateTo("clientQuery")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "clientQuery" ? 800 : 700, color: currentScreen === "clientQuery" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "clientQuery" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "clientQuery" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <Search size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>استعلام عن عميل</span>}
                </div>

                {/* 5. مستحقات هذا الشهر */}
                <div onClick={() => navigateTo("monthlyDues")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "monthlyDues" ? 800 : 700, color: currentScreen === "monthlyDues" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "monthlyDues" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "monthlyDues" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <CalendarClock size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>مستحقات هذا الشهر</span>}
                </div>

                {/* 6. المتأخرين عن السداد */}
                <div onClick={() => navigateTo("overdue")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "overdue" ? 800 : 700, color: currentScreen === "overdue" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "overdue" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "overdue" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <UserX size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>المتأخرين عن السداد</span>}
                </div>

                {/* 7. حذف حساب عميل */}
                <div onClick={() => navigateTo("deleteClient")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "deleteClient" ? 800 : 700, color: currentScreen === "deleteClient" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "deleteClient" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "deleteClient" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <Trash2 size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>حذف حساب عميل</span>}
                </div>

                {/* 8. الخزينة والأرباح */}
                <div onClick={() => navigateTo("treasury")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "treasury" ? 800 : 700, color: currentScreen === "treasury" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "treasury" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "treasury" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <Wallet size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>توزيع الأرباح والخزينة</span>}
                </div>

                {/* 9. الشركاء ورأس المال */}
                <div onClick={() => navigateTo("treasuryPartners")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "treasuryPartners" ? 800 : 700, color: currentScreen === "treasuryPartners" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "treasuryPartners" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "treasuryPartners" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <Users size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>الشركاء ورأس المال</span>}
                </div>

                {/* 10. شؤون الموظفين والرواتب */}
                <div onClick={() => navigateTo("treasuryEmployees")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "treasuryEmployees" ? 800 : 700, color: currentScreen === "treasuryEmployees" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "treasuryEmployees" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "treasuryEmployees" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <Briefcase size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>شؤون الموظفين والرواتب</span>}
                </div>

                {/* 11. الإعدادات */}
                <div onClick={() => navigateTo("settings")} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: currentScreen === "settings" ? 800 : 700, color: currentScreen === "settings" ? (themeStyles.accentGold || "#d69a5f") : "#8a8a94", background: currentScreen === "settings" ? "linear-gradient(135deg, rgba(214,154,95,0.18), rgba(176,106,53,0.18))" : "transparent", border: currentScreen === "settings" ? "1px solid rgba(214,154,95,0.32)" : "none", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <Settings size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>الإعدادات والصلاحيات</span>}
                </div>

                {/* 12. مركز الواتساب */}
                <div onClick={() => setShowWhatsAppModal(true)} style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarExpanded ? "10px 12px" : "10px 0", justifyContent: sidebarExpanded ? "flex-start" : "center", borderRadius: sidebarExpanded ? 10 : 0, fontSize: 13, fontWeight: 700, color: "#8a8a94", cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap" }}>
                  <MessageSquare size={18} style={{ flexShrink: 0 }} />
                  {sidebarExpanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>مركز الواتساب الذكي</span>}
                </div>
              </div>

              {/* ذيل القائمة */}
              <div style={{ padding: "12px", borderTop: `1px solid ${themeStyles.border || "#232328"}`, flex: "0 0 auto", display: "flex", justifyContent: sidebarExpanded ? "flex-start" : "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap", overflow: "hidden" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#222228", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                  {sidebarExpanded && (
                    <div>
                      <b style={{ fontSize: 12.5, display: "block", color: "#fff" }}>المشرف العام</b>
                      <span style={{ fontSize: 10.5, color: "#8a8a94" }}>Cloud Active</span>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* مساحة العمل المركزية (Main Canvas) */}
            <main style={{ flex: 1, minWidth: 0, padding: "24px 30px", overflowY: "auto", height: "100%", transition: "all 0.26s cubic-bezier(0.4, 0, 0.2, 1)", boxSizing: "border-box" }}>
              
              {currentScreen === "dashboard" ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <h1 style={{ fontSize: 20, margin: "0 0 4px 0", fontWeight: 800, color: "#fff" }}>لوحة التحكم الرئيسية</h1>
                    <span style={{ fontSize: 12.5, color: "#8a8a94" }}>التقرير المالي العام والمؤشرات التنفيذية للنشاط</span>
                  </div>

                  {/* 1. المؤشرات المالية الثلاثية المنسقة بالمنتصف تماماً */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 22 }}>
                    <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: "18px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                        {netProfit.toLocaleString()} <span style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
                      </div>
                      <div style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f", marginTop: 5, fontWeight: 800 }}>صافي الأرباح حتى اليوم</div>
                      <div style={{ fontSize: 11, color: "#8a8a94", marginTop: 3 }}>إجمالي أرباح العقود والتحصيلات الصافية</div>
                    </div>

                    <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: "18px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                        {monthlyDues.toLocaleString()} <span style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
                      </div>
                      <div style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f", marginTop: 5, fontWeight: 800 }}>مستحقات هذا الشهر</div>
                      <div style={{ fontSize: 11, color: "#8a8a94", marginTop: 3 }}>المطلوب تحصيله حالياً</div>
                    </div>

                    <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: "18px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                        {(clientsList || []).reduce((acc, curr) => {
                          if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;
                          const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
                          const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);
                          const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
                          const paidFromInst = instArr.filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0).reduce((sum, i) => sum + Number(i.amount || 0), 0);
                          return acc + Math.max(0, sale - down - paidFromInst);
                        }, 0).toLocaleString()} <span style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
                      </div>
                      <div style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f", marginTop: 5, fontWeight: 800 }}>إجمالي الأقساط المتبقية</div>
                      <div style={{ fontSize: 11, color: "#8a8a94", marginTop: 3 }}>المبالغ المتبقية في ذمة العملاء</div>
                    </div>
                  </div>

                  {/* 2. لوحة الرسم البياني وبطاقات الأقسام */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
                    {/* بطاقة الرسم البياني */}
                    <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #222228", paddingBottom: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>📊 حركة التحصيلات والأرباح الشهرية</h3>
                        <span style={{ fontSize: 11, color: "#8a8a94" }}>تحديث لحظي مباشر</span>
                      </div>

                      <div style={{ width: "100%", height: 180, display: "flex", alignItems: "flex-end", gap: 14, paddingTop: 20 }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                          <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                            <div style={{ width: "100%", height: "45%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
                          </div>
                          <span style={{ fontSize: 11, color: "#8a8a94", fontWeight: 700 }}>مايو</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                          <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                            <div style={{ width: "100%", height: "65%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
                          </div>
                          <span style={{ fontSize: 11, color: "#8a8a94", fontWeight: 700 }}>يونيو</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                          <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                            <div style={{ width: "100%", height: "80%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
                          </div>
                          <span style={{ fontSize: 11, color: "#8a8a94", fontWeight: 700 }}>يوليو</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                          <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                            <div style={{ width: "100%", height: "95%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
                          </div>
                          <span style={{ fontSize: 11, color: "#8a8a94", fontWeight: 700 }}>أغسطس</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                          <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                            <div style={{ width: "100%", height: "35%", background: "linear-gradient(180deg, #ef4444 0%, #991b1b 100%)", borderRadius: "6px 6px 0 0" }}></div>
                          </div>
                          <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>المصروفات</span>
                        </div>
                      </div>
                    </div>

                    {/* بطاقات الملخص السريع */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div onClick={() => navigateTo("treasuryExpenses")} style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <div>
                          <h4 style={{ margin: "0 0 3px 0", fontSize: 13, fontWeight: 800, color: "#fff" }}>المصروفات العامة</h4>
                          <p style={{ margin: 0, fontSize: 11, color: "#8a8a94" }}>إجمالي المصروفات المسجلة</p>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#fca5a5", fontVariantNumeric: "tabular-nums" }}>0 ج.م</div>
                      </div>

                      <div onClick={() => navigateTo("treasuryEmployees")} style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <div>
                          <h4 style={{ margin: "0 0 3px 0", fontSize: 13, fontWeight: 800, color: "#fff" }}>رواتب وسلف الموظفين</h4>
                          <p style={{ margin: 0, fontSize: 11, color: "#8a8a94" }}>الرواتب والحركات النشطة</p>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#93c5fd", fontVariantNumeric: "tabular-nums" }}>0 ج.م</div>
                      </div>

                      <div onClick={() => navigateTo("treasuryPartners")} style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#232328"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <div>
                          <h4 style={{ margin: "0 0 3px 0", fontSize: 13, fontWeight: 800, color: "#fff" }}>رأس مال الشركة</h4>
                          <p style={{ margin: 0, fontSize: 11, color: "#8a8a94" }}>صافي استثمارات الشركاء</p>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", fontVariantNumeric: "tabular-nums" }}>10,100 ج.م</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* عند اختيار أي شاشة فرعية يتم تحميلها مباشرة بداخل الإطار */
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <button onClick={() => navigateTo("dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: `1px solid ${themeStyles.border || "#333"}`, color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                      <ArrowRight size={14} /> العودة للوحة التحكم
                    </button>
                  </div>
                  {renderCurrentScreenComponent()}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* 📱 شريط تنبيه الخروج عند استخدام زر الرجوع الفيزيائي */}
      {showExitHint && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.85)", color: "#ffffff", padding: "10px 20px",
          borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 99999,
          border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(4px)"
        }}>
          اضغط رجوع مرة أخرى للخروج من التطبيق
        </div>
      )}

      {/* 📱 مركز الواتساب الذكي */}
      <WhatsAppHubModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        overdueContracts={clientsList.filter(c => Number(c.remainingAmount ?? c.remaining) > 0)}
        t={t}
        themeStyles={themeStyles}
      />

      {/* 🗑️ سلة المهملات الشاملة */}
      <RecycleBinModal
        isOpen={showRecycleBinModal}
        onClose={() => setShowRecycleBinModal(false)}
        deletedItems={[]}
        t={t}
        themeStyles={themeStyles}
      />

      {/* 🔍 البحث الشامل عابر الشاشات */}
      <GlobalSearchModal
        isOpen={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
        contracts={clientsList}
        onSelectResult={() => navigateTo("clientQuery")}
        t={t}
        themeStyles={themeStyles}
      />

      {/* 📊 مركز السجلات والتقارير الشامل */}
      <CentralRecordsMenu
        isOpen={showCentralRecordsModal}
        onClose={() => setShowCentralRecordsModal(false)}
        onSelectRecord={(recordId) => {
          if (recordId === "active_contracts" || recordId === "all_clients_register" || recordId === "archived_contracts") {
            navigateTo("clientQuery");
          }
        }}
        t={t}
        themeStyles={themeStyles}
      />

      {/* 🌟 نافذة التنبيه المخصصة بمنتصف الشاشة */}
      {successModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }}>
          <div style={{ background: themeStyles.card || "#1a1a1a", border: `1px solid ${themeStyles.accentGold || "#d4af37"}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(212, 175, 55, 0.15)", border: `1px solid ${themeStyles.accentGold || "#d4af37"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <CheckCircle2 size={32} color={themeStyles.accentGold || "#d4af37"} />
            </div>
            <h3 style={{ margin: "0 0 8px 0", color: "#ffffff", fontSize: 18, fontWeight: 800 }}>{successModal.title}</h3>
            <p style={{ margin: "0 0 20px 0", color: themeStyles.subText || "#aaaaaa", fontSize: 14, lineHeight: 1.5 }}>{successModal.msg}</p>
            <button
              type="button"
              onClick={() => setSuccessModal({ open: false, title: "", msg: "" })}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d69a5f, #b06a35)",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "12px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              موافق
            </button>
          </div>
        </div>
      )}

      {/* 🎨 نافذة اختيار الثيمات المقسمة لتبويب العادية و Pro 💎 الزجاجية */}
      {showThemeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }}>
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 20, padding: 20, width: "100%", maxWidth: 850, maxHeight: "85vh", overflowY: "auto", backdropFilter: themeStyles.backdropFilter || "none" }}>
            
            {/* الهيدر مع تبويبي التنقل العادية و Pro 💎 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${themeStyles.border || "#333"}`, paddingBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveThemeTab("regular")}
                  style={{
                    background: activeThemeTab === "regular" ? (themeStyles.accentGold || "#d0b689") : (themeStyles.inputBg || "#121214"),
                    color: activeThemeTab === "regular" ? "#111111" : (themeStyles.text || "#ffffff"),
                    border: `1px solid ${themeStyles.border || "#333333"}`,
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  الثيمات العادية (30)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveThemeTab("pro")}
                  style={{
                    background: activeThemeTab === "pro" ? "linear-gradient(135deg, #a855f7, #38bdf8)" : (themeStyles.inputBg || "#121214"),
                    color: "#ffffff",
                    border: `1px solid ${activeThemeTab === "pro" ? "#a855f7" : (themeStyles.border || "#333333")}`,
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: activeThemeTab === "pro" ? "0 0 12px rgba(168, 85, 247, 0.4)" : "none"
                  }}
                >
                  ثيمات Pro 💎 (Glassmorphism)
                </button>
              </div>

              <X style={{ cursor: "pointer", color: "#aaa" }} onClick={() => setShowThemeModal(false)} />
            </div>

            {/* شبكة الثيمات المحسنة بالديكور الزجاجي */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {(THEMES_LIST || [])
                .filter((th) => activeThemeTab === "pro" ? (th.category === "pro" || th.isPro) : (th.category !== "pro" && !th.isPro))
                .map((th) => {
                const isCurrent = currentThemeId === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      changeTheme(th.id);
                      setShowThemeModal(false);
                    }}
                    style={{
                      background: th.card || "#111",
                      border: `2px solid ${isCurrent ? (themeStyles.accentGold || "#d0b689") : (themeStyles.border || "#333")}`,
                      borderRadius: "12px",
                      padding: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      gap: "10px"
                    }}
                  >
                    <div style={{ fontWeight: 800, color: th.accentGold || "#fff", fontSize: "13px" }}>{th.name}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                      <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: th.bg || "#111", border: "1px solid #555" }} />
                      <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: th.card || "#222", border: "1px solid #555" }} />
                      <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: th.accentGold || "#d0b689", border: "1px solid #fff" }} />
                    </div>
                    <button
                      type="button"
                      style={{
                        background: isCurrent ? "#4caf50" : (th.accentGold || "#d0b689"),
                        color: "#111",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "11px",
                        fontWeight: 800
                      }}
                    >
                      {isCurrent ? "نشط الآن ✓" : "تطبيق الثيم"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🧮 نافذة الآلة الحاسبة السريعة والذكية */}
      {showCalcModal && (
        <QuickCalculatorModal
          isOpen={showCalcModal}
          onClose={() => setShowCalcModal(false)}
          themeStyles={themeStyles}
        />
      )}

      {/* 🌐 نافذة اختيار اللغات المنسقة بوسط الشاشة (Grid Layout) */}
      {showLangModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }}>
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 20, padding: 20, width: "100%", maxWidth: 580, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${themeStyles.border || "#333"}`, paddingBottom: 12 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: themeStyles.accentGold || "#d0b689", display: "flex", alignItems: "center", gap: 8 }}>
                <Globe size={18} /> {t.selectLang || "اختر لغة النظام"}
              </span>
              <X style={{ cursor: "pointer", color: "#aaa" }} onClick={() => setShowLangModal(false)} />
            </div>
            <div style={{ overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, paddingRight: 4 }}>
              {(LANGUAGES || []).map((l) => {
                const isSelected = currentLang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      if (typeof changeLang === "function") {
                        changeLang(l.code);
                      }
                      setShowLangModal(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 8px",
                      background: isSelected ? (themeStyles.accentGold || "#d0b689") : (themeStyles.inputBg || "#121214"),
                      color: isSelected ? "#111111" : (themeStyles.text || "#ffffff"),
                      border: `1px solid ${isSelected ? (themeStyles.accentGold || "#d0b689") : (themeStyles.border || "#333333")}`,
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justify: "center",
                      gap: 4,
                      textAlign: "center"
                    }}
                  >
                    <span>{l.flag || "🌐"} {l.name}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{l.code.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🧮 مكون الآلة الحاسبة السريعة المنبثقة
function QuickCalculatorModal({ isOpen, onClose, themeStyles = {} }) {
  const [calcInput, setCalcInput] = useState("0");
  const [calcHistory, setCalcHistory] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    setCalcInput((prev) => (prev === "0" ? digit : prev + digit));
  };

  const handleOp = (op) => {
    setCalcHistory(calcInput + " " + op + " ");
    setCalcInput("0");
  };

  const handleClear = () => {
    setCalcInput("0");
    setCalcHistory("");
  };

  const handleBackspace = () => {
    setCalcInput((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  };

  const handleEquals = () => {
    if (!calcHistory) return;
    try {
      const fullExpr = (calcHistory + calcInput).replace(/×/g, "*").replace(/÷/g, "/");
      const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, "");
      const res = Function(`'use strict'; return (${sanitized})`)();
      const formatted = String(Math.round(Number(res) * 100) / 100);
      setCalcInput(formatted);
      setCalcHistory("");
    } catch (e) {
      setCalcInput("Error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(calcInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }}>
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 20, padding: 16, width: "100%", maxWidth: 310, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: `1px solid ${themeStyles.border || "#333"}`, paddingBottom: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: themeStyles.accentGold || "#d0b689", display: "flex", alignItems: "center", gap: 6 }}>
            <Calculator size={18} /> آلة حاسبة سريعة
          </div>
          <X size={18} style={{ cursor: "pointer", color: "#aaa" }} onClick={onClose} />
        </div>

        {/* Display */}
        <div style={{ background: "#111113", border: "1px solid #2a2a2e", borderRadius: 12, padding: "10px 12px", textAlign: "right", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#888", minHeight: 16, fontVariantNumeric: "tabular-nums" }}>{calcHistory}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontVariantNumeric: "tabular-nums", overflowX: "auto", whiteSpace: "nowrap" }}>{calcInput}</div>
        </div>

        {/* Buttons Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          <button type="button" onClick={handleClear} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>C</button>
          <button type="button" onClick={handleBackspace} style={{ background: "#332a1f", color: "#fdba74", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>⌫</button>
          <button type="button" onClick={() => handleOp("%")} style={{ background: "#222", color: "#aaa", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>%</button>
          <button type="button" onClick={() => handleOp("÷")} style={{ background: "#d69a5f", color: "#111", border: "none", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>÷</button>

          <button type="button" onClick={() => handleDigit("7")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>7</button>
          <button type="button" onClick={() => handleDigit("8")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>8</button>
          <button type="button" onClick={() => handleDigit("9")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>9</button>
          <button type="button" onClick={() => handleOp("×")} style={{ background: "#d69a5f", color: "#111", border: "none", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>×</button>

          <button type="button" onClick={() => handleDigit("4")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>4</button>
          <button type="button" onClick={() => handleDigit("5")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>5</button>
          <button type="button" onClick={() => handleDigit("6")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>6</button>
          <button type="button" onClick={() => handleOp("-")} style={{ background: "#d69a5f", color: "#111", border: "none", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>-</button>

          <button type="button" onClick={() => handleDigit("1")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>1</button>
          <button type="button" onClick={() => handleDigit("2")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>2</button>
          <button type="button" onClick={() => handleDigit("3")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>3</button>
          <button type="button" onClick={() => handleOp("+")} style={{ background: "#d69a5f", color: "#111", border: "none", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>+</button>

          <button type="button" onClick={() => handleDigit("0")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>0</button>
          <button type="button" onClick={() => handleDigit(".")} style={{ background: "#1e1e24", color: "#fff", border: "1px solid #333", borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>.</button>
          <button type="button" onClick={handleEquals} style={{ gridColumn: "span 2", background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#111", border: "none", borderRadius: 10, padding: 12, fontSize: 18, fontWeight: 800, cursor: "pointer" }}>=</button>
        </div>

        {/* زر نسخ الناتج */}
        <button type="button" onClick={handleCopy} style={{ width: "100%", marginTop: 8, background: copied ? "#14532d" : "#26262a", color: copied ? "#86efac" : "#ffffff", border: "1px solid #3f3f46", borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {copied ? "تم نسخ الناتج بنجاح ✓" : "نسخ الناتج"}
        </button>
      </div>
    </div>
  );
}

export default App;
>>>>>>> REPLACE
