import React, { useMemo } from "react";

export default function MonthlyDues({ clientsList = [], onOpenPaymentModal, onBack }) {
  // 🗓️ حساب مستحقات الشهر الحالي
  const { currentMonthName, currentYear, dueInstallments, totalMonthlyAmount } =
    useMemo(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const monthName = now.toLocaleString("ar-EG", { month: "long" });

      const dues = [];
      let totalSum = 0;

      clientsList.forEach((contract) => {
        const installments = Array.isArray(contract.installments)
          ? contract.installments
          : [];

        installments.forEach((inst, index) => {
          if (!inst.dueDate) return;

          const instDate = new Date(inst.dueDate);
          const isCurrentMonth =
            instDate.getFullYear() === year && instDate.getMonth() === month;
          const isPending = !inst.isPaid && (inst.amount || 0) > 0;

          if (isCurrentMonth && isPending) {
            const amount = Number(inst.amount) || 0;
            totalSum += amount;

            dues.push({
              contractId: contract.id,
              clientName: contract.clientName || contract.name || "عميل بدون اسم",
              clientPhone: contract.phone || contract.clientPhone || "غير مسجل",
              itemName: contract.itemName || contract.item || "بضاعة / قسط",
              installmentIndex: index,
              dueDate: inst.dueDate,
              amount: amount,
              fullContract: contract,
            });
          }
        });
      });

      return {
        currentMonthName: monthName,
        currentYear: year,
        dueInstallments: dues,
        totalMonthlyAmount: totalSum,
      };
    }, [clientsList]);

  return (
    <div style={{ padding: "20px", color: "#fff", direction: "rtl" }}>
      {/* 🚀 الهيدر وملخص الإحصائيات */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          background: "#1e1e1e",
          padding: "15px 20px",
          borderRadius: "10px",
          border: "1px solid #333",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#f39c12" }}>
            📅 مستحقات شهر {currentMonthName} {currentYear}
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#aaa", fontSize: "0.9rem" }}>
            إجمالي الحالات المطلوبة تحصيلها خلال هذا الشهر
          </p>
        </div>

        <div style={{ textAlign: "left" }}>
          <span style={{ fontSize: "0.85rem", color: "#bbb", display: "block" }}>
            إجمالي المستحق
          </span>
          <span style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#2ecc71" }}>
            {totalMonthlyAmount.toLocaleString()} ج.م
          </span>
        </div>
      </div>

      {/* 📋 جدول المستحقات */}
      {dueInstallments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "#141414",
            borderRadius: "10px",
            color: "#888",
          }}
        >
          🎉 لا توجد أقساط مستحقة للتحصيل في شهر {currentMonthName}!
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#141414",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#252525", color: "#f39c12", textAlign: "right" }}>
                <th style={{ padding: "12px" }}>#</th>
                <th style={{ padding: "12px" }}>اسم العميل</th>
                <th style={{ padding: "12px" }}>الهاتف</th>
                <th style={{ padding: "12px" }}>السلعة</th>
                <th style={{ padding: "12px" }}>تاريخ الاستحقاق</th>
                <th style={{ padding: "12px" }}>قيمة القسط</th>
                <th style={{ padding: "12px", textAlign: "center" }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {dueInstallments.map((item, idx) => (
                <tr
                  key={`${item.contractId}-${item.installmentIndex}`}
                  style={{
                    borderBottom: "1px solid #222",
                    transition: "background 0.2s",
                  }}
                >
                  <td style={{ padding: "12px" }}>{idx + 1}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{item.clientName}</td>
                  <td style={{ padding: "12px", color: "#aaa" }}>{item.clientPhone}</td>
                  <td style={{ padding: "12px" }}>{item.itemName}</td>
                  <td style={{ padding: "12px", color: "#e74c3c" }}>{item.dueDate}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#2ecc71" }}>
                    {item.amount.toLocaleString()} ج.م
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => onOpenPaymentModal && onOpenPaymentModal(item.fullContract)}
                      style={{
                        background: "#f39c12",
                        color: "#000",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      تسديد الآن 💳
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ↩️ زر العودة */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginTop: "20px",
            background: "#333",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          خروج والعودة للشاشة الرئيسية
        </button>
      )}
    </div>
  );
}
