/**
 * =========================================================
 * 📌 الملف: شاشة الإعدادات الشاملة (Full Settings Screen)
 * 📁 المسار: src/components/SettingsScreen.jsx
 * 📝 الوظيفة: التحكم المباشر بالـ 15 لغة والـ 100 ثيم مع
 *            المعاينة الحية الفورية لأشكال الأزرار والكروت.
 * =========================================================
 */

import React, { useState } from "react";
import {
  Globe, Palette, Check, ArrowRight, ArrowLeft, Search, Sliders, Sparkles
} from "lucide-react";

export function SettingsScreen({
  currentLang,
  changeLang,
  currentThemeId,
  changeTheme,
  t,
  themeStyles,
  isRTL,
  LANGUAGES,
  THEMES_LIST,
  THEME_CATEGORIES,
  onBack
}) {
  const [activeTab, setActiveTab] = useState("themes"); // 'themes' | 'languages'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // فلترة الثيمات
  const filteredThemes = THEMES_LIST.filter((theme) => {
    const matchesCat = selectedCategory === "all" || theme.category === selectedCategory;
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: themeStyles.card, border: `1px solid ${themeStyles.border}`,
        borderRadius: themeStyles.cardRadius || 16, padding: "16px 24px", marginBottom: 24
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: "transparent", border: `1px solid ${themeStyles.border}`,
              color: themeStyles.text, padding: "8px 16px", borderRadius: 10,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 700
            }}
          >
            <BackIcon size={18} /> {t.back}
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: themeStyles.accentGold }}>
            {t.settings}
          </h2>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: 8, background: themeStyles.inputBg, padding: 4, borderRadius: 12 }}>
          <button
            onClick={() => setActiveTab("themes")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8,
              border: "none", background: activeTab === "themes" ? themeStyles.accentGold : "transparent",
              color: activeTab === "themes" ? "#fff" : themeStyles.text, fontWeight: 700, cursor: "pointer"
            }}
          >
            <Palette size={16} /> {t.appThemes} (100)
          </button>
          <button
            onClick={() => setActiveTab("languages")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8,
              border: "none", background: activeTab === "languages" ? themeStyles.accentGold : "transparent",
              color: activeTab === "languages" ? "#fff" : themeStyles.text, fontWeight: 700, cursor: "pointer"
            }}
          >
            <Globe size={16} /> {t.selectLang} (15)
          </button>
        </div>
      </div>

      {/* 1. قسم معرض اللغات الـ 15 */}
      {activeTab === "languages" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: isSelected ? "rgba(212, 175, 55, 0.15)" : themeStyles.card,
                  border: `2px solid ${isSelected ? themeStyles.accentGold : themeStyles.border}`,
                  borderRadius: 14, padding: "16px 20px", cursor: "pointer", textAlign: "start"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{lang.flag}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: themeStyles.text }}>{lang.name}</div>
                    <div style={{ fontSize: 12, color: themeStyles.subText }}>{lang.code.toUpperCase()} • {lang.dir.toUpperCase()}</div>
                  </div>
                </div>
                {isSelected && <Check size={20} color={themeStyles.accentGold} />}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. قسم معرض الثيمات الـ 100 */}
      {activeTab === "themes" && (
        <div>
          {/* Categories & Search */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {THEME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: `1px solid ${themeStyles.border}`,
                    background: selectedCategory === cat.id ? themeStyles.accentGold : themeStyles.card,
                    color: selectedCategory === cat.id ? "#fff" : themeStyles.text, fontWeight: 700, cursor: "pointer", fontSize: 13
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", width: 250 }}>
              <input
                type="text"
                placeholder="ابحث عن ثيم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "8px 36px 8px 12px", borderRadius: 10,
                  background: themeStyles.inputBg, border: `1px solid ${themeStyles.border}`,
                  color: themeStyles.text, fontWeight: 700, fontSize: 13
                }}
              />
              <Search size={16} style={{ position: "absolute", top: 10, right: 12, color: themeStyles.subText }} />
            </div>
          </div>

          {/* Grid of 100 Themes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filteredThemes.map((theme) => {
              const isActive = currentThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  style={{
                    background: theme.card,
                    border: `2px solid ${isActive ? theme.accentGold : theme.border}`,
                    borderRadius: theme.cardRadius || "14px",
                    boxShadow: theme.cardShadow || "none",
                    padding: 16, cursor: "pointer", transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{theme.name}</span>
                    {isActive && <Check size={18} color={theme.accentGold} />}
                  </div>

                  {/* Preview Elements */}
                  <div style={{ background: theme.bg, padding: 12, borderRadius: 10, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: theme.accentGold }} />
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: theme.accent }} />
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: theme.border }} />
                    </div>
                    <div style={{
                      padding: "6px 10px", background: theme.accentGold, color: "#fff",
                      borderRadius: theme.buttonRadius || "6px", fontSize: 11, fontWeight: 800, textAlign: "center"
                    }}>
                      معاينة زر الثيم
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
