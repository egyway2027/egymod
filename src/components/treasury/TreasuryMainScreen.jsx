import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, Wallet, CreditCard, UserCog, TrendingUp, Users, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function TreasuryMainScreen({ onNavigate, onBack, t = {}, themeStyles = {} }) {
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    partners: [],
    expenses: [],
    salaryLog: [],
    contracts: [],
    installments: [],
    distributionsLog: []
  });

  // جلب البيانات الشاملة من Supabase بما فيها العقود والأقساط والتوزيعات
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [
          { data: partners },
          { data: expenses },
          { data: salaryLog },
          { data: contracts },
          { data: installments },
          { data: distributionsLog }
        ] = await Promise.all([
          supabase.from("partners").select("*").order("id", { ascending: true }),
          supabase.from("expenses").select("*").order("date", { ascending: false }),
          supabase.from("salary_log").select("*").order("date", { ascending: false }),
          supabase.from("contracts").select("*"),
          supabase.from("installments").select("*"),
          supabase.from("distributions_log").select("*")
        ]);

        if (isMounted) {
          setData({
            partners: partners || [],
            expenses: expenses || [],
            salaryLog: salaryLog || [],
            contracts: contracts || [],
            installments: installments || [],
            distributionsLog: distributionsLog || []
          });
        }
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل بيانات الخزينة:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // الحسابات المحاسبية المطابقة تماماً للشاشة الرئيسية + الخزينة
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

    // 4. أرباح العقود والتحصيلات بنفس معادلة الشاشة الرئيسية المطابقة
    const totalCollectedProfits = (data.contracts || []).reduce((acc, curr) => {
      const sale = Number(curr.sale_price ?? curr.salePrice ?? curr.sale ?? 0);
      const cost = Number(curr.cost_price ?? curr.costPrice ?? curr.cost ?? 0);
      const down = Number(curr.down_payment ?? curr.downPayment ?? curr.down ?? 0);

      const instArr = Array.isArray(data.installments) 
        ? data.installments.filter((i) => String(i.contract_id) === String(curr.id))
        : [];
      
      const totalPaidInst = instArr
        .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);

      if (sale <= 0) return acc;
      return acc + Math.round((down + totalPaidInst) * ((sale - cost) / sale));
    }, 0);

    // 5. إجمالي التوزيعات السابقة لخصمها من الصافي
    const totalDistributedSoFar = (data.distributionsLog || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // صافي الربح القابل للتوزيع (أرباح التحصيلات - المصروفات - الرواتب - التوزيعات السابقة)
    const netProfit = Math.max(0, totalCollectedProfits - totalExpenses - totalSalaries - totalDistributedSoFar);

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
            background: themeStyles.card || "#141414",
            border: `1px solid ${themeStyles.border || "#262626"}`,
            color: themeStyles.accentGold || "#d69a5f",
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

        <h2 style={{ color: themeStyles.accentGold || "#d69a5f", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          {t.treasuryTitle || (isEN ? "Profit Distribution & Treasury" : "توزيع الأرباح والخزينة")}
        </h2>

        <button
          type="button"
          onClick={onBack}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: themeStyles.card || "#141414",
            border: `1px solid ${themeStyles.border || "#262626"}`,
            color: themeStyles.subText || "#888888",
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "40px", color: themeStyles.accentGold || "#d69a5f" }}>
          <Loader2 size={24} className="animate-spin" /> جاري تحميل بيانات الخزينة من السحابة...
        </div>
      ) : (
        <>
          {/* KPI CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "22px" }}>
            {/* CARD 1: NET PROFIT */}
            <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <TrendingUp size={22} style={{ color: themeStyles.accentGold || "#d69a5f" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", fontVariantNumeric: "tabular-nums" }}>
                {totals.netProfit.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#888" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: "6px" }}>
                صافي الربح القابل للتوزيع
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888", marginTop: "4px" }}>
                أرباح التحصيلات - المصروفات - الرواتب
              </div>
            </div>

            {/* CARD 2: SALARIES */}
            <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <UserCog size={22} style={{ color: themeStyles.accentGold || "#d69a5f" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {totals.totalSalaries.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#888" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: "6px" }}>
                إجمالي رواتب وسلف الموظفين
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888", marginTop: "4px" }}>
                كل حركات الرواتب المسجلة
              </div>
            </div>

            {/* CARD 3: EXPENSES */}
            <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <CreditCard size={22} style={{ color: themeStyles.accentGold || "#d69a5f" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {totals.totalExpenses.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#888" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: "6px" }}>
                إجمالي المصروفات
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888", marginTop: "4px" }}>
                كل المصروفات المسجلة
              </div>
            </div>

            {/* CARD 4: CAPITAL */}
            <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <Wallet size={22} style={{ color: themeStyles.accentGold || "#d69a5f" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: themeStyles.text || "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {totals.totalCapital.toLocaleString()} <span style={{ fontSize: "12px", color: themeStyles.subText || "#888" }}>ج.م</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: "6px" }}>
                إجمالي رأس مال الشركة الفعلي
              </div>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888", marginTop: "4px" }}>
                صافي مستحقات كل الشركاء
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION BUTTONS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
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
                background: themeStyles.card || "#141414",
                border: `1px solid ${themeStyles.border || "#262626"}`,
                color: themeStyles.accentGold || "#d69a5f",
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
              background: themeStyles.card || "#141414",
              border: `1px solid ${themeStyles.border || "#262626"}`,
              color: themeStyles.accentGold || "#d69a5f",
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
