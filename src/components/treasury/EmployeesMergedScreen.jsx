import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, UserCheck, Archive, DollarSign, Edit3, UserX, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function EmployeesMergedScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [activeTab, setActiveTab] = useState("employees"); // "employees" | "archived" | "salaries"
  const [employees, setEmployees] = useState([]);
  const [salaryLog, setSalaryLog] = useState([]);
  const [loading, setLoading] = useState(true);

  // نموذج الموظف
  const [empForm, setEmpForm] = useState({ name: "", phone: "", job: "", salary: "", hireDate: new Date().toISOString().split("T")[0] });
  const [editingId, setEditingId] = useState(null);

  // نموذج حركات الرواتب والسلف
  const [selectedEmpName, setSelectedEmpName] = useState("");
  const [transType, setType] = useState("صرف راتب شهري");
  const [transAmount, setAmount] = useState("");
  const [transNotes, setNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: empData }, { data: salData }] = await Promise.all([
        supabase.from("employees").select("*").order("id", { ascending: true }),
        supabase.from("salary_log").select("*").order("date", { ascending: false })
      ]);
      setEmployees(empData || []);
      setSalaryLog(salData || []);
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات الموظفين والرواتب:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeEmployees = useMemo(() => employees.filter((e) => e.status !== "terminated"), [employees]);
  const archivedEmployees = useMemo(() => employees.filter((e) => e.status === "terminated"), [employees]);

  // حفظ أو تعديل موظف
  const handleSaveEmp = async (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.salary) return;

    try {
      const payload = {
        name: empForm.name,
        phone: empForm.phone || "",
        job: empForm.job || "موظف",
        salary: Number(empForm.salary || 0),
        hire_date: empForm.hireDate,
        status: "active"
      };

      if (editingId) {
        await supabase.from("employees").update(payload).eq("id", editingId);
        setEditingId(null);
      } else {
        await supabase.from("employees").insert([payload]);
      }

      setEmpForm({ name: "", phone: "", job: "", salary: "", hireDate: new Date().toISOString().split("T")[0] });
      await loadData();
    } catch (err) {
      console.error("❌ خطأ في حفظ بيانات الموظف:", err);
    }
  };

  // فسخ عقد / استعادة / حذف
  const handleTerminate = async (id) => {
    if (!window.confirm("هل أنت متأكد من فسخ عقد الموظف ونقله للأرشيف؟")) return;
    await supabase.from("employees").update({ status: "terminated" }).eq("id", id);
    await loadData();
  };

  const handleReactivate = async (id) => {
    await supabase.from("employees").update({ status: "active" }).eq("id", id);
    await loadData();
  };

  const handleDeletePermanent = async (id) => {
    if (!window.confirm("🚨 تحذير: حذف الموظف نهائياً سيؤدي لمسح كافة بياناته! هل تريد الاستمرار؟")) return;
    await supabase.from("employees").delete().eq("id", id);
    await loadData();
  };

  // تسجيل حركة راتب / سلفة
  const handleTransSubmit = async (e) => {
    e.preventDefault();
    const num = Math.round(parseFloat(transAmount) || 0);
    const emp = activeEmployees.find((x) => x.name === selectedEmpName);
    if (!emp || num <= 0) return;

    try {
      await supabase.from("salary_log").insert([{
        employee_id: emp.id,
        employee_name: emp.name,
        type: transType,
        amount: num,
        date: new Date().toISOString().split("T")[0],
        notes: transNotes,
        is_settled: false
      }]);

      setAmount("");
      setNotes("");
      setSelectedEmpName("");
      await loadData();
    } catch (err) {
      console.error("❌ خطأ في تسجيل حركة الرواتب:", err);
    }
  };

  // حذف حركة راتب أو سلفة من السجل
  const handleDeleteSalaryLog = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الحركة من السجل؟")) return;
    try {
      await supabase.from("salary_log").delete().eq("id", id);
      await loadData();
    } catch (err) {
      console.error("❌ خطأ في حذف حركة الراتب:", err);
    }
  };

  return (
    <div dir={isEN ? "ltr" : "rtl"} style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "0 20px", fontFamily: "'Cairo', 'Tajawal', sans-serif", boxSizing: "border-box" }}>
      {/* الشريط العلوي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button type="button" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <ArrowRight size={16} style={{ transform: isEN ? "rotate(180deg)" : "none" }} />
          <span>رجوع</span>
        </button>
        <h2 style={{ color: themeStyles.accentGold || "#e8cd9c", margin: 0, fontSize: "20px", fontWeight: 800 }}>شؤون الموظفين والرواتب</h2>
        <button type="button" onClick={onBack} style={{ width: "36px", height: "36px", borderRadius: "50%", background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.subText || "#aaaaaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {/* التبويبات */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setActiveTab("employees")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1px solid ${themeStyles.border || "#333333"}`, background: activeTab === "employees" ? "linear-gradient(135deg, #d69a5f, #7a4a1f)" : themeStyles.card || "#1e1e1e", color: activeTab === "employees" ? "#ffffff" : themeStyles.subText || "#aaaaaa", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <UserCheck size={16} /> الموظفين النشطين ({activeEmployees.length})
        </button>
        <button type="button" onClick={() => setActiveTab("archived")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1px solid ${themeStyles.border || "#333333"}`, background: activeTab === "archived" ? "linear-gradient(135deg, #d69a5f, #7a4a1f)" : themeStyles.card || "#1e1e1e", color: activeTab === "archived" ? "#ffffff" : themeStyles.subText || "#aaaaaa", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <Archive size={16} /> أرشيف العقود المفسوخة ({archivedEmployees.length})
        </button>
        <button type="button" onClick={() => setActiveTab("salaries")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1px solid ${themeStyles.border || "#333333"}`, background: activeTab === "salaries" ? "linear-gradient(135deg, #d69a5f, #7a4a1f)" : themeStyles.card || "#1e1e1e", color: activeTab === "salaries" ? "#ffffff" : themeStyles.subText || "#aaaaaa", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <DollarSign size={16} /> رواتب وسلف الموظفين
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: themeStyles.accentGold || "#e8cd9c" }}>
          <Loader2 size={24} className="animate-spin" /> جاري جلب البيانات...
        </div>
      ) : (
        <>
          {activeTab === "employees" && (
            <div>
              {/* إضافة / تعديل موظف */}
              <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
                <form onSubmit={handleSaveEmp} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>اسم الموظف *</label>
                    <input type="text" value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} required placeholder="أدخل اسم الموظف..." style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>التليفون</label>
                    <input type="text" value={empForm.phone} onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} placeholder="01xxxxxxxxx" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>الوظيفة</label>
                    <input type="text" value={empForm.job} onChange={(e) => setEmpForm({ ...empForm, job: e.target.value })} placeholder="موظف مبيعات / تحصيل" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>الراتب الأساسي *</label>
                    <input type="number" step="1" value={empForm.salary} onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })} required placeholder="0" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800, boxSizing: "border-box" }} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "15px", fontWeight: 800, cursor: "pointer" }}>
                      {editingId ? "حفظ التعديلات" : "حفظ بيانات الموظف"}
                    </button>
                  </div>
                </form>
              </div>

              {/* الجدول */}
              <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                        <th style={{ padding: "10px" }}>الاسم</th>
                        <th style={{ padding: "10px" }}>التليفون</th>
                        <th style={{ padding: "10px" }}>الوظيفة</th>
                        <th style={{ padding: "10px" }}>الراتب</th>
                        <th style={{ padding: "10px" }}>تاريخ التعيين</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEmployees.map((emp) => (
                        <tr key={emp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                          <td style={{ padding: "10px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{emp.name}</td>
                          <td style={{ padding: "10px" }}>{emp.phone || "—"}</td>
                          <td style={{ padding: "10px" }}>{emp.job}</td>
                          <td style={{ padding: "10px", fontWeight: 800 }}>{Number(emp.salary).toLocaleString()} ج.م</td>
                          <td style={{ padding: "10px" }}>{emp.hire_date}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button type="button" onClick={() => { setEditingId(emp.id); setEmpForm({ name: emp.name, phone: emp.phone, job: emp.job, salary: emp.salary, hireDate: emp.hire_date }); }} style={{ background: "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, color: themeStyles.accentGold || "#e8cd9c", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}><Edit3 size={12} /> تعديل</button>
                              <button type="button" onClick={() => handleTerminate(emp.id)} style={{ background: "#3e1c24", border: "1px solid #ef444455", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}><UserX size={12} /> فسخ العقد</button>
                              <button type="button" onClick={() => handleDeletePermanent(emp.id)} style={{ background: "#3e1c24", border: "1px solid #ef444455", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}><Trash2 size={12} /> حذف</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "archived" && (
            <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: themeStyles.inputBg || "#141414", color: "#f87171", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                      <th style={{ padding: "10px" }}>الاسم</th>
                      <th style={{ padding: "10px" }}>التليفون</th>
                      <th style={{ padding: "10px" }}>الوظيفة</th>
                      <th style={{ padding: "10px" }}>الراتب الأخير</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedEmployees.map((emp) => (
                      <tr key={emp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                        <td style={{ padding: "10px", fontWeight: 800 }}>{emp.name}</td>
                        <td style={{ padding: "10px" }}>{emp.phone || "—"}</td>
                        <td style={{ padding: "10px" }}>{emp.job}</td>
                        <td style={{ padding: "10px" }}>{Number(emp.salary).toLocaleString()} ج.م</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <button type="button" onClick={() => handleReactivate(emp.id)} style={{ background: "#143820", border: "1px solid #22c55e55", color: "#4ade80", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}><RefreshCw size={12} /> إعادة تفعيل</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "salaries" && (
            <div>
              {/* نموذج الرواتب والسلف */}
              <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
                <form onSubmit={handleTransSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>اسم الموظف *</label>
                    <select value={selectedEmpName} onChange={(e) => setSelectedEmpName(e.target.value)} required style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }}>
                      <option value="">-- اختار اسم الموظف... --</option>
                      {activeEmployees.map((e) => <option key={e.id} value={e.name}>{e.name} ({e.job})</option>)}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%", boxSizing: "border-box" }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>نوع الحركة *</label>
                      <select value={transType} onChange={(e) => setType(e.target.value)} style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", boxSizing: "border-box" }}>
                        <option value="صرف راتب شهري">صرف راتب شهري</option>
                        <option value="سلفة نقدية">سلفة نقدية</option>
                        <option value="مكافأة حافز">مكافأة / حافز</option>
                        <option value="خصم جزاء">خصم / جزاء</option>
                      </select>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>المبلغ (ج.م) *</label>
                      <input type="number" step="1" value={transAmount} onChange={(e) => setAmount(e.target.value)} required placeholder="0" style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px", fontWeight: 800, boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: themeStyles.subText || "#aaaaaa", marginBottom: "6px", fontWeight: 700 }}>ملاحظات</label>
                    <input type="text" value={transNotes} onChange={(e) => setNotes(e.target.value)} placeholder="تفاصيل الحركة..." style={{ width: "100%", background: themeStyles.inputBg || "#141414", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "10px", padding: "10px 12px", color: themeStyles.text || "#ffffff", outline: "none", fontSize: "14px" }} />
                  </div>

                  <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "15px", fontWeight: 800, cursor: "pointer" }}>تنفيذ الحركة وحفظها بالسحابة</button>
                </form>
              </div>

              {/* سجل الحركة */}
              <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: "16px", padding: "20px" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "13.5px" }}>
                    <thead>
                      <tr style={{ background: themeStyles.inputBg || "#141414", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                        <th style={{ padding: "10px" }}>التاريخ</th>
                        <th style={{ padding: "10px" }}>الموظف</th>
                        <th style={{ padding: "10px" }}>النوع</th>
                        <th style={{ padding: "10px" }}>المبلغ</th>
                        <th style={{ padding: "10px" }}>ملاحظات</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryLog.map((s) => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#262626"}` }}>
                          <td style={{ padding: "10px" }}>{s.date}</td>
                          <td style={{ padding: "10px", fontWeight: 800 }}>{s.employee_name}</td>
                          <td style={{ padding: "10px" }}>{s.type}</td>
                          <td style={{ padding: "10px", fontWeight: 800, color: "#f87171" }}>{Number(s.amount).toLocaleString()} ج.م</td>
                          <td style={{ padding: "10px", color: themeStyles.subText || "#aaaaaa" }}>{s.notes || "—"}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button type="button" onClick={() => handleDeleteSalaryLog(s.id)} style={{ background: "#3e1c24", border: "1px solid #ef444455", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Trash2 size={12} /> حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployeesMergedScreen;
