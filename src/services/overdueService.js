import { supabase } from "../supabaseClient";

/**
 * جلب جميع العقود والمتأخرات مباشرة من السحابة
 */
export async function fetchOverdueDataFromCloud() {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*, clients(*), installments(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ خطأ Supabase عند جلب المتأخرات:", error.message);
      return { success: false, data: [], error: error.message };
    }

    // معالجة البيانات واحتساب المتأخرات
    const today = new Date();
    const processedRows = (data || [])
      .map((c) => {
        const client = c.clients || {};
        const instArr = Array.isArray(c.installments) ? c.installments : [];

        const sale = Number(c.sale || c.total || 0);
        const down = Number(c.down_payment || c.down || 0);
        const monthly = Number(c.monthly_installment || c.monthly || 0);

        // حساب المدفوع الفعلي
        const paidInstallments = instArr
          .filter((i) => i.is_paid || i.status === "paid")
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const totalPaid = down + paidInstallments;
        const remainingDebt = Math.max(0, sale - totalPaid);

        if (remainingDebt <= 0) return null;

        // حساب المدة الزمنية والمستحق المفترض
        const startDate = new Date(c.start_date || c.created_at || Date.now());
        const diffMs = today - startDate;
        const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const monthsElapsed = Math.floor(diffDays / 30.4375);

        const expectedPaidToDate = down + monthsElapsed * monthly;
        const overdueAmount = Math.max(0, Math.min(remainingDebt, expectedPaidToDate - totalPaid));
        const overdueCount = monthly > 0 ? Math.ceil(overdueAmount / monthly) : 0;

        if (overdueAmount <= 0) return null;

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
          daysLate: Math.max(1, diffDays - monthsElapsed * 30)
        };
      })
      .filter(Boolean);

    return { success: true, data: processedRows };
  } catch (err) {
    console.error("❌ خطأ غير متوقع في خدمة المتأخرين:", err);
    return { success: false, data: [], error: err.message };
  }
}
