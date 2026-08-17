/**
 * =========================================================
 * 📌 الملف: محرك برمجيات الاستعلام (Client Query Service)
 * 📁 المسار: src/services/clientQueryService.js
 * 📝 الوظيفة: معالجة البيانات، حساب الإجماليات المالية، التصفية
 *            وفحص العقود المتقاطعة برقم الهاتف نفسه.
 * =========================================================
 */

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
// تطبيع وتوحيد شكل بيانات العقود القادمة من السحابة (أسماء الحقول متعددة الصيغ) لصيغة واحدة موحدة
export const normalizeContracts = (list = []) => {
  return (list || []).map((c) => {
    const cDate = c.contractDate || c.contract_date || c.created_at || "";
    const fInst = c.first_installment_date || c.firstPayDate || c.firstInstallmentDate || "";
    const gName = c.guarantor_name || c.guarantorName || c.guarantor || "";
    const gPhone = c.guarantor_phone || c.guarantorPhone || "";
    const natId = c.national_id || c.nationalId || "";
    const addr = c.address || "";

    return {
      ...c,
      id: c.id,
      name: c.clientName || c.client_name || c.name || "عميل بدون اسم",
      phone: c.clientPhone || c.client_phone || c.phone || "",
      national_id: natId,
      nationalId: natId,
      address: addr,
      item: c.itemName || c.item_name || c.item || "",
      contractDate: cDate,
      contract_date: cDate,
      firstPayDate: fInst,
      first_installment_date: fInst,
      firstInstallmentDate: fInst,
      guarantor: gName,
      guarantor_name: gName,
      guarantorName: gName,
      guarantorPhone: gPhone,
      guarantor_phone: gPhone,
      status: c.status || (c.is_deleted ? "archived" : "active")
    };
  });
};
