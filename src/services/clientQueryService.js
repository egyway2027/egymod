// src/services/clientQueryService.js

// حساب الإجماليات المالية لسطر الإحصاءات
export const calculateTotals = (contracts = []) => {
  let totalSale = 0;
  let totalPaid = 0;
  let totalRemaining = 0;

  contracts.forEach((c) => {
    const sale = Number(c.sale) || 0;
    const down = Number(c.down) || 0;
    
    // حساب المتبقي الحقيقي
    let remaining = 0;
    if (c.remainingAmount !== undefined) {
      remaining = Math.max(0, Number(c.remainingAmount));
    } else {
      const paidInstallments = Number(c.paidAmount) || 0;
      remaining = Math.max(0, sale - down - paidInstallments);
    }

    const paid = Math.min(sale, sale - remaining);

    totalSale += sale;
    totalPaid += paid;
    totalRemaining += remaining;
  });

  return { totalSale, totalPaid, totalRemaining };
};

// تحديد حالة العقد المالي واللون والوسام المصاحب له
export const getContractStatus = (contract, isEN = false) => {
  const sale = Number(contract.sale) || 0;
  const down = Number(contract.down) || 0;
  const remaining = contract.remainingAmount !== undefined 
    ? Math.max(0, Number(contract.remainingAmount)) 
    : Math.max(0, sale - down);

  if (remaining <= 0) {
    return {
      isFinished: true,
      label: isEN ? "Completed & Fully Paid Contract" : "عقد منتهي ومسدد بالكامل",
      color: "#2ec4b6",
      bg: "rgba(46, 196, 182, 0.12)",
      border: "rgba(46, 196, 182, 0.4)"
    };
  }

  return {
    isFinished: false,
    label: isEN ? "Active Contract & Installments Ongoing" : "عقد جار وتسديد الأقساط مستمر",
    color: "#00b4d8",
    bg: "rgba(0, 180, 216, 0.12)",
    border: "rgba(0, 180, 216, 0.4)"
  };
};

// تصفية العقود بناءً على نص البحث وبناءً على قسم (النشطة / الأرشيف)
export const filterContracts = (contracts = [], query = "", isArchive = false) => {
  const q = query.trim().toLowerCase();

  return contracts.filter((c) => {
    const status = getContractStatus(c);
    
    // التصفية بحسب الحالة (أرشيف أم نشط)
    if (isArchive && !status.isFinished) return false;
    if (!isArchive && status.isFinished) return false;

    if (!q) return true;

    const nameMatch = (c.name || "").toLowerCase().includes(q);
    const phoneMatch = (c.phone || "").includes(q);
    const guarantorMatch = (c.guarantor || "").toLowerCase().includes(q);
    const itemMatch = (c.item || "").toLowerCase().includes(q);
    const idMatch = (c.id || "").toLowerCase().includes(q);

    return nameMatch || phoneMatch || guarantorMatch || itemMatch || idMatch;
  });
};

// فحص تكرار عقود العميل بنفس رقم الهاتف
export const findContractsByPhone = (contracts = [], phone = "") => {
  if (!phone) return [];
  const cleanPhone = phone.trim();
  return contracts.filter((c) => (c.phone || "").trim() === cleanPhone);
};
