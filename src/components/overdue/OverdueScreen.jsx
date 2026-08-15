import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Wallet, Users, CalendarClock, Search, Phone, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { fetchOverdueDataFromCloud } from "../../services/overdueService";
import { useIsMobile } from "../../hooks/useIsMobile";

const fmtInt = (v) => Math.round(Number(v) || 0).toLocaleString();

export default function OverdueScreen({ onBack, onOpenPayment, themeStyles = {}, t = {} }) {
  const isMobile = useIsMobile();
  const [overdueRows, setOverdueRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'simple' | 'medium' | 'critical'

  // 🔄 جلب وحساب المتأخرات المباشر من السحابة (Supabase)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contractsRes, installmentsRes] = await Promise.all([
        supabase.from("contracts").select("*"),
        supabase.from("installments").select("*")
      ]);

      const cData = contractsRes.data || [];
      const iData = installmentsRes.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const curYear = today.getFullYear();
      const curMonth = today.getMonth();

      const rows = [];

      cData.forEach((c) => {
        if (Boolean(c.is_deleted) || c.status === "archived") return;

        const sale = Number(c.sale_price || c.salePrice || c.sale || c.total || 0);
        const down = Number(c.down_payment || c.downPayment || c.down || 0);
        const monthly = Number(c.monthly_installment || c.monthlyInstallment || c.monthly || 0);

        const instArr = iData.filter((i) => String(i.contract_id) === String(c.id));
        const totalPaidInst = instArr
          .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const remainingDebt = Math.max(0, sale - down - totalPaidInst);
        if (remainingDebt <= 0 || monthly <= 0) return;

        const paidThisMonth = instArr
          .filter((i) => {
            if (!i.is_paid && i.status !== "paid" && !(Number(i.amount) > 0)) return false;
            const dateVal = i.paid_at || i.due_date || i.date || i.created_at;
            if (!dateVal) return false;
            const d = new Date(dateVal);
            return d.getFullYear() === curYear && d.getMonth() === curMonth;
          })
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const reqThisMonth = Math.min(monthly, remainingDebt);

        if (paidThisMonth < reqThisMonth) {
          let dueDate = null;
          const unpaidInst = instArr.find((i) => !i.is_paid && i.status !== "paid" && Number(i.amount || 0) === 0 && (i.due_date || i.date));

          if (unpaidInst) {
            dueDate = new Date(unpaidInst.due_date || unpaidInst.date);
          } else {
            const startDate = c.start_date || c.created_at || c.contract_date;
            const sd = startDate ? new Date(startDate) : new Date();
            dueDate = new Date(curYear, curMonth, sd.getDate() || 1);
          }

          dueDate.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - dueDate.getTime();
          let daysLate = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (daysLate <= 0) daysLate = 1;

          rows.push({
            id: c.id,
            clientName: c.client_name || c.clientName || c.name || "عميل بدون اسم",
            phone: c.client_phone || c.clientPhone || c.phone || "",
            item: c.item_name || c.itemName || c.item || "سلعة بدون اسم",
            guarantorName: c.guarantor_name || c.guarantorName || "",
            guarantorPhone: c.guarantor_phone || c.guarantorPhone || "",
            overdueAmount: reqThisMonth - paidThisMonth,
            daysLate: daysLate
          });
        }
      });

      setOverdueRows(rows);
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات المتأخرين:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // تصفية العملاء بناءً على البحث ونوع التأخير
  const filteredRows = useMemo(() => {
    return overdueRows.filter((r) => {
      // فلتر البحث النصي
      const q = search.trim().toLowerCase();
      const matchSearch = !q || (
        (r.clientName || "").toLowerCase().includes(q) ||
        (r.phone || "").includes(q) ||
        (r.item || "").toLowerCase().includes(q) ||
        (r.guarantorName || "").toLowerCase().includes(q)
      );

      if (!matchSearch) return false;

      // فلتر مستوى التأخير بالأيام
      const days = r.daysLate || 0;
      if (filterType === "simple") return days < 30;
      if (filterType === "medium") return days >= 30 && days <= 60;
      if (filterType === "critical") return days > 60;

      return true;
    });
  }, [overdueRows, search, filterType]);

  // حساب الإحصائيات الثلاثية
  const stats = useMemo(() => {
    const totalOverdueAmt = overdueRows.reduce((acc, r) => acc + (r.overdueAmount || 0), 0);
    const totalCount = overdueRows.length;
    const maxDaysLate = overdueRows.reduce((max, r) => Math.max(max, r.daysLate || 0), 0);

    return { totalOverdueAmt, totalCount, maxDaysLate };
  }, [overdueRows]);

  const handleWhatsAppNotice = (row) => {
    const msg = `السلام عليكم ورحمة الله وبركاته،\nالأستاذ/ ${row.clientName}\nنحيطكم علماً بوجود مستحقات متأخرة على عقد (${row.item}) بقيمة ${fmtInt(row.overdueAmount)} ج.م (مدة التأخير: ${row.daysLate} يوم).\nيرجى التكرم بالبدء بالسداد.\nشاكرين تعاونكم معنا.`;
    window.open(`https://wa.me/2${row.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", color: themeStyles.text || "#ffffff", fontFamily: "Cairo, sans-serif", padding: isMobile ? "10px 8px" : "16px 20px" }}>
      {/* 1. الشريط العلوي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 12 : 20 }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 20, fontWeight: 800, color: themeStyles.text || "#fff" }}>
          العملاء المتأخرين عن السداد ({stats.totalCount})
        </h2>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${themeStyles.border || "#333"}`,
            color: themeStyles.text || "#fff", padding: isMobile ? "6px 12px" : "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 12 : 13
          }}
        >
          <ArrowRight size={isMobile ? 14 : 16} /> رجوع
        </button>
      </div>

      {/* 2. الكروت الإحصائية الثلاثية */}
      {isMobile ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
          {/* كارت 1: إجمالي المتأخرات */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 12, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "85px" }}>
            <Wallet size={18} style={{ color: themeStyles.accentGold || "#d4af37", marginBottom: 4 }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: themeStyles.accentGold || "#d4af37", fontVariantNumeric: "tabular-nums" }}>
              {fmtInt(stats.totalOverdueAmt)} <span style={{ fontSize: 10 }}>ج.م</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: themeStyles.subText || "#aaa", marginTop: 3, whiteSpace: "nowrap" }}>إجمالي المتأخرات</div>
          </div>

          {/* كارت 2: عدد العملاء */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 12, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "85px" }}>
            <Users size={18} style={{ color: themeStyles.accentGold || "#d4af37", marginBottom: 4 }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
              {stats.totalCount}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: themeStyles.subText || "#aaa", marginTop: 3, whiteSpace: "nowrap" }}>عدد المتأخرين</div>
          </div>

          {/* كارت 3: أقصى مدة تأخير */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 12, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "85px" }}>
            <CalendarClock size={18} style={{ color: themeStyles.accentGold || "#d4af37", marginBottom: 4 }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
              {stats.maxDaysLate} <span style={{ fontSize: 10 }}>يوم</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: themeStyles.subText || "#aaa", marginTop: 3, whiteSpace: "nowrap" }}>أقصى مدة تأخير</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {/* كارت 1: إجمالي المتأخرات المطلوبة */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 16, padding: "18px 20px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Wallet size={24} style={{ color: themeStyles.accentGold || "#d4af37" }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: themeStyles.accentGold || "#d4af37", margin: "6px 0 2px 0" }}>
              {fmtInt(stats.totalOverdueAmt)} ج.م
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: themeStyles.text || "#fff" }}>إجمالي المتأخرات المطلوبة</div>
            <div style={{ fontSize: 11, color: themeStyles.subText || "#888", marginTop: 2 }}>المبالغ المستحقة حالياً</div>
          </div>

          {/* كارت 2: عدد العملاء المتأخرين */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 16, padding: "18px 20px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Users size={24} style={{ color: themeStyles.accentGold || "#d4af37" }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: "6px 0 2px 0" }}>
              {stats.totalCount}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: themeStyles.text || "#fff" }}>عدد العملاء المتأخرين</div>
            <div style={{ fontSize: 11, color: themeStyles.subText || "#888", marginTop: 2 }}>عملاء بحاجة للمتابعة</div>
          </div>

          {/* كارت 3: أقصى مدة تأخير */}
          <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 16, padding: "18px 20px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <CalendarClock size={24} style={{ color: themeStyles.accentGold || "#d4af37" }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: "6px 0 2px 0" }}>
              {stats.maxDaysLate} يوم
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: themeStyles.text || "#fff" }}>أقصى مدة تأخير</div>
            <div style={{ fontSize: 11, color: themeStyles.subText || "#888", marginTop: 2 }}>أطول فترة قسط غير مسدد</div>
          </div>
        </div>
      )}

      {/* 3. شريط الفلترة والبحث */}
      <div style={{
        background: themeStyles.card || "#1e1e1e",
        border: `1px solid ${themeStyles.border || "#333"}`,
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? "10px 12px" : "12px 16px",
        marginBottom: isMobile ? 10 : 20,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 8 : 16
      }}>
        {/* أزرار أشرطة التصنيف */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "auto auto auto auto", gap: isMobile ? 4 : 8 }}>
          <button
            onClick={() => setFilterType("all")}
            style={{
              background: filterType === "all" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "all" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: isMobile ? 8 : 20, padding: isMobile ? "6px 4px" : "6px 14px", fontSize: isMobile ? 10 : 12, fontWeight: 800, cursor: "pointer", textAlign: "center", whiteSpace: "nowrap"
            }}
          >
            الكل ({overdueRows.length})
          </button>
          <button
            onClick={() => setFilterType("simple")}
            style={{
              background: filterType === "simple" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "simple" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: isMobile ? 8 : 20, padding: isMobile ? "6px 4px" : "6px 14px", fontSize: isMobile ? 10 : 12, fontWeight: 800, cursor: "pointer", textAlign: "center", whiteSpace: "nowrap"
            }}
          >
            {isMobile ? "بسيط" : "تأخير بسيط (< 30 يوم)"}
          </button>
          <button
            onClick={() => setFilterType("medium")}
            style={{
              background: filterType === "medium" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "medium" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: isMobile ? 8 : 20, padding: isMobile ? "6px 4px" : "6px 14px", fontSize: isMobile ? 10 : 12, fontWeight: 800, cursor: "pointer", textAlign: "center", whiteSpace: "nowrap"
            }}
          >
            {isMobile ? "متوسط" : "تأخير متوسط (30-60 يوم)"}
          </button>
          <button
            onClick={() => setFilterType("critical")}
            style={{
              background: filterType === "critical" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "critical" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: isMobile ? 8 : 20, padding: isMobile ? "6px 4px" : "6px 14px", fontSize: isMobile ? 10 : 12, fontWeight: 800, cursor: "pointer", textAlign: "center", whiteSpace: "nowrap"
            }}
          >
            {isMobile ? "حرج" : "حرج (> 60 يوم)"}
          </button>
        </div>

        {/* حقل البحث */}
        <div style={{ position: "relative", minWidth: isMobile ? "100%" : 280, flex: 1, maxWidth: isMobile ? "100%" : 400 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم العميل أو التليفون أو السلعة..."
            style={{
              width: "100%",
              padding: isMobile ? "8px 12px 8px 34px" : "10px 14px 10px 38px",
              background: themeStyles.inputBg || "#141414",
              border: `1px solid ${themeStyles.border || "#333"}`,
              borderRadius: 10,
              color: "#fff",
              outline: "none",
              fontSize: isMobile ? 12 : 13,
              boxSizing: "border-box"
            }}
          />
          <Search size={isMobile ? 14 : 16} style={{ position: "absolute", left: 10, top: isMobile ? 10 : 12, color: "#888" }} />
        </div>
      </div>

      {/* 4. كروت العملاء */}
      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 14, marginBottom: isMobile ? 12 : 20 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 30 : 50, gap: 10, background: themeStyles.card || "#1e1e1e", borderRadius: 16 }}>
            <Loader2 size={24} className="animate-spin" style={{ color: themeStyles.accentGold || "#d4af37" }} />
            <span style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>جاري استخراج كشوفات المتأخرين...</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: isMobile ? 30 : 50, background: themeStyles.card || "#1e1e1e", borderRadius: 16, color: themeStyles.subText || "#888", fontWeight: 700, fontSize: isMobile ? 13 : 14 }}>
            لا يوجد عملاء متأخرين ينطبق عليهم هذا الفلتر حالياً 🎉
          </div>
        ) : (
          filteredRows.map((r) => (
            <div
              key={r.id}
              style={{
                background: themeStyles.card || "#1e1e1e",
                border: `1px solid ${themeStyles.border || "#333"}`,
                borderRadius: 12,
                padding: isMobile ? "10px 12px" : "18px 22px",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center",
                justifyContent: "space-between",
                gap: isMobile ? 8 : 16
              }}
            >
              {/* الجهة اليمنى: اسم العميل والهاتف والضامن */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: "#ffffff", marginBottom: 2 }}>
                    {r.clientName}
                  </div>
                  <div style={{ fontSize: isMobile ? 11 : 13, color: themeStyles.subText || "#aaa", marginBottom: 2 }}>
                    هاتف : {r.phone || "غير محدد"} · السلعة: {r.item}
                  </div>
                  {r.guarantorName && (
                    <div style={{ fontSize: isMobile ? 10 : 12, color: themeStyles.subText || "#888" }}>
                      اسم الضامن: {r.guarantorName} ({r.guarantorPhone || "بدون رقم"})
                    </div>
                  )}
                </div>

                {isMobile && (
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 10, color: themeStyles.subText || "#aaa" }}>المستحق</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#e07a5f" }}>
                      {fmtInt(r.overdueAmount)} ج.م
                    </div>
                    <div style={{ fontSize: 10, color: "#ffffff", marginTop: 2 }}>
                      ({r.daysLate} يوم)
                    </div>
                  </div>
                )}
              </div>

              {/* الجهة اليسرى: المبالغ والأزرار */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "flex-end" : "flex-start", gap: isMobile ? 6 : 24, flexWrap: "wrap" }}>
                {!isMobile && (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: themeStyles.subText || "#aaa" }}>المستحق حالياً</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#e07a5f", marginTop: 2 }}>
                        {fmtInt(r.overdueAmount)} ج.م
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: themeStyles.subText || "#aaa" }}>مدة التأخير</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                        {r.daysLate} يوم
                      </div>
                    </div>
                  </>
                )}

                {/* الأزرار الإجرائية الثلاثة */}
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, width: isMobile ? "100%" : "auto" }}>
                  <button
                    onClick={() => onOpenPayment && onOpenPayment(r)}
                    style={{
                      flex: isMobile ? 1 : "initial",
                      background: "#e07a5f",
                      color: "#111111",
                      border: "none",
                      borderRadius: 8,
                      padding: isMobile ? "6px 8px" : "8px 18px",
                      fontWeight: 800,
                      fontSize: isMobile ? 11 : 13,
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >
                    تحصيل
                  </button>

                  {r.phone && (
                    <a
                      href={`tel:${r.phone}`}
                      style={{
                        flex: isMobile ? 1 : "initial",
                        background: "#1e3a8a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: isMobile ? "6px 8px" : "8px 16px",
                        fontWeight: 700,
                        fontSize: isMobile ? 11 : 13,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                      }}
                    >
                      <Phone size={isMobile ? 12 : 14} /> اتصال
                    </a>
                  )}

                  <button
                    onClick={() => handleWhatsAppNotice(r)}
                    style={{
                      flex: isMobile ? 1 : "initial",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: isMobile ? "6px 8px" : "8px 16px",
                      fontWeight: 700,
                      fontSize: isMobile ? 11 : 13,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4
                    }}
                  >
                    <MessageCircle size={isMobile ? 12 : 14} /> واتساب
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. الزر السفلي للخروج */}
      <div style={{
        background: themeStyles.card || "#1e1e1e",
        border: `1px solid ${themeStyles.border || "#333"}`,
        borderRadius: 14,
        padding: isMobile ? "10px" : "12px",
        textAlign: "center"
      }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: themeStyles.subText || "#aaaaaa",
            fontSize: isMobile ? 12 : 14,
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8
          }}
        >
          خروج والعودة للشاشة الرئيسية &rarr;
        </button>
      </div>
    </div>
  );
}
