import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function ProfitDistributionScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryLog, setSalaryLog] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [distributionsLog, setDistributionsLog] = useState([]);

  const [partnerDecisions, setPartnerDecisions] = useState({});
  const [customDistributeAmount, setCustomDistributeAmount] = useState("");

  const loadDistributionData = async () => {
    try {
      setLoading(true);
      const [
        { data: pData },
        { data: eData },
        { data: sData },
        { data: iData },
        { data: dData }
      ] = await Promise.all([
        supabase.from("partners").select("*"),
        supabase.from("expenses").select("*").eq("is_settled", false),
        supabase.from("salary_log").select("*").eq("is_settled", false),
        supabase.from("installments").select("profit_share"),
        supabase.from("distributions_log").select("*").order("date", { ascending: false })
      ]);

      setPartners(pData || []);
      setExpenses(eData || []);
      setSalaryLog(sData || []);
      setInstallments(iData || []);
      setDistributionsLog(dData || []);
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات التوزيع:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributionData();
  }, []);

  // حساب الأرباح والمصروفات غير المسواة
  const financialSummary = useMemo(() => {
    const totalCollectedProfits = installments.reduce((sum, inst) => sum + Number(inst.profit_share || 0), 0);
    const totalUnsettledExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalUnsettledSalaries = salaryLog.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalDistributedSoFar = distributionsLog.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const netDistributableProfit = Math.max(0, totalCollectedProfits - totalUnsettledExpenses - totalUnsettledSalaries - totalDistributedSoFar);

    return { totalCollectedProfits, totalUnsettledExpenses, totalUnsettledSalaries, netDistributableProfit };
  }, [installments, expenses, salaryLog, distributionsLog]);

  const amountToDistribute = customDistributeAmount !== "" ? Math.round(parseFloat(customDistributeAmount) || 0) : financialSummary.netDistributableProfit;

  const totalCapitalSum = useMemo(() => {
    return partners.reduce((sum, p) => sum + Number(p.capital || 0), 0);
  }, [partners]);

  // تنفيذ حركة التوزيع
  const handleExecuteDistribution = async () => {
    if (amountToDistribute <= 0 || partners.length === 0) return;

    try {
      setExecuting(true);
      const distDate = new Date().toISOString().split("T")[0];

      const partnerResults = partners.map((p) => {
        const sharePct = totalCapitalSum > 0 ? Number(p.capital || 0) / totalCapitalSum : 0;
        const shareAmount = Math.round(amountToDistribute * sharePct);
        const decision = partnerDecisions[p.id] || "withdraw";

        return {
          partnerId: p.id,
          partnerName: p.name,
          capitalAtTime: p.capital,
          shareAmount,
          decision,
          netProfit: shareAmount
        };
      });

      // 1) تحديث رأس مال أو مسحوبات الشركاء
      for (const res of partnerResults) {
        if (res.decision === "reinvest") {
          const newCapital = Number(res.capitalAtTime || 0) + res.netProfit;
          await supabase.from("partners").update({ capital: newCapital }).eq("id", res.partnerId);
          await supabase.from("capital_moves").insert([{ partner_id: res.partnerId, partner_name: res.partnerName, type: "increase", amount: res.netProfit, date: distDate, notes: "إعادة استثمار أرباح (تلقائي)" }]);
        } else {
          const pObj = partners.find((x) => x.id === res.partnerId);
          const newWithdrawn = Number(pObj?.total_withdrawn_profits || 0) + res.netProfit;
          await supabase.from("partners").update({ total_withdrawn_profits: newWithdrawn }).eq("id", res.partnerId);
        }
      }

      // 2) تسوية المصروفات والرواتب
      await supabase.from("expenses").update({ is_settled: true }).eq("is_settled", false);
      await supabase.from("salary_log").update({ is_settled: true }).eq("is_settled", false);

      // 3) تسديد القيد بالسجل
      await supabase.from("distributions_log").insert([{
        date: distDate,
        amount: amountToDistribute,
        details: `توزيع أرباح بقيمة ${amountToDistribute.toLocaleString()} ج.م`,
        partner_results: partnerResults
      }]);

      setCustomDistributeAmount("");
      setPartnerDecisions({});
      await loadDistributionData();
      alert("تم تنفيذ عملية توزيع الأرباح بنجاح في قاعدة البيانات السحابية!");
    } catch (err) {
      console.error("❌ خطأ في تنفيذ التوزيع:", err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "16px", fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* الشريط العلوي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
          <span>رجوع</span>
        </button>
        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>توزيع الأرباح على الشركاء</h2>
        <button type="button" onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText || "#aaaaaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: themeStyles.accentGold || "#e8cd9c" }}>
          <Loader2 size={24} className="animate-spin" /> جاري جلب البيانات...
        </div>
      ) : (
        <>
          {/* كارت صافي الأرباح القابلة للتوزيع */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: themeStyles.subText || "#aaaaaa" }}>الصافي القابل للتوزيع حالياً</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "4px" }}>
              {financialSummary.netDistributableProfit.toLocaleString()} ج.م
            </div>
            <div style={{ fontSize: "11px", color: themeStyles.subText || "#aaaaaa", marginTop: "6px" }}>
              (أرباح التحصيلات - المصروفات الغير مسواة - الرواتب)
            </div>
          </div>

          {/* المبلغ المراد توزيعه */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>المبلغ المراد توزيعه فعلياً (قابل للتعديل)</label>
            <input
              type="number"
              step="1"
              value={customDistributeAmount !== "" ? customDistributeAmount : financialSummary.netDistributableProfit}
              onChange={(e) => setCustomDistributeAmount(e.target.value)}
              style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.accentGold || "#e8cd9c", outline: "none", fontSize: "18px", fontWeight: 800 }}
            />
          </div>

          {/* جدول توزيع الأرباح والقراارت */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "14px" }}>جدول أنصبة وقرارات الشركاء</div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                    <th style={{ padding: "10px" }}>اسم الشريك</th>
                    <th style={{ padding: "10px" }}>رأس المال الحالي</th>
                    <th style={{ padding: "10px" }}>النسبة</th>
                    <th style={{ padding: "10px" }}>النصيب المستحق</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>قرار الشريك</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => {
                    const sharePct = totalCapitalSum > 0 ? Number(p.capital || 0) / totalCapitalSum : 0;
                    const shareAmount = Math.round(amountToDistribute * sharePct);
                    const currentDec = partnerDecisions[p.id] || "withdraw";

                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                        <td style={{ padding: "10px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{p.name}</td>
                        <td style={{ padding: "10px" }}>{Number(p.capital).toLocaleString()} ج.م</td>
                        <td style={{ padding: "10px" }}>{Math.round(sharePct * 100)}%</td>
                        <td style={{ padding: "10px", fontWeight: 800, color: "#4ade80" }}>{shareAmount.toLocaleString()} ج.م</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "10px" }}>
                            <label style={{ cursor: "pointer", fontSize: "12px", color: currentDec === "withdraw" ? "#f87171" : themeStyles.subText || "#aaaaaa" }}>
                              <input type="radio" name={`dec_${p.id}`} checked={currentDec === "withdraw"} onChange={() => setPartnerDecisions({ ...partnerDecisions, [p.id]: "withdraw" })} /> سحب الأرباح
                            </label>
                            <label style={{ cursor: "pointer", fontSize: "12px", color: currentDec === "reinvest" ? "#4ade80" : themeStyles.subText || "#aaaaaa" }}>
                              <input type="radio" name={`dec_${p.id}`} checked={currentDec === "reinvest"} onChange={() => setPartnerDecisions({ ...partnerDecisions, [p.id]: "reinvest" })} /> إعادة الاستثمار
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleExecuteDistribution}
              disabled={executing || amountToDistribute <= 0}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d69a5f, #7a4a1f)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                marginTop: "16px"
              }}
            >
              {executing ? "جاري التوزيع والتسوية..." : "تنفيذ التوزيع على كل الشركاء ورصد السجلات"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfitDistributionScreen;
