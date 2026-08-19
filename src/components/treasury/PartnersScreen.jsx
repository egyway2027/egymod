import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, FileText, UserMinus, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useIsMobile } from "../../hooks/useIsMobile";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, FileText, Trash2, Edit3, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useIsMobile } from "../../hooks/useIsMobile";

export function PartnersScreen({ onBack, t = {}, themeStyles = {} }) {
  const isMobile = useIsMobile();
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [partners, setPartners] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // التبويب النشط في لوحة العمليات
  const [activeOpTab, setActiveOpTab] = useState("add"); // "add" | "inc" | "wdr"

  // 1. نموذج إضافة شريك جديد
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split("T")[0]);

  // 2. نموذج زيادة رأس المال
  const [increasePartnerId, setIncreasePartnerId] = useState("");
  const [increaseAmount, setIncreaseAmount] = useState("");
  const [increaseDate, setIncreaseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [increaseNotes, setIncreaseNotes] = useState("");

  // 3. نموذج السحب / السلفة
  const [withdrawPartnerId, setWithdrawPartnerId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDate, setWithdrawDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [withdrawNotes, setWithdrawNotes] = useState("");

  // النوافذ المنبثقة (Modals)
  const [showAllLogsModal, setShowAllLogsModal] = useState(false);
  const [allFromDate, setAllFromDate] = useState("");
  const [allToDate, setAllToDate] = useState("");

  const [showSingleModal, setShowSingleModal] = useState(false);
  const [selectedPartnerForLogs, setSelectedPartnerForLogs] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState({ id: null, name: "", capital: "", join_date: "" });

  // جلب كافة بيانات الشركاء والمسحوبات والسلف من السحابة
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
      const pLogs = withdrawals.filter((w) => Number(w.partner_id) === Number(p.id));
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

  // حساب إحصائيات الكروت الأربعة العلوية
  const partnerStats = useMemo(() => {
    const totalAdvances = calculatedPartners.reduce((sum, p) => sum + p.activeAdvance, 0);
    const totalSettled = calculatedPartners.reduce((sum, p) => sum + p.settledWithdrawals, 0);
    return {
      totalPartners: partners.length,
      totalAdvances,
      totalSettled
    };
  }, [calculatedPartners, partners]);

  // تصفية سجلات السحوبات العامة بالتاريخ
  const filteredAllLogs = useMemo(() => {
    return withdrawals.filter((w) => {
      if (allFromDate && w.date < allFromDate) return false;
      if (allToDate && w.date > allToDate) return false;
      return true;
    });
  }, [withdrawals, allFromDate, allToDate]);

  // سجل سحوبات الشريك المحدد الفردي
  const singlePartnerLogs = useMemo(() => {
    if (!selectedPartnerForLogs) return [];
    return withdrawals.filter((w) => Number(w.partner_id) === Number(selectedPartnerForLogs.id));
  }, [withdrawals, selectedPartnerForLogs]);

  // 1. تنفيذ إضافة شريك جديد
  const handleAddPartner = async (e) => {
    e.preventDefault();
    const capNum = Math.round(parseFloat(capital) || 0);
    if (!name.trim() || capNum <= 0) {
      alert("يرجى إدخال اسم الشريك ومبلغ استثمار صحيح أكبر من 0");
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
    const partnerObj = partners.find((p) => Number(p.id) === Number(increasePartnerId));
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

      setIncreasePartnerId("");
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
    const partnerObj = partners.find((p) => Number(p.id) === Number(withdrawPartnerId));
    if (!partnerObj || num <= 0) return;

    try {
      setSubmitting(true);
      await supabase.from("withdrawals_log").insert([{
        partner_id: partnerObj.id,
        partner_name: partnerObj.name,
        amount: num,
        date: withdrawDate || new Date().toISOString().split("T")[0],
        notes: withdrawNotes || "سحب نقدي تحت حساب الأرباح",
        is_settled: false,
        settled_amount: 0
      }]);

      setWithdrawPartnerId("");
      setWithdrawAmount("");
      setWithdrawNotes("");
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في تسجيل السحب:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. تعديل بيانات الشريك
  const handleSaveEditPartner = async (e) => {
    e.preventDefault();
    if (!editingPartner.id || !editingPartner.name.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("partners")
        .update({
          name: editingPartner.name.trim(),
          capital: Number(editingPartner.capital || 0),
          join_date: editingPartner.join_date
        })
        .eq("id", editingPartner.id);

      if (error) throw error;
      setShowEditModal(false);
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في تعديل بيانات الشريك:", err);
      alert("حدث خطأ أثناء حفظ التعديلات بالسحابة.");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. حذف الشريك نهائياً
  const handleDeletePartner = async (partnerId, partnerName) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب الشريك (${partnerName}) نهائياً من النظام؟`)) return;
    try {
      await supabase.from("partners").delete().eq("id", partnerId);
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في حذف الشريك:", err);
    }
  };

  // 6. حذف حركة سحب من السجل
  const handleDeleteWithdrawalLog = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الحركة من سجل السحوبات؟")) return;
    try {
      await supabase.from("withdrawals_log").delete().eq("id", id);
      await loadPartnersData();
    } catch (err) {
      console.error("❌ خطأ في حذف حركة السحب:", err);
    }
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ width: "100%", maxWidth: "100%", margin: "0", padding: isMobile ? "8px 10px" : "10px 20px", fontFamily: "'Cairo', 'Tajawal', sans-serif", boxSizing: "border-box" }}>
      
      {/* 1. الشريط العلوي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "10px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
        <div style={{ fontSize: isMobile ? "16px" : "19px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>👥</span>
          <span>لوحة إدارة الشركاء والحصص ورأس المال</span>
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: themeStyles.card || "#18181d",
            border: `1px solid ${themeStyles.border || "#282830"}`,
            color: themeStyles.accentGold || "#e8cd9c",
            padding: "6px 16px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <ArrowRight size={15} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
          <span>رجوع</span>
        </button>
      </div>

      {/* 2. كروت المؤشرات المالية الأربعة */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px", marginBottom: "14px" }}>
        
        {/* كارت 1: إجمالي رأس المال */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "90px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#d69a5f" }} />
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>إجمالي رأس المال الفعلي</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {totalCapitalSum.toLocaleString()} <span style={{ fontSize: "11px", color: themeStyles.accentGold || "#d69a5f" }}>ج.م</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>المبلغ الكلي المستثمر بالنشاط</div>
        </div>

        {/* كارت 2: عدد الشركاء */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "90px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#38bdf8" }} />
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>عدد الشركاء النشطين</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {partnerStats.totalPartners} <span style={{ fontSize: "11px", color: "#38bdf8" }}>شركاء</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>جميع الحصص مفعلة ومربوطة</div>
        </div>

        {/* كارت 3: السلف القائمة */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "90px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#f87171" }} />
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>إجمالي السلف القائمة (غير مسواة)</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {partnerStats.totalAdvances.toLocaleString()} <span style={{ fontSize: "11px", color: "#f87171" }}>ج.م</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>تُخصم من الأرباح عند التوزيع</div>
        </div>

        {/* كارت 4: المسحوبات المسواة */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "90px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#10b981" }} />
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>إجمالي المسحوبات المسواة</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {partnerStats.totalSettled.toLocaleString()} <span style={{ fontSize: "11px", color: "#10b981" }}>ج.م</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>أرباح تم تسليمها وتصفيتها</div>
        </div>

      </div>

      {/* 3. التقسيم الرئيسي (النموذج يميناً 380px والجدول يساراً 1fr) */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "380px 1fr", gap: "14px" }}>

        {/* أ) الجانب الأيمن: لوحة العمليات والتبويبات */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column" }}>
          
          <div style={{ display: "flex", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "10px", padding: "3px", gap: "3px", marginBottom: "14px" }}>
            <button
              type="button"
              onClick={() => setActiveOpTab("add")}
              style={{
                flex: 1,
                background: activeOpTab === "add" ? "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)" : "transparent",
                color: activeOpTab === "add" ? "#ffffff" : "#8e8e9c",
                border: "none",
                padding: "7px 6px",
                borderRadius: "7px",
                fontSize: "11.5px",
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              + إضافة شريك
            </button>
            <button
              type="button"
              onClick={() => setActiveOpTab("inc")}
              style={{
                flex: 1,
                background: activeOpTab === "inc" ? "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)" : "transparent",
                color: activeOpTab === "inc" ? "#ffffff" : "#8e8e9c",
                border: "none",
                padding: "7px 6px",
                borderRadius: "7px",
                fontSize: "11.5px",
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              ↑ زيادة رأس مال
            </button>
            <button
              type="button"
              onClick={() => setActiveOpTab("wdr")}
              style={{
                flex: 1,
                background: activeOpTab === "wdr" ? "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)" : "transparent",
                color: activeOpTab === "wdr" ? "#ffffff" : "#8e8e9c",
                border: "none",
                padding: "7px 6px",
                borderRadius: "7px",
                fontSize: "11.5px",
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              ↓ تسجيل سحب
            </button>
          </div>

          {/* تبويب 1: إضافة شريك جديد */}
          {activeOpTab === "add" && (
            <form onSubmit={handleAddPartner} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>اسم الشريك بالكامل *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسم الشريك..." required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>مبلغ الاستثمار الابتدائي (ج.م) *</label>
                <input type="number" step="1" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="0" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "13px", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>تاريخ الانضمام *</label>
                <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ background: "#131317", border: "1px dashed rgba(214, 154, 95, 0.5)", borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#8e8e9c" }}>النسبة التلقائية المتوقعة:</span>
                <strong style={{ fontSize: "15px", color: themeStyles.accentGold || "#e8cd9c" }}>{liveNewPartnerPercent}%</strong>
              </div>
              <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer", marginTop: "4px" }}>
                {submitting ? "جاري الحفظ..." : "حفظ الشريك الجديد بالسحابة"}
              </button>
            </form>
          )}

          {/* تبويب 2: زيادة رأس مال شريك حالي */}
          {activeOpTab === "inc" && (
            <form onSubmit={handleIncreaseCapital} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>اختيار الشريك *</label>
                <select value={increasePartnerId} onChange={(e) => setIncreasePartnerId(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }}>
                  <option value="">-- اختار الشريك --</option>
                  {partners.map((p) => <option key={p.id} value={p.id}>{p.name} (#PART-{p.id})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>مبلغ الضخ الإضافي (ج.م) *</label>
                <input type="number" step="1" value={increaseAmount} onChange={(e) => setIncreaseAmount(e.target.value)} placeholder="0" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "13px", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>تاريخ الزيادة *</label>
                <input type="date" value={increaseDate} onChange={(e) => setIncreaseDate(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>ملاحظات وبيان الضخ</label>
                <input type="text" value={increaseNotes} onChange={(e) => setIncreaseNotes(e.target.value)} placeholder="مثال: زيادة استثمار لتوسعة النشاط" style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer", marginTop: "4px" }}>
                {submitting ? "جاري الحفظ..." : "تسجيل الزيادة وتحديث الحصص"}
              </button>
            </form>
          )}

          {/* تبويب 3: تسجيل سحب / سلفة لشريك */}
          {activeOpTab === "wdr" && (
            <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>اختيار الشريك *</label>
                <select value={withdrawPartnerId} onChange={(e) => setWithdrawPartnerId(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }}>
                  <option value="">-- اختار الشريك --</option>
                  {partners.map((p) => <option key={p.id} value={p.id}>{p.name} (#PART-{p.id})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>مبلغ السحب (ج.م) *</label>
                <input type="number" step="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "13px", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>تاريخ السحب *</label>
                <input type="date" value={withdrawDate} onChange={(e) => setWithdrawDate(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>سبب السحب والملاحظات</label>
                <input type="text" value={withdrawNotes} onChange={(e) => setWithdrawNotes(e.target.value)} placeholder="مثال: سحب تحت حساب أرباح الفترة" style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer", marginTop: "4px" }}>
                {submitting ? "جاري الحفظ..." : "تسجيل حركة السحب بالخزينة"}
              </button>
            </form>
          )}

        </div>

        {/* ب) الجانب الأيسر: جدول حسابات الشركاء والنسب */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📊</span>
              <span>جدول حسابات الشركاء والنسب اللحظية</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAllLogsModal(true)}
              style={{
                background: themeStyles.inputBg || "#121215",
                border: `1px solid ${themeStyles.border || "#383844"}`,
                color: themeStyles.accentGold || "#e8cd9c",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <FileText size={14} />
              <span>سجل كافة السحوبات والحركات</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: themeStyles.accentGold || "#e8cd9c" }}>
              <Loader2 size={24} className="animate-spin" /> جاري التحميل...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                    <th style={{ padding: "9px 10px", fontWeight: 800 }}>كود واسم الشريك</th>
                    <th style={{ padding: "9px 10px", fontWeight: 800 }}>تاريخ الانضمام</th>
                    <th style={{ padding: "9px 10px", fontWeight: 800 }}>رأس المال الحالي</th>
                    <th style={{ padding: "9px 10px", fontWeight: 800 }}>مسحوبات مسواة</th>
                    <th style={{ padding: "9px 10px", fontWeight: 800 }}>سلفة قائمة</th>
                    <th style={{ padding: "9px 10px", fontWeight: 800 }}>النسبة اللحظية</th>
                    <th style={{ padding: "9px 10px", fontWeight: 800, textAlign: "center" }}>إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedPartners.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#8e8e9c" }}>لا يوجد شركاء مسجلين حالياً</td>
                    </tr>
                  ) : (
                    calculatedPartners.map((p) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                        <td style={{ padding: "9px 10px" }}>
                          <div>
                            <strong style={{ color: themeStyles.accentGold || "#e8cd9c", display: "block" }}>{p.name}</strong>
                            <span style={{ fontSize: "10px", color: "#8e8e9c" }}>#PART-{p.id}</span>
                          </div>
                        </td>
                        <td style={{ padding: "9px 10px", color: "#8e8e9c" }}>{p.join_date}</td>
                        <td style={{ padding: "9px 10px", fontWeight: 800 }}>{Number(p.capital).toLocaleString()} ج.م</td>
                        <td style={{ padding: "9px 10px", color: "#8e8e9c" }}>{p.settledWithdrawals.toLocaleString()} ج.م</td>
                        <td style={{ padding: "9px 10px" }}>
                          <span style={{
                            background: p.activeAdvance > 0 ? "rgba(248, 113, 113, 0.15)" : "rgba(255, 255, 255, 0.05)",
                            color: p.activeAdvance > 0 ? "#f87171" : "#8e8e9c",
                            padding: "2px 7px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                            display: "inline-block"
                          }}>
                            {p.activeAdvance.toLocaleString()} ج.م
                          </span>
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "85px" }}>
                            <span style={{ fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{p.sharePct}%</span>
                            <div style={{ width: "100%", height: "5px", background: "#121216", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${p.sharePct}%`, height: "100%", background: "linear-gradient(90deg, #d69a5f, #b06a35)", borderRadius: "3px" }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "9px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPartnerForLogs(p);
                              setShowSingleModal(true);
                            }}
                            style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "3px" }}
                          >
                            🧾 سجل سحوباته
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPartner({ id: p.id, name: p.name, capital: p.capital, join_date: p.join_date });
                              setShowEditModal(true);
                            }}
                            style={{ background: "rgba(232, 205, 156, 0.08)", border: "1px solid rgba(232, 205, 156, 0.3)", color: themeStyles.accentGold || "#e8cd9c", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "3px" }}
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePartner(p.id, p.name)}
                            style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.25)", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ fontSize: "11px", color: "#8e8e9c", marginTop: "14px", lineHeight: "1.5", borderTop: `1px solid ${themeStyles.border || "#282830"}`, paddingTop: "8px" }}>
            * النسبة اللحظية إرشادية بناءً على رأس المال اليوم. نسبة توزيع الأرباح الفعلية تُحسب تلقائياً بجدول توزيع الأرباح وفق نظام (Capital-Days).
          </div>
        </div>

      </div>

      {/* نافذة 1: سجل كافة سحوبات الشركاء العام (مع فلترة التواريخ) */}
      {showAllLogsModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "700px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", display: "flex", alignItems: "center", gap: "6px" }}>
                🧾 سجل كافة مسحوبات وسلفيات الشركاء
              </span>
              <button type="button" onClick={() => setShowAllLogsModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>

            {/* شريط الفلترة بالتاريخ */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#131317", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${themeStyles.border || "#282830"}`, marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>تصفية الفترة:</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="date" value={allFromDate} onChange={(e) => setAllFromDate(e.target.value)} style={{ background: "#131317", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "6px 10px", color: "#fff", fontSize: "12px", outline: "none" }} />
                <span style={{ fontSize: "12px", color: "#8e8e9c" }}>إلى</span>
                <input type="date" value={allToDate} onChange={(e) => setAllToDate(e.target.value)} style={{ background: "#131317", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "6px 10px", color: "#fff", fontSize: "12px", outline: "none" }} />
                {(allFromDate || allToDate) && (
                  <button type="button" onClick={() => { setAllFromDate(""); setAllToDate(""); }} style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}>إلغاء</button>
                )}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                  <th style={{ padding: "8px 10px" }}>التاريخ</th>
                  <th style={{ padding: "8px 10px" }}>الشريك والكود</th>
                  <th style={{ padding: "8px 10px" }}>المبلغ</th>
                  <th style={{ padding: "8px 10px" }}>البيان والملاحظات</th>
                  <th style={{ padding: "8px 10px" }}>الحالة</th>
                  <th style={{ padding: "8px 10px", textAlign: "center" }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#8e8e9c" }}>لا توجد مسحوبات مسجلة في هذه الفترة</td>
                  </tr>
                ) : (
                  filteredAllLogs.map((w) => (
                    <tr key={w.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                      <td style={{ padding: "8px 10px" }}>{w.date}</td>
                      <td style={{ padding: "8px 10px", color: themeStyles.accentGold || "#e8cd9c", fontWeight: 800 }}>{w.partner_name} (#PART-{w.partner_id})</td>
                      <td style={{ padding: "8px 10px", color: w.is_settled ? "#10b981" : "#f87171", fontWeight: 800 }}>{Number(w.amount).toLocaleString()} ج.م</td>
                      <td style={{ padding: "8px 10px", color: "#8e8e9c" }}>{w.notes || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          background: w.is_settled ? "rgba(255, 255, 255, 0.05)" : "rgba(248, 113, 113, 0.15)",
                          color: w.is_settled ? "#8e8e9c" : "#f87171",
                          padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700
                        }}>
                          {w.is_settled ? "مسواة" : "سلفة قائمة"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        <button type="button" onClick={() => handleDeleteWithdrawalLog(w.id)} style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.25)", color: "#f87171", padding: "3px 7px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>حذف</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة 2: سجل سحوبات الشريك الفردي المرتبط بـ ID الخاص به */}
      {showSingleModal && selectedPartnerForLogs && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "600px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
                🧾 سجل سحوبات: {selectedPartnerForLogs.name} (#PART-{selectedPartnerForLogs.id})
              </span>
              <button type="button" onClick={() => setShowSingleModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>

            <div style={{ background: "#131317", border: `1px solid ${themeStyles.border || "#282830"}`, padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#8e8e9c" }}>إجمالي السلف القائمة غير المسواة:</span>
              <strong style={{ color: "#f87171", fontSize: "15px" }}>{selectedPartnerForLogs.activeAdvance.toLocaleString()} ج.م</strong>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                  <th style={{ padding: "8px 10px" }}>التاريخ</th>
                  <th style={{ padding: "8px 10px" }}>المبلغ</th>
                  <th style={{ padding: "8px 10px" }}>البيان والملاحظات</th>
                  <th style={{ padding: "8px 10px" }}>الحالة</th>
                  <th style={{ padding: "8px 10px", textAlign: "center" }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {singlePartnerLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#8e8e9c" }}>لا توجد سحوبات مسجلة لهذا الشريك.</td>
                  </tr>
                ) : (
                  singlePartnerLogs.map((w) => (
                    <tr key={w.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                      <td style={{ padding: "8px 10px" }}>{w.date}</td>
                      <td style={{ padding: "8px 10px", color: w.is_settled ? "#10b981" : "#f87171", fontWeight: 800 }}>{Number(w.amount).toLocaleString()} ج.م</td>
                      <td style={{ padding: "8px 10px", color: "#8e8e9c" }}>{w.notes || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          background: w.is_settled ? "rgba(255, 255, 255, 0.05)" : "rgba(248, 113, 113, 0.15)",
                          color: w.is_settled ? "#8e8e9c" : "#f87171",
                          padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700
                        }}>
                          {w.is_settled ? "مسواة" : "سلفة قائمة"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>
                        <button type="button" onClick={() => handleDeleteWithdrawalLog(w.id)} style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.25)", color: "#f87171", padding: "3px 7px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>حذف</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة 3: تعديل بيانات الشريك */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "480px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
                ✏️ تعديل بيانات: {editingPartner.name} (#PART-{editingPartner.id})
              </span>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>

            <form onSubmit={handleSaveEditPartner} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>اسم الشريك بالكامل *</label>
                <input type="text" value={editingPartner.name} onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>رأس المال المثبت (ج.م) *</label>
                <input type="number" step="1" value={editingPartner.capital} onChange={(e) => setEditingPartner({ ...editingPartner, capital: e.target.value })} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "13px", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>تاريخ الانضمام *</label>
                <input type="date" value={editingPartner.join_date} onChange={(e) => setEditingPartner({ ...editingPartner, join_date: e.target.value })} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer", marginTop: "4px" }}>
                {submitting ? "جاري الحفظ..." : "حفظ وتحديث بيانات الشريك بالسحابة"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default PartnersScreen;
