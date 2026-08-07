import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, Trash2, Plus, Calendar, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function ExpensesScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ maxWidth: "1050px", margin: "0 auto", padding: "16px", fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* الشريط العلوي */}
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
          <span>رجوع</span>
        </button>

        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>
          المصروفات العامة
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

      {/* نموذج تسجيل المصروف */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
        <form onSubmit={handleAddExpense} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>التاريخ *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>البند *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }}
            >
              <option value="إيجار المحل">إيجار المحل</option>
              <option value="كهرباء ومياه وغاز">كهرباء ومياه وغاز</option>
              <option value="رواتب ونثريات">رواتب ونثريات</option>
              <option value="صيانة وإصلاحات">صيانة وإصلاحات</option>
              <option value="مصروفات أخرى">مصروفات أخرى</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>المبلغ (ج.م) *</label>
            <input
              type="number"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800 }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>ملاحظات</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تفاصيل المصروف..."
              style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d69a5f, #7a4a1f)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <Plus size={18} />
              <span>{submitting ? "جاري الحفظ..." : "تسجيل المصروف بالسحابة"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* سجل المصروفات والفلترة */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
            سجل المصروفات (الإجمالي: {totalFilteredSum.toLocaleString()} ج.م)
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.text || "#ffffff", padding: "6px 10px", borderRadius: "8px", fontSize: "12px" }}
            />
            <span style={{ color: themeStyles.subText || "#aaaaaa", fontSize: "12px" }}>إلى</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.text || "#ffffff", padding: "6px 10px", borderRadius: "8px", fontSize: "12px" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: themeStyles.accentGold || "#e8cd9c" }}>
            <Loader2 size={24} className="animate-spin" /> جاري التحميل...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                  <th style={{ padding: "10px" }}>التاريخ</th>
                  <th style={{ padding: "10px" }}>البند</th>
                  <th style={{ padding: "10px" }}>المبلغ</th>
                  <th style={{ padding: "10px" }}>ملاحظات</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: themeStyles.subText || "#aaaaaa" }}>
                      لا توجد مصروفات مسجلة في هذه الفترة.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                      <td style={{ padding: "10px" }}>{exp.date}</td>
                      <td style={{ padding: "10px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{exp.category}</td>
                      <td style={{ padding: "10px", fontWeight: 800, color: "#f87171" }}>{Number(exp.amount).toLocaleString()} ج.م</td>
                      <td style={{ padding: "10px", color: themeStyles.subText || "#aaaaaa" }}>{exp.notes || "—"}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          style={{ background: "#3e1c24", border: "1px solid #ef444455", color: "#f87171", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}
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
  );
}

export default ExpensesScreen;
