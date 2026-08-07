import { supabase } from "../supabaseClient";

/**
 * جلب جميع بيانات الخزينة في استعلام موحد ومباشر
 */
export async function fetchTreasurySummaryData() {
  try {
    const [
      { data: partners },
      { data: capitalMoves },
      { data: expenses },
      { data: employees },
      { data: salaryLog },
      { data: withdrawalsLog },
      { data: distributionsLog },
      { data: installments }
    ] = await Promise.all([
      supabase.from("partners").select("*").order("id", { ascending: true }),
      supabase.from("capital_moves").select("*").order("date", { ascending: false }),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("employees").select("*").order("id", { ascending: true }),
      supabase.from("salary_log").select("*").order("date", { ascending: false }),
      supabase.from("withdrawals_log").select("*").order("date", { ascending: false }),
      supabase.from("distributions_log").select("*").order("date", { ascending: false }),
      supabase.from("installments").select("amount, paid_amount, profit_share")
    ]);

    return {
      partners: partners || [],
      capitalMoves: capitalMoves || [],
      expenses: expenses || [],
      employees: employees || [],
      salaryLog: salaryLog || [],
      withdrawalsLog: withdrawalsLog || [],
      distributionsLog: distributionsLog || [],
      installments: installments || []
    };
  } catch (err) {
    console.error("❌ خطأ في جلب بيانات الخزينة من السحابة:", err);
    throw err;
  }
}

/**
 * إضافة مصروف عام جديد
 */
export async function addExpense(expenseData) {
  const { data, error } = await supabase
    .from("expenses")
    .insert([{
      category: expenseData.category,
      amount: Number(expenseData.amount || 0),
      date: expenseData.date,
      notes: expenseData.notes || "",
      is_settled: false
    }])
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * حذف مصروف عام
 */
export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

/**
 * تسجيل حركة راتب / سلفة لموظف
 */
export async function addSalaryTransaction(transData) {
  const { data, error } = await supabase
    .from("salary_log")
    .insert([{
      employee_id: transData.employeeId,
      employee_name: transData.employeeName,
      type: transData.type,
      amount: Number(transData.amount || 0),
      date: transData.date,
      notes: transData.notes || "",
      is_settled: false
    }])
    .select();

  if (error) throw error;
  return data?.[0];
}
