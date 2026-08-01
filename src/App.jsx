import React, { useState, useMemo } from "react";
import {
  UserPlus, CreditCard, Search, CalendarClock, UserX, Trash2, Wallet, Users, UserCog, Settings, UploadCloud, Power, TrendingUp, Calculator, Globe, Palette, X
} from "lucide-react";

// استدعاء شاشة إضافة عميل جديد
import { AddClientScreen } from "./components/AddClientScreen";

// القاموس المركزي للترجمة
const translations = {
  ar: {
    appName: "نظام إدارة الأقساط والمبيعات",
    welcome: "مرحباً،",
    generalSupervisor: "المشرف العام",
    logout: "خروج",
    addClient: "إضافة عميل جديد",
    pay: "سداد الأقساط",
    search: "استعلام عن عميل",
    monthlyDues: "مستحقات هذا الشهر",
    lateClients: "المتأخرين عن السداد",
    deleteClient: "حذف حساب عميل",
    treasury: "توزيع الأرباح والخزينة",
    treasuryPartners: "الشركاء ورأس المال",
    treasuryEmployees: "شؤون الموظفين والرواتب",
    settings: "الإعدادات والصلاحيات",
    backup: "النسخ الاحتياطي السحابي",
    exit: "تسجيل الخروج",
    netProfit: "صافي الأرباح حتى اليوم",
    netProfitSub: "إجمالي أرباح العقود والتحصيلات الصافية",
    monthlyDuesSub: "المطلوب تحصيله حالياً",
    totalPortfolio: "إجمالي الأقساط المتبقية",
    totalPortfolioSub: "المبالغ المتبقية في ذمة العملاء",
    currency: "ج.م",
    selectLang: "اختر لغة البرنامج",
    selectTheme: "معرض الثيمات والمظهر",
    appThemes: "الثيمات",
    saveSuccess: "تم حفظ بيانات العقد بنجاح!"
  },
  en: {
    appName: "Pro Installment Management System",
    welcome: "Welcome,",
    generalSupervisor: "General Supervisor",
    logout: "Logout",
    addClient: "Add New Client",
    pay: "Pay Installments",
    search: "Client Inquiry",
    monthlyDues: "Current Month Dues",
    lateClients: "Late Clients",
    deleteClient: "Delete Client Account",
    treasury: "Treasury & Profits",
    treasuryPartners: "Partners & Capital",
    treasuryEmployees: "Employees & Salaries",
    settings: "Settings & Permissions",
    backup: "Cloud Backup",
    exit: "Logout",
    netProfit: "Net Profit To Date",
    netProfitSub: "Total net contract and collection profits",
    monthlyDuesSub: "Total amount to collect currently",
    totalPortfolio: "Total Remaining Portfolio",
    totalPortfolioSub: "Remaining client balances",
    currency: "EGP",
    selectLang: "Select Language",
    selectTheme: "Themes Gallery",
    appThemes: "Themes",
    saveSuccess: "Contract saved successfully!"
  }
};

const LANGUAGES = [
  { code: "ar", name: "العربية", flag: "🇪🇬" },
  { code: "en", name: "English", flag: "🇺🇸" }
];

const THEMES_LIST = [
  { id: "royalGold", name: "ذهبي ملكي", previewAccent: "#d4af37" },
  { id: "dark", name: "داكن فاخر", previewAccent: "#e07a5f" },
  { id: "light", name: "فاتح ناصع", previewAccent: "#2563eb" }
];

