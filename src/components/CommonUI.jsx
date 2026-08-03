import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";

// دالة مساعدة لضمان عرض الأرقام والمبالغ كأرقام صحيحة مجردة
const fmtCleanInt = (val) => {
  if (val === undefined || val === null || val === "") return "0";
  const num = Math.round(Number(val));
  return isNaN(num) ? String(val) : String(num);
};

export function DateInput({
  value,
  onChange,
  disabled,
  readOnly,
  required,
  placeholder,
  style,
  themeStyles,
  t = {},
  lang
}) {
  const isEN = lang === "en" || t?.lang === "en" || document.documentElement.lang === "en";
  const [focused, setFocused] = useState(false);

  const isDateType = Boolean(value) || focused;

  return (
    <input
      type={isDateType ? "date" : "text"}
      lang="en-US"
      value={value || ""}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.target.value) setFocused(false);
      }}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      dir="ltr"
      placeholder={placeholder || (isEN ? "YYYY-MM-DD" : "سنة - شهر - يوم")}
      style={{
        width: "100%",
        direction: "ltr",
        background: disabled
          ? (themeStyles ? themeStyles.inputBg : "#151515")
          : (themeStyles ? themeStyles.inputBg : "#1b1b1d"),
        border: `${themeStyles?.borderWidth || "1px"} solid ${themeStyles ? themeStyles.border : "#404040"}`,
        borderRadius: themeStyles?.borderRadius || 10,
        boxShadow: themeStyles?.inputShadow || "none",
        padding: "11px 14px",
        color: disabled ? "#888888" : (themeStyles ? themeStyles.text : "#ffffff"),
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 600,
        outline: "none",
        textAlign: "center",
        colorScheme: themeStyles?.isLight ? "light" : "dark",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        ...style
      }}
    />
  );
}

