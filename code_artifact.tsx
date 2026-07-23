import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CreditCard, UserPlus, CalendarClock, Search, UserX, UploadCloud,
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
  const [authView, setAuthView] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [deletedClients, setDeletedClients] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_trash");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("egymod_trash", JSON.stringify(deletedClients));
  }, [deletedClients]);
  
  const [partners, setPartners] = useState(seedPartners);
  const [expenses] = useState(seedExpenses);
  const [employees, setEmployees] = useState(seedEmployees);
  const [salaryLog] = useState([]);
  const [today] = useState(new Date());
  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);

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

  const activeClients = useMemo(() => {
    const trashIds = new Set(deletedClients.map((d) => d.id));
    return clients.filter((c) => !trashIds.has(c.id));
  }, [clients, deletedClients]);

  const rows = useMemo(() => {
    return activeClients.map((c) => {
      const dues = computeDues(c, today);
      const remaining = c.sale - c.down - c.totalPaid;
      const due = nextDueDate(c);
      return { ...c, ...dues, remaining, due };
    }).sort((a, b) => b.debtAmount - a.debtAmount);
  }, [activeClients, today]);

  const lateRows = useMemo(() => rows.filter((r) => r.debtAmount > 0), [rows]);

  const totals = useMemo(() => {
    let totalProfit = 0;
    let totalPortfolio = 0;

    activeClients.forEach((c) => {
      const sale = Number(c.sale || 0);
      const cost = Number(c.cost || 0);
      const down = Number(c.down || 0);
      const totalPaid = Number(c.totalPaid || 0);

      const totalCollected = down + totalPaid;
      const profitRatio = sale > 0 ? (sale - cost) / sale : 0;
      totalProfit += totalCollected * profitRatio;

      const remaining = sale - down - totalPaid;
      if (remaining > 0) {
        totalPortfolio += remaining;
      }
    });

    const totalDebt = rows.reduce((s, r) => s + r.debtAmount, 0);

    return {
      totalProfit: Math.round(totalProfit),
      totalDebt: Math.round(totalDebt),
      totalPortfolio: Math.round(totalPortfolio)
    };
  }, [activeClients, rows]);

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

  async function updateClient(clientId, updatedData) {
    if (!currentUser) return false;
    const dbPayload = {
      name: updatedData.name,
      phone: String(updatedData.phone || ""),
      guarantor: updatedData.guarantor || "",
      guarantor_phone: String(updatedData.guarantorPhone || ""),
      item: updatedData.item,
      cost: Number(updatedData.cost),
      sale: Number(updatedData.sale),
      down: Number(updatedData.down),
      monthly: Number(updatedData.monthly),
      contract_date: updatedData.contractDate,
      first_pay_date: updatedData.firstPayDate,
      notes: updatedData.notes || ""
    };

    const { error } = await supabase.from('clients').update(dbPayload).eq('id', clientId);
    if (error) {
      notify("خطأ في تحديث البيانات بالسحابة", "error");
      return false;
    }

    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updatedData } : c)));
    notify("تم تحديث بيانات العميل بالسحابة بنجاح!");
    return true;
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
        input[type=date] { direction: ltr; text-align: right; }
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
      {screen === "search" && <SearchScreen rows={rows} onUpdateClient={updateClient} onBack={() => setScreen("dashboard")} />}

      {screen === "addPartner" && <AddPartnerScreen partners={partners.map(p => ({ ...p, net: p.capital + p.profit - p.withdrawals }))} onSave={addPartner} onBack={() => setScreen("dashboard")} />}
      {screen === "addEmployee" && <AddEmployeeScreen onSave={addEmployee} onBack={() => setScreen("dashboard")} />}

      {screen === "monthlyDues" && <MonthlyDuesScreen rows={rows} payments={payments} onBack={() => setScreen("dashboard")} onPay={recordPayment} />}
      {screen === "deleteClient" && (
        <DeleteClientScreen
          clients={activeClients}
          setClients={setClients}
          deletedClients={deletedClients}
          setDeletedClients={setDeletedClients}
          onBack={() => setScreen("dashboard")}
          notify={notify}
        />
      )}
      {screen === "lateClients" && <LateClientsScreen rows={lateRows} onBack={() => setScreen("dashboard")} onPay={recordPayment} />}
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
    { key: "backup", label: "النسخ الاحتياطي السحابي", icon: UploadCloud, tone: "roseLight" },
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

