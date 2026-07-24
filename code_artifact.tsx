import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CreditCard, UserPlus, CalendarClock, Search, UserX, UploadCloud,
  KeyRound, Power, Wallet, TrendingUp, Calculator, ArrowRight,
  Trash2, CheckCircle2, X, Users, UserCog, Printer, Download, Share2, Award,
  DollarSign, Plus, FileText, UserMinus, Filter, RefreshCw
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
        if (window.supabase) {
          supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        setReady(true);
      };
      script.onerror = () => setReady(true);
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
  { id: 1, name: "مصطفى جمال", capital: 112000, profit: 12000, withdrawals: 5000 },
  { id: 2, name: "خالد فتحي", capital: 56000, profit: 6000, withdrawals: 0 },
];
const seedExpenses = [
  { id: 1, date: "2026-07-01", category: "إيجار المحل", amount: 3000, notes: "إيجار الشراكة" },
  { id: 2, date: "2026-07-10", category: "كهرباء ومياه وغاز", amount: 450, notes: "فاتورة يوليو" }
];
const seedEmployees = [{ id: 1, name: "سعيد عبد الله", phone: "01011112222", job: "محصل", salary: 3500, hireDate: "2025-01-01", status: "نشط" }];

const emptyForm = { name: "", phone: "", guarantor: "", guarantorPhone: "", item: "", cost: "", sale: "", down: "", monthly: "", contractDate: "", firstPayDate: "", notes: "" };

/* ============================================================
   مكون إدخال التاريخ الذكي (يعالج مشكلة قنس/رهش/موي)
   ============================================================ */
function DateInput({ value, onChange, disabled, required, placeholder = "سنة - شهر - يوم", style }) {
  const [focused, setFocused] = useState(false);
  const isDateType = focused || Boolean(value);

  return (
    <input
      type={isDateType ? "date" : "text"}
      value={value || ""}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      dir="ltr"
      style={{
        width: "100%", background: disabled ? "#151515" : "#1b1b1d",
        border: "1px solid #404040", borderRadius: 10, padding: "12px 14px",
        color: disabled ? "#888888" : "#ffffff", fontFamily: "inherit", fontSize: 15,
        outline: "none", textAlign: "right", cursor: disabled ? "not-allowed" : "pointer", ...style
      }}
    />
  );
}

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
   المكون الرئيسي للتطبيق
   ============================================================ */
function EgymodApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_payments");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("egymod_payments", JSON.stringify(payments)); }, [payments]);

  const [deletedClients, setDeletedClients] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_trash");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("egymod_trash", JSON.stringify(deletedClients)); }, [deletedClients]);
  
  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_partners");
      return saved ? JSON.parse(saved) : seedPartners;
    } catch { return seedPartners; }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_expenses");
      return saved ? JSON.parse(saved) : seedExpenses;
    } catch { return seedExpenses; }
  });

  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_employees");
      return saved ? JSON.parse(saved) : seedEmployees;
    } catch { return seedEmployees; }
  });

  const [salaryLog, setSalaryLog] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_salary_log");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [withdrawalsLog, setWithdrawalsLog] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_withdrawals");
      return saved ? JSON.parse(saved) : [
        { id: 1, partnerId: 1, partnerName: "مصطفى جمال", amount: 5000, date: "2026-07-15", notes: "مسحوبات أرباح" }
      ];
    } catch { return []; }
  });

  const [distributionsLog, setDistributionsLog] = useState(() => {
    try {
      const saved = localStorage.getItem("egymod_distributions");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("egymod_partners", JSON.stringify(partners)); }, [partners]);
  useEffect(() => { localStorage.setItem("egymod_expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("egymod_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("egymod_salary_log", JSON.stringify(salaryLog)); }, [salaryLog]);
  useEffect(() => { localStorage.setItem("egymod_withdrawals", JSON.stringify(withdrawalsLog)); }, [withdrawalsLog]);
  useEffect(() => { localStorage.setItem("egymod_distributions", JSON.stringify(distributionsLog)); }, [distributionsLog]);

  const [today] = useState(new Date());
  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

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
    if (!supabase) return;
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
          id: p.id, clientId: p.client_id, clientName: p.client_name, item: p.item,
          amount: Number(p.amount), remainingAfter: Number(p.remaining_after || 0),
          payDate: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          method: p.method || "نقداً / كاش", collector: p.collector || "المشرف"
        })));
      }
    } catch (err) {
      console.error("Cloud load error:", err);
    }
  }

  async function handleLogin(e) {
    e.preventDefault(); setAuthError("");
    if (!supabase) {
      setCurrentUser({ id: "offline", email: authEmail, name: "المشرف" });
      notify("تم الدخول بالنظام المحلي بنجاح!");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setAuthError(error.message);
    else notify("تم تسجيل الدخول بنجاح!");
  }

  async function handleRegister(e) {
    e.preventDefault(); setAuthError("");
    if (!supabase) { setAuthView("login"); return; }
    const { error } = await supabase.auth.signUp({
      email: authEmail, password: authPassword, options: { data: { name: authName } }
    });
    if (error) setAuthError(error.message);
    else { notify("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن."); setAuthView("login"); }
  }

  async function handleReset(e) {
    e.preventDefault(); setAuthError("");
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail);
    if (error) setAuthError(error.message);
    else notify("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
  }

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
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

  const lateRows = useMemo(() => rows.filter((r) => r.debtAmount > 0 && r.remaining > 0), [rows]);

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

    const totalDebt = rows.reduce((s, r) => s + (r.remaining > 0 ? r.debtAmount : 0), 0);

    return {
      totalProfit: Math.round(totalProfit),
      totalDebt: Math.round(totalDebt),
      totalPortfolio: Math.round(totalPortfolio)
    };
  }, [activeClients, rows]);

  function notify(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  }

  async function addClient(data) {
    const dbPayload = {
      user_id: currentUser ? currentUser.id : "offline", name: data.name, phone: String(data.phone || ""),
      guarantor: data.guarantor || "", guarantor_phone: String(data.guarantorPhone || ""),
      item: data.item, cost: Number(data.cost), sale: Number(data.sale), down: Number(data.down),
      monthly: Number(data.monthly), contract_date: data.contractDate, first_pay_date: data.firstPayDate,
      total_paid: 0, notes: data.notes || ""
    };

    if (supabase && currentUser && currentUser.id !== "offline") {
      const { data: res, error } = await supabase.from('clients').insert([dbPayload]).select().single();
      if (error) { notify("خطأ في حفظ العقد بالسحابة", "error"); return; }
      const newObj = {
        id: res.id, name: res.name, phone: res.phone, guarantor: res.guarantor, guarantorPhone: res.guarantor_phone,
        item: res.item, cost: Number(res.cost), sale: Number(res.sale), down: Number(res.down), monthly: Number(res.monthly),
        contractDate: res.contract_date, firstPayDate: res.first_pay_date, totalPaid: 0, notes: res.notes
      };
      setClients((prev) => [...prev, newObj]);
    } else {
      const localObj = { id: Date.now(), ...data, totalPaid: 0 };
      setClients((prev) => [...prev, localObj]);
    }

    notify("تم حفظ العقد بنجاح!");
    setScreen("dashboard");
  }

  async function recordPayment(clientId, amount, payDate, method = "نقداً / كاش", collector = "المشرف") {
    const client = clients.find((c) => String(c.id) === String(clientId));
    if (!client || !amount || amount <= 0) return null;
    const remainingBefore = client.sale - client.down - client.totalPaid;
    if (amount > remainingBefore) { notify("المبلغ أكبر من المديونية!", "error"); return null; }

    const newTotalPaid = client.totalPaid + amount;
    const remainingAfter = Math.max(0, remainingBefore - amount);

    if (supabase && currentUser && currentUser.id !== "offline") {
      await supabase.from('clients').update({ total_paid: newTotalPaid }).eq('id', clientId);
      const payPayload = {
        user_id: currentUser.id, client_id: clientId, client_name: client.name,
        item: client.item, amount: amount, remaining_after: remainingAfter,
        method: method, collector: collector
      };
      await supabase.from('payments').insert([payPayload]);
    }

    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];
    setClients((prev) => prev.map((c) => (String(c.id) === String(clientId) ? { ...c, totalPaid: newTotalPaid } : c)));
    
    const newPaymentObj = {
      id: Date.now(), clientId: clientId, clientName: client.name, item: client.item,
      amount, remainingAfter, payDate: paymentDateStr, method, collector
    };
    setPayments((prev) => [...prev, newPaymentObj]);
    notify("تم تسجيل السداد بنجاح!");

    const updatedClientObj = { ...client, totalPaid: newTotalPaid, remaining: remainingAfter };
    const receiptData = { client: updatedClientObj, payment: newPaymentObj };
    setActiveReceipt(receiptData);
    return receiptData;
  }

  async function deletePayment(paymentId, clientId, amount) {
    const client = clients.find((c) => String(c.id) === String(clientId));
    if (!client) return;

    const newTotalPaid = Math.max(0, client.totalPaid - amount);

    try {
      if (supabase && currentUser && currentUser.id !== "offline") {
        await supabase.from('payments').delete().eq('id', paymentId);
        await supabase.from('clients').update({ total_paid: newTotalPaid }).eq('id', clientId);
      }

      setClients((prev) => prev.map((c) => (String(c.id) === String(clientId) ? { ...c, totalPaid: newTotalPaid } : c)));
      setPayments((prev) => prev.filter((p) => String(p.id) !== String(paymentId)));
      notify("تم حذف القسط وتعديل رصيد العميل بنجاح!");
    } catch (err) {
      console.error(err);
      notify("حدث خطأ أثناء حذف القسط", "error");
    }
  }

  async function updateClient(clientId, updatedData) {
    const dbPayload = {
      name: updatedData.name, phone: String(updatedData.phone || ""),
      guarantor: updatedData.guarantor || "", guarantor_phone: String(updatedData.guarantorPhone || ""),
      item: updatedData.item, cost: Number(updatedData.cost), sale: Number(updatedData.sale),
      down: Number(updatedData.down), monthly: Number(updatedData.monthly),
      contract_date: updatedData.contractDate, first_pay_date: updatedData.firstPayDate,
      notes: updatedData.notes || ""
    };

    if (supabase && currentUser && currentUser.id !== "offline") {
      const { error } = await supabase.from('clients').update(dbPayload).eq('id', clientId);
      if (error) { notify("خطأ في تحديث البيانات بالسحابة", "error"); return false; }
    }

    setClients((prev) => prev.map((c) => (String(c.id) === String(clientId) ? { ...c, ...updatedData } : c)));
    notify("تم تحديث بيانات العميل بنجاح!");
    return true;
  }

  function addPartner(name, capital) {
    setPartners((prev) => [...prev, { id: Date.now(), name, capital: parseFloat(capital) || 0, profit: 0, withdrawals: 0 }]);
    notify("تم تسجيل بيانات الشريك الجديد بنجاح!");
  }

  function settleAndRemovePartner(partnerId) {
    const p = partners.find(x => String(x.id) === String(partnerId));
    if (!p) return;
    setPartners((prev) => prev.filter(x => String(x.id) !== String(partnerId)));
    setWithdrawalsLog((prev) => prev.filter(w => String(w.partnerId) !== String(partnerId)));
    notify(`تمت تصفية حساب الشريك ${p.name} وحذفه من الشركة بنجاح!`);
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
              <button type="submit" style={styles.saveBtn}>تسجيل الدخول للنظام</button>
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
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; color: #000 !important; background: #fff !important; }
        }
      `}</style>

      {toast && (
        <div style={{ ...styles.toast, ...(toast.kind === "error" ? styles.toastError : {}) }}>
          {toast.kind === "error" ? <X size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {screen === "dashboard" && <Dashboard totals={totals} lateCount={lateRows.length} onNavigate={setScreen} user={currentUser} onLogout={handleLogout} />}
      {screen === "pay" && (
        <PayScreen
          rows={rows} payments={payments} employees={employees}
          onPay={recordPayment} onDeletePayment={deletePayment}
          onShowReceipt={(client, payment) => setActiveReceipt({ client, payment })}
          onBack={() => setScreen("dashboard")}
        />
      )}
      {screen === "addClient" && <AddClientScreen onSave={addClient} onBack={() => setScreen("dashboard")} />}
      {screen === "search" && <SearchScreen rows={rows} onUpdateClient={updateClient} onBack={() => setScreen("dashboard")} />}

      {screen === "treasury" && (
        <TreasuryMainScreen
          partners={partners} expenses={expenses} employees={employees}
          salaryLog={salaryLog} withdrawalsLog={withdrawalsLog} totals={totals}
          onNavigate={setScreen} onBack={() => setScreen("dashboard")}
        />
      )}

      {screen === "treasuryPartners" && (
        <PartnersScreen
          partners={partners} onAddPartner={addPartner}
          withdrawalsLog={withdrawalsLog} setWithdrawalsLog={setWithdrawalsLog}
          onSettlePartner={settleAndRemovePartner} onBack={() => setScreen("treasury")} notify={notify}
        />
      )}

      {screen === "treasuryExpenses" && (
        <ExpensesScreen
          expenses={expenses} setExpenses={setExpenses}
          onBack={() => setScreen("treasury")} notify={notify}
        />
      )}

      {screen === "treasuryEmployees" && (
        <EmployeesMergedScreen
          employees={employees} setEmployees={setEmployees}
          salaryLog={salaryLog} setSalaryLog={setSalaryLog}
          onBack={() => setScreen("treasury")} notify={notify}
        />
      )}

      {screen === "treasuryDistribute" && (
        <ProfitDistributionScreen
          partners={partners} setPartners={setPartners}
          expenses={expenses} salaryLog={salaryLog}
          withdrawalsLog={withdrawalsLog} setWithdrawalsLog={setWithdrawalsLog}
          distributionsLog={distributionsLog} setDistributionsLog={setDistributionsLog}
          totals={totals} onBack={() => setScreen("treasury")} notify={notify}
        />
      )}

      {screen === "monthlyDues" && <MonthlyDuesScreen rows={rows} payments={payments} onBack={() => setScreen("dashboard")} onPay={recordPayment} />}
      {screen === "deleteClient" && (
        <DeleteClientScreen
          clients={activeClients} setClients={setClients}
          deletedClients={deletedClients} setDeletedClients={setDeletedClients}
          onBack={() => setScreen("dashboard")} notify={notify}
        />
      )}
      {screen === "lateClients" && <LateClientsScreen rows={lateRows} onBack={() => setScreen("dashboard")} onPay={recordPayment} />}
      {screen === "changePassword" && <PlaceholderScreen title="تغيير كلمة السر" onBack={() => setScreen("dashboard")} />}
      {screen === "backup" && <PlaceholderScreen title="النسخ الاحتياطي السحابي" note="تم ربط النظام بقاعدة بيانات Supabase بنجاح." onBack={() => setScreen("dashboard")} />}

      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}

/* ============================================================
   1. شاشة "الخزينة والحسابات" الرئيسية (صورة 1)
   ============================================================ */
function TreasuryMainScreen({ partners, expenses, salaryLog, totals, onNavigate, onBack }) {
  const totalCapital = useMemo(() => partners.reduce((s, p) => s + Number(p.capital || 0), 0), [partners]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const totalSalaries = useMemo(() => salaryLog.reduce((s, x) => s + Number(x.amount || 0), 0), [salaryLog]);
  const netDistributableProfit = Math.max(0, totals.totalProfit - totalExpenses - totalSalaries);

  return (
    <div style={styles.container}>
      <ScreenHeader title="الخزينة والحسابات" onBack={onBack} />

      <section style={{ ...styles.kpiRow, marginBottom: 24 }}>
        <KPI icon={Wallet} label="إجمالي رأس مال الشركة" sub="صافي مستحقات كل الشركاء" value={fmt(totalCapital)} />
        <KPI icon={CreditCard} label="إجمالي المصروفات" sub="كل المصروفات المسجلة" value={fmt(totalExpenses)} />
        <KPI icon={UserCog} label="إجمالي رواتب وسلف الموظفين" sub="كل حركات الرواتب المسجلة" value={fmt(totalSalaries)} />
        <KPI icon={TrendingUp} label="صافي الربح القابل للتوزيع" sub="الأرباح - المصروفات - الرواتب" value={fmt(netDistributableProfit)} />
      </section>

      <section style={styles.grid}>
        <DashButton label="الشركاء ورأس المال" Icon={Users} tone="copper" onClick={() => onNavigate("treasuryPartners")} />
        <DashButton label="توزيع الأرباح" Icon={Wallet} tone="roseDark" onClick={() => onNavigate("treasuryDistribute")} />
        <DashButton label="إضافة موظف ورواتب وسلف الموظفين" Icon={UserCog} tone="dark" onClick={() => onNavigate("treasuryEmployees")} />
        <DashButton label="المصروفات" Icon={CreditCard} tone="copper" onClick={() => onNavigate("treasuryExpenses")} />
      </section>
      <BottomExitButton onBack={onBack} />
    </div>
  );
}

/* ============================================================
   2. شاشة الشركاء ورأس المال (صورة 2)
   ============================================================ */
function PartnersScreen({ partners, onAddPartner, withdrawalsLog, setWithdrawalsLog, onSettlePartner, onBack, notify }) {
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [withdrawPartner, setWithdrawPartner] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");

  const [selectedPartnerModal, setSelectedPartnerModal] = useState(null);
  const [settleConfirmModal, setSettleConfirmModal] = useState(null);

  const totalCapital = useMemo(() => partners.reduce((s, p) => s + Number(p.capital || 0), 0), [partners]);

  const livePercent = useMemo(() => {
    const numCap = parseFloat(capital) || 0;
    if (totalCapital + numCap === 0) return 0;
    return ((numCap / (totalCapital + numCap)) * 100).toFixed(2);
  }, [capital, totalCapital]);

  const partnersCalculated = useMemo(() => {
    return partners.map((p) => {
      const sharePct = totalCapital > 0 ? (p.capital / totalCapital) * 100 : 0;
      const partnerWithdrawals = withdrawalsLog.filter(w => String(w.partnerId) === String(p.id)).reduce((s, w) => s + Number(w.amount), 0);
      const netAmount = Math.max(0, p.capital + (p.profit || 0) - partnerWithdrawals);
      return { ...p, sharePct: sharePct.toFixed(2), totalWithdrawals: partnerWithdrawals, netAmount };
    });
  }, [partners, totalCapital, withdrawalsLog]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !capital) return;
    onAddPartner(name, capital);
    setName(""); setCapital("");
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount) || 0;
    const partnerObj = partners.find(p => p.name === withdrawPartner);
    if (!partnerObj || num <= 0) return;

    const newW = {
      id: Date.now(), partnerId: partnerObj.id, partnerName: partnerObj.name,
      amount: num, date: new Date().toISOString().split("T")[0], notes: withdrawNotes || "سحب مالي"
    };

    setWithdrawalsLog((prev) => [...prev, newW]);
    setWithdrawAmount(""); setWithdrawNotes(""); setWithdrawPartner("");
    notify(`تم تسجيل سحب مالي بمبلغ ${fmt(num)} ج.م للشريك ${partnerObj.name} بنجاح!`);
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title="الشركاء ورأس المال" onBack={onBack} />

      <div style={{ background: "#211f18", border: "1px solid #d0b689", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#c4c4c4" }}>إجمالي رأس مال الشركة الفعلي</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#e8cd9c", marginTop: 4 }}>{fmt(totalCapital)} ج.م</div>
      </div>

      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#1b1b1d", color: "#e8cd9c", borderBottom: "1px solid #404040" }}>
                <th style={{ padding: "12px" }}>الشريك</th>
                <th style={{ padding: "12px" }}>رأس المال</th>
                <th style={{ padding: "12px" }}>النسبة</th>
                <th style={{ padding: "12px" }}>الأرباح المجمعة</th>
                <th style={{ padding: "12px" }}>المسحوبات</th>
                <th style={{ padding: "12px" }}>الصافي المستحق</th>
                <th style={{ padding: "12px", textAlign: "center" }}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {partnersCalculated.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                  <td
                    style={{ padding: "12px", fontWeight: 800, color: "#e8cd9c", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setSelectedPartnerModal(p)}
                  >
                    {p.name}
                  </td>
                  <td style={{ padding: "12px" }}>{fmt(p.capital)} ج.م</td>
                  <td style={{ padding: "12px", color: "#d0b689", fontWeight: 800 }}>{p.sharePct}%</td>
                  <td style={{ padding: "12px", color: "#bfe8cd" }}>{fmt(p.profit || 0)} ج.م</td>
                  <td style={{ padding: "12px", color: "#f0c6bb" }}>{fmt(p.totalWithdrawals)} ج.م</td>
                  <td style={{ padding: "12px", fontWeight: 800, color: "#fff" }}>{fmt(p.netAmount)} ج.م</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      type="button" onClick={() => setSettleConfirmModal(p)}
                      style={{ background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb", padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <UserMinus size={12} /> تصفية وحذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div style={styles.card}>
          <div style={{ ...styles.sectionLabel, marginTop: 0 }}>إضافة شريك جديد</div>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <Field label="اسم الشريك"><input style={styles.input} value={name} onChange={e => setName(e.target.value)} required /></Field>
            <Field label="مبلغ الاستثمار (رأس المال)"><input type="number" style={styles.input} value={capital} onChange={e => setCapital(e.target.value)} placeholder="0" required /></Field>
            <div style={{ background: "#1b1b1d", border: "1px dashed #d0b689", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#c4c4c4" }}>نسبة الشريك التلقائية:</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#e8cd9c" }}>{livePercent}%</span>
            </div>
            <button type="submit" style={styles.saveBtn}>حفظ الشريك الجديد</button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.sectionLabel, marginTop: 0 }}>تسجيل سحب مالي (حرية الشريك في السحب)</div>
          <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <Field label="اسم الشريك">
              <select style={styles.input} value={withdrawPartner} onChange={e => setWithdrawPartner(e.target.value)} required>
                <option value="">اختار اسم الشريك...</option>
                {partners.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="مبلغ السحب (ج.م) *"><input type="number" style={styles.input} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0" required /></Field>
            <Field label="بيان وسبب السحب"><input style={styles.input} value={withdrawNotes} onChange={e => setWithdrawNotes(e.target.value)} placeholder="مثال: سحب نقدي تحت حساب الأرباح" /></Field>
            <button type="submit" style={styles.saveBtn}>تسجيل السحب</button>
          </form>
        </div>
      </div>

      {selectedPartnerModal && (
        <PartnerDetailsModal partner={selectedPartnerModal} withdrawalsLog={withdrawalsLog} onClose={() => setSelectedPartnerModal(null)} />
      )}

      {settleConfirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ ...styles.card, width: "100%", maxWidth: 440, textAlign: "center" }}>
            <h3 style={{ color: "#e07a5f", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>تأكيد تصفية وحذف حساب الشريك: {settleConfirmModal.name}</h3>
            <p style={{ color: "#c4c4c4", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>عند التأكيد، سيتم تصفية رصيد الشريك وتسوية حسابه وحذفه وإعادة حساب النسب تلقائياً.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => { onSettlePartner(settleConfirmModal.id); setSettleConfirmModal(null); }} style={{ ...styles.saveBtn, flex: 1, background: "#e07a5f", color: "#fff", marginTop: 0 }}>تأكيد التصفية والحذف</button>
              <button type="button" onClick={() => setSettleConfirmModal(null)} style={{ background: "#1b1b1d", border: "1px solid #404040", color: "#fff", borderRadius: 12, padding: "12px 18px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <BottomExitButton onBack={onBack} />
    </div>
  );
}

function PartnerDetailsModal({ partner, withdrawalsLog, onClose }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const partnerWithdrawals = useMemo(() => {
    return withdrawalsLog.filter((w) => {
      if (String(w.partnerId) !== String(partner.id)) return false;
      if (fromDate && w.date < fromDate) return false;
      if (toDate && w.date > toDate) return false;
      return true;
    });
  }, [withdrawalsLog, partner, fromDate, toDate]);

  const filteredTotal = partnerWithdrawals.reduce((s, w) => s + Number(w.amount), 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#242426", border: "1px solid #d0b689", borderRadius: 18, width: "100%", maxWidth: 580, padding: 22, color: "#fff", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: "#1b1b1d", border: "1px solid #404040", color: "#e8cd9c", width: 34, height: 34, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e8cd9c", marginBottom: 12 }}>سجل سحوبات الشريك: {partner.name}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, background: "#1b1b1d", padding: 12, borderRadius: 12, marginBottom: 16 }}>
          <div><span style={{ fontSize: 11, color: "#888" }}>رأس المال:</span> <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{fmt(partner.capital)} ج.م</div></div>
          <div><span style={{ fontSize: 11, color: "#888" }}>إجمالي المسحوبات:</span> <div style={{ fontSize: 15, fontWeight: 800, color: "#f0c6bb" }}>{fmt(filteredTotal)} ج.م</div></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, background: "#1f1f22", padding: 10, borderRadius: 10 }}>
          <Field label="من تاريخ"><DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} /></Field>
          <Field label="إلى تاريخ"><DateInput value={toDate} onChange={e => setToDate(e.target.value)} /></Field>
        </div>
        <div style={{ overflowX: "auto", maxHeight: 240, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#1b1b1d", color: "#c4c4c4", borderBottom: "1px solid #404040" }}>
                <th style={{ padding: "8px" }}>التاريخ</th><th style={{ padding: "8px" }}>المبلغ</th><th style={{ padding: "8px" }}>البيان</th>
              </tr>
            </thead>
            <tbody>
              {partnerWithdrawals.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 16, textAlign: "center", color: "#888" }}>لا توجد مسحوبات مسجلة.</td></tr>
              ) : (
                partnerWithdrawals.slice().reverse().map(w => (
                  <tr key={w.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                    <td style={{ padding: "8px" }}>{w.date}</td>
                    <td style={{ padding: "8px", color: "#f0c6bb", fontWeight: 800 }}>{fmt(w.amount)} ج.م</td>
                    <td style={{ padding: "8px", color: "#888" }}>{w.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   3. شاشة المصروفات المفلترة تاريخياً (صورة 4)
   ============================================================ */
function ExpensesScreen({ expenses, setExpenses, onBack, notify }) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("إيجار المحل");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      return true;
    });
  }, [expenses, fromDate, toDate]);

  const totalFiltered = useMemo(() => filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0), [filteredExpenses]);

  const handleAdd = (e) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0) return;
    const newE = { id: Date.now(), date, category, amount: num, notes };
    setExpenses((prev) => [...prev, newE]);
    setAmount(""); setNotes("");
    notify("تم تسجيل المصروف الخزيني بنجاح!");
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    notify("تم حذف المصروف بنجاح!");
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title="المصروفات" onBack={onBack} />

      <div style={{ ...styles.card, marginBottom: 20 }}>
        <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <Field label="التاريخ"><DateInput value={date} onChange={e => setDate(e.target.value)} required /></Field>
          <Field label="البند">
            <select style={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="إيجار المحل">إيجار المحل</option>
              <option value="كهرباء ومياه وغاز">فواتير كهرباء ومياه</option>
              <option value="رواتب ونثريات">رواتب ونثريات</option>
              <option value="صيانة وإصلاحات">صيانة وإصلاحات</option>
              <option value="مصروفات أخرى">أخرى</option>
            </select>
          </Field>
          <Field label="المبلغ"><input type="number" style={styles.input} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required /></Field>
          <Field label="ملاحظات"><input style={styles.input} value={notes} onChange={e => setNotes(e.target.value)} placeholder="تفاصيل..." /></Field>
          <div style={{ gridColumn: "1 / -1", marginTop: 6 }}><button type="submit" style={styles.saveBtn}>تسجيل المصروف</button></div>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#e8cd9c" }}>سجل المصروفات (إجمالي: {fmt(totalFiltered)} ج.م)</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Field label="من تاريخ"><DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: "6px 10px", fontSize: 13 }} /></Field>
            <Field label="إلى تاريخ"><DateInput value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: "6px 10px", fontSize: 13 }} /></Field>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#1b1b1d", color: "#c4c4c4", borderBottom: "1px solid #404040" }}>
                <th style={{ padding: "10px" }}>التاريخ</th><th style={{ padding: "10px" }}>البند</th><th style={{ padding: "10px" }}>المبلغ</th><th style={{ padding: "10px" }}>ملاحظات</th><th style={{ padding: "10px", textAlign: "center" }}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#888" }}>لا توجد مصروفات في هذه الفترة.</td></tr>
              ) : (
                filteredExpenses.slice().reverse().map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                    <td style={{ padding: "10px" }}>{exp.date}</td>
                    <td style={{ padding: "10px", fontWeight: 700, color: "#e8cd9c" }}>{exp.category}</td>
                    <td style={{ padding: "10px", fontWeight: 800, color: "#f0c6bb" }}>{fmt(exp.amount)} ج.م</td>
                    <td style={{ padding: "10px", color: "#888" }}>{exp.notes || "—"}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button type="button" onClick={() => handleDelete(exp.id)} style={{ background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 700 }}><Trash2 size={12} /> حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <BottomExitButton onBack={onBack} />
    </div>
  );
}

/* ============================================================
   4. شاشة الموظفين والرواتب المدمجة (صور 5 و 6)
   ============================================================ */
function EmployeesMergedScreen({ employees, setEmployees, salaryLog, setSalaryLog, onBack, notify }) {
  const [activeTab, setActiveTab] = useState("employees");
  const [empForm, setEmpForm] = useState({ name: "", phone: "", job: "", salary: "", hireDate: "" });

  const [selectedEmpName, setSelectedEmpName] = useState("");
  const [transType, setType] = useState("صرف راتب شهري");
  const [transAmount, setAmount] = useState("");
  const [transNotes, setNotes] = useState("");
  const [selectedEmployeeModal, setSelectedEmployeeModal] = useState(null);

  const handleAddEmp = (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.salary) return;
    const newEmp = { id: Date.now(), ...empForm, salary: parseFloat(empForm.salary) || 0, status: "نشط" };
    setEmployees((prev) => [...prev, newEmp]);
    setEmpForm({ name: "", phone: "", job: "", salary: "", hireDate: "" });
    notify("تم حفظ بيانات الموظف بنجاح!");
  };

  const handleTransSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(transAmount) || 0;
    const emp = employees.find(x => x.name === selectedEmpName);
    if (!emp || num <= 0) return;

    const newTrans = {
      id: Date.now(), employeeId: emp.id, employeeName: emp.name,
      type: transType, amount: num, date: new Date().toISOString().split("T")[0], notes: transNotes
    };

    setSalaryLog((prev) => [...prev, newTrans]);
    setAmount(""); setNotes(""); setSelectedEmpName("");
    notify(`تم تسجيل حركة (${transType}) بمبلغ ${fmt(num)} ج.م للموظف ${emp.name} بنجاح!`);
  };

  const handleTerminateContract = (empId) => {
    setEmployees((prev) => prev.map(e => String(e.id) === String(empId) ? { ...e, status: "فسخ عقد / منتهي" } : e));
    setSelectedEmployeeModal(null);
    notify("تم فسخ عقد الموظف ونقله للأرشيف بنجاح!");
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title="إضافة موظف ورواتب وسلف الموظفين" onBack={onBack} />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button type="button" onClick={() => setActiveTab("employees")} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #404040", background: activeTab === "employees" ? "linear-gradient(145deg, #e8cd9c, #d0b689)" : "#1b1b1d", color: activeTab === "employees" ? "#1b1b1d" : "#c4c4c4", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>👤 إضافة وقائمة الموظفين</button>
        <button type="button" onClick={() => setActiveTab("salaries")} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #404040", background: activeTab === "salaries" ? "linear-gradient(145deg, #e8cd9c, #d0b689)" : "#1b1b1d", color: activeTab === "salaries" ? "#1b1b1d" : "#c4c4c4", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>💵 رواتب وسلف الموظفين</button>
      </div>

      {activeTab === "employees" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginTop: 0 }}>إضافة موظف جديد</div>
            <form onSubmit={handleAddEmp} style={{ ...styles.formGrid, marginTop: 12 }}>
              <Field label="اسم الموظف *"><input style={styles.input} value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required /></Field>
              <Field label="التليفون"><input style={styles.input} value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} /></Field>
              <Field label="الوظيفة"><input style={styles.input} value={empForm.job} onChange={e => setEmpForm({ ...empForm, job: e.target.value })} /></Field>
              <Field label="الراتب الأساسي *"><input type="number" style={styles.input} value={empForm.salary} onChange={e => setEmpForm({ ...empForm, salary: e.target.value })} required /></Field>
              <div style={{ gridColumn: "1 / -1" }}><Field label="تاريخ التعيين"><DateInput value={empForm.hireDate} onChange={e => setEmpForm({ ...empForm, hireDate: e.target.value })} required /></Field></div>
              <button type="submit" style={styles.saveBtn}>حفظ بيانات الموظف</button>
            </form>
          </div>

          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginTop: 0 }}>قائمة الموظفين (اضغط على اسم الموظف لاستعراض السجل والفسخ)</div>
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#1b1b1d", color: "#e8cd9c", borderBottom: "1px solid #404040" }}>
                    <th style={{ padding: "10px" }}>الاسم</th><th style={{ padding: "10px" }}>التليفون</th><th style={{ padding: "10px" }}>الوظيفة</th><th style={{ padding: "10px" }}>الراتب</th><th style={{ padding: "10px" }}>تاريخ التعيين</th><th style={{ padding: "10px" }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                      <td style={{ padding: "10px", fontWeight: 800, color: "#e8cd9c", cursor: "pointer", textDecoration: "underline" }} onClick={() => setSelectedEmployeeModal(emp)}>{emp.name}</td>
                      <td style={{ padding: "10px" }}>{emp.phone || "—"}</td>
                      <td style={{ padding: "10px" }}>{emp.job}</td>
                      <td style={{ padding: "10px", fontWeight: 700 }}>{fmt(emp.salary)} ج.م</td>
                      <td style={{ padding: "10px" }}>{emp.hireDate}</td>
                      <td style={{ padding: "10px", color: emp.status === "نشط" ? "#bfe8cd" : "#e07a5f", fontWeight: 700 }}>{emp.status || "نشط"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "salaries" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginTop: 0 }}>رواتب وسلف الموظفين</div>
            <form onSubmit={handleTransSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <Field label="اسم الموظف">
                <select style={styles.input} value={selectedEmpName} onChange={e => setSelectedEmpName(e.target.value)} required>
                  <option value="">اختار اسم الموظف...</option>
                  {employees.filter(e => e.status !== "فسخ عقد / منتهي").map(e => <option key={e.id} value={e.name}>{e.name} ({e.job})</option>)}
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Field label="نوع الحركة">
                  <select style={styles.input} value={transType} onChange={e => setType(e.target.value)}>
                    <option value="صرف راتب شهري">صرف راتب شهري</option>
                    <option value="سلفة نقدية">سلفة نقدية</option>
                    <option value="مكافأة حافز">مكافأة / حافز</option>
                    <option value="خصم جزاء">خصم / جزاء</option>
                  </select>
                </Field>
                <Field label="المبلغ (ج.م) *"><input type="number" style={styles.input} value={transAmount} onChange={e => setAmount(e.target.value)} placeholder="0" required /></Field>
              </div>
              <Field label="ملاحظات الحركة"><input style={styles.input} value={transNotes} onChange={e => setNotes(e.target.value)} placeholder="تفاصيل..." /></Field>
              <button type="submit" style={styles.saveBtn}>تنفيذ الحركة وحفظها</button>
            </form>
          </div>

          <div style={styles.card}>
            <div style={{ ...styles.sectionLabel, marginTop: 0 }}>سجل حركات الرواتب والسلف</div>
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#1b1b1d", color: "#c4c4c4", borderBottom: "1px solid #404040" }}>
                    <th style={{ padding: "8px" }}>التاريخ</th><th style={{ padding: "8px" }}>الموظف</th><th style={{ padding: "8px" }}>نوع الحركة</th><th style={{ padding: "8px" }}>المبلغ</th><th style={{ padding: "8px" }}>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryLog.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#888" }}>لا توجد حركات مسجلة.</td></tr>
                  ) : (
                    salaryLog.slice().reverse().map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                        <td style={{ padding: "8px" }}>{s.date}</td>
                        <td style={{ padding: "8px", fontWeight: 700, color: "#e8cd9c" }}>{s.employeeName}</td>
                        <td style={{ padding: "8px" }}>{s.type}</td>
                        <td style={{ padding: "8px", fontWeight: 800, color: "#f0c6bb" }}>{fmt(s.amount)} ج.م</td>
                        <td style={{ padding: "8px", color: "#888" }}>{s.notes || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedEmployeeModal && (
        <EmployeeDetailsModal employee={selectedEmployeeModal} salaryLog={salaryLog} onTerminate={handleTerminateContract} onClose={() => setSelectedEmployeeModal(null)} />
      )}

      <BottomExitButton onBack={onBack} />
    </div>
  );
}

function EmployeeDetailsModal({ employee, salaryLog, onTerminate, onClose }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const empLogs = useMemo(() => {
    return salaryLog.filter((s) => {
      if (String(s.employeeId) !== String(employee.id) && s.employeeName !== employee.name) return false;
      if (fromDate && s.date < fromDate) return false;
      if (toDate && s.date > toDate) return false;
      return true;
    });
  }, [salaryLog, employee, fromDate, toDate]);

  const totalEmpPaid = empLogs.reduce((acc, x) => acc + Number(x.amount), 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#242426", border: "1px solid #d0b689", borderRadius: 18, width: "100%", maxWidth: 600, padding: 22, color: "#fff", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: "#1b1b1d", border: "1px solid #404040", color: "#e8cd9c", width: 34, height: 34, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e8cd9c", marginBottom: 12 }}>ملف الموظف: {employee.name}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, background: "#1b1b1d", padding: 12, borderRadius: 12, marginBottom: 16 }}>
          <div><span style={{ fontSize: 11, color: "#888" }}>الوظيفة:</span> <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{employee.job}</div></div>
          <div><span style={{ fontSize: 11, color: "#888" }}>الراتب الأساسي:</span> <div style={{ fontSize: 14, fontWeight: 800, color: "#d0b689" }}>{fmt(employee.salary)} ج.م</div></div>
          <div><span style={{ fontSize: 11, color: "#888" }}>الإجمالي بالفلترة:</span> <div style={{ fontSize: 14, fontWeight: 800, color: "#f0c6bb" }}>{fmt(totalEmpPaid)} ج.م</div></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, background: "#1f1f22", padding: 10, borderRadius: 10 }}>
          <Field label="من تاريخ"><DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} /></Field>
          <Field label="إلى تاريخ"><DateInput value={toDate} onChange={e => setToDate(e.target.value)} /></Field>
        </div>
        <div style={{ overflowX: "auto", maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#1b1b1d", color: "#c4c4c4", borderBottom: "1px solid #404040" }}>
                <th style={{ padding: "8px" }}>التاريخ</th><th style={{ padding: "8px" }}>نوع الحركة</th><th style={{ padding: "8px" }}>المبلغ</th><th style={{ padding: "8px" }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {empLogs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#888" }}>لا توجد حركات مسجلة.</td></tr>
              ) : (
                empLogs.slice().reverse().map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                    <td style={{ padding: "8px" }}>{s.date}</td>
                    <td style={{ padding: "8px", fontWeight: 700, color: "#e8cd9c" }}>{s.type}</td>
                    <td style={{ padding: "8px", color: "#f0c6bb", fontWeight: 800 }}>{fmt(s.amount)} ج.م</td>
                    <td style={{ padding: "8px", color: "#888" }}>{s.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {employee.status !== "فسخ عقد / منتهي" && (
          <button type="button" onClick={() => onTerminate(employee.id)} style={{ width: "100%", background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb", padding: "10px", borderRadius: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><UserMinus size={16} /> فسخ العقد وإنهاء خدمة الموظف</button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   5. شاشة توزيع الأرباح الفائقة (صورة 3)
   ============================================================ */
function ProfitDistributionScreen({ partners, setPartners, expenses, salaryLog, withdrawalsLog, setWithdrawalsLog, distributionsLog, setDistributionsLog, totals, onBack, notify }) {
  const [periodFilter, setPeriodFilter] = useState("all");
  const [fromDate, setFromDate] = useState(() => "2026-07-01");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [customDistributeAmount, setCustomDistributeAmount] = useState("");
  const [partnerDecisions, setPartnerDecisions] = useState({});
  const [selectedPartnerModal, setSelectedPartnerModal] = useState(null);

  const totalCapital = useMemo(() => partners.reduce((s, p) => s + Number(p.capital || 0), 0), [partners]);

  const filteredPeriodData = useMemo(() => {
    const periodExpenses = expenses.filter(e => (!fromDate || e.date >= fromDate) && (!toDate || e.date <= toDate)).reduce((s, e) => s + Number(e.amount), 0);
    const periodSalaries = salaryLog.filter(s => (!fromDate || s.date >= fromDate) && (!toDate || s.date <= toDate)).reduce((s, x) => s + Number(x.amount), 0);
    const netPeriodProfit = Math.max(0, totals.totalProfit - periodExpenses - periodSalaries);
    return { periodExpenses, periodSalaries, netPeriodProfit };
  }, [expenses, salaryLog, totals.totalProfit, fromDate, toDate]);

  const autoAmount = customDistributeAmount !== "" ? (parseFloat(customDistributeAmount) || 0) : filteredPeriodData.netPeriodProfit;

  const partnersCalculated = useMemo(() => {
    return partners.map((p) => {
      const sharePct = totalCapital > 0 ? (p.capital / totalCapital) * 100 : 0;
      const amountForThisPartner = Math.round(autoAmount * (sharePct / 100));
      const partnerWithdrawals = withdrawalsLog.filter(w => String(w.partnerId) === String(p.id)).reduce((s, w) => s + Number(w.amount), 0);
      const decision = partnerDecisions[p.id] || "سحب فوري";
      return { ...p, sharePct: sharePct.toFixed(2), prevWithdrawals: partnerWithdrawals, shareAmount: amountForThisPartner, decision };
    });
  }, [partners, totalCapital, autoAmount, withdrawalsLog, partnerDecisions]);

  const setPresetPeriod = (preset) => {
    setPeriodFilter(preset);
    const d = new Date();
    if (preset === "currentMonth") {
      setFromDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
      setToDate(d.toISOString().split("T")[0]);
    } else if (preset === "lastMonth") {
      const prevM = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const endPrevM = new Date(d.getFullYear(), d.getMonth(), 0);
      setFromDate(prevM.toISOString().split("T")[0]);
      setToDate(endPrevM.toISOString().split("T")[0]);
    } else if (preset === "twoMonths") {
      const prev2M = new Date(d.getFullYear(), d.getMonth() - 2, 1);
      setFromDate(prev2M.toISOString().split("T")[0]);
      setToDate(d.toISOString().split("T")[0]);
    }
  };

  const toggleDecision = (partnerId) => {
    setPartnerDecisions(prev => ({ ...prev, [partnerId]: prev[partnerId] === "إعادة استثمار" ? "سحب فوري" : "إعادة استثمار" }));
  };

  const handleExecuteDistribution = () => {
    if (autoAmount <= 0) { notify("لا يوجد مبلغ قابل للتوزيع!", "error"); return; }
    partnersCalculated.forEach((p) => {
      if (p.decision === "إعادة استثمار") {
        setPartners(prev => prev.map(x => String(x.id) === String(p.id) ? { ...x, capital: x.capital + p.shareAmount } : x));
      } else {
        const newW = { id: Date.now() + Math.random(), partnerId: p.id, partnerName: p.name, amount: p.shareAmount, date: new Date().toISOString().split("T")[0], notes: "توزيع أرباح - سحب فوري" };
        setWithdrawalsLog(prev => [...prev, newW]);
      }
    });
    const newDist = { id: Date.now(), date: new Date().toISOString().split("T")[0], amount: autoAmount, details: partnersCalculated.map(p => `${p.name}: ${fmt(p.shareAmount)} ج.م (${p.decision})`).join(" | ") };
    setDistributionsLog(prev => [...prev, newDist]);
    notify(`تم تنفيذ توزيع الأرباح بمبلغ ${fmt(autoAmount)} ج.م بنجاح!`);
  };

  return (
    <div style={styles.container}>
      <ScreenHeader title="توزيع الأرباح على الشركاء" onBack={onBack} />

      <div style={{ background: "#211f18", border: "1px solid #d0b689", borderRadius: 16, padding: 18, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#c4c4c4" }}>الأرباح حتى اليوم (كل الفترات)</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#e8cd9c", marginTop: 2 }}>{fmt(totals.totalProfit)} ج.م</div>
      </div>

      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#e8cd9c", marginBottom: 10 }}>حدد الفترة اللي عايز تحسب أرباحها</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <button type="button" onClick={() => setPresetPeriod("currentMonth")} style={{ background: periodFilter === "currentMonth" ? "#d0b689" : "#1b1b1d", color: periodFilter === "currentMonth" ? "#1b1b1d" : "#c4c4c4", border: "1px solid #404040", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>الشهر الحالي</button>
          <button type="button" onClick={() => setPresetPeriod("lastMonth")} style={{ background: periodFilter === "lastMonth" ? "#d0b689" : "#1b1b1d", color: periodFilter === "lastMonth" ? "#1b1b1d" : "#c4c4c4", border: "1px solid #404040", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>الشهر اللي فات</button>
          <button type="button" onClick={() => setPresetPeriod("twoMonths")} style={{ background: periodFilter === "twoMonths" ? "#d0b689" : "#1b1b1d", color: periodFilter === "twoMonths" ? "#1b1b1d" : "#c4c4c4", border: "1px solid #404040", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>من شهرين</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
          <Field label="من تاريخ"><DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} /></Field>
          <Field label="إلى تاريخ"><DateInput value={toDate} onChange={e => setToDate(e.target.value)} /></Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, background: "#1b1b1d", border: "1px dashed #d0b689", borderRadius: 12, padding: 12, textAlign: "center" }}>
          <div><div style={{ fontSize: 11, color: "#888" }}>المصروفات بالفترة</div><div style={{ fontSize: 15, fontWeight: 800, color: "#f0c6bb" }}>{fmt(filteredPeriodData.periodExpenses)} ج.م</div></div>
          <div><div style={{ fontSize: 11, color: "#888" }}>الرواتب بالفترة</div><div style={{ fontSize: 15, fontWeight: 800, color: "#f0c6bb" }}>{fmt(filteredPeriodData.periodSalaries)} ج.م</div></div>
          <div><div style={{ fontSize: 11, color: "#888" }}>الصافي للتوزيع</div><div style={{ fontSize: 16, fontWeight: 800, color: "#e8cd9c" }}>{fmt(filteredPeriodData.netPeriodProfit)} ج.م</div></div>
        </div>
      </div>

      <div style={{ ...styles.card, marginBottom: 20 }}>
        <Field label="المبلغ المراد توزيعه فعلياً (قابل للتعديل يدويًا)">
          <input type="number" style={{ ...styles.input, fontSize: 18, fontWeight: 800, color: "#e8cd9c" }} value={customDistributeAmount !== "" ? customDistributeAmount : filteredPeriodData.netPeriodProfit} onChange={e => setCustomDistributeAmount(e.target.value)} />
        </Field>
      </div>

      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#e8cd9c", marginBottom: 12 }}>توزيع المبلغ حسب نسبة كل شريك</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", textAlign: "right", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#1b1b1d", color: "#e8cd9c", borderBottom: "1px solid #404040" }}>
                <th style={{ padding: "10px" }}>الشريك</th><th style={{ padding: "10px" }}>النسبة</th><th style={{ padding: "10px" }}>مسحوباته السابقة</th><th style={{ padding: "10px" }}>نصيبه من هذا التوزيع</th><th style={{ padding: "10px", textAlign: "center" }}>القرار</th>
              </tr>
            </thead>
            <tbody>
              {partnersCalculated.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #2d2d30" }}>
                  <td style={{ padding: "10px", fontWeight 800, color: "#e8cd9c", cursor: "pointer", textDecoration: "underline" }} onClick={() => setSelectedPartnerModal(p)}>{p.name}</td>
                  <td style={{ padding: "10px", color: "#d0b689", fontWeight: 800 }}>{p.sharePct}%</td>
                  <td style={{ padding: "10px", color: "#f0c6bb" }}>{fmt(p.prevWithdrawals)} ج.م</td>
                  <td style={{ padding: "10px", fontWeight: 800, color: "#bfe8cd" }}>{fmt(p.shareAmount)} ج.م</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button type="button" onClick={() => toggleDecision(p.id)} style={{ background: p.decision === "إعادة استثمار" ? "#213526" : "#211f18", border: `1px solid ${p.decision === "إعادة استثمار" ? "#3d6b4a" : "#d0b689"}`, color: p.decision === "إعادة استثمار" ? "#bfe8cd" : "#e8cd9c", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {p.decision === "إعادة استثمار" ? <RefreshCw size={12} /> : <DollarSign size={12} />} {p.decision}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={handleExecuteDistribution} style={{ ...styles.saveBtn, marginTop: 16 }}>تنفيذ التوزيع على كل الشركاء</button>
      </div>

      {selectedPartnerModal && (
        <PartnerDetailsModal partner={selectedPartnerModal} withdrawalsLog={withdrawalsLog} onClose={() => setSelectedPartnerModal(null)} />
      )}

      <BottomExitButton onBack={onBack} />
    </div>
  );
}

/* ============================================================
   باقي مكونات الهيدر والأزرار والأنماط الثابتة
   ============================================================ */
function ScreenHeader({ title, onBack }) {
  return (
    <div style={styles.subHeader}>
      <button style={styles.backBtn} onClick={onBack} title="رجوع للرئيسية"><ArrowRight size={16} /> رجوع للرئيسية</button>
      <div style={styles.subTitle}>{title}</div>
      <button type="button" style={styles.topCloseBtn} onClick={onBack} title="إغلاق"><X size={18} /></button>
    </div>
  );
}

function BottomExitButton({ onBack }) {
  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #333336" }}>
      <button type="button" onClick={onBack} style={{ width: "100%", background: "#1b1b1d", border: "1px solid #404040", color: "#e8cd9c", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
        <ArrowRight size={16} /> خروج والعودة للشاشة الرئيسية
      </button>
    </div>
  );
}

/* أنماط التصميم القياسية */
const styles = {
  page: { minHeight: "100vh", background: `radial-gradient(1200px 600px at 20% -10%, #2a271f 0%, #1b1b1d 55%)`, padding: "24px 16px 60px", fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif", color: "#ffffff" },
  container: { maxWidth: 1100, margin: "0 auto" },
  toast: { position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: "#213526", border: "1px solid #3d6b4a", color: "#bfe8cd", padding: "10px 18px", borderRadius: 12, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, zIndex: 5000 },
  toastError: { background: "#3a2320", border: "1px solid #7a4a3f", color: "#f0c6bb" },
  dashHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, #e6cf9e 0%, #b6935a 50%, #8a6a35 100%)`, borderRadius: 18, padding: "18px 24px", marginBottom: 20 },
  adminBadge: { background: "#1b1b1d", color: "#e8cd9c", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 10 },
  dashTitle: { fontSize: 22, fontWeight: 800, color: "#2c2211" },
  dashSub: { fontSize: 12.5, color: "#5a4a2c", marginTop: 2 },
  calcIcon: { width: 44, height: 44, borderRadius: 12, background: "#1b1b1d", display: "flex", alignItems: "center", justifyContent: "center" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 },
  kpiCard: { background: "#242426", border: `1px solid #404040`, borderRadius: 16, padding: "20px 20px" },
  kpiValue: { fontSize: 24, fontWeight: 800, color: "#ffffff", fontVariantNumeric: "tabular-nums" },
  kpiLabel: { fontSize: 13.5, color: "#e8cd9c", fontWeight: 700, marginTop: 8 },
  kpiSub: { fontSize: 11.5, color: "#c4c4c4", marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  subHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "#242426", border: `1px solid #404040`, color: "#e8cd9c", padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 },
  topCloseBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "#242426", border: "1px solid #404040", cursor: "pointer", color: "#e8cd9c" },
  subTitle: { fontSize: 19, fontWeight: 800, color: "#e8cd9c" },
  card: { background: "#242426", border: `1px solid #404040`, borderRadius: 18, padding: 22 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  fieldLabel: { fontSize: 13.5, color: "#c4c4c4", fontWeight: 700, display: "block", marginBottom: 6 },
  input: { width: "100%", background: "#1b1b1d", border: "1px solid #404040", borderRadius: 10, padding: "12px 14px", color: "#ffffff", fontFamily: "inherit", fontSize: 15, outline: "none" },
  sectionLabel: { gridColumn: "1 / -1", fontSize: 13.5, fontWeight: 800, color: "#d0b689", marginTop: 12, paddingBottom: 8, borderBottom: `1px solid #404040` },
  liveBox: { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, background: "#211f18", border: "1px dashed rgba(208,182,137,0.5)", borderRadius: 12, padding: 14, margin: "6px 0" },
  saveBtn: { gridColumn: "1 / -1", background: `linear-gradient(145deg, #e8cd9c, #d0b689)`, color: "#1b1b1d", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginTop: 8, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
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
