import React from 'react';
import { Search, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function CustomerSearchHeader({ 
  searchQuery, 
  setSearchQuery, 
  selectedCustomer, 
  onSelectCustomer, 
  customersList,
  themeStyles = {}
}) {
  const cardStyle = {
    background: themeStyles.card || "#1e1e1e",
    border: `1px solid ${themeStyles.border || "#333"}`,
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 🔍 شريط البحث */}
      <div style={{ background: themeStyles.card || "#1e1e1e", padding: "16px", borderRadius: "14px", border: `1px solid ${themeStyles.border || "#333"}` }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: themeStyles.text || "#fff" }}>
          🔍 البحث عن عميل أو رقم العقد:
        </label>
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", right: "12px", top: "14px", color: "#888" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="اكتب اسم العميل، رقم الهاتف، أو رقم العقد..."
            style={{
              width: "100%", paddingRight: "40px", paddingLeft: "12px", paddingTop: "12px", paddingBottom: "12px",
              borderRadius: "8px", border: `1px solid ${themeStyles.border || "#444"}`,
              backgroundColor: themeStyles.inputBg || "#121212", color: themeStyles.text || "#fff", outline: "none",
              fontSize: "14px", boxSizing: "border-box"
            }}
          />
        </div>

        {/* قائمة نتائج البحث */}
        {searchQuery && !selectedCustomer && (
          <div style={{ marginTop: "8px", backgroundColor: themeStyles.card || "#222", border: `1px solid ${themeStyles.border || "#444"}`, borderRadius: "8px", overflow: "hidden" }}>
            {customersList
              .filter(c => c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.contractId.includes(searchQuery))
              .map(customer => (
                <button
                  key={customer.id}
                  onClick={() => { onSelectCustomer(customer); setSearchQuery(''); }}
                  style={{
                    width: "100%", textAlign: "right", padding: "12px 16px", background: "transparent",
                    border: "none", borderBottom: `1px solid ${themeStyles.border || "#333"}`, color: themeStyles.text || "#fff",
                    display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "700", display: "block" }}>{customer.name}</span>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>عقد: {customer.contractId} | هاتف: {customer.phone}</span>
                  </div>
                  <span style={{ fontSize: "12px", padding: "4px 8px", background: "#d4af37", color: "#000", borderRadius: "4px", fontWeight: "700" }}>اختيار</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* 📊 بطاقات الملخص المالي الأفقية */}
      {selectedCustomer && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={cardStyle}>
            <CreditCard size={28} color="#3b82f6" />
            <div>
              <span style={{ fontSize: "12px", color: "#aaa", display: "block" }}>إجمالي المستحق</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: themeStyles.text || "#fff" }}>{selectedCustomer.totalAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div style={cardStyle}>
            <CheckCircle size={28} color="#10b981" />
            <div>
              <span style={{ fontSize: "12px", color: "#aaa", display: "block" }}>إجمالي المدفوع</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#10b981" }}>{selectedCustomer.paidAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div style={cardStyle}>
            <Clock size={28} color="#f59e0b" />
            <div>
              <span style={{ fontSize: "12px", color: "#aaa", display: "block" }}>المتبقي عليه</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#f59e0b" }}>{selectedCustomer.remainingAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div style={cardStyle}>
            <AlertCircle size={28} color="#ef4444" />
            <div>
              <span style={{ fontSize: "12px", color: "#aaa", display: "block" }}>أقساط متأخرة</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444" }}>{selectedCustomer.overdueCount} أقساط</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
