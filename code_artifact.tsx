import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CreditCard, UserPlus, CalendarClock, Search, UserX, CloudUpload,
  KeyRound, Power, Wallet, TrendingUp, Calculator, ArrowRight,
  Trash2, CheckCircle2, X, Users, UserCog
} from "lucide-react";

const SUPABASE_URL = 'https://blijuizmqoprlrsuebgo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rw8Rym37iQoFRWkLXaDbfw_MaKL65Tc';
let supabase = null;

export default function AppLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      setReady(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setReady(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  if (!ready) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center min-h-screen bg-[#1b1b1d] text-[#d0b689] font-['Cairo']">
        <div className="w-12 h-12 border-4 border-[#d0b689] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">جاري تأمين الاتصال بقاعدة البيانات السحابية...</h2>
      </div>
    );
  }
  return <EgymodApp />;
}

/* ============================================================
   نظام إدارة الأقساط — النسخة السحابية المتكاملة
   ============================================================ */

function calculateContract({ cost, sale, down, monthly }) {
  const profit = sale - cost;
  const remaining = sale - down;
  const installmentsCount = monthly > 0 ? Math.round(remaining / monthly) : 0;
  return { profit, remaining, installmentsCount };
}

function monthsPassedSince(firstDateStr, today) {
  const firstDate = new Date(firstDateStr);
  if (isNaN(firstDate)) return 0;
  let months = (today.getFullYear() - firstDate.getFullYear()) * 12 + (today.getMonth() - firstDate.getMonth());
  if (today.getDate() < firstDate.getDate()) months -= 1;
  months += 1;
  return Math.max(0, months);
}

function computeDues(client, today) {
  const monthsPassed = monthsPassedSince(client.firstPayDate, today);
  const requiredAmount = client.monthly * monthsPassed;
  const paidAmount = client.totalPaid;
  const debtAmount = Math.max(0, requiredAmount - paidAmount);
  return { monthsPassed, requiredAmount, paidAmount, debtAmount };
}

function nextDueDate(client) {
  const firstDate = new Date(client.firstPayDate);
  if (isNaN(firstDate) || client.monthly <= 0) return null;
  const paidCount = Math.floor(client.totalPaid / client.monthly);
  const d = new Date(firstDate);
  d.setMonth(d.getMonth() + paidCount);
  return d;
}

const fmt = (n) => new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(Math.round(n || 0));

