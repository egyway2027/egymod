/**
 * =========================================================
 * 📌 الملف: هوك اكتشاف شاشة الموبايل (useIsMobile)
 * 📁 المسار: src/hooks/useIsMobile.js
 * 📝 الوظيفة: نفس فكرة isMobile الموجودة في App.jsx بالظبط،
 *            لكن كهوك مشترك ممكن أي كومبوننت يستخدمه بدل ما
 *            كل شاشة تعمل نسختها الخاصة من نفس الكود.
 *            استخدمه في أي شاشة عايز تفرق فيها شكل الموبايل
 *            عن شكل اللاب:
 *
 *              const isMobile = useIsMobile();
 * =========================================================
 */

import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
