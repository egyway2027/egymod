import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export default function Mobile3DView({
  totalRemaining = 0,
  monthlyTarget = 0,
  netProfit = 0,
  clientsList = [],
  onOpenScreen,
  onOpenModal,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSalaries, setTotalSalaries] = useState(0);

  useEffect(() => {
    async function loadLiveTreasuryData() {
      try {
        const [expRes, salRes] = await Promise.all([
          supabase.from("expenses").select("amount"),
          supabase.from("salary_log").select("amount")
        ]);

        const expSum = (expRes.data || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const salSum = (salRes.data || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        setTotalExpenses(expSum);
        setTotalSalaries(salSum);
      } catch (err) {
        console.error("Error fetching live expenses/salaries:", err);
      }
    }
    loadLiveTreasuryData();
  }, []);

  const overdueData = useMemo(() => {
    const activeContracts = (clientsList || []).filter(c => !c.is_deleted && c.status !== 'archived');
    let totalOverdueSum = 0;
    let lateCount = 0;
    let firstLateClient = null;
    const today = new Date();

    activeContracts.forEach(c => {
      const installments = Array.isArray(c.installments) ? c.installments : [];
      const unpaidLate = installments.filter(inst => {
        if (inst.is_paid || inst.status === 'paid') return false;
        const due = new Date(inst.due_date || inst.date);
        return due < today;
      });

      if (unpaidLate.length > 0) {
        lateCount++;
        const sumClientLate = unpaidLate.reduce((s, i) => s + Number(i.amount || 0), 0);
        totalOverdueSum += sumClientLate;

        if (!firstLateClient) {
          firstLateClient = {
            name: c.client_name || c.name || "عميل غير محدد",
            id: c.id ? `(#CNT-${c.id})` : "",
            amount: sumClientLate.toLocaleString()
          };
        }
      }
    });

    return {
      count: lateCount,
      totalSum: totalOverdueSum.toLocaleString(),
      firstClient: firstLateClient || { name: "لا يوجد متأخرات حالياً", id: "", amount: "0" }
    };
  }, [clientsList]);

  const chartPercentages = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const monthsTotals = [0, 0, 0, 0];

    (clientsList || []).forEach(c => {
      const insts = Array.isArray(c.installments) ? c.installments : [];
      insts.forEach(i => {
        if (i.is_paid || i.status === 'paid' || Number(i.amount) > 0) {
          const d = new Date(i.paid_at || i.due_date || i.created_at);
          if (!isNaN(d.getTime())) {
            const diff = curMonth - d.getMonth();
            if (diff >= 0 && diff <= 3) {
              monthsTotals[3 - diff] += Number(i.amount || 0);
            }
          }
        }
      });
    });

    const maxVal = Math.max(...monthsTotals, totalExpenses, 1);
    return {
      m1: Math.min(100, Math.max(15, Math.round((monthsTotals[0] / maxVal) * 100))),
      m2: Math.min(100, Math.max(15, Math.round((monthsTotals[1] / maxVal) * 100))),
      m3: Math.min(100, Math.max(15, Math.round((monthsTotals[2] / maxVal) * 100))),
      m4: Math.min(100, Math.max(15, Math.round((monthsTotals[3] / maxVal) * 100))),
      exp: Math.min(100, Math.max(15, Math.round((totalExpenses / maxVal) * 100)))
    };
  }, [clientsList, totalExpenses]);

  const monthNames = useMemo(() => {
    const arMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const cur = new Date().getMonth();
    return [
      arMonths[(cur - 3 + 12) % 12],
      arMonths[(cur - 2 + 12) % 12],
      arMonths[(cur - 1 + 12) % 12],
      arMonths[cur]
    ];
  }, []);

  const menuItems = [
    { key: 'addClient', icon: '👤+', title: 'إضافة عميل جديد' },
    { key: 'pay', icon: '💳', title: 'سداد الأقساط' },
    { key: 'clientQuery', icon: '🔍', title: 'استعلام عن عميل' },
    { key: 'overdue', icon: '⚠️', title: 'المتأخرين عن السداد' },
    { key: 'monthlyDues', icon: '🗓️', title: 'مستحقات هذا الشهر' },
    { key: 'employees', icon: '👔', title: 'شؤون الموظفين والرواتب' },
    { key: 'partners', icon: '🪙', title: 'الشركاء ورأس المال' },
    { key: 'treasury', icon: '⏱️', title: 'توزيع الأرباح والخزينة' },
    { key: 'whatsapp', icon: '💬', title: 'مركز الواتساب الذكي' },
    { key: 'deleteClient', icon: '👤✕', title: 'حذف حساب عميل' },
    { key: 'settings', icon: '⚙️', title: 'الإعدادات والصلاحيات' },
    { key: 'logout', icon: '↪', title: 'تسجيل الخروج' }
  ];

  const handleMenuClick = (key) => {
    setDrawerOpen(false);
    if (onOpenScreen) onOpenScreen(key);
  };

  return (
    <div className="mobile-app-root">
      <style>{`
        .mobile-app-root {
          width: 100%;
          height: 100dvh;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% 0%, #ffffff 0%, #e2ecf7 55%, #cbdcf0 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Cairo', sans-serif;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .mob-screen {
          width: 100%;
          max-width: 440px;
          height: 100%;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(6px, 1.2vh, 10px) clamp(8px, 2.5vw, 12px);
          gap: clamp(4px, 0.9vh, 8px);
          margin: 0 auto;
          position: relative;
          box-sizing: border-box;
        }
        .mob-top-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 22px;
          padding: clamp(6px, 1vh, 9px) 12px;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4), inset 0 2px 2px #fff;
          display: flex;
          flex-direction: column;
          gap: clamp(4px, 0.8vh, 6px);
          flex-shrink: 0;
        }
        .mob-top-row { display: flex; align-items: center; }
        .mob-header-right { display: flex; align-items: center; gap: 10px; }
        .mob-title { font-size: clamp(14px, 2vh, 16px); font-weight: 900; color: #0f172a; margin: 0; }
        .mob-menu-btn {
          width: clamp(36px, 4.6vh, 42px);
          height: clamp(36px, 4.6vh, 42px);
          border-radius: 14px;
          background: linear-gradient(180deg, #ffa14a 0%, #f46200 55%, #d64d00 100%);
          border: 1px solid #ffaf61;
          box-shadow: 0 8px 20px rgba(244, 98, 0, 0.42), inset 0 2px 2px rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: clamp(17px, 2.3vh, 20px);
          border: none;
          cursor: pointer;
        }
        .mob-pills-bar {
          display: grid;
          grid-template-columns: 1.15fr 1.15fr 1fr 1fr 1.1fr;
          gap: 3.5px;
          width: 100%;
        }
        .mob-pill {
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
          border: 1px solid #fff;
          padding: 3px 2px;
          border-radius: 14px;
          font-size: clamp(7.5px, 1.1vh, 8.8px);
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.5px;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(140, 165, 195, 0.22);
        }
        .mob-pill.orange {
          background: linear-gradient(180deg, #ffa14a 0%, #f46200 55%, #d64d00 100%);
          color: #fff;
          border: 1px solid #ffaf61;
        }
        .mob-search-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 3px 6px;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: clamp(36px, 4.6vh, 40px);
          flex-shrink: 0;
        }
        .mob-btn-orange {
          background: linear-gradient(180deg, #ffa14a 0%, #f46200 55%, #d64d00 100%);
          border: 1px solid #ffaf61;
          color: #fff;
          border-radius: 18px;
          padding: 0 14px;
          height: 100%;
          font-size: clamp(10px, 1.35vh, 11.5px);
          font-weight: 900;
          box-shadow: 0 8px 20px rgba(244, 98, 0, 0.42);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 3px;
          border: none;
          white-space: nowrap;
        }
        .mob-search-box { display: flex; align-items: center; gap: 6px; flex: 1; padding: 0 8px; }
        .mob-search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: clamp(9.5px, 1.25vh, 11px); font-weight: 700; text-align: right; color: #0f172a; }
        .mob-kpis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(5px, 1.1vw, 7px); flex-shrink: 0; }
        .mob-kpi-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: clamp(6px, 1vh, 8px) 6px;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          height: clamp(80px, 11.2vh, 94px);
        }
        .mob-kpi-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .mob-kpi-tag { background: #fff; border: 1px solid #e2e8f0; border-radius: 7px; padding: 1px 5px; font-size: 7.5px; font-weight: 800; color: #64748b; }
        .mob-kpi-icon { width: 22px; height: 22px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; }
        .mob-kpi-val { font-size: clamp(13px, 1.85vh, 16px); font-weight: 900; color: #0f172a; }
        .mob-kpi-lbl { font-size: clamp(8px, 1.15vh, 9.2px); font-weight: 900; color: #0f172a; margin: 0; }
        .mob-body-area { flex: 1; display: flex; flex-direction: column; gap: clamp(4px, 0.8vh, 6px); min-height: 0; }
        .mob-chart-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          padding: clamp(6px, 1vh, 9px) 12px;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1.2;
        }
        .mob-bars { display: flex; align-items: flex-end; justify-content: space-around; height: clamp(55px, 8vh, 75px); gap: 6px; }
        .mob-bar-item { display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; flex: 1; gap: 2px; }
        .mob-bar-track { width: 100%; max-width: 24px; background: rgba(0,0,0,0.04); border-radius: 8px 8px 4px 4px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
        .mob-bar-fill { width: 100%; border-radius: 6px 6px 0 0; background: linear-gradient(180deg, #ffa14a 0%, #f46200 55%, #d64d00 100%); }
        .mob-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(4px, 1vw, 6px); flex: 0.95; }
        .mob-stat-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          padding: 6px 8px;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          cursor: pointer;
        }
        .mob-overdue-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: clamp(5px, 0.9vh, 7px) 10px;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1.1;
          cursor: pointer;
        }
        .mob-overdue-row { background: #fff1f2; border: 1.5px solid #ffe4e6; border-radius: 12px; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; }
        .mob-footer {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.82) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 5px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 12px 28px -4px rgba(135, 160, 195, 0.4);
          flex-shrink: 0;
        }
        .mob-footer-txt { font-size: clamp(8px, 1.1vh, 9px); font-weight: 800; color: #64748b; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
        
        /* Drawer Sidebar */
        .mob-drawer-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(6px); z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
        .mob-drawer-overlay.open { opacity: 1; pointer-events: auto; }
        .mob-drawer-sidebar {
          position: fixed;
          top: 0;
          right: -100%;
          width: 290px;
          height: 100dvh;
          background: rgba(158,145,133,.56);
          backdrop-filter: blur(34px);
          border-left: 1px solid rgba(255,255,255,.78);
          box-shadow: -18px 0 42px rgba(32,27,24,.28);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: right .28s cubic-bezier(.4,0,.2,1);
          padding: 8px;
          box-sizing: border-box;
        }
        .mob-drawer-sidebar.open { right: 0; }
        .mob-drawer-dash-btn {
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,.34) 0%, rgba(235,228,220,.20) 32%, rgba(177,164,152,.16) 72%, rgba(105,94,84,.12) 100%);
          border: 1px solid rgba(255,255,255,.82);
          color: #ffffff;
          cursor: pointer;
        }
        .mob-drawer-list { flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; min-height: 0; margin: 6px 0; }
        .mob-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.34) 0%, rgba(235,228,220,.20) 32%, rgba(177,164,152,.16) 72%, rgba(105,94,84,.12) 100%);
          border: 1px solid rgba(255,255,255,.82);
          color: #ffffff;
          cursor: pointer;
          flex: 1;
          min-height: 0;
        }
        .mob-menu-icon { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .mob-drawer-admin {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          border-radius: 13px;
          background: rgba(255,255,255,0.3);
          border: 1px solid rgba(255,255,255,0.8);
        }
      `}</style>

      <div className="mob-screen">
        
        {/* 1. الهيدر العلوي */}
        <div className="mob-top-card">
          <div className="mob-top-row">
            <div className="mob-header-right">
              <button className="mob-menu-btn" onClick={() => setDrawerOpen(true)}>☰</button>
              <h1 className="mob-title">نظام إدارة الأقساط والمبيعات</h1>
            </div>
          </div>

          <div className="mob-pills-bar">
            <div className="mob-pill" onClick={() => handleMenuClick('centralRecords')}><span>🗂️ مركز السجلات</span><span>˅</span></div>
            <div className="mob-pill" onClick={() => handleMenuClick('recycleBin')}><span>🗑️ سلة المهملات</span><span>˅</span></div>
            <div className="mob-pill" onClick={() => handleMenuClick('archived')}><span>📦 الأرشيف</span><span>˅</span></div>
            <div className="mob-pill orange" onClick={() => handleMenuClick('themes')}><span>🎨 الثيمات</span></div>
            <div className="mob-pill" onClick={() => handleMenuClick('language')}><span>🌐 EG العربية</span></div>
          </div>
        </div>

        {/* 2. شريط البحث */}
        <div className="mob-search-card">
          <button className="mob-btn-orange" onClick={() => handleMenuClick('addClient')}>
            <span>+</span><span>إضافة جديد</span>
          </button>
          <div className="mob-search-box">
            <input type="text" placeholder="ابحث عن اسم عميل، رقم عقد، سداد، أو خدمة..." onFocus={() => onOpenModal && onOpenModal('globalSearch')} />
            <span>🔍</span>
          </div>
        </div>

        {/* 3. الكروت المالية الثلاثية */}
        <div className="mob-kpis-grid">
          <div className="mob-kpi-card">
            <div className="mob-kpi-top"><span className="mob-kpi-tag">الذمة المالية</span><div className="mob-kpi-icon" style={{ background: '#f46200' }}>💼</div></div>
            <div className="mob-kpi-val">{totalRemaining}</div>
            <span className="mob-kpi-lbl">إجمالي الأقساط المتبقية</span>
          </div>

          <div className="mob-kpi-card">
            <div className="mob-kpi-top"><span className="mob-kpi-tag">تحصيل الشركاء</span><div className="mob-kpi-icon" style={{ background: '#0284c7' }}>📅</div></div>
            <div className="mob-kpi-val">{monthlyTarget}</div>
            <span className="mob-kpi-lbl">مستحقات هذا الشهر</span>
          </div>

          <div className="mob-kpi-card">
            <div className="mob-kpi-top"><span className="mob-kpi-tag">صافي الأرباح</span><div className="mob-kpi-icon" style={{ background: '#10b981' }}>📈</div></div>
            <div className="mob-kpi-val">{netProfit}</div>
            <span className="mob-kpi-lbl">صافي الأرباح حتى اليوم</span>
          </div>
        </div>

        {/* 4. لوحة التحليلات المركزية */}
        <div className="mob-body-area">
          <div className="mob-chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a' }}>📊 حركة التحصيلات الشهرية والتدفقات</span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '8px', fontWeight: 800, padding: '1px 7px', borderRadius: '8px' }}>محدث لحظياً ✓</span>
            </div>
            <div className="mob-bars">
              <div className="mob-bar-item"><div className="mob-bar-track"><div className="mob-bar-fill" style={{ height: `${chartPercentages.m1}%` }}></div></div><span style={{ fontSize: '8px', color: '#64748b' }}>{monthNames[0]}</span></div>
              <div className="mob-bar-item"><div className="mob-bar-track"><div className="mob-bar-fill" style={{ height: `${chartPercentages.m2}%` }}></div></div><span style={{ fontSize: '8px', color: '#64748b' }}>{monthNames[1]}</span></div>
              <div className="mob-bar-item"><div className="mob-bar-track"><div className="mob-bar-fill" style={{ height: `${chartPercentages.m3}%` }}></div></div><span style={{ fontSize: '8px', color: '#64748b' }}>{monthNames[2]}</span></div>
              <div className="mob-bar-item"><div className="mob-bar-track"><div className="mob-bar-fill" style={{ height: `${chartPercentages.m4}%` }}></div></div><span style={{ fontSize: '8px', color: '#64748b' }}>{monthNames[3]}</span></div>
              <div className="mob-bar-item"><div className="mob-bar-track"><div className="mob-bar-fill" style={{ height: `${chartPercentages.exp}%`, background: '#dc2626' }}></div></div><span style={{ fontSize: '8px', color: '#ef4444' }}>مصروفات</span></div>
            </div>
          </div>

          <div className="mob-stats-row">
            <div className="mob-stat-card" onClick={() => handleMenuClick('treasuryEmployees')}>
              <h4 style={{ fontSize: '9px', fontWeight: 900, color: '#0f172a', margin: 0 }}>رواتب وسلف الموظفين</h4>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0284c7' }}>{totalSalaries.toLocaleString()}</div>
              <p style={{ fontSize: '7.5px', fontWeight: 700, color: '#64748b', margin: 0 }}>إجمالي المستحق والسلف</p>
            </div>

            <div className="mob-stat-card" onClick={() => handleMenuClick('treasuryExpenses')}>
              <h4 style={{ fontSize: '9px', fontWeight: 900, color: '#0f172a', margin: 0 }}>المصروفات العامة</h4>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#ef4444' }}>{totalExpenses.toLocaleString()}</div>
              <p style={{ fontSize: '7.5px', fontWeight: 700, color: '#64748b', margin: 0 }}>مصروفات النشاط والتشغيل</p>
            </div>
          </div>

          <div className="mob-overdue-card" onClick={() => handleMenuClick('overdue')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#0f172a' }}>⚠️ متأخرات السداد والإنذارات</span>
              <span style={{ fontSize: '8px', color: '#ef4444', fontWeight: 800 }}>{overdueData.count} عملاء بحاجة للمتابعة</span>
            </div>
            <div className="mob-overdue-row">
              <div>
                <div style={{ fontSize: '9.5px', fontWeight: 900, color: '#9f1239' }}>{overdueData.firstClient.name} {overdueData.firstClient.id}</div>
                <div style={{ fontSize: '7.5px', fontWeight: 700, color: '#e11d48' }}>متأخر عن موعد الاستحقاق</div>
              </div>
              <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '9px', fontWeight: 900, padding: '2px 8px', borderRadius: '8px', border: '1px solid #fca5a5' }}>{overdueData.firstClient.amount}</span>
            </div>
          </div>
        </div>

        {/* 5. الفوتر */}
        <div className="mob-footer">
          <span className="mob-footer-txt"><span style={{ color: '#10b981' }}>●</span> النظام متصل بالسحابة</span>
          <span className="mob-footer-txt">جميع الحقوق محفوظة بواسطة egymod</span>
        </div>

        {/* 6. القائمة الجانبية المنزلقة */}
        <div className={`mob-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
        <div className={`mob-drawer-sidebar ${drawerOpen ? 'open' : ''}`}>
          <div className="mob-drawer-dash-btn" onClick={() => setDrawerOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div className="mob-menu-icon">⌂</div>
              <span style={{ fontSize: '10px', fontWeight: 900 }}>لوحة التحكم</span>
            </div>
            <span>‹</span>
          </div>

          <div className="mob-drawer-list">
            {menuItems.map(item => (
              <div key={item.key} className="mob-menu-item" onClick={() => handleMenuClick(item.key)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div className="mob-menu-icon">{item.icon}</div>
                  <span style={{ fontSize: '10px', fontWeight: 900 }}>{item.title}</span>
                </div>
                <span>‹</span>
              </div>
            ))}
          </div>

          <div className="mob-drawer-admin">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
              <div>
                <h4 style={{ fontSize: '10.5px', fontWeight: 900, color: '#fff', margin: 0 }}>المشرف العام</h4>
                <p style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Admin Enterprise</p>
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', cursor: 'pointer' }} onClick={() => handleMenuClick('settings')}>⚙</button>
          </div>
        </div>

      </div>
    </div>
  );
}
