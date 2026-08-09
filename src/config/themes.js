/**
 * =========================================================
 * 📌 الملف: قاعدة الثيمات المتقدمة (30 Handcrafted Themes)
 * 📁 المسار: src/config/themes.js
 * =========================================================
 */

export const THEME_CATEGORIES = [
  { id: "all", name: "جميع الثيمات العادية (30)" },
  { id: "pro", name: "ثيمات Pro الاحترافية 💎 (20)" },
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

  /* 💎 ثيمات Pro الـ 20 المتقدمة المستخرجة من التصاميم */
  { id: "pro_walnut_noir", name: "Walnut Noir Glass Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #2E1F1B, #5E4B43)", card: "rgba(46, 31, 27, 0.75)", accentGold: "#e2b887" },
  { id: "pro_navy_mirage", name: "Navy Mirage Glass Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #141E30, #35577D)", card: "rgba(20, 30, 48, 0.75)", accentGold: "#38bdf8" },
  { id: "pro_liquid_prism", name: "Liquid Prism UI Pro", category: "pro", isPro: true, bg: "#0d0f17", card: "rgba(255, 255, 255, 0.08)", accentGold: "#a855f7" },
  { id: "pro_cyber_neon", name: "Cyber Neon Glass Pro", category: "pro", isPro: true, bg: "#0a0c14", card: "rgba(15, 23, 42, 0.8)", accentGold: "#38bdf8" },
  { id: "pro_ice_blue", name: "Ice Blue Glass Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #0284c7, #0369a1)", card: "rgba(255, 255, 255, 0.2)", accentGold: "#7dd3fc" },
  { id: "pro_mint_coral", name: "Soft Mint & Coral Pro", category: "pro", isPro: true, bg: "#fbf8f5", card: "#ffffff", accentGold: "#10b981" },
  { id: "pro_midnight_gold", name: "Midnight Gold Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #1A1A1A, #2A2421)", card: "rgba(26, 26, 26, 0.85)", accentGold: "#d4af37" },
  { id: "pro_amber_bronze", name: "Warm Amber & Bronze Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #583714, #2c1b0c)", card: "rgba(88, 55, 20, 0.5)", accentGold: "#FFEB97" },
  { id: "pro_frosted_minimal", name: "Frosted Minimal Glass Pro", category: "pro", isPro: true, bg: "#e2e8f0", card: "rgba(255, 255, 255, 0.65)", accentGold: "#0284c7" },
  { id: "pro_dark_rose", name: "Dark Rose Velvet Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #180b0e, #3a151b)", card: "rgba(58, 21, 27, 0.65)", accentGold: "#e11d48" },
  { id: "pro_pastel_3d", name: "Pastel Glass 3D Pro", category: "pro", isPro: true, bg: "#f1f5f9", card: "rgba(255, 255, 255, 0.8)", accentGold: "#8b5cf6" },
  { id: "pro_pearl_cream", name: "3D Pearl & Cream Pro", category: "pro", isPro: true, bg: "#f3ede7", card: "#ffffff", accentGold: "#d97706" },
  { id: "pro_frosted_silver", name: "Frosted Silver Dashboard Pro", category: "pro", isPro: true, bg: "#f8fafc", card: "rgba(255, 255, 255, 0.7)", accentGold: "#475569" },
  { id: "pro_royal_gold_swatch", name: "Royal Gold Swatch Pro", category: "pro", isPro: true, bg: "linear-gradient(135deg, #FFEB97, #583714)", card: "rgba(40, 24, 8, 0.85)", accentGold: "#FFEB97" },
  { id: "pro_holo_analytics", name: "Holographic Analytics Pro", category: "pro", isPro: true, bg: "#0f172a", card: "rgba(30, 41, 59, 0.6)", accentGold: "#38bdf8" },
  { id: "pro_dark_liquid", name: "Dark Liquid Glass Pro", category: "pro", isPro: true, bg: "#09090b", card: "rgba(24, 24, 27, 0.8)", accentGold: "#e4e4e7" },
  { id: "pro_floating_glass", name: "Floating Glass Shadow Pro", category: "pro", isPro: true, bg: "#18181b", card: "rgba(39, 39, 42, 0.7)", accentGold: "#3b82f6" },
  { id: "pro_prismatic_gloss", name: "Prismatic Gloss UI Pro", category: "pro", isPro: true, bg: "#020617", card: "rgba(15, 23, 42, 0.75)", accentGold: "#ec4899" },
  { id: "pro_clean_teal", name: "Clean Teal Health Pro", category: "pro", isPro: true, bg: "#f0fdfa", card: "#ffffff", accentGold: "#0d9488" },
  { id: "pro_dual_glass", name: "Dual Glass Contrast Pro", category: "pro", isPro: true, bg: "#0f172a", card: "rgba(30, 41, 59, 0.8)", accentGold: "#f59e0b" }
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

    /* 💎 حالات ثيمات Pro الـ 20 المتقدمة */
    case "pro_walnut_noir":
      bg = "linear-gradient(135deg, #2E1F1B 0%, #5E4B43 100%)"; card = "rgba(46, 31, 27, 0.75)"; inputBg = "#1f1412"; text = "#ffffff"; subText = "#d1c7bd"; border = "rgba(94, 75, 67, 0.5)"; accent = "#e2b887"; accentGold = "#e2b887"; highlightBg = "rgba(226, 184, 135, 0.15)"; borderRadius = "18px"; boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
      break;
    case "pro_navy_mirage":
      bg = "linear-gradient(135deg, #141E30 0%, #35577D 100%)"; card = "rgba(20, 30, 48, 0.75)"; inputBg = "#0f172a"; text = "#ffffff"; subText = "#a0aec0"; border = "rgba(53, 87, 125, 0.5)"; accent = "#38bdf8"; accentGold = "#38bdf8"; highlightBg = "rgba(56, 189, 248, 0.15)"; borderRadius = "18px"; boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
      break;
    case "pro_liquid_prism":
      bg = "#0d0f17"; card = "rgba(255, 255, 255, 0.08)"; inputBg = "rgba(255, 255, 255, 0.05)"; text = "#ffffff"; subText = "#94a3b8"; border = "rgba(255, 255, 255, 0.3)"; accent = "#a855f7"; accentGold = "#a855f7"; highlightBg = "rgba(168, 85, 247, 0.2)"; borderRadius = "24px"; boxShadow = "0 8px 32px rgba(168, 85, 247, 0.25)";
      break;
    case "pro_cyber_neon":
      bg = "#0a0c14"; card = "rgba(15, 23, 42, 0.8)"; inputBg = "#020617"; text = "#f8fafc"; subText = "#64748b"; border = "#38bdf8"; accent = "#38bdf8"; accentGold = "#38bdf8"; highlightBg = "rgba(56, 189, 248, 0.2)"; borderRadius = "16px"; borderWidth = "1.5px"; boxShadow = "0 0 20px rgba(56, 189, 248, 0.35)";
      break;
    case "pro_ice_blue":
      bg = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"; card = "rgba(255, 255, 255, 0.2)"; inputBg = "rgba(0, 0, 0, 0.2)"; text = "#ffffff"; subText = "#e0f2fe"; border = "rgba(255, 255, 255, 0.5)"; accent = "#7dd3fc"; accentGold = "#7dd3fc"; highlightBg = "rgba(125, 211, 252, 0.2)"; borderRadius = "20px";
      break;
    case "pro_mint_coral":
      bg = "#fbf8f5"; card = "#ffffff"; inputBg = "#f1f5f9"; text = "#1e293b"; subText = "#64748b"; border = "rgba(249, 115, 22, 0.2)"; accent = "#10b981"; accentGold = "#10b981"; highlightBg = "rgba(16, 185, 129, 0.12)"; borderRadius = "18px";
      break;
    case "pro_midnight_gold":
      bg = "linear-gradient(135deg, #1A1A1A 0%, #2A2421 100%)"; card = "rgba(26, 26, 26, 0.85)"; inputBg = "#121212"; text = "#ffffff"; subText = "#a1a1aa"; border = "#5E4B43"; accent = "#d4af37"; accentGold = "#d4af37"; highlightBg = "rgba(212, 175, 55, 0.15)"; borderRadius = "16px";
      break;
    case "pro_amber_bronze":
      bg = "linear-gradient(135deg, #583714 0%, #2c1b0c 100%)"; card = "rgba(88, 55, 20, 0.5)"; inputBg = "#1a0f07"; text = "#ffffff"; subText = "#fef08a"; border = "rgba(255, 235, 151, 0.4)"; accent = "#FFEB97"; accentGold = "#FFEB97"; highlightBg = "rgba(255, 235, 151, 0.2)"; borderRadius = "18px";
      break;
    case "pro_frosted_minimal":
      bg = "#e2e8f0"; card = "rgba(255, 255, 255, 0.65)"; inputBg = "#ffffff"; text = "#0f172a"; subText = "#475569"; border = "rgba(255, 255, 255, 0.8)"; accent = "#0284c7"; accentGold = "#0284c7"; highlightBg = "rgba(2, 132, 199, 0.1)"; borderRadius = "22px"; boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
      break;
    case "pro_dark_rose":
      bg = "linear-gradient(135deg, #180b0e 0%, #3a151b 100%)"; card = "rgba(58, 21, 27, 0.65)"; inputBg = "#110709"; text = "#ffffff"; subText = "#fecdd3"; border = "rgba(225, 29, 72, 0.3)"; accent = "#e11d48"; accentGold = "#e11d48"; highlightBg = "rgba(225, 29, 72, 0.2)"; borderRadius = "20px";
      break;
    case "pro_pastel_3d":
      bg = "#f1f5f9"; card = "rgba(255, 255, 255, 0.8)"; inputBg = "#ffffff"; text = "#1e293b"; subText = "#64748b"; border = "rgba(139, 92, 246, 0.3)"; accent = "#8b5cf6"; accentGold = "#8b5cf6"; highlightBg = "rgba(139, 92, 246, 0.1)"; borderRadius = "20px";
      break;
    case "pro_pearl_cream":
      bg = "#f3ede7"; card = "#ffffff"; inputBg = "#fafaf9"; text = "#292524"; subText = "#78716c"; border = "rgba(217, 119, 6, 0.2)"; accent = "#d97706"; accentGold = "#d97706"; highlightBg = "rgba(217, 119, 6, 0.1)"; borderRadius = "18px";
      break;
    case "pro_frosted_silver":
      bg = "#f8fafc"; card = "rgba(255, 255, 255, 0.7)"; inputBg = "#ffffff"; text = "#0f172a"; subText = "#64748b"; border = "rgba(203, 213, 225, 0.8)"; accent = "#475569"; accentGold = "#475569"; highlightBg = "rgba(71, 85, 105, 0.1)"; borderRadius = "20px";
      break;
    case "pro_royal_gold_swatch":
      bg = "linear-gradient(135deg, #FFEB97 0%, #583714 100%)"; card = "rgba(40, 24, 8, 0.85)"; inputBg = "#1a0f07"; text = "#ffffff"; subText = "#fef08a"; border = "#FFEB97"; accent = "#FFEB97"; accentGold = "#FFEB97"; highlightBg = "rgba(255, 235, 151, 0.2)"; borderRadius = "18px";
      break;
    case "pro_holo_analytics":
      bg = "#0f172a"; card = "rgba(30, 41, 59, 0.6)"; inputBg = "#020617"; text = "#f8fafc"; subText = "#94a3b8"; border = "rgba(56, 189, 248, 0.4)"; accent = "#38bdf8"; accentGold = "#38bdf8"; highlightBg = "rgba(56, 189, 248, 0.18)"; borderRadius = "22px";
      break;
    case "pro_dark_liquid":
      bg = "#09090b"; card = "rgba(24, 24, 27, 0.8)"; inputBg = "#18181b"; text = "#fafafa"; subText = "#a1a1aa"; border = "rgba(255, 255, 255, 0.2)"; accent = "#e4e4e7"; accentGold = "#e4e4e7"; highlightBg = "rgba(228, 228, 231, 0.15)"; borderRadius = "20px";
      break;
    case "pro_floating_glass":
      bg = "#18181b"; card = "rgba(39, 39, 42, 0.7)"; inputBg = "#09090b"; text = "#ffffff"; subText = "#a1a1aa"; border = "rgba(255, 255, 255, 0.15)"; accent = "#3b82f6"; accentGold = "#3b82f6"; highlightBg = "rgba(59, 130, 246, 0.18)"; borderRadius = "22px";
      break;
    case "pro_prismatic_gloss":
      bg = "#020617"; card = "rgba(15, 23, 42, 0.75)"; inputBg = "#0f172a"; text = "#ffffff"; subText = "#94a3b8"; border = "rgba(236, 72, 153, 0.4)"; accent = "#ec4899"; accentGold = "#ec4899"; highlightBg = "rgba(236, 72, 153, 0.2)"; borderRadius = "20px";
      break;
    case "pro_clean_teal":
      bg = "#f0fdfa"; card = "#ffffff"; inputBg = "#ccfbf1"; text = "#134e4a"; subText = "#0d9488"; border = "rgba(13, 148, 136, 0.2)"; accent = "#0d9488"; accentGold = "#0d9488"; highlightBg = "rgba(13, 148, 136, 0.1)"; borderRadius = "18px";
      break;
    case "pro_dual_glass":
      bg = "#0f172a"; card = "rgba(30, 41, 59, 0.8)"; inputBg = "#020617"; text = "#ffffff"; subText = "#94a3b8"; border = "rgba(245, 158, 11, 0.3)"; accent = "#f59e0b"; accentGold = "#f59e0b"; highlightBg = "rgba(245, 158, 11, 0.18)"; borderRadius = "18px";
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
    inputShadow
  };
}

export default {
  THEMES_LIST,
  THEME_CATEGORIES,
  getThemeStyles
};
