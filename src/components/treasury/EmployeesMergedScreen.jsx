import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, X, UserCheck, Archive, DollarSign, Edit3, UserX, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

export function EmployeesMergedScreen({ onBack, t = {}, themeStyles = {} }) {
  const isEN = document.documentElement.lang === "en" || document.documentElement.dir === "ltr";

  const [activeTab, setActiveTab] = useState("active"); // "active" | "salaries" | "archived"
  const [employees, setEmployees] = useState([]);
  const [salaryLog, setSalaryLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // نـوافذ المودال
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [empForm, setEmpForm] = useState({
    name: "",
    national_id: "",
    phone: "",
    address: "",
    job: "",
    salary: "",
    hire_date: new Date().toISOString().split("T")[0]
  });

  const [showTransModal, setShowTransModal] = useState(false);
  const [transTarget, setTransTarget] = useState({ id: null, name: "" });
  const [transForm, setTransForm] = useState({
    type: "سلفة نقدية",
    amount: "",
    notes: ""
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTarget, setHistoryTarget] = useState({ id: null, name: "" });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);

  // جلب البيانات من السحابة
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

  // العمليات المحاسبية والمؤشرات اللحظية
  const activeEmployees = useMemo(() => employees.filter((e) => e.status !== "terminated"), [employees]);
  const archivedEmployees = useMemo(() => employees.filter((e) => e.status === "terminated"), [employees]);

  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const currentMonthSalaries = useMemo(() => {
    return salaryLog.filter((s) => (s.date || "").startsWith(currentMonthStr));
  }, [salaryLog, currentMonthStr]);

  const totalBaseSalaries = useMemo(() => {
    return activeEmployees.reduce((sum, e) => sum + Number(e.salary || 0), 0);
  }, [activeEmployees]);

  const currentMonthAdvances = useMemo(() => {
    return currentMonthSalaries
      .filter((s) => s.type === "سلفة نقدية" || s.type?.includes("سلفة"))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }, [currentMonthSalaries]);

  const netBonusesDeductions = useMemo(() => {
    const bonuses = currentMonthSalaries
      .filter((s) => s.type === "مكافأة حافز" || s.type?.includes("مكافأة"))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const deductions = currentMonthSalaries
      .filter((s) => s.type === "خصم جزاء" || s.type?.includes("خصم"))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    return bonuses - deductions;
  }, [currentMonthSalaries]);

  // حساب سلفيات موظف محدد للشهر الحالي
  const getEmpMonthAdvance = (empId) => {
    return currentMonthSalaries
      .filter((s) => Number(s.employee_id) === Number(empId) && (s.type === "سلفة نقدية" || s.type?.includes("سلفة")))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
  };

  // فلترة الموظفين النشطين
  const filteredActiveEmployees = useMemo(() => {
    if (!searchQuery.trim()) return activeEmployees;
    const q = searchQuery.toLowerCase();
    return activeEmployees.filter((e) =>
      (e.name || "").toLowerCase().includes(q) ||
      (e.job || "").toLowerCase().includes(q) ||
      (e.phone || "").includes(q) ||
      String(e.id).includes(q)
    );
  }, [activeEmployees, searchQuery]);

  // سحوبات الموظف المعروض في مودال السجل
  const targetEmpHistory = useMemo(() => {
    if (!historyTarget.id) return [];
    return salaryLog.filter((s) => Number(s.employee_id) === Number(historyTarget.id));
  }, [salaryLog, historyTarget.id]);

  const targetEmpTotalAdvances = useMemo(() => {
    return targetEmpHistory
      .filter((s) => s.type === "سلفة نقدية" || s.type?.includes("سلفة"))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }, [targetEmpHistory]);

  // حفظ / تعديل بيانات الموظف
  const handleSaveEmp = async (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.salary) return;

    try {
      const payload = {
        name: empForm.name,
        national_id: empForm.national_id || "",
        phone: empForm.phone || "",
        address: empForm.address || "",
        job: empForm.job || "موظف",
        salary: Number(empForm.salary || 0),
        hire_date: empForm.hire_date || new Date().toISOString().split("T")[0],
        status: "active"
      };

      if (editingEmpId) {
        await supabase.from("employees").update(payload).eq("id", editingEmpId);
      } else {
        await supabase.from("employees").insert([payload]);
      }

      setShowEmpModal(false);
      setEditingEmpId(null);
      setEmpForm({ name: "", national_id: "", phone: "", address: "", job: "", salary: "", hire_date: new Date().toISOString().split("T")[0] });
      await loadData();
    } catch (err) {
      console.error("❌ خطأ في حفظ بيانات الموظف:", err);
      alert("حدث خطأ أثناء حفظ بيانات الموظف بالسحابة.");
    }
  };

  // تسجيل سلفة / راتب مباشر
  const handleSaveTrans = async (e) => {
    e.preventDefault();
    const num = Math.round(parseFloat(transForm.amount) || 0);
    if (!transTarget.id || num <= 0) return;

    try {
      await supabase.from("salary_log").insert([{
        employee_id: transTarget.id,
        employee_name: transTarget.name,
        type: transForm.type,
        amount: num,
        date: new Date().toISOString().split("T")[0],
        notes: transForm.notes || "",
        is_settled: false
      }]);

      setShowTransModal(false);
      setTransForm({ type: "سلفة نقدية", amount: "", notes: "" });
      await loadData();
    } catch (err) {
      console.error("❌ خطأ في تسجيل الحركة المالية:", err);
      alert("حدث خطأ أثناء تسجيل الحركة المالية بالسحابة.");
    }
  };

  // فسخ عقد / استعادة / حذف نهائي
  const handleTerminate = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من فسخ عقد الموظف (${name}) ونقله للأرشيف؟`)) return;
    await supabase.from("employees").update({ status: "terminated" }).eq("id", id);
    await loadData();
  };

  const handleReactivate = async (id) => {
    await supabase.from("employees").update({ status: "active" }).eq("id", id);
    await loadData();
  };

  const handleDeletePermanent = async (id) => {
    if (!window.confirm("🚨 تحذير: حذف الموظف نهائياً سيؤدي لمسح كافة بياناته وسجلاته المرتبطة! هل تريد الاستمرار؟")) return;
    await supabase.from("employees").delete().eq("id", id);
    await loadData();
  };

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
    <div dir={isEN ? "ltr" : "rtl"} style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "10px 20px", fontFamily: "'Cairo', 'Tajawal', sans-serif", boxSizing: "border-box" }}>
      
      {/* 1. الشريط العلوي */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
        <div style={{ fontSize: "19px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>👥</span>
          <span>لوحة إدارة طاقم العمل والرواتب والعهد المالية</span>
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

      {/* 2. كروت المؤشرات المالية والإدارية (أطول رأسياً ومتمركزة) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "14px" }}>
        
        {/* كارت 1: الكادر النشط */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "96px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#38bdf8" }} />
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", marginBottom: "4px" }}>👔</div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>الكادر الوظيفي النشط</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {activeEmployees.length} <span style={{ fontSize: "11px", color: "#38bdf8" }}>موظفين</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>الأرشيف: {archivedEmployees.length} موظف مفسوخ</div>
        </div>

        {/* كارت 2: مسير الرواتب */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "96px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#10b981" }} />
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", marginBottom: "4px" }}>💵</div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>مسير الرواتب الأساسية</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {totalBaseSalaries.toLocaleString()} <span style={{ fontSize: "11px", color: "#10b981" }}>ج.م</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>المستحق نهاية الشهر الحالي</div>
        </div>

        {/* كارت 3: سلفيات الشهر */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "96px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#f87171" }} />
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(248, 113, 113, 0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", marginBottom: "4px" }}>💸</div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>سلف ومسحوبات الشهر</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {currentMonthAdvances.toLocaleString()} <span style={{ fontSize: "11px", color: "#f87171" }}>ج.م</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>تُخصم تلقائياً عند التسوية</div>
        </div>

        {/* كارت 4: صافي الحوافز والخصومات */}
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", minHeight: "96px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#d69a5f" }} />
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(214, 154, 95, 0.15)", color: "#d69a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", marginBottom: "4px" }}>🎁</div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", marginBottom: "2px" }}>صافي الحوافز والخصومات</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
            {netBonusesDeductions > 0 ? `+${netBonusesDeductions.toLocaleString()}` : netBonusesDeductions.toLocaleString()} <span style={{ fontSize: "11px", color: "#d69a5f" }}>ج.م</span>
          </div>
          <div style={{ fontSize: "10px", color: "#727280", marginTop: "3px" }}>حوافز وجزاءات مسجلة هذا الشهر</div>
        </div>

      </div>

      {/* 3. شريط التحكم والتبويبات المميزة والبحث */}
      <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "12px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* التبويبات باللون الذهبي المميز */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              style={{
                background: activeTab === "active" ? "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)" : "#202028",
                border: `1px solid ${activeTab === "active" ? "rgba(255,255,255,0.2)" : "rgba(214, 154, 95, 0.3)"}`,
                color: activeTab === "active" ? "#ffffff" : themeStyles.accentGold || "#e8cd9c",
                padding: "8px 16px",
                borderRadius: "9px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "active" ? "0 4px 14px rgba(176, 106, 53, 0.35)" : "none"
              }}
            >
              <span>الموظفين النشطين</span>
              <span style={{ background: "rgba(0,0,0,0.3)", color: "#fff", padding: "1px 7px", borderRadius: "10px", fontSize: "10.5px" }}>{activeEmployees.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("salaries")}
              style={{
                background: activeTab === "salaries" ? "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)" : "#202028",
                border: `1px solid ${activeTab === "salaries" ? "rgba(255,255,255,0.2)" : "rgba(214, 154, 95, 0.3)"}`,
                color: activeTab === "salaries" ? "#ffffff" : themeStyles.accentGold || "#e8cd9c",
                padding: "8px 16px",
                borderRadius: "9px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "salaries" ? "0 4px 14px rgba(176, 106, 53, 0.35)" : "none"
              }}
            >
              <span>سجل الرواتب والسلف</span>
              <span style={{ background: "rgba(0,0,0,0.3)", color: "#fff", padding: "1px 7px", borderRadius: "10px", fontSize: "10.5px" }}>{salaryLog.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              style={{
                background: activeTab === "archived" ? "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)" : "#202028",
                border: `1px solid ${activeTab === "archived" ? "rgba(255,255,255,0.2)" : "rgba(214, 154, 95, 0.3)"}`,
                color: activeTab === "archived" ? "#ffffff" : themeStyles.accentGold || "#e8cd9c",
                padding: "8px 16px",
                borderRadius: "9px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeTab === "archived" ? "0 4px 14px rgba(176, 106, 53, 0.35)" : "none"
              }}
            >
              <span>أرشيف العقود</span>
              <span style={{ background: "rgba(0,0,0,0.3)", color: "#fff", padding: "1px 7px", borderRadius: "10px", fontSize: "10.5px" }}>{archivedEmployees.length}</span>
            </button>
          </div>

          {/* البحث بعد التبويبات مباشرة */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 بحث بالاسم، الوظيفة، الهاتف..."
            style={{
              background: themeStyles.inputBg || "#121215",
              border: `1px solid ${themeStyles.border || "#282830"}`,
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#fff",
              fontSize: "12px",
              outline: "none",
              width: "230px"
            }}
          />
        </div>

        {/* زر الإضافة في أقصى اليسار */}
        <button
          type="button"
          onClick={() => {
            setEditingEmpId(null);
            setEmpForm({ name: "", national_id: "", phone: "", address: "", job: "", salary: "", hire_date: new Date().toISOString().split("T")[0] });
            setShowEmpModal(true);
          }}
          style={{
            background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9px",
            padding: "8px 18px",
            fontSize: "12.5px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(176, 106, 53, 0.35)",
            whiteSpace: "nowrap"
          }}
        >
          <span>+</span>
          <span>إضافة موظف جديد</span>
        </button>

      </div>

      {/* 4. جداول العرض */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: themeStyles.accentGold || "#e8cd9c" }}>
          <Loader2 size={24} className="animate-spin" /> جاري جلب البيانات...
        </div>
      ) : (
        <div style={{ background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "14px", padding: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.35)", overflowX: "auto" }}>
          
          {/* تبويب 1: الموظفين النشطين */}
          {activeTab === "active" && (
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                  <th style={{ padding: "9px 10px", fontWeight: 800, whiteSpace: "nowrap" }}>الموظف والكود</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>الوظيفة / القسم</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>رقم الهاتف</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>الراتب الأساسي</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>سلف الشهر</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>صافي المستحق</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>تاريخ التعيين</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800, textAlign: "center" }}>إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody>
                {filteredActiveEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#8e8e9c" }}>لا يوجد موظفين نشطين مسجلين حالياً</td>
                  </tr>
                ) : (
                  filteredActiveEmployees.map((emp) => {
                    const monthAdvance = getEmpMonthAdvance(emp.id);
                    const netSalary = Number(emp.salary || 0) - monthAdvance;
                    const avatarText = emp.name ? emp.name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("") : "مو";

                    return (
                      <tr key={emp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                        <td style={{ padding: "9px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #d69a5f, #7a4a1f)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "11px", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
                              {avatarText}
                            </div>
                            <div>
                              <strong style={{ color: themeStyles.accentGold || "#e8cd9c", display: "block" }}>{emp.name}</strong>
                              <span style={{ fontSize: "10px", color: "#8e8e9c" }}>#EMP-{emp.id}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "9px 10px" }}>{emp.job || "موظف"}</td>
                        <td style={{ padding: "9px 10px" }}>{emp.phone || "—"}</td>
                        <td style={{ padding: "9px 10px", fontWeight: 800 }}>{Number(emp.salary || 0).toLocaleString()} ج.م</td>
                        <td style={{ padding: "9px 10px", fontWeight: 800, color: monthAdvance > 0 ? "#f87171" : "#8e8e9c" }}>
                          {monthAdvance > 0 ? `${monthAdvance.toLocaleString()} ج.م` : "—"}
                        </td>
                        <td style={{ padding: "9px 10px", fontWeight: 800, color: "#10b981" }}>
                          {netSalary.toLocaleString()} ج.م
                        </td>
                        <td style={{ padding: "9px 10px" }}>{emp.hire_date || "—"}</td>
                        <td style={{ padding: "9px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setTransTarget({ id: emp.id, name: emp.name });
                              setTransForm({ type: "سلفة نقدية", amount: "", notes: "" });
                              setShowTransModal(true);
                            }}
                            style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "3px" }}
                          >
                            💵 سلفة / راتب
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHistoryTarget({ id: emp.id, name: emp.name });
                              setShowHistoryModal(true);
                            }}
                            style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "3px" }}
                          >
                            🧾 سجل السحوبات
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileTarget(emp);
                              setShowProfileModal(true);
                            }}
                            style={{ background: "rgba(192, 132, 252, 0.08)", border: "1px solid rgba(192, 132, 252, 0.3)", color: "#c084fc", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "3px" }}
                          >
                            👤 كافة البيانات
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmpId(emp.id);
                              setEmpForm({
                                name: emp.name || "",
                                national_id: emp.national_id || "",
                                phone: emp.phone || "",
                                address: emp.address || "",
                                job: emp.job || "",
                                salary: emp.salary || "",
                                hire_date: emp.hire_date || new Date().toISOString().split("T")[0]
                              });
                              setShowEmpModal(true);
                            }}
                            style={{ background: "#1e1e24", border: "1px solid #33333e", color: themeStyles.accentGold || "#e8cd9c", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "3px" }}
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTerminate(emp.id, emp.name)}
                            style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#f87171", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                          >
                            🗄️ فسخ العقد
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* تبويب 2: سجل الرواتب والسلف العام */}
          {activeTab === "salaries" && (
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>التاريخ</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>اسم الموظف</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>نوع الحركة</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>المبلغ</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>البيان والملاحظات</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800, textAlign: "center" }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {salaryLog.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#8e8e9c" }}>لا توجد حركات مسجلة في سجل الرواتب والسلف</td>
                  </tr>
                ) : (
                  salaryLog.map((s) => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                      <td style={{ padding: "9px 10px" }}>{s.date}</td>
                      <td style={{ padding: "9px 10px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>{s.employee_name}</td>
                      <td style={{ padding: "9px 10px" }}>
                        <span style={{ background: s.type?.includes("سلفة") ? "rgba(248, 113, 113, 0.15)" : "rgba(16, 185, 129, 0.15)", color: s.type?.includes("سلفة") ? "#f87171" : "#10b981", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700 }}>
                          {s.type}
                        </span>
                      </td>
                      <td style={{ padding: "9px 10px", fontWeight: 800, color: s.type?.includes("سلفة") ? "#f87171" : "#10b981" }}>
                        {Number(s.amount).toLocaleString()} ج.م
                      </td>
                      <td style={{ padding: "9px 10px", color: themeStyles.subText || "#8e8e9c" }}>{s.notes || "—"}</td>
                      <td style={{ padding: "9px 10px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteSalaryLog(s.id)}
                          style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#f87171", padding: "3px 7px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* تبويب 3: أرشيف العقود */}
          {activeTab === "archived" && (
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.text || "#ffffff", textAlign: "right", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ background: themeStyles.inputBg || "#121215", color: "#f87171", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>اسم الموظف</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>الوظيفة السابقة</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>رقم الهاتف</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800 }}>الراتب الأخير</th>
                  <th style={{ padding: "9px 10px", fontWeight: 800, textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {archivedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#8e8e9c" }}>لا يوجد عقود مفسوخة في الأرشيف</td>
                  </tr>
                ) : (
                  archivedEmployees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                      <td style={{ padding: "9px 10px", fontWeight: 800, color: "#aaaaaa" }}>{emp.name}</td>
                      <td style={{ padding: "9px 10px" }}>{emp.job || "—"}</td>
                      <td style={{ padding: "9px 10px" }}>{emp.phone || "—"}</td>
                      <td style={{ padding: "9px 10px", fontWeight: 800 }}>{Number(emp.salary || 0).toLocaleString()} ج.م</td>
                      <td style={{ padding: "9px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => handleReactivate(emp.id)}
                          style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", marginLeft: "4px" }}
                        >
                          🔄 استعادة وتفعيل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePermanent(emp.id)}
                          style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#f87171", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          🗑️ مسح نهائي
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>
      )}

      {/* نافذة 1: إضافة / تعديل بيانات موظف */}
      {showEmpModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "520px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
                {editingEmpId ? `✏️ تعديل بيانات: ${empForm.name}` : "✍️ إضافة بيانات موظف جديد"}
              </span>
              <button type="button" onClick={() => setShowEmpModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>
            <form onSubmit={handleSaveEmp}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>الاسم الكامل *</label>
                <input type="text" value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} placeholder="أدخل اسم الموظف..." required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>بطاقة الرقم القومي (14 رقم)</label>
                  <input type="text" value={empForm.national_id} onChange={(e) => setEmpForm({ ...empForm, national_id: e.target.value })} placeholder="29xxxxxxxxxxxx" style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>رقم الهاتف *</label>
                  <input type="text" value={empForm.phone} onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} placeholder="01xxxxxxxxx" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>العنوان ومحل الإقامة بالتفصيل</label>
                <input type="text" value={empForm.address} onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })} placeholder="المحافظة - المنطقة - الشارع..." style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>الوظيفة / القسم *</label>
                  <input type="text" value={empForm.job} onChange={(e) => setEmpForm({ ...empForm, job: e.target.value })} placeholder="مثال: مسؤول تحصيل" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>الراتب الأساسي (ج.م) *</label>
                  <input type="number" step="1" value={empForm.salary} onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })} placeholder="0" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", fontWeight: 800, boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>تاريخ التعيين *</label>
                <input type="date" value={empForm.hire_date} onChange={(e) => setEmpForm({ ...empForm, hire_date: e.target.value })} required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>
                {editingEmpId ? "حفظ وتحديث التعديلات بالسحابة" : "حفظ بيانات الموظف بالسحابة"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة 2: تسجيل سلفة / راتب مباشر */}
      {showTransModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "480px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>💵 تسجيل حركة مالية</span>
              <button type="button" onClick={() => setShowTransModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>
            <form onSubmit={handleSaveTrans}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>الموظف المحدد</label>
                <input type="text" value={`${transTarget.name} (#EMP-${transTarget.id})`} readOnly style={{ width: "100%", background: "#1e1e24", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: themeStyles.accentGold || "#e8cd9c", fontSize: "13px", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>نوع الحركة المالية *</label>
                <select value={transForm.type} onChange={(e) => setTransForm({ ...transForm, type: e.target.value })} style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }}>
                  <option value="سلفة نقدية">سلفة نقدية (تخصم من الراتب)</option>
                  <option value="صرف راتب شهري">صرف راتب شهري</option>
                  <option value="مكافأة حافز">مكافأة / حافز إضافي</option>
                  <option value="خصم جزاء">خصم / جزاء</option>
                </select>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>المبلغ (ج.م) *</label>
                <input type="number" step="1" value={transForm.amount} onChange={(e) => setTransForm({ ...transForm, amount: e.target.value })} placeholder="0" required style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "14px", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#8e8e9c", display: "block", marginBottom: "4px" }}>ملاحظات وبيان الحركة</label>
                <input type="text" value={transForm.notes} onChange={(e) => setTransForm({ ...transForm, notes: e.target.value })} placeholder="اكتب سبب السلفة أو تفاصيل الإيصال..." style={{ width: "100%", background: themeStyles.inputBg || "#121215", border: `1px solid ${themeStyles.border || "#282830"}`, borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "12.5px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>
                تنفيذ الحركة وتحديث الخزينة والرواتب بالسحابة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة 3: سجل سحوبات الموظف المحدد المرتبطة بـ ID */}
      {showHistoryModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "650px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>
                🧾 كشف سحوبات وسلفيات: {historyTarget.name} (#EMP-{historyTarget.id})
              </span>
              <button type="button" onClick={() => setShowHistoryModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>
            
            <div style={{ background: "#131317", border: `1px solid ${themeStyles.border || "#282830"}`, padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#8e8e9c" }}>إجمالي سلفيات ومسحوبات الموظف:</span>
              <strong style={{ color: "#f87171", fontSize: "15px" }}>{targetEmpTotalAdvances.toLocaleString()} ج.م</strong>
            </div>

            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ background: themeStyles.inputBg || "#121215", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
                    <th style={{ padding: "8px 10px" }}>التاريخ</th>
                    <th style={{ padding: "8px 10px" }}>نوع الحركة</th>
                    <th style={{ padding: "8px 10px" }}>المبلغ</th>
                    <th style={{ padding: "8px 10px" }}>البيان والملاحظات</th>
                    <th style={{ padding: "8px 10px", textAlign: "center" }}>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {targetEmpHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#8e8e9c" }}>لا توجد سحوبات أو حركات مسجلة لهذا الموظف.</td>
                    </tr>
                  ) : (
                    targetEmpHistory.map((rec) => (
                      <tr key={rec.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#202026"}` }}>
                        <td style={{ padding: "8px 10px" }}>{rec.date}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ background: rec.type?.includes("سلفة") ? "rgba(248, 113, 113, 0.15)" : "rgba(16, 185, 129, 0.15)", color: rec.type?.includes("سلفة") ? "#f87171" : "#10b981", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700 }}>
                            {rec.type}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px", fontWeight: 800, color: rec.type?.includes("سلفة") ? "#f87171" : "#10b981" }}>
                          {Number(rec.amount).toLocaleString()} ج.م
                        </td>
                        <td style={{ padding: "8px 10px", color: themeStyles.subText || "#8e8e9c" }}>{rec.notes || "—"}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteSalaryLog(rec.id)}
                            style={{ background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#f87171", padding: "3px 7px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700, cursor: "pointer" }}
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
          </div>
        </div>
      )}

      {/* نافذة 4: عرض كافة بيانات الموظف (الملف الشخصي والبطاقة والعنوان) */}
      {showProfileModal && profileTarget && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
          <div style={{ width: "100%", maxWidth: "500px", background: themeStyles.card || "#18181d", border: `1px solid ${themeStyles.border || "#383844"}`, borderRadius: "14px", padding: "18px 20px", boxShadow: "0 16px 40px rgba(0,0,0,0.8)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "12px", borderBottom: `1px solid ${themeStyles.border || "#282830"}` }}>
              <span style={{ fontSize: "14.5px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c" }}>👤 الملف الوظيفي والشخصي الكامل</span>
              <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: "transparent", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" }}><X size={17} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#131317", padding: "14px", borderRadius: "10px", border: `1px solid ${themeStyles.border || "#282830"}`, marginBottom: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>اسم الموظف:</span>
                <span style={{ fontSize: "13px", color: themeStyles.accentGold || "#e8cd9c", fontWeight: 800 }}>{profileTarget.name}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>كود الموظف بالنظام:</span>
                <span style={{ fontSize: "13px", color: "#fff", fontWeight: 800 }}>#EMP-{profileTarget.id}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>الوظيفة / القسم:</span>
                <span style={{ fontSize: "12.5px", color: "#fff", fontWeight: 800 }}>{profileTarget.job || "—"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>رقم الهاتف:</span>
                <span style={{ fontSize: "12.5px", color: "#fff", fontWeight: 800 }}>{profileTarget.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", gridColumn: "1 / -1" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>بطاقة الرقم القومي:</span>
                <span style={{ fontSize: "13px", color: "#38bdf8", fontWeight: 800, fontFamily: "monospace", letterSpacing: "1px" }}>{profileTarget.national_id || "غير مسجل"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", gridColumn: "1 / -1" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>العنوان ومحل الإقامة:</span>
                <span style={{ fontSize: "12.5px", color: "#fff", fontWeight: 800 }}>{profileTarget.address || "غير مسجل"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>الراتب الشهري الأساسي:</span>
                <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 800 }}>{Number(profileTarget.salary || 0).toLocaleString()} ج.م</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10.5px", color: "#8e8e9c", fontWeight: 700 }}>تاريخ التعيين:</span>
                <span style={{ fontSize: "12.5px", color: "#fff", fontWeight: 800 }}>{profileTarget.hire_date || "—"}</span>
              </div>
            </div>

            <button type="button" onClick={() => setShowProfileModal(false)} style={{ width: "100%", background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 50%, #7a4a1f 100%)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>
              إغلاق الملف
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeesMergedScreen;
