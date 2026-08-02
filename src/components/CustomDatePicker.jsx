/**
 * =========================================================
 * 📌 المكون: التقويم المخصص (Custom DatePicker Component)
 * 📁 المسار: src/components/CustomDatePicker.jsx
 * 📝 الوظيفة: نافذة تقويم منبثقة مستقلة تدعم اللغتين العربية والإنجليزي
 *            وتعمل مع كافة ثيمات النظام دون الاعتماد على تقويم المتصفح.
 * =========================================================
 */
import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, X } from "lucide-react";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CustomDatePicker({
  value = "",
  onChange,
  isEN = false,
  placeholder = "",
  disabled = false,
  required = false,
  themeStyles = {},
  inputStyle = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setViewDate(d);
    }
  }, [value]);

  // إغلاق التقويم عند النقر خارجه
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day) => {
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const selected = `${year}-${mStr}-${dStr}`;
    if (onChange) {
      onChange({ target: { value: selected } });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { value: "" } });
    }
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const selected = `${y}-${m}-${d}`;
    if (onChange) {
      onChange({ target: { value: selected } });
    }
    setIsOpen(false);
  };

  const monthsList = isEN ? MONTHS_EN : MONTHS_AR;
  const daysList = isEN ? DAYS_EN : DAYS_AR;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }} dir={isEN ? "ltr" : "rtl"}>
      {/* Input Display Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none"
        }}
      >
        <span style={{ direction: "ltr", textAlign: "center", width: "100%", opacity: value ? 1 : 0.6 }}>
          {value || placeholder || (isEN ? "YYYY-MM-DD" : "سنة - شهر - يوم")}
        </span>
        <CalendarIcon size={16} style={{ color: themeStyles.accentGold || "#e07a5f", flexShrink: 0 }} />
      </div>

      {/* POPUP CALENDAR */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "290px",
            background: themeStyles.card || "#1e1e1e",
            border: `1px solid ${themeStyles.border || "#333333"}`,
            borderRadius: themeStyles.borderRadius || "12px",
            padding: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            color: themeStyles.text || "#ffffff",
            fontFamily: "inherit"
          }}
        >
          {/* Header Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={isEN ? handlePrevMonth : handleNextMonth}
              style={{ background: "none", border: "none", color: themeStyles.subText || "#aaa", cursor: "pointer", padding: "4px" }}
            >
              <ChevronRight size={18} />
            </button>

            <span style={{ fontWeight: 800, fontSize: "14px", color: themeStyles.accentGold || "#e8cd9c" }}>
              {monthsList[month]} {year}
            </span>

            <button
              type="button"
              onClick={isEN ? handleNextMonth : handlePrevMonth}
              style={{ background: "none", border: "none", color: themeStyles.subText || "#aaa", cursor: "pointer", padding: "4px" }}
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Days Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "6px" }}>
            {daysList.map((d, i) => (
              <span key={i} style={{ fontSize: "11px", fontWeight: 700, color: themeStyles.subText || "#888888" }}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIdx }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const mStr = String(month + 1).padStart(2, "0");
              const dStr = String(dayNum).padStart(2, "0");
              const currentStr = `${year}-${mStr}-${dStr}`;
              const isSelected = value === currentStr;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    background: isSelected ? (themeStyles.accentGold || "#e07a5f") : "transparent",
                    color: isSelected ? "#111111" : (themeStyles.text || "#ffffff"),
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 0",
                    fontSize: "12px",
                    fontWeight: isSelected ? 800 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "8px", borderTop: `1px solid ${themeStyles.border || "#333333"}` }}>
            <button
              type="button"
              onClick={handleClear}
              style={{ background: "none", border: "none", color: "#e07a5f", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              {isEN ? "Clear" : "مسح"}
            </button>
            <button
              type="button"
              onClick={handleToday}
              style={{ background: "none", border: "none", color: themeStyles.accentGold || "#e8cd9c", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
              {isEN ? "Today" : "اليوم"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDatePicker;
