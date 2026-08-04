// 3️⃣ عملية السداد مع استبعاد id من كائن التحديث الموجه لـ Supabase
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedContract) return;

    const numAmount = Math.round(parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    const prevPaid = Number(selectedContract.paidAmount ?? selectedContract.paid_amount ?? 0);
    const newPaid = prevPaid + numAmount;

    const totalPrice = Number(selectedContract.sale || 0);
    const downPrice = Number(selectedContract.down || 0);
    const newRemaining = Math.max(0, totalPrice - downPrice - newPaid);

    const paymentDateStr = payDate || new Date().toISOString().split("T")[0];

    const newPaymentRecord = {
      id: String(Date.now()),
      clientId: String(selectedContract.id),
      clientName: selectedContract.name || "",
      item: selectedContract.item || "",
      amount: numAmount,
      remainingAfter: newRemaining,
      payDate: paymentDateStr,
      method,
      collector
    };

    // 📥 إضافة الدفعة الجديدة لمصفوفة الدفعات الحالية للعقد
    const existingPaymentsList = Array.isArray(selectedContract.payments) ? selectedContract.payments : [];
    const updatedPaymentsList = [...existingPaymentsList, newPaymentRecord];

    // 🎯 كائن التحديث النقي (بدون تضمين id داخل الحقول المراد تعديلها)
    const updatedContract = {
      id: selectedContract.id,
      name: selectedContract.name || "",
      phone: selectedContract.phone || "",
      guarantor: selectedContract.guarantor || "",
      guarantorPhone: selectedContract.guarantorPhone || "",
      item: selectedContract.item || "",
      cost: Number(selectedContract.cost || 0),
      sale: Number(selectedContract.sale || 0),
      down: Number(selectedContract.down || 0),
      monthly: Number(selectedContract.monthly || 0),
      contractDate: selectedContract.contractDate || "",
      firstPayDate: selectedContract.firstPayDate || "",
      notes: selectedContract.notes || "",
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      payments: updatedPaymentsList
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContract);
    }

    setActiveReceipt({
      client: {
        ...updatedContract,
        totalPaid: newPaid,
        remaining: newRemaining
      },
      payment: newPaymentRecord
    });
    setAmount("");
  };

  // 4️⃣ حذف الدفعة بنفس الضوابط
  const handleDeletePayment = async (paymentId) => {
    if (!selectedContract) return;

    const existingPayments = Array.isArray(selectedContract.payments) ? selectedContract.payments : [];
    const targetPayment = existingPayments.find((p) => String(p.id) === String(paymentId));
    if (!targetPayment) return;

    const payAmt = Number(targetPayment.amount || 0);

    const prevPaid = Number(selectedContract.paidAmount ?? selectedContract.paid_amount ?? 0);
    const newPaid = Math.max(0, prevPaid - payAmt);

    const totalPrice = Number(selectedContract.sale || 0);
    const downPrice = Number(selectedContract.down || 0);
    const newRemaining = Math.max(0, totalPrice - downPrice - newPaid);

    // 🗑️ إزالة الدفعة المحذوفة من مصفوفة الدفعات الحالية للعقد
    const updatedPaymentsList = existingPayments.filter((p) => String(p.id) !== String(paymentId));

    const updatedContract = {
      id: selectedContract.id,
      name: selectedContract.name || "",
      phone: selectedContract.phone || "",
      guarantor: selectedContract.guarantor || "",
      guarantorPhone: selectedContract.guarantorPhone || "",
      item: selectedContract.item || "",
      cost: Number(selectedContract.cost || 0),
      sale: Number(selectedContract.sale || 0),
      down: Number(selectedContract.down || 0),
      monthly: Number(selectedContract.monthly || 0),
      contractDate: selectedContract.contractDate || "",
      firstPayDate: selectedContract.firstPayDate || "",
      notes: selectedContract.notes || "",
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      payments: updatedPaymentsList
    };

    if (onUpdateContract) {
      await onUpdateContract(updatedContract);
    }
  };
