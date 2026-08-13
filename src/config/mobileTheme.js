/**
 * =========================================================
 * 📌 الملف: توكنز شكل الموبايل (Mobile Theme Tokens)
 * 📁 المسار: src/config/mobileTheme.js
 * 📝 الوظيفة: مكان واحد بس تتحكم منه في مقاسات الموبايل
 *            (المسافات - أحجام الخط - حجم الأيقونات - الراديوس)
 *            من غير ما تلمس شكل نسخة اللاب توب خالص.
 *
 * 🛠️ إزاي تستخدمه جوا أي شاشة:
 *
 *   import { useIsMobile } from "../hooks/useIsMobile";
 *   import { M } from "../config/mobileTheme";
 *
 *   const isMobile = useIsMobile();
 *   ...
 *   <div style={{ padding: isMobile ? M.spacing.md : 20 }}>
 *
 * غيّر أي رقم هنا وهيتطبق فورًا على كل شاشة بتستخدم M.*
 * =========================================================
 */

export const M = {
  // مسافات (padding / margin / gap)
  spacing: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
  },

  // أحجام الخطوط
  font: {
    xs: 9,
    sm: 11,
    base: 12,
    md: 13,
    lg: 15,
    title: 18,
  },

  // أحجام الأيقونات
  icon: {
    sm: 16,
    md: 18,
    lg: 22,
  },

  // راديوس الكروت والأزرار
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
  },

  // ارتفاع مربع اللمس الأدنى (عشان الأصابع، مش أقل من كده)
  touchTarget: 40,

  // شبكة الكروت في الموبايل (عدد الأعمدة)
  gridColumns: 2,
};

/**
 * دالة صغيرة تساعدك تختار قيمة حسب نوع الشاشة من غير
 * ما تكتب isMobile ? x : y في كل سطر.
 *
 *   pick(isMobile, M.spacing.md, 20)
 */
export function pick(isMobile, mobileValue, desktopValue) {
  return isMobile ? mobileValue : desktopValue;
}
