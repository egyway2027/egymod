import React, { useState } from 'react';
import CustomerSearchHeader from './CustomerSearchHeader';
import InstallmentsTable from './InstallmentsTable';
import PaymentModal from './PaymentModal';

const WHATSAPP_SERVER_URL = "http://localhost:5000";

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

export default function InstallmentsScreen({ themeStyles = {} }) {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);
  const [activeInstallmentForPayment, setActiveInstallmentForPayment] = useState(null);

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

    if (sendWhatsApp) {
      const msg = `عزيزي ${customer.name}، تم استلام مبلغ ${amount.toLocaleString()} ج.م لحساب القسط الخاص بالعقد (${customer.contractId}). المتبقي الكلي عليك: ${updatedCust.remainingAmount.toLocaleString()} ج.م. شكراً لتعاملك معنا.`;
      await sendWhatsAppNotification(customer.phone, msg);
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: themeStyles.text || "#fff" }}>💳 إدارة وسداد الأقساط</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#aaa" }}>متابعة تحصيل المستحقات وإصدار الإيصالات وإشعارات الواتساب</p>
        </div>
      </div>

      <CustomerSearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        customersList={customers}
        themeStyles={themeStyles}
      />

      {selectedCustomer ? (
        <InstallmentsTable
          installments={selectedCustomer.installments}
          onPayClick={(inst) => setActiveInstallmentForPayment(inst)}
          themeStyles={themeStyles}
        />
      ) : (
        <div style={{ padding: "40px", textAlign: "center", background: themeStyles.card || "#1e1e1e", borderRadius: "14px", border: `1px dashed ${themeStyles.border || "#444"}` }}>
          <p style={{ color: "#aaa", margin: 0 }}>برجاء البحث واختيار عميل لعرض جدول الأقساط الخاص به.</p>
        </div>
      )}

      {activeInstallmentForPayment && selectedCustomer && (
        <PaymentModal
          installment={activeInstallmentForPayment}
          customer={selectedCustomer}
          onClose={() => setActiveInstallmentForPayment(null)}
          onSubmitPayment={handlePaymentSubmit}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}
