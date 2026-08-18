/**
 * =========================================================
 * 📌 الملف: الشاشة الرئيسية للنظام (Main App Container)
 * 📁 المسار: src/App.jsx
 * 📝 الوظيفة: الموزع الرئيسي للشاشات المربوط بـ 15 لغة و 100 ثيم
 * =========================================================
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  UserPlus, CreditCard, Search, CalendarClock, UserX, Trash2, Wallet, Users, UserCog, Settings, Power, TrendingUp, Calculator, Globe, Palette, X, MessageSquare, FolderKanban, CheckCircle2, Archive, LayoutDashboard, Menu, ArrowRight, ChevronDown, FileText, CheckCircle, Clock, DollarSign, AlertTriangle, Briefcase
} from "lucide-react";
import { fetchAllClientsContracts } from "./services/clientFetchService";
import { supabase } from "./supabaseClient";
import { AddClientScreen } from "./components/AddClientScreen";
import { ClientQueryScreen } from "./components/clientQuery/ClientQueryScreen";
import { AllClientsRegisterModal } from "./components/clientQuery/AllClientsRegisterModal";
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
          if (showCalcModal) { setShowCalcModal(false); return; }

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
  }, [currentScreen, showWhatsAppModal, showRecycleBinModal, showGlobalSearchModal, showCentralRecordsModal, showLangModal, showThemeModal, showCalcModal, lastBackPress]);

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

  // 💼 إجمالي الأقساط المتبقية (مستخرج كـ useMemo مستقل عشان يتقدر يتشارك بين وضع Pro ووضع سطح المكتب العادي بدون تكرار الحساب)
  const totalPortfolio = useMemo(() => {
    return (clientsList || []).reduce((acc, curr) => {
      if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;
      const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
      const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);

      const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
      const paidFromInst = instArr
        .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);

      return acc + Math.max(0, sale - down - paidFromInst);
    }, 0);
  }, [clientsList]);

  // 🖥️ وضع عرض سطح المكتب/الويب: "normal" هو التصميم الجديد بالقائمة الجانبية (الافتراضي)،
  // و"pro" هو التصميم القديم بالشبكة الملونة. لا علاقة له بالموبايل، والموبايل ثابت زي ما هو دايمًا.
  const [desktopMode, setDesktopMode] = useState(() => {
    try {
      return localStorage.getItem("egymod_desktop_mode") || "normal";
    } catch (e) {
      return "normal";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("egymod_desktop_mode", desktopMode);
    } catch (e) {
      // تجاهل لو التخزين المحلي غير متاح
    }
  }, [desktopMode]);

  // 🔗 "وصول مباشر" جاي من مركز السجلات: بيقول للشاشة اللي هتفتح تعرض إيه بالظبط
  // (تبويب الأرشيف / سجل السداد الشامل) بمجرد ما تفتح
  const [recordDeepLink, setRecordDeepLink] = useState(null);

  // 📋 نافذة "سجل بيانات العملاء الشامل" — تستخدم نفس بيانات clientsList الموجودة بالفعل
  const [showAllClientsRegisterModal, setShowAllClientsRegisterModal] = useState(false);
  const allClientsRegisterData = useMemo(() => {
    return (clientsList || []).map((c) => ({
      ...c,
      id: c.id,
      name: c.client_name || c.clientName || c.name || "عميل بدون اسم",
      phone: c.client_phone || c.clientPhone || c.phone || "",
      guarantor: c.guarantor_name || c.guarantorName || c.guarantor || "",
      guarantor_phone: c.guarantor_phone || c.guarantorPhone || "",
      item: c.item_name || c.itemName || c.item || "",
      cost: c.cost_price ?? c.costPrice ?? c.cost ?? 0,
      sale: c.sale_price ?? c.salePrice ?? c.sale ?? 0,
      down: c.down_payment ?? c.downPayment ?? c.down ?? 0,
      monthly: c.monthly_installment ?? c.monthlyInstallment ?? c.monthly ?? 0,
      contractDate: c.contract_date || c.contractDate || c.created_at || "",
      firstPayDate: c.first_installment_date || c.firstPayDate || c.firstInstallmentDate || ""
    }));
  }, [clientsList]);

  // 🧭 دالة موحّدة لتنفيذ إجراء أي زرار قائمة (سواء في شبكة Pro أو في القائمة الجانبية الجديدة)
  const handleMenuAction = (key) => {
    if (key === "whatsapp") {
      setShowWhatsAppModal(true);
    } else if (key === "search") {
      navigateTo("clientQuery");
    } else if (key === "lateClients") {
      navigateTo("overdue");
    } else if (key === "clientQueryArchive") {
      setRecordDeepLink("archive");
      navigateTo("clientQuery");
    } else if (key === "payRecords") {
      setRecordDeepLink("payments");
      navigateTo("pay");
    } else if (key === "allClientsRegister") {
      setShowAllClientsRegisterModal(true);
    } else if (key === "exit") {
      // إجراء الخروج
    } else {
      navigateTo(key);
    }
  };

  // 📄 عنصر الشاشة الفرعية الحالية (غير لوحة التحكم) — يُحسب مرة واحدة ويُستخدم في وضع الموبايل/Pro
  // وكذلك داخل قشرة القائمة الجانبية في الوضع العادي، بدون تكرار كتابة نفس الشاشات مرتين.
  let screenElement = null;
  if (currentScreen === "addClient") {
    screenElement = (
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
    );
  } else if (currentScreen === "clientQuery") {
    screenElement = (
      <ClientQueryScreen
        onBack={handleBack}
        t={t}
        themeStyles={themeStyles}
        deepLink={recordDeepLink}
        onDeepLinkHandled={() => setRecordDeepLink(null)}
      />
    );
  } else if (currentScreen === "pay") {
    screenElement = (
      <InstallmentsScreen
        contracts={clientsList}
        onBack={handleBack}
        t={t}
        themeStyles={themeStyles}
        deepLink={recordDeepLink}
        onDeepLinkHandled={() => setRecordDeepLink(null)}
      />
    );
  } else if (currentScreen === "monthlyDues") {
    screenElement = (
      <MonthlyDues clientsList={clientsList} onOpenPaymentModal={() => navigateTo("pay")} onBack={handleBack} />
    );
  } else if (currentScreen === "deleteClient") {
    screenElement = (
      <DeleteClientScreen clientsList={clientsList} onBack={handleBack} t={t} themeStyles={themeStyles} />
    );
  } else if (currentScreen === "overdue") {
    screenElement = (
      <OverdueScreen contracts={clientsList} clientsList={clientsList} onBack={handleBack} t={t} themeStyles={themeStyles} />
    );
  } else if (currentScreen === "treasury") {
    screenElement = <TreasuryMainScreen onNavigate={navigateTo} onBack={handleBack} t={t} themeStyles={themeStyles} />;
  } else if (currentScreen === "treasuryPartners") {
    screenElement = <PartnersScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
  } else if (currentScreen === "treasuryEmployees") {
    screenElement = <EmployeesMergedScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
  } else if (currentScreen === "treasuryExpenses") {
    screenElement = <ExpensesScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
  } else if (currentScreen === "treasuryDistribute") {
    screenElement = <ProfitDistributionScreen onBack={() => navigateTo("treasury")} t={t} themeStyles={themeStyles} />;
  } else if (currentScreen === "settings") {
    screenElement = (
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
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", backgroundColor: themeStyles.bg, color: themeStyles.text, padding: isMobile ? "6px 8px" : "20px", fontFamily: "Cairo, sans-serif", width: "100%", boxSizing: "border-box" }}>

      {/* 1-4. الشاشات الفرعية (إضافة عميل، استعلام، سداد، إلخ) — تظهر بشكلها الكامل الأصلي
          في وضع الموبايل أو وضع Pro على الديسكتوب. في الوضع العادي الجديد على الديسكتوب
          نفس الشاشة دي بالظبط بتتعرض جوا القائمة الجانبية (شوف DesktopSidebarShell تحت). */}
      {(isMobile || desktopMode === "pro") && currentScreen !== "dashboard" && screenElement}

      {/* 5. لوحة التحكم الرئيسية (الموبايل ثابت زي ما هو دايمًا + وضع Pro القديم على الديسكتوب) */}
      {(isMobile || desktopMode === "pro") && currentScreen === "dashboard" && (
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          minHeight: isMobile ? "calc(100vh - 24px)" : "auto",
          display: isMobile ? "flex" : "block",
          flexDirection: isMobile ? "column" : "initial",
          justifyContent: isMobile ? "space-between" : "initial"
        }}>
          {isMobile ? (
            /* هيدر الموبايل المتناسق المريح */
            <header style={{
              background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)",
              borderRadius: 14,
              padding: "10px 12px",
              marginBottom: 6,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              {/* اسم المستخدم بالمنتصف */}
              <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: "#ffffff", letterSpacing: "0.2px" }}>
                {(t.welcome || "مرحباً،")} {(t.generalSupervisor || "المشرف العام")}
              </div>

              {/* شريط الأيقونات السريعة الستة */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                {/* 1. اللغة */}
                <button type="button" onClick={() => setShowLangModal(true)} title={currentLangObj.name} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>
                  <span>{currentLangObj.flag || "🌐"}</span>
                </button>

                {/* 2. الثيمات */}
                <button type="button" onClick={() => setShowThemeModal(true)} title="الثيمات" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Palette size={17} />
                </button>

                {/* 3. البحث الشامل */}
                <button type="button" onClick={() => setShowGlobalSearchModal(true)} title="البحث الشامل" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Search size={17} />
                </button>

                {/* 4. مركز السجلات */}
                <button type="button" onClick={() => setShowCentralRecordsModal(true)} title="مركز السجلات" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <FolderKanban size={17} />
                </button>

                {/* 5. سلة المهملات */}
                <button type="button" onClick={() => setShowRecycleBinModal(true)} title="سلة المهملات" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Trash2 size={17} />
                </button>

                {/* 6. الآلة الحاسبة الذكية */}
                <button type="button" onClick={() => setShowCalcModal(true)} title="الآلة الحاسبة" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(212,175,55,0.4)", color: "#fef08a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Calculator size={17} />
                </button>
              </div>
            </header>
          ) : (
            /* هيدر الويب / الكمبيوتر الأصلي 100% دون أي تغيير */
            <header style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)",
              borderRadius: 18, padding: "18px 24px", marginBottom: 20, color: "#fff"
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

                {/* 🔁 الرجوع للتصميم الجديد (القائمة الجانبية) - ديسكتوب فقط */}
                <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.2)" }}>
                  <button
                    type="button"
                    onClick={() => setDesktopMode("normal")}
                    style={{ background: "transparent", border: "none", color: "#fff", fontFamily: "inherit", fontSize: 11.5, fontWeight: 800, padding: "6px 14px", borderRadius: 16, cursor: "pointer" }}
                  >
                    عادي
                  </button>
                  <button
                    type="button"
                    style={{ background: "rgba(255,255,255,0.18)", border: "none", color: "#fff", fontFamily: "inherit", fontSize: 11.5, fontWeight: 800, padding: "6px 14px", borderRadius: 16, cursor: "pointer" }}
                  >
                    Pro
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>{t.appName || "نظام إدارة الأقساط والمبيعات"}</div>
                <div style={{ fontSize: 11, opacity: 0.8, color: "#ffffff" }}>Cloud Enterprise Active</div>
              </div>

              <div onClick={() => setShowCalcModal(true)} style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="الآلة الحاسبة">
                <Calculator size={22} />
              </div>
            </header>
          )}

          {/* كروت المؤشرات المالية */}
          <section style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(auto-fit, minmax(220px, 1fr))", gap: isMobile ? 6 : 14, marginBottom: isMobile ? 6 : 20 }}>
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: themeStyles.cardRadius || 14, padding: isMobile ? "8px 4px" : "20px", boxShadow: themeStyles.cardShadow || "none", textAlign: isMobile ? "center" : "initial" }}>
              <TrendingUp size={isMobile ? 17 : 24} color={themeStyles.accentGold || "#d0b689"} />
              <div style={{ fontSize: isMobile ? 12 : 22, fontWeight: 800, marginTop: isMobile ? 2 : 8, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 2 }}>
                {netProfit.toLocaleString()} <span style={{ fontSize: isMobile ? 9 : 14, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
              </div>
              <div style={{ fontSize: isMobile ? 9.5 : 13, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 2 }}>
                {isMobile ? "الأرباح" : (t.netProfit || "صافي الأرباح حتى اليوم")}
              </div>
              {!isMobile && <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>{t.netProfitSub || "إجمالي أرباح العقود والتحصيلات الصافية"}</div>}
            </div>

            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: themeStyles.cardRadius || 14, padding: isMobile ? "8px 4px" : "20px", boxShadow: themeStyles.cardShadow || "none", textAlign: isMobile ? "center" : "initial" }}>
              <CalendarClock size={isMobile ? 17 : 24} color={themeStyles.accentGold || "#d0b689"} />
              <div style={{ fontSize: isMobile ? 12 : 22, fontWeight: 800, marginTop: isMobile ? 2 : 8, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 2 }}>
                {monthlyDues.toLocaleString()} <span style={{ fontSize: isMobile ? 9 : 14, color: themeStyles.accentGold || "#d0b689" }}>{t.currency || "ج.م"}</span>
              </div>
              <div style={{ fontSize: isMobile ? 9.5 : 13, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 2 }}>
                {isMobile ? "المستحقات" : (t.monthlyDues || "مستحقات هذا الشهر")}
              </div>
              {!isMobile && <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>{t.monthlyDuesSub || "المطلوب تحصيله حالياً"}</div>}
            </div>

            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: themeStyles.cardRadius || 14, padding: isMobile ? "8px 4px" : "20px", boxShadow: themeStyles.cardShadow || "none", textAlign: isMobile ? "center" : "initial" }}>
              <Wallet size={isMobile ? 17 : 24} color={themeStyles.accentGold || "#d0b689"} />
              <div style={{ fontSize: isMobile ? 12 : 22, fontWeight: 800, marginTop: isMobile ? 2 : 8, color: themeStyles.text || "#ffffff", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 2 }}>
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
              <div style={{ fontSize: isMobile ? 9.5 : 13, fontWeight: 700, color: themeStyles.accentGold || "#d0b689", marginTop: 2 }}>
                {isMobile ? "المتبقي" : (t.totalPortfolio || "إجمالي الأقساط المتبقية")}
              </div>
              {!isMobile && <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>{t.totalPortfolioSub || "المبالغ المتبقية في ذمة العملاء"}</div>}
            </div>
          </section>

          {/* شبكة الأزرار الـ 12 المتوزعة بمرونة كاملة لتملأ المساحة المتبقية */}
          <section style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: isMobile ? 6 : 12,
            flex: isMobile ? 1 : "initial"
          }}>
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
                    borderRadius: themeStyles.buttonRadius || 12, 
                    padding: isMobile ? "8px 10px" : "18px 20px", 
                    cursor: "pointer", fontFamily: "inherit",
                    minHeight: isMobile ? 52 : "auto",
                    boxSizing: "border-box"
                  }}
                >
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, textAlign: isMobile ? "right" : "initial", flex: isMobile ? 1 : "none", lineHeight: 1.3 }}>{b.label}</span>
                  <span style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={isMobile ? 16 : 18} />
                  </span>
                </button>
              );
            })}
          </section>
        </div>
      )}

      {/* 🖥️ الوضع العادي الجديد على الديسكتوب/الويب: قائمة جانبية + شريط علوي، الموبايل غير متأثر إطلاقًا */}
      {!isMobile && desktopMode === "normal" && (
        <DesktopSidebarShell
          buttons={buttons}
          currentScreen={currentScreen}
          onNavItemClick={handleMenuAction}
          onGoDashboard={() => navigateTo("dashboard")}
          t={t}
          themeStyles={themeStyles}
          currentLangObj={currentLangObj}
          onOpenRecords={() => setShowCentralRecordsModal(true)}
          onOpenBin={() => setShowRecycleBinModal(true)}
          onOpenThemes={() => setShowThemeModal(true)}
          onOpenLang={() => setShowLangModal(true)}
          onOpenSearch={() => setShowGlobalSearchModal(true)}
          onOpenCalc={() => setShowCalcModal(true)}
          onSwitchToPro={() => setDesktopMode("pro")}
        >
          {currentScreen === "dashboard" ? (
            <DesktopDashboardHome
              netProfit={netProfit}
              monthlyDues={monthlyDues}
              totalPortfolio={totalPortfolio}
              t={t}
              themeStyles={themeStyles}
              onNavigate={handleMenuAction}
            />
          ) : (
            screenElement
          )}
        </DesktopSidebarShell>
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
          if (recordId === "active_contracts") {
            setShowCentralRecordsModal(false);
            setShowAllClientsRegisterModal(true);
          } else if (recordId === "archived_contracts") {
            setRecordDeepLink("archive");
            navigateTo("clientQuery");
          } else if (recordId === "all_clients_register") {
            setShowCentralRecordsModal(false);
            setShowAllClientsRegisterModal(true);
          } else if (recordId === "payment_records") {
            setRecordDeepLink("payments");
            navigateTo("pay");
          } else if (recordId === "employees_register") {
            navigateTo("treasuryEmployees");
          } else if (recordId === "expenses_register") {
            navigateTo("treasuryExpenses");
          } else if (recordId === "profits_register") {
            navigateTo("treasuryDistribute");
          }
        }}
        t={t}
        themeStyles={themeStyles}
      />

      {/* 📋 نافذة سجل بيانات العملاء الشامل (نفس الملف الموجود بالفعل AllClientsRegisterModal.jsx) */}
      <AllClientsRegisterModal
        isOpen={showAllClientsRegisterModal}
        onClose={() => setShowAllClientsRegisterModal(false)}
        contracts={allClientsRegisterData}
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

