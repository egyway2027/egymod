import React from 'react';
import { DollarSign, Check, AlertTriangle, Clock } from 'lucide-react';

export default function InstallmentsTable({ installments, onPayClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"><Check className="w-3 h-3"/> مدفوع بالكامل</span>;
      case 'PARTIAL':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"><Clock className="w-3 h-3"/> سداد جزئي</span>;
      case 'OVERDUE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"><AlertTriangle className="w-3 h-3"/> متأخر</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">مستحق</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 dark:text-white">📅 جدول ترتيب الأقساط</h3>
        <span className="text-xs text-gray-500">إجمالي الأقساط: {installments.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">رقم القسط</th>
              <th className="px-6 py-3">تاريخ الاستحقاق</th>
              <th className="px-6 py-3">القيمة الأصلية</th>
              <th className="px-6 py-3">المدفوع</th>
              <th className="px-6 py-3">المتبقي</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {installments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">لا توجد أقساط مسجلة لهذا العميل.</td>
              </tr>
            ) : (
              installments.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">قسط #{inst.number}</td>
                  <td className="px-6 py-4 font-medium">{inst.dueDate}</td>
                  <td className="px-6 py-4 font-bold">{inst.amount.toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">{inst.paid.toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-rose-600 font-semibold">{(inst.amount - inst.paid).toLocaleString()} ج.م</td>
                  <td className="px-6 py-4">{getStatusBadge(inst.status)}</td>
                  <td className="px-6 py-4 text-center">
                    {inst.status !== 'PAID' ? (
                      <button
                        onClick={() => onPayClick(inst)}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <DollarSign className="w-4 h-4" /> سداد
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-500 font-semibold">تم السداد ✓</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
