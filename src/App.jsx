/**
 * =========================================================
 * 📌 الملف: الشاشة الرئيسية للنظام (Main App Container)
 * 📁 المسار: src/App.jsx
 * 📝 الوظيفة: الموزع الرئيسي للشاشات المربوط بـ 15 لغة و 100 ثيم
 * =========================================================
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  UserPlus, CreditCard, Search, CalendarClock, UserX, Trash2, Wallet, Users, UserCog, Settings, Power, TrendingUp, Calculator, Globe, Palette, X, MessageSquare, FolderKanban, CheckCircle2
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

  // 🌟 نافذة التنبيه المخصصة بوسط الشاشة
  const [successModal, setSuccessModal] = useState({ open: false, title: "", msg: "" });

  // 📱 التحكم في زر الرجوع الفيزيائي لأجهزة الأندرويد (Hardware Back Button)
  useEffect(() => {
    let backListener;
    async function setupBackButton() {
      try {
        backListener = await CapacitorApp.addListener("backButton", () => {
          // 1. إغلاق النوافذ المنبثقة المفتوحة أولاً
          if (showWhatsAppModal) { setShowWhatsAppModal(false); return; }
          if (showRecycleBinModal) { setShowRecycleBinModal(false); return; }
          if (showGlobalSearchModal) { setShowGlobalSearchModal(false); return; }
          if (showCentralRecordsModal) { setShowCentralRecordsModal(false); return; }
          if (showLangModal) { setShowLangModal(false); return; }
          if (showThemeModal) { setShowThemeModal(false); return; }

          // 2. العودة للشاشة الرئيسية إذا كنا في شاشة فرعية
          if (currentScreen !== "dashboard") {
            handleBack();
            return;
          }

          // 3. المطالبة بضغطة ثانية خلال ثانيتين للخروج
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
        // في بيئة الويب العادية لن تحدث أخطاء
      }
    }
    setupBackButton();
    return () => {
      if (backListener && typeof backListener.remove === "function") {
        backListener.remove();
      }
    };
  }, [currentScreen, showWhatsAppModal, showRecycleBinModal, showGlobalSearchModal, showCentralRecordsModal, showLangModal, showThemeModal, lastBackPress]);

  // أزرار شبكة التحكم الرئيسية مع نصوص احتياطية ضامنة للظهور
  const buttons = [
    { key: "addClient", label: t.addClient || "إضافة عميل جديد", icon: UserPlus, tone: "dark" },
    { key: "pay", label: t.pay || "سداد الأقساط", icon: CreditCard, tone: "gold" },
    { key: "search", label: t.search || "استعلام عن عميل", icon: Search, tone: "silver" },
    { key: "monthlyDues", label: t.monthlyDues || "مستحقات هذا الشهر", icon: CalendarClock, tone: "copper" },
    { key: "lateClients", label: t.lateClients || "المتأخرين عن السداد", icon: UserX, tone: "rose" },
    { key: "deleteClient", label: t.deleteClient || "حذف حساب عميل", icon: Trash2, tone: "gold" },
    { key: "treasury", label: t.treasury || "توزيع الأرباح والخزينة", icon: Wallet, tone: "roseDark" },
    { key: "treasuryPartners", label: t.treasuryPartners || "الشركاء ورأس المال", icon: Users, tone: "copper" },
    { key: "treasuryEmployees", label: t.treasuryEmployees || "شؤون الموظفين والرواتب", icon: UserCog, tone: "silver" },
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

      // 🗓️ تجميع المبالغ المسددة خلال الشهر الحالي فقط
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

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", backgroundColor: themeStyles.bg, color: themeStyles.text, padding: isMobile ? "12px 8px" : "20px", fontFamily: "Cairo, sans-serif", width: "100%", boxSizing: "border-box" }}>

      {/* 1. شاشة إضافة عميل */}
      {currentScreen === "addClient" && (
        <AddClientScreen
          onSuccess={() => {
            setSuccessModal({
              open: true,
              title: "تمت العملية بنجاح",
              msg: "تم حفظ بيانات العقد بنجاح بالسحابة!"
            });
            handleBack();
          }}
          onBack={handleBack}
          t={t}
          themeStyles={themeStyles}
        />
      )}

      {/* 2. شاشة الاستعلام عن عميل */}
      {currentScreen === "clientQuery" && (
        <ClientQueryScreen
          onBack={handleBack}
          t={t}
          themeStyles={themeStyles}
        />
      )}

      {/* 3. شاشة سداد الأقساط */}
      {currentScreen === "pay" && (
        <InstallmentsScreen
          contracts={clientsList}
          onBack={handleBack}
          t={t}
          themeStyles={themeStyles}
        />
      )}

      {/* 📌 شاشة مستحقات هذا الشهر */}
      {currentScreen === "monthlyDues" && (
        <MonthlyDues
          clientsList={clientsList}
          onOpenPaymentModal={() => navigateTo("pay")}
          onBack={handleBack}
        />
      )}

      {/* 📌 شاشة إدارة وحذف حسابات العملاء */}
      {currentScreen === "deleteClient" && (
        <DeleteClientScreen
          clientsList={clientsList}
          onBack={handleBack}
          t={t}
          themeStyles={themeStyles}
        />
      )}

      {/* 📌 شاشة المتأخرين عن السداد المربوطة بالبيانات */}
      {currentScreen === "overdue" && (
        <OverdueScreen
          contracts={clientsList}
          clientsList={clientsList}
          onBack={handleBack}
          t={t}
          themeStyles={themeStyles}
        />
      )}
{/* 💰 شاشات الخزينة والشركاء والرواتب والمصروفات */}
{currentScreen === "treasury" && (
  <TreasuryMainScreen onNavigate={navigateTo} onBack={handleBack} t={t} themeStyles={themeStyles} />
)}

