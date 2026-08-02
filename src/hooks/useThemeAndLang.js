/**
 * =========================================================
 * 📌 الملف: هك التحكم بالمظهر واللغة (Theme & Lang Controller)
 * 📁 المسار: src/hooks/useThemeAndLang.js
 * 📝 الوظيفة: إدارة حفظ الثيم واللغة والاتجاه (RTL/LTR)
 *            في LocalStorage وتزويد التطبيق بالقيم المحدثة.
 * =========================================================
 */

import { useState, useEffect, useMemo } from "react";
import { LANGUAGES, TRANSLATIONS } from "../config/languages";
import { THEMES_LIST, THEME_CATEGORIES } from "../config/themes";

export function useThemeAndLang() {
  // 1. إدارة اللغة
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem("egymod_lang") || "ar";
  });

  // 2. إدارة الثيم
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem("egymod_theme") || "royal_1";
  });

  // حفظ وحسب البيانات
  const langObj = useMemo(() => {
    return LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  }, [currentLang]);

  const t = useMemo(() => {
    return TRANSLATIONS[currentLang] || TRANSLATIONS.ar;
  }, [currentLang]);

  const themeStyles = useMemo(() => {
    return THEMES_LIST.find((t) => t.id === currentThemeId) || THEMES_LIST[0];
  }, [currentThemeId]);

  // تطبيق الاتجاه RTL / LTR تلقائياً في المستند
  useEffect(() => {
    localStorage.setItem("egymod_lang", currentLang);
    document.documentElement.dir = langObj.dir;
    document.documentElement.lang = currentLang;
  }, [currentLang, langObj]);

  useEffect(() => {
    localStorage.setItem("egymod_theme", currentThemeId);
  }, [currentThemeId]);

  const changeLang = (code) => setCurrentLang(code);
  const changeTheme = (themeId) => setCurrentThemeId(themeId);

  return {
    currentLang,
    changeLang,
    currentThemeId,
    changeTheme,
    t,
    themeStyles,
    isRTL: langObj.dir === "rtl",
    LANGUAGES,
    THEMES_LIST,
    THEME_CATEGORIES
  };
}
