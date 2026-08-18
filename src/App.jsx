import React, { useState, useMemo, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

// استدعاء محركات اللغات والثيمات المحدثة الموحدة
import { getTranslations, getLangDir } from "./i18n";
import { getThemeStyles } from "./themes";

import { useAuth } from "./hooks/useAuth";
import { useAppData } from "./hooks/useAppData";
import { useCalculations } from "./hooks/useCalculations";

import { AuthScreen } from "./components/auth/AuthScreen";
import { PlaceholderScreen } from "./components/CommonUI";
import { Dashboard } from "./components/Dashboard";
import { AddClientScreen } from "./components/AddClientScreen";
import { PayScreen } from "./components/PayScreen";
import { ClientMasterRegisterScreen, AllPaymentsRegisterScreen, SearchScreen } from "./components/RegistersAndSearch";
import { LateClientsScreen, MonthlyDuesScreen, DeleteClientScreen } from "./components/FollowUpScreens";
import { TreasuryMainScreen, PartnersScreen, ExpensesScreen, EmployeesMergedScreen, ProfitDistributionScreen } from "./components/treasury";
import { SettingsScreen, ReceiptModal } from "./components/SettingsAndReceipt";

export default function EgymodApp() {
  const [today] = useState(new Date());

  // قراءة وحفظ اختيار اللغة والثيم دائماً في localStorage
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("egymod_lang") || "ar");
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("egymod_theme") || "royalGold");

  const [storeInfo, setStoreInfo] = useState({
    name: "إيجيمود لإدارة الأقساط",
    phone: "01000000000",
    address: "القاهرة - مصر",
    footerNote: "البضاعة المباعة لا تُرد ولا تُستبدل إلا بالعقد الأصلي",
    printType: "thermal"
  });

  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // تحديث محرك الثيمات والترجمة والاتجاه تلقائياً عند تغيير اللغة أو الثيم
  const themeStyles = useMemo(() => getThemeStyles(currentTheme), [currentTheme]);
  const t = useMemo(() => getTranslations(currentLang), [currentLang]);
  const isRTL = useMemo(() => getLangDir(currentLang) === "rtl", [currentLang]);
  const isEN = useMemo(() => currentLang === "en" || t?.lang === "en", [currentLang, t]);

  // حفظ التغيرات في الذاكرة المحلية وتحديث اتجاه المستند تلقائياً
  const changeLang = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem("egymod_lang", lang);
  };

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("egymod_theme", theme);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [isRTL, currentLang]);

  function notify(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  }

  // كائن التنسيقات الكلي المكتمل مع ربط الأشكال الهندسية والظلال ديناميكياً بحسب الثيم
  const styles = useMemo(() => ({
    page: { minHeight: "100vh", background: themeStyles.bg, padding: "24px 16px 60px", fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif", color: themeStyles.text, transition: "all 0.3s ease" },
    container: { maxWidth: 1100, margin: "0 auto" },
    toast: { position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: "#213526", border: `${themeStyles.borderWidth || "1px"} solid #3d6b4a`, color: "#bfe8cd", padding: "10px 18px", borderRadius: themeStyles.borderRadius || 12, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, zIndex: 50, boxShadow: themeStyles.boxShadow || "none" },
    toastError: { background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb" },
    dashHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${themeStyles.accentGold} 0%, ${themeStyles.accent} 100%)`, borderRadius: themeStyles.borderRadius || 18, padding: "18px 24px", marginBottom: 20, boxShadow: themeStyles.boxShadow || "none" },
    adminBadge: { background: themeStyles.inputBg, color: themeStyles.accentGold, fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: themeStyles.borderRadius || 10, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` },
    dashTitle: { fontSize: 22, fontWeight: 800, color: "#111111" },
    dashSub: { fontSize: 12.5, color: "#333333", marginTop: 2 },
    calcIcon: { width: 44, height: 44, borderRadius: themeStyles.borderRadius || 12, background: themeStyles.inputBg, display: "flex", alignItems: "center", justifyContent: "center", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` },
    kpiRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 20 },
    kpiCard: { background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || "16px", padding: "20px 20px", boxShadow: themeStyles.boxShadow || "none" },
    kpiValue: { fontSize: 24, fontWeight: 800, color: themeStyles.text, fontVariantNumeric: "tabular-nums" },
    kpiLabel: { fontSize: 13.5, color: themeStyles.accentGold, fontWeight: 700, marginTop: 8 },
    kpiSub: { fontSize: 11.5, color: themeStyles.subText, marginTop: 4 },
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
    subHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
    backBtn: { display: "flex", alignItems: "center", gap: 6, background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, color: themeStyles.accentGold, padding: "9px 16px", borderRadius: themeStyles.borderRadius || 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, boxShadow: themeStyles.buttonShadow || "none" },
    topCloseBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: themeStyles.borderRadius || 10, background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, cursor: "pointer", color: themeStyles.accentGold },
    subTitle: { fontSize: 19, fontWeight: 800, color: themeStyles.accentGold },
    card: { background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || "18px", padding: 22, boxShadow: themeStyles.boxShadow || "none" },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
    fieldLabel: { fontSize: 13.5, color: themeStyles.subText, fontWeight: 700, display: "block", marginBottom: 6 },
    input: { width: "100%", background: themeStyles.inputBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 10, padding: "12px 14px", color: themeStyles.text, fontFamily: "inherit", fontSize: 15, outline: "none", boxShadow: themeStyles.inputShadow || "none" },
    sectionLabel: { gridColumn: "1 / -1", fontSize: 13.5, fontWeight: 800, color: themeStyles.accent, marginTop: 12, paddingBottom: 8, borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` },
    liveBox: { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, background: themeStyles.highlightBg, border: `1px dashed ${themeStyles.accent}`, borderRadius: themeStyles.borderRadius || 12, padding: 14, margin: "6px 0" },
    saveBtn: { gridColumn: "1 / -1", background: `linear-gradient(145deg, ${themeStyles.accentGold}, ${themeStyles.accent})`, color: "#111111", border: "none", borderRadius: themeStyles.borderRadius || 12, padding: "14px 20px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 8, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: themeStyles.buttonShadow || "none" },
    errorBox: { background: "rgba(224,122,95,0.12)", border: "1px solid rgba(224,122,95,0.5)", color: "#e8a996", borderRadius: themeStyles.borderRadius || 10, padding: "12px 14px", fontSize: 14, marginBottom: 16 },
    emptyState: { textAlign: "center", color: themeStyles.subText, padding: "30px 10px", fontSize: 15 },
    historyTitle: { fontSize: 16, fontWeight: 800, color: themeStyles.accentGold, marginTop: 22, marginBottom: 16, paddingTop: 16, borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` },
    profileBox: { marginTop: 16, paddingTop: 16, borderTop: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}` },
    suggestBox: { position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, background: themeStyles.card, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, borderRadius: themeStyles.borderRadius || 10, overflow: "hidden", zIndex: 30, boxShadow: themeStyles.boxShadow || "0 12px 30px rgba(0,0,0,0.5)", maxHeight: 260, overflowY: "auto" },
    suggestItem: { display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", textAlign: "right", background: "transparent", border: "none", borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, padding: "12px 14px", cursor: "pointer", fontFamily: "inherit" },
    suggestLabel: { fontSize: 14.5, fontWeight: 800, color: themeStyles.text },
    suggestSecondary: { fontSize: 12.5, color: themeStyles.subText, marginTop: 4 },
    selectedChip: { display: "flex", alignItems: "center", justifyContent: "space-between", background: themeStyles.highlightBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.accent}`, borderRadius: themeStyles.borderRadius || 10, padding: "12px 14px", color: themeStyles.accentGold, fontWeight: 800, fontSize: 14.5 },
    selectedChipX: { background: "transparent", border: "none", color: themeStyles.subText, cursor: "pointer", display: "flex", alignItems: "center" }
  }), [themeStyles]);

  // تمرير t لكستوم هوك الأصالة والتنقل
  const auth = useAuth(null, null, notify, t);
  const appData = useAppData(auth.currentUser, notify);
  const { rows, lateRows, totals } = useCalculations(appData.clients, appData.expenses, appData.salaryLog, appData.distributionsLog, today);

  const canAccessScreen = (screenKey) => {
    if (!auth.currentUser) return false;
    if (!auth.currentUser.isSubUser || auth.currentUser.role === "admin") return true;
    if (screenKey === "dashboard") return true;
    return Array.isArray(auth.currentUser.permissions) && auth.currentUser.permissions.includes(screenKey);
  };

  const handleNavigate = (targetScreen) => {
    if (canAccessScreen(targetScreen)) {
      setScreen(targetScreen);
    } else {
      notify(t.noPermissionNotice || (isEN ? "Sorry, you do not have permission to access this screen!" : "عفواً، ليس لديك صلاحية للدخول إلى هذه الشاشة!"), "error");
    }
  };

  if (!auth.currentUser) {
    return <AuthScreen {...auth} t={t} styles={styles} themeStyles={themeStyles} isRTL={isRTL} toast={toast} />;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${themeStyles.inputBg}; }
        ::-webkit-scrollbar-thumb { background: ${themeStyles.accent}; border-radius: 4px; }
      `}</style>

      {toast && (
        <div style={{ ...styles.toast, ...(toast.kind === "error" ? styles.toastError : {}) }}>
          {toast.kind === "error" ? <X size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {screen === "dashboard" && (
        <Dashboard
          totals={totals}
          lateCount={lateRows.length}
          onNavigate={handleNavigate}
          user={auth.currentUser}
          onLogout={() => {
            appData.clearAllData();
            auth.handleLogout();
          }}
          currentLang={currentLang}
          setCurrentLang={changeLang}
          currentTheme={currentTheme}
          setCurrentTheme={changeTheme}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "pay" && (
        <PayScreen
          rows={rows}
          payments={appData.payments}
          employees={appData.employees}
          onPay={appData.recordPayment}
          onDeletePayment={appData.deletePayment}
          onShowReceipt={(client, payment) => setActiveReceipt({ client, payment })}
          onOpenAllPayments={() => handleNavigate("allPaymentsRegister")}
          onBack={() => handleNavigate("dashboard")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "addClient" && (
        <AddClientScreen
          onSave={async (d) => {
            const ok = await appData.addClient(d);
            if (ok) setScreen("dashboard");
          }}
          onBack={() => handleNavigate("dashboard")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "search" && (
        <SearchScreen
          rows={rows}
          storeInfo={storeInfo}
          onUpdateClient={appData.updateClient}
          onOpenMasterRegister={() => handleNavigate("allClientsRegister")}
          onBack={() => handleNavigate("dashboard")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "allClientsRegister" && (
        <ClientMasterRegisterScreen
          rows={rows}
          storeInfo={storeInfo}
          onBack={() => handleNavigate("search")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "allPaymentsRegister" && (
        <AllPaymentsRegisterScreen
          payments={appData.payments}
          storeInfo={storeInfo}
          onBack={() => handleNavigate("pay")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "treasury" && (
        <TreasuryMainScreen
          partners={appData.partners}
          expenses={appData.expenses}
          salaryLog={appData.salaryLog}
          totals={totals}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate("dashboard")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "treasuryPartners" && (
        <PartnersScreen
          partners={appData.partners}
          onAddPartner={(n, c, j) => appData.addPartner(n, c, j, totals.totalProfit)}
          capitalMoves={appData.capitalMoves}
          onAddCapitalIncrease={appData.addCapitalIncrease}
          withdrawalsLog={appData.withdrawalsLog}
          setWithdrawalsLog={appData.handleSetWithdrawalsLog}
          onSettlePartner={appData.settleAndRemovePartner}
          onBack={() => handleNavigate("treasury")}
          notify={notify} t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "treasuryExpenses" && (
        <ExpensesScreen
          expenses={appData.expenses}
          setExpenses={appData.handleSetExpenses}
          onBack={() => handleNavigate("treasury")}
          notify={notify} t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "treasuryEmployees" && (
        <EmployeesMergedScreen
          employees={appData.employees}
          setEmployees={appData.handleSetEmployees}
          salaryLog={appData.salaryLog}
          setSalaryLog={appData.handleSetSalaryLog}
          onBack={() => handleNavigate("treasury")}
          notify={notify} t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "treasuryDistribute" && (
        <ProfitDistributionScreen
          partners={appData.partners}
          setPartners={appData.handleSetPartners}
          capitalMoves={appData.capitalMoves}
          expenses={appData.expenses}
          setExpenses={appData.handleSetExpenses}
          salaryLog={appData.salaryLog}
          setSalaryLog={appData.handleSetSalaryLog}
          withdrawalsLog={appData.withdrawalsLog}
          setWithdrawalsLog={appData.handleSetWithdrawalsLog}
          distributionsLog={appData.distributionsLog}
          setDistributionsLog={appData.handleSetDistributionsLog}
          totals={totals}
          onBack={() => handleNavigate("treasury")}
          notify={notify} t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "monthlyDues" && (
        <MonthlyDuesScreen
          rows={rows}
          payments={appData.payments}
          onBack={() => handleNavigate("dashboard")}
          onPay={appData.recordPayment}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "deleteClient" && (
        <DeleteClientScreen
          clients={appData.clients}
          onMoveToTrash={appData.handleMoveToTrash}
          onRestoreClient={appData.handleRestoreClient}
          onPermanentDelete={appData.handlePermanentDeleteClient}
          onBack={() => handleNavigate("dashboard")}
          notify={notify} t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "lateClients" && (
        <LateClientsScreen
          rows={lateRows}
          onBack={() => handleNavigate("dashboard")}
          onPay={appData.recordPayment}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          currentLang={currentLang}
          setCurrentLang={changeLang}
          currentTheme={currentTheme}
          setCurrentTheme={changeTheme}
          storeInfo={storeInfo}
          setStoreInfo={setStoreInfo}
          appUsers={appData.appUsers}
          setAppUsers={appData.setAppUsers}
          onCreateEmployeeAccount={appData.createEmployeeAccount}
          employees={appData.employees}
          onBack={() => handleNavigate("dashboard")}
          notify={notify} t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {screen === "backup" && (
        <PlaceholderScreen
          title={t.backup || (isEN ? "Cloud Backup" : "النسخ الاحتياطي السحابي")}
          note={t.cloudConnectedNote || (isEN ? "System connected to Supabase database successfully." : "تم ربط النظام بقاعدة بيانات Supabase بنجاح.")}
          onBack={() => handleNavigate("dashboard")}
          t={t} styles={styles} themeStyles={themeStyles}
        />
      )}

      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          storeInfo={storeInfo}
          onClose={() => setActiveReceipt(null)}
          themeStyles={themeStyles}
          t={t}
        />
      )}
    </div>
  );
}
