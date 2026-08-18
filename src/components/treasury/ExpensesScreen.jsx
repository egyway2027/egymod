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

      {/* زر فتح السجل الشامل */}
      <div style={{ marginBottom: "16px", maxWidth: "600px", margin: "0 auto 16px auto" }}>
        <button
          type="button"
          onClick={() => setShowExpensesModal(true)}
          style={{
            width: "100%",
            background: `linear-gradient(145deg, ${themeStyles.accentGold || "#d4af37"}, ${themeStyles.accent || "#c5a028"})`,
            color: "#111111",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            fontWeight: 800,
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <FileText size={18} /> [ 🧾 فتح سجل المصروفات الشامل ]
        </button>
      </div>

      {/* نموذج تسجيل المصروف */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>التاريخ *</label>
            <CustomDatePicker value={date} onChange={setDate} themeStyles={themeStyles} />
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

          <div style={{ marginTop: "6px" }}>
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

      {/* 🧾 نافذة سجل المصروفات الشامل (Modal) */}
      {showExpensesModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px", boxSizing: "border-box" }} dir={isEN ? "ltr" : "rtl"}>
          <div style={{ width: "100%", maxWidth: "1100px", maxHeight: "90vh", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            {/* هيدر النافذة المنبثقة */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${themeStyles.border || "#333"}`, background: themeStyles.inputBg || "#141414" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} /> سجل المصروفات الشامل (الإجمالي: {totalFilteredSum.toLocaleString()} ج.م)
              </h3>
              <button type="button" onClick={() => setShowExpensesModal(false)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: themeStyles.card || "#222", border: `1px solid ${themeStyles.border || "#333"}`, color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", background: themeStyles.inputBg || "#141414", padding: "12px", borderRadius: "10px", border: `1px solid ${themeStyles.border || "#333"}` }}>
                <span style={{ color: themeStyles.subText || "#aaa", fontSize: "13px", fontWeight: 700 }}>تصفية التاريخ:</span>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, maxWidth: "380px" }}>
            <div style={{ flex: 1 }}>
              <CustomDatePicker value={fromDate} onChange={setFromDate} themeStyles={themeStyles} placeholder="من تاريخ" />
            </div>
            <span style={{ color: themeStyles.subText || "#aaaaaa", fontSize: "12px", fontWeight: 700 }}>إلى</span>
            <div style={{ flex: 1 }}>
              <CustomDatePicker value={toDate} onChange={setToDate} themeStyles={themeStyles} placeholder="إلى تاريخ" />
            </div>
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
