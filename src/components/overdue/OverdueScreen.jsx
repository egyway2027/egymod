import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Wallet, Users, CalendarClock, Search, Phone, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { fetchOverdueDataFromCloud } from "../../services/overdueService";

const fmtInt = (v) => Math.round(Number(v) || 0).toLocaleString();

export default function OverdueScreen({ onBack, onOpenPayment, themeStyles = {}, t = {} }) {
  const [overdueRows, setOverdueRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'simple' | 'medium' | 'critical'

  // جلب البيانات من السحابة
  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchOverdueDataFromCloud();
    if (result.success) {
      setOverdueRows(result.data || []);
    }
    setLoading(false);
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
    <div style={{ maxWidth: 1100, margin: "0 auto", color: themeStyles.text || "#ffffff", fontFamily: "Cairo, sans-serif" }}>
      {/* 1. الشريط العلوي */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: themeStyles.text || "#fff" }}>
          العملاء المتأخرين عن السداد ({stats.totalCount})
        </h2>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${themeStyles.border || "#333"}`,
            color: themeStyles.text || "#fff", padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13
          }}
        >
          <ArrowRight size={16} /> رجوع
        </button>
      </div>

      {/* 2. الكروت الإحصائية الثلاثية */}
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

      {/* 3. شريط الفلترة والبحث */}
      <div style={{
        background: themeStyles.card || "#1e1e1e",
        border: `1px solid ${themeStyles.border || "#333"}`,
        borderRadius: 16,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap"
      }}>
        {/* أزرار أشرطة التصنيف */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterType("all")}
            style={{
              background: filterType === "all" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "all" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer"
            }}
          >
            الكل ({overdueRows.length})
          </button>
          <button
            onClick={() => setFilterType("simple")}
            style={{
              background: filterType === "simple" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "simple" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer"
            }}
          >
            تأخير بسيط (&lt; 30 يوم)
          </button>
          <button
            onClick={() => setFilterType("medium")}
            style={{
              background: filterType === "medium" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "medium" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer"
            }}
          >
            تأخير متوسط (30-60 يوم)
          </button>
          <button
            onClick={() => setFilterType("critical")}
            style={{
              background: filterType === "critical" ? "#e07a5f" : "rgba(255,255,255,0.05)",
              color: filterType === "critical" ? "#111" : themeStyles.text || "#fff",
              border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer"
            }}
          >
            حرج (&gt; 60 يوم)
          </button>
        </div>

        {/* حقل البحث */}
        <div style={{ position: "relative", minWidth: 280, flex: 1, maxWidth: 400 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم العميل أو التليفون أو السلعة..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              background: themeStyles.inputBg || "#141414",
              border: `1px solid ${themeStyles.border || "#333"}`,
              borderRadius: 10,
              color: "#fff",
              outline: "none",
              fontSize: 13,
              boxSizing: "border-box"
            }}
          />
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#888" }} />
        </div>
      </div>

      {/* 4. كروت العملاء */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 50, gap: 10, background: themeStyles.card || "#1e1e1e", borderRadius: 16 }}>
            <Loader2 size={24} className="animate-spin" style={{ color: themeStyles.accentGold || "#d4af37" }} />
            <span style={{ fontWeight: 700 }}>جاري استخراج كشوفات المتأخرين...</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, background: themeStyles.card || "#1e1e1e", borderRadius: 16, color: themeStyles.subText || "#888", fontWeight: 700 }}>
            لا يوجد عملاء متأخرين ينطبق عليهم هذا الفلتر حالياً 🎉
          </div>
        ) : (
          filteredRows.map((r) => (
            <div
              key={r.id}
              style={{
                background: themeStyles.card || "#1e1e1e",
                border: `1px solid ${themeStyles.border || "#333"}`,
                borderRadius: 16,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16
              }}
            >
              {/* الجهة اليمنى: اسم العميل والهاتف والضامن */}
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>
                  {r.clientName}
                </div>
                <div style={{ fontSize: 13, color: themeStyles.subText || "#aaa", marginBottom: 2 }}>
                  هاتف : {r.phone || "غير محدد"}
                </div>
                {r.guarantorName && (
                  <div style={{ fontSize: 12, color: themeStyles.subText || "#888" }}>
                    اسم الضامن: {r.guarantorName} ({r.guarantorPhone || "بدون رقم"})
                  </div>
                )}
              </div>

              {/* الجهة اليسرى: المبالغ والأزرار */}
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
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

                {/* الأزرار الإجرائية الثلاثة */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => onOpenPayment && onOpenPayment(r)}
                    style={{
                      background: "#e07a5f",
                      color: "#111111",
                      border: "none",
                      borderRadius: 10,
                      padding: "8px 18px",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    تحصيل
                  </button>

                  {r.phone && (
                    <a
                      href={`tel:${r.phone}`}
                      style={{
                        background: "#1e3a8a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 16px",
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Phone size={14} /> اتصال
                    </a>
                  )}

                  <button
                    onClick={() => handleWhatsAppNotice(r)}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      padding: "8px 16px",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <MessageCircle size={14} /> واتساب
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
        padding: "12px",
        textAlign: "center"
      }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: themeStyles.subText || "#aaaaaa",
            fontSize: 14,
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
