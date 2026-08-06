import React, { useState, useMemo } from "react";
import { useCloudData } from "./hooks/useCloudData";

// الشاشات الرئيسية
import AddClientScreen from "./components/AddClientScreen";
import InstallmentsScreen from "./components/installments/InstallmentsScreen";
import ClientQueryScreen from "./components/clientQuery/ClientQueryScreen";
import MonthlyDuesScreen from "./components/MonthlyDuesScreen";
import DeleteClientScreen from "./components/DeleteClientScreen";

// النوافذ الشاملة
import { GlobalSearchModal } from "./components/modals/GlobalSearchModal";
import { RecycleBinModal } from "./components/modals/RecycleBinModal";
import { WhatsAppHubModal } from "./components/modals/WhatsAppHubModal";

// الأيقونات
import {
  UserPlus,
  CreditCard,
  Search,
  CalendarClock,
  Trash2,
  Users,
  Wallet,
  Settings,
  CloudUpload,
  LogOut,
  TrendingUp,
  AlertCircle,
  Calculator,
  Palette,
  Globe
} from "lucide-react";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isWhatsAppHubOpen, setIsWhatsAppHubOpen] = useState(false);

  // جلب كافة البيانات والدوال المحدثة من السحابة
  const {
    clientsList,
    isLoading,
    handleSaveClient,
    handleUpdateContract,
    addPayment
  } = useCloudData();

  // 📊 حساب الإحصائيات الحقيقية للواجهة الرئيسية
  const dashboardStats = useMemo(() => {
    let totalRemaining = 0;
    let monthlyDues = 0;
    let totalProfits = 0;
    let lateClientsCount = 0;

    (clientsList || []).forEach((c) => {
      if (c.status === "active" || !c.status) {
        const rem = Number(c.remainingAmount ?? c.remaining ?? 0);
        const monthly = Number(c.monthlyInstallment ?? c.monthly ?? 0);
        const cost = Number(c.cost || 0);
        const sale = Number(c.sale || c.total || 0);

        totalRemaining += rem;
        totalProfits += Math.max(0, sale - cost);

        if (rem > 0) {
          monthlyDues += Math.min(monthly, rem);
          lateClientsCount += 1;
        }
      }
    });

    return { totalRemaining, monthlyDues, totalProfits, lateClientsCount };
  }, [clientsList]);

  const themeStyles = {
    card: "#181818",
    border: "#282828",
    inputBg: "#121212",
    text: "#ffffff",
    subText: "#aaaaaa",
    accentGold: "#d69a5f",
    accent: "#b06a35",
    borderRadius: 14
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#d69a5f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cairo, sans-serif", direction: "rtl" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>جاري جلب البيانات والاتصال بالسحابة...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#ffffff", fontFamily: "Cairo, sans-serif", padding: "16px", direction: "rtl", boxSizing: "border-box" }}>
      
      {/* 1. الشاشة الرئيسية الأصلية (Dashboard) */}
      {currentScreen === "main" && (
        <div style={{ maxWidth: 1050, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Header العلوي الأصلي */}
          <header style={{ background: "linear-gradient(145deg, #df9b6d, #c37b4c)", color: "#000000", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "rgba(0,0,0,0.15)", padding: 10, borderRadius: 12, display: "flex" }}>
                <Calculator size={24} color="#000" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#000" }}>نظام إدارة الأقساط والمبيعات</h1>
                <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>Cloud Enterprise Active</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ background: "rgba(0,0,0,0.2)", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                مرحباً، egymod
              </span>
              <button style={headerTopBtnStyle}><Globe size={14} /> EG العربية</button>
              <button style={headerTopBtnStyle}><Palette size={14} /> تيمات وألوان الواجهة</button>
              <button style={{ ...headerTopBtnStyle, background: "#000000", color: "#ffffff" }}>خروج</button>
            </div>
          </header>

          {/* بطاقات الإحصائيات العلوية الثلاث */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <div style={kpiCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, color: "#aaaaaa", fontWeight: 700 }}>صافي الأرباح حتى اليوم</span>
                <TrendingUp size={20} color="#d69a5f" />
              </div>
              <div style={kpiValueStyle}>{dashboardStats.totalProfits.toLocaleString()} ج.م</div>
              <span style={{ fontSize: 11, color: "#666666" }}>إجمالي أرباح العقود والتحصيلات الصافية</span>
            </div>

            <div style={kpiCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, color: "#aaaaaa", fontWeight: 700 }}>مستحقات هذا الشهر</span>
                <CalendarClock size={20} color="#d69a5f" />
              </div>
              <div style={kpiValueStyle}>{dashboardStats.monthlyDues.toLocaleString()} ج.م</div>
              <span style={{ fontSize: 11, color: "#666666" }}>المطلوب تحصيله حالياً</span>
            </div>

            <div style={kpiCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, color: "#aaaaaa", fontWeight: 700 }}>إجمالي الأقساط المتبقية</span>
                <Wallet size={20} color="#d69a5f" />
              </div>
              <div style={kpiValueStyle}>{dashboardStats.totalRemaining.toLocaleString()} ج.م</div>
              <span style={{ fontSize: 11, color: "#666666" }}>المبالغ المتبقية في ذمة العملاء</span>
            </div>
          </section>

          {/* أزرار اللوحة الرئيسية (شبكة عمودين متوازيين بنفس الترتيب والألوان) */}
          <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            
            {/* العمود الأول */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setCurrentScreen("add_client")} style={actionBtnStyle("#181818", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("#1f2d24", "#4ade80")}><UserPlus size={18} /></div>
                  <span style={btnTextStyle}>إضافة عميل جديد</span>
                </div>
              </button>

              <button onClick={() => setCurrentScreen("client_query")} style={actionBtnStyle("#222222", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("#1a2634", "#60a5fa")}><Search size={18} /></div>
                  <span style={btnTextStyle}>استعلام عن عميل</span>
                </div>
              </button>

              <button onClick={() => setIsWhatsAppHubOpen(true)} style={actionBtnStyle("#a34343", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><AlertCircle size={18} /></div>
                  <span style={btnTextStyle}>المتأخرين عن السداد ({dashboardStats.lateClientsCount})</span>
                </div>
              </button>

              <button style={actionBtnStyle("#8b3a3a", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><Wallet size={18} /></div>
                  <span style={btnTextStyle}>توزيع الأرباح والخزينة</span>
                </div>
              </button>

              <button style={actionBtnStyle("#2b2b2b", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><Users size={18} /></div>
                  <span style={btnTextStyle}>شؤون الموظفين والرواتب</span>
                </div>
              </button>

              <button style={actionBtnStyle("#c27258", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><CloudUpload size={18} /></div>
                  <span style={btnTextStyle}>النسخ الاحتياطي السحابي</span>
                </div>
              </button>
            </div>

            {/* العمود الثاني */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setCurrentScreen("installments")} style={actionBtnStyle("#df9b6d", "#000000")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.15)", "#000000")}><CreditCard size={18} /></div>
                  <span style={{ ...btnTextStyle, color: "#000000" }}>سداد الأقساط</span>
                </div>
              </button>

              <button onClick={() => setCurrentScreen("monthly_dues")} style={actionBtnStyle("#c87f43", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><CalendarClock size={18} /></div>
                  <span style={btnTextStyle}>مستحقات هذا الشهر</span>
                </div>
              </button>

              <button onClick={() => setCurrentScreen("delete_client")} style={actionBtnStyle("#dd8855", "#000000")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.15)", "#000000")}><Trash2 size={18} /></div>
                  <span style={{ ...btnTextStyle, color: "#000000" }}>حذف حساب عميل</span>
                </div>
              </button>

              <button style={actionBtnStyle("#b86e3f", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><Users size={18} /></div>
                  <span style={btnTextStyle}>الشركاء ورأس المال</span>
                </div>
              </button>

              <button style={actionBtnStyle("#181818", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("#282828", "#d69a5f")}><Settings size={18} /></div>
                  <span style={btnTextStyle}>الإعدادات والصلاحيات</span>
                </div>
              </button>

              <button style={actionBtnStyle("#823829", "#ffffff")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={btnIconBg("rgba(0,0,0,0.2)", "#ffffff")}><LogOut size={18} /></div>
                  <span style={btnTextStyle}>تسجيل الخروج</span>
                </div>
              </button>
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

      {/* النوافذ الشاملة */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        clientsList={clientsList}
        themeStyles={themeStyles}
      />

      <RecycleBinModal
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        clientsList={clientsList}
        onUpdateContract={handleUpdateContract}
        themeStyles={themeStyles}
      />

      <WhatsAppHubModal
        isOpen={isWhatsAppHubOpen}
        onClose={() => setIsWhatsAppHubOpen(false)}
        clientsList={clientsList}
        themeStyles={themeStyles}
      />
    </div>
  );
}

// التنسيقات
const headerTopBtnStyle = {
  background: "rgba(0,0,0,0.15)",
  border: "none",
  color: "#000000",
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6
};

const kpiCardStyle = {
  background: "#181818",
  border: "1px solid #282828",
  borderRadius: 16,
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const kpiValueStyle = {
  fontSize: 22,
  fontWeight: 900,
  color: "#ffffff",
  margin: "4px 0"
};

const actionBtnStyle = (bg, color) => ({
  background: bg,
  color: color,
  border: "none",
  borderRadius: 14,
  padding: "14px 18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  boxSizing: "border-box"
});

const btnIconBg = (bg, color) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  background: bg,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

const btnTextStyle = {
  fontSize: 15,
  fontWeight: 800
};
