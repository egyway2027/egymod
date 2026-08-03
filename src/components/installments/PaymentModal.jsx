import React, { useState } from 'react';
import { X, Send, DollarSign } from 'lucide-react';

export default function PaymentModal({ installment, customer, onClose, onSubmitPayment }) {
  const remainingForInst = installment.amount - installment.paid;
  const [payAmount, setPayAmount] = useState(remainingForInst);
  const [selectedTreasury, setSelectedTreasury] = useState('main');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (payAmount <= 0 || payAmount > remainingForInst) return;

    setIsSubmitting(true);
    await onSubmitPayment({
      installmentId: installment.id,
      amount: Number(payAmount),
      treasury: selectedTreasury,
      sendWhatsApp,
      customer
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* الهيدر */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50/50 dark:bg-gray-900/50">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" /> تحصيل القسط #{installment.number}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* اسم العميل */}
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm">
            <span className="text-gray-500 block text-xs">العميل:</span>
            <span className="font-bold text-gray-800 dark:text-white">{customer.name}</span>
          </div>

          {/* المبلغ المطلوب */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              المبلغ المدفوع (المتبقي من القسط: {remainingForInst.toLocaleString()} ج.م):
            </label>
            <input
              type="number"
              max={remainingForInst}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-bold text-lg text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* اختيار الخزينة المستلمة */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              توجيه المبلغ إلى الخزينة:
            </label>
            <select
              value={selectedTreasury}
              onChange={(e) => setSelectedTreasury(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-medium outline-none"
            >
              <option value="main">🏢 الخزينة الرئيسية (نقدي)</option>
              <option value="bank">🏦 الحساب البنكي (CIB)</option>
              <option value="wallet">📱 محفظة فودافون كاش / إلكترونية</option>
            </select>
          </div>

          {/* خيار إرسال إشعار الواتساب */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <input
              type="checkbox"
              id="whatsappNotify"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="whatsappNotify" className="text-xs font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer flex items-center gap-1">
              <Send className="w-3.5 h-3.5" /> إرسال إيصال سداد تلقائي للعميل عبر الواتساب
            </label>
          </div>

          {/* أزرار الحفظ */}
          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التحصيل...' : 'تأكيد السداد وإصدار الإيصال'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