export function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard"); // 'dashboard' | 'addClient'
  const [currentLang, setCurrentLang] = useState("ar");
  const [currentTheme, setCurrentTheme] = useState("royalGold");
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [clientsList, setClientsList] = useState([]);

  const t = translations[currentLang];
  const isEN = currentLang === "en";

  // الألوان والتنسيقات بحسب الثيم المختار
  const themeStyles = useMemo(() => {
    if (currentTheme === "light") {
      return {
        bg: "#f8fafc", card: "#ffffff", inputBg: "#f1f5f9", border: "#cbd5e1",
        text: "#0f172a", subText: "#64748b", accentGold: "#b45309", accent: "#d97706",
        borderRadius: "14px"
      };
    }
    if (currentTheme === "dark") {
      return {
        bg: "#121316", card: "#1c1e22", inputBg: "#252830", border: "#2d3139",
        text: "#f3f4f6", subText: "#9ca3af", accentGold: "#e07a5f", accent: "#c97a6d",
        borderRadius: "14px"
      };
    }
    return {
      bg: "#111111", card: "#1e1e1e", inputBg: "#252525", border: "#333333",
      text: "#ffffff", subText: "#aaaaaa", accentGold: "#d4af37", accent: "#c5a028",
      borderRadius: "14px"
    };
  }, [currentTheme]);

  // حفظ العقد الجديد في القائمة والعودة للرئيسية
  const handleSaveClient = (newClientData) => {
    setClientsList(prev => [newClientData, ...prev]);
    alert(t.saveSuccess);
    setCurrentScreen("dashboard");
  };

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
    { key: "backup", label: t.backup, icon: UploadCloud, tone: "roseLight" },
    { key: "exit", label: t.exit, icon: Power, tone: "dark" },
  ];

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ minHeight: "100vh", backgroundColor: themeStyles.bg, color: themeStyles.text, padding: "20px", fontFamily: "Cairo, sans-serif" }}>
      
      {/* 1. شاشة إضافة عميل جديد */}
      {currentScreen === "addClient" && (
        <AddClientScreen
          onSave={handleSaveClient}
          onBack={() => setCurrentScreen("dashboard")}
          t={t}
          themeStyles={themeStyles}
        />
      )}

      {/* 2. اللوحة الرئيسية (Dashboard) */}
      {currentScreen === "dashboard" && (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          
          {/* HEADER */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)",
            borderRadius: 18, padding: "18px 24px", marginBottom: 20, color: "#fff"
          }}>
            <div style={{ display: "flex", itemsCenter: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                {t.welcome} {t.generalSupervisor}
              </div>

              <button onClick={() => setShowLangModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={15} /> <span>{currentLang === "ar" ? "🇪🇬 العربية" : "🇺🇸 English"}</span>
              </button>

              <button onClick={() => setShowThemeModal(true)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Palette size={15} /> <span>{t.appThemes}</span>
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

          {/* KPIs */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
            <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 16, padding: "20px" }}>
              <TrendingUp size={24} color={themeStyles.accentGold} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>0 {t.currency}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.netProfit}</div>
              <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.netProfitSub}</div>
            </div>

            <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 16, padding: "20px" }}>
              <CalendarClock size={24} color={themeStyles.accentGold} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>0 {t.currency}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.monthlyDues}</div>
              <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.monthlyDuesSub}</div>
            </div>

            <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 16, padding: "20px" }}>
              <Wallet size={24} color={themeStyles.accentGold} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>21980 {t.currency}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.totalPortfolio}</div>
              <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.totalPortfolioSub}</div>
            </div>
          </section>

          {/* BUTTONS GRID */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {buttons.map((b) => {
              const Icon = b.icon;
              return (
                <button
                  key={b.key}
                  onClick={() => {
                    if (b.key === "addClient") {
                      setCurrentScreen("addClient");
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: b.tone === "gold" ? "linear-gradient(135deg, #d69a5f, #b06a35)" : b.tone === "copper" ? "linear-gradient(135deg, #b06a35, #7a4a1f)" : b.tone === "silver" ? "#d1d5db" : b.tone === "rose" ? "#fca5a5" : b.tone === "roseDark" ? "#9f1239" : themeStyles.card,
                    color: b.tone === "silver" || b.tone === "rose" ? "#111" : "#fff",
                    border: `1px solid ${themeStyles.border}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", fontFamily: "inherit"
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

      {/* MODAL 1: LANGUAGES */}
      {showLangModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 20, padding: 20, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontWeight: 800 }}>{t.selectLang}</span>
              <X style={{ cursor: "pointer" }} onClick={() => setShowLangModal(false)} />
            </div>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { setCurrentLang(l.code); setShowLangModal(false); }} style={{ width: "100%", padding: 12, marginBottom: 8, background: themeStyles.inputBg, border: "none", color: themeStyles.text, borderRadius: 10, textAlign: "start", fontWeight: 700, cursor: "pointer" }}>
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 2: THEMES */}
      {showThemeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: 20, padding: 20, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontWeight: 800 }}>{t.selectTheme}</span>
              <X style={{ cursor: "pointer" }} onClick={() => setShowThemeModal(false)} />
            </div>
            {THEMES_LIST.map(tm => (
              <button key={tm.id} onClick={() => { setCurrentTheme(tm.id); setShowThemeModal(false); }} style={{ width: "100%", padding: 12, marginBottom: 8, background: themeStyles.inputBg, border: "none", color: themeStyles.text, borderRadius: 10, textAlign: "start", fontWeight: 700, cursor: "pointer" }}>
                {tm.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
