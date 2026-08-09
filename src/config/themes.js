/**
 * =========================================================
 * 📌 الملف: قاعدة الثيمات المتقدمة
 * 📁 المسار: src/config/themes.js
 * =========================================================
 */

export const THEME_CATEGORIES = [
  { id: "all", name: "جميع الثيمات العادية (30)" },
  { id: "pro", name: "ثيمات Pro الاحترافية 💎" },
  { id: "Luxury Dark", name: "الملكي والفاخر 👑" },
  { id: "Cyber & Neon", name: "النيون المضيء ⚡" },
  { id: "Glassmorphism", name: "الزجاج المعتم 💎" },
  { id: "Modern UI", name: "الحديث والبروتاليزم 🎨" },
  { id: "Light Modes", name: "الأوضاع الفاتحة ☀️" },
  { id: "Metallic", name: "المعدني والكلاسيكي 🛡️" }
];

export const THEMES_LIST = [
  { id: "royalGold", name: "الذهبي والنحاسي الأصلي (Royal Gold)", category: "Luxury Dark", bg: "#111111", card: "#1e1e1e", accentGold: "#d0b689" },
  { id: "dark_obsidian", name: "الأسود الملكي (Obsidian)", category: "Luxury Dark", bg: "#0f172a", card: "#1e293b", accentGold: "#f59e0b" },
  { id: "emerald_wealth", name: "الزمردي المالي (Emerald)", category: "Luxury Dark", bg: "#064e3b", card: "#047857", accentGold: "#34d399" },
  { id: "navy_enterprise", name: "الأزرق المؤسسي (Enterprise Blue)", category: "Luxury Dark", bg: "#0f172a", card: "#1e3a8a", accentGold: "#60a5fa" },
  { id: "cyberpunk_neon", name: "النيون المضيء (Cyberpunk Glow)", category: "Cyber & Neon", bg: "#180828", card: "#2d124d", accentGold: "#06b6d4" },
  { id: "matrix_code", name: "الماتريكس الحاد (Matrix Sharp)", category: "Cyber & Neon", bg: "#051507", card: "#0a290e", accentGold: "#4ade80" },
  { id: "electric_violet", name: "البنفسجي الكهربائي (Electric Violet)", category: "Cyber & Neon", bg: "#2e1065", card: "#3b0764", accentGold: "#c084fc" },
  { id: "neo_brutalism", name: "النيو-بروتاليزم الصلب (Neo-Brutalism)", category: "Modern UI", bg: "#18181b", card: "#27272a", accentGold: "#fb7185" },
  { id: "frosted_glass", name: "الزجاج المعتم (Frosted Glass)", category: "Glassmorphism", bg: "#0b0f19", card: "rgba(30, 41, 59, 0.75)", accentGold: "#38bdf8" },
  { id: "nordic_pill", name: "الكبسولي الدائري (Nordic Pill)", category: "Modern UI", bg: "#1e293b", card: "#334155", accentGold: "#7dd3fc" },
  { id: "crimson_velvet", name: "المخملي العنابي (Crimson Velvet)", category: "Luxury Dark", bg: "#450a0a", card: "#7f1d1d", accentGold: "#f43f5e" },
  { id: "titanium_silver", name: "الفضي المعدني (Titanium)", category: "Metallic", bg: "#1f2937", card: "#374151", accentGold: "#9ca3af" },
  { id: "mocha_luxury", name: "القهوة والكابتشينو (Mocha)", category: "Luxury Dark", bg: "#271c19", card: "#3d2b25", accentGold: "#ea580c" },
  { id: "ocean_depths", name: "الأزرق العميق (Ocean Depths)", category: "Luxury Dark", bg: "#0c4a6e", card: "#075985", accentGold: "#38bdf8" },
  { id: "rose_gold_luxury", name: "الروز جولد الفاخر (Rose Gold)", category: "Luxury Dark", bg: "#1f1218", card: "#381e2b", accentGold: "#fda4af" },
  { id: "neon_mint_glow", name: "النعناع المضيء (Neon Mint)", category: "Cyber & Neon", bg: "#022c22", card: "#064e3b", accentGold: "#6ee7b7" },
  { id: "copper_industrial", name: "النحاسي الصناعي (Copper Rust)", category: "Metallic", bg: "#1c100b", card: "#361e14", accentGold: "#f97316" },
  { id: "tokyo_night", name: "ليل طوكيو (Tokyo Night)", category: "Modern UI", bg: "#09090b", card: "#18181b", accentGold: "#a5b4fc" },
  { id: "forest_moss", name: "أخضر الغابات (Forest Moss)", category: "Luxury Dark", bg: "#14532d", card: "#166534", accentGold: "#86efac" },
  { id: "volcanic_lava", name: "البركاني الداكن (Volcanic Lava)", category: "Luxury Dark", bg: "#180505", card: "#340a0a", accentGold: "#f87171" },
  { id: "arctic_ice", name: "الجليد الأزرق (Arctic Ice)", category: "Luxury Dark", bg: "#082f49", card: "#0c4a6e", accentGold: "#a5f3fc" },
  { id: "charcoal_flat", name: "الفحمي المسطح (Minimal Charcoal)", category: "Modern UI", bg: "#18181b", card: "#27272a", accentGold: "#e4e4e7" },
  { id: "sunfire_gold", name: "الشمس الذهبية (Sunfire)", category: "Luxury Dark", bg: "#1a1202", card: "#332405", accentGold: "#fde047" },
  { id: "space_nebula", name: "سديم الفضاء (Space Nebula)", category: "Cyber & Neon", bg: "#0c0a21", card: "#1a1642", accentGold: "#818cf8" },
  { id: "vintage_bronze", name: "البرونزي الكلاسيكي (Vintage Bronze)", category: "Metallic", bg: "#1a130e", card: "#33251b", accentGold: "#eab308" },
  { id: "light_clean_pill", name: "الأبيض الكبسولي (Clean Light Pill)", category: "Light Modes", bg: "#f8fafc", card: "#ffffff", accentGold: "#1d4ed8" },
  { id: "light_warm_sand", name: "الرملي الدافئ (Warm Sand)", category: "Light Modes", bg: "#fef3c7", card: "#ffffff", accentGold: "#d97706" },
  { id: "light_nordic_slate", name: "الرمادي الفاتح (Nordic Slate Light)", category: "Light Modes", bg: "#f1f5f9", card: "#ffffff", accentGold: "#0369a1" },
  { id: "light_rose_quartz", name: "الكوارتز الوردي (Rose Quartz Light)", category: "Light Modes", bg: "#fff1f2", card: "#ffffff", accentGold: "#be123c" },
  { id: "light_mint_breeze", name: "النعناع الفاتح (Mint Breeze Light)", category: "Light Modes", bg: "#ecfdf5", card: "#ffffff", accentGold: "#047857" },

  /* 💎 ثيمات الصور الثلاث المطابقة 100% للتصميم البصري */
  { id: "pro_liquid_prism", name: "Liquid Glass Kit (الصورة 1)", category: "pro", isPro: true, bg: "#e8e3df", card: "rgba(255, 255, 255, 0.55)", accentGold: "#7c3aed" },
  { id: "pro_dark_gel_capsules", name: "Liquid Dark Gel (الصورة 2)", category: "pro", isPro: true, bg: "#e5e5e7", card: "rgba(15, 15, 20, 0.88)", accentGold: "#38bdf8" },
  { id: "pro_royal_gold_swatch", name: "Imperial Gold Swatch (الصورة 3)", category: "pro", isPro: true, bg: "linear-gradient(135deg, #2b1806 0%, #120902 100%)", card: "rgba(88, 55, 20, 0.75)", accentGold: "#FFEB97" }
];