export function NameComboBox({
  items = [],
  getLabel,
  getSecondary,
  onSelect,
  placeholder,
  selectedLabel,
  onClear,
  styles = {},
  t = {}
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (selectedLabel) {
    return (
      <div style={styles.selectedChip || { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#2a2a2a", padding: "12px 14px", borderRadius: 10 }}>
        <span>{selectedLabel}</span>
        <button type="button" style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer" }} onClick={onClear}>
          <X size={14} />
        </button>
      </div>
    );
  }

  const safeItems = Array.isArray(items) ? items : [];
  const matches = text.trim()
    ? safeItems.filter((it) => getLabel(it).includes(text.trim())).slice(0, 8)
    : safeItems.slice(0, 8);

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <input
        style={styles.input || { width: "100%", padding: "12px 14px", borderRadius: 10, background: "#1b1b1d", color: "#fff", border: "1px solid #404040" }}
        value={text}
        placeholder={placeholder || t.searchPlaceholder || "ابحث بالاسم..."}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
      />
      {open && matches.length > 0 && (
        <div style={styles.suggestBox || { position: "absolute", top: "calc(100% + 4px)", right: 0, left: 0, background: "#1e1e1e", border: "1px solid #333", borderRadius: 10, zIndex: 30, maxHeight: 260, overflowY: "auto" }}>
          {matches.map((it, idx) => (
            <button
              type="button"
              key={idx}
              style={{ display: "flex", flexDirection: "column", width: "100%", textAlign: "right", background: "transparent", border: "none", borderBottom: "1px solid #333", padding: "12px 14px", cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => {
                onSelect(it);
                setText("");
                setOpen(false);
              }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 800, color: "#fff" }}>{getLabel(it)}</span>
              {getSecondary && <span style={{ fontSize: 12.5, color: "#aaa", marginTop: 4 }}>{getSecondary(it)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Field({ label, children, styles = {} }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={styles.fieldLabel || { fontSize: 13.5, color: "#aaa", fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}

export function ProfileRow({ label, value, themeStyles }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: "130px", color: themeStyles?.subText || "#aaa", fontSize: "14px", fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          flex: 1,
          background: themeStyles?.inputBg || "#1b1b1d",
          border: `${themeStyles?.borderWidth || "1px"} solid ${themeStyles?.border || "#404040"}`,
          borderRadius: themeStyles?.borderRadius || "10px",
          boxShadow: themeStyles?.inputShadow || "none",
          padding: "12px 16px",
          color: themeStyles?.text || "#fff",
          fontSize: "15px",
          fontWeight: 800,
          transition: "all 0.25s ease"
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function LiveStat({ label, value, themeStyles }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: themeStyles?.accentGold || "#d4af37", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: themeStyles?.subText || "#aaa", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export function ScreenHeader({ title, onBack, styles = {}, t = {} }) {
  const backText = t.back || "رجوع";
  return (
    <div style={styles.subHeader || { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <button style={styles.backBtn || { display: "flex", alignItems: "center", gap: 6, background: "#1e1e1e", border: "1px solid #333", color: "#d4af37", padding: "9px 16px", borderRadius: 10, cursor: "pointer" }} onClick={onBack} title={backText}>
        <ArrowRight size={16} /> {backText}
      </button>
      <div style={styles.subTitle || { fontSize: 19, fontWeight: 800, color: "#d4af37" }}>{title}</div>
      <button type="button" style={styles.topCloseBtn || { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "#1e1e1e", border: "1px solid #333", cursor: "pointer", color: "#d4af37" }} onClick={onBack} title={backText}>
        <X size={18} />
      </button>
    </div>
  );
}

export function BottomExitButton({ onBack, styles = {}, t = {} }) {
  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #404040" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          width: "100%",
          background: "#1b1b1d",
          border: "1px solid #404040",
          color: "#e8cd9c",
          borderRadius: 12,
          padding: "13px 20px",
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: "inherit",
          transition: "all 0.25s ease"
        }}
      >
        <ArrowRight size={16} /> {t.exitBottom || "خروج والعودة للشاشة الرئيسية"}
      </button>
    </div>
  );
}

export function PlaceholderScreen({ title, note, onBack, t = {}, styles = {} }) {
  return (
    <div style={styles.container}>
      <ScreenHeader title={title} onBack={onBack} styles={styles} t={t} />
      <div style={styles.card}>
        <div style={styles.emptyState}>{note || t.underConstruction || "شاشة تحت التجهيز النهائي"}</div>
        <BottomExitButton onBack={onBack} styles={styles} t={t} />
      </div>
    </div>
  );
}

export function KPI({ icon: Icon, label, sub, value, styles = {}, themeStyles = {}, t = {} }) {
  return (
    <div style={styles.kpiCard || { background: "#1e1e1e", padding: 20, borderRadius: 16, border: "1px solid #333" }}>
      <div style={{ marginBottom: 10 }}>
        {Icon && <Icon size={26} color={themeStyles?.accentGold || "#d4af37"} />}
      </div>
      <div style={styles.kpiValue || { fontSize: 24, fontWeight: 800 }}>
        {typeof value === "number" ? fmtCleanInt(value) : value}{" "}
        <span style={{ fontSize: 13, color: themeStyles?.subText || "#aaa", fontWeight: 500 }}>
          {t.currency || "ج.م"}
        </span>
      </div>
      <div style={styles.kpiLabel || { fontSize: 13.5, color: "#d4af37", fontWeight: 700, marginTop: 8 }}>{label}</div>
      <div style={styles.kpiSub || { fontSize: 11.5, color: "#aaa", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

export function DashButton({ label, Icon, tone, themeStyles = {}, onClick }) {
  const TONES = {
    gold: { background: `linear-gradient(135deg, ${themeStyles.accentGold || "#d4af37"} 0%, ${themeStyles.accent || "#c5a028"} 100%)`, color: "#111111" },
    dark: { background: `linear-gradient(135deg, ${themeStyles.card || "#1e1e1e"} 0%, ${themeStyles.inputBg || "#252525"} 100%)`, color: themeStyles.accentGold || "#d4af37", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.border || "#333"}` },
    copper: { background: "linear-gradient(135deg, #d69a5f 0%, #b06a35 55%, #7a4a1f 100%)", color: "#ffffff" },
    silver: { background: "linear-gradient(135deg, #e8e8e8 0%, #b9b9b9 55%, #8a8a8a 100%)", color: "#111111" },
    rose: { background: "linear-gradient(135deg, #c97a6d 0%, #9c4a3d 55%, #6e2f26 100%)", color: "#ffffff" },
    roseLight: { background: "linear-gradient(135deg, #d99b8c 0%, #b96f5f 55%, #8a4a3c 100%)", color: "#ffffff" },
    roseDark: { background: "linear-gradient(135deg, #b06f63 0%, #7a3a30 55%, #4a221c 100%)", color: "#ffffff" },
    tan: { background: `linear-gradient(135deg, ${themeStyles.highlightBg || "#2a2a2a"} 0%, ${themeStyles.card || "#1e1e1e"} 100%)`, color: themeStyles.accentGold || "#d4af37", border: `${themeStyles.borderWidth || "1px"} solid ${themeStyles.accent || "#c5a028"}` },
  };
  const currentTone = TONES[tone] || TONES.gold;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: currentTone.border || "none",
        borderRadius: themeStyles.borderRadius || 14,
        padding: "18px 20px",
        cursor: "pointer",
        fontFamily: "inherit",
        minHeight: 64,
        transition: "all 0.25s ease",
        ...currentTone
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 800 }}>{label}</span>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {Icon && <Icon size={20} />}
      </span>
    </button>
  );
}

export default {
  DateInput,
  NameComboBox,
  Field,
  ProfileRow,
  LiveStat,
  ScreenHeader,
  BottomExitButton,
  PlaceholderScreen,
  KPI,
  DashButton
};
