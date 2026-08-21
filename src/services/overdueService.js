import { supabase } from "../supabaseClient";

/**
 * جلب جميع العقود والمتأخرات مباشرة من السحابة
 */
export async function fetchOverdueDataFromCloud() {
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

    return { success: true, data: rows };
  } catch (err) {
    console.error("❌ خطأ غير متوقع في خدمة المتأخرين:", err);
    return { success: false, data: [], error: err.message };
  }
}
