import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, Wallet, CreditCard, UserCog, TrendingUp, Users, Loader2 } from "lucide-react";
import { fetchTreasurySummaryData } from "../../services/treasuryService";

export function TreasuryMainScreen({ onNavigate, onBack, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    partners: [],
    expenses: [],
    salaryLog: [],
    installments: []
  });

  // جلب البيانات فور تحميل الشاشة
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetchTreasurySummaryData();
        if (isMounted) setData(res);
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل بيانات الخزينة:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // الحسابات المحاسبية المباشرة للمؤشرات الأربعة
  const totals = useMemo(() => {
    // 1. إجمالي رأس مال الشركة الفعلي
    const totalCapital = data.partners.reduce((sum, p) => sum + Number(p.capital || 0), 0);

    // 2. إجمالي المصروفات الغير مسواة
    const totalExpenses = data.expenses
      .filter((e) => !e.is_settled)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // 3. إجمالي رواتب وسلف الموظفين الغير مسواة
    const totalSalaries = data.salaryLog
      .filter((s) => !s.is_settled)
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);

    // 4. أرباح الأقساط المحصلة فعلياً
    const totalCollectedProfits = data.installments.reduce((sum, inst) => sum + Number(inst.profit_share || 0), 0);

    // صافي الربح القابل للتوزيع
    const netProfit = Math.max(0, totalCollectedProfits - totalExpenses - totalSalaries);

    return { totalCapital, totalExpenses, totalSalaries, netProfit };
  }, [data]);

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "16px", fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
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
            border: `1px solid ${themeStyles.border || "#333333"}`,
            color: themeStyles.accentGold || "#e8cd9c",
            padding: "8px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13px"
          }}
        >
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
          {t.back || (isEN ? "Back" : "رجوع")}
        </button>

        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          {t.treasuryTitle || (isEN ? "Profit Distribution & Treasury" : "توزيع الأرباح والخزينة")}
        </h2>

        <button
          type="button"
          onClick={onBack}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: themeStyles.card || "#1e1e1e",
            border: `1px solid ${themeStyles.border || "#333333"}`,
            color: themeStyles.subText || "#aaaaaa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "40px", color: themeStyles.accentGold || "#e8cd9c" }}>
          <Loader2 size={24} className="animate-spin" /> جاري تحميل بيانات الخزينة من السحابة...
        </div>
      ) : (
        <>
          {/* KPI CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "22px" }}>
            {/* CARD 1: CAPITAL */}
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <Wallet size={22} style={{ color: themeStyles.accentGold || "#e8cd9c" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {totals.totalCapital.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#aaa" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "6px" }}>
                إجمالي رأس مال الشركة الفعلي
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                صافي مستحقات كل الشركاء
              </div>
            </div>

            {/* CARD 2: EXPENSES */}
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <CreditCard size={22} style={{ color: themeStyles.accentGold || "#e8cd9c" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {totals.totalExpenses.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#aaa" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "6px" }}>
                إجمالي المصروفات
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                كل المصروفات المسجلة
              </div>
            </div>

            {/* CARD 3: SALARIES */}
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <UserCog size={22} style={{ color: themeStyles.accentGold || "#e8cd9c" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {totals.totalSalaries.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#aaa" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "6px" }}>
                إجمالي رواتب وسلف الموظفين
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                كل حركات الرواتب المسجلة
              </div>
            </div>

            {/* CARD 4: NET PROFIT */}
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <TrendingUp size={22} style={{ color: themeStyles.accentGold || "#e8cd9c" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", fontVariantNumeric: "tabular-nums" }}>
                {totals.netProfit.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#aaa" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "6px" }}>
                صافي الربح القابل للتوزيع
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaaaaa", marginTop: "4px" }}>
                أرباح التحصيلات - المصروفات - الرواتب
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION BUTTONS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("treasuryPartners")}
              style={{
                background: "linear-gradient(135deg, #d69a5f, #7a4a1f)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                padding: "20px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>الشركاء ورأس المال</span>
              <Users size={22} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate("treasuryDistribute")}
              style={{
                background: "linear-gradient(135deg, #8a3a2d, #4a1d17)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                padding: "20px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>توزيع الأرباح</span>
              <Wallet size={22} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate("treasuryExpenses")}
              style={{
                background: "linear-gradient(135deg, #d69a5f, #8a5a2d)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                padding: "20px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>المصروفات العامة</span>
              <CreditCard size={22} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate("treasuryEmployees")}
              style={{
                background: themeStyles.card || "#1e1e1e",
                border: `1px solid ${themeStyles.border || "#333333"}`,
                color: themeStyles.accentGold || "#e8cd9c",
                borderRadius: "14px",
                padding: "20px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>شؤون الموظفين والرواتب</span>
              <UserCog size={22} />
            </button>
          </div>

          {/* BOTTOM EXIT BUTTON */}
          <button
            type="button"
            onClick={onBack}
            style={{
              width: "100%",
              background: themeStyles.card || "#1e1e1e",
              border: `1px solid ${themeStyles.border || "#333333"}`,
              color: themeStyles.accentGold || "#e8cd9c",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
            {t.exitBottom || (isEN ? "Exit to Main Screen" : "خروج والعودة للشاشة الرئيسية")}
          </button>
        </>
      )}
    </div>
  );
}

export default TreasuryMainScreen;
