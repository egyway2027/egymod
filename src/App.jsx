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
import { useNavigation } from "./hooks/useNavigation";
import { useThemeAndLang } from "./hooks/useThemeAndLang";

export function App() {
  const { currentScreen, navigateTo, handleBack } = useNavigation("dashboard");
  const [clientsList, setClientsList] = useState([]);

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

  // 📌 حالات الاختصارات والنوافذ الجديدة
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showRecycleBinModal, setShowRecycleBinModal] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [showCentralRecordsModal, setShowCentralRecordsModal] = useState(false);

  // 🌟 نافذة التنبيه المخصصة بوسط الشاشة
  const [successModal, setSuccessModal] = useState({ open: false, title: "", msg: "" });

  // أزرار شبكة التحكم الرئيسية
  const buttons = [
    { key: "addClient", label: t.addClient, icon: UserPlus, tone: "dark" },
    { key: "pay", label: t.pay, icon: CreditCard, tone: "gold" },
    { key: "search", label: t.search, icon: Search, tone: "silver" },
    { key: "monthlyDues", label: t.monthlyDues, icon: CalendarClock, tone: "copper" },
    { key: "lateClients", label: t.lateClients, icon: UserX, tone: "rose" },
    { key: "deleteClient", label: t.deleteClient, icon: Trash2, tone: "gold" },
    { key: "treasury", label: t.treasury, icon: Wallet, tone: "roseDark" },
    { key: "treasuryPartners", label: t.treasuryPartners, icon: Users, tone: "copper" },
    { key: "treasuryEmployees", label: t.treasuryEmployees, icon: UserCog, tone: "silver" },
    { key: "settings", label: t.settings, icon: Settings, tone: "tan" },
    { key: "whatsapp", label: "مركز الواتساب الذكي", icon: MessageSquare, tone: "roseLight" },
    { key: "exit", label: t.exit, icon: Power, tone: "dark" },
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
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", backgroundColor: themeStyles.bg, color: themeStyles.text, padding: "20px", fontFamily: "Cairo, sans-serif" }}>

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
            borderRadius: 18, padding: "18px 24px", marginBottom: 20, color: "#fff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                {t.welcome} {t.generalSupervisor}
              </div>

              <button onClick={() => setShowLangModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={15} /> <span>{currentLangObj.flag} {currentLangObj.name}</span>
              </button>

              <button onClick={() => navigateTo("settings")} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Palette size={15} /> <span>{t.appThemes} (100)</span>
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

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{t.appName}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Cloud Enterprise Active</div>
            </div>

            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={22} />
            </div>
          </header>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
            <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
              <TrendingUp size={24} color={themeStyles.accentGold} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{netProfit.toLocaleString()} {t.currency}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.netProfit}</div>
              <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.netProfitSub}</div>
            </div>

            <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
              <CalendarClock size={24} color={themeStyles.accentGold} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{monthlyDues.toLocaleString()} {t.currency}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.monthlyDues}</div>
              <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.monthlyDuesSub}</div>
            </div>

            <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
              <Wallet size={24} color={themeStyles.accentGold} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
                {(clientsList || []).reduce((acc, curr) => {
                  if (Boolean(curr.is_deleted) || curr.status === "archived") return acc;
                  const sale = Number(curr.sale_price || curr.salePrice || curr.sale || curr.total || 0);
                  const down = Number(curr.down_payment || curr.downPayment || curr.down || 0);

                  const instArr = Array.isArray(curr.installments) ? curr.installments : (Array.isArray(curr.payments) ? curr.payments : []);
                  const paidFromInst = instArr
                    .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
                    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

                  return acc + Math.max(0, sale - down - paidFromInst);
                }, 0).toLocaleString()} {t.currency}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.totalPortfolio}</div>
              <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.totalPortfolioSub}</div>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
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
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: b.tone === "gold" ? "linear-gradient(135deg, #d69a5f, #b06a35)" : b.tone === "copper" ? "linear-gradient(135deg, #b06a35, #7a4a1f)" : b.tone === "silver" ? "#d1d5db" : b.tone === "rose" ? "#fca5a5" : b.tone === "roseDark" ? "#9f1239" : themeStyles.card,
                    color: b.tone === "silver" || b.tone === "rose" ? "#111" : "#fff",
                    border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.buttonRadius || 14, padding: "18px 20px", cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{b.label}</span>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} />
                  </span>
                </button>
              );
            })}
          </section>
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

      {/* 🌐 نافذة اختيار اللغات الـ 15 المكتملة */}
      {showLangModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: themeStyles.accentGold }}>{t.selectLang} (15)</span>
              <X style={{ cursor: "pointer" }} onClick={() => setShowLangModal(false)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 8 }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    changeLang(l.code);
                    setShowLangModal(false);
                  }}
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: currentLang === l.code ? "rgba(212, 175, 55, 0.2)" : themeStyles.inputBg,
                    border: `1px solid ${currentLang === l.code ? themeStyles.accentGold : themeStyles.border}`,
                    color: themeStyles.text, borderRadius: 10, textAlign: "start", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                >
                  <span>{l.flag} {l.name}</span>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