/* 2. استعلام وتعديل بيانات العميل (شبكي متناسق) */
function SearchScreen({ rows, onUpdateClient, onBack }) {
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleSelectClient = (client) => {
    setSelected(client);
    setIsEditing(false);
    if (client) {
      setEditForm({
        name: client.name || "",
        phone: client.phone || "",
        guarantor: client.guarantor || "",
        guarantorPhone: client.guarantorPhone || "",
        item: client.item || "",
        cost: client.cost || "",
        sale: client.sale || "",
        down: client.down || "",
        monthly: client.monthly || "",
        contractDate: client.contractDate || "",
        firstPayDate: client.firstPayDate || "",
        notes: client.notes || "",
      });
    }
  };

  const handleContractDateChange = (e) => {
    const cDate = e.target.value;
    const firstPay = addOneMonth(cDate);
    setEditForm((prev) => ({ ...prev, contractDate: cDate, firstPayDate: firstPay }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const success = await onUpdateClient(selected.id, {
      ...editForm,
      cost: parseFloat(editForm.cost) || 0,
      sale: parseFloat(editForm.sale) || 0,
      down: parseFloat(editForm.down) || 0,
      monthly: parseFloat(editForm.monthly) || 0,
    });
    if (success) {
      setIsEditing(false);
      setSelected((prev) => ({
        ...prev,
        ...editForm,
        cost: parseFloat(editForm.cost) || 0,
        sale: parseFloat(editForm.sale) || 0,
        down: parseFloat(editForm.down) || 0,
        monthly: parseFloat(editForm.monthly) || 0,
      }));
    }
  };

  const readStyle = {
    width: "100%", background: "#1b1b1d", border: "1px solid #404040",
    borderRadius: 10, padding: "12px 14px", color: "#ffffff", fontSize: 15, fontWeight: 800
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title="استعلام وتعديل بيانات العميل" onBack={onBack} />
      <div style={styles.card}>
        <span style={styles.fieldLabel}>ابحث باسم العميل أو رقم التليفون</span>
        <NameComboBox
          items={rows}
          getLabel={(r) => r.name}
          getSecondary={(r) => `${r.item} · متبقي ${fmt(r.remaining)}`}
          placeholder="اكتب اسم العميل..."
          onSelect={handleSelectClient}
          selectedLabel={selected ? `${selected.name}` : null}
          onClear={() => {
            setSelected(null);
            setIsEditing(false);
          }}
        />

        {selected && (
          <div style={styles.profileBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e8cd9c", margin: 0 }}>
                {isEditing ? `تعديل بيانات العميل: ${selected.name}` : `بيانات عقد العميل: ${selected.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  background: isEditing ? "#3a2320" : "linear-gradient(145deg, #e8cd9c, #d0b689)",
                  color: isEditing ? "#f0c6bb" : "#1b1b1d",
                  border: isEditing ? "1px solid #7a4a3f" : "none",
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                {isEditing ? "إلغاء التعديل" : "✏️ تعديل بيانات العميل"}
              </button>
            </div>

            {!isEditing && (
              <div style={styles.formGrid}>
                <div style={styles.sectionLabel}>بيانات العميل والضامن</div>
                <Field label="اسم العميل"><div style={readStyle}>{selected.name}</div></Field>
                <Field label="تليفون العميل"><div style={readStyle}>{selected.phone || "غير محدد"}</div></Field>
                <Field label="اسم الضامن"><div style={readStyle}>{selected.guarantor || "لا يوجد"}</div></Field>
                <Field label="تليفون الضامن"><div style={readStyle}>{selected.guarantorPhone || "لا يوجد"}</div></Field>

                <div style={styles.sectionLabel}>بيانات السلعة والماليات</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="السلعة"><div style={readStyle}>{selected.item}</div></Field>
                </div>
                <Field label="سعر التكلفة"><div style={readStyle}>{fmt(selected.cost)} ج.م</div></Field>
                <Field label="سعر البيع"><div style={readStyle}>{fmt(selected.sale)} ج.م</div></Field>
                <Field label="المقدم المدفوع"><div style={readStyle}>{fmt(selected.down)} ج.م</div></Field>
                <Field label="القسط الشهري"><div style={{ ...readStyle, color: "#d0b689", borderColor: "#d0b689" }}>{fmt(selected.monthly)} ج.م</div></Field>

                <div style={styles.sectionLabel}>الموقف المالي الحقيقي</div>
                <Field label="المسدد حتى الآن"><div style={readStyle}>{fmt(selected.totalPaid)} ج.م</div></Field>
                <Field label="المتبقي الكلي"><div style={readStyle}>{fmt(selected.remaining)} ج.م</div></Field>
                <Field label="إجمالي المتأخرات">
                  <div style={{ ...readStyle, color: selected.debtAmount > 0 ? "#e07a5f" : "#ffffff", borderColor: selected.debtAmount > 0 ? "#e07a5f" : "#404040" }}>
                    {fmt(selected.debtAmount)} ج.م
                  </div>
                </Field>

                <div style={styles.sectionLabel}>التواريخ والملاحظات</div>
                <Field label="تاريخ التعاقد"><div style={readStyle}>{selected.contractDate}</div></Field>
                <Field label="تاريخ أول قسط"><div style={readStyle}>{selected.firstPayDate}</div></Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="الملاحظات">
                    <div style={{ ...readStyle, minHeight: 60, whiteSpace: "pre-wrap" }}>{selected.notes || "لا توجد ملاحظات مسجلة"}</div>
                  </Field>
                </div>
              </div>
            )}

            {isEditing && (
              <form onSubmit={handleSaveEdit} style={styles.formGrid}>
                <div style={styles.sectionLabel}>بيانات العميل والضامن</div>
                <Field label="اسم العميل *"><input style={styles.input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></Field>
                <Field label="تليفون العميل *"><input style={styles.input} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required /></Field>
                <Field label="اسم الضامن"><input style={styles.input} value={editForm.guarantor} onChange={(e) => setEditForm({ ...editForm, guarantor: e.target.value })} /></Field>
                <Field label="تليفون الضامن"><input style={styles.input} value={editForm.guarantorPhone} onChange={(e) => setEditForm({ ...editForm, guarantorPhone: e.target.value })} /></Field>

                <div style={styles.sectionLabel}>بيانات السلعة والتقسيط</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="السلعة *"><input style={styles.input} value={editForm.item} onChange={(e) => setEditForm({ ...editForm, item: e.target.value })} required /></Field>
                </div>
                <Field label="سعر التكلفة *"><input type="number" style={styles.input} value={editForm.cost} onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })} required /></Field>
                <Field label="سعر البيع *"><input type="number" style={styles.input} value={editForm.sale} onChange={(e) => setEditForm({ ...editForm, sale: e.target.value })} required /></Field>
                <Field label="المقدم *"><input type="number" style={styles.input} value={editForm.down} onChange={(e) => setEditForm({ ...editForm, down: e.target.value })} required /></Field>
                <Field label="القسط الشهري *"><input type="number" style={styles.input} value={editForm.monthly} onChange={(e) => setEditForm({ ...editForm, monthly: e.target.value })} required /></Field>

                <div style={styles.sectionLabel}>التواريخ والملاحظات</div>
                <Field label="تاريخ التعاقد *"><input type="date" style={styles.input} value={editForm.contractDate} onChange={handleContractDateChange} required /></Field>
                <Field label="تاريخ أول قسط"><input type="date" style={{ ...styles.input, backgroundColor: "#151515", color: "#c4c4c4" }} value={editForm.firstPayDate} readOnly disabled /></Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="الملاحظات"><input style={styles.input} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></Field>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 12 }}>
                  <button type="submit" style={{ ...styles.saveBtn, flex: 1, marginTop: 0 }}>حفظ التعديلات بالسحابة</button>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ background: "#1b1b1d", border: "1px solid #404040", color: "#fff", borderRadius: 12, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>إلغاء</button>
                </div>
              </form>
            )}
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

/* ============================================================
   شاشة المتأخرين عن السداد (مكون مستقل متناسق مع تصميمك)
   ============================================================ */
function LateClientsScreen({ rows, onBack, onPay }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const processedRows = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rows.map((r) => {
      let daysLate = 0;
      if (r.due) {
        const dueDate = new Date(r.due);
        dueDate.setHours(0, 0, 0, 0);
        const diff = today.getTime() - dueDate.getTime();
        daysLate = diff > 0 ? Math.floor(diff / (1000 * 3600 * 24)) : 0;
      }
      return { ...r, daysLate };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    return processedRows.filter((r) => {
      const matchSearch = r.name.includes(search.trim()) || r.phone.includes(search.trim()) || r.item.includes(search.trim());
      if (!matchSearch) return false;

      if (filter === "simple") return r.daysLate < 30;
      if (filter === "medium") return r.daysLate >= 30 && r.daysLate <= 60;
      if (filter === "critical") return r.daysLate > 60;
      return true;
    });
  }, [processedRows, search, filter]);

  const stats = useMemo(() => {
    const totalDebt = processedRows.reduce((s, r) => s + r.debtAmount, 0);
    const maxDays = processedRows.length > 0 ? Math.max(...processedRows.map((r) => r.daysLate)) : 0;
    return { totalDebt, count: processedRows.length, maxDays };
  }, [processedRows]);

  const handleSendWhatsApp = (client) => {
    const msg = `السلام عليكم ورحمة الله، أستاذ/ة ${client.name}.\nنود تذكيركم بوجود مستحقات متاخرة لقسط (${client.item}) بمبلغ ${fmt(client.debtAmount)} ج.م.\nبرجاء التكرم بالسداد في أقرب وقت. شكراً لتفهمكم!`;
    window.open(`https://wa.me/2${client.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleConfirmPay = (e) => {
    e.preventDefault();
    if (!payTarget || !payAmount) return;
    onPay(payTarget.id, parseFloat(payAmount) || 0);
    setPayTarget(null);
    setPayAmount("");
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title={`المتأخرين عن السداد (${stats.count})`} onBack={onBack} />

      <section style={{ ...styles.kpiRow, marginBottom: 16 }}>
        <KPI icon={Wallet} label="إجمالي المتأخرات المطلوبة" sub="المبالغ المستحقة حالياً" value={fmt(stats.totalDebt)} />
        <KPI icon={Users} label="عدد العملاء المتأخرين" sub="عملاء بحاجة للمتابعة" value={stats.count} />
        <KPI icon={CalendarClock} label="أقصى مدة تأخير" sub="أطول فترة قسط غير مسدد" value={`${stats.maxDays} يوم`} />
      </section>

      <div style={{ ...styles.card, marginBottom: 16, padding: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <input
          style={{ ...styles.input, maxWidth: 300 }}
          placeholder="بحث باسم العميل أو التليفون أو السلعة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "all", label: `الكل (${processedRows.length})` },
            { key: "simple", label: "تأخير بسيط (< 30 يوم)" },
            { key: "medium", label: "تأخير متوسط (30-60 يوم)" },
            { key: "critical", label: "حرج (> 60 يوم)" },
          ].map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setFilter(btn.key)}
              style={{
                background: filter === btn.key ? "#d0b689" : "#1b1b1d",
                color: filter === btn.key ? "#1b1b1d" : "#c4c4c4",
                border: "1px solid #404040",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>لا يوجد عملاء متأخرين ينطبق عليهم شرط البحث حالياً.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#1b1b1d",
                  border: "1px solid #404040",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#e8cd9c", marginTop: 2 }}>{item.item} · {item.phone}</div>
                  {item.guarantor && (
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                      الضامن: {item.guarantor} ({item.guarantorPhone})
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#c4c4c4" }}>المستحق حالياً</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#e07a5f" }}>{fmt(item.debtAmount)} ج.م</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#c4c4c4" }}>مدة التأخير</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: item.daysLate > 60 ? "#e07a5f" : "#d0b689" }}>
                      {item.daysLate} يوم
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      title="واتساب"
                      onClick={() => handleSendWhatsApp(item)}
                      style={{ background: "#213526", border: "1px solid #3d6b4a", color: "#bfe8cd", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                    >
                      واتساب
                    </button>
                    <a
                      href={`tel:${item.phone}`}
                      style={{ background: "#1b2a38", border: "1px solid #385a7c", color: "#b2d4f5", padding: "8px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 700 }}
                    >
                      اتصال
                    </a>
                    <button
                      type="button"
                      onClick={() => { setPayTarget(item); setPayAmount(item.debtAmount); }}
                      style={{ background: `linear-gradient(145deg, #e8cd9c, #d0b689)`, color: "#1b1b1d", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}
                    >
                      تحصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {payTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ ...styles.card, width: "100%", maxWidth: 400 }}>
            <h3 style={{ color: "#e8cd9c", fontSize: 17, fontWeight: 800, marginBottom: 12 }}>تحصيل قسط: {payTarget.name}</h3>
            <form onSubmit={handleConfirmPay} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="المبلغ المراد تحصيله">
                <input type="number" style={styles.input} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
              </Field>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" style={{ ...styles.saveBtn, flex: 1, marginTop: 0 }}>تأكيد التحصيل</button>
                <button type="button" onClick={() => setPayTarget(null)} style={{ background: "#1b1b1d", border: "1px solid #404040", color: "#fff", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontWeight: 700 }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   شاشة مستحقات الشهر (مكون مستقل متناسق مع تصميمك)
   ============================================================ */
function MonthlyDuesScreen({ rows, payments, onBack, onPay }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const today = new Date();
  const currentMonthName = today.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });

  const processedRows = useMemo(() => {
    return rows
      .filter((r) => r.remaining > 0 && r.monthly > 0)
      .map((r) => {
        const monthlyReq = Math.min(r.monthly, r.remaining);
        const debt = r.debtAmount;
        let status = "unpaid";
        let paidThisMonth = 0;
        let dueThisMonth = monthlyReq;

        if (debt <= 0) {
          status = "paid";
          paidThisMonth = monthlyReq;
        } else if (debt < monthlyReq) {
          status = "partial";
          paidThisMonth = monthlyReq - debt;
        } else {
          status = "unpaid";
          paidThisMonth = 0;
        }

        return {
          ...r,
          dueThisMonth,
          paidThisMonth,
          remainingThisMonth: Math.max(0, dueThisMonth - paidThisMonth),
          monthStatus: status
        };
      });
  }, [rows]);

  const filtered = useMemo(() => {
    return processedRows.filter((r) => {
      const matchSearch = r.name.includes(search.trim()) || r.phone.includes(search.trim()) || r.item.includes(search.trim());
      if (!matchSearch) return false;

      if (statusFilter === "paid") return r.monthStatus === "paid";
      if (statusFilter === "partial") return r.monthStatus === "partial";
      if (statusFilter === "unpaid") return r.monthStatus === "unpaid";
      return true;
    });
  }, [processedRows, search, statusFilter]);

  const stats = useMemo(() => {
    const totalDue = processedRows.reduce((s, r) => s + r.dueThisMonth, 0);
    const totalCollected = processedRows.reduce((s, r) => s + r.paidThisMonth, 0);
    const totalRemaining = totalDue - totalCollected;
    const progressPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
    return { totalDue, totalCollected, totalRemaining, progressPct };
  }, [processedRows]);

  const handleSendWhatsApp = (client) => {
    const msg = `السلام عليكم ورحمة الله، أستاذ/ة ${client.name}.\nنود تذكيركم بحلول موعد قسط شهر (${currentMonthName}) لقسط (${client.item}) بقيمة ${fmt(client.dueThisMonth)} ج.م.\nبرجاء التكرم بالسداد في الموعد المحدد. شكراً لكم!`;
    window.open(`https://wa.me/2${client.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleConfirmPay = (e) => {
    e.preventDefault();
    if (!payTarget || !payAmount) return;
    onPay(payTarget.id, parseFloat(payAmount) || 0);
    setPayTarget(null);
    setPayAmount("");
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title={`مستحقات شهر ${currentMonthName}`} onBack={onBack} />

      <section style={{ ...styles.kpiRow, marginBottom: 16 }}>
        <KPI icon={CalendarClock} label="إجمالي المطلوب هذا الشهر" sub="مجموع الأقساط المستحقة" value={fmt(stats.totalDue)} />
        <KPI icon={Wallet} label="تم تحصيله حتى الآن" sub={`نسبة الإنجاز ${stats.progressPct}%`} value={fmt(stats.totalCollected)} />
        <KPI icon={TrendingUp} label="المتبقي تحصيله" sub="مستحقات جاري متابعتها" value={fmt(stats.totalRemaining)} />
      </section>

      <div style={{ ...styles.card, marginBottom: 16, padding: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <input
          style={{ ...styles.input, maxWidth: 300 }}
          placeholder="بحث باسم العميل أو التليفون أو السلعة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "all", label: `الكل (${processedRows.length})` },
            { key: "unpaid", label: "لم يسدد" },
            { key: "partial", label: "سداد جزئي" },
            { key: "paid", label: "تم السداد" },
          ].map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setStatusFilter(btn.key)}
              style={{
                background: statusFilter === btn.key ? "#d0b689" : "#1b1b1d",
                color: statusFilter === btn.key ? "#1b1b1d" : "#c4c4c4",
                border: "1px solid #404040",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>لا توجد مستحقات تنطبق عليها معايير البحث.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#1b1b1d",
                  border: "1px solid #404040",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "#e8cd9c", marginTop: 2 }}>{item.item} · {item.phone}</div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#c4c4c4" }}>قسط الشهر</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#d0b689" }}>{fmt(item.dueThisMonth)} ج.م</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#c4c4c4" }}>حالة السداد</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background:
                          item.monthStatus === "paid"
                            ? "#213526"
                            : item.monthStatus === "partial"
                            ? "#3d3527"
                            : "#3a2320",
                        color:
                          item.monthStatus === "paid"
                            ? "#bfe8cd"
                            : item.monthStatus === "partial"
                            ? "#e8cd9c"
                            : "#f0c6bb",
                        border: `1px solid ${
                          item.monthStatus === "paid"
                            ? "#3d6b4a"
                            : item.monthStatus === "partial"
                            ? "#b6935a"
                            : "#7a4a3f"
                        }`,
                      }}
                    >
                      {item.monthStatus === "paid" ? "تم السداد" : item.monthStatus === "partial" ? "سداد جزئي" : "لم يسدد"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      title="واتساب"
                      onClick={() => handleSendWhatsApp(item)}
                      style={{ background: "#213526", border: "1px solid #3d6b4a", color: "#bfe8cd", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                    >
                      واتساب
                    </button>
                    <a
                      href={`tel:${item.phone}`}
                      style={{ background: "#1b2a38", border: "1px solid #385a7c", color: "#b2d4f5", padding: "8px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 700 }}
                    >
                      اتصال
                    </a>
                    {item.monthStatus !== "paid" && (
                      <button
                        type="button"
                        onClick={() => { setPayTarget(item); setPayAmount(item.remainingThisMonth); }}
                        style={{ background: `linear-gradient(145deg, #e8cd9c, #d0b689)`, color: "#1b1b1d", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}
                      >
                        تحصيل
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {payTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ ...styles.card, width: "100%", maxWidth: 400 }}>
            <h3 style={{ color: "#e8cd9c", fontSize: 17, fontWeight: 800, marginBottom: 12 }}>تحصيل قسط: {payTarget.name}</h3>
            <form onSubmit={handleConfirmPay} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="المبلغ المراد تحصيله">
                <input type="number" style={styles.input} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
              </Field>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" style={{ ...styles.saveBtn, flex: 1, marginTop: 0 }}>تأكيد التحصيل</button>
                <button type="button" onClick={() => setPayTarget(null)} style={{ background: "#1b1b1d", border: "1px solid #404040", color: "#fff", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontWeight: 700 }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   شاشة حذف عميل وسلة المحذوفات (مكون مستقل متناسق مع تصميمك)
   ============================================================ */
function DeleteClientScreen({ clients, setClients, deletedClients, setDeletedClients, onBack, notify }) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.item.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const handleMoveToTrash = (client) => {
    const deletedItem = {
      ...client,
      deletedAt: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
    };
    setDeletedClients((prev) => [...prev, deletedItem]);
    setClients((prev) => prev.filter((c) => c.id !== client.id));
    setSelectedClient(null);
    setSearchTerm("");
    notify("تم نقل العميل إلى سلة المحذوفات بنجاح");
  };

  const handleRestore = (client) => {
    const { deletedAt, ...restoredClient } = client;
    setClients((prev) => [...prev, restoredClient]);
    setDeletedClients((prev) => prev.filter((c) => c.id !== client.id));
    notify("تمت استعادة حساب العميل إلى النظام النشط بنجاح");
  };

  const handlePermanentDelete = async (clientId) => {
    try {
      if (supabase) {
        await supabase.from("clients").delete().eq("id", clientId);
      }
      setDeletedClients((prev) => prev.filter((c) => c.id !== clientId));
      setConfirmDeleteId(null);
      notify("تم حذف حساب العميل نهائياً من قاعدة البيانات السحابية");
    } catch (err) {
      console.error(err);
      notify("حدث خطأ أثناء الحذف النهائي", "error");
    }
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title="حذف وإدارة حسابات العملاء" onBack={onBack} />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 12,
            border: "1px solid #404040",
            background: activeTab === "search" ? "linear-gradient(145deg, #e8cd9c, #d0b689)" : "#1b1b1d",
            color: activeTab === "search" ? "#1b1b1d" : "#c4c4c4",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          البحث ونقل للسلة
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("trash")}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 12,
            border: "1px solid #404040",
            background: activeTab === "trash" ? "#3a2320" : "#1b1b1d",
            color: activeTab === "trash" ? "#f0c6bb" : "#c4c4c4",
            borderColor: activeTab === "trash" ? "#7a4a3f" : "#404040",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          سلة المحذوفات ({deletedClients.length})
        </button>
      </div>

      {activeTab === "search" && (
        <div style={styles.card}>
          <Field label="ابحث باسم العميل أو رقم الهاتف أو السلعة">
            <div style={{ position: "relative" }}>
              <input
                style={styles.input}
                placeholder="اكتب حرفاً أو اسماً للفلترة الحية..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedClient(null);
                }}
              />

              {searchTerm.trim() && !selectedClient && (
                <div style={styles.suggestBox}>
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        style={styles.suggestItem}
                        onClick={() => {
                          setSelectedClient(item);
                          setSearchTerm(item.name);
                        }}
                      >
                        <span style={styles.suggestLabel}>{item.name}</span>
                        <span style={styles.suggestSecondary}>{item.item} · {item.phone}</span>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: 12, textAlign: "center", color: "#888", fontSize: 13 }}>
                      لا يوجد عميل يطابق البحث
                    </div>
                  )}
                </div>
              )}
            </div>
          </Field>

          {selectedClient && (
            <div style={styles.profileBox}>
              <h3 style={styles.historyTitle}>بيانات العميل المحدد: {selectedClient.name}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <ProfileRow label="رقم الهاتف" value={selectedClient.phone} />
                <ProfileRow label="السلعة" value={selectedClient.item} />
                <ProfileRow label="إجمالي المتبقي" value={`${fmt(selectedClient.sale - selectedClient.down - selectedClient.totalPaid)} ج.م`} />
              </div>

              <button
                type="button"
                onClick={() => handleMoveToTrash(selectedClient)}
                style={{
                  ...styles.saveBtn,
                  background: "linear-gradient(145deg, #d69a5f, #b06a35)",
                  color: "#ffffff"
                }}
              >
                نقل العميل إلى سلة المحذوفات
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "trash" && (
        <div style={styles.card}>
          {deletedClients.length === 0 ? (
            <div style={styles.emptyState}>سلة المحذوفات فارغة حالياً.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {deletedClients.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#1b1b1d",
                    border: "1px solid #404040",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: "#e8cd9c", marginTop: 2 }}>{item.item} · {item.phone}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>تاريخ النقل للسلة: {item.deletedAt}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleRestore(item)}
                      style={{
                        background: "#213526",
                        border: "1px solid #3d6b4a",
                        color: "#bfe8cd",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      استعادة
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      style={{
                        background: "#3a2320",
                        border: "1px solid #7a4a3f",
                        color: "#f0c6bb",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      حذف نهائي
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmDeleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ ...styles.card, width: "100%", maxWidth: 400, textAlign: "center" }}>
            <h3 style={{ color: "#e07a5f", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>تأكيد الحذف النهائي</h3>
            <p style={{ color: "#c4c4c4", fontSize: 13, marginBottom: 16 }}>
              هل أنت تأكد من مسح هذا العميل نهائياً؟ لن تتمكن من استعادته أو الوصول لبياناته مرة أخرى من السحابة.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => handlePermanentDelete(confirmDeleteId)}
                style={{ ...styles.saveBtn, flex: 1, background: "#e07a5f", color: "#fff", marginTop: 0 }}
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                style={{ background: "#1b1b1d", border: "1px solid #404040", color: "#fff", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontWeight: 700 }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
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
