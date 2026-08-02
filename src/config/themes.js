/**
 * =========================================================
 * 📌 الملف: قاعدة الثيمات والتصميم الشاملة (100 Themes Store)
 * 📁 المسار: src/config/themes.js
 * 📝 الوظيفة: 100 ثيم كامل الألوان والأشكال والظلال
 *            وانحناءات الأزرار والكروت المتنوعة.
 * =========================================================
 */

export const THEME_CATEGORIES = [
  { id: "all", name: "جميع الثيمات (100)" },
  { id: "royal", name: "الملكي والفاخر 👑" },
  { id: "dark", name: "الداكن والـ OLED 🌙" },
  { id: "light", name: "الفاتح والناصع ☀️" },
  { id: "glass", name: "الزجاجي الحديث 💎" },
  { id: "neon", name: "النيون والسايبر ⚡" },
  { id: "pastel", name: "الباستيل الهادئ 🎨" }
];

// دالة توليد الـ 100 ثيم كاملة البيانات دون اختصار
const generateThemes = () => {
  const themes = [];

  // 1. الملكي والفاخر (15 ثيم)
  const royalNames = [
    "ذهبي ملكي فاخر", "زمرد أندلسي", "ياقوت سلطاني", "أمير القصر", "ذهب أسود 24K",
    "برونز عتيق", "فخامة اللؤلؤ", "فيروزي دبي", "عنبر ملكي", "تاج الرئاسة",
    "أوركيد ذهبي", "ماس أسود", "نبيذ فاخر", "سرمك ملكي", "غروب الصحراء"
  ];
  const royalAccents = ["#d4af37", "#10b981", "#e11d48", "#f59e0b", "#eab308", "#cd7f32", "#f8fafc", "#06b6d4", "#d97706", "#facc15", "#f43f5e", "#38bdf8", "#881337", "#a16207", "#fb923c"];

  for (let i = 0; i < 15; i++) {
    themes.push({
      id: `royal_${i + 1}`,
      name: royalNames[i],
      category: "royal",
      bg: "#111111",
      card: "#1e1e1e",
      inputBg: "#282828",
      border: `${royalAccents[i]}44`,
      text: "#ffffff",
      subText: "#aaaaaa",
      accentGold: royalAccents[i],
      accent: royalAccents[i],
      cardRadius: `${12 + (i % 6) * 3}px`,
      cardShadow: `0 8px 32px ${royalAccents[i]}22`,
      buttonStyle: i % 2 === 0 ? "gradient" : "3d",
      buttonRadius: `${8 + (i % 4) * 4}px`
    });
  }

  // 2. الداكن والـ OLED (20 ثيم)
  const darkAccents = ["#e07a5f", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#84cc16", "#a855f7", "#64748b", "#0284c7", "#d97706", "#65a30d", "#4f46e5", "#c026d3", "#e11d48", "#059669", "#d97706", "#7c3aed", "#2563eb"];

  for (let i = 0; i < 20; i++) {
    themes.push({
      id: `dark_${i + 1}`,
      name: `داكن فحم ${i + 1}`,
      category: "dark",
      bg: i % 2 === 0 ? "#090a0f" : "#121316",
      card: i % 2 === 0 ? "#12151e" : "#1c1e22",
      inputBg: "#22252d",
      border: "#2d3139",
      text: "#f3f4f6",
      subText: "#9ca3af",
      accentGold: darkAccents[i],
      accent: darkAccents[i],
      cardRadius: `${10 + (i % 5) * 4}px`,
      cardShadow: "0 4px 20px rgba(0,0,0,0.5)",
      buttonStyle: "flat",
      buttonRadius: `${10 + (i % 3) * 5}px`
    });
  }

  // 3. الفاتح والناصع (20 ثيم)
  const lightBgs = ["#f8fafc", "#f1f5f9", "#fafafa", "#f0fdf4", "#fff7ed", "#fdf2f8", "#eff6ff", "#f5f3ff", "#ecfdf5", "#fffbe0"];
  const lightAccents = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#ea580c", "#0284c7", "#65a30d", "#9333ea", "#ca8a04"];

  for (let i = 0; i < 20; i++) {
    const bgIndex = i % lightBgs.length;
    const accIndex = i % lightAccents.length;
    themes.push({
      id: `light_${i + 1}`,
      name: `فاتح ناصع ${i + 1}`,
      category: "light",
      bg: lightBgs[bgIndex],
      card: "#ffffff",
      inputBg: "#f1f5f9",
      border: "#cbd5e1",
      text: "#0f172a",
      subText: "#64748b",
      accentGold: lightAccents[accIndex],
      accent: lightAccents[accIndex],
      cardRadius: `${8 + (i % 4) * 4}px`,
      cardShadow: "0 4px 15px rgba(0,0,0,0.06)",
      buttonStyle: "flat",
      buttonRadius: `${8 + (i % 3) * 4}px`
    });
  }

  // 4. الزجاجي الحديث Glassmorphism (15 ثيم)
  const glassColors = ["#38bdf8", "#818cf8", "#c084fc", "#f472b6", "#fb7185", "#4ade80", "#2dd4bf", "#facc15", "#fb923c", "#a78bfa", "#60a5fa", "#34d399", "#f43f5e", "#e879f9", "#38bdf8"];

  for (let i = 0; i < 15; i++) {
    themes.push({
      id: `glass_${i + 1}`,
      name: `زجاجي كريستال ${i + 1}`,
      category: "glass",
      bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      card: "rgba(255, 255, 255, 0.07)",
      inputBg: "rgba(255, 255, 255, 0.12)",
      border: "rgba(255, 255, 255, 0.18)",
      text: "#ffffff",
      subText: "#cbd5e1",
      accentGold: glassColors[i],
      accent: glassColors[i],
      cardRadius: `${16 + (i % 4) * 4}px`,
      cardShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      buttonStyle: "glass",
      buttonRadius: "16px"
    });
  }

  // 5. النيون والسايبر (15 ثيم)
  const neonAccents = ["#00ffcc", "#ff007f", "#00e5ff", "#76ff03", "#ffea00", "#d500f9", "#ff3d00", "#1de9b6", "#c6ff00", "#ff1744", "#00b0ff", "#651fff", "#f50057", "#00e676", "#ff9100"];

  for (let i = 0; i < 15; i++) {
    themes.push({
      id: `neon_${i + 1}`,
      name: `سايبر نيون ${i + 1}`,
      category: "neon",
      bg: "#050508",
      card: "#0d0e15",
      inputBg: "#151722",
      border: neonAccents[i],
      text: "#ffffff",
      subText: "#8f9bb3",
      accentGold: neonAccents[i],
      accent: neonAccents[i],
      cardRadius: `${4 + (i % 3) * 4}px`,
      cardShadow: `0 0 15px ${neonAccents[i]}55`,
      buttonStyle: "neon",
      buttonRadius: "6px"
    });
  }

  // 6. الباستيل الهادئ (15 ثيم)
  const pastelBgs = ["#fdf6e3", "#f0f4f8", "#f4f1ea", "#fceade", "#e8f5e9", "#f3e5f5", "#e0f2f1", "#fff3e0", "#f3e5f5", "#e8eaf6", "#efebe9", "#f1f8e9", "#e0f7fa", "#fbe9e7", "#f9fbe7"];
  const pastelAccents = ["#b58900", "#486581", "#8c6d46", "#d97736", "#2e7d32", "#7b1fa2", "#00695c", "#ef6c00", "#6a1b9a", "#283593", "#4e342e", "#558b2f", "#00838f", "#d84315", "#9e9d24"];

  for (let i = 0; i < 15; i++) {
    themes.push({
      id: `pastel_${i + 1}`,
      name: `باستيل هادئ ${i + 1}`,
      category: "pastel",
      bg: pastelBgs[i],
      card: "#ffffff",
      inputBg: "rgba(0,0,0,0.04)",
      border: "rgba(0,0,0,0.08)",
      text: "#2d3748",
      subText: "#718096",
      accentGold: pastelAccents[i],
      accent: pastelAccents[i],
      cardRadius: "20px",
      cardShadow: "0 10px 25px rgba(0,0,0,0.03)",
      buttonStyle: "flat",
      buttonRadius: "20px"
    });
  }

  return themes;
};

export const THEMES_LIST = generateThemes();
