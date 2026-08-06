import React, { useMemo } from "react";
import { X, Award, Printer, Download, Share2 } from "lucide-react";

const fmtCleanInt = (val) => {
  const num = Math.round(Number(val) || 0);
  return String(num);
};

export default function PaymentModal({ receipt = {}, storeInfo = {}, onClose, themeStyles = {}, t = {} }) {
  const { client = {}, payment = {} } = receipt;
  const totalPaidSoFar = Number(client.totalPaid || 0);
  const remainingDebt = client.remaining !== undefined ? Number(client.remaining) : Math.max(0, Number(client.sale || 0) - totalPaidSoFar);
  const remainingInstallments = Number(client.monthly || 0) > 0 ? Math.ceil(remainingDebt / Number(client.monthly)) : 0;
  const isPaidInFull = remainingDebt <= 0;

  const isEN = useMemo(() => {
    return t?.lang === "en" || document.documentElement?.lang === "en";
  }, [t]);

  const handlePrint = () => { window.print(); };

  const handleDownloadImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 650;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = themeStyles.inputBg || "#111"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = themeStyles.accent || "#e07a5f"; 
    ctx.lineWidth = 4; 
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = themeStyles.accentGold || "#d0b689"; 
    ctx.font = "bold 24px Cairo, sans-serif"; 
    ctx.textAlign = "center";
    ctx.fillText(storeInfo?.name || "إيجيمود لإدارة الأقساط", canvas.width / 2, 55);

    ctx.fillStyle = themeStyles.subText || "#aaa"; 
    ctx.font = "14px Cairo, sans-serif";
    ctx.fillText(`${t.receiptHeaderLabel || (isEN ? "Installment Receipt - Date:" : "إيصال استلام قسط — تاريخ:")} ${payment.payDate || new Date().toISOString().split("T")[0]}`, canvas.width / 2, 85);

    ctx.strokeStyle = themeStyles.border || "#333"; 
    ctx.lineWidth = 1; 
    ctx.beginPath(); 
    ctx.moveTo(40, 105); 
    ctx.lineTo(canvas.width - 40, 105); 
    ctx.stroke();

    const drawRow = (label, val, y, isGold = false) => {
      ctx.textAlign = "right"; 
      ctx.fillStyle = themeStyles.subText || "#aaa"; 
      ctx.font = "16px Cairo, sans-serif";
      ctx.fillText(label, canvas.width - 50, y);
      ctx.textAlign = "left"; 
      ctx.fillStyle = isGold ? (themeStyles.accentGold || "#d0b689") : (themeStyles.text || "#fff"); 
      ctx.font = isGold ? "bold 18px Cairo, sans-serif" : "bold 16px Cairo, sans-serif";
      ctx.fillText(String(val), 50, y);
    };

    drawRow(`${t.clientNameLabel || (isEN ? "Client Name" : "اسم العميل")}:`, client.name, 145, true);
    drawRow(`${t.itemLabel || (isEN ? "Item Sold" : "السلعة المباعة")}:`, client.item, 185);
    drawRow(`${t.salePriceLabel || (isEN ? "Total Sale Contract" : "إجمالي عقد البيع")}:`, `${fmtCleanInt(client.sale)} ${t.currency || (isEN ? "EGP" : "ج.م")}`, 225);
    drawRow(`${t.downPaymentLabel || (isEN ? "Down Payment" : "المقدم المدفوع")}:`, `${fmtCleanInt(client.down)} ${t.currency || (isEN ? "EGP" : "ج.م")}`, 265);
    drawRow(`${t.totalPaidSoFar || (isEN ? "Total Paid So Far" : "المسدد كلياً حتى الآن")}:`, `${fmtCleanInt(totalPaidSoFar)} ${t.currency || (isEN ? "EGP" : "ج.م")}`, 305);
    drawRow(`${t.totalPortfolio || (isEN ? "Total Client Remaining" : "المتبقي الكلي على العميل")}:`, `${fmtCleanInt(remainingDebt)} ${t.currency || (isEN ? "EGP" : "ج.م")}`, 345, true);
    drawRow(`${t.remainingInstallmentsCount || (isEN ? "Remaining Installments" : "عدد الأقساط المتبقية")}:`, `${fmtCleanInt(remainingInstallments)} ${t.installmentUnit || (isEN ? "Installment" : "قسط")}`, 385);

    ctx.beginPath(); 
    ctx.moveTo(40, 415); 
    ctx.lineTo(canvas.width - 40, 415); 
    ctx.stroke();

    ctx.fillStyle = themeStyles.highlightBg || "rgba(224, 122, 95, 0.15)"; 
    ctx.fillRect(40, 435, canvas.width - 80, 140);
    ctx.strokeStyle = themeStyles.accent || "#e07a5f"; 
    ctx.strokeRect(40, 435, canvas.width - 80, 140);

    ctx.textAlign = "right"; 
    ctx.fillStyle = themeStyles.subText || "#aaa"; 
    ctx.font = "15px Cairo, sans-serif";
    ctx.fillText(`${t.paidAmountNow || (isEN ? "Amount Paid Now" : "المبلغ المدفوع حالياً")}:`, canvas.width - 60, 475);
    ctx.textAlign = "left"; 
    ctx.fillStyle = themeStyles.accentGold || "#d0b689"; 
    ctx.font = "bold 24px Cairo, sans-serif";
    ctx.fillText(`${fmtCleanInt(payment.amount)} ${t.currency || (isEN ? "EGP" : "ج.م")}`, 60, 475);

    ctx.textAlign = "right"; 
    ctx.fillStyle = themeStyles.subText || "#aaa"; 
    ctx.font = "15px Cairo, sans-serif";
    ctx.fillText(`${t.methodAndCollector || (isEN ? "Method & Collector" : "طريقة الدفع والمحصل")}:`, canvas.width - 60, 515);
    ctx.textAlign = "left"; 
    ctx.fillStyle = themeStyles.text || "#fff"; 
    ctx.font = "bold 15px Cairo, sans-serif";
    ctx.fillText(`${payment.method || (isEN ? "Cash" : "كاش")} · ${payment.collector || (isEN ? "Supervisor" : "المشرف")}`, 60, 515);

    ctx.textAlign = "right"; 
    ctx.fillStyle = themeStyles.subText || "#aaa"; 
    ctx.font = "15px Cairo, sans-serif";
    ctx.fillText(`${t.remainingAfterPay || (isEN ? "Remaining After Payment" : "المتبقي بعد هذا القسط")}:`, canvas.width - 60, 550);
    ctx.textAlign = "left"; 
    ctx.fillStyle = themeStyles.text || "#fff"; 
    ctx.font = "bold 16px Cairo, sans-serif";
    ctx.fillText(`${fmtCleanInt(payment.remainingAfter)} ${t.currency || (isEN ? "EGP" : "ج.م")}`, 60, 550);

    if (isPaidInFull) {
      ctx.fillStyle = themeStyles.accentGold || "#d0b689"; 
      ctx.font = "bold 20px Cairo, sans-serif"; 
      ctx.textAlign = "center";
      ctx.fillText(`🏆 ${t.contractFullyPaidSuccess || (isEN ? "Contract Fully Settled & Paid" : "تم مخالصة وسداد هذا العقد بالكامل")} 🏆`, canvas.width / 2, 620);
    }

    ctx.fillStyle = themeStyles.subText || "#aaa"; 
    ctx.font = "12px Cairo, sans-serif"; 
    ctx.textAlign = "center";
    ctx.fillText(storeInfo?.footerNote || (isEN ? "Sold items are non-refundable" : "البضاعة المباعة لا تُرد ولا تُستبدل إلا بالعقد الأصلي"), canvas.width / 2, 720);

    const link = document.createElement("a");
    link.download = `Receipt_${client.name}_${payment.payDate || "payment"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleWhatsAppShare = () => {
    const msg = `${t.receiptHeaderLabel || (isEN ? "Installment Receipt" : "إيصال سداد قسط")} 🧾\n${t.storeNameLabel || (isEN ? "Store" : "اسم المحل")}: ${storeInfo?.name || "Egymod"}\n${t.clientNameLabel || (isEN ? "Client" : "اسم العميل")}: ${client.name}\n${t.itemLabel || (isEN ? "Item" : "السلعة")}: ${client.item}\n${t.paidAmount || (isEN ? "Paid" : "المبلغ المدفوع")}: ${fmtCleanInt(payment.amount)} ${t.currency || (isEN ? "EGP" : "ج.م")}\n${t.remainingAfterPay || (isEN ? "Remaining" : "المتبقي الحالي")}: ${fmtCleanInt(payment.remainingAfter)} ${t.currency || (isEN ? "EGP" : "ج.م")}\n${t.paymentDate || (isEN ? "Date" : "تاريخ السداد")}: ${payment.payDate}\n${t.thankYouForPayment || (isEN ? "Thank you for your timely payment!" : "شكراً لالتزامكم بالتسديد!")}`;
    window.open(`https://wa.me/2${client.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{
        background: themeStyles.card,
        border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.accent}`,
        borderRadius: themeStyles.borderRadius || 18,
        width: "100%",
        maxWidth: 520,
        padding: 24,
        color: themeStyles.text,
        position: "relative",
        boxShadow: themeStyles.boxShadow || "0 20px 50px rgba(0,0,0,0.8)"
      }}>
        
        <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: themeStyles.inputBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, color: themeStyles.accentGold, width: 34, height: 36, borderRadius: themeStyles.borderRadius || 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>

        <div id="printable-receipt" style={{ textAlign: "center", paddingBottom: 10 }}>
          <div style={{ color: themeStyles.accentGold, fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{storeInfo?.name || "إيجيمود لإدارة الأقساط"}</div>
          <div style={{ color: themeStyles.subText, fontSize: 13, marginBottom: 4 }}>{t.storePhoneLabel || (isEN ? "Phone" : "تليفون")}: {storeInfo?.phone} · {t.storeAddressLabel || (isEN ? "Address" : "العنوان")}: {storeInfo?.address}</div>
          <div style={{ color: themeStyles.accent, fontSize: 15, fontWeight: 700 }}>{t.receiptHeaderLabel || (isEN ? "Installment Receipt" : "إيصال استلام قسط")}</div>
          <div style={{ color: themeStyles.subText, fontSize: 12 }}>{t.operationDate || (isEN ? "Date" : "تاريخ العملية")}: {payment.payDate || new Date().toISOString().split("T")[0]}</div>
          <div style={{ height: 1, background: themeStyles.border, margin: "14px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "right", fontSize: 14 }}>
            <ReceiptRow label={t.clientNameLabel || (isEN ? "Client Name" : "اسم العميل")} val={client.name} highlight themeStyles={themeStyles} />
            <ReceiptRow label={t.itemLabel || (isEN ? "Item" : "السلعة")} val={client.item} themeStyles={themeStyles} />
            <ReceiptRow label={t.salePriceLabel || (isEN ? "Total Contract" : "إجمالي العقد")} val={`${fmtCleanInt(client.sale)} ${t.currency || (isEN ? "EGP" : "ج.م")}`} themeStyles={themeStyles} />
            <ReceiptRow label={t.downPaymentLabel || (isEN ? "Down Payment" : "المقدم المدفوع")} val={`${fmtCleanInt(client.down)} ${t.currency || (isEN ? "EGP" : "ج.م")}`} themeStyles={themeStyles} />
            <ReceiptRow label={t.totalPaidSoFar || (isEN ? "Total Paid" : "المسدد كلياً")} val={`${fmtCleanInt(totalPaidSoFar)} ${t.currency || (isEN ? "EGP" : "ج.م")}`} themeStyles={themeStyles} />
            <ReceiptRow label={t.totalPortfolio || (isEN ? "Total Remaining" : "المتبقي الكلي")} val={`${fmtCleanInt(remainingDebt)} ${t.currency || (isEN ? "EGP" : "ج.م")}`} highlight themeStyles={themeStyles} />
            <ReceiptRow label={t.remainingInstallmentsCount || (isEN ? "Remaining Installments" : "أقساط متبقية")} val={`${fmtCleanInt(remainingInstallments)} ${t.installmentUnit || (isEN ? "Installment" : "قسط")}`} themeStyles={themeStyles} />
          </div>

          <div style={{ background: themeStyles.inputBg, border: `1px dashed ${themeStyles.accent}`, borderRadius: themeStyles.borderRadius || 12, padding: 14, margin: "16px 0", display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: themeStyles.subText, fontSize: 13 }}>{t.paidAmountNow || (isEN ? "Amount Paid Now" : "المبلغ المدفوع حالياً")}:</span>
              <span style={{ color: themeStyles.accentGold, fontSize: 22, fontWeight: 800 }}>{fmtCleanInt(payment.amount)} {t.currency || (isEN ? "EGP" : "ج.م")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: themeStyles.subText }}>
              <span>{t.methodAndCollector || (isEN ? "Method & Collector" : "طريقة الدفع والمحصل")}:</span>
              <span style={{ color: themeStyles.text, fontWeight: 700 }}>{payment.method || (isEN ? "Cash" : "كاش")} · {payment.collector || (isEN ? "Supervisor" : "المشرف")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: themeStyles.subText, marginTop: 4 }}>
              <span>{t.remainingAfterPay || (isEN ? "Remaining After Payment" : "المتبقي بعد هذا القسط")}:</span>
              <span style={{ color: themeStyles.text, fontWeight: 800 }}>{fmtCleanInt(payment.remainingAfter)} {t.currency || (isEN ? "EGP" : "ج.م")}</span>
            </div>
          </div>

          {isPaidInFull && (
            <div style={{ background: "rgba(232,205,156,0.15)", border: `1px solid ${themeStyles.accentGold}`, color: themeStyles.accentGold, padding: "10px", borderRadius: themeStyles.borderRadius || 10, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Award size={18} /> {t.contractFullyPaidSuccess || (isEN ? "Contract Fully Settled & Paid" : "تم مخالصة وسداد هذا العقد بالكامل")}
            </div>
          )}

          <div style={{ fontSize: 11, color: themeStyles.subText, marginTop: 10 }}>
            {storeInfo?.footerNote || (isEN ? "Sold items are non-refundable" : "البضاعة المباعة لا تُرد ولا تُستبدل إلا بالعقد الأصلي")}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={handlePrint} style={{ background: `linear-gradient(145deg, ${themeStyles.accentGold}, ${themeStyles.accent})`, color: "#111111", border: "none", borderRadius: themeStyles.borderRadius || 10, padding: "11px", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Printer size={16} /> {t.printReceiptBtn || (isEN ? "Print Receipt" : "طباعة الإيصال")}
          </button>
          <button type="button" onClick={handleDownloadImage} style={{ background: themeStyles.inputBg, border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border}`, color: themeStyles.accentGold, borderRadius: themeStyles.borderRadius || 10, padding: "11px", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Download size={16} /> {t.downloadImageBtn || (isEN ? "Download Image" : "تنزيل الصورة")}
          </button>
          <button type="button" onClick={handleWhatsAppShare} style={{ gridColumn: "1 / -1", background: "#213526", border: "1px solid #3d6b4a", color: "#bfe8cd", borderRadius: themeStyles.borderRadius || 10, padding: "11px", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Share2 size={16} /> {t.shareWhatsAppBtn || (isEN ? "Send via WhatsApp" : "إرسال عبر الواتساب")}
          </button>
        </div>

      </div>
    </div>
  );
}

function ReceiptRow({ label, val, highlight, themeStyles = {} }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}`, paddingBottom: 4 }}>
      <span style={{ color: themeStyles.subText || "#aaa" }}>{label}:</span>
      <span style={{ color: highlight ? (themeStyles.accentGold || "#d0b689") : (themeStyles.text || "#fff"), fontWeight: highlight ? 800 : 600 }}>{val}</span>
    </div>
  );
}