export function getThemeStyles(themeId = "royalGold") {
  const isLight = String(themeId).startsWith("light_");

  let bg = "#111111";
  let card = "#1e1e1e";
  let inputBg = "#141414";
  let text = "#ffffff";
  let subText = "#a1a1aa";
  let border = "#333333";
  let accent = "#e07a5f";
  let accentGold = "#d0b689";
  let highlightBg = "rgba(224, 122, 95, 0.15)";
  
  let borderRadius = "14px";
  let borderWidth = "1px";
  let boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
  let buttonShadow = "0 4px 12px rgba(224, 122, 95, 0.25)";
  let inputShadow = "none";
  let backdropFilter = "none";

  switch (themeId) {
    case "royalGold":
      bg = "#111111"; card = "#1e1e1e"; inputBg = "#141414"; text = "#ffffff"; subText = "#a1a1aa"; border = "#333333"; accent = "#e07a5f"; accentGold = "#d0b689"; highlightBg = "rgba(224, 122, 95, 0.15)"; borderRadius = "14px";
      break;

    case "dark_obsidian":
      bg = "#0f172a"; card = "#1e293b"; inputBg = "#0f172a"; text = "#f8fafc"; subText = "#94a3b8"; border = "#334155"; accent = "#d97706"; accentGold = "#f59e0b"; highlightBg = "rgba(217, 119, 6, 0.12)"; borderRadius = "16px";
      break;

    case "emerald_wealth":
      bg = "#064e3b"; card = "#047857"; inputBg = "#065f46"; text = "#ecfdf5"; subText = "#a7f3d0"; border = "#059669"; accent = "#10b981"; accentGold = "#34d399"; highlightBg = "rgba(16, 185, 129, 0.2)"; borderRadius = "18px";
      break;

    case "navy_enterprise":
      bg = "#0f172a"; card = "#1e3a8a"; inputBg = "#172554"; text = "#f0f9ff"; subText = "#93c5fd"; border = "#1d4ed8"; accent = "#3b82f6"; accentGold = "#60a5fa"; highlightBg = "rgba(59, 130, 246, 0.2)"; borderRadius = "12px";
      break;

    case "cyberpunk_neon":
      bg = "#180828"; card = "#2d124d"; inputBg = "#180828"; text = "#fdf4ff"; subText = "#f0abfc"; border = "#ec4899"; accent = "#ec4899"; accentGold = "#06b6d4"; highlightBg = "rgba(236, 72, 153, 0.25)"; borderRadius = "16px";
      boxShadow = "0 0 20px rgba(236, 72, 153, 0.35)"; buttonShadow = "0 0 15px rgba(236, 72, 153, 0.6)"; inputShadow = "0 0 10px rgba(6, 182, 212, 0.3)";
      break;

    case "matrix_code":
      bg = "#051507"; card = "#0a290e"; inputBg = "#020a03"; text = "#dcffe4"; subText = "#4ade80"; border = "#22c55e"; accent = "#22c55e"; accentGold = "#4ade80"; highlightBg = "rgba(34, 197, 94, 0.25)"; borderRadius = "3px"; borderWidth = "2px";
      boxShadow = "0 0 15px rgba(34, 197, 94, 0.3)"; buttonShadow = "0 0 12px rgba(34, 197, 94, 0.5)";
      break;

    case "electric_violet":
      bg = "#2e1065"; card = "#3b0764"; inputBg = "#1e1b4b"; text = "#faf5ff"; subText = "#d8b4fe"; border = "#a855f7"; accent = "#a855f7"; accentGold = "#c084fc"; highlightBg = "rgba(168, 85, 247, 0.2)"; borderRadius = "18px";
      boxShadow = "0 8px 25px rgba(168, 85, 247, 0.25)";
      break;

    case "neo_brutalism":
      bg = "#18181b"; card = "#27272a"; inputBg = "#0f0f11"; text = "#ffffff"; subText = "#fb7185"; border = "#f43f5e"; accent = "#f43f5e"; accentGold = "#fb7185"; highlightBg = "rgba(244, 63, 94, 0.2)"; borderRadius = "2px"; borderWidth = "2px";
      boxShadow = "5px 5px 0px #f43f5e"; buttonShadow = "4px 4px 0px #ffffff";
      break;

    case "frosted_glass":
      bg = "#0b0f19"; card = "rgba(30, 41, 59, 0.75)"; inputBg = "rgba(15, 23, 42, 0.65)"; text = "#f8fafc"; subText = "#94a3b8"; border = "rgba(255, 255, 255, 0.15)"; accent = "#06b6d4"; accentGold = "#38bdf8"; highlightBg = "rgba(6, 182, 212, 0.15)"; borderRadius = "22px";
      boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.37)";
      break;

    case "nordic_pill":
      bg = "#1e293b"; card = "#334155"; inputBg = "#0f172a"; text = "#f8fafc"; subText = "#cbd5e1"; border = "#475569"; accent = "#38bdf8"; accentGold = "#7dd3fc"; highlightBg = "rgba(56, 189, 248, 0.15)"; borderRadius = "30px";
      break;

    case "crimson_velvet":
      bg = "#450a0a"; card = "#7f1d1d"; inputBg = "#2d0606"; text = "#fff1f2"; subText = "#fca5a5"; border = "#991b1b"; accent = "#fb7185"; accentGold = "#f43f5e"; highlightBg = "rgba(244, 63, 94, 0.2)"; borderRadius = "16px";
      break;

    case "titanium_silver":
      bg = "#1f2937"; card = "#374151"; inputBg = "#111827"; text = "#f9fafb"; subText = "#9ca3af"; border = "#4b5563"; accent = "#e5e7eb"; accentGold = "#9ca3af"; highlightBg = "rgba(229, 231, 235, 0.12)"; borderRadius = "12px";
      break;

    case "mocha_luxury":
      bg = "#271c19"; card = "#3d2b25"; inputBg = "#1a1210"; text = "#fff7ed"; subText = "#fdba74"; border = "#573c33"; accent = "#f97316"; accentGold = "#ea580c"; highlightBg = "rgba(234, 88, 12, 0.18)"; borderRadius = "16px";
      break;

    case "ocean_depths":
      bg = "#0c4a6e"; card = "#075985"; inputBg = "#082f49"; text = "#f0f9ff"; subText = "#7dd3fc"; border = "#0284c7"; accent = "#0ea5e9"; accentGold = "#38bdf8"; highlightBg = "rgba(14, 165, 233, 0.2)"; borderRadius = "16px";
      break;

    case "rose_gold_luxury":
      bg = "#1f1218"; card = "#381e2b"; inputBg = "#140a0f"; text = "#fff1f2"; subText = "#fecdd3"; border = "#582a42"; accent = "#fb7185"; accentGold = "#fda4af"; highlightBg = "rgba(251, 113, 133, 0.18)"; borderRadius = "20px";
      break;

    case "neon_mint_glow":
      bg = "#022c22"; card = "#064e3b"; inputBg = "#011913"; text = "#ecfdf5"; subText = "#6ee7b7"; border = "#34d399"; accent = "#34d399"; accentGold = "#6ee7b7"; highlightBg = "rgba(52, 211, 153, 0.2)"; borderRadius = "16px";
      boxShadow = "0 0 18px rgba(52, 211, 153, 0.25)";
      break;

    case "copper_industrial":
      bg = "#1c100b"; card = "#361e14"; inputBg = "#120a07"; text = "#fff7ed"; subText = "#ffedd5"; border = "#542e1f"; accent = "#ea580c"; accentGold = "#f97316"; highlightBg = "rgba(234, 88, 12, 0.2)"; borderRadius = "10px";
      break;

    case "tokyo_night":
      bg = "#09090b"; card = "#18181b"; inputBg = "#000000"; text = "#fafafa"; subText = "#a1a1aa"; border = "#27272a"; accent = "#818cf8"; accentGold = "#a5b4fc"; highlightBg = "rgba(129, 140, 248, 0.18)"; borderRadius = "16px";
      break;

    case "forest_moss":
      bg = "#14532d"; card = "#166534"; inputBg = "#052e16"; text = "#f0fdf4"; subText = "#86efac"; border = "#15803d"; accent = "#4ade80"; accentGold = "#86efac"; highlightBg = "rgba(74, 222, 128, 0.2)"; borderRadius = "16px";
      break;

    case "volcanic_lava":
      bg = "#180505"; card = "#340a0a"; inputBg = "#0f0202"; text = "#fef2f2"; subText = "#fca5a5"; border = "#5c1313"; accent = "#ef4444"; accentGold = "#f87171"; highlightBg = "rgba(239, 68, 68, 0.22)"; borderRadius = "14px";
      break;

    case "arctic_ice":
      bg = "#082f49"; card = "#0c4a6e"; inputBg = "#031e30"; text = "#f0f9ff"; subText = "#a5f3fc"; border = "#0369a1"; accent = "#67e8f9"; accentGold = "#a5f3fc"; highlightBg = "rgba(103, 232, 249, 0.2)"; borderRadius = "18px";
      break;

    case "charcoal_flat":
      bg = "#18181b"; card = "#27272a"; inputBg = "#0f0f11"; text = "#f4f4f5"; subText = "#d4d4d8"; border = "#3f3f46"; accent = "#a1a1aa"; accentGold = "#e4e4e7"; highlightBg = "rgba(161, 161, 170, 0.15)"; borderRadius = "8px"; boxShadow = "none";
      break;

    case "sunfire_gold":
      bg = "#1a1202"; card = "#332405"; inputBg = "#0d0901"; text = "#fefce8"; subText = "#fef08a"; border = "#543d0b"; accent = "#eab308"; accentGold = "#fde047"; highlightBg = "rgba(234, 179, 8, 0.2)"; borderRadius = "16px";
      break;

    case "space_nebula":
      bg = "#0c0a21"; card = "#1a1642"; inputBg = "#060512"; text = "#eeedfe"; subText = "#c7d2fe"; border = "#2e296e"; accent = "#6366f1"; accentGold = "#818cf8"; highlightBg = "rgba(99, 102, 241, 0.22)"; borderRadius = "22px";
      break;

    case "vintage_bronze":
      bg = "#1a130e"; card = "#33251b"; inputBg = "#0d0a07"; text = "#fefce8"; subText = "#fef08a"; border = "#523c2c"; accent = "#ca8a04"; accentGold = "#eab308"; highlightBg = "rgba(202, 138, 4, 0.18)"; borderRadius = "14px";
      break;

    case "light_clean_pill":
      bg = "#f8fafc"; card = "#ffffff"; inputBg = "#f1f5f9"; text = "#0f172a"; subText = "#64748b"; border = "#cbd5e1"; accent = "#2563eb"; accentGold = "#1d4ed8"; highlightBg = "rgba(37, 99, 235, 0.08)"; borderRadius = "32px"; boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
      break;

    case "light_warm_sand":
      bg = "#fef3c7"; card = "#ffffff"; inputBg = "#fde68a"; text = "#451a03"; subText = "#78350f"; border = "#fcd34d"; accent = "#b45309"; accentGold = "#d97706"; highlightBg = "rgba(180, 83, 9, 0.1)"; borderRadius = "16px";
      break;

    case "light_nordic_slate":
      bg = "#f1f5f9"; card = "#ffffff"; inputBg = "#e2e8f0"; text = "#0f172a"; subText = "#475569"; border = "#cbd5e1"; accent = "#0284c7"; accentGold = "#0369a1"; highlightBg = "rgba(2, 132, 199, 0.1)"; borderRadius = "14px";
      break;

    case "light_rose_quartz":
      bg = "#fff1f2"; card = "#ffffff"; inputBg = "#ffe4e6"; text = "#881337"; subText = "#9f1239"; border = "#fecdd3"; accent = "#e11d48"; accentGold = "#be123c"; highlightBg = "rgba(225, 29, 72, 0.1)"; borderRadius = "18px";
      break;

    case "light_mint_breeze":
      bg = "#ecfdf5"; card = "#ffffff"; inputBg = "#d1fae5"; text = "#064e3b"; subText = "#047857"; border = "#a7f3d0"; accent = "#059669"; accentGold = "#047857"; highlightBg = "rgba(5, 150, 105, 0.1)"; borderRadius = "18px";
      break;

    /* 💎 تطبيق ثيم الصورة الأولى (Liquid Glass Kit) */
    case "pro_liquid_prism":
      bg = "#e8e3df";
      card = "rgba(255, 255, 255, 0.55)";
      inputBg = "rgba(255, 255, 255, 0.7)";
      text = "#18181b";
      subText = "#52525b";
      border = "rgba(255, 255, 255, 0.9)";
      accent = "#7c3aed";
      accentGold = "#7c3aed";
      highlightBg = "rgba(168, 85, 247, 0.15)";
      borderRadius = "30px";
      backdropFilter = "blur(30px) saturate(190%)";
      boxShadow = "0 25px 50px rgba(0,0,0,0.08), inset 0 2px 3px rgba(255,255,255,0.95), 0 0 25px rgba(168, 85, 247, 0.25)";
      buttonShadow = "0 10px 20px rgba(124, 58, 237, 0.35)";
      break;

    /* 💎 تطبيق ثيم الصورة الثانية (Liquid Dark Gel Capsules) */
    case "pro_dark_gel_capsules":
      bg = "#e5e5e7";
      card = "rgba(15, 15, 20, 0.88)";
      inputBg = "rgba(30, 30, 40, 0.9)";
      text = "#ffffff";
      subText = "#a1a1aa";
      border = "rgba(255, 255, 255, 0.4)";
      accent = "#38bdf8";
      accentGold = "#38bdf8";
      highlightBg = "rgba(56, 189, 248, 0.2)";
      borderRadius = "50px";
      backdropFilter = "blur(20px)";
      boxShadow = "0 20px 40px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.75), 0 12px 25px rgba(6, 182, 212, 0.4)";
      buttonShadow = "0 8px 20px rgba(56, 189, 248, 0.5)";
      break;

    /* 💎 تطبيق ثيم الصورة الثالثة (Imperial Gold Swatch #FFEB97 → #583714) */
    case "pro_royal_gold_swatch":
      bg = "linear-gradient(135deg, #2b1806 0%, #120902 100%)";
      card = "linear-gradient(180deg, rgba(88, 55, 20, 0.75) 0%, rgba(44, 27, 10, 0.9) 100%)";
      inputBg = "#1a0f07";
      text = "#ffffff";
      subText = "#fef08a";
      border = "#FFEB97";
      accent = "#FFEB97";
      accentGold = "#FFEB97";
      highlightBg = "rgba(255, 235, 151, 0.2)";
      borderRadius = "18px";
      backdropFilter = "blur(15px)";
      boxShadow = "0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 2px #FFEB97";
      buttonShadow = "0 6px 18px rgba(255, 235, 151, 0.4)";
      break;

    default:
      if (isLight) {
        bg = "#f1f5f9"; card = "#ffffff"; inputBg = "#f8fafc"; text = "#1e293b"; subText = "#64748b"; border = "#cbd5e1"; accent = "#0284c7"; accentGold = "#0369a1"; highlightBg = "rgba(2, 132, 199, 0.1)";
      }
      break;
  }

  return {
    id: themeId,
    isLight,
    bg,
    card,
    inputBg,
    text,
    subText,
    border,
    accent,
    accentGold,
    highlightBg,
    borderRadius,
    borderWidth,
    boxShadow,
    buttonShadow,
    inputShadow,
    backdropFilter,
    cardShadow: boxShadow
  };
}

export default {
  THEMES_LIST,
  THEME_CATEGORIES,
  getThemeStyles
};
