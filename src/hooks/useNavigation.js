/**
 * =========================================================
 * 📌 الملف: هك إدارة التنقل وحفظ الشاشة (Navigation Hook)
 * 📁 المسار: src/hooks/useNavigation.js
 * 📝 الوظيفة: حفظ الشاشة الحالية في URL Hash و LocalStorage
 *            واسترجاعها فوراً عند عمل Refresh لمنع العودة للرئيسية.
 * =========================================================
 */

import { useState, useEffect } from "react";

export function useNavigation(defaultScreen = "dashboard") {
  // جلب الشاشة الأخيرة المخزنة في المتصفح أو العنوان
  const getInitialScreen = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) return hash;
    const savedScreen = localStorage.getItem("egymod_current_screen");
    return savedScreen || defaultScreen;
  };

  const [currentScreen, setCurrentScreen] = useState(getInitialScreen);

  useEffect(() => {
    // حفظ اسم الشاشة في LocalStorage والعنوان فور تغيرها
    localStorage.setItem("egymod_current_screen", currentScreen);
    window.location.hash = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    // الاستجابة لأسهم الرجوع والتنقل الخاصة بالمتصفح
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setCurrentScreen(hash);
      } else {
        setCurrentScreen(defaultScreen);
      }
    };

    window.addEventListener("popstate", handleHashChange);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handleHashChange);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [defaultScreen]);

  const navigateTo = (screenName) => {
    setCurrentScreen(screenName);
    window.location.hash = screenName;
  };

  const handleBack = () => {
    navigateTo(defaultScreen);
  };

  return { currentScreen, navigateTo, handleBack };
}
