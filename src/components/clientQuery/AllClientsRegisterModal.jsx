<<<<<<< SEARCH
  const isEN = t?.currency === "EGP";
=======
  const isEN = t?.currency === "EGP" || document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
>>>>>>> REPLACE

<<<<<<< SEARCH
          <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "4px" }}>إيجيمود لإدارة الأقساط</div>
          <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginBottom: "14px" }}>سجل بيانات العملاء الشامل — عدد الأقساط ({filteredList.length})</div>
=======
          <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.accentGold || "#e8cd9c", marginBottom: "4px" }}>
            {t.appName || (isEN ? "Egymod Installment Management" : "إيجيمود لإدارة الأقساط")}
          </div>
          <div style={{ fontSize: "12px", color: themeStyles.subText || "#aaaaaa", marginBottom: "14px" }}>
            {t.allClientsRegisterSubHeader || (isEN ? `Comprehensive Client Register — Contracts Count (${filteredList.length})` : `سجل بيانات العملاء الشامل — عدد الأقساط (${filteredList.length})`)}
          </div>
>>>>>>> REPLACE

<<<<<<< SEARCH
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>سعر البيع *</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.text || "#ffffff", marginTop: "4px" }}>{totals.totalSale} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
            </div>
            <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: "#4caf50" }}>إجمالي المحصل</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>{totals.totalPaid} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
            </div>
            <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: "#e07a5f" }}>إجمالي الأقساط المتبقية</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#e07a5f", marginTop: "4px" }}>{totals.totalRemaining} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
            </div>
          </div>
=======
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: themeStyles.subText || "#888888" }}>
                {t.salePriceLabel || (isEN ? "Total Sale Price" : "سعر البيع *")}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: themeStyles.text || "#ffffff", marginTop: "4px" }}>{totals.totalSale} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
            </div>
            <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: "#4caf50" }}>
                {t.totalCollectedLabel || (isEN ? "Total Collected" : "إجمالي المحصل")}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#4caf50", marginTop: "4px" }}>{totals.totalPaid} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
            </div>
            <div style={{ background: themeStyles.card || "#1e1e20", padding: "10px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", color: "#e07a5f" }}>
                {t.remainingInstallmentsLabel || (isEN ? "Total Remaining" : "إجمالي الأقساط المتبقية")}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#e07a5f", marginTop: "4px" }}>{totals.totalRemaining} {t.currency || (isEN ? "EGP" : "ج.م")}</div>
            </div>
          </div>
>>>>>>> REPLACE

<<<<<<< SEARCH
              <tr style={{ background: themeStyles.inputBg || "#121214", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                <th style={{ padding: "10px" }}>ID #</th>
                <th style={{ padding: "10px" }}>اسم العميل *</th>
                <th style={{ padding: "10px" }}>تليفون العميل *</th>
                <th style={{ padding: "10px" }}>اسم الضامن</th>
                <th style={{ padding: "10px" }}>تليفون الضامن</th>
                <th style={{ padding: "10px" }}>السلعة *</th>
                <th style={{ padding: "10px" }}>سعر التكلفة *</th>
                <th style={{ padding: "10px" }}>سعر البيع *</th>
                <th style={{ padding: "10px" }}>المقدم *</th>
                <th style={{ padding: "10px" }}>القسط الشهري</th>
              </tr>
=======
              <tr style={{ background: themeStyles.inputBg || "#121214", color: themeStyles.accentGold || "#e8cd9c", borderBottom: `1px solid ${themeStyles.border || "#333333"}` }}>
                <th style={{ padding: "10px" }}>ID #</th>
                <th style={{ padding: "10px" }}>{t.clientNameLabel || (isEN ? "Client Name *" : "اسم العميل *")}</th>
                <th style={{ padding: "10px" }}>{t.clientPhoneLabel || (isEN ? "Client Phone *" : "تليفون العميل *")}</th>
                <th style={{ padding: "10px" }}>{t.guarantorNameLabel || (isEN ? "Guarantor Name" : "اسم الضامن")}</th>
                <th style={{ padding: "10px" }}>{t.guarantorPhoneLabel || (isEN ? "Guarantor Phone" : "تليفون الضامن")}</th>
                <th style={{ padding: "10px" }}>{t.itemLabel || (isEN ? "Item *" : "السلعة *")}</th>
                <th style={{ padding: "10px" }}>{t.costPriceLabel || (isEN ? "Cost Price *" : "سعر التكلفة *")}</th>
                <th style={{ padding: "10px" }}>{t.salePriceLabel || (isEN ? "Sale Price *" : "سعر البيع *")}</th>
                <th style={{ padding: "10px" }}>{t.downPaymentLabel || (isEN ? "Down Payment *" : "المقدم *")}</th>
                <th style={{ padding: "10px" }}>{t.monthlyInstallmentLabel || (isEN ? "Monthly Installment" : "القسط الشهري")}</th>
              </tr>
>>>>>>> REPLACE
