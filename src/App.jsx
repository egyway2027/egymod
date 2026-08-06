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

// أيقونات الواجهة
import { 
  UserPlus, 
  CreditCard, 
  Search, 
  CalendarClock, 
  UserX, 
  SearchCode,
  Wallet,
  TrendingUp
} from "lucide-react";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // جلب كافة البيانات والدوال المحدثة من الهوك السحابي
  const {
    clientsList,
    isLoading,
    handleSaveClient,
    handleUpdateContract,
    addPayment
  } = useCloudData();

  const themeStyles = {
    card: "#141414",
    cardBorder: "#262626",
    border: "#333333",
    inputBg: "#1a1a1a",
    text: "#ffffff",
    subText: "#aaaaaa",
    accentGold: "#d69a5f",
    accent: "#b06a35",
    borderRadius: 16
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#d69a5f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif", direction: "rtl" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800 }}>جاري جلب البيانات والاتصال بالسحابة...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff", fontFamily: "Cairo, sans-serif", padding: "20px 16px", direction: "rtl", boxSizing: "border-box" }}>
      
      {/* 1. الشاشة الرئيسية (Dashboard) */}
      {currentScreen === "main" && (
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          
          {/* الشريط العلوي */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #1f1f1f" }}>
            <div>
              <h1 style={{ color: "#ffffff", fontSize: 22, fontWeight: 900, margin: 0 }}>نظام إيجيمود لإدارة الأقساط والمبيعات</h1>
              <p style={{ color: "#777777", fontSize: 13, margin: "4px 0 0 0" }}>مرحباً بك، لوحة التحكم السحابية الموحدة</p>
            </div>
            
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              style={{
                background: "#161616",
                border: "1px solid #333333",
                color: "#d69a5f",
                padding: "10px 18px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s"
              }}
            >
              <SearchCode size={18} />
              <span>البحث السريع</span>
            </button>
          </header>

          {/* شبكة الخيارات الرئيسية */}
          <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            
            <div 
              onClick={() => setCurrentScreen("add_client")}
              style={{ ...cardStyle, background: "linear-gradient(145deg, #181818, #121212)", border: "1px solid #2a2a2a" }}
            >
              <div style={iconBoxStyle("#14291f", "#4ade80")}>
                <UserPlus size={22} />
              </div>
              <div>
                <div style={cardTitleStyle}>إضافة عميل جديد</div>
                <div style={cardSubTitleStyle}>تسجيل عقد جديد وتفاصيل الأقساط</div>
              </div>
            </div>

            <div 
              onClick={() => setCurrentScreen("installments")}
              style={{ ...cardStyle, background: "linear-gradient(145deg, #181818, #121212)", border: "1px solid #2a2a2a" }}
            >
              <div style={iconBoxStyle("#3a2a16", "#d69a5f")}>
                <CreditCard size={22} />
              </div>
              <div>
                <div style={cardTitleStyle}>سداد الأقساط</div>
                <div style={cardSubTitleStyle}>تحصيل الدفعات وطباعة الإيصالات</div>
              </div>
            </div>

            <div 
              onClick={() => setCurrentScreen("client_query")}
              style={{ ...cardStyle, background: "linear-gradient(145deg, #181818, #121212)", border: "1px solid #2a2a2a" }}
            >
              <div style={iconBoxStyle("#182838", "#60a5fa")}>
                <Search size={22} />
              </div>
              <div>
                <div style={cardTitleStyle}>استعلام عن عميل</div>
                <div style={cardSubTitleStyle}>عرض تفاصيل العقد والسجل الكامل</div>
              </div>
            </div>

            <div 
              onClick={() => setCurrentScreen("monthly_dues")}
              style={{ ...cardStyle, background: "linear-gradient(145deg, #181818, #121212)", border: "1px solid #2a2a2a" }}
            >
              <div style={iconBoxStyle("#2a1838", "#c084fc")}>
                <CalendarClock size={22} />
              </div>
              <div>
                <div style={cardTitleStyle}>مستحقات هذا الشهر</div>
                <div style={cardSubTitleStyle}>متابعة المحصل والمتبقي للشهر الحالي</div>
              </div>
            </div>

            <div 
              onClick={() => setCurrentScreen("delete_client")}
              style={{ ...cardStyle, background: "linear-gradient(145deg, #181818, #121212)", border: "1px solid #2a2a2a" }}
            >
              <div style={iconBoxStyle("#3e1c24", "#f87171")}>
                <UserX size={22} />
              </div>
              <div>
                <div style={cardTitleStyle}>إدارة وحذف العملاء</div>
                <div style={cardSubTitleStyle}>الأرشفة وسلة المهملات والحذف النهائي</div>
              </div>
            </div>

          </main>
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

// أنماط التنسيق لكروت الشاشة الرئيسية
const cardStyle = {
  padding: "20px 18px",
  borderRadius: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 16,
  userSelect: "none",
  transition: "transform 0.15s ease, border-color 0.15s ease"
};

const iconBoxStyle = (bg, color) => ({
  width: 46,
  height: 46,
  borderRadius: 12,
  background: bg,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
});

const cardTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#ffffff"
};

const cardSubTitleStyle = {
  fontSize: 12,
  color: "#888888",
  marginTop: 4
};
