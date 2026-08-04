
import React, { useState } from "react";

import React, { useState, useMemo } from "react";



  const { clientsList, isLoading, handleSaveClient, handleUpdateContract } = useCloudData();

  const { clientsList, isLoading, handleSaveClient, handleUpdateContract } = useCloudData();

  // 📈 حساب صافي الأرباح ومستحقات الشهر ديناميكياً
  const netProfit = useMemo(() => {
    return (clientsList || []).reduce((acc, curr) => {
      const sale = Number(curr.sale) || 0;
      const cost = Number(curr.cost) || 0;
      const down = Number(curr.down) || 0;
      const totalPaid = Number(curr.totalPaid) || 0;
      if (sale <= 0) return acc;
      const profitRatio = (sale - cost) / sale;
      return acc + Math.round((down + totalPaid) * profitRatio);
    }, 0);
  }, [clientsList]);

  const monthlyDues = useMemo(() => {
    return (clientsList || []).reduce((acc, curr) => {
      const remaining = Number(curr.remainingAmount ?? curr.remaining) || 0;
      const monthly = Number(curr.monthly) || 0;
      if (remaining <= 0 || monthly <= 0) return acc;
      return acc + Math.min(monthly, remaining);
    }, 0);
  }, [clientsList]);
REPLACE <<<<<<<

SEARCH >>>>>>>
              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
                  <TrendingUp size={24} color={themeStyles.accentGold} />
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>0 {t.currency}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.netProfit}</div>
                  <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.netProfitSub}</div>
                </div>

                <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
                  <CalendarClock size={24} color={themeStyles.accentGold} />
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>0 {t.currency}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.monthlyDues}</div>
                  <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.monthlyDuesSub}</div>
                </div>

                <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
                  <Wallet size={24} color={themeStyles.accentGold} />
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
                    {clientsList.reduce((acc, curr) => acc + (Number(curr.remainingAmount ?? curr.remaining) || 0), 0)} {t.currency}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.totalPortfolio}</div>
                  <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.totalPortfolioSub}</div>
                </div>
              </section>
=======
              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
                <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
                  <TrendingUp size={24} color={themeStyles.accentGold} />
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
                    {netProfit.toLocaleString()} {t.currency}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.netProfit}</div>
                  <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.netProfitSub}</div>
                </div>

                <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
                  <CalendarClock size={24} color={themeStyles.accentGold} />
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
                    {monthlyDues.toLocaleString()} {t.currency}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.monthlyDues}</div>
                  <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.monthlyDuesSub}</div>
                </div>

                <div style={{ background: themeStyles.card, border: `1px solid ${themeStyles.border}`, borderRadius: themeStyles.cardRadius || 16, padding: "20px", boxShadow: themeStyles.cardShadow || "none" }}>
                  <Wallet size={24} color={themeStyles.accentGold} />
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
                    {(clientsList || []).reduce((acc, curr) => acc + (Number(curr.remainingAmount ?? curr.remaining) || 0), 0).toLocaleString()} {t.currency}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeStyles.accentGold }}>{t.totalPortfolio}</div>
                  <div style={{ fontSize: 11, color: themeStyles.subText }}>{t.totalPortfolioSub}</div>
                </div>
              </section>
REPLACE <<<<<<<
