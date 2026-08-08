import { useState, useMemo, useEffect } from "react";
import { THEMES_LIST, THEME_CATEGORIES, getThemeStyles } from "../config/themes";
import { LANGUAGES } from "../config/languages";

export function useThemeAndLang() {
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("egymod_lang") || "ar");
  const [currentThemeId, setCurrentThemeId] = useState(() => localStorage.getItem("egymod_theme") || "royalGold");

  const changeLang = (code) => {
    setCurrentLang(code);
    localStorage.setItem("egymod_lang", code);
  };

  const changeTheme = (themeId) => {
    const id = typeof themeId === "object" ? themeId.id : themeId;
    setCurrentThemeId(id);
    localStorage.setItem("egymod_theme", id);
  };

  const themeStyles = useMemo(() => {
    return getThemeStyles(currentThemeId);
  }, [currentThemeId]);

  const t = useMemo(() => {
    return LANGUAGES.find((l) => l.code === currentLang)?.translations || {};
  }, [currentLang]);

  const isRTL = currentLang === "ar";

  return {
    currentLang,
    changeLang,
    currentThemeId,
    changeTheme,
    t,
    themeStyles,
    isRTL,
    LANGUAGES,
    THEMES_LIST,
    THEME_CATEGORIES
  };
}