function addOneMonth(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

const seedPartners = [
  { id: 1, name: "مصطفى جمال", capital: 100000, profit: 12000, withdrawals: 5000 },
  { id: 2, name: "خالد فتحي", capital: 50000, profit: 6000, withdrawals: 0 },
];
const seedExpenses = [{ id: 1, date: "2026-07-01", category: "إيجار المحل", amount: 3000, notes: "" }];
const seedEmployees = [{ id: 1, name: "سعيد عبد الله", phone: "01011112222", job: "محصل", salary: 3500, hireDate: "2025-01-01" }];

const emptyForm = { name: "", phone: "", guarantor: "", guarantorPhone: "", item: "", cost: "", sale: "", down: "", monthly: "", contractDate: "", firstPayDate: "", notes: "" };

/* ============================================================
   مكون البحث الحي
   ============================================================ */
function NameComboBox({ items, getLabel, getSecondary, onSelect, placeholder, selectedLabel, onClear }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (selectedLabel) {
    return (
      <div style={styles.selectedChip}>
        <span>{selectedLabel}</span>
        <button type="button" style={styles.selectedChipX} onClick={onClear}><X size={14} /></button>
      </div>
    );
  }

  const matches = text.trim() ? items.filter((it) => getLabel(it).includes(text.trim())).slice(0, 8) : items.slice(0, 8);

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <input
        style={styles.input} value={text} placeholder={placeholder}
        onFocus={() => setOpen(true)} onChange={(e) => { setText(e.target.value); setOpen(true); }}
      />
      {open && matches.length > 0 && (
        <div style={styles.suggestBox}>
          {matches.map((it, idx) => (
            <button type="button" key={idx} style={styles.suggestItem} onClick={() => { onSelect(it); setText(""); setOpen(false); }}>
              <span style={styles.suggestLabel}>{getLabel(it)}</span>
              {getSecondary && <span style={styles.suggestSecondary}>{getSecondary(it)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   المكون الرئيسي للتطبيق مع دعم سحابي ومصادقة
   ============================================================ */
function EgymodApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // login, register, reset
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [partners, setPartners] = useState(seedPartners);
  const [expenses] = useState(seedExpenses);
  const [employees, setEmployees] = useState(seedEmployees);
  const [salaryLog] = useState([]);
  const [today] = useState(new Date());
  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);

  // التحقق من الجلسة السحابية
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleUserSession(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleUserSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAuthView("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleUserSession(user) {
    setCurrentUser({ id: user.id, email: user.email, name: user.user_metadata?.name || user.email.split('@')[0] });
    loadCloudData(user.id);
  }

  async function loadCloudData(userId) {
    try {
      const [cRes, pRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('payments').select('*')
      ]);
      if (cRes.data && cRes.data.length > 0) {
        setClients(cRes.data.map(c => ({
          id: c.id, name: c.name, phone: c.phone, guarantor: c.guarantor, guarantorPhone: c.guarantor_phone,
          item: c.item, cost: Number(c.cost), sale: Number(c.sale), down: Number(c.down), monthly: Number(c.monthly),
          contractDate: c.contract_date, firstPayDate: c.first_pay_date, totalPaid: Number(c.total_paid || 0), notes: c.notes
        })));
      }
      if (pRes.data && pRes.data.length > 0) {
        setPayments(pRes.data.map(p => ({
          id: p.id, clientId: p.client_id, clientName: p.client_name, item: p.item, amount: Number(p.amount), remainingAfter: Number(p.remaining_after || 0)
        })));
      }
    } catch (err) {
      console.error("Cloud load error:", err);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    else notify("تم تسجيل الدخول بنجاح!");
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signUp({
      email: authEmail, password: authPassword, options: { data: { name: authName } }
    });
    if (error) setAuthError(error.message);
    else { notify("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن."); setAuthView("login"); }
  }

  async function handleReset(e) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail);
    if (error) setAuthError(error.message);
    else notify("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    notify("تم تسجيل الخروج بنجاح.");
  }

  const rows = useMemo(() => {
    return clients.map((c) => {
      const dues = computeDues(c, today);
      const remaining = c.sale - c.down - c.totalPaid;
      const due = nextDueDate(c);
      return { ...c, ...dues, remaining, due };
    }).sort((a, b) => b.debtAmount - a.debtAmount);
  }, [clients, today]);

  const lateRows = useMemo(() => rows.filter((r) => r.debtAmount > 0), [rows]);

  const totals = useMemo(() => {
    const totalDebt = rows.reduce((s, r) => s + r.debtAmount, 0);
    const totalProfit = rows.reduce((s, r) => s + (r.sale - r.cost), 0);
    const totalPortfolio = rows.reduce((s, r) => s + r.remaining, 0);
    return { totalDebt, totalProfit, totalPortfolio };
  }, [rows]);

  const expensesTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const salariesPaidTotal = useMemo(() => salaryLog.reduce((s, x) => s + x.amount, 0), [salaryLog]);
  void expensesTotal; void salariesPaidTotal;

  function notify(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  }

  async function addClient(data) {
    if (!currentUser) return;
    const dbPayload = {
      user_id: currentUser.id, name: data.name, phone: String(data.phone || ""),
      guarantor: data.guarantor || "", guarantor_phone: String(data.guarantorPhone || ""),
      item: data.item, cost: Number(data.cost), sale: Number(data.sale), down: Number(data.down),
      monthly: Number(data.monthly), contract_date: data.contractDate, first_pay_date: data.firstPayDate,
      total_paid: 0, notes: data.notes || ""
    };
    const { data: res, error } = await supabase.from('clients').insert([dbPayload]).select().single();
    if (error) { notify("خطأ في حفظ العقد بالسحابة", "error"); return; }

    const newObj = {
      id: res.id, name: res.name, phone: res.phone, guarantor: res.guarantor, guarantorPhone: res.guarantor_phone,
      item: res.item, cost: Number(res.cost), sale: Number(res.sale), down: Number(res.down), monthly: Number(res.monthly),
      contractDate: res.contract_date, firstPayDate: res.first_pay_date, totalPaid: 0, notes: res.notes
    };
    setClients((prev) => [...prev, newObj]);
    notify("تم حفظ العقد بالسحابة بنجاح!");
    setScreen("dashboard");
  }

  async function recordPayment(clientId, amount) {
    if (!currentUser) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client || !amount || amount <= 0) return;
    const remainingBefore = client.sale - client.down - client.totalPaid;
    if (amount > remainingBefore) { notify("المبلغ أكبر من المديونية!", "error"); return; }

    const newTotalPaid = client.totalPaid + amount;
    const { error } = await supabase.from('clients').update({ total_paid: newTotalPaid }).eq('id', clientId);
    if (error) { notify("خطأ في تحديث السداد بالسحابة", "error"); return; }

    const payPayload = {
      user_id: currentUser.id, client_id: clientId, client_name: client.name,
      item: client.item, amount: amount, remaining_after: remainingBefore - amount
    };
    const { data: pRes } = await supabase.from('payments').insert([payPayload]).select().single();

    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, totalPaid: newTotalPaid } : c)));
    if (pRes) {
      setPayments((prev) => [...prev, { id: pRes.id, clientId, clientName: client.name, item: client.item, amount, remainingAfter: remainingBefore - amount }]);
    }
    notify("تم تسجيل السداد بنجاح!");
  }

  function addPartner(name, capital) {
    setPartners((prev) => [...prev, { id: Date.now(), name, capital: parseFloat(capital), profit: 0, withdrawals: 0 }]);
    notify("تم تسجيل بيانات الشريك الجديد بنجاح!");
    setScreen("dashboard");
  }

  function addEmployee(data) {
    setEmployees((prev) => [...prev, { id: Date.now(), ...data, salary: parseFloat(data.salary) }]);
    notify("تم حفظ بيانات الموظف بنجاح!");
    setScreen("dashboard");
  }

  // إذا لم يتم تسجيل الدخول، عرض شاشة المصادقة
  if (!currentUser) {
    return (
      <div dir="rtl" style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap');
          * { box-sizing: border-box; }
          input[type=password], input[type=email], input[type=text] { background: #1b1b1d; border: 1px solid #404040; border-radius: 10px; padding: 12px 14px; color: #fff; width: 100%; outline: none; font-family: inherit; }
        `}</style>
        {toast && <div style={styles.toast}>{toast.msg}</div>}
        <div style={{ background: "#242426", border: "1px solid #404040", borderRadius: 18, padding: 30, width: "100%", maxWidth: 420, boxShadow: "0 12px 30px rgba(0,0,0,0.6)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ color: "#e8cd9c", fontSize: 22, fontWeight: 800 }}>نظام إدارة الأقساط السحابي</h2>
            <p style={{ color: "#c4c4c4", fontSize: 13, marginTop: 4 }}>يرجى تسجيل الدخول للوصول لقاعدة البيانات</p>
          </div>

          {authError && <div style={{ background: "rgba(224,122,95,0.15)", border: "1px solid #e07a5f", color: "#e07a5f", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{authError}</div>}

          {authView === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="البريد الإلكتروني"><input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required /></Field>
              <Field label="كلمة المرور"><input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required /></Field>
              <button type="submit" style={styles.saveBtn}>تسجيل الدخول</button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "#c4c4c4" }}>
                ليس لديك حساب؟ <span style={{ color: "#e8cd9c", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthView("register")}>سجل حساب جديد</span>
              </div>
              <div style={{ textAlign: "center", marginTop: 4, fontSize: 12, color: "#999" }}>
                <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setAuthView("reset")}>نسيت كلمة المرور؟</span>
              </div>
            </form>
          )}

          {authView === "register" && (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="الاسم الكامل"><input type="text" value={authName} onChange={e => setAuthName(e.target.value)} required /></Field>
              <Field label="البريد الإلكتروني"><input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required /></Field>
              <Field label="كلمة المرور (6 أحرف على الأقل)"><input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required /></Field>
              <button type="submit" style={styles.saveBtn}>إنشاء الحساب</button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "#c4c4c4" }}>
                لديك حساب بالفعل؟ <span style={{ color: "#e8cd9c", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthView("login")}>تسجيل الدخول</span>
              </div>
            </form>
          )}

          {authView === "reset" && (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="أدخل بريدك الإلكتروني"><input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required /></Field>
              <button type="submit" style={styles.saveBtn}>إرسال رابط استعادة كلمة المرور</button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "#c4c4c4" }}>
                <span style={{ color: "#e8cd9c", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthView("login")}>العودة لتسجيل الدخول</span>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1b1b1d; }
        ::-webkit-scrollbar-thumb { background: #d0b689; border-radius: 4px; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}</style>

      {toast && (
        <div style={{ ...styles.toast, ...(toast.kind === "error" ? styles.toastError : {}) }}>
          {toast.kind === "error" ? <X size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {screen === "dashboard" && <Dashboard totals={totals} lateCount={lateRows.length} onNavigate={setScreen} user={currentUser} onLogout={handleLogout} />}
      {screen === "pay" && <PayScreen rows={rows} payments={payments} onPay={recordPayment} onBack={() => setScreen("dashboard")} />}
      {screen === "addClient" && <AddClientScreen onSave={addClient} onBack={() => setScreen("dashboard")} />}
      {screen === "search" && <SearchScreen rows={rows} onBack={() => setScreen("dashboard")} />}
      {screen === "addPartner" && <AddPartnerScreen partners={partners.map(p => ({ ...p, net: p.capital + p.profit - p.withdrawals }))} onSave={addPartner} onBack={() => setScreen("dashboard")} />}
      {screen === "addEmployee" && <AddEmployeeScreen onSave={addEmployee} onBack={() => setScreen("dashboard")} />}

      {screen === "monthlyDues" && <PlaceholderScreen title="مستحقات الشهر" onBack={() => setScreen("dashboard")} />}
      {screen === "deleteClient" && <PlaceholderScreen title="حذف حساب عميل" onBack={() => setScreen("dashboard")} />}
      {screen === "lateClients" && <PlaceholderScreen title="المتأخرين عن السداد" onBack={() => setScreen("dashboard")} />}
      {screen === "changePassword" && <PlaceholderScreen title="تغيير كلمة السر" onBack={() => setScreen("dashboard")} />}
      {screen === "treasury" && <PlaceholderScreen title="الخزينة وتوزيع الأرباح" onBack={() => setScreen("dashboard")} />}
      {screen === "backup" && <PlaceholderScreen title="النسخ الاحتياطي السحابي" note="تم ربط النظام بقاعدة بيانات Supabase بنجاح." onBack={() => setScreen("dashboard")} />}
    </div>
  );
}

/* ============================================================
   الشاشات الفرعية
   ============================================================ */

function Dashboard({ totals, lateCount, onNavigate, user, onLogout }) {
  const buttons = [
    { key: "addClient", label: "إضافة عميل جديد", icon: UserPlus, tone: "dark" },
    { key: "pay", label: "سداد الأقساط", icon: CreditCard, tone: "gold" },
    { key: "search", label: "استعلام عن عميل", icon: Search, tone: "silver" },
    { key: "monthlyDues", label: "مستحقات الشهر", icon: CalendarClock, tone: "copper" },
    { key: "lateClients", label: `المتأخرين عن السداد${lateCount ? ` (${lateCount})` : ""}`, icon: UserX, tone: "rose" },
    { key: "deleteClient", label: "حذف حساب عميل", icon: Trash2, tone: "gold" },
    { key: "treasury", label: "توزيع الأرباح والخزينة", icon: Wallet, tone: "roseDark" },
    { key: "changePassword", label: "تغيير كلمة السر", icon: KeyRound, tone: "tan" },
    { key: "addPartner", label: "إضافة شريك جديد", icon: Users, tone: "copper" },
    { key: "addEmployee", label: "إضافة موظف جديد", icon: UserCog, tone: "silver" },
    { key: "backup", label: "النسخ الاحتياطي السحابي", icon: CloudUpload, tone: "roseLight" },
    { key: "exit", label: "تسجيل الخروج", icon: Power, tone: "dark" },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.dashHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.adminBadge}>مرحبًا، {user?.name || "المشرف"}</div>
          <button onClick={onLogout} style={{ background: "#1b1b1d", border: "1px solid #e07a5f", color: "#e07a5f", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>خروج</button>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={styles.dashTitle}>نظام إدارة الأقساط الاحترافي</div>
          <div style={styles.dashSub}>Cloud Database Connected (Supabase)</div>
        </div>
        <div style={styles.calcIcon}><Calculator size={22} color="#3a2e18" /></div>
      </header>

      <section style={styles.kpiRow}>
        <KPI icon={TrendingUp} label="صافي الأرباح حتى اليوم" sub="إجمالي أرباح العقود" value={fmt(totals.totalProfit)} />
        <KPI icon={CalendarClock} label="مستحقات هذا الشهر" sub="المطلوب تحصيله حالياً" value={fmt(totals.totalDebt)} />
        <KPI icon={Wallet} label="إجمالي الأقساط" sub="المبالغ المتبقية في ذمة العملاء" value={fmt(totals.totalPortfolio)} />
      </section>

      <section style={styles.grid}>
        {buttons.map((b) => (
          <DashButton key={b.key} label={b.label} Icon={b.icon} tone={b.tone} onClick={() => {
            if (b.key === "exit") { onLogout(); return; }
            onNavigate(b.key);
          }} />
        ))}
      </section>
    </div>
  );
}

function ScreenHeader({ title, onBack }) {
  return (
    <div style={styles.subHeader}>
      <button style={styles.backBtn} onClick={onBack}>
        <ArrowRight size={16} /> رجوع للرئيسية
      </button>
      <div style={styles.subTitle}>{title}</div>
      <div style={{ width: 130 }} />
    </div>
  );
}

/* 1. إضافة عميل */
function AddClientScreen({ onSave, onBack }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const live = useMemo(() => {
    return calculateContract({ cost: parseFloat(form.cost) || 0, sale: parseFloat(form.sale) || 0, down: parseFloat(form.down) || 0, monthly: parseFloat(form.monthly) || 0 });
  }, [form]);

  function handleContractDate(e) {
    const cDate = e.target.value;
    const firstPay = addOneMonth(cDate);
    setForm({ ...form, contractDate: cDate, firstPayDate: firstPay });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.item || !form.cost || !form.sale || !form.contractDate) { setError("يرجى ملء الحقول الأساسية وتاريخ التعاقد!"); return; }
    onSave({
      ...form,
      cost: parseFloat(form.cost) || 0,
      sale: parseFloat(form.sale) || 0,
      down: parseFloat(form.down) || 0,
      monthly: parseFloat(form.monthly) || 0,
    });
  }

  return (
    <div style={styles.container}>
      <ScreenHeader title="إضافة عميل جديد" onBack={onBack} />
      <div style={styles.card}>
        {error && <div style={styles.errorBox}>{error}</div>}
        <form onSubmit={submit} style={styles.formGrid}>
          <div style={styles.sectionLabel}>بيانات العميل والضامن</div>
          <Field label="اسم العميل *"><input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="تليفون العميل *"><input style={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="اسم الضامن *"><input style={styles.input} value={form.guarantor} onChange={e => setForm({ ...form, guarantor: e.target.value })} /></Field>
          <Field label="تليفون الضامن *"><input style={styles.input} value={form.guarantorPhone} onChange={e => setForm({ ...form, guarantorPhone: e.target.value })} /></Field>

          <div style={styles.sectionLabel}>بيانات السلعة والتقسيط</div>
          <div style={{ gridColumn: "1 / -1" }}><Field label="السلعة *"><input style={styles.input} value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} /></Field></div>
          <Field label="سعر التكلفة *"><input type="number" style={styles.input} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></Field>
          <Field label="سعر البيع *"><input type="number" style={styles.input} value={form.sale} onChange={e => setForm({ ...form, sale: e.target.value })} /></Field>
          <Field label="المقدم *"><input type="number" style={styles.input} value={form.down} onChange={e => setForm({ ...form, down: e.target.value })} /></Field>
          <Field label="القسط الشهري *"><input type="number" style={styles.input} value={form.monthly} onChange={e => setForm({ ...form, monthly: e.target.value })} /></Field>

          <div style={styles.sectionLabel}>التواريخ والملاحظات</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, gridColumn: "1 / -1" }}>
            <Field label="تاريخ التعاقد *"><input type="date" style={styles.input} value={form.contractDate} onChange={handleContractDate} /></Field>
            <Field label="تاريخ أول قسط (تلقائي + شهر)"><input type="date" style={{ ...styles.input, backgroundColor: "#151515", color: "#c4c4c4", borderColor: "#333" }} value={form.firstPayDate} readOnly disabled /></Field>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="ملاحظات"><input style={styles.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>

          <div style={styles.liveBox}>
            <LiveStat label="صافي الربح" value={fmt(live.profit)} />
            <LiveStat label="المتبقي للتقسيط" value={fmt(live.remaining)} />
            <LiveStat label="عدد الأقساط" value={live.installmentsCount} />
          </div>

          <button type="submit" style={styles.saveBtn}>حفظ بيانات العقد</button>
        </form>
      </div>
    </div>
  );
}

/* 2. استعلام عن عميل */
function SearchScreen({ rows, onBack }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={styles.container}>
      <ScreenHeader title="استعلام عن عميل" onBack={onBack} />
      <div style={styles.card}>
        <span style={styles.fieldLabel}>ابحث بالاسم</span>
        <NameComboBox
          items={rows} getLabel={(r) => r.name} getSecondary={(r) => `${r.item} · متبقي ${fmt(r.remaining)}`}
          placeholder="اكتب اسم العميل..." onSelect={setSelected} selectedLabel={selected ? `${selected.name}` : null} onClear={() => setSelected(null)}
        />

        {selected && (
          <div style={styles.profileBox}>
            <h3 style={styles.historyTitle}>بيانات عقد: {selected.name}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ProfileRow label="التليفون" value={selected.phone} />
              <ProfileRow label="اسم الضامن" value={selected.guarantor} />
              <ProfileRow label="تليفون الضامن" value={selected.guarantorPhone} />
              <ProfileRow label="السلعة" value={selected.item} />
              <ProfileRow label="تاريخ التعاقد" value={selected.contractDate} />
              <ProfileRow label="تاريخ أول قسط" value={selected.firstPayDate} />
              <ProfileRow label="القسط الشهري" value={`${fmt(selected.monthly)} ج.م`} highlight />
              <ProfileRow label="المتبقي الكلي" value={`${fmt(selected.remaining)} ج.م`} />
              <ProfileRow label="المسدد حتى الآن" value={`${fmt(selected.totalPaid)} ج.م`} />
              <ProfileRow label="إجمالي المتأخرات" value={`${fmt(selected.debtAmount)} ج.م`} error={selected.debtAmount > 0} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ label, value, highlight, error }) {
  let textColor = "#ffffff";
  let borderColor = "#404040";
  if (highlight) { textColor = "#d0b689"; borderColor = "#d0b689"; }
  if (error) { textColor = "#e07a5f"; borderColor = "#e07a5f"; }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: "130px", color: "#c4c4c4", fontSize: "14px", fontWeight: 700 }}>{label}</div>
      <div style={{ flex: 1, background: "#1b1b1d", border: `1px solid ${borderColor}`, padding: "12px 16px", borderRadius: "10px", color: textColor, fontSize: "15px", fontWeight: 800 }}>
        {value}
      </div>
    </div>
  );
}

/* 3. إضافة شريك */
function AddPartnerScreen({ partners, onSave, onBack }) {
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");

  const livePercent = useMemo(() => {
    const numCapital = parseFloat(capital) || 0;
    const currentTotal = partners.reduce((s, p) => s + p.net, 0);
    if (currentTotal + numCapital === 0) return 0;
    return ((numCapital / (currentTotal + numCapital)) * 100).toFixed(2);
  }, [capital, partners]);

  return (
    <div style={styles.container}>
      <ScreenHeader title="إضافة شريك جديد" onBack={onBack} />
      <div style={styles.card}>
        <form onSubmit={e => { e.preventDefault(); onSave(name, capital); }} style={styles.formGrid}>
          <Field label="اسم الشريك"><input style={styles.input} value={name} onChange={e => setName(e.target.value)} required /></Field>
          <Field label="رأس المال المدفوع">
            <input type="number" style={styles.input} value={capital} onChange={e => setCapital(e.target.value)} placeholder="0" required />
          </Field>

          <div style={{ gridColumn: "1 / -1", background: "#211f18", padding: 14, borderRadius: 10, border: "1px dashed #d0b689", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#c4c4c4", fontSize: 14 }}>نسبة الشريك في الشركة بناءً على الإدخال:</span>
            <span style={{ color: "#e8cd9c", fontSize: 20, fontWeight: 800 }}>{livePercent}%</span>
          </div>

          <button type="submit" style={styles.saveBtn}>حفظ وإضافة الشريك</button>
        </form>
      </div>
    </div>
  );
}

/* 4. إضافة موظف */
function AddEmployeeScreen({ onSave, onBack }) {
  const [form, setForm] = useState({ name: "", phone: "", job: "", salary: "", hireDate: "" });
  return (
    <div style={styles.container}>
      <ScreenHeader title="إضافة موظف جديد" onBack={onBack} />
      <div style={styles.card}>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={styles.formGrid}>
          <Field label="الاسم"><input style={styles.input} onChange={e => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="التليفون"><input style={styles.input} onChange={e => setForm({ ...form, phone: e.target.value })} required /></Field>
          <Field label="الوظيفة"><input style={styles.input} onChange={e => setForm({ ...form, job: e.target.value })} required /></Field>
          <Field label="الراتب الأساسي"><input type="number" style={styles.input} onChange={e => setForm({ ...form, salary: e.target.value })} required /></Field>
          <Field label="تاريخ التعيين"><input type="date" style={styles.input} onChange={e => setForm({ ...form, hireDate: e.target.value })} required /></Field>
          <button type="submit" style={styles.saveBtn}>حفظ بيانات الموظف</button>
        </form>
      </div>
    </div>
  );
}

/* 5. سداد الأقساط */
function PayScreen({ rows, payments, onPay, onBack }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!selected) return;
    onPay(selected.id, parseFloat(amount) || 0);
    setAmount("");
    setSelected(null);
  }

  const clientPayments = selected ? payments.filter(p => p.clientId === selected.id) : [];

  return (
    <div style={styles.container}>
      <ScreenHeader title="سداد الأقساط" onBack={onBack} />
      <div style={styles.card}>
        <span style={styles.fieldLabel}>اختر العميل</span>
        <NameComboBox
          items={rows} getLabel={(r) => r.name} getSecondary={(r) => `${r.item} · متبقي ${fmt(r.remaining)}`}
          placeholder="اكتب اسم العميل..." onSelect={setSelected} selectedLabel={selected ? selected.name : null} onClear={() => setSelected(null)}
        />

        {selected && (
          <form onSubmit={submit} style={{ marginTop: 20 }}>
            <div style={styles.liveBox}>
              <LiveStat label="المتبقي الكلي" value={fmt(selected.remaining)} />
              <LiveStat label="مستحق حتى الآن" value={fmt(selected.debtAmount)} />
              <LiveStat label="القسط الشهري" value={fmt(selected.monthly)} />
            </div>
            <div style={{ marginTop: 16 }}>
              <Field label="المبلغ المسدد">
                <input type="number" style={styles.input} value={amount} onChange={e => setAmount(e.target.value)} required />
              </Field>
            </div>
            <button type="submit" style={{ ...styles.saveBtn, marginTop: 16 }}>تسجيل السداد</button>

            {clientPayments.length > 0 && (
              <div style={styles.profileBox}>
                <h3 style={styles.historyTitle}>سجل مدفوعات {selected.name}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {clientPayments.slice().reverse().map(p => (
                    <ProfileRow key={p.id} label={fmt(p.amount) + " ج.م"} value={`المتبقي بعدها: ${fmt(p.remainingAfter)} ج.م`} />
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function PlaceholderScreen({ title, note, onBack }) {
  return (
    <div style={styles.container}>
      <ScreenHeader title={title} onBack={onBack} />
      <div style={styles.card}><div style={styles.emptyState}>{note || "شاشة تحت التجهيز النهائي"}</div></div>
    </div>
  );
}

function KPI({ icon: Icon, label, sub, value }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ marginBottom: 10 }}><Icon size={26} color="#e8cd9c" /></div>
      <div style={styles.kpiValue}>{value} <span style={{ fontSize: 13, color: "#c4c4c4", fontWeight: 500 }}>ج.م</span></div>
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiSub}>{sub}</div>
    </div>
  );
}

function DashButton({ label, Icon, tone, onClick }) {
  const TONES = {
    gold: { background: "linear-gradient(135deg, #e6cf9e 0%, #b6935a 55%, #8a6a35 100%)", color: "#3a2e18" },
    dark: { background: "linear-gradient(135deg, #3d3527 0%, #211c14 60%, #100d09 100%)", color: "#e8cd9c" },
    copper: { background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)", color: "#2c1a0c" },
    silver: { background: "linear-gradient(135deg, #e8e8e8 0%, #b9b9b9 55%, #8a8a8a 100%)", color: "#2a2a2a" },
    rose: { background: "linear-gradient(135deg, #c97a6d 0%, #9c4a3d 55%, #6e2f26 100%)", color: "#fbe9e4" },
    roseLight: { background: "linear-gradient(135deg, #d99b8c 0%, #b96f5f 55%, #8a4a3c 100%)", color: "#2c1a14" },
    roseDark: { background: "linear-gradient(135deg, #b06f63 0%, #7a3a30 55%, #4a221c 100%)", color: "#fbe9e4" },
    tan: { background: "linear-gradient(135deg, #e6d4b0 0%, #c9ab78 55%, #a5824f 100%)", color: "#3a2e18" },
  };
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", borderRadius: 14, padding: "18px 20px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 16px rgba(0,0,0,0.35)", minHeight: 64, ...TONES[tone] }}>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{label}</span>
      <span style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={20} /></span>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function LiveStat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#e8cd9c", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#c4c4c4", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* أنماط التصميم */
const styles = {
  page: { minHeight: "100vh", background: `radial-gradient(1200px 600px at 20% -10%, #2a271f 0%, #1b1b1d 55%)`, padding: "24px 16px 60px", fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif", color: "#ffffff" },
  container: { maxWidth: 1100, margin: "0 auto" },
  toast: { position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: "#213526", border: "1px solid #3d6b4a", color: "#bfe8cd", padding: "10px 18px", borderRadius: 12, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, zIndex: 50 },
  toastError: { background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb" },
  dashHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, #e6cf9e 0%, #b6935a 50%, #8a6a35 100%)`, borderRadius: 18, padding: "18px 24px", marginBottom: 20 },
  adminBadge: { background: "#1b1b1d", color: "#e8cd9c", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 10 },
  dashTitle: { fontSize: 22, fontWeight: 800, color: "#2c2211" },
  dashSub: { fontSize: 12.5, color: "#5a4a2c", marginTop: 2 },
  calcIcon: { width: 44, height: 44, borderRadius: 12, background: "#1b1b1d", display: "flex", alignItems: "center", justifyContent: "center" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 20 },
  kpiCard: { background: "#242426", border: `1px solid #404040`, borderRadius: 16, padding: "20px 20px" },
  kpiValue: { fontSize: 24, fontWeight: 800, color: "#ffffff", fontVariantNumeric: "tabular-nums" },
  kpiLabel: { fontSize: 13.5, color: "#e8cd9c", fontWeight: 700, marginTop: 8 },
  kpiSub: { fontSize: 11.5, color: "#c4c4c4", marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  subHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "#242426", border: `1px solid #404040`, color: "#e8cd9c", padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 },
  subTitle: { fontSize: 19, fontWeight: 800, color: "#e8cd9c" },
  card: { background: "#242426", border: `1px solid #404040`, borderRadius: 18, padding: 22 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 },
  fieldLabel: { fontSize: 13.5, color: "#c4c4c4", fontWeight: 700, display: "block", marginBottom: 6 },
  input: { width: "100%", background: "#1b1b1d", border: "1px solid #404040", borderRadius: 10, padding: "12px 14px", color: "#ffffff", fontFamily: "inherit", fontSize: 15, outline: "none" },
  sectionLabel: { gridColumn: "1 / -1", fontSize: 13.5, fontWeight: 800, color: "#d0b689", marginTop: 12, paddingBottom: 8, borderBottom: `1px solid #404040` },
  liveBox: { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, background: "#211f18", border: "1px dashed rgba(208,182,137,0.5)", borderRadius: 12, padding: 14, margin: "6px 0" },
  saveBtn: { gridColumn: "1 / -1", background: `linear-gradient(145deg, #e8cd9c, #d0b689)`, color: "#1b1b1d", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 8, fontFamily: "inherit" },
  errorBox: { background: "rgba(224,122,95,0.12)", border: "1px solid rgba(224,122,95,0.5)", color: "#e8a996", borderRadius: 10, padding: "12px 14px", fontSize: 14, marginBottom: 16 },
  emptyState: { textAlign: "center", color: "#c4c4c4", padding: "30px 10px", fontSize: 15 },
  historyTitle: { fontSize: 16, fontWeight: 800, color: "#e8cd9c", marginTop: 22, marginBottom: 16, paddingTop: 16, borderTop: `1px solid #404040` },
  profileBox: { marginTop: 16, paddingTop: 16, borderTop: `1px solid #404040` },
  suggestBox: { position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, background: "#2d2d30", border: `1px solid #45454a`, borderRadius: 10, overflow: "hidden", zIndex: 30, boxShadow: "0 12px 30px rgba(0,0,0,0.5)", maxHeight: 260, overflowY: "auto" },
  suggestItem: { display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", textAlign: "right", background: "transparent", border: "none", borderBottom: `1px solid #242426`, padding: "12px 14px", cursor: "pointer", fontFamily: "inherit" },
  suggestLabel: { fontSize: 14.5, fontWeight: 800, color: "#ffffff" },
  suggestSecondary: { fontSize: 12.5, color: "#c4c4c4", marginTop: 4 },
  selectedChip: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#211f18", border: `1px solid #d0b689`, borderRadius: 10, padding: "12px 14px", color: "#e8cd9c", fontWeight: 800, fontSize: 14.5 },
  selectedChipX: { background: "transparent", border: "none", color: "#c4c4c4", cursor: "pointer", display: "flex", alignItems: "center" }
};