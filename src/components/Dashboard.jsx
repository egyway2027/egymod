import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  UserPlus, CreditCard, Search, CalendarClock, UserX, Trash2, Wallet, Users, UserCog, Settings, UploadCloud, Power, TrendingUp, Calculator, Globe, Palette, X, Check
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { LANGUAGES } from "../i18n";
import { THEMES_LIST } from "../themes";
import { KPI, DashButton } from "./CommonUI";

// دالة مساعدة لضمان عرض الأرقام والمبالغ كأعداد صحيحة مجردة وبدون فواصل آلاف
const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export function Dashboard({
  totals = {},
  lateCount = 0,
  onNavigate,
  user,
  onLogout,
  currentLang = "ar",
  setCurrentLang,
  currentTheme = "royalGold",
  setCurrentTheme,
  t = {},
  styles = {},
  themeStyles = {}
}) {
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [liveTotals, setLiveTotals] = useState(null);

  const isEN = useMemo(() => {
    return currentLang === "en" || t?.lang === "en" || document.documentElement.lang === "en";
  }, [currentLang, t]);

  // 🔄 حساب إحصائيات الشاشة الرئيسية سحابياً وديناميكياً من جدول العقود والأقساط
  const fetchDashTotals = useCallback(async () => {
    try {
      const [contractsRes, installmentsRes] = await Promise.all([
        supabase.from("contracts").select("*"),
        supabase.from("installments").select("*")
      ]);

      if (contractsRes.error) console.error("Contracts error:", contractsRes.error);
      if (installmentsRes.error) console.error("Installments error:", installmentsRes.error);

      const contracts = contractsRes.data || [];
      const installments = installmentsRes.data || [];

      let calcPortfolio = 0;
      let calcProfit = 0;
      let calcMonthlyDues = 0;

      contracts.forEach((c) => {
        const salePrice = Number(c.sale_price || c.salePrice || c.sale || c.total || 0);
        const costPrice = Number(c.cost_price || c.costPrice || c.cost || 0);
        const downPayment = Number(c.down_payment || c.downPayment || c.down || 0);
        const monthly = Number(c.monthly_installment || c.monthlyInstallment || c.monthly || 0);

        const matchedPaid = installments
          .filter((i) => String(i.contract_id) === String(c.id) && (i.is_paid || i.status === "paid" || Number(i.amount) > 0))
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const totalPaid = downPayment + matchedPaid;
        const remainingDebt = Math.max(0, salePrice - totalPaid);

        calcPortfolio += remainingDebt;
        if (remainingDebt > 0) {
          calcMonthlyDues += monthly;
        }

        calcProfit += (salePrice - costPrice);
      });

      setLiveTotals({
        totalPortfolio: calcPortfolio,
        totalDebt: calcMonthlyDues,
        netProfit: calcProfit
      });
    } catch (err) {
      console.error("❌ خطأ في جلب إحصائيات الشاشة الرئيسية:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashTotals();
    
    // إعادة تحديث الأرقام فوراً عند التركيز على الشاشة أو العودة إليها
    const onFocus = () => fetchDashTotals();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchDashTotals, totals]);

  const safeNetProfit = useMemo(() => {
    const net = liveTotals?.netProfit ?? totals.netProfit ?? totals.totalProfit ?? 0;
    return isNaN(net) ? 0 : Math.round(net);
  }, [liveTotals, totals]);

  const safePortfolio = useMemo(() => {
    return liveTotals?.totalPortfolio ?? totals.totalPortfolio ?? 0;
  }, [liveTotals, totals]);

  const safeMonthlyDues = useMemo(() => {
    return liveTotals?.totalDebt ?? totals.totalDebt ?? 0;
  }, [liveTotals, totals]);

  const activeLangObj = useMemo(() => {
    return LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  }, [currentLang]);

  const buttons = [
    { key: "addClient", label: t.addClient || (isEN ? "Add New Client" : "إضافة عميل جديد"), icon: UserPlus, tone: "dark" },
    { key: "pay", label: t.pay || (isEN ? "Pay Installments" : "سداد الأقساط"), icon: CreditCard, tone: "gold" },
    { key: "search", label: t.search || (isEN ? "Client Inquiry" : "استعلام عن عميل"), icon: Search, tone: "silver" },
    { key: "monthlyDues", label: t.monthlyDues || (isEN ? "Current Month Dues" : "مستحقات هذا الشهر"), icon: CalendarClock, tone: "copper" },
    { key: "lateClients", label: `${t.lateClients || (isEN ? "Late Clients" : "المتأخرين عن السداد")}${lateCount ? ` (${fmtCleanInt(lateCount)})` : ""}`, icon: UserX, tone: "rose" },
    { key: "deleteClient", label: t.deleteClient || (isEN ? "Delete Client Account" : "حذف حساب عميل"), icon: Trash2, tone: "gold" },
    { key: "treasury", label: t.treasury || (isEN ? "Treasury & Profits" : "توزيع الأرباح والخزينة"), icon: Wallet, tone: "roseDark" },
    { key: "treasuryPartners", label: t.treasuryPartners || (isEN ? "Partners & Capital" : "الشركاء ورأس المال"), icon: Users, tone: "copper" },
    { key: "treasuryEmployees", label: t.treasuryEmployees || (isEN ? "Employees & Salaries" : "شؤون الموظفين والرواتب"), icon: UserCog, tone: "silver" },
    { key: "settings", label: t.settings || (isEN ? "Settings & Permissions" : "الإعدادات والصلاحيات"), icon: Settings, tone: "tan" },
    { key: "backup", label: t.backup || (isEN ? "Cloud Backup" : "النسخ الاحتياطي السحابي"), icon: UploadCloud, tone: "roseLight" },
    { key: "exit", label: t.exit || (isEN ? "Logout" : "تسجيل الخروج"), icon: Power, tone: "dark" },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.dashHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={styles.adminBadge}>
            {t.welcome || (isEN ? "Welcome," : "مرحباً،")} {user?.name || (t.generalSupervisor || (isEN ? "Supervisor" : "المشرف"))}
          </div>

          {/* زر التغيير السريع للغة */}
          {setCurrentLang && (
            <button
              type="button"
              onClick={() => setShowLangModal(true)}
              style={{
                background: themeStyles.inputBg,
                border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`,
                color: themeStyles.accentGold,
                padding: "7px 12px",
                borderRadius: themeStyles.borderRadius || 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: themeStyles.inputShadow || "none"
              }}
              title={t.selectLang || (isEN ? "Select Language" : "اختر لغة البرنامج")}
            >
              <Globe size={15} />
              <span>{activeLangObj.flag} {activeLangObj.name}</span>
            </button>
          )}

          {/* زر التغيير السريع للثيم */}
          {setCurrentTheme && (
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              style={{
                background: themeStyles.inputBg,
                border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`,
                color: themeStyles.accentGold,
                padding: "7px 12px",
                borderRadius: themeStyles.borderRadius || 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: themeStyles.inputShadow || "none"
              }}
              title={t.selectTheme || (isEN ? "Themes Gallery" : "معرض الثيمات والمظهر")}
            >
              <Palette size={15} />
              <span>{t.appThemes || (isEN ? "Themes" : "الثيمات")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            style={{
              background: themeStyles.inputBg,
              border: "1px solid #e07a5f",
              color: "#e07a5f",
              padding: "7px 12px",
              borderRadius: themeStyles.borderRadius || 10,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 12
            }}
          >
            {t.logout || (isEN ? "Logout" : "خروج")}
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={styles.dashTitle}>{t.appName || (isEN ? "Pro Installment Management System" : "نظام إدارة الأقساط والمبيعات")}</div>
          <div style={styles.dashSub}>{t.cloudEnterpriseActive || "Cloud Enterprise Active"}</div>
        </div>
        <div style={styles.calcIcon}>
          <Calculator size={22} color={themeStyles.accentGold} />
        </div>
      </header>

      {/* المؤشرات الرئيسية */}
      <section style={styles.kpiRow}>
        <KPI
          icon={TrendingUp}
          label={t.netProfit || (isEN ? "Net Profit To Date" : "صافي الأرباح حتى اليوم")}
          sub={t.netProfitSub || (isEN ? "Total net contract and collection profits" : "إجمالي أرباح العقود والتحصيلات الصافية")}
          value={`${fmtCleanInt(safeNetProfit)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
          styles={styles}
          themeStyles={themeStyles}
        />
        <KPI
          icon={CalendarClock}
          label={t.monthlyDues || (isEN ? "Current Month Dues" : "مستحقات هذا الشهر")}
          sub={t.monthlyDuesSub || (isEN ? "Total amount to collect currently" : "المطلوب تحصيله حالياً")}
          value={`${fmtCleanInt(safeMonthlyDues)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
          styles={styles}
          themeStyles={themeStyles}
        />
        <KPI
          icon={Wallet}
          label={t.totalPortfolio || (isEN ? "Total Remaining Portfolio" : "إجمالي الأقساط المتبقية")}
          sub={t.totalPortfolioSub || (isEN ? "Remaining client balances" : "المبالغ المتبقية في ذمة العملاء")}
          value={`${fmtCleanInt(safePortfolio)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
          styles={styles}
          themeStyles={themeStyles}
        />
      </section>

      {/* شبكة الأزرار السريعة */}
      <section style={styles.grid}>
        {buttons.map((b) => (
          <DashButton
            key={b.key}
            label={b.label}
            Icon={b.icon}
            tone={b.tone}
            themeStyles={themeStyles}
            onClick={() => {
              if (b.key === "exit") { onLogout(); return; }
              if (onNavigate) onNavigate(b.key);
            }}
          />
        ))}
      </section>

      {/* نافذة استعراض اللغات */}
      {showLangModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{
            background: themeStyles.card,
            border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`,
            borderRadius: themeStyles.borderRadius || 20,
            width: "100%",
            maxWidth: 650,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: themeStyles.boxShadow || "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: themeStyles.inputBg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: themeStyles.accentGold }}>
                <Globe size={18} /> {t.selectLang || (isEN ? "Select Language" : "اختر لغة البرنامج (Language)")}
              </div>
              <button onClick={() => setShowLangModal(false)} style={{ background: "transparent", border: "none", color: themeStyles.subText, cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      if (setCurrentLang) setCurrentLang(lang.code);
                      setShowLangModal(false);
                    }}
                    style={{
                      background: currentLang === lang.code ? themeStyles.highlightBg : themeStyles.inputBg,
                      border: `${themeStyles.borderWidth || "1px"} solid ${currentLang === lang.code ? themeStyles.accentGold : themeStyles.border}`,
                      color: currentLang === lang.code ? themeStyles.accentGold : themeStyles.text,
                      borderRadius: themeStyles.borderRadius || 12,
                      padding: "12px 14px",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: 13.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "inherit"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{lang.flag}</span> {lang.name}
                    </span>
                    {currentLang === lang.code && <Check size={16} color={themeStyles.accentGold} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة استعراض الثيمات */}
      {showThemeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{
            background: themeStyles.card,
            border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`,
            borderRadius: themeStyles.borderRadius || 20,
            width: "100%",
            maxWidth: 850,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: themeStyles.boxShadow || "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: themeStyles.inputBg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: themeStyles.accentGold }}>
                <Palette size={18} /> {t.selectTheme || (isEN ? "Themes Gallery" : "معرض الثيمات والمظهر (Themes)")}
              </div>
              <button onClick={() => setShowThemeModal(false)} style={{ background: "transparent", border: "none", color: themeStyles.subText, cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {THEMES_LIST.map((tItem) => (
                  <div
                    key={tItem.id}
                    onClick={() => {
                      if (setCurrentTheme) setCurrentTheme(tItem.id);
                      setShowThemeModal(false);
                    }}
                    style={{
                      background: themeStyles.inputBg,
                      border: `2px solid ${currentTheme === tItem.id ? tItem.previewAccent : themeStyles.border}`,
                      borderRadius: themeStyles.borderRadius || 14,
                      padding: 14,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      transition: "transform 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: themeStyles.text }}>{tItem.name}</span>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: tItem.previewAccent, border: "1px solid #fff" }} />
                    </div>
                    <div style={{ height: 6, background: tItem.previewAccent, borderRadius: 4, width: "100%" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
