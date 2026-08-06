import React, { useState } from "react";
import { useCloudData } from "./hooks/useCloudData";

// الشاشات والمكونات الرئيسية
import AddClientScreen from "./components/AddClientScreen";
import InstallmentsScreen from "./components/installments/InstallmentsScreen";
import ClientQueryScreen from "./components/clientQuery/ClientQueryScreen";
import MonthlyDuesScreen from "./components/MonthlyDuesScreen";
import DeleteClientScreen from "./components/DeleteClientScreen";

// النوافذ الشاملة
import { GlobalSearchModal } from "./components/modals/GlobalSearchModal";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // جلب كافة البيانات والدوال المحدثة من الهوك السحابي
  const {
    clientsList,
    contracts,
    employees,
    partners,
    isLoading,
    handleSaveClient,
    handleUpdateContract,
    addPayment
  } = useCloudData();

  const themeStyles = {
    card: "#1e1e1e",
    border: "#333333",
    inputBg: "#1b1b1d",
    text: "#ffffff",
    subText: "#aaaaaa",
    accentGold: "#d69a5f",
    accent: "#b06a35",
    borderRadius: "14px"
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#111111", color: "#d69a5f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif" }}>
        <h2>جاري تحضير البيانات الاتصال بالسحابة...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#ffffff", fontFamily: "Cairo, sans-serif", padding: "16px" }}>
      
      {/* 1. الشاشة الرئيسية */}
      {currentScreen === "main" && (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h1 style={{ color: "#d69a5f", fontSize: "22px", margin: 0 }}>نظام إيجيمود لإدارة الأقساط والمبيعات</h1>
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              style={{ background: "#1a1a1a", border: "1px solid #333", color: "#d69a5f", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
            >
              🔍 البحث السريع
            </button>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <button onClick={() => setCurrentScreen("add_client")} style={navButtonStyle}>➕ إضافة عميل جديد</button>
            <button onClick={() => setCurrentScreen("installments")} style={navButtonStyle}>💳 سداد الأقساط</button>
            <button onClick={() => setCurrentScreen("client_query")} style={navButtonStyle}>🔎 استعلام عن عميل</button>
            <button onClick={() => setCurrentScreen("monthly_dues")} style={navButtonStyle}>📅 مستحقات هذا الشهر</button>
            <button onClick={() => setCurrentScreen("delete_client")} style={navButtonStyle}>🗑️ إدارة وحذف العملاء</button>
          </div>
        </div>
      )}

      {/* 2. شاشة إضافة عميل */}
      {currentScreen === "add_client" && (
        <AddClientScreen
          onSave={async (data) => {
            const res = await handleSaveClient(data);
            if (res?.success) setCurrentScreen("main");
          }}
          onBack={() => setCurrentScreen("main")}
          themeStyles={themeStyles}
        />
      )}

      {/* 3. شاشة سداد الأقساط */}
      {currentScreen === "installments" && (
        <InstallmentsScreen
          contracts={clientsList}
          onPay={addPayment}
          onBack={() => setCurrentScreen("main")}
          themeStyles={themeStyles}
        />
      )}

      {/* 4. شاشة الاستعلام عن عميل */}
      {currentScreen === "client_query" && (
        <ClientQueryScreen
          contracts={clientsList}
          onUpdateContract={handleUpdateContract}
          onBack={() => setCurrentScreen("main")}
          themeStyles={themeStyles}
        />
      )}

      {/* 5. شاشة مستحقات الشهر */}
      {currentScreen === "monthly_dues" && (
        <MonthlyDuesScreen
          rows={clientsList}
          onPay={async (contractId, amount, payDate) => {
            await addPayment({ contractId, amount, payDate });
          }}
          onBack={() => setCurrentScreen("main")}
          themeStyles={themeStyles}
        />
      )}

      {/* 6. شاشة إدارة وحذف العملاء */}
      {currentScreen === "delete_client" && (
        <DeleteClientScreen
          clientsList={clientsList}
          onUpdateContract={handleUpdateContract}
          onBack={() => setCurrentScreen("main")}
          themeStyles={themeStyles}
        />
      )}

      {/* نافذة البحث السريع */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        clientsList={clientsList}
        themeStyles={themeStyles}
      />
    </div>
  );
}

const navButtonStyle = {
  background: "#1e1e1e",
  border: "1px solid #333333",
  color: "#d69a5f",
  padding: "20px",
  borderRadius: "14px",
  fontSize: "16px",
  fontWeight: "800",
  cursor: "pointer",
  textAlign: "center"
};
