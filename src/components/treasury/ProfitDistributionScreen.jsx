import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, FileText, Wallet, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function ProfitDistributionScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // البيانات من السحابة
  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryLog, setSalaryLog] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [distributionsLog, setDistributionsLog] = useState([]);
  const [withdrawalsLog, setWithdrawalsLog] = useState([]);

  // الفلترة بالتاريخ والقرارات
  const [periodFilter, setPeriodFilter] = useState("all");
  const [fromDate, setFromDate] = useState(() => "2026-07-01");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [customDistributeAmount, setCustomDistributeAmount] = useState("");
  const [partnerDecisions, setPartnerDecisions] = useState({});
  const [showAllWithdrawalsModal, setShowAllWithdrawalsModal] = useState(false);

  // جلب كافة البيانات من قاعدة البيانات
  const loadDistributionData = async () => {
    try {
      setLoading(true);
      const [
        { data: pData },
        { data: eData },
        { data: sData },
        { data: cData },
        { data: iData },
        { data: dData },
        { data: wData }
      ] = await Promise.all([
        supabase.from("partners").select("*").order("id", { ascending: true }),
        supabase.from("expenses").select("*").order("date", { ascending: false }),
        supabase.from("salary_log").select("*").order("date", { ascending: false }),
        supabase.from("contracts").select("*"),
        supabase.from("installments").select("*"),
        supabase.from("distributions_log").select("*").order("date", { ascending: false }),
        supabase.from("withdrawals_log").select("*").order("date", { ascending: false })
      ]);

      setPartners(pData || []);
      setExpenses(eData || []);
      setSalaryLog(sData || []);
      setContracts(cData || []);
      setInstallments(iData || []);
      setDistributionsLog(dData || []);
      setWithdrawalsLog(wData || []);
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات التوزيع:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributionData();
  }, []);

  // تحديد الفترات الزمانية السريعة
  const setPresetPeriod = (preset) => {
    setPeriodFilter(preset);
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    if (preset === "currentMonth") {
      setFromDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`);
      setToDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    } else if (preset === "lastMonth") {
      const prevM = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const endPrevM = new Date(d.getFullYear(), d.getMonth(), 0);
      setFromDate(`${prevM.getFullYear()}-${pad(prevM.getMonth() + 1)}-01`);
      setToDate(`${endPrevM.getFullYear()}-${pad(endPrevM.getMonth() + 1)}-${pad(endPrevM.getDate())}`);
    } else if (preset === "twoMonths") {
      const prev2M = new Date(d.getFullYear(), d.getMonth() - 2, 1);
      setFromDate(`${prev2M.getFullYear()}-${pad(prev2M.getMonth() + 1)}-01`);
      setToDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    }
  };

  // الحسابات المالية الدقيقة المطابقة تماماً للشاشة الرئيسية
  const filteredPeriodData = useMemo(() => {
    const cleanFrom = fromDate || "";
    const cleanTo = toDate || "";

    // 1. المصروفات والرواتب غير المسواة بداخل الفترة
    const periodExpenses = expenses
      .filter((e) => !e.is_settled && (!cleanFrom || e.date >= cleanFrom) && (!cleanTo || e.date <= cleanTo))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const periodSalaries = salaryLog
      .filter((s) => !s.is_settled && (!cleanFrom || s.date >= cleanFrom) && (!cleanTo || s.date <= cleanTo))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);

    // 2. إجمالي المصروفات والرواتب التي تم تسويتها في توزيعات سابقة
    const settledExpenses = expenses
      .filter((e) => e.is_settled)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const settledSalaries = salaryLog
      .filter((s) => s.is_settled)
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);

    // 3. إجمالي أرباح العقود والتحصيلات الخام
    const rawProfitPool = (contracts || []).reduce((acc, curr) => {
      const sale = Number(curr.sale_price ?? curr.salePrice ?? curr.sale ?? 0);
      const cost = Number(curr.cost_price ?? curr.costPrice ?? curr.cost ?? 0);
      const down = Number(curr.down_payment ?? curr.downPayment ?? curr.down ?? 0);

      const instArr = Array.isArray(installments) 
        ? installments.filter((i) => String(i.contract_id) === String(curr.id))
        : [];
      
      const totalPaidInst = instArr
        .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);

      if (sale <= 0) return acc;
      return acc + Math.round((down + totalPaidInst) * ((sale - cost) / sale));
    }, 0);

    // 4. إجمالي التوزيعات النقدية السابقة للشركاء
    const totalDistributedSoFar = distributionsLog.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // 5. إجمالي الأرباح المحصلة المتبقية (الخام - التوزيعات - المصروفات والرواتب المسواة)
    const activeProfitPool = Math.max(0, rawProfitPool - totalDistributedSoFar - settledExpenses - settledSalaries);

    // 6. الصافي القابل للتوزيع بعد خصم المصروفات والرواتب الحالية غير المسواة
    const netPeriodProfit = Math.max(0, activeProfitPool - periodExpenses - periodSalaries);

    return {
      periodExpenses: Math.round(periodExpenses),
      periodSalaries: Math.round(periodSalaries),
      netPeriodProfit: Math.round(netPeriodProfit),
      totalProfitPool: Math.round(activeProfitPool)
    };
  }, [contracts, installments, expenses, salaryLog, distributionsLog, fromDate, toDate]);

  const autoAmount = customDistributeAmount !== "" ? Math.round(parseFloat(customDistributeAmount) || 0) : filteredPeriodData.netPeriodProfit;

  const totalCapitalSum = useMemo(() => {
    return partners.reduce((sum, p) => sum + Number(p.capital || 0), 0);
  }, [partners]);

  // حساب أنصبة الشركاء والمسحوبات والسلف
  const partnersCalculated = useMemo(() => {
    return partners.map((p) => {
      const pLogs = withdrawalsLog.filter((w) => String(w.partner_id) === String(p.id));
      const unsettleAdvance = pLogs
        .filter((w) => !w.is_settled)
        .reduce((sum, w) => sum + (Number(w.amount || 0) - Number(w.settled_amount || 0)), 0);

      const sharePct = totalCapitalSum > 0 ? (Number(p.capital || 0) / totalCapitalSum) * 100 : 0;
      const shareAmount = Math.round(autoAmount * (sharePct / 100));

      const recoveredFromAdvance = Math.min(shareAmount, unsettleAdvance);
      const netPartnerProfit = Math.max(0, shareAmount - recoveredFromAdvance);

      const previousWithdrawals = Number(p.total_withdrawn_profits || 0);

      return {
        ...p,
        currentCapital: Number(p.capital || 0),
        sharePct: Math.round(sharePct),
        shareAmount,
        previousWithdrawals,
        unsettleAdvance: Math.round(unsettleAdvance),
        recoveredFromAdvance: Math.round(recoveredFromAdvance),
        netPartnerProfit
      };
    });
  }, [partners, withdrawalsLog, totalCapitalSum, autoAmount]);

  // المعاينة الحية للنسبة ورأس المال بعد اتخاذ القرار
  const dynamicPreview = useMemo(() => {
    let newTotalCapital = 0;
    const previews = partnersCalculated.map((p) => {
      const decision = partnerDecisions[p.id] || "withdraw";
      const actualShare = decision === "reinvest" ? p.currentCapital + p.netPartnerProfit : p.currentCapital;
      newTotalCapital += actualShare;
      return { id: p.id, actualShare, decision };
    });

    const result = {};
    previews.forEach((p) => {
      result[p.id] = {
        actualShare: p.actualShare,
        newPercentage: newTotalCapital > 0 ? Math.round((p.actualShare / newTotalCapital) * 100) : 0
      };
    });
    return result;
  }, [partnersCalculated, partnerDecisions]);

  // تنفيذ عملية التوزيع السحابية
  const handleExecuteDistribution = async () => {
    if (autoAmount <= 0 || partners.length === 0) return;

    try {
      setExecuting(true);
      const distDate = new Date().toISOString().split("T")[0];

      // 1) تسوية سلف الشركاء
      for (const p of partnersCalculated) {
        if (p.recoveredFromAdvance > 0) {
          let remainingToRecover = p.recoveredFromAdvance;
          const pAdvances = withdrawalsLog.filter((w) => String(w.partner_id) === String(p.id) && !w.is_settled);

          for (const w of pAdvances) {
            if (remainingToRecover <= 0) break;
            const outstanding = Number(w.amount || 0) - Number(w.settled_amount || 0);
            const applied = Math.min(outstanding, remainingToRecover);
            remainingToRecover -= applied;

            const newSettledAmount = Number(w.settled_amount || 0) + applied;
            const isSettledNow = newSettledAmount >= Number(w.amount || 0);

            await supabase
              .from("withdrawals_log")
              .update({ settled_amount: newSettledAmount, is_settled: isSettledNow })
              .eq("id", w.id);
          }
        }
      }

      // 2) تحديث حسابات الشركاء ورأس المال
      const partnerResults = [];
      for (const p of partnersCalculated) {
        const decision = partnerDecisions[p.id] || "withdraw";

        if (decision === "reinvest") {
          const newCapital = p.currentCapital + p.netPartnerProfit;
          await supabase.from("partners").update({ capital: newCapital }).eq("id", p.id);
          await supabase.from("capital_moves").insert([{
            partner_id: p.id,
            partner_name: p.name,
            type: "increase",
            amount: p.netPartnerProfit,
            date: distDate,
            notes: "إعادة استثمار أرباح (تلقائي)"
          }]);
        } else {
          const newWithdrawn = p.previousWithdrawals + p.netPartnerProfit;
          await supabase.from("partners").update({ total_withdrawn_profits: newWithdrawn }).eq("id", p.id);

          // 💡 حفظ عملية السحب بالسجل السحابي لتظهر في النافذة
          if (p.netPartnerProfit > 0) {
            await supabase.from("withdrawals_log").insert([{
              partner_id: p.id,
              partner_name: p.name,
              amount: p.netPartnerProfit,
              date: distDate,
              notes: "سحب أرباح دورية (من التوزيع)",
              is_settled: true,
              settled_amount: p.netPartnerProfit
            }]);
          }
        }

        partnerResults.push({
          partnerId: p.id,
          partnerName: p.name,
          capitalAtTime: p.currentCapital,
          previousWithdrawals: p.previousWithdrawals,
          advanceDeducted: p.recoveredFromAdvance,
          shareAmount: p.shareAmount,
          netProfit: p.netPartnerProfit,
          decision,
          actualShare: dynamicPreview[p.id]?.actualShare || p.currentCapital,
          newPercentage: dynamicPreview[p.id]?.newPercentage || 0
        });
      }

      // 3) تسوية المصروفات والرواتب
      await supabase.from("expenses").update({ is_settled: true }).eq("is_settled", false);
      await supabase.from("salary_log").update({ is_settled: true }).eq("is_settled", false);

      // 4) أرشفة الحركة بالسجل
      await supabase.from("distributions_log").insert([{
        date: distDate,
        period_from: fromDate,
        period_to: toDate,
        amount: autoAmount,
        details: partnerResults.map((p) => `${p.partnerName}: ${p.decision === 'reinvest' ? 'إضافة لرأس المال' : 'سحب الأرباح'} (${p.netProfit.toLocaleString()})`).join(" | "),
        partner_results: partnerResults
      }]);

      setCustomDistributeAmount("");
      setPartnerDecisions({});
      await loadDistributionData();
      alert("تم تنفيذ عملية توزيع الأرباح وتسوية السلف سحابياً بنجاح!");
    } catch (err) {
      console.error("❌ خطأ أثناء تنفيذ التوزيع:", err);
      alert("حدث خطأ أثناء التوزيع: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "16px", fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* الشريط العلوي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, color: themeStyles.accentGold || "#d69a5f", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
          <span>رجوع</span>
        </button>

        <h2 style={{ color: themeStyles.accentGold || "#d69a5f", margin: 0, fontSize: "20px", fontWeight: 800 }}>توزيع الأرباح على الشركاء</h2>

        <button type="button" onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, color: themeStyles.subText || "#888888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {/* 1. إجمالي الأرباح المحصلة */}
      <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "13px", color: themeStyles.subText || "#888888" }}>إجمالي الأرباح المحصلة حتى اليوم (قبل الخصم)</div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: "4px" }}>
          {filteredPeriodData.totalProfitPool.toLocaleString()} ج.م
        </div>
      </div>

      {/* 2. تحديد الفترة والخصومات */}
      <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginBottom: "10px" }}>حدد الفترة التي تريد حساب أرباحها</div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
          <button type="button" onClick={() => setPresetPeriod("currentMonth")} style={{ background: periodFilter === "currentMonth" ? "#d69a5f" : themeStyles.inputBg || "#1a1a1a", color: periodFilter === "currentMonth" ? "#000" : themeStyles.subText || "#888888", border: `1px solid ${themeStyles.border || "#333333"}`, padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>الشهر الحالي</button>
          <button type="button" onClick={() => setPresetPeriod("lastMonth")} style={{ background: periodFilter === "lastMonth" ? "#d69a5f" : themeStyles.inputBg || "#1a1a1a", color: periodFilter === "lastMonth" ? "#000" : themeStyles.subText || "#888888", border: `1px solid ${themeStyles.border || "#333333"}`, padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>الشهر السابق</button>
          <button type="button" onClick={() => setPresetPeriod("twoMonths")} style={{ background: periodFilter === "twoMonths" ? "#d69a5f" : themeStyles.inputBg || "#1a1a1a", color: periodFilter === "twoMonths" ? "#000" : themeStyles.subText || "#888888", border: `1px solid ${themeStyles.border || "#333333"}`, padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>منذ شهرين</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: themeStyles.subText || "#888888", marginBottom: "4px" }}>من تاريخ</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "8px", padding: "8px 10px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "13px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: themeStyles.subText || "#888888", marginBottom: "4px" }}>إلى تاريخ</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "8px", padding: "8px 10px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "13px", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", background: themeStyles.inputBg || "#1a1a1a", border: "1px dashed #d69a5f88", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>المصروفات بالفترة</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#f87171" }}>{filteredPeriodData.periodExpenses.toLocaleString()} ج.م</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>الرواتب بالفترة</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#f87171" }}>{filteredPeriodData.periodSalaries.toLocaleString()} ج.م</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>الصافي القابل للتوزيع</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>{filteredPeriodData.netPeriodProfit.toLocaleString()} ج.م</div>
          </div>
        </div>
      </div>

      {/* 3. المبلغ المراد توزيعه فعلياً */}
      <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>المبلغ المراد توزيعه فعلياً (قابل للتعديل يدوياً)</label>
        <input
          type="number"
          step="1"
          value={customDistributeAmount !== "" ? customDistributeAmount : filteredPeriodData.netPeriodProfit}
          onChange={(e) => setCustomDistributeAmount(e.target.value)}
          placeholder="0"
          style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.accentGold || "#d69a5f", outline: "none", fontSize: "18px", fontWeight: 800, boxSizing: "border-box" }}
        />
      </div>

      {/* 4. جدول توزيع الأرباح والسلف الموحد */}
      <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginBottom: "12px" }}>جدول توزيع الأرباح والسلف الموحد</div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: themeStyles.accentGold || "#d69a5f" }}>
            <Loader2 size={24} className="animate-spin" /> جاري تحميل البيانات...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "12px", whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#1a1a1a", color: themeStyles.accentGold || "#d69a5f", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>اسم الشريك</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>رأس المال الحالي</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>مسحوباته السابقة</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>سلفة قائمة</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>نصيبه من التوزيع</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>النصيب الفعلي</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>النسبة اللحظية</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>الصافي</th>
                  <th style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, textAlign: "center" }}>قرار الشريك</th>
                </tr>
              </thead>
              <tbody>
                {partnersCalculated.map((p) => {
                  const currentDec = partnerDecisions[p.id] || "withdraw";
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800 }}>{p.name}</td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}` }}>{p.currentCapital.toLocaleString()} ج.م</td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, color: themeStyles.subText || "#888888" }}>{p.previousWithdrawals.toLocaleString()} ج.م</td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, color: "#f87171", fontWeight: 700 }}>{p.unsettleAdvance.toLocaleString()} ج.م</td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800 }}>{p.shareAmount.toLocaleString()} ج.م</td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>
                        {(dynamicPreview[p.id]?.actualShare || p.currentCapital).toLocaleString()} ج.م
                      </td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800 }}>
                        {dynamicPreview[p.id]?.newPercentage || 0}%
                      </td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800, color: "#4ade80" }}>
                        {p.netPartnerProfit.toLocaleString()} ج.م
                      </td>
                      <td style={{ padding: "8px", border: `1px solid ${themeStyles.border || "#262626"}`, textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "8px", background: themeStyles.inputBg || "#1a1a1a", padding: "4px 8px", borderRadius: "6px", border: `1px solid ${themeStyles.border || "#333333"}` }}>
                          <label style={{ cursor: "pointer", fontSize: "11px", fontWeight: 800, color: currentDec === "withdraw" ? "#f87171" : themeStyles.subText || "#888888" }}>
                            <input type="radio" name={`dec_${p.id}`} checked={currentDec === "withdraw"} onChange={() => setPartnerDecisions({ ...partnerDecisions, [p.id]: "withdraw" })} /> سحب الأرباح
                          </label>
                          <label style={{ cursor: "pointer", fontSize: "11px", fontWeight: 800, color: currentDec === "reinvest" ? "#4ade80" : themeStyles.subText || "#888888" }}>
                            <input type="radio" name={`dec_${p.id}`} checked={currentDec === "reinvest"} onChange={() => setPartnerDecisions({ ...partnerDecisions, [p.id]: "reinvest" })} /> إضافة لرأس المال
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleExecuteDistribution}
            disabled={executing || autoAmount <= 0}
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #d69a5f, #b06a35)",
              color: "#000000",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "15px",
              fontWeight: 800,
              cursor: executing || autoAmount <= 0 ? "not-allowed" : "pointer",
              opacity: executing || autoAmount <= 0 ? 0.6 : 1
            }}
          >
            {executing ? "جاري تنفيذ التوزيع..." : "تنفيذ التوزيع على كل الشركاء"}
          </button>

          <button
            type="button"
            onClick={() => setShowAllWithdrawalsModal(true)}
            style={{
              flex: 1,
              background: themeStyles.inputBg || "#1a1a1a",
              border: `1px solid ${themeStyles.border || "#333333"}`,
              color: themeStyles.accentGold || "#d69a5f",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "13.5px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <FileText size={16} />
            <span>جميع سجلات السحوبات</span>
          </button>
        </div>
      </div>

      {/* 📜 نافذة جميع سجلات السحوبات والسلف */}
      {showAllWithdrawalsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 700, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: themeStyles.accentGold || "#d69a5f" }}>سجل جميع السحوبات والسلف للشركاء</span>
              <X style={{ cursor: "pointer", color: themeStyles.subText || "#888888" }} onClick={() => setShowAllWithdrawalsModal(false)} />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: themeStyles.inputBg || "#1a1a1a", color: themeStyles.accentGold || "#d69a5f", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                    <th style={{ padding: "10px" }}>التاريخ</th>
                    <th style={{ padding: "10px" }}>الشريك</th>
                    <th style={{ padding: "10px" }}>المبلغ</th>
                    <th style={{ padding: "10px" }}>البيان / السبب</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalsLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: themeStyles.subText || "#888888" }}>لا توجد سجلات سحوبات مسجلة.</td>
                    </tr>
                  ) : (
                    withdrawalsLog.map((w) => (
                      <tr key={w.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                        <td style={{ padding: "10px" }}>{w.date}</td>
                        <td style={{ padding: "10px", fontWeight: 800 }}>{w.partner_name}</td>
                        <td style={{ padding: "10px", fontWeight: 800, color: "#f87171" }}>{Number(w.amount).toLocaleString()} ج.م</td>
                        <td style={{ padding: "10px", color: themeStyles.subText || "#888888" }}>{w.notes || "—"}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: w.is_settled ? "#143820" : "#3e1c24",
                            color: w.is_settled ? "#4ade80" : "#f87171"
                          }}>
                            {w.is_settled ? "تمت التسوية" : "سلفة قائمة"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfitDistributionScreen;