{currentScreen === "treasuryPartners" && (
  <PartnersScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />
)}

{currentScreen === "treasuryEmployees" && (
  <EmployeesMergedScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />
)}

{currentScreen === "treasuryExpenses" && (
  <ExpensesScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />
)}

{currentScreen === "treasuryDistribute" && (
  <ProfitDistributionScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />
)}
      {/* 4. شاشة الإعدادات الشاملة */}
      {currentScreen === "settings" && (
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
      )}

      {/* 5. لوحة التحكم الرئيسية */}
      {currentScreen === "dashboard" && (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)",
            borderRadius: 18, padding: isMobile ? "14px 12px" : "18px 24px", marginBottom: isMobile ? 14 : 20, color: "#fff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                {(t.welcome || "مرحباً،")} {(t.generalSupervisor || "المشرف العام")}
              </div>

              <button onClick={() => setShowLangModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={15} /> <span>{currentLangObj.flag} {currentLangObj.name}</span>
              </button>

              <button onClick={() => setShowThemeModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Palette size={15} /> <span>{t.appThemes || "ثيمات النظام"}</span>
              </button>

              <button onClick={() => setShowGlobalSearchModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Search size={15} /> <span>البحث الشامل</span>
              </button>

              <button onClick={() => setShowCentralRecordsModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <FolderKanban size={15} /> <span>مركز السجلات</span>
              </button>

              <button onClick={() => setShowRecycleBinModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Trash2 size={15} /> <span>سلة المهملات</span>
              </button>
            </div>

            {!isMobile && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>{t.appName || "نظام إدارة الأقساط والمبيعات"}</div>
                <div style={{ fontSize: 11, opacity: 0.8, color: "#ffffff" }}>Cloud Enterprise Active</div>
              </div>
            )}

            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={22} />
            </div>
          </header>

          <section style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(auto-fit, minmax(220px, 1fr))", gap: isMobile ? 6 : 14, marginBottom: isMobile ? 14 : 20 }}>
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: themeStyles.cardRadius || 16, padding: isMobile ? "10px 4px" : "20px", boxShadow: themeStyles.cardShadow || "none", textAlign: isMobile ? "center" : "initial" }}>
              <TrendingUp size={isMobile ? 18 : 24} color={themeStyles.accentGold || "#d0b689"} />
              <div style={{ fontSize: isMobile ? 12 : 22, fontWeight: 800, marginTop: isMobile ? 4 : 8, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 2 }}>
                {netProfit.toLocaleString()} <span style={{ fontSize: isMobile ? 9 : 14, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
              </div>
              <div style={{ fontSize: isMobile ? 9 : 13, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 4 }}>
                {isMobile ? "الأرباح" : (t.netProfit || "صافي الأرباح حتى اليوم")}
              </div>
              {!isMobile && <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>{t.netProfitSub || "إجمالي أرباح العقود والتحصيلات الصافية"}</div>}
            </div>

            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: themeStyles.cardRadius || 16, padding: isMobile ? "10px 4px" : "20px", boxShadow: themeStyles.cardShadow || "none", textAlign: isMobile ? "center" : "initial" }}>
              <CalendarClock size={isMobile ? 18 : 24} color={themeStyles.accentGold || "#d0b689"} />
              <div style={{ fontSize: isMobile ? 12 : 22, fontWeight: 800, marginTop: isMobile ? 4 : 8, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 2 }}>
                {monthlyDues.toLocaleString()} <span style={{ fontSize: isMobile ? 9 : 14, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
              </div>
              <div style={{ fontSize: isMobile ? 9 : 13, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 4 }}>
                {isMobile ? "المستحقات" : (t.monthlyDues || "مستحقات هذا الشهر")}
              </div>
              {!isMobile && <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>{t.monthlyDuesSub || "المطلوب تحصيله حالياً"}</div>}
            </div>

            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: themeStyles.cardRadius || 16, padding: isMobile ? "10px 4px" : "20px", boxShadow: themeStyles.cardShadow || "none", textAlign: isMobile ? "center" : "initial" }}>
              <Wallet size={isMobile ? 18 : 24} color={themeStyles.accentGold || "#d0b689"} />
              <div style={{ fontSize: isMobile ? 12 : 22, fontWeight: 800, marginTop: isMobile ? 4 : 8, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 2 }}>
                {(clientsList || []).reduce((acc, curr) => {
                  if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;
                  const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
                  const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);

                  const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
                  const paidFromInst = instArr
                    .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
                    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

                  return acc + Math.max(0, sale - down - paidFromInst);
                }, 0).toLocaleString()} <span style={{ fontSize: isMobile ? 9 : 14, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
              </div>
              <div style={{ fontSize: isMobile ? 9 : 13, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 4 }}>
                {isMobile ? "المتبقي" : (t.totalPortfolio || "إجمالي الأقساط المتبقية")}
              </div>
              {!isMobile && <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>{t.totalPortfolioSub || "المبالغ المتبقية في ذمة العملاء"}</div>}
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: isMobile ? 8 : 12 }}>
            {buttons.map((b) => {
              const Icon = b.icon;
              return (
                <button
                  key={b.key}
                  onClick={() => {
  if (b.key === "whatsapp") {
    setShowWhatsAppModal(true);
  } else if (b.key === "search") {
    navigateTo("clientQuery");
  } else if (b.key === "lateClients") {
    navigateTo("overdue");
  } else if (b.key === "exit") {
    // إجراء الخروج
  } else {
    navigateTo(b.key);
  }
}}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 6 : 0,
                    background: b.tone === "gold" ? "linear-gradient(135deg, #d69a5f, #b06a35)" : b.tone === "copper" ? "linear-gradient(135deg, #b06a35, #7a4a1f)" : b.tone === "silver" ? "#d1d5db" : b.tone === "rose" ? "#fca5a5" : b.tone === "roseDark" ? "#9f1239" : (themeStyles.card || "#1e1e1e"),
                    color: (b.tone === "silver" || b.tone === "rose") ? "#111111" : "#ffffff",
                    border: `1px solid ${themeStyles.border || "#333333"}`, 
                    borderRadius: themeStyles.buttonRadius || 14, 
                    padding: isMobile ? "12px 10px" : "18px 20px", 
                    cursor: "pointer", fontFamily: "inherit",
                    minHeight: isMobile ? 64 : "auto"
                  }}
                >
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, textAlign: isMobile ? "right" : "initial", flex: isMobile ? 1 : "none", lineHeight: 1.3 }}>{b.label}</span>
                  <span style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={isMobile ? 16 : 18} />
                  </span>
                </button>
              );
            })}
          </section>
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

export default App;
