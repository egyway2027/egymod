import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AlertCircle, Search, PhoneCall, MessageCircle, FileText, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../../supabaseClient";

const fmtInt = (v) => Math.round(Number(v) || 0).toLocaleString();

export default function OverdueScreen({ onBack, themeStyles = {}, t = {} }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // جلب العقود والأقساط المباشرة من السحابة
  const fetchOverdueData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, clients(*), installments(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setContracts(data);
      }
    } catch (err) {
      console.error("خطأ في جلب بيانات المتأخرين:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverdueData();
  }, [fetchOverdueData]);

  // معالجة وحساب العقود المتأخرة فقط
  const overdueRows = useMemo(() => {
    const today = new Date();

    return contracts
      .map((c) => {
        const client = c.clients || {};
        const instArr = Array.isArray(c.installments) ? c.installments : [];

        const sale = Number(c.sale || c.total || 0);
        const down = Number(c.down_payment || c.down || 0);
        const monthly = Number(c.monthly_installment || c.monthly || 0);

        // إجمالي المدفوع الفعلي
        const paidInstallments = instArr
          .filter((i) => i.is_paid || i.status === "paid")
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const totalPaid = down + paidInstallments;
        const remainingDebt = Math.max(0, sale - totalPaid);

        if (remainingDebt <= 0) return null; // عقد مخلص بالكامل

        // حساب الفترة الزمنية المنقضية
        const startDate = new Date(c.start_date || c.created_at || Date.now());
        const diffMs = today - startDate;
        const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const monthsElapsed = Math.floor(diffDays / 30.4375);

        // حساب المبلغ المستحق زمنياً حتى اليوم
        const expectedPaidToDate = down + (monthsElapsed * monthly);
        const overdueAmount = Math.max(0, Math.min(remainingDebt, expectedPaidToDate - totalPaid));
        const overdueCount = monthly > 0 ? Math.ceil(overdueAmount / monthly) : 0;

        if (overdueAmount <= 0) return null; // لا توجد متأخرات

        return {
          id: c.id,
          clientName: client.name || c.clientName || "عميل بدون اسم",
          phone: client.phone || c.phone || "",
          item: c.item_name || c.itemName || c.item || "سلعة غير محددة",
          sale,
          down,
          monthly,
          totalPaid,
          remainingDebt,
          overdueAmount,
          overdueCount,
          daysLate: Math.max(1, diffDays - (monthsElapsed * 30))
        };
      })
      .filter(Boolean)
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          r.clientName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.item.toLowerCase().includes(q)
        );
      });
  }, [contracts, search]);

  // إحصائيات متأخرات المحفظة
  const stats = useMemo(() => {
    const totalOverdueAmt = overdueRows.reduce((acc, r) => acc + r.overdueAmount, 0);
    const totalClientsCount = overdueRows.length;
    return { totalOverdueAmt, totalClientsCount };
  }, [overdueRows]);

  const handleWhatsAppNotice = (row) => {
    const msg = `السلام عليكم ورحمة الله وبركاته،\nالأستاذ/ ${row.clientName}\nنحيطكم علماً بوجود أقساط متأخرة على عقد (${row.item}) بقيمة ${fmtInt(row.overdueAmount)} ج.م (عدد ${row.overdueCount} قسط).\nيرجى التكرم بالبادر بالسداد لضمان انتظام حسابكم.\nشاكرين تعاونكم معنا.`;
    window.open(`https://wa.me/2${row.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", color: themeStyles.text || "#fff" }}>
      {/* هيدر الشاشة */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={24} style={{ color: "#ef4444" }} />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#ef4444" }}>
            {t.overdueTitle || "سجل المتأخرين عن السداد"}
          </h2>
        </div>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: `1px solid ${themeStyles.border || "#333"}`,
            color: themeStyles.subText || "#aaa", padding: "8px 16px", borderRadius: 10, cursor: "pointer"
          }}
        >
          <ArrowRight size={16} /> خروج
        </button>
      </div>

      {/* كروت الملخص المالي للمتأخرات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
        <div style={{ background: themeStyles.card || "#1e1e1e", border: "1px solid #ef4444", borderRadius: 14, padding: 16 }}>
          <span style={{ fontSize: 12, color: themeStyles.subText || "#aaa", display: "block" }}>إجمالي المتأخرات الواجبة التحصيل</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>{fmtInt(stats.totalOverdueAmt)} ج.م</span>
        </div>
        <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 14, padding: 16 }}>
          <span style={{ fontSize: 12, color: themeStyles.subText || "#aaa", display: "block" }}>عدد العملاء المتأخرين</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: themeStyles.accentGold || "#d4af37" }}>{stats.totalClientsCount} عميل</span>
        </div>
      </div>

      {/* شريط البحث */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={18} style={{ position: "absolute", right: 14, top: 14, color: "#888" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث باسم العميل، رقم الهاتف، أو السلعة..."
          style={{
            width: "100%", padding: "12px 42px 12px 14px", background: themeStyles.inputBg || "#141414",
            border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 10, color: "#fff", outline: "none", boxSizing: "border-box"
          }}
        />
      </div>

      {/* جدول كشوفات المتأخرين */}
      <div style={{ background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333"}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, gap: 10 }}>
            <Loader2 size={22} className="animate-spin" style={{ color: themeStyles.accentGold || "#d4af37" }} />
            <span>جاري فحص كشوفات المتأخرات...</span>
          </div>
        ) : overdueRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: themeStyles.subText || "#aaa" }}>
            لا يوجد عملاء متأخرين عن السداد حالياً 🎉
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${themeStyles.border || "#333"}` }}>
                  <th style={{ padding: "14px 16px" }}>اسم العميل</th>
                  <th style={{ padding: "14px 16px" }}>السلعة</th>
                  <th style={{ padding: "14px 16px" }}>المبلغ المتأخر</th>
                  <th style={{ padding: "14px 16px" }}>أقساط متأخرة</th>
                  <th style={{ padding: "14px 16px" }}>المتبقي الكلي</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>إجراءات التواصل</th>
                </tr>
              </thead>
              <tbody>
                {overdueRows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${themeStyles.border || "#2a2a2a"}` }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                      {r.clientName}
                      <div style={{ fontSize: 12, color: themeStyles.subText || "#aaa", fontWeight: 400 }}>{r.phone}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>{r.item}</td>
                    <td style={{ padding: "14px 16px", color: "#ef4444", fontWeight: 800 }}>{fmtInt(r.overdueAmount)} ج.م</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>{r.overdueCount} قسط</td>
                    <td style={{ padding: "14px 16px" }}>{fmtInt(r.remainingDebt)} ج.م</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <button
                          onClick={() => handleWhatsAppNotice(r)}
                          style={{
                            background: "#213526", border: "1px solid #3d6b4a", color: "#bfe8cd",
                            padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700
                          }}
                        >
                          <MessageCircle size={14} /> واتساب
                        </button>
                        {r.phone && (
                          <a
                            href={`tel:${r.phone}`}
                            style={{
                              background: themeStyles.inputBg || "#222", border: `1px solid ${themeStyles.border || "#444"}`, color: "#fff",
                              padding: "6px 12px", borderRadius: 8, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700
                            }}
                          >
                            <PhoneCall size={14} /> اتصال
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
