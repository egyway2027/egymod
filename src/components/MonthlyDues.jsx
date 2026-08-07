import React, { useState, useMemo } from "react";
import { Wallet, CalendarClock, TrendingUp } from "lucide-react";
import { Field, ScreenHeader, BottomExitButton, KPI } from "./CommonUI";

// دالة مساعدة لضمان عرض الأرقام كأعداد صحيحة مجردة
const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export function MonthlyDuesScreen({
  rows = [],
  clientsList = [],
  payments = [],
  onBack,
  onPay,
  t = {},
  styles = {},
  themeStyles = {}
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const isEN = useMemo(() => {
    return t?.lang === "en" || (typeof document !== "undefined" && document.documentElement.lang === "en");
  }, [t]);

  const today = new Date();
  const currentMonthName = today.toLocaleDateString(
    isEN ? "en-US" : t.localeCode || "ar-EG",
    { month: "long", year: "numeric" }
  );

  // 🗓️ استخراج فلترة الأقساط الخاصة بالشهر الحالي بناءً على المديونية والمطلوب
  const dataRows = rows && rows.length > 0 ? rows : clientsList;

  const processedRows = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    return (dataRows || [])
      .map((r) => {
        const sale = Number(r.sale_price || r.salePrice || r.sale || r.total || 0);
        const down = Number(r.down_payment || r.downPayment || r.down || 0);

        const instArr = Array.isArray(r.installments) ? r.installments : (Array.isArray(r.payments) ? r.payments : []);
        const paidFromInst = instArr
          .filter((i) => i.is_paid || i.status === "paid" || Number(i.amount) > 0)
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);
        const totalPaid = paidFromInst > 0 ? paidFromInst : Number(r.totalPaid || r.total_paid || r.paidAmount || 0);

        const name = r.client_name || r.clientName || r.name || "عميل بدون اسم";
        const item = r.item_name || r.itemName || r.item || "سلعة بدون اسم";
        const phone = r.client_phone || r.clientPhone || r.phone || "";

        const remaining = Math.max(0, sale - down - totalPaid);
        const monthly = Number(r.monthly_installment || r.monthlyInstallment || r.monthly || 0);

        return { ...r, name, item, phone, remaining, monthly, sale, down, totalPaid, instArr };
      })
      .filter((r) => (r.status === "active" || !r.status) && !Boolean(r.is_deleted) && r.remaining > 0 && r.monthly > 0)
      .map((r) => {
        const monthlyReq = Math.round(Math.min(r.monthly, r.remaining));

        const actualPaidThisMonth = (r.instArr || [])
          .filter((i) => {
            if (!i.is_paid && i.status !== "paid" && !(Number(i.amount) > 0)) return false;
            const dateVal = i.paid_at || i.due_date || i.date || i.payDate || i.created_at;
            if (!dateVal) return false;
            const d = new Date(dateVal);
            return d.getFullYear() === curYear && d.getMonth() === curMonth;
          })
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const paidThisMonth = Math.min(monthlyReq, actualPaidThisMonth);

        let status = "unpaid";
        if (actualPaidThisMonth >= monthlyReq) {
          status = "paid";
        } else if (actualPaidThisMonth > 0) {
          status = "partial";
        } else {
          status = "unpaid";
        }

        return {
          ...r,
          dueThisMonth: monthlyReq,
          paidThisMonth,
          actualPaidThisMonth,
          remainingThisMonth: Math.max(0, monthlyReq - paidThisMonth),
          monthStatus: status
        };
      });
  }, [dataRows]);

  // 🔍 الفلترة بحسب نص البحث وحالة السداد
  const filtered = useMemo(() => {
    return processedRows.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        (r.name || "").toLowerCase().includes(q) ||
        (r.phone || "").includes(q) ||
        (r.item || "").toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter === "paid") return r.monthStatus === "paid";
      if (statusFilter === "partial") return r.monthStatus === "partial";
      if (statusFilter === "unpaid") return r.monthStatus === "unpaid";
      return true;
    });
  }, [processedRows, search, statusFilter]);

  // 📊 حساب الإحصائيات العلوية
  const stats = useMemo(() => {
    const totalDue = processedRows.reduce((s, r) => s + r.dueThisMonth, 0);
    const totalCollected = processedRows.reduce((s, r) => s + r.paidThisMonth, 0);
    const totalRemaining = totalDue - totalCollected;
    const progressPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
    return { totalDue, totalCollected, totalRemaining, progressPct };
  }, [processedRows]);

  // 📱 إرسال رسالة تذكير عبر الواتساب
  const handleSendWhatsApp = (client) => {
    const msg = `${t.whatsAppReminderHeader || (isEN ? "Hello," : "السلام عليكم ورحمة الله، أستاذ/ة")} ${client.name}.\n${t.whatsAppDuesNotice || (isEN ? "We would like to remind you of the installment due for month" : "نود تذكيركم بحلول موعد قسط شهر")} (${currentMonthName}) ${t.whatsAppForItem || (isEN ? "for item" : "لقسط")} (${client.item}) ${t.whatsAppAmountLabel || (isEN ? "value" : "بقيمة")} ${fmtCleanInt(client.dueThisMonth)} ${t.currency || (isEN ? "EGP" : "ج.م")}.\n${t.whatsAppDuesFooter || (isEN ? "Please kindly pay on time. Thank you!" : "برجاء التكرم بالسداد في الموعد المحدد. شكراً لكم!")}`;
    window.open(`https://wa.me/2${client.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // 💳 تأكيد تحصيل القسط سحابياً
  const handleConfirmPay = async (e) => {
    e.preventDefault();
    if (!payTarget || !payAmount) return;
    const cleanAmount = Math.round(parseFloat(payAmount) || 0);
    if (onPay) {
      await onPay(payTarget.id, cleanAmount, new Date().toISOString().split("T")[0]);
    }
    setPayTarget(null);
    setPayAmount("");
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: "16px 20px", ...styles.container }}>
      {/* 1. الشريط العلوي */}
      <ScreenHeader
        title={`${t.monthlyDuesFor || (isEN ? "Monthly Dues for" : "مستحقات شهر")} ${currentMonthName}`}
        onBack={onBack}
        styles={styles}
        t={t}
      />

      {/* 2. بطاقات الإحصائيات العلوية الثلاث */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 16 }}>
        <KPI
          icon={CalendarClock}
          label={t.totalMonthlyRequired || (isEN ? "Total Required This Month" : "إجمالي المطلوب هذا الشهر")}
          sub={t.sumDueInstallments || (isEN ? "Sum of due installments" : "مجموع الأقساط المستحقة")}
          value={`${fmtCleanInt(stats.totalDue)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
          styles={styles}
          themeStyles={themeStyles}
        />
        <KPI
          icon={Wallet}
          label={t.collectedSoFar || (isEN ? "Collected So Far" : "تم تحصيله حتى الآن")}
          sub={`${t.completionRate || (isEN ? "Completion Rate" : "نسبة الإنجاز")} %${fmtCleanInt(stats.progressPct)}`}
          value={`${fmtCleanInt(stats.totalCollected)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
          styles={styles}
          themeStyles={themeStyles}
        />
        <KPI
          icon={TrendingUp}
          label={t.remainingToCollect || (isEN ? "Remaining To Collect" : "المتبقي تحصيله")}
          sub={t.duesUnderFollowUp || (isEN ? "Dues under follow-up" : "مستحقات جاري متابعتها")}
          value={`${fmtCleanInt(stats.totalRemaining)} ${t.currency || (isEN ? "EGP" : "ج.م")}`}
          styles={styles}
          themeStyles={themeStyles}
        />
      </section>

      {/* 3. حقل البحث وأزرار التصفية السريعة */}
      <div
        style={{
          background: "#141414",
          border: "1px solid #262626",
          borderRadius: 16,
          marginBottom: 16,
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap-reverse",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <input
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            width: "100%",
            maxWidth: 320,
            outline: "none"
          }}
          placeholder={t.searchClientPlaceholder || (isEN ? "Search by client, phone, or item..." : "بحث باسم العميل أو التليفون أو السلعة...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "all", label: `${t.allFilter || (isEN ? "All" : "الكل")} (${fmtCleanInt(processedRows.length)})` },
            { key: "unpaid", label: t.unpaidFilter || (isEN ? "لم يسدد" : "لم يسدد") },
            { key: "partial", label: t.partialFilter || (isEN ? "سداد جزئي" : "سداد جزئي") },
            { key: "paid", label: t.paidFilter || (isEN ? "تم السداد" : "تم السداد") }
          ].map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setStatusFilter(btn.key)}
              style={{
                background: statusFilter === btn.key ? "#d69a5f" : "#1a1a1a",
                color: statusFilter === btn.key ? "#000000" : "#aaaaaa",
                border: `1px solid ${statusFilter === btn.key ? "#d69a5f" : "#333333"}`,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. قائمة كروت العملاء والمستحقات */}
      <div style={{ background: "#141414", border: "1px solid #262626", borderRadius: 16, padding: 16 }}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            {t.noDuesNote || (isEN ? "No dues match the search query." : "لا توجد مستحقات تنطبق عليها معايير البحث.")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: themeStyles.inputBg || "#1a1a1a",
                  border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333333"}`,
                  borderRadius: themeStyles.borderRadius || 12,
                  padding: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: themeStyles.text || "#ffffff" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: themeStyles.accentGold || "#d69a5f", marginTop: 2 }}>
                    {item.item} · {item.phone}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>
                      {t.monthInstallment || (isEN ? "Monthly Installment" : "قسط الشهر")}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: themeStyles.accentGold || "#d69a5f" }}>
                      {fmtCleanInt(item.dueThisMonth)} {t.currency || (isEN ? "EGP" : "ج.م")}
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: themeStyles.subText || "#aaaaaa" }}>
                      {t.paymentStatus || (isEN ? "Payment Status" : "حالة السداد")}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: themeStyles.borderRadius || 6,
                        background:
                          item.monthStatus === "paid"
                            ? "#143820"
                            : item.monthStatus === "partial"
                            ? "#3d3019"
                            : "#3e1c24",
                        color:
                          item.monthStatus === "paid"
                            ? "#4ade80"
                            : item.monthStatus === "partial"
                            ? "#fbbf24"
                            : "#f87171",
                        border: `1px solid ${
                          item.monthStatus === "paid"
                            ? "#22c55e55"
                            : item.monthStatus === "partial"
                            ? "#f59e0b55"
                            : "#ef444455"
                        }`
                      }}
                    >
                      {item.monthStatus === "paid"
                        ? isEN ? "Paid" : "تم السداد"
                        : item.monthStatus === "partial"
                        ? isEN ? "Partially Paid" : "سداد جزئي"
                        : isEN ? "Unpaid" : "لم يسدد"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      title={t.whatsapp || (isEN ? "WhatsApp" : "واتساب")}
                      onClick={() => handleSendWhatsApp(item)}
                      style={{
                        background: "#213526",
                        border: "1px solid #3d6b4a",
                        color: "#bfe8cd",
                        padding: "8px 12px",
                        borderRadius: themeStyles.borderRadius || 8,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      {t.whatsapp || (isEN ? "WhatsApp" : "واتساب")}
                    </button>

                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        style={{
                          background: "#1b2a38",
                          border: "1px solid #385a7c",
                          color: "#b2d4f5",
                          padding: "8px 12px",
                          borderRadius: themeStyles.borderRadius || 8,
                          textDecoration: "none",
                          fontSize: 12,
                          fontWeight: 700
                        }}
                      >
                        {t.call || (isEN ? "Call" : "اتصال")}
                      </a>
                    )}

                    {item.monthStatus !== "paid" && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayTarget(item);
                          setPayAmount(item.remainingThisMonth);
                        }}
                        style={{
                          background: `linear-gradient(145deg, ${themeStyles.accentGold || "#d69a5f"}, ${themeStyles.accent || "#b06a35"})`,
                          color: "#111111",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: themeStyles.borderRadius || 8,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 800,
                          boxShadow: themeStyles.buttonShadow || "none"
                        }}
                      >
                        {t.collect || (isEN ? "Collect" : "تحصيل")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <BottomExitButton onBack={onBack} styles={styles} t={t} />
      </div>

      {/* 5. مودال السداد المباشر عند الضغط على زر "تحصيل" */}
      {payTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16
          }}
        >
          <div style={{ ...(styles.card || {}), background: themeStyles.card || "#1e1e1e", border: `1px solid ${themeStyles.border || "#333333"}`, borderRadius: 16, padding: 20, width: "100%", maxWidth: 400 }}>
            <h3 style={{ color: themeStyles.accentGold || "#d69a5f", fontSize: 17, fontWeight: 800, marginBottom: 12 }}>
              {t.collectInstallment || (isEN ? "Collect Installment" : "تحصيل قسط")}: {payTarget.name}
            </h3>
            <form onSubmit={handleConfirmPay} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label={t.amountToCollect || (isEN ? "Amount to Collect" : "المبلغ المراد تحصيله")} styles={styles}>
                <input
                  type="number"
                  step="1"
                  style={{
                    width: "100%",
                    background: themeStyles.inputBg || "#1b1b1d",
                    border: `1px solid ${themeStyles.border || "#333333"}`,
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: themeStyles.text || "#ffffff",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0"
                  required
                />
              </Field>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" style={{ flex: 1, background: `linear-gradient(145deg, ${themeStyles.accentGold || "#d69a5f"}, ${themeStyles.accent || "#b06a35"})`, color: "#111111", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
                  {t.confirmCollection || (isEN ? "Confirm Collection" : "تأكيد التحصيل")}
                </button>
                <button
                  type="button"
                  onClick={() => setPayTarget(null)}
                  style={{
                    background: themeStyles.inputBg || "#1b1b1d",
                    border: `1px solid ${themeStyles.border || "#333333"}`,
                    color: themeStyles.text || "#ffffff",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  {t.cancel || (isEN ? "Cancel" : "إلغاء")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyDuesScreen;
