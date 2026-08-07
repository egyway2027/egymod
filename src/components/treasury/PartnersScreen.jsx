import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, FileText, UserMinus, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function PartnersScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [partners, setPartners] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. نموذج إضافة شريك جديد
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split("T")[0]);

  // 2. نموذج زيادة رأس المال
  const [increasePartner, setIncreasePartner] = useState("");
  const [increaseAmount, setIncreaseAmount] = useState("");
  const [increaseDate, setIncreaseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [increaseNotes, setIncreaseNotes] = useState("");

  // 3. نموذج السحب / السلفة
  const [withdrawPartner, setWithdrawPartner] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");

  // جلب كافة بيانات الشركاء والمسحوبات والسلف
  const loadPartnersData = async () => {
    try {
      setLoading(true);
      const [{ data: pData, error: pErr }, { data: wData, error: wErr }] = await Promise.all([
        supabase.from("partners").select("*").order("id", { ascending: true }),
        supabase.from("withdrawals_log").select("*").order("date", { ascending: false })
      ]);

      if (pErr) console.error("❌ خطأ الشركاء:", pErr);
      if (wErr) console.error("❌ خطأ المسحوبات:", wErr);

      setPartners(pData || []);
      setWithdrawals(wData || []);
    } catch (err) {
      console.error("❌ خطأ في جلب البيانات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnersData();
  }, []);

  // حساب رأس المال الكلي
  const totalCapitalSum = useMemo(() => {
    return partners.reduce((sum, p) => sum + Number(p.capital || 0), 0);
  }, [partners]);

  // حساب نسبة الشريك الجديد التلقائية أثناء الكتابة
  const liveNewPartnerPercent = useMemo(() => {
    const numCap = Math.round(parseFloat(capital) || 0);
    const newTotal = totalCapitalSum + numCap;
    if (newTotal <= 0) return 0;
    return Math.round((numCap / newTotal) * 100);
  }, [capital, totalCapitalSum]);

  // حساب المسحوبات والسلف لكل شريك بالجدول
  const calculatedPartners = useMemo(() => {
    return partners.map((p) => {
      const pLogs = withdrawals.filter((w) => String(w.partner_id) === String(p.id));
      const activeAdvance = pLogs
        .filter((w) => !w.is_settled)
        .reduce((sum, w) => sum + (Number(w.amount || 0) - Number(w.settled_amount || 0)), 0);
      const settledWithdrawals = pLogs.reduce((sum, w) => sum + Number(w.settled_amount || 0), 0);
      const sharePct = totalCapitalSum > 0 ? Math.round((Number(p.capital || 0) / totalCapitalSum) * 100) : 0;

      return {
        ...p,
        activeAdvance: Math.round(activeAdvance),
        settledWithdrawals: Math.round(settledWithdrawals),
        sharePct
      };
    });
  }, [partners, withdrawals, totalCapitalSum]);

  // 1. تنفيذ إضافة شريك جديد
  const handleAddPartner = async (e) => {
    e.preventDefault();
    const capNum = Math.round(parseFloat(capital) || 0);
    if (!name.trim() || capNum <= 0) {
      alert("يرجى إدخال اسم الشريك ومبلغ استثمار صحيح اكبر من 0");
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from("partners")
        .insert([{
          name: name.trim(),
          capital: capNum,
          join_date: joinDate || new Date().toISOString().split("T")[0],
          total_withdrawn_profits: 0
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        try {
          await supabase.from("capital_moves").insert([{
            partner_id: data[0].id,
            partner_name: name.trim(),
            type: "initial",
            amount: capNum,
            date: joinDate || new Date().toISOString().split("T")[0],
            notes: "رأس المال الابتدائي"
          }]);
        } catch (mErr) {
          console.warn("⚠️ تم حفظ الشريك ولكن تعذر إضافة حركة رأس المال:", mErr);
        }
      }

      setName("");
      setCapital("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في إضافة الشريك:", err);
      alert("حدث خطأ أثناء حفظ الشريك بالسحابة: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. تنفيذ زيادة رأس المال
  const handleIncreaseCapital = async (e) => {
    e.preventDefault();
    const num = Math.round(parseFloat(increaseAmount) || 0);
    const partnerObj = partners.find((p) => p.name === increasePartner);
    if (!partnerObj || num <= 0) return;

    try {
      setSubmitting(true);
      const newCapital = Number(partnerObj.capital || 0) + num;
      await supabase.from("partners").update({ capital: newCapital }).eq("id", partnerObj.id);

      await supabase.from("capital_moves").insert([{
        partner_id: partnerObj.id,
        partner_name: partnerObj.name,
        type: "increase",
        amount: num,
        date: increaseDate || new Date().toISOString().split("T")[0],
        notes: increaseNotes || "ضخ رأس مال إضافي"
      }]);

      setIncreasePartner("");
      setIncreaseAmount("");
      setIncreaseNotes("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في زيادة رأس المال:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. تنفيذ تسجيل سحب / سلفة
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const num = Math.round(parseFloat(withdrawAmount) || 0);
    const partnerObj = partners.find((p) => p.name === withdrawPartner);
    if (!partnerObj || num <= 0) return;

    try {
      setSubmitting(true);
      await supabase.from("withdrawals_log").insert([{
        partner_id: partnerObj.id,
        partner_name: partnerObj.name,
        amount: num,
        date: new Date().toISOString().split("T")[0],
        notes: withdrawNotes || "سحب نقدي تحت حساب الأرباح",
        is_settled: false,
        settled_amount: 0
      }]);

      setWithdrawPartner("");
      setWithdrawAmount("");
      setWithdrawNotes("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في تسجيل السحب:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. تصفية وحذف الشريك
  const handleSettleAndRemove = async (partnerId, partnerName) => {
    if (!window.confirm(`هل أنت متأكد من تصفية وحذف حساب الشريك (${partnerName})؟`)) return;
    try {
      await supabase.from("partners").delete().eq("id", partnerId);
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في حذف الشريك:", err);
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

        <h2 style={{ color: themeStyles.accentGold || "#d69a5f", margin: 0, fontSize: "20px", fontWeight: 800 }}>الشركاء ورأس المال</h2>

        <button type="button" onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, color: themeStyles.subText || "#888888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {/* كارت رأس المال الإجمالي */}
      <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "13px", color: themeStyles.subText || "#888888" }}>إجمالي رأس مال الشركة الفعلي</div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginTop: "4px" }}>{totalCapitalSum.toLocaleString()} ج.م</div>
      </div>

      {/* جدول الشركاء الحقيقي الشامل */}
      <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>جدول حسابات الشركاء والنسب</div>

          <button type="button" style={{ background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#d69a5f", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
            <FileText size={14} />
            <span>جميع سجلات السحوبات</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: themeStyles.accentGold || "#d69a5f" }}>
            <Loader2 size={24} className="animate-spin" /> جاري التحميل...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#1a1a1a", color: themeStyles.accentGold || "#d69a5f", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}` }}>اسم الشريك</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}` }}>تاريخ الانضمام</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}` }}>رأس المال الحالي</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}` }}>مسحوباته المسواة</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}` }}>سلفة قائمة</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}` }}>النسبة اللحظية</th>
                  <th style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {calculatedPartners.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: themeStyles.subText || "#888888" }}>
                      لا يوجد شركاء مسجلين حالياً.
                    </td>
                  </tr>
                ) : (
                  calculatedPartners.map((p) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800, color: themeStyles.text || "#ffffff" }}>{p.name}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, color: themeStyles.subText || "#888888" }}>{p.join_date}</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800 }}>{Number(p.capital).toLocaleString()} ج.م</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, color: themeStyles.subText || "#888888" }}>{p.settledWithdrawals.toLocaleString()} ج.م</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, color: "#f87171", fontWeight: 800 }}>{p.activeAdvance.toLocaleString()} ج.م</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>{p.sharePct}%</td>
                      <td style={{ padding: "10px", border: `1px solid ${themeStyles.border || "#262626"}`, textAlign: "center" }}>
                        <button type="button" onClick={() => handleSettleAndRemove(p.id, p.name)} style={{ background: "#3e1c24", border: "1px solid #ef444455", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <UserMinus size={12} />
                          <span>تصفية وحذف</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ fontSize: "11.5px", color: themeStyles.subText || "#888888", marginTop: "12px", lineHeight: "1.6" }}>
          * النسبة اللحظية إرشادية بناءً على رأس المال اليوم. نسبة توزيع الأرباح الفعلية تُحسب بجدول التوزيع حسب رأس مال الشريك وعدد أيامه بالفترة (Capital-Days).
        </div>
      </div>

      {/* النماذج الثلاثة بنفس الترتيب والتنسيق */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        
        {/* 1. نموذج إضافة شريك جديد */}
        <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginBottom: "12px" }}>إضافة شريك جديد</div>
          <form onSubmit={handleAddPartner} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>اسم الشريك *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="أدخل اسم الشريك..." style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>مبلغ الاستثمار (رأس المال) *</label>
              <input type="number" step="1" value={capital} onChange={(e) => setCapital(e.target.value)} required placeholder="0" style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>تاريخ الانضمام *</label>
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <div style={{ background: themeStyles.inputBg || "#1a1a1a", border: "1px dashed #d69a5f88", borderRadius: "10px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: themeStyles.subText || "#888888" }}>نسبة الشريك التلقائية:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>{liveNewPartnerPercent}%</span>
            </div>

            <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#000000", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
              {submitting ? "جاري الحفظ..." : "حفظ الشريك الجديد"}
            </button>
          </form>
        </div>

        {/* 2. زيادة رأس مال شريك حالي */}
        <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginBottom: "4px" }}>زيادة رأس مال شريك حالي</div>
          <p style={{ fontSize: "11.5px", color: themeStyles.subText || "#888888", marginTop: 0, marginBottom: "12px", lineHeight: "1.5" }}>
            منفصلة تماماً عن السلفة. تضاف لرأس المال وتُحسب أرباحه أوتوماتيكياً من تاريخ هذه الزيادة فقط.
          </p>

          <form onSubmit={handleIncreaseCapital} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>اسم الشريك *</label>
              <select value={increasePartner} onChange={(e) => setIncreasePartner(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }}>
                <option value="">-- اختار اسم الشريك --</option>
                {partners.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>مبلغ الزيادة (ج.م) *</label>
              <input type="number" step="1" value={increaseAmount} onChange={(e) => setIncreaseAmount(e.target.value)} required placeholder="0" style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>تاريخ الزيادة *</label>
              <input type="date" value={increaseDate} onChange={(e) => setIncreaseDate(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>ملاحظات</label>
              <input type="text" value={increaseNotes} onChange={(e) => setIncreaseNotes(e.target.value)} placeholder="مثال: ضخ رأس مال إضافي" style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#000000", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
              {submitting ? "جاري الحفظ..." : "تسجيل زيادة رأس المال"}
            </button>
          </form>
        </div>

        {/* 3. تسجيل سحب مال / سلفة */}
        <div style={{ background: themeStyles.card || "#141414", border: `1px solid ${themeStyles.border || "#262626"}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#d69a5f", marginBottom: "12px" }}>تسجيل سحب مال / سلفة لشريك</div>
          <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>اسم الشريك *</label>
              <select value={withdrawPartner} onChange={(e) => setWithdrawPartner(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }}>
                <option value="">-- اختار اسم الشريك --</option>
                {partners.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>مبلغ السحب (ج.م) *</label>
              <input type="number" step="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required placeholder="0" style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#888888", marginBottom: "6px", fontWeight: 700 }}>بيان وسبب السحب</label>
              <input type="text" value={withdrawNotes} onChange={(e) => setWithdrawNotes(e.target.value)} placeholder="مثال: سحب نقدي تحت حساب الأرباح" style={{ width: "100%", background: themeStyles.inputBg || "#1a1a1a", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #b06a35)", color: "#000000", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
              {submitting ? "جاري الحفظ..." : "تسجيل السحب"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default PartnersScreen;