/**
 * =========================================================
 * 🖥️ قشرة الديسكتوب الجديدة (الوضع العادي):
 * شريط علوي مع القوائم المنسدلة التفاعلية + قائمة جانبية بالتحويم
 * =========================================================
 */
function DesktopSidebarShell({
  buttons,
  currentScreen,
  onNavItemClick,
  onGoDashboard,
  t,
  themeStyles,
  currentLangObj,
  onOpenRecords,
  onOpenBin,
  onOpenThemes,
  onOpenLang,
  onOpenSearch,
  onOpenCalc,
  onSwitchToPro,
  children
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const expanded = manualOpen || hovering;

  useEffect(() => {
    const handleOutside = (e) => {
      if (!e.target.closest(".topbar-dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const isButtonActive = (b) => {
    if (b.key === "search") return currentScreen === "clientQuery";
    if (b.key === "lateClients") return currentScreen === "overdue";
    return currentScreen === b.key;
  };

  const topbarBtnStyle = (isOpen) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: isOpen ? (themeStyles.inputBg || "#22222a") : "transparent",
    border: "none",
    color: isOpen ? (themeStyles.accentGold || "#d69a5f") : (themeStyles.subText || "#9a9aa3"),
    fontFamily: "inherit",
    fontSize: 12.5,
    fontWeight: 700,
    padding: "8px 12px",
    borderRadius: 9,
    cursor: "pointer",
    whiteSpace: "nowrap"
  });

  const dropdownMenuStyle = {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    minWidth: 260,
    background: themeStyles.card || "#18181c",
    border: `1px solid ${themeStyles.border || "#2a2a32"}`,
    borderRadius: 14,
    boxShadow: "0 14px 36px rgba(0,0,0,0.65)",
    padding: "8px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 2
  };

  const dropdownItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 700,
    color: themeStyles.text || "#ffffff",
    cursor: "pointer",
    textAlign: "right"
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: themeStyles.bg || "#0b0b0d",
        display: "flex", flexDirection: "column", zIndex: 5, fontFamily: "inherit"
      }}
    >
      {/* الشريط العلوي التفاعلي */}
      <div style={{
        height: 60, flex: "0 0 60px", background: themeStyles.card || "#131316",
        borderBottom: `1px solid ${themeStyles.border || "#232328"}`,
        display: "flex", alignItems: "center", gap: 6, padding: "0 20px", position: "relative", zIndex: 80
      }}>
        {/* اللوجو واسم النظام */}
        <div onClick={onGoDashboard} style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 16, cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#d69a5f,#7a4a1f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            <Calculator size={18} color="#fff" />
          </div>
          <b style={{ fontSize: 14, fontWeight: 800, color: themeStyles.text || "#fff", whiteSpace: "nowrap" }}>{t.appName || "نظام إدارة الأقساط والمبيعات"}</b>
        </div>

        {/* 1. قائمة مركز السجلات */}
        <div className="topbar-dropdown-container" style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setActiveDropdown(prev => prev === "records" ? null : "records")}
            style={topbarBtnStyle(activeDropdown === "records")}
          >
            <FolderKanban size={15} />
            <span>مركز السجلات</span>
            <ChevronDown size={12} style={{ transform: activeDropdown === "records" ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>

          {activeDropdown === "records" && (
            <div style={dropdownMenuStyle}>
              <div style={{ fontSize: 11, color: themeStyles.accentGold || "#d69a5f", fontWeight: 800, padding: "6px 10px", borderBottom: `1px solid ${themeStyles.border || "#25252c"}`, marginBottom: 4 }}>
                سجلات النظام والعمليات
              </div>

              <div
                onClick={() => { onNavItemClick("allClientsRegister"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Users size={15} color="#60a5fa" />
                <div style={{ flex: 1 }}>
                  <div>سجل بيانات العملاء الشامل</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>جدول تفصيلي بأسلوب Excel</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("payRecords"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <CreditCard size={15} color="#fbbf24" />
                <div style={{ flex: 1 }}>
                  <div>سجل عمليات السداد والتحصيل</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>حركة الخزينة والتحصيلات المباشرة</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("lateClients"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <AlertTriangle size={15} color="#f87171" />
                <div style={{ flex: 1 }}>
                  <div>سجل المتأخرين عن السداد</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>العملاء المتأخرون ومواعيد الاستحقاق</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("treasuryExpenses"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <DollarSign size={15} color="#f472b6" />
                <div style={{ flex: 1 }}>
                  <div>سجل المصروفات العامة</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>إجمالي وتصنيف المصروفات</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("treasuryEmployees"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Briefcase size={15} color="#a78bfa" />
                <div style={{ flex: 1 }}>
                  <div>سجل شؤون الموظفين والرواتب</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>كشوف المرتبات والسلف النشطة</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("treasuryPartners"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Users size={15} color="#38bdf8" />
                <div style={{ flex: 1 }}>
                  <div>سجل الشركاء ورأس المال</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>حصص واستثمارات الشركاء</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("treasuryDistribute"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Wallet size={15} color="#4ade80" />
                <div style={{ flex: 1 }}>
                  <div>سجل توزيع الأرباح والخزينة</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888", fontWeight: 500 }}>حركة الأرباح وتوزيعاتها</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* 2. قائمة سلة المهملات */}
        <div className="topbar-dropdown-container" style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setActiveDropdown(prev => prev === "bin" ? null : "bin")}
            style={topbarBtnStyle(activeDropdown === "bin")}
          >
            <Trash2 size={15} />
            <span>سلة المهملات</span>
            <ChevronDown size={12} style={{ transform: activeDropdown === "bin" ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>

          {activeDropdown === "bin" && (
            <div style={dropdownMenuStyle}>
              <div style={{ fontSize: 11, color: "#f87171", fontWeight: 800, padding: "6px 10px", borderBottom: `1px solid ${themeStyles.border || "#25252c"}`, marginBottom: 4 }}>
                العناصر والمحذوفات
              </div>

              <div
                onClick={() => { onOpenBin(); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Trash2 size={15} color="#fca5a5" />
                <div style={{ flex: 1 }}>
                  <div>سلة مهملات العقود المحذوفة</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888" }}>استرجاع أو حذف نهائي</div>
                </div>
              </div>

              <div
                onClick={() => { onOpenBin(); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <DollarSign size={15} color="#fca5a5" />
                <div style={{ flex: 1 }}>
                  <div>سلة مهملات المصروفات</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888" }}>استرجاع المصروفات المحذوفة</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("deleteClient"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <UserX size={15} color="#fca5a5" />
                <div style={{ flex: 1 }}>
                  <div>إدارة وحذف حسابات العملاء</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888" }}>حذف عميل بالكامل من النظام</div>
                </div>
              </div>

              <div
                onClick={() => { onOpenBin(); setActiveDropdown(null); }}
                style={{ ...dropdownItemStyle, borderTop: `1px solid ${themeStyles.border || "#25252c"}`, marginTop: 4, color: "#fca5a5" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Trash2 size={15} />
                <div style={{ flex: 1, fontWeight: 800 }}>فتح سلة المهملات الشاملة</div>
                <ArrowRight size={13} />
              </div>
            </div>
          )}
        </div>

        {/* 3. قائمة الأرشيف */}
        <div className="topbar-dropdown-container" style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setActiveDropdown(prev => prev === "archive" ? null : "archive")}
            style={topbarBtnStyle(activeDropdown === "archive")}
          >
            <Archive size={15} />
            <span>الأرشيف</span>
            <ChevronDown size={12} style={{ transform: activeDropdown === "archive" ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>

          {activeDropdown === "archive" && (
            <div style={dropdownMenuStyle}>
              <div style={{ fontSize: 11, color: themeStyles.accentGold || "#d69a5f", fontWeight: 800, padding: "6px 10px", borderBottom: `1px solid ${themeStyles.border || "#25252c"}`, marginBottom: 4 }}>
                السجلات المؤرشفة
              </div>

              <div
                onClick={() => { onNavItemClick("clientQueryArchive"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <CheckCircle size={15} color="#34d399" />
                <div style={{ flex: 1 }}>
                  <div>أرشيف العقود المسددة بالكامل</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888" }}>العقود المنتهية والمخالصة</div>
                </div>
              </div>

              <div
                onClick={() => { onNavItemClick("clientQueryArchive"); setActiveDropdown(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(214,154,95,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Clock size={15} color="#60a5fa" />
                <div style={{ flex: 1 }}>
                  <div>أرشيف الحسابات المسواة والتصفيات</div>
                  <div style={{ fontSize: 10, color: themeStyles.subText || "#888" }}>سجلات العمليات السابقة</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. الثيمات */}
        <button type="button" onClick={onOpenThemes} style={topbarBtnStyle(false)}>
          <Palette size={15} /> <span>الثيمات</span>
        </button>

        {/* 5. اللغة */}
        <button type="button" onClick={onOpenLang} style={topbarBtnStyle(false)}>
          <Globe size={15} /> <span>{(currentLangObj?.flag || "🌐") + " " + (currentLangObj?.name || "اللغة")}</span>
        </button>

        {/* 6. البحث الشامل */}
        <button type="button" onClick={onOpenSearch} style={topbarBtnStyle(false)}>
          <Search size={15} /> <span>البحث الشامل</span>
        </button>

        {/* 7. الآلة الحاسبة */}
        <button type="button" onClick={onOpenCalc} style={topbarBtnStyle(false)}>
          <Calculator size={15} /> <span>الآلة الحاسبة</span>
        </button>

        <div style={{ flex: 1 }} />

        {/* مبدل الأوضاع (عادي / Pro) */}
        <div style={{ display: "flex", background: themeStyles.inputBg || "#1a1a20", borderRadius: 20, padding: 3, border: `1px solid ${themeStyles.border || "#2e2e38"}`, marginLeft: 14 }}>
          <button
            type="button"
            style={{ background: "linear-gradient(135deg,#d69a5f,#b06a35)", border: "none", color: "#fff", fontFamily: "inherit", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 16, cursor: "pointer" }}
          >
            عادي
          </button>
          <button
            type="button"
            onClick={onSwitchToPro}
            style={{ background: "transparent", border: "none", color: themeStyles.subText || "#9a9aa3", fontFamily: "inherit", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 16, cursor: "pointer" }}
          >
            Pro
          </button>
        </div>

        {/* أيقونة المستخدم */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", padding: "6px 14px", borderRadius: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: themeStyles.inputBg || "#222228", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: themeStyles.text || "#fff" }}>👤</div>
          <span style={{ fontSize: 12, fontWeight: 800, color: themeStyles.text || "#fff" }}>المشرف العام</span>
        </div>
      </div>

      {/* الجسم: القائمة الجانبية + مساحة المحتوى */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* القائمة الجانبية بالتحويم الذكي */}
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            width: expanded ? 260 : 68,
            background: themeStyles.card || "#131316",
            borderLeft: `1px solid ${themeStyles.border || "#232328"}`,
            display: "flex", flexDirection: "column",
            transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
            overflow: "hidden", flexShrink: 0
          }}
        >
          {/* رأس القائمة */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: expanded ? "space-between" : "center",
            padding: expanded ? "12px 14px" : "12px 0", borderBottom: `1px solid ${themeStyles.border || "#232328"}`,
            height: 56, flex: "0 0 56px"
          }}>
            {expanded && <span style={{ fontSize: 13.5, fontWeight: 800, color: themeStyles.text || "#fff", whiteSpace: "nowrap" }}>القائمة الرئيسية</span>}
            <div
              onClick={() => setManualOpen((v) => !v)}
              title="طي / فتح القائمة"
              style={{ width: 34, height: 34, borderRadius: 9, background: themeStyles.inputBg || "#1c1c22", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, color: themeStyles.accentGold || "#d69a5f", border: `1px solid ${themeStyles.border || "#2e2e36"}`, flexShrink: 0 }}
            >
              ☰
            </div>
          </div>

          {/* عناصر القائمة الجانبية */}
          <div style={{ padding: expanded ? "10px 8px" : "10px 0", overflowY: expanded ? "auto" : "hidden", flex: 1 }}>
            <div
              onClick={onGoDashboard}
              style={{
                display: "flex", alignItems: "center", gap: expanded ? 12 : 0, justifyContent: expanded ? "flex-start" : "center",
                padding: expanded ? "10px 12px" : "10px 0", borderRadius: expanded ? 10 : 0, fontSize: 13, fontWeight: 800,
                color: currentScreen === "dashboard" ? (themeStyles.accentGold || "#d69a5f") : (themeStyles.subText || "#9a9aa3"),
                background: currentScreen === "dashboard" ? "rgba(214,154,95,0.16)" : "transparent",
                border: currentScreen === "dashboard" ? `1px solid ${themeStyles.accentGold || "#d69a5f"}55` : "1px solid transparent",
                cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap"
              }}
            >
              <span style={{ fontSize: 16, width: 22, textAlign: "center", flex: "0 0 22px" }}>📊</span>
              {expanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>لوحة التحكم الرئيسية</span>}
            </div>

            {buttons.filter((b) => b.key !== "exit").map((b) => {
              const Icon = b.icon;
              const active = isButtonActive(b);
              return (
                <div
                  key={b.key}
                  onClick={() => onNavItemClick(b.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: expanded ? 12 : 0, justifyContent: expanded ? "flex-start" : "center",
                    padding: expanded ? "10px 12px" : "10px 0", borderRadius: expanded ? 10 : 0, fontSize: 13, fontWeight: 700,
                    color: active ? (themeStyles.accentGold || "#d69a5f") : (themeStyles.subText || "#9a9aa3"),
                    background: active ? "rgba(214,154,95,0.16)" : "transparent",
                    border: active ? `1px solid ${themeStyles.accentGold || "#d69a5f"}55` : "1px solid transparent",
                    cursor: "pointer", marginBottom: 3, whiteSpace: "nowrap"
                  }}
                >
                  <span style={{ width: 22, textAlign: "center", flex: "0 0 22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} />
                  </span>
                  {expanded && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{b.label}</span>}
                </div>
              );
            })}
          </div>

          {/* ذيل القائمة الجانبية */}
          <div style={{ padding: expanded ? 12 : "12px 0", borderTop: `1px solid ${themeStyles.border || "#232328"}`, display: "flex", justifyContent: expanded ? "flex-start" : "center" }}>
            <div
              onClick={() => onNavItemClick("exit")}
              style={{ display: "flex", alignItems: "center", gap: expanded ? 10 : 0, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: themeStyles.inputBg || "#222228", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
              {expanded && (
                <div>
                  <b style={{ fontSize: 12.5, display: "block", color: themeStyles.text || "#fff" }}>المشرف العام</b>
                  <span style={{ fontSize: 10.5, color: themeStyles.subText || "#9a9aa3" }}>تسجيل الخروج</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* مساحة المحتوى */}
        <div style={{ flex: 1, minWidth: 0, padding: "24px 30px", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * 🖥️ محتوى لوحة التحكم في الوضع العادي:
 * (الكروت الثلاثية العلوية + الرسم البياني الشهري + كروت المصروفات والرواتب ورأس المال)
 * =========================================================
 */
function DesktopDashboardHome({ netProfit, monthlyDues, totalPortfolio, t, themeStyles, onNavigate }) {
  const kpis = [
    { icon: TrendingUp, val: netProfit, lb: t.netProfit || "صافي الأرباح حتى اليوم", sub: t.netProfitSub || "إجمالي أرباح العقود والتحصيلات الصافية" },
    { icon: CalendarClock, val: monthlyDues, lb: t.monthlyDues || "مستحقات هذا الشهر", sub: t.monthlyDuesSub || "المطلوب تحصيله حالياً" },
    { icon: Wallet, val: totalPortfolio, lb: t.totalPortfolio || "إجمالي الأقساط المتبقية", sub: t.totalPortfolioSub || "المبالغ المتبقية في ذمة العملاء" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* 1. العنوان الرئيسي */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, margin: "0 0 4px 0", fontWeight: 800, color: themeStyles.text || "#ffffff" }}>
          لوحة التحكم الرئيسية
        </h1>
        <span style={{ fontSize: 12.5, color: themeStyles.subText || "#8a8a94" }}>
          التقرير المالي العام والمؤشرات التنفيذية للنشاط
        </span>
      </div>

      {/* 2. كروت المؤشرات الثلاثية المنسقة في المنتصف */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div
              key={idx}
              style={{
                background: themeStyles.card || "#18181c",
                border: `1px solid ${themeStyles.border || "#232328"}`,
                borderRadius: 16,
                padding: "18px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {Number(k.val || 0).toLocaleString()}{" "}
                <span style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f" }}>{t.currency || "ج.م"}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: 5 }}>
                {k.lb}
              </div>
              <div style={{ fontSize: 11, color: themeStyles.subText || "#8a8a94", marginTop: 3 }}>
                {k.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. شبكة الرسم البياني + كروت الملخص الجانبية */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        
        {/* أ) بطاقة الرسم البياني الشهري */}
        <div style={{
          background: themeStyles.card || "#18181c",
          border: `1px solid ${themeStyles.border || "#232328"}`,
          borderRadius: 16,
          padding: 20,
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${themeStyles.border || "#222228"}`, paddingBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>
              📊 حركة التحصيلات والأرباح الشهرية
            </h3>
            <span style={{ fontSize: 11, color: themeStyles.subText || "#8a8a94" }}>تحديث لحظي مباشر</span>
          </div>

          <div style={{ width: "100%", height: 180, display: "flex", alignItems: "flex-end", gap: 14, paddingTop: 20 }}>
            {/* مايو */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
              <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                <div style={{ width: "100%", height: "45%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
              </div>
              <span style={{ fontSize: 11, color: themeStyles.subText || "#8a8a94", fontWeight: 700 }}>مايو</span>
            </div>

            {/* يونيو */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
              <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                <div style={{ width: "100%", height: "65%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
              </div>
              <span style={{ fontSize: 11, color: themeStyles.subText || "#8a8a94", fontWeight: 700 }}>يونيو</span>
            </div>

            {/* يوليو */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
              <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                <div style={{ width: "100%", height: "80%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
              </div>
              <span style={{ fontSize: 11, color: themeStyles.subText || "#8a8a94", fontWeight: 700 }}>يوليو</span>
            </div>

            {/* أغسطس */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
              <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                <div style={{ width: "100%", height: "95%", background: "linear-gradient(180deg, #d69a5f 0%, #b06a35 100%)", borderRadius: "6px 6px 0 0" }}></div>
              </div>
              <span style={{ fontSize: 11, color: themeStyles.subText || "#8a8a94", fontWeight: 700 }}>أغسطس</span>
            </div>

            {/* المصروفات */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
              <div style={{ width: "100%", maxWidth: 38, background: "#202026", borderRadius: "8px 8px 4px 4px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140 }}>
                <div style={{ width: "100%", height: "35%", background: "linear-gradient(180deg, #ef4444 0%, #991b1b 100%)", borderRadius: "6px 6px 0 0" }}></div>
              </div>
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>المصروفات</span>
            </div>
          </div>
        </div>

        {/* ب) كروت الملخص الجانبية */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* كارت 1: المصروفات العامة */}
          <div
            onClick={() => onNavigate && onNavigate("treasuryExpenses")}
            style={{
              background: themeStyles.card || "#18181c",
              border: `1px solid ${themeStyles.border || "#232328"}`,
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 3px 0", fontSize: 13, fontWeight: 800, color: themeStyles.text || "#ffffff" }}>
                المصروفات العامة
              </h4>
              <p style={{ margin: 0, fontSize: 11, color: themeStyles.subText || "#8a8a94" }}>
                إجمالي المصروفات المسجلة
              </p>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fca5a5", fontVariantNumeric: "tabular-nums" }}>
              0 ج.م
            </div>
          </div>

          {/* كارت 2: رواتب وسلف الموظفين */}
          <div
            onClick={() => onNavigate && onNavigate("treasuryEmployees")}
            style={{
              background: themeStyles.card || "#18181c",
              border: `1px solid ${themeStyles.border || "#232328"}`,
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 3px 0", fontSize: 13, fontWeight: 800, color: themeStyles.text || "#ffffff" }}>
                رواتب وسلف الموظفين
              </h4>
              <p style={{ margin: 0, fontSize: 11, color: themeStyles.subText || "#8a8a94" }}>
                الرواتب والحركات النشطة
              </p>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#93c5fd", fontVariantNumeric: "tabular-nums" }}>
              0 ج.م
            </div>
          </div>

          {/* كارت 3: رأس مال الشركة */}
          <div
            onClick={() => onNavigate && onNavigate("treasuryPartners")}
            style={{
              background: themeStyles.card || "#18181c",
              border: `1px solid ${themeStyles.border || "#232328"}`,
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 3px 0", fontSize: 13, fontWeight: 800, color: themeStyles.text || "#ffffff" }}>
                رأس مال الشركة
              </h4>
              <p style={{ margin: 0, fontSize: 11, color: themeStyles.subText || "#8a8a94" }}>
                صافي استثمارات الشركاء
              </p>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", fontVariantNumeric: "tabular-nums" }}>
              10,100 ج.م
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
