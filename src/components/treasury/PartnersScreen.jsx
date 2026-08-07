import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, Users, UserMinus, Plus, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function PartnersScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [partners, setPartners] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // النماذج
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");

  const [increasePartner, setIncreasePartner] = useState("");
  const [increaseAmount, setIncreaseAmount] = useState("");

  const [withdrawPartner, setWithdrawPartner] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");

  const loadPartnersData = async () => {
    try {
      setLoading(true);
      const [{ data: pData }, { data: wData }] = await Promise.all([
        supabase.from("partners").select("*").order("id", { ascending: true }),
        supabase.from("withdrawals_log").select("*").order("date", { ascending: false })
      ]);

      setPartners(pData || []);
      setWithdrawals(wData || []);
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات الشركاء:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnersData();
  }, []);

  const totalCapitalSum = useMemo(() => {
    return partners.reduce((sum, p) => sum + Number(p.capital || 0), 0);
  }, [partners]);

  // إضافة شريك جديد
  const handleAddPartner = async (e) => {
    e.preventDefault();
    const capNum = Math.round(parseFloat(capital) || 0);
    if (!name || capNum <= 0) return;

    try {
      const { data, error } = await supabase
        .from("partners")
        .insert([{
          name,
          capital: capNum,
          join_date: new Date().toISOString().split("T")[0],
          total_withdrawn_profits: 0
        }])
        .select();

      if (error) throw error;

      if (data?.[0]?.id) {
        await supabase.from("capital_moves").insert([{
          partner_id: data[0].id,
          partner_name: name,
          type: "initial",
          amount: capNum,
          date: new Date().toISOString().split("T")[0],
          notes: "رأس المال الابتدائي"
        }]);
      }

      setName("");
      setCapital("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في إضافة الشريك:", err);
    }
  };

  // زيادة رأس مال شريك
  const handleIncreaseCapital = async (e) => {
    e.preventDefault();
    const num = Math.round(parseFloat(increaseAmount) || 0);
    const partnerObj = partners.find((p) => p.name === increasePartner);
    if (!partnerObj || num <= 0) return;

    try {
      const newCapital = Number(partnerObj.capital || 0) + num;
      await supabase.from("partners").update({ capital: newCapital }).eq("id", partnerObj.id);

      await supabase.from("capital_moves").insert([{
        partner_id: partnerObj.id,
        partner_name: partnerObj.name,
        type: "increase",
        amount: num,
        date: new Date().toISOString().split("T")[0],
        notes: "زيادة رأس مال"
      }]);

      setIncreasePartner("");
      setIncreaseAmount("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في زيادة رأس المال:", err);
    }
  };

  // تسجيل سلفة / مسحوبات
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const num = Math.round(parseFloat(withdrawAmount) || 0);
    const partnerObj = partners.find((p) => p.name === withdrawPartner);
    if (!partnerObj || num <= 0) return;

    try {
      await supabase.from("withdrawals_log").insert([{
        partner_id: partnerObj.id,
        partner_name: partnerObj.name,
        amount: num,
        date: new Date().toISOString().split("T")[0],
        notes: withdrawNotes || "سلفة نقدية",
        is_settled: false,
        settled_amount: 0
      }]);

      setWithdrawPartner("");
      setWithdrawAmount("");
      setWithdrawNotes("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في تسجيل السحب:", err);
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
        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>الشركاء ورأس المال</h2>
        <button type="button" onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText || "#aaaaaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {/* كارت رأس المال الكلي */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "13px", color: themeStyles.subText || "#aaaaaa" }}>إجمالي رأس مال الشركة الفعلي</div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginTop: "4px" }}>{totalCapitalSum.toLocaleString()} ج.م</div>
      </div>

      {/* جدول الشركاء */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "14px" }}>جدول حسابات الشركاء والنسب</div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: themeStyles.accentGold || "#e8cd9c" }}>
            <Loader2 size={24} className="animate-spin" /> جاري التحميل...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                  <th style={{ padding: "10px" }}>اسم الشريك</th>
                  <th style={{ padding: "10px" }}>تاريخ الانضمام</th>
                  <th style={{ padding: "10px" }}>رأس المال الحالي</th>
                  <th style={{ padding: "10px" }}>النسبة اللحظية</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const sharePct = totalCapitalSum > 0 ? Math.round((Number(p.capital || 0) / totalCapitalSum) * 100) : 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                      <td style={{ padding: "10px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{p.name}</td>
                      <td style={{ padding: "10px" }}>{p.join_date}</td>
                      <td style={{ padding: "10px", fontWeight: 800 }}>{Number(p.capital).toLocaleString()} ج.م</td>
                      <td style={{ padding: "10px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{sharePct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نماذج الإضافة والتعديل والسحب */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {/* إضافة شريك */}
        <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "12px" }}>إضافة شريك جديد</div>
          <form onSubmit={handleAddPartner} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="اسم الشريك..." style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }} />
            <input type="number" step="1" value={capital} onChange={(e) => setCapital(e.target.value)} required placeholder="رأس المال الابتدائي (ج.م)" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800 }} />
            <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>حفظ الشريك الجديد</button>
          </form>
        </div>

        {/* زيادة رأس المال */}
        <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "12px" }}>زيادة رأس مال شريك</div>
          <form onSubmit={handleIncreaseCapital} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <select value={increasePartner} onChange={(e) => setIncreasePartner(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }}>
              <option value="">-- اختار الشريك --</option>
              {partners.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <input type="number" step="1" value={increaseAmount} onChange={(e) => setIncreaseAmount(e.target.value)} required placeholder="مبلغ الزيادة (ج.م)" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800 }} />
            <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>تسجيل زيادة رأس المال</button>
          </form>
        </div>

        {/* سحب مالي / سلفة */}
        <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "12px" }}>تسجيل سحب مالي / سلفة</div>
          <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <select value={withdrawPartner} onChange={(e) => setWithdrawPartner(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }}>
              <option value="">-- اختار الشريك --</option>
              {partners.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <input type="number" step="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required placeholder="مبلغ السحب (ج.م)" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800 }} />
            <input type="text" value={withdrawNotes} onChange={(e) => setWithdrawNotes(e.target.value)} placeholder="بيان وسبب السحب..." style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }} />
            <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>تسجيل السحب</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PartnersScreen;
