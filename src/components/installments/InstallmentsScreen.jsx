import React, { useState } from 'react';
import CustomerSearchHeader from './CustomerSearchHeader';
import InstallmentsTable from './InstallmentsTable';
import PaymentModal from './PaymentModal';

// 🌐 رابط سيرفر الواتساب المحلي المباشر
const WHATSAPP_SERVER_URL = "http://localhost:5000";

// بيانات تجريبية للهيكلة
const INITIAL_CUSTOMERS = [
  {
    id: '1',
    name: 'محمود جمال',
    phone: '201012345678',
    contractId: 'CTR-2026-01',
    totalAmount: 12000,
    paidAmount: 4000,
    remainingAmount: 8000,
    overdueCount: 1,
    installments: [
      { id: '101', number: 1, dueDate: '2026-05-01', amount: 2000, paid: 2000, status: 'PAID' },
      { id: '102', number: 2, dueDate: '2026-06-01', amount: 2000, paid: 2000, status: 'PAID' },
      { id: '103', number: 3, dueDate: '2026-07-01', amount: 2000, paid: 0, status: 'OVERDUE' },
      { id: '104', number: 4, dueDate: '2026-08-01', amount: 2000, paid: 0, status: 'PENDING' },
      { id: '105', number: 5, dueDate: '2026-09-01', amount: 2000, paid: 0, status: 'PENDING' },
      { id: '106', number: 6, dueDate: '2026-10-01', amount: 2000, paid: 0, status: 'PENDING' },
    ]
  }
];

export default function InstallmentsScreen() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);
  const [activeInstallmentForPayment, setActiveInstallmentForPayment] = useState(null);

  // إرسال رسالة الواتساب عبر السيرفر المحلي
  const sendWhatsAppNotification = async (phone, message) => {
    try {
      await fetch(`${WHATSAPP_SERVER_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      });
    } catch (err) {
      console.error('تعذر الاتصال بسيرفر الواتساب المحلي:', err);
    }
  };

  // معالجة عملية السداد وتحديث البيانات والخزينة
  const handlePaymentSubmit = async ({ installmentId, amount, treasury, sendWhatsApp, customer }) => {
    const updatedCustomers = customers.map(c => {
      if (c.id !== customer.id) return c;

      const updatedInstallments = c.installments.map(inst => {
        if (inst.id !== installmentId) return inst;

        const newPaid = inst.paid + amount;
        const newStatus = newPaid >= inst.amount ? 'PAID' : 'PARTIAL';
        return { ...inst, paid: newPaid, status: newStatus };
      });

      return {
        ...c,
        paidAmount: c.paidAmount + amount,
        remainingAmount: c.remainingAmount - amount,
        installments: updatedInstallments
      };
    });

    setCustomers(updatedCustomers);
    const updatedCust = updatedCustomers.find(c => c.id === customer.id);
    setSelectedCustomer(updatedCust);

    // إرسال إشعار الواتساب إذا تم اختياره
    if (sendWhatsApp) {
      const msg = `عزيزي ${customer.name}، تم استلام مبلغ ${amount.toLocaleString()} ج.م لحساب القسط الخاص بالعقد (${customer.contractId}). المتبقي الكلي عليك: ${updatedCust.remainingAmount.toLocaleString()} ج.م. شكراً لتعاملك معنا.`;
      await sendWhatsAppNotification(customer.phone, msg);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">💳 إدارة وسداد الأقساط</h1>
          <p className="text-xs text-gray-500">متابعة تحصيل المستحقات وإصدار الإيصالات وإشعارات الواتساب</p>
        </div>
      </div>

      {/* 1️⃣ قسم البحث وملخص العميل */}
      <CustomerSearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        customersList={customers}
      />

      {/* 2️⃣ جدول الأقساط */}
      {selectedCustomer ? (
        <InstallmentsTable
          installments={selectedCustomer.installments}
          onPayClick={(inst) => setActiveInstallmentForPayment(inst)}
        />
      ) : (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">برجاء البحث واختيار عميل لعرض جدول الأقساط الخاص به.</p>
        </div>
      )}

      {/* 3️⃣ نافذة التحصيل الهائمة */}
      {activeInstallmentForPayment && selectedCustomer && (
        <PaymentModal
          installment={activeInstallmentForPayment}
          customer={selectedCustomer}
          onClose={() => setActiveInstallmentForPayment(null)}
          onSubmitPayment={handlePaymentSubmit}
        />
      )}
    </div>
  );
}
