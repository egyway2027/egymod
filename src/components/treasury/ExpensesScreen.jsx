import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, Trash2, Plus, Calendar, Loader2, FileText } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function ExpensesScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);

  // عناصر النموذج
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("إيجار المحل");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // الفلترة بالتاريخ
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // جلب المصروفات من السحابة
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error("❌ خطأ في جلب المصروفات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // إضافة مصروف جديد
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from("expenses").insert([{
        category,
        amount: numAmount,
        date: date || new Date().toISOString().split("T")[0],
        notes,
        is_settled: false
      }]);

      if (error) throw error;

      setAmount("");
      setNotes("");
      await loadExpenses();
    } catch (err) {
      console.error("❌ خطأ في إضافة المصروف:", err);
      alert("حدث خطأ أثناء حفظ المصروف بالسحابة.");
    } finally {
      setSubmitting(false);
    }
  };

  // حذف مصروف
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("❌ خطأ في حذف المصروف:", err);
    }
  };

  // المبالغ المفلترة
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      return true;
    });
  }, [expenses, fromDate, toDate]);

  const totalFilteredSum = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [filteredExpenses]);

  // 📊 إحصائيات لوحة التحكم اللحظية للمصروفات
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const currentMonthStr = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => (e.date || "").startsWith(todayStr));
  }, [expenses, todayStr]);

  const todaySum = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [todayExpenses]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => (e.date || "").startsWith(currentMonthStr));
  }, [expenses, currentMonthStr]);

  const monthSum = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [monthExpenses]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    let total = 0;
    expenses.forEach((e) => {
      const cat = e.category || "مصروفات أخرى";
      const amt = Number(e.amount || 0);
      map[cat] = (map[cat] || 0) + amt;
      total += amt;
    });

    const colors = {
      "إيجار المحل": "#d69a5f",
      "كهرباء ومياه وغاز": "#38bdf8",
      "رواتب ونثريات": "#a855f7",
      "صيانة وإصلاحات": "#f43f5e",
      "مصروفات أخرى": "#10b981"
    };

    return Object.keys(map).map((cat) => ({
      name: cat,
      amount: map[cat],
      percentage: total > 0 ? Math.round((map[cat] / total) * 100) : 0,
      color: colors[cat] || "#d69a5f"
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const topCategory = useMemo(() => {
    return categoryBreakdown[0] || { name: "لا يوجد", percentage: 0 };
  }, [categoryBreakdown]);

  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 3);
  }, [expenses]);

  const addQuickAmount = (val) => {
    setAmount((prev) => String((parseFloat(prev) || 0) + val));
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "8px 20px", fontFamily: "'Cairo', 'Tajawal', sans-serif", boxSizing: "border-box" }}>
      {/* 1. الشريط العلوي الرئيسي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", paddingBottom: "6px", borderBottom: `1px solid ${themeStyles.border || "#232328"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>💸</span>
          <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "22px", fontWeight: 800 }}>
            لوحة إدارة المصروفات العامة والتحليل المالي
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: themeStyles.card || "#18181c",
              border: `1px solid ${themeStyles.border || "#333333"}`,
              color: themeStyles.accentGold || "#e8cd9c",
              padding: "8px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "13px"
            }}
          >
            <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
            <span>رجوع</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: themeStyles.card || "#18181c",
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
      </div>

      {/* 2. شريط فتح السجل المالي الشامل المميز */}
      <div
        onClick={() => setShowExpensesModal(true)}
        style={{
          background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)",
          borderRadius: "12px",
          padding: "9px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          boxShadow: "0 8px 24px rgba(176, 106, 53, 0.25)",
          cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", background: "rgba(0,0,0,0.25)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
            📊
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
              سجل المصروفات المالي الشامل (الأرشيف العام)
            </h3>
            <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.85)", margin: "3px 0 0 0" }}>
              عرض تفصيلي لجميع السجلات والفلترة المتقدمة حسب التاريخ والبنود وطباعة الكشوفات
            </p>
          </div>
        </div>
        <div style={{ background: "#111113", color: themeStyles.accentGold || "#e8cd9c", padding: "8px 18px", borderRadius: "9px", fontWeight: 800, fontSize: "12.5px", border: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" }}>
          [ 🧾 فتح السجل المالي الشامل ]
        </div>
      </div>

      {/* 3. كروت المؤشرات المالية الثلاثية (KPIs) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "10px" }}>
        {/* كارت 1: مصروفات اليوم */}
        <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: "#38bdf8" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
            ☀️
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#9a9aa4", marginBottom: "4px" }}>مصروفات اليوم</div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
              {todaySum.toLocaleString()} <span style={{ fontSize: "12px", color: "#38bdf8" }}>ج.م</span>
            </div>
            <div style={{ fontSize: "10.5px", color: "#777782", marginTop: "2px" }}>
              {todayExpenses.length} حركات مسجلة خلال وردية اليوم
            </div>
          </div>
        </div>

        {/* كارت 2: مصروفات الشهر */}
        <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: "#f87171" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(248, 113, 113, 0.12)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
            📅
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#9a9aa4", marginBottom: "4px" }}>إجمالي مصروفات الشهر الحالي</div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
              {monthSum.toLocaleString()} <span style={{ fontSize: "12px", color: "#f87171" }}>ج.م</span>
            </div>
            <div style={{ fontSize: "10.5px", color: "#777782", marginTop: "2px" }}>
              {monthExpenses.length} حركات مسجلة خلال الشهر
            </div>
          </div>
        </div>

        {/* كارت 3: البند الأكثر استهلاكاً */}
        <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: "#d69a5f" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(214, 154, 95, 0.12)", color: "#d69a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
            🏆
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#9a9aa4", marginBottom: "4px" }}>البند الأكثر استهلاكاً</div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: themeStyles.accentGold || "#e8cd9c" }}>
              {topCategory.name}
            </div>
            <div style={{ fontSize: "10.5px", color: "#777782", marginTop: "2px" }}>
              يشكل {topCategory.percentage}% من إجمالي ميزانية المصروفات
            </div>
          </div>
        </div>
      </div>

      {/* 4. التقسيم الثنائي الرئيسي للوحة التحكم */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "12px" }}>
        
        {/* أ) الجانب الأيمن: نموذج تسجيل المصروف */}
        <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", paddingBottom: "8px", borderBottom: `1px solid ${themeStyles.border || "#25252c"}` }}>
            <span>✍️</span>
            <span>تسجيل حركة مصروف جديدة بالسحابة</span>
          </div>

          <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", color: "#b0b0b8", marginBottom: "6px", fontWeight: 700 }}>تاريخ المصروف *</label>
              <CustomDatePicker value={date} onChange={setDate} themeStyles={themeStyles} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", color: "#b0b0b8", marginBottom: "6px", fontWeight: 700 }}>بند المصروف الرئيسي *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#2c2c34"}`, borderRadius: "11px", padding: "11px 14px", color: "#ffffff", outline: "none", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", boxSizing: "border-box" }}
              >
                <option value="إيجار المحل">إيجار المحل</option>
                <option value="كهرباء ومياه وغاز">كهرباء ومياه وغاز</option>
                <option value="رواتب ونثريات">رواتب ونثريات</option>
                <option value="صيانة وإصلاحات">صيانة وإصلاحات</option>
                <option value="بوفيه وضيافة">بوفيه وضيافة</option>
                <option value="مصروفات نقل وبضاعة">مصروفات نقل وبضاعة</option>
                <option value="مصروفات أخرى">مصروفات أخرى</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", color: "#b0b0b8", marginBottom: "6px", fontWeight: 700 }}>المبلغ المطلوب تسجيله (ج.م) *</label>
              <input
                type="number"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#2c2c34"}`, borderRadius: "11px", padding: "11px 14px", color: "#ffffff", outline: "none", fontSize: "16px", fontWeight: 800, boxSizing: "border-box" }}
              />
              
              {/* أزرار الإضافة السريعة */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "10.5px", color: "#888888", marginLeft: "4px" }}>إضافة سريعة:</span>
                {[50, 100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addQuickAmount(val)}
                    style={{ background: "#131317", border: `1px solid ${themeStyles.border || "#2e2e38"}`, color: themeStyles.accentGold || "#d69a5f", padding: "4px 9px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", color: "#b0b0b8", marginBottom: "6px", fontWeight: 700 }}>ملاحظات وبيان المصروف</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب تفاصيل الفاتورة أو المستلم..."
                style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#2c2c34"}`, borderRadius: "11px", padding: "11px 14px", color: "#ffffff", outline: "none", fontSize: "13.5px", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "14.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "6px",
                boxShadow: "0 6px 20px rgba(176, 106, 53, 0.3)"
              }}
            >
              <Plus size={18} />
              <span>{submitting ? "جاري الحفظ بالسحابة..." : "حفظ المصروف بالسحابة وتحديث الخزينة"}</span>
            </button>
          </form>
        </div>

        {/* ب) الجانب الأيسر: التحليل النسبي + آخر الحركات */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* كارت التحليل النسبي */}
          <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", paddingBottom: "8px", borderBottom: `1px solid ${themeStyles.border || "#25252c"}` }}>
              <span>📈</span>
              <span>التحليل النسبي وتوزيع المصروفات حسب البند</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              {categoryBreakdown.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888894", fontSize: "13px", padding: "20px 0" }}>لا توجد بيانات مسجلة بعد</div>
              ) : (
                categoryBreakdown.slice(0, 4).map((cat, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                      <span style={{ color: "#ffffff" }}>{cat.name}</span>
                      <span style={{ color: cat.color }}>{cat.amount.toLocaleString()} ج.م ({cat.percentage}%)</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#121215", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cat.percentage}%`, background: cat.color, borderRadius: "6px" }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* كارت آخر الحركات المسجلة */}
          <div style={{ background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", flex: 1, overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", borderBottom: `1px solid ${themeStyles.border || "#25252c"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
                <span>🕒</span>
                <span>آخر الحركات المسجلة</span>
              </div>
              <span style={{ fontSize: "11px", color: "#888894", fontWeight: 600 }}>تحديث لحظي</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              {recentExpenses.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888894", fontSize: "13px", padding: "20px 0" }}>لا توجد مصروفات مسجلة بعد</div>
              ) : (
                recentExpenses.map((exp) => (
                  <div key={exp.id} style={{ background: "#131317", border: `1px solid ${themeStyles.border || "#23232a"}`, borderRadius: "10px", padding: "7px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(214, 154, 95, 0.12)", color: themeStyles.accentGold || "#d69a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                        💸
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>{exp.category}</div>
                        <div style={{ fontSize: "11px", color: "#888894" }}>{exp.date} {exp.notes ? `• ${exp.notes}` : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#f87171" }}>- {Number(exp.amount).toLocaleString()} ج.م</div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#fca5a5", padding: "4px 8px", borderRadius: "7px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 5. 🧾 نافذة سجل المصروفات المالي الشامل (Modal كامل الشاشة) */}
      {showExpensesModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }} dir={isEN ? "ltr" : "rtl"}>
          <div style={{ width: "95vw", maxWidth: "1350px", height: "90vh", minHeight: "650px", background: themeStyles.card || "#18181c", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "18px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.85)" }}>
            
            {/* هيدر النافذة المنبثقة */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${themeStyles.border || "#282830"}`, background: themeStyles.inputBg || "#121215" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={19} /> سجل المصروفات المالي الشامل (الإجمالي: {totalFilteredSum.toLocaleString()} ج.م)
              </h3>
              <button type="button" onClick={() => setShowExpensesModal(false)} style={{ width: "34px", height: "34px", borderRadius: "50%", background: themeStyles.card || "#222", border: `1px solid ${themeStyles.border || "#333"}`, color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
              {/* شريط الفلترة */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", background: themeStyles.inputBg || "#141414", padding: "12px 18px", borderRadius: "12px", border: `1px solid ${themeStyles.border || "#333"}`, flexWrap: "wrap", gap: "12px" }}>
                <span style={{ color: themeStyles.accentGold || "#d4af37", fontSize: "13.5px", fontWeight: 800 }}>تصفية الفترة:</span>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: "160px" }}>
                    <CustomDatePicker value={fromDate} onChange={setFromDate} themeStyles={themeStyles} placeholder="من تاريخ" />
                  </div>
                  <span style={{ color: themeStyles.subText || "#aaaaaa", fontSize: "12px", fontWeight: 700 }}>إلى</span>
                  <div style={{ width: "160px" }}>
                    <CustomDatePicker value={toDate} onChange={setToDate} themeStyles={themeStyles} placeholder="إلى تاريخ" />
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: themeStyles.accentGold || "#e8cd9c" }}>
                  <Loader2 size={24} className="animate-spin" /> جاري التحميل...
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                        <th style={{ padding: "12px" }}>التاريخ</th>
                        <th style={{ padding: "12px" }}>البند الرئيسي</th>
                        <th style={{ padding: "12px" }}>المبلغ</th>
                        <th style={{ padding: "12px" }}>البيان والملاحظات</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: themeStyles.subText || "#aaaaaa" }}>
                            لا توجد مصروفات مسجلة في هذه الفترة.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((exp) => (
                          <tr key={exp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                            <td style={{ padding: "12px" }}>{exp.date}</td>
                            <td style={{ padding: "12px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{exp.category}</td>
                            <td style={{ padding: "12px", fontWeight: 800, color: "#f87171" }}>{Number(exp.amount).toLocaleString()} ج.م</td>
                            <td style={{ padding: "12px", color: themeStyles.subText || "#aaaaaa" }}>{exp.notes || "—"}</td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(exp.id)}
                                style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#fca5a5", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}
                              >
                                <Trash2 size={12} /> حذف
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 📅 مكون اختيار التاريخ المخصص (مطابق لشاشة إضافة عميل)
function CustomDatePicker({ value, onChange, themeStyles = {}, placeholder = "سنة - شهر - يوم" }) {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef(null);

  const initDate = value ? new Date(value) : new Date();
  const validInit = isNaN(initDate.getTime()) ? new Date() : initDate;
  const [viewYear, setViewYear] = useState(validInit.getFullYear());
  const [viewMonth, setViewMonth] = useState(validInit.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const handleSetToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const d = new Date(value);
    if (isNaN(d.getTime())) return false;
    return (
      d.getFullYear() === viewYear &&
      d.getMonth() === viewMonth &&
      d.getDate() === day
    );
  };

  const weekHeaders = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          background: themeStyles.inputBg || "#141414",
          border: `1px solid ${open ? (themeStyles.accentGold || "#d4af37") : (themeStyles.border || "#333333")}`,
          borderRadius: "10px",
          padding: "10px 14px",
          color: value ? (themeStyles.text || "#ffffff") : (themeStyles.subText || "#888888"),
          fontSize: "13.5px",
          fontWeight: value ? 700 : 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          userSelect: "none"
        }}
      >
        <span>{value || placeholder}</span>
        <Calendar size={16} color={themeStyles.subText || "#aaaaaa"} />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 10000,
            width: "280px",
            background: themeStyles.card || "#19191d",
            border: `1px solid ${themeStyles.border || "#333333"}`,
            borderRadius: "14px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
            padding: "14px",
            boxSizing: "border-box",
            fontFamily: "inherit"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              padding: "0 4px"
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              style={{
                background: "transparent",
                border: "none",
                color: themeStyles.subText || "#aaaaaa",
                fontSize: "16px",
                cursor: "pointer",
                padding: "4px 8px"
              }}
            >
              ❯
            </button>
            <span style={{ fontSize: "14px", fontWeight: 800, color: themeStyles.text || "#ffffff" }}>
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                background: "transparent",
                border: "none",
                color: themeStyles.subText || "#aaaaaa",
                fontSize: "16px",
                cursor: "pointer",
                padding: "4px 8px"
              }}
            >
              ❮
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              gap: "4px",
              marginBottom: "8px",
              fontSize: "11px",
              fontWeight: 700,
              color: themeStyles.subText || "#888888"
            }}
          >
            {weekHeaders.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
              textAlign: "center"
            }}
          >
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const sel = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    background: sel ? (themeStyles.accentGold || "#d4af37") : "transparent",
                    color: sel ? "#111111" : (themeStyles.text || "#ffffff"),
                    border: "none",
                    borderRadius: "8px",
                    padding: "7px 0",
                    fontSize: "12.5px",
                    fontWeight: sel ? 800 : 600,
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    if (!sel) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!sel) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: `1px solid ${themeStyles.border || "#2a2a30"}`
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "transparent",
                border: "none",
                color: "#f87171",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              مسح
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              style={{
                background: "transparent",
                border: "none",
                color: themeStyles.accentGold || "#d4af37",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              اليوم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensesScreen;
