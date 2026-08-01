import React, { useState, useMemo } from "react";
import { ArrowRight, X } from "lucide-react";

const emptyForm = {
  name: "",
  phone: "",
  guarantor: "",
  guarantorPhone: "",
  item: "",
  cost: "",
  sale: "",
  down: "",
  monthly: "",
  contractDate: new Date().toISOString().split("T")[0],
  firstPayDate: "",
  notes: ""
};

export function AddClientScreen({ onSave, onBack, t = {}, themeStyles = {} }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const live = useMemo(() => {
    const costNum = parseFloat(form.cost) || 0;
    const saleNum = parseFloat(form.sale) || 0;
    const downNum = parseFloat(form.down) || 0;
    const monthlyNum = parseFloat(form.monthly) || 0;

    const remaining = Math.max(0, saleNum - downNum);
    const profit = saleNum - costNum;
    const installmentsCount = monthlyNum > 0 ? Math.ceil(remaining / monthlyNum) : 0;

    return { profit, remaining, installmentsCount };
  }, [form]);

  function handleContractDate(e) {
    const cDate = e.target.value;
    if (!cDate) return;
    const d = new Date(cDate);
    d.setMonth(d.getMonth() + 1);
    const firstPay = d.toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, contractDate: cDate, firstPayDate: firstPay }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.item || !form.cost || !form.sale || !form.contractDate) {
      setError("يرجى ملء الحقول الأساسية وتاريخ التعاقد!");
      return;
    }
    setError("");
    if (onSave) {
      onSave({
        ...form,
        cost: Math.round(parseFloat(form.cost) || 0),
        sale: Math.round(parseFloat(form.sale) || 0),
        down: Math.round(parseFloat(form.down) || 0),
        monthly: Math.round(parseFloat(form.monthly) || 0)
      });
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px", fontFamily: "Cairo, sans-serif" }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "#1e1e1e",
            border: "1px solid #333", color: "#d4af37", padding: "8px 16px",
            borderRadius: 10, cursor: "pointer", fontWeight: 700
          }}
        >
          <ArrowRight size={16} /> رجوع
        </button>
        <h2 style={{ color: "#d4af37", margin: 0, fontSize: 20, fontWeight: 800 }}>إضافة عميل جديد</h2>
      </div>

      <div style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 18, padding: 24, color: "#fff" }}>
        {error && (
          <div style={{ background: "rgba(224,122,95,0.15)", border: "1px solid #e07a5f", color: "#e07a5f", padding: 12, borderRadius: 10, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {/* بيانات العميل */}
          <div style={{ gridColumn: "1 / -1", color: "#d4af37", fontWeight: 800, borderBottom: "1px solid #333", paddingBottom: 8, marginTop: 8 }}>
            بيانات العميل والضامن
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>اسم العميل *</span>
            <input
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="أدخل اسم العميل ثلاثياً..."
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>تليفون العميل *</span>
            <input
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>اسم الضامن</span>
            <input
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.guarantor}
              onChange={(e) => setForm({ ...form, guarantor: e.target.value })}
              placeholder="اسم الضامن (اختياري)..."
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>تليفون الضامن</span>
            <input
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.guarantorPhone}
              onChange={(e) => setForm({ ...form, guarantorPhone: e.target.value })}
              placeholder="01xxxxxxxxx"
            />
          </label>

          {/* بيانات السلعة والتقسيط */}
          <div style={{ gridColumn: "1 / -1", color: "#d4af37", fontWeight: 800, borderBottom: "1px solid #333", paddingBottom: 8, marginTop: 12 }}>
            بيانات السلعة والتقسيط
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>السلعة *</span>
              <input
                style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                placeholder="مثال: هاتف أيفون 13 / شاشة 55 بوصة..."
                required
              />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>سعر التكلفة *</span>
            <input
              type="number"
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>سعر البيع *</span>
            <input
              type="number"
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.sale}
              onChange={(e) => setForm({ ...form, sale: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>المقدم *</span>
            <input
              type="number"
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.down}
              onChange={(e) => setForm({ ...form, down: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>القسط الشهري *</span>
            <input
              type="number"
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.monthly}
              onChange={(e) => setForm({ ...form, monthly: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          {/* التواريخ والملاحظات */}
          <div style={{ gridColumn: "1 / -1", color: "#d4af37", fontWeight: 800, borderBottom: "1px solid #333", paddingBottom: 8, marginTop: 12 }}>
            التواريخ والملاحظات
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>تاريخ التعاقد *</span>
            <input
              type="date"
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
              value={form.contractDate}
              onChange={handleContractDate}
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>تاريخ أول قسط (تلقائي + شهر)</span>
            <input
              type="date"
              style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#888", outline: "none" }}
              value={form.firstPayDate}
              disabled
              readOnly
            />
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>ملاحظات</span>
              <input
                style={{ background: "#252525", border: "1px solid #333", borderRadius: 10, padding: 12, color: "#fff", outline: "none" }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية على العقد..."
              />
            </label>
          </div>

          {/* شريط الإحصائيات الحية */}
          <div style={{
            gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12, background: "rgba(212,175,55,0.08)", border: "1px dashed #d4af37", borderRadius: 12, padding: 14, margin: "10px 0"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#d4af37" }}>{live.profit} ج.م</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>صافي ربح العقد</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#d4af37" }}>{live.remaining} ج.م</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>إجمالي المتبقي للتقسيط</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#d4af37" }}>{live.installmentsCount}</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>عدد الأقساط</div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              gridColumn: "1 / -1", background: "linear-gradient(135deg, #d69a5f, #b06a35)",
              color: "#111", border: "none", borderRadius: 12, padding: "14px", fontSize: 16,
              fontWeight: 800, cursor: "pointer", marginTop: 8
            }}
          >
            حفظ بيانات العقد والعميل سحابياً
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #333" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              width: "100%", background: "#252525", border: "1px solid #333", color: "#d4af37",
              borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyCenter: "center", gap: 8
            }}
          >
            <ArrowRight size={16} /> رجوع للشاشة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClientScreen;
