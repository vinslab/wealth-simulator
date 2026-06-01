import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const COLORS = {
  bg: "#f8f9fb",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  textMuted: "#475569",
  textDim: "#94a3b8",
  input: "#f1f5f9",
  gridLine: "#e2e8f0",
  accent: "#0891b2",
  green: "#059669",
  purple: "#7c3aed",
  pink: "#db2777",
  red: "#dc2626",
  amber: "#d97706",
};

const FONTS = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const ASSET_COLORS = {
  home: "#d97706",
  stocks: "#0891b2",
  intlstocks: "#0284c7",
  emergingmarkets: "#0369a1",
  bonds: "#7c3aed",
  tips: "#8b5cf6",
  munibonds: "#a855f7",
  crypto: "#db2777",
  gold: "#ca8a04",
  commodities: "#eab308",
  realestate: "#059669",
  rentalproperty: "#10b981",
  farmland: "#84cc16",
  cash: "#64748b",
  angel: "#14b8a6",
  privateequity: "#0d9488",
  retirement: "#2563eb",
  business: "#9333ea",
  hsa: "#16a34a",
  education: "#f97316",
  insurance: "#0d9488",
  collectibles: "#be185d",
  forex: "#475569",
  other: "#ea580c",
};

const LIABILITY_COLORS = {
  mortgage: "#dc2626",
  studentloan: "#ef4444",
  creditcard: "#b91c1c",
  autoloan: "#f87171",
  heloc: "#fca5a5",
  margin: "#fb7185",
  businessdebt: "#e11d48",
  otherdebt: "#991b1b",
};

// Color palette for custom user-added categories
const CUSTOM_COLOR_PALETTE = [
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#14b8a6", "#6366f1", "#a855f7", "#f43f5e",
  "#22c55e", "#eab308", "#0ea5e9", "#d946ef", "#84cc16",
];

// Resolve color for a segment — uses ASSET_COLORS for built-ins, custom color for user-added
const getSegmentColor = (seg) => seg.customColor || ASSET_COLORS[seg.id] || "#94a3b8";
const getLiabilityColor = (liab) => liab.customColor || LIABILITY_COLORS[liab.id] || "#dc2626";

// Resolve historical rate — handle custom categories that don't have one
const getHistoricalRate = (id) => HISTORICAL_RATES[id] || { rate: 0, note: "Custom category (no historical reference)" };
const getLiabilityHistoricalRate = (id) => LIABILITY_RATES[id] || { rate: 0, note: "Custom debt (no historical reference)" };

const HISTORICAL_RATES = {
  home: { rate: 3.5, note: "US home appreciation avg ~3.5%/yr (1991–2024)" },
  stocks: { rate: 10.0, note: "S&P 500 avg ~10%/yr (1957–2024)" },
  intlstocks: { rate: 7.5, note: "MSCI EAFE avg ~7-8%/yr (developed markets ex-US)" },
  emergingmarkets: { rate: 8.5, note: "MSCI EM avg ~8-9%/yr, higher volatility" },
  bonds: { rate: 4.5, note: "US Aggregate Bond Index avg ~4.5%/yr" },
  tips: { rate: 4.0, note: "TIPS avg ~4%/yr real return + inflation protection" },
  munibonds: { rate: 3.5, note: "Muni bonds ~3.5%/yr, tax-free at federal level" },
  crypto: { rate: 25.0, note: "BTC 10-yr CAGR ~25% (highly volatile)" },
  gold: { rate: 7.5, note: "Gold avg ~7.5%/yr (2000–2024)" },
  commodities: { rate: 5.0, note: "Broad commodities ETF (DBC, GSCI) ~5%/yr, inflation hedge" },
  realestate: { rate: 8.0, note: "REITs avg ~8%/yr total return" },
  rentalproperty: { rate: 10.0, note: "Direct rentals ~8-12% total return (appreciation + cash flow + leverage)" },
  farmland: { rate: 11.0, note: "Farmland avg ~10-12%/yr historically (Iowa State data)" },
  cash: { rate: 4.0, note: "High-yield savings / T-bills ~4–5%" },
  angel: { rate: 22.0, note: "Angel/early-stage avg ~22% IRR (Kauffman/AIPP data, highly variable, illiquid)" },
  privateequity: { rate: 14.0, note: "PE/VC fund avg ~14% IRR (Cambridge Associates), 10-yr lockups" },
  retirement: { rate: 8.5, note: "Typical 401k/IRA blended (60/40 stocks/bonds) ~8.5%/yr" },
  business: { rate: 15.0, note: "Private company equity / RSUs — highly variable, illiquid, concentration risk" },
  hsa: { rate: 8.0, note: "HSA invested in market funds ~8%/yr (triple tax-advantaged)" },
  education: { rate: 7.0, note: "529 plans typically in age-based portfolios ~7%/yr" },
  insurance: { rate: 4.0, note: "Whole life cash value growth ~4%/yr (varies by policy)" },
  collectibles: { rate: 6.0, note: "Art/wine/watches blended ~6%/yr, illiquid, holding cost" },
  forex: { rate: 2.5, note: "Foreign currency holdings — low return, mostly for diversification/hedging" },
  other: { rate: 6.0, note: "Blended alternative assets estimate" },
};

const LIABILITY_RATES = {
  mortgage: { rate: 6.5, note: "Current 30-yr fixed mortgage avg ~6.5%" },
  studentloan: { rate: 6.0, note: "Federal student loans avg ~6%, private varies" },
  creditcard: { rate: 22.0, note: "Credit card avg APR ~22% (HIGH PRIORITY to pay off)" },
  autoloan: { rate: 7.5, note: "Auto loan avg ~7-9%" },
  heloc: { rate: 8.5, note: "HELOC variable rate ~8-9%" },
  margin: { rate: 11.0, note: "Margin loan rate ~10-12% (broker-dependent)" },
  businessdebt: { rate: 9.0, note: "Small business loans ~7-12%" },
  otherdebt: { rate: 8.0, note: "Other personal debt blended estimate" },
};

const DEFAULT_SEGMENTS = [
  // Most universal — everyone has these
  { id: "cash", label: "Cash / Savings", amount: 300000, rate: 4.0, useHistorical: true },
  { id: "stocks", label: "US Stocks / Index Funds", amount: 300000, rate: 10.0, useHistorical: true },
  { id: "retirement", label: "Retirement (401k/IRA/Roth)", amount: 300000, rate: 8.5, useHistorical: true },
  { id: "bonds", label: "Bonds (Aggregate)", amount: 300000, rate: 4.5, useHistorical: true },
  // Common
  { id: "realestate", label: "Real Estate / REITs", amount: 0, rate: 8.0, useHistorical: true },
  { id: "intlstocks", label: "International Stocks", amount: 0, rate: 7.5, useHistorical: true },
  { id: "crypto", label: "Crypto", amount: 0, rate: 25.0, useHistorical: true },
  { id: "hsa", label: "HSA", amount: 0, rate: 8.0, useHistorical: true },
  { id: "education", label: "529 / Education Savings", amount: 0, rate: 7.0, useHistorical: true },
  // Less common
  { id: "business", label: "Business Equity / RSUs", amount: 0, rate: 15.0, useHistorical: true },
  { id: "rentalproperty", label: "Rental Property (Direct)", amount: 0, rate: 10.0, useHistorical: true },
  { id: "emergingmarkets", label: "Emerging Markets", amount: 0, rate: 8.5, useHistorical: true },
  { id: "gold", label: "Gold", amount: 0, rate: 7.5, useHistorical: true },
  { id: "munibonds", label: "Municipal Bonds", amount: 0, rate: 3.5, useHistorical: true },
  { id: "tips", label: "TIPS (Inflation-Protected)", amount: 0, rate: 4.0, useHistorical: true },
  { id: "insurance", label: "Whole Life / Cash Value", amount: 0, rate: 4.0, useHistorical: true },
  // Niche / sophisticated
  { id: "angel", label: "Angel Investments", amount: 0, rate: 22.0, useHistorical: true },
  { id: "privateequity", label: "Private Equity / VC Funds", amount: 0, rate: 14.0, useHistorical: true },
  { id: "commodities", label: "Commodities (Broad)", amount: 0, rate: 5.0, useHistorical: true },
  { id: "farmland", label: "Farmland", amount: 0, rate: 11.0, useHistorical: true },
  { id: "collectibles", label: "Collectibles (Art / Watches)", amount: 0, rate: 6.0, useHistorical: true },
  { id: "forex", label: "Foreign Currency / FX", amount: 0, rate: 2.5, useHistorical: true },
  { id: "other", label: "Other", amount: 0, rate: 6.0, useHistorical: true },
];

const DEFAULT_LIABILITIES = [
  { id: "mortgage", label: "Mortgage", amount: 0, rate: 6.5, useHistorical: true },
  { id: "creditcard", label: "Credit Card Debt", amount: 0, rate: 22.0, useHistorical: true },
  { id: "studentloan", label: "Student Loans", amount: 0, rate: 6.0, useHistorical: true },
  { id: "autoloan", label: "Auto Loan", amount: 0, rate: 7.5, useHistorical: true },
  { id: "heloc", label: "HELOC", amount: 0, rate: 8.5, useHistorical: true },
  { id: "businessdebt", label: "Business Debt", amount: 0, rate: 9.0, useHistorical: true },
  { id: "margin", label: "Margin Loan", amount: 0, rate: 11.0, useHistorical: true },
  { id: "otherdebt", label: "Other Debt", amount: 0, rate: 8.0, useHistorical: true },
];

const DEFAULT_HOME = {
  enabled: true,
  amount: 800000,
  rate: 3.5,
  useHistorical: true,
};

const DEFAULT_WITHDRAW_PRIORITY = [
  "cash", "bonds", "tips", "munibonds", "forex",
  "stocks", "intlstocks", "emergingmarkets",
  "retirement", "hsa", "gold", "commodities",
  "realestate", "education", "crypto",
  "insurance", "other", "collectibles",
  "rentalproperty", "farmland", "angel", "privateequity", "business",
];

const DEFAULT_SETTINGS = {
  years: 20,
  currentAge: 40,
  monthlyAdd: 5000,
  contributionYears: 20,
  addToSegment: "stocks",
  adjustInflation: false,
  inflationRate: 3.0,
  applyGainsTax: false,
  gainsTaxRate: 0,
  homeExemptFromGainsTax: true,
  applyWithdrawalTax: false,
  withdrawalTaxRate: 0,
  annualWithdrawal: 0,
  withdrawPriority: DEFAULT_WITHDRAW_PRIORITY,
  allocationMode: "dollars",
  rebalance: false,
  overflowTarget: "stocks",
};

const MILESTONES = [5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000, 250_000_000];

const SCENARIO_COLORS = ["#1e293b", "#dc2626", "#7c3aed", "#d97706", "#0891b2"];

const formatCurrency = (val) => {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};
const formatFull = (val) => `$${Math.round(val).toLocaleString("en-US")}`;

/* ── NumberInput ── */
function NumberInput({ label, value, onChange, prefix, suffix, small, disabled }) {
  const [displayVal, setDisplayVal] = useState(String(value));
  const [focused, setFocused] = useState(false);

  const handleFocus = () => { setFocused(true); setDisplayVal(String(value)); };
  const handleBlur = () => {
    setFocused(false);
    const parsed = parseFloat(displayVal.replace(/[^0-9.\-]/g, ""));
    if (!isNaN(parsed)) { onChange(parsed); setDisplayVal(String(parsed)); }
    else setDisplayVal(String(value));
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") e.target.blur(); };
  const shown = focused ? displayVal : (prefix === "$" ? Number(value).toLocaleString("en-US") : String(value));

  return (
    <div style={{ flex: small ? "0 0 auto" : 1 }}>
      {label && <label style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, fontWeight: 500, display: "block", marginBottom: 4 }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", background: disabled ? "#f1f5f9" : COLORS.input,
        border: `1px solid ${focused ? COLORS.accent : COLORS.border}`, borderRadius: 6, padding: "0 8px", transition: "border-color 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}>
        {prefix && <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textDim, marginRight: 2 }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={shown} onChange={(e) => setDisplayVal(e.target.value)}
          onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown} disabled={disabled}
          style={{ background: "transparent", border: "none", outline: "none", fontFamily: FONTS.mono, fontSize: 13,
            color: COLORS.text, fontWeight: 600, padding: "8px 0", width: small ? 60 : "100%", minWidth: 0 }} />
        {suffix && <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textDim, marginLeft: 2 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, description }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", padding: 0,
        background: value ? COLORS.accent : COLORS.border, position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff",
          position: "absolute", top: 2, left: value ? 20 : 2, transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </button>
      <div>
        <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim }}>{description}</div>}
      </div>
    </div>
  );
}

function SectionCard({ title, children, color }) {
  return (
    <div style={{ flex: "1 1 280px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: color || COLORS.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ── SegmentRow ── */
function SegmentRow({ segment, color, onUpdate, onRemove, totalNW, allocationMode }) {
  const hist = getHistoricalRate(segment.id);
  const activeRate = segment.useHistorical ? hist.rate : segment.rate;
  const pct = totalNW > 0 ? (segment.amount / totalNW) * 100 : 0;
  const isCustom = segment.isCustom;

  return (
    <div style={{
      display: "flex", alignItems: "stretch", gap: 10, padding: "12px 16px",
      borderLeft: `3px solid ${color}`, background: COLORS.card,
      borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap",
    }}>
      <div style={{ flex: "1 1 140px", minWidth: 120, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {isCustom ? (
          <>
            <input type="color" value={segment.customColor || "#06b6d4"}
              onChange={(e) => onUpdate({ ...segment, customColor: e.target.value })}
              style={{ width: 24, height: 24, padding: 0, border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: "pointer", background: "transparent" }}
              title="Pick color" />
            <input type="text" value={segment.label}
              onChange={(e) => onUpdate({ ...segment, label: e.target.value })}
              style={{ flex: 1, minWidth: 100, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, fontWeight: 500, background: "transparent", border: "none", borderBottom: `1px dashed ${COLORS.border}`, outline: "none", padding: "2px 0" }} />
            <button onClick={onRemove}
              title="Remove this custom category"
              style={{ background: "transparent", border: "none", color: COLORS.textDim, cursor: "pointer", padding: "2px 6px", fontSize: 16, lineHeight: 1, fontFamily: FONTS.mono }}>
              ×
            </button>
          </>
        ) : (
          <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{segment.label}</span>
        )}
      </div>
      {allocationMode === "dollars" ? (
        <>
          <div style={{ flex: "1 1 140px", minWidth: 120 }}>
            <NumberInput label="Amount" value={segment.amount} onChange={(v) => onUpdate({ ...segment, amount: v })} prefix="$" />
          </div>
          <div style={{ flex: "0 0 60px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, fontWeight: 500, display: "block", marginBottom: 4 }}>%</label>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, fontWeight: 600, padding: "8px 0" }}>{pct.toFixed(1)}%</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: "0 0 110px" }}>
            <NumberInput label="Allocation" value={parseFloat(pct.toFixed(2))}
              onChange={(newPct) => onUpdate({ ...segment, amount: (newPct / 100) * totalNW })} suffix="%" />
          </div>
          <div style={{ flex: "1 1 130px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, fontWeight: 500, display: "block", marginBottom: 4 }}>Amount</label>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, fontWeight: 600, padding: "8px 0" }}>{formatCurrency(segment.amount)}</div>
          </div>
        </>
      )}
      <div style={{ flex: "0 0 90px", minWidth: 80 }}>
        <NumberInput label="Return" value={activeRate} onChange={(v) => onUpdate({ ...segment, rate: v, useHistorical: false })} suffix="%" small />
      </div>
      <div style={{ flex: "0 0 100px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 90 }}>
        <button onClick={() => onUpdate({ ...segment, useHistorical: !segment.useHistorical })}
          style={{
            background: segment.useHistorical ? "rgba(8,145,178,0.1)" : "transparent",
            border: `1px solid ${segment.useHistorical ? COLORS.accent : COLORS.border}`,
            borderRadius: 6, padding: "7px 8px", cursor: "pointer",
            fontFamily: FONTS.body, fontSize: 11, color: segment.useHistorical ? COLORS.accent : COLORS.textDim,
            fontWeight: 500, transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
          {segment.useHistorical ? "Historical" : "Custom"}
        </button>
      </div>
      {segment.useHistorical && hist.note && (
        <div style={{ flex: "1 1 100%", fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, marginTop: 2, paddingLeft: 2 }}>{hist.note}</div>
      )}
    </div>
  );
}

/* ── LiabilityRow ── */
function LiabilityRow({ liability, color, onUpdate, onRemove }) {
  const hist = getLiabilityHistoricalRate(liability.id);
  const activeRate = liability.useHistorical ? hist.rate : liability.rate;
  const isHighPriority = liability.id === "creditcard" && liability.amount > 0;
  const isCustom = liability.isCustom;

  return (
    <div style={{
      display: "flex", alignItems: "stretch", gap: 10, padding: "12px 16px",
      borderLeft: `3px solid ${color}`, background: COLORS.card,
      borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap",
    }}>
      <div style={{ flex: "1 1 140px", minWidth: 120, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {isCustom ? (
          <>
            <input type="color" value={liability.customColor || "#dc2626"}
              onChange={(e) => onUpdate({ ...liability, customColor: e.target.value })}
              style={{ width: 24, height: 24, padding: 0, border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: "pointer", background: "transparent" }}
              title="Pick color" />
            <input type="text" value={liability.label}
              onChange={(e) => onUpdate({ ...liability, label: e.target.value })}
              style={{ flex: 1, minWidth: 100, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, fontWeight: 500, background: "transparent", border: "none", borderBottom: `1px dashed ${COLORS.border}`, outline: "none", padding: "2px 0" }} />
            <button onClick={onRemove}
              title="Remove this custom debt"
              style={{ background: "transparent", border: "none", color: COLORS.textDim, cursor: "pointer", padding: "2px 6px", fontSize: 16, lineHeight: 1, fontFamily: FONTS.mono }}>
              ×
            </button>
          </>
        ) : (
          <>
            <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{liability.label}</span>
            {isHighPriority && (
              <span style={{ fontSize: 9, background: "rgba(220,38,38,0.12)", color: COLORS.red, padding: "2px 5px", borderRadius: 4, fontFamily: FONTS.body, fontWeight: 700, whiteSpace: "nowrap" }}>
                HIGH PRIORITY
              </span>
            )}
          </>
        )}
      </div>
      <div style={{ flex: "1 1 140px", minWidth: 120 }}>
        <NumberInput label="Balance" value={liability.amount} onChange={(v) => onUpdate({ ...liability, amount: v })} prefix="$" />
      </div>
      <div style={{ flex: "0 0 90px", minWidth: 80 }}>
        <NumberInput label="APR" value={activeRate} onChange={(v) => onUpdate({ ...liability, rate: v, useHistorical: false })} suffix="%" small />
      </div>
      <div style={{ flex: "0 0 100px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 90 }}>
        <button onClick={() => onUpdate({ ...liability, useHistorical: !liability.useHistorical })}
          style={{
            background: liability.useHistorical ? "rgba(220,38,38,0.08)" : "transparent",
            border: `1px solid ${liability.useHistorical ? COLORS.red : COLORS.border}`,
            borderRadius: 6, padding: "7px 8px", cursor: "pointer",
            fontFamily: FONTS.body, fontSize: 11, color: liability.useHistorical ? COLORS.red : COLORS.textDim,
            fontWeight: 500, transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
          {liability.useHistorical ? "Typical" : "Custom"}
        </button>
      </div>
      {liability.useHistorical && hist?.note && (
        <div style={{ flex: "1 1 100%", fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, marginTop: 2, paddingLeft: 2 }}>{hist.note}</div>
      )}
    </div>
  );
}

function WithdrawalPriority({ priority, segments, onChange }) {
  // Filter out priority IDs that no longer exist as segments
  const validIds = new Set(segments.map(s => s.id));
  const cleanPriority = priority.filter(id => validIds.has(id));
  // Add any new segments that are missing from priority
  segments.forEach(seg => { if (!cleanPriority.includes(seg.id)) cleanPriority.push(seg.id); });

  const move = (idx, dir) => {
    const newP = [...cleanPriority];
    const target = idx + dir;
    if (target < 0 || target >= newP.length) return;
    [newP[idx], newP[target]] = [newP[target], newP[idx]];
    onChange(newP);
  };
  const getLabel = (id) => segments.find(s => s.id === id)?.label || id;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, fontWeight: 500, marginBottom: 2 }}>
        Withdrawal Order (drains top first)
      </label>
      {cleanPriority.map((id, i) => (
        <div key={id} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
          background: COLORS.input, border: `1px solid ${COLORS.border}`, borderRadius: 6,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textDim, fontWeight: 600, minWidth: 16 }}>{i + 1}.</span>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: getSegmentColor(segments.find(s => s.id === id) || { id }), flexShrink: 0 }} />
          <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.text, flex: 1 }}>{getLabel(id)}</span>
          <div style={{ display: "flex", gap: 2 }}>
            <button onClick={() => move(i, -1)} disabled={i === 0}
              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 6px", cursor: i === 0 ? "not-allowed" : "pointer", fontSize: 11, color: i === 0 ? COLORS.textDim : COLORS.textMuted, fontFamily: FONTS.mono, opacity: i === 0 ? 0.4 : 1 }}>↑</button>
            <button onClick={() => move(i, 1)} disabled={i === cleanPriority.length - 1}
              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 6px", cursor: i === cleanPriority.length - 1 ? "not-allowed" : "pointer", fontSize: 11, color: i === cleanPriority.length - 1 ? COLORS.textDim : COLORS.textMuted, fontFamily: FONTS.mono, opacity: i === cleanPriority.length - 1 ? 0.4 : 1 }}>↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PieBreakdown({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.amount, 0);
  const data = segments.filter(s => s.amount > 0).map(s => ({
    name: s.label, value: s.amount, pct: ((s.amount / total) * 100).toFixed(1), color: getSegmentColor(s),
  }));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ width: 180, height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: COLORS.text, fontWeight: 500, minWidth: 40 }}>{d.pct}%</span>
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DataTable with Age, Multiplier, and YoY columns ── */
function DataTable({ chartData, segments, currentAge, homeEnabled, showNominal }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? chartData : chartData.filter((_, i) => i % 5 === 0 || i === chartData.length - 1);
  const startingTotal = chartData[0]?.total || 1;

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.text }}>Year-by-Year Breakdown</span>
        <button onClick={() => setExpanded(!expanded)} style={{
          background: "rgba(8,145,178,0.08)", border: `1px solid rgba(8,145,178,0.3)`, borderRadius: 6,
          padding: "5px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent, fontWeight: 500,
        }}>
          {expanded ? "Show Summary" : "Show All Years"}
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONTS.mono, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: COLORS.textDim, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Year</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: COLORS.amber, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Age</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.text, fontWeight: 700, fontSize: 11, fontFamily: FONTS.body, background: "rgba(8,145,178,0.04)" }}>
                Total{showNominal ? " (Real)" : ""}
              </th>
              {showNominal && (
                <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.textMuted, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body, background: "rgba(100,116,139,0.06)", whiteSpace: "nowrap" }}>
                  Nominal
                </th>
              )}
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.purple, fontWeight: 700, fontSize: 11, fontFamily: FONTS.body, whiteSpace: "nowrap", background: "rgba(124,58,237,0.04)" }}>YoY %</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.green, fontWeight: 700, fontSize: 11, fontFamily: FONTS.body, whiteSpace: "nowrap", background: "rgba(5,150,105,0.04)" }}>Multiple</th>
              {homeEnabled && (
                <th style={{ padding: "10px 8px", textAlign: "right", color: ASSET_COLORS.home, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body, whiteSpace: "nowrap" }}>Home</th>
              )}
              {segments.filter(s => s.amount > 0).map(s => (
                <th key={s.id} style={{ padding: "10px 8px", textAlign: "right", color: getSegmentColor(s), fontWeight: 600, fontSize: 11, fontFamily: FONTS.body, whiteSpace: "nowrap" }}>
                  {s.label.split(" / ")[0].split(" ").slice(0, 2).join(" ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const prevYearRow = chartData[row.year - 1];
              const yoy = prevYearRow && prevYearRow.total > 0 ? ((row.total - prevYearRow.total) / prevYearRow.total) * 100 : null;
              const multiple = startingTotal > 0 ? row.total / startingTotal : 0;
              const yoyColor = yoy === null ? COLORS.textDim : (yoy >= 10 ? COLORS.green : yoy >= 0 ? COLORS.textMuted : COLORS.red);
              const multipleColor = multiple >= 5 ? COLORS.green : multiple >= 2 ? COLORS.accent : COLORS.textMuted;

              return (
                <tr key={row.year} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "8px 12px", color: COLORS.textMuted, fontWeight: 500 }}>{row.year}</td>
                  <td style={{ padding: "8px 12px", color: COLORS.amber, fontWeight: 600 }}>{currentAge + row.year}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: COLORS.text, fontWeight: 700, background: "rgba(8,145,178,0.04)" }}>{formatCurrency(row.total)}</td>
                  {showNominal && (
                    <td style={{ padding: "8px 12px", textAlign: "right", color: COLORS.textMuted, fontWeight: 600, background: "rgba(100,116,139,0.06)" }}>
                      {formatCurrency(row.totalNominal || row.total)}
                    </td>
                  )}
                  <td style={{ padding: "8px 12px", textAlign: "right", color: yoyColor, fontWeight: 600, background: "rgba(124,58,237,0.04)" }}>
                    {yoy === null ? "—" : `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: multipleColor, fontWeight: 700, background: "rgba(5,150,105,0.04)" }}>
                    {multiple.toFixed(2)}x
                  </td>
                  {homeEnabled && (
                    <td style={{ padding: "8px 8px", textAlign: "right", color: ASSET_COLORS.home, fontWeight: 600 }}>{formatCurrency(row.home || 0)}</td>
                  )}
                  {segments.filter(s => s.amount > 0).map(s => (
                    <td key={s.id} style={{ padding: "8px 8px", textAlign: "right", color: COLORS.text }}>{formatCurrency(row[s.id] || 0)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MilestoneList({ milestones, currentAge }) {
  if (milestones.length === 0) return null;
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.text, marginBottom: 12 }}>Milestones</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ background: COLORS.input, borderRadius: 8, padding: "10px 14px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.text, fontWeight: 700 }}>{formatCurrency(m.target)}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim }}>Year {m.year} · Age {currentAge + m.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Simulation core (reusable) ── */
function runSimulation(segments, st, home, liabilities = []) {
  const data = [];
  const mStones = [];
  const hitMilestones = new Set();
  const balances = {};
  const startBalances = {};
  segments.forEach(seg => { balances[seg.id] = seg.amount; startBalances[seg.id] = seg.amount; });

  // Home tracked separately
  let homeBalance = home?.enabled ? home.amount : 0;
  const homeStart = homeBalance;
  const homeRate = home?.useHistorical ? HISTORICAL_RATES.home.rate : (home?.rate || 0);

  // Liabilities tracked separately
  const liabilityBalances = {};
  liabilities.forEach(l => { liabilityBalances[l.id] = l.amount; });

  // Target allocation percentages (from starting balances) — used for rebalancing
  const startTotal = Object.values(startBalances).reduce((a, b) => a + b, 0);
  const targetPcts = {};
  segments.forEach(seg => { targetPcts[seg.id] = startTotal > 0 ? seg.amount / startTotal : 0; });

  let cumTax = 0;
  let cumWithdraw = 0;
  let depletedFlag = false;

  for (let y = 0; y <= st.years; y++) {
    const point = { year: y };
    let portfolioTotal = 0;
    segments.forEach((seg) => {
      let val = balances[seg.id];
      if (st.adjustInflation && y > 0) val = val / Math.pow(1 + st.inflationRate / 100, y);
      point[seg.id] = Math.round(val);
      const growthVal = val - startBalances[seg.id];
      point[`growth_${seg.id}`] = Math.max(0, Math.round(growthVal));
      portfolioTotal += val;
    });

    // Home (adjusted for inflation if needed)
    let homeVal = homeBalance;
    if (st.adjustInflation && y > 0) homeVal = homeVal / Math.pow(1 + st.inflationRate / 100, y);
    point.home = Math.round(homeVal);
    point.growth_home = Math.max(0, Math.round(homeVal - homeStart));

    // Liabilities — sum them all and track each
    let totalLiab = 0;
    liabilities.forEach(l => {
      let val = liabilityBalances[l.id] || 0;
      if (st.adjustInflation && y > 0) val = val / Math.pow(1 + st.inflationRate / 100, y);
      point[`liab_${l.id}`] = Math.round(val);
      totalLiab += val;
    });
    point.totalLiabilities = Math.round(totalLiab);

    const investableTotal = portfolioTotal;
    const grossAssets = portfolioTotal + homeVal;
    const grandTotal = grossAssets - totalLiab;
    point.portfolio = Math.round(investableTotal);
    point.grossAssets = Math.round(grossAssets);
    point.total = Math.round(grandTotal); // Net Worth = Assets - Liabilities

    // Nominal (pre-inflation) total — always raw balances regardless of adjustInflation
    const nominalLiab = Object.values(liabilityBalances).reduce((a, b) => a + b, 0);
    const nominalRawTotal = Object.values(balances).reduce((a, b) => a + b, 0) + homeBalance - nominalLiab;
    point.totalNominal = Math.round(nominalRawTotal);
    data.push(point);

    const nominalTotal = nominalRawTotal;
    MILESTONES.forEach(target => {
      if (!hitMilestones.has(target) && nominalTotal >= target) {
        hitMilestones.add(target);
        mStones.push({ target, year: y });
      }
    });

    // Grow each investable asset
    segments.forEach((seg) => {
      const rate = seg.useHistorical ? getHistoricalRate(seg.id).rate : seg.rate;
      let gains = balances[seg.id] * (rate / 100);
      if (st.applyGainsTax) {
        const tax = gains * (st.gainsTaxRate / 100);
        gains -= tax;
        cumTax += tax;
      }
      balances[seg.id] += gains;
      if (seg.id === st.addToSegment && y < (st.contributionYears ?? st.years)) balances[seg.id] += st.monthlyAdd * 12;
    });

    // Grow home separately (no contributions, home is tax-exempt for gains until sold)
    if (home?.enabled) {
      homeBalance = homeBalance * (1 + homeRate / 100);
    }

    // Accrue interest on liabilities (assumes no extra paydown beyond regular)
    // Note: This simplifies by assuming minimum payments only cover interest, so principal stays
    // Users can manually reduce balances over time to model real paydown
    liabilities.forEach(l => {
      const liabRate = l.useHistorical ? getLiabilityHistoricalRate(l.id).rate : l.rate;
      // We model that the user is paying interest only — principal stays flat
      // (Real-world: user has separate income paying down). To keep model simple, balance stays.
      // If we wanted to model accrual without paydown, we'd add: liabilityBalances[l.id] *= (1 + liabRate/100);
      // For now, balances are static unless user adjusts them.
    });

    if (st.annualWithdrawal > 0) {
      let needed = st.annualWithdrawal;
      if (st.applyWithdrawalTax) {
        const gross = needed / (1 - st.withdrawalTaxRate / 100);
        cumTax += gross - needed;
        needed = gross;
      }
      cumWithdraw += st.annualWithdrawal;
      for (const id of st.withdrawPriority) {
        if (needed <= 0) break;
        const available = balances[id] || 0;
        if (available <= 0) continue;
        const pulled = Math.min(available, needed);
        balances[id] -= pulled;
        needed -= pulled;
      }
      if (needed > 0) depletedFlag = true;
    }

    // Rebalance investable assets back to target allocation percentages
    if (st.rebalance) {
      const totalAfter = Object.values(balances).reduce((a, b) => a + b, 0);
      if (totalAfter > 0) {
        segments.forEach(seg => {
          balances[seg.id] = totalAfter * targetPcts[seg.id];
        });
      }
    }
  }
  return { chartData: data, milestones: mStones, totalTaxPaid: cumTax, totalWithdrawn: cumWithdraw, depleted: depletedFlag };
}

/* ── Scenario Comparison ── */
function ScenarioComparison({ scenarios, currentScenario, currentAge }) {
  // Visibility map — defaults all visible
  const [visible, setVisible] = useState({});
  // Initialize any new scenarios to visible by default
  useEffect(() => {
    setVisible(prev => {
      const next = { current: prev.current ?? true };
      scenarios.forEach(s => { next[s.id] = prev[s.id] ?? true; });
      return next;
    });
  }, [scenarios]);

  if (scenarios.length === 0) return null;
  const maxYears = Math.max(...scenarios.map(s => s.result.chartData.length - 1), currentScenario.result.chartData.length - 1);

  const isVisible = (key) => visible[key] !== false;
  const toggle = (key) => setVisible(prev => ({ ...prev, [key]: !isVisible(key) }));
  const setAll = (val) => {
    const next = { current: val };
    scenarios.forEach(s => { next[s.id] = val; });
    setVisible(next);
  };

  const comparisonData = [];
  for (let y = 0; y <= maxYears; y++) {
    const point = { year: y, age: currentAge + y };
    point.current = currentScenario.result.chartData[y]?.total ?? null;
    scenarios.forEach((s, i) => {
      point[`s${i}`] = s.result.chartData[y]?.total ?? null;
    });
    comparisonData.push(point);
  }

  const visibleCount = (isVisible("current") ? 1 : 0) + scenarios.filter(s => isVisible(s.id)).length;

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "24px 16px 16px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 8, marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.text }}>Scenario Comparison</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>
            Showing {visibleCount} of {scenarios.length + 1} — click chips to toggle visibility
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setAll(true)}
            style={{ background: "rgba(8,145,178,0.08)", border: `1px solid rgba(8,145,178,0.3)`, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent, fontWeight: 500 }}>
            Show All
          </button>
          <button onClick={() => setAll(false)}
            style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
            Hide All
          </button>
        </div>
      </div>

      {/* Visibility chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, paddingLeft: 8 }}>
        {[{ key: "current", name: currentScenario.name, color: SCENARIO_COLORS[0], isCurrent: true },
          ...scenarios.map((s, i) => ({ key: s.id, name: s.name, color: SCENARIO_COLORS[(i + 1) % SCENARIO_COLORS.length], isCurrent: false }))
        ].map(item => {
          const on = isVisible(item.key);
          return (
            <button key={item.key} onClick={() => toggle(item.key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: on ? `${item.color}15` : COLORS.input,
                border: `1px solid ${on ? item.color : COLORS.border}`,
                borderRadius: 16, padding: "5px 12px", cursor: "pointer",
                fontFamily: FONTS.body, fontSize: 12, fontWeight: 500,
                color: on ? item.color : COLORS.textDim,
                opacity: on ? 1 : 0.6, transition: "all 0.15s",
              }}>
              <span style={{
                width: 10, height: 10, borderRadius: 2, background: on ? item.color : COLORS.textDim,
                opacity: on ? 1 : 0.4,
              }} />
              {item.name}
              {item.isCurrent && <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>·  CURRENT</span>}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={comparisonData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
          <XAxis dataKey="year" tick={{ fill: COLORS.textDim, fontSize: 12, fontFamily: FONTS.mono }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
          <YAxis tickFormatter={formatCurrency} tick={{ fill: COLORS.textDim, fontSize: 12, fontFamily: FONTS.mono }} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontFamily: FONTS.body, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Year {label} · Age {currentAge + label}</div>
                {payload.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: p.color, marginBottom: 1, fontFamily: FONTS.mono }}>
                    {p.name}: {p.value !== null ? formatFull(p.value) : "—"}
                  </div>
                ))}
              </div>
            );
          }} />
          {isVisible("current") && (
            <Line type="monotone" dataKey="current" name={currentScenario.name} stroke={SCENARIO_COLORS[0]} strokeWidth={3} dot={false} activeDot={{ r: 5 }} connectNulls />
          )}
          {scenarios.map((s, i) => isVisible(s.id) && (
            <Line key={s.id} type="monotone" dataKey={`s${i}`} name={s.name} stroke={SCENARIO_COLORS[(i + 1) % SCENARIO_COLORS.length]} strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONTS.mono, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: COLORS.textDim, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Scenario</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.textDim, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Starting NW</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.textDim, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Final NW</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.textDim, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Growth</th>
              <th style={{ padding: "10px 12px", textAlign: "right", color: COLORS.textDim, fontWeight: 600, fontSize: 11, fontFamily: FONTS.body }}>Multiple</th>
            </tr>
          </thead>
          <tbody>
            {[currentScenario, ...scenarios].map((sc, i) => {
              const key = i === 0 ? "current" : sc.id;
              const on = isVisible(key);
              const start = sc.result.chartData[0]?.total || 0;
              const end = sc.result.chartData[sc.result.chartData.length - 1]?.total || 0;
              const color = i === 0 ? SCENARIO_COLORS[0] : SCENARIO_COLORS[i % SCENARIO_COLORS.length];
              return (
                <tr key={sc.id || "current"} style={{ borderBottom: `1px solid ${COLORS.border}`, opacity: on ? 1 : 0.35, transition: "opacity 0.2s" }}>
                  <td style={{ padding: "10px 12px", color: color, fontWeight: 600 }}>{sc.name}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: COLORS.textMuted }}>{formatCurrency(start)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: COLORS.text, fontWeight: 700 }}>{formatCurrency(end)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: COLORS.green, fontWeight: 600 }}>{formatCurrency(end - start)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: COLORS.text }}>{start > 0 ? `${(end / start).toFixed(1)}x` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Persistence helpers (safe for SSR / sandboxed envs) ── */
const STORAGE_KEY = "wealth-simulator-v1";
const loadState = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveState = (state) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
};

/* ── Main ── */
export default function WealthSimulator() {
  const initial = loadState();
  const [segments, setSegments] = useState(initial?.segments || DEFAULT_SEGMENTS);
  const [home, setHome] = useState(initial?.home || DEFAULT_HOME);
  const [liabilities, setLiabilities] = useState(initial?.liabilities || DEFAULT_LIABILITIES);
  const [settings, setSettings] = useState(initial?.settings || DEFAULT_SETTINGS);
  const [chartView, setChartView] = useState(initial?.chartView || "balance");
  const [scenarios, setScenarios] = useState(initial?.scenarios || []);
  const [scenarioName, setScenarioName] = useState("");
  const st = settings;

  // Persist on any change
  useEffect(() => {
    saveState({ segments, home, liabilities, settings, chartView, scenarios });
  }, [segments, home, liabilities, settings, chartView, scenarios]);

  const portfolioNW = segments.reduce((sum, seg) => sum + seg.amount, 0);
  const homeValue = home.enabled ? home.amount : 0;
  const grossAssets = portfolioNW + homeValue;
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const totalNW = grossAssets - totalLiabilities;
  const updateSetting = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const updateSegment = (i, updated) => { const copy = [...segments]; copy[i] = updated; setSegments(copy); };
  const updateLiability = (i, updated) => { const copy = [...liabilities]; copy[i] = updated; setLiabilities(copy); };

  // Custom category management
  const addCustomSegment = () => {
    const customId = `custom_${Date.now()}`;
    const colorIdx = segments.filter(s => s.id.startsWith("custom_")).length % CUSTOM_COLOR_PALETTE.length;
    setSegments([...segments, {
      id: customId,
      label: "New Custom Asset",
      amount: 0,
      rate: 7.0,
      useHistorical: false,
      isCustom: true,
      customColor: CUSTOM_COLOR_PALETTE[colorIdx],
    }]);
  };
  const removeSegment = (i) => {
    if (!segments[i]?.isCustom) return;
    setSegments(segments.filter((_, idx) => idx !== i));
  };
  const addCustomLiability = () => {
    const customId = `customdebt_${Date.now()}`;
    const colorIdx = liabilities.filter(l => l.id.startsWith("customdebt_")).length;
    const debtPalette = ["#dc2626", "#ef4444", "#b91c1c", "#f87171", "#e11d48"];
    setLiabilities([...liabilities, {
      id: customId,
      label: "New Custom Debt",
      amount: 0,
      rate: 8.0,
      useHistorical: false,
      isCustom: true,
      customColor: debtPalette[colorIdx % debtPalette.length],
    }]);
  };
  const removeLiability = (i) => {
    if (!liabilities[i]?.isCustom) return;
    setLiabilities(liabilities.filter((_, idx) => idx !== i));
  };
  const updateHome = (changes) => setHome(prev => ({ ...prev, ...changes }));
  const resetAll = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    setSegments(DEFAULT_SEGMENTS.map(s => ({ ...s })));
    setHome({ ...DEFAULT_HOME });
    setLiabilities(DEFAULT_LIABILITIES.map(l => ({ ...l })));
    setSettings({ ...DEFAULT_SETTINGS, withdrawPriority: [...DEFAULT_WITHDRAW_PRIORITY] });
    setScenarios([]);
  };

  // Scale only the investable portfolio (not home, which is fixed)
  const scalePortfolioNW = (newPortfolioTotal) => {
    if (newPortfolioTotal <= 0 || portfolioNW <= 0) return;
    const ratio = newPortfolioTotal / portfolioNW;
    setSegments(segments.map(seg => ({ ...seg, amount: seg.amount * ratio })));
  };

  const { chartData, milestones, totalTaxPaid, totalWithdrawn, depleted } = useMemo(
    () => runSimulation(segments, st, home, liabilities), [segments, st, home, liabilities]
  );

  const finalTotal = chartData[chartData.length - 1]?.total || 0;
  const growth = finalTotal - totalNW;
  const projLabel = [st.adjustInflation ? "real" : null, st.applyGainsTax ? "post-tax" : null].filter(Boolean).join(", ");

  const saveScenario = () => {
    const name = scenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    const result = runSimulation(segments, st, home, liabilities);
    setScenarios([...scenarios, { id: Date.now(), name, result, segmentsSnap: JSON.parse(JSON.stringify(segments)), homeSnap: { ...home }, liabilitiesSnap: JSON.parse(JSON.stringify(liabilities)), settingsSnap: { ...st } }]);
    setScenarioName("");
  };
  const removeScenario = (id) => setScenarios(scenarios.filter(s => s.id !== id));
  const loadScenario = (id) => {
    const sc = scenarios.find(s => s.id === id);
    if (!sc) return;
    setSegments(sc.segmentsSnap.map(s => ({ ...s })));
    if (sc.homeSnap) setHome({ ...sc.homeSnap });
    if (sc.liabilitiesSnap) setLiabilities(sc.liabilitiesSnap.map(l => ({ ...l })));
    setSettings({ ...sc.settingsSnap });
  };

  // Preset allocation strategies (% of investable portfolio, excluding home)
  const PRESETS = {
    defensive: {
      name: "Defensive",
      description: "Capital preservation, lower volatility",
      allocations: {
        stocks: 15, intlstocks: 5, retirement: 20,
        bonds: 22, tips: 5, munibonds: 5,
        crypto: 1, gold: 6, commodities: 2,
        realestate: 5, cash: 10, hsa: 2, other: 2,
      },
    },
    endowment: {
      name: "Endowment Style",
      description: "Yale/Harvard model — diversified alternatives",
      allocations: {
        stocks: 18, intlstocks: 7, emergingmarkets: 3, retirement: 12,
        bonds: 6, tips: 2,
        crypto: 3, gold: 4, commodities: 2,
        realestate: 12, rentalproperty: 5, farmland: 3,
        cash: 4, angel: 8, privateequity: 6, business: 3, hsa: 2,
      },
    },
    aggressive: {
      name: "Aggressive Growth",
      description: "Long horizon, max equity exposure",
      allocations: {
        stocks: 32, intlstocks: 8, emergingmarkets: 5, retirement: 18,
        bonds: 3,
        crypto: 8, gold: 2,
        realestate: 8, rentalproperty: 4,
        cash: 2, angel: 4, privateequity: 4, business: 2,
      },
    },
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    const newSegments = segments.map(seg => {
      const pct = preset.allocations[seg.id] ?? 0;
      return { ...seg, amount: (pct / 100) * portfolioNW };
    });
    const result = runSimulation(newSegments, st, home, liabilities);
    setScenarios([
      ...scenarios,
      { id: Date.now(), name: preset.name, result, segmentsSnap: JSON.parse(JSON.stringify(newSegments)), homeSnap: { ...home }, liabilitiesSnap: JSON.parse(JSON.stringify(liabilities)), settingsSnap: { ...st } },
    ]);
  };

  const applyAllPresets = () => {
    const newScenarios = Object.entries(PRESETS).map(([key, preset], i) => {
      const newSegments = segments.map(seg => {
        const pct = preset.allocations[seg.id] ?? 0;
        return { ...seg, amount: (pct / 100) * portfolioNW };
      });
      const result = runSimulation(newSegments, st, home, liabilities);
      return { id: Date.now() + i, name: preset.name, result, segmentsSnap: JSON.parse(JSON.stringify(newSegments)), homeSnap: { ...home }, liabilitiesSnap: JSON.parse(JSON.stringify(liabilities)), settingsSnap: { ...st } };
    });
    setScenarios([...scenarios, ...newScenarios]);
  };

  const currentScenario = { name: "Current Plan", result: { chartData } };

  // Compute per-asset contribution to total growth, sorted by impact
  const contribution = useMemo(() => {
    const finalRow = chartData[chartData.length - 1];
    const firstRow = chartData[0];
    if (!finalRow || !firstRow) return [];
    const totalGrowth = finalRow.total - firstRow.total;
    const items = segments
      .filter(seg => seg.amount > 0)
      .map(seg => {
        const gain = (finalRow[seg.id] || 0) - (firstRow[seg.id] || 0);
        const startAmt = firstRow[seg.id] || 0;
        const finalAmt = finalRow[seg.id] || 0;
        return {
          id: seg.id,
          label: seg.label,
          color: getSegmentColor(seg),
          start: startAmt,
          final: finalAmt,
          gain,
          multiple: startAmt > 0 ? finalAmt / startAmt : 0,
          pctOfGrowth: totalGrowth > 0 ? (gain / totalGrowth) * 100 : 0,
        };
      });
    if (home.enabled) {
      const startAmt = firstRow.home || 0;
      const finalAmt = finalRow.home || 0;
      const gain = finalAmt - startAmt;
      items.push({
        id: "home",
        label: "Primary Home",
        color: ASSET_COLORS.home,
        start: startAmt,
        final: finalAmt,
        gain,
        multiple: startAmt > 0 ? finalAmt / startAmt : 0,
        pctOfGrowth: totalGrowth > 0 ? (gain / totalGrowth) * 100 : 0,
      });
    }
    return items.sort((a, b) => b.gain - a.gain);
  }, [segments, home, chartData]);

  // Segments sorted by final value (largest at bottom for stacked, brightest line for top)
  const orderedSegments = useMemo(() => {
    const finalRow = chartData[chartData.length - 1];
    if (!finalRow) return segments.filter(s => s.amount > 0);
    return [...segments]
      .filter(s => s.amount > 0)
      .sort((a, b) => (finalRow[b.id] || 0) - (finalRow[a.id] || 0));
  }, [segments, chartData]);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: FONTS.body, padding: "40px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
            Wealth Building Tool · 01
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 38, fontWeight: 400, margin: "0 0 8px", color: COLORS.text }}>
            Net Worth Growth Simulator
          </h1>
          <p style={{ fontSize: 14, color: COLORS.textDim, margin: 0, maxWidth: 580, marginInline: "auto" }}>
            Model your wealth across asset classes with inflation, taxes, prioritized withdrawals, and scenario comparison.
          </p>
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(5,150,105,0.08)", border: `1px solid rgba(5,150,105,0.2)`, borderRadius: 12, fontSize: 11, fontFamily: FONTS.body, color: COLORS.green, fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green }} />
            Auto-saved locally · your inputs persist across reloads
          </div>
        </div>

        {depleted && (
          <div style={{ background: "rgba(220,38,38,0.06)", border: `1px solid rgba(220,38,38,0.3)`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontFamily: FONTS.body, fontSize: 13, color: COLORS.red }}>
            <strong>Warning:</strong> Withdrawals exceed available assets during the projection. Consider reducing annual withdrawal or extending contributions.
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { label: "Net Worth (Assets − Debt)", value: formatFull(totalNW), color: COLORS.accent },
            { label: "Gross Assets", value: formatFull(grossAssets), color: COLORS.green },
            { label: "Investable Portfolio", value: formatFull(portfolioNW), color: COLORS.purple },
            ...(home.enabled ? [{ label: "Home Value", value: formatFull(homeValue), color: COLORS.amber }] : []),
            ...(totalLiabilities > 0 ? [{ label: "Total Liabilities", value: formatFull(totalLiabilities), color: COLORS.red }] : []),
            { label: `Projected · Age ${st.currentAge + st.years}${projLabel ? ` · ${projLabel}` : ""}`, value: formatFull(finalTotal), color: COLORS.green },
            { label: "Total Growth", value: formatFull(growth), color: COLORS.pink },
            { label: "Growth Multiple", value: `${(finalTotal / totalNW).toFixed(1)}x`, color: COLORS.red },
            ...(totalTaxPaid > 0 ? [{ label: "Est. Taxes Paid", value: formatFull(totalTaxPaid), color: COLORS.red }] : []),
            ...(totalWithdrawn > 0 ? [{ label: "Total Withdrawn", value: formatFull(totalWithdrawn), color: COLORS.amber }] : []),
          ].map((c, i) => (
            <div key={i} style={{ flex: "1 1 140px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: c.color, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 5 }}>{c.label}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700, color: COLORS.text }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Controls Row 1 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <SectionCard title="Time & Contributions" color={COLORS.accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <NumberInput label="Current Age" value={st.currentAge} onChange={(v) => updateSetting("currentAge", Math.max(0, Math.round(v)))} suffix="yrs" />
                <NumberInput label="Time Horizon" value={st.years} onChange={(v) => updateSetting("years", Math.max(1, Math.round(v)))} suffix="yrs" />
              </div>
              <NumberInput label="Investable Portfolio (scales all)" value={portfolioNW} onChange={scalePortfolioNW} prefix="$" />
              <div style={{ display: "flex", gap: 8 }}>
                <NumberInput label="Monthly Contribution" value={st.monthlyAdd} onChange={(v) => updateSetting("monthlyAdd", v)} prefix="$" />
                <NumberInput label="Contribute For" value={st.contributionYears ?? st.years} onChange={(v) => updateSetting("contributionYears", Math.max(0, Math.round(v)))} suffix="yrs" />
              </div>
              <div>
                <label style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, fontWeight: 500, display: "block", marginBottom: 4 }}>Contribute To</label>
                <select value={st.addToSegment} onChange={(e) => updateSetting("addToSegment", e.target.value)}
                  style={{ width: "100%", background: COLORS.input, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "8px", fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text, outline: "none", cursor: "pointer" }}>
                  {segments.map(seg => <option key={seg.id} value={seg.id}>{seg.label}</option>)}
                </select>
              </div>
              <Toggle label="Annual Rebalancing" value={st.rebalance} onChange={(v) => updateSetting("rebalance", v)} description="Hold target allocation % fixed every year" />
            </div>
          </SectionCard>
          <SectionCard title="Withdrawals" color={COLORS.amber}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <NumberInput label="Annual Withdrawal (net)" value={st.annualWithdrawal} onChange={(v) => updateSetting("annualWithdrawal", v)} prefix="$" />
              <WithdrawalPriority priority={st.withdrawPriority} segments={segments} onChange={(p) => updateSetting("withdrawPriority", p)} />
            </div>
          </SectionCard>
        </div>

        {/* Controls Row 2 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <SectionCard title="Inflation" color={COLORS.purple}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle label="Adjust for Inflation" value={st.adjustInflation} onChange={(v) => updateSetting("adjustInflation", v)} description="Show values in today's dollars" />
              <NumberInput label="Inflation Rate" value={st.inflationRate} onChange={(v) => updateSetting("inflationRate", v)} suffix="%" />
              <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, lineHeight: 1.4 }}>
                Fed target: 2% · 30-yr avg: ~2.5% · Conservative default: 3%
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tax on Investment Gains" color={COLORS.green}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle label="Apply Annual Gains Tax" value={st.applyGainsTax} onChange={(v) => updateSetting("applyGainsTax", v)} description="Taxes dividends, interest, realized gains" />
              <NumberInput label="Effective Gains Tax Rate" value={st.gainsTaxRate} onChange={(v) => updateSetting("gainsTaxRate", v)} suffix="%" />
              <Toggle label="Exempt Primary Home" value={st.homeExemptFromGainsTax} onChange={(v) => updateSetting("homeExemptFromGainsTax", v)} description="$500K MFJ exclusion on home sale" />
              <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, lineHeight: 1.4 }}>
                Long-term gains: 0–20% · Qualified div: 15% · Short-term: up to 37%
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tax on Withdrawals" color={COLORS.red}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle label="Apply Withdrawal Tax" value={st.applyWithdrawalTax} onChange={(v) => updateSetting("applyWithdrawalTax", v)} description="Tax on distributions" />
              <NumberInput label="Withdrawal Tax Rate" value={st.withdrawalTaxRate} onChange={(v) => updateSetting("withdrawalTaxRate", v)} suffix="%" />
              <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, lineHeight: 1.4 }}>
                401k/IRA: ordinary income rate · Roth: $0 · Brokerage: cap gains rate
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Primary Home — fixed asset, separate from investable portfolio */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.text }}>Primary Home</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
                Tracked separately from your investable portfolio · keeps appreciating but not part of allocation %
              </div>
            </div>
            <Toggle label="Include Home" value={home.enabled} onChange={(v) => updateHome({ enabled: v })} />
          </div>
          {home.enabled && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 200px", minWidth: 180 }}>
                <NumberInput label="Current Home Value" value={home.amount} onChange={(v) => updateHome({ amount: v })} prefix="$" />
              </div>
              <div style={{ flex: "0 0 130px", minWidth: 110 }}>
                <NumberInput
                  label="Appreciation Rate"
                  value={home.useHistorical ? HISTORICAL_RATES.home.rate : home.rate}
                  onChange={(v) => updateHome({ rate: v, useHistorical: false })}
                  suffix="%"
                />
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <button onClick={() => updateHome({ useHistorical: !home.useHistorical })}
                  style={{
                    background: home.useHistorical ? "rgba(8,145,178,0.1)" : "transparent",
                    border: `1px solid ${home.useHistorical ? COLORS.accent : COLORS.border}`,
                    borderRadius: 6, padding: "9px 12px", cursor: "pointer",
                    fontFamily: FONTS.body, fontSize: 12, color: home.useHistorical ? COLORS.accent : COLORS.textDim,
                    fontWeight: 500, whiteSpace: "nowrap",
                  }}>
                  {home.useHistorical ? "Historical (3.5%)" : "Custom Rate"}
                </button>
              </div>
              <div style={{ flex: "1 1 200px", padding: "10px 14px", background: COLORS.input, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 3 }}>Projected at Year {st.years}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 700, color: COLORS.amber }}>
                  {formatFull(home.amount * Math.pow(1 + (home.useHistorical ? HISTORICAL_RATES.home.rate : home.rate) / 100, st.years))}
                </div>
              </div>
            </div>
          )}
          {home.enabled && (
            <div style={{ marginTop: 12, fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, lineHeight: 1.4 }}>
              {HISTORICAL_RATES.home.note} · Primary residence sale typically benefits from $500K MFJ capital gains exclusion.
            </div>
          )}
        </div>

        {/* Allocation + Pie */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ flex: "1 1 500px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.text }}>Investable Portfolio Allocation</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <div style={{ display: "flex", background: COLORS.input, borderRadius: 6, padding: 2, border: `1px solid ${COLORS.border}` }}>
                  <button onClick={() => updateSetting("allocationMode", "dollars")}
                    style={{ background: st.allocationMode === "dollars" ? COLORS.card : "transparent", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: st.allocationMode === "dollars" ? COLORS.text : COLORS.textDim, fontWeight: 600 }}>$</button>
                  <button onClick={() => updateSetting("allocationMode", "percent")}
                    style={{ background: st.allocationMode === "percent" ? COLORS.card : "transparent", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: st.allocationMode === "percent" ? COLORS.text : COLORS.textDim, fontWeight: 600 }}>%</button>
                </div>
                <button onClick={() => { const allHist = segments.every(seg => seg.useHistorical); setSegments(segments.map(seg => ({ ...seg, useHistorical: !allHist }))); }}
                  style={{ background: "rgba(8,145,178,0.08)", border: `1px solid rgba(8,145,178,0.3)`, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent, fontWeight: 500 }}>Toggle Historical</button>
                <button onClick={resetAll}
                  style={{ background: "rgba(220,38,38,0.06)", border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.red, fontWeight: 500 }}>Reset</button>
              </div>
            </div>

            {st.allocationMode === "percent" && (
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.input, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 220px", minWidth: 200 }}>
                  <NumberInput label="Investable Portfolio Total" value={portfolioNW} onChange={scalePortfolioNW} prefix="$" />
                </div>
                <div style={{ flex: "0 0 auto" }}>
                  <label style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, fontWeight: 500, display: "block", marginBottom: 4 }}>Total %</label>
                  {(() => {
                    const totalPct = segments.reduce((sum, seg) => sum + (portfolioNW > 0 ? (seg.amount / portfolioNW) * 100 : 0), 0);
                    const isExact = Math.abs(totalPct - 100) < 0.01;
                    const color = isExact ? COLORS.green : (totalPct > 100 ? COLORS.red : COLORS.amber);
                    return (
                      <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, color, padding: "8px 12px", background: COLORS.card, border: `1px solid ${color}`, borderRadius: 6, minWidth: 80, textAlign: "center" }}>
                        {totalPct.toFixed(1)}%
                      </div>
                    );
                  })()}
                </div>
                <div style={{ flex: "1 1 200px", fontSize: 11, color: COLORS.textDim, fontFamily: FONTS.body, lineHeight: 1.4 }}>
                  Adjust the total — percentages stay constant and dollars scale proportionally. Allocation should sum to 100%.
                </div>
              </div>
            )}

            {segments.map((seg, i) => (
              <SegmentRow key={seg.id} segment={seg} color={getSegmentColor(seg)} onUpdate={(u) => updateSegment(i, u)}
                onRemove={() => removeSegment(i)}
                totalNW={portfolioNW} allocationMode={st.allocationMode} />
            ))}
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "center", background: COLORS.card }}>
              <button onClick={addCustomSegment}
                style={{
                  background: "transparent", border: `1px dashed ${COLORS.border}`, borderRadius: 6,
                  padding: "10px 20px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}>
                + Add Custom Asset Category
              </button>
            </div>
          </div>

          <div style={{ flex: "0 0 280px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.text, marginBottom: 12, textAlign: "center" }}>Current Allocation</div>
            <PieBreakdown segments={segments} />
          </div>
        </div>

        {/* Liabilities Section */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.text }}>Liabilities / Debt</span>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
                Subtracted from gross assets to calculate true net worth · {formatFull(totalLiabilities)} total debt
              </div>
            </div>
          </div>
          {liabilities.map((l, i) => (
            <LiabilityRow key={l.id} liability={l} color={getLiabilityColor(l)} onUpdate={(u) => updateLiability(i, u)}
              onRemove={() => removeLiability(i)} />
          ))}
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "center", background: COLORS.card }}>
            <button onClick={addCustomLiability}
              style={{
                background: "transparent", border: `1px dashed ${COLORS.border}`, borderRadius: 6,
                padding: "10px 20px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}>
              + Add Custom Debt
            </button>
          </div>
        </div>

        {/* Main Chart with toggle */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "24px 16px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 8, marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.text }}>
                {chartView === "balance" ? "Net Worth by Asset Class" : "Cumulative Gains by Asset Class"}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>
                {chartView === "balance" ? "Stacked total value over time" : "How much each asset has grown from its starting amount"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: COLORS.input, borderRadius: 6, padding: 2, border: `1px solid ${COLORS.border}` }}>
                <button onClick={() => setChartView("balance")}
                  style={{ background: chartView === "balance" ? COLORS.card : "transparent", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: chartView === "balance" ? COLORS.text : COLORS.textDim, fontWeight: 600 }}>
                  Balance
                </button>
                <button onClick={() => setChartView("growth")}
                  style={{ background: chartView === "growth" ? COLORS.card : "transparent", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: chartView === "growth" ? COLORS.text : COLORS.textDim, fontWeight: 600 }}>
                  Growth
                </button>
              </div>
              {st.adjustInflation && <span style={{ fontSize: 10, background: "rgba(124,58,237,0.1)", color: COLORS.purple, padding: "3px 8px", borderRadius: 4, fontFamily: FONTS.body, fontWeight: 600 }}>INFLATION-ADJUSTED</span>}
              {st.applyGainsTax && <span style={{ fontSize: 10, background: "rgba(5,150,105,0.1)", color: COLORS.green, padding: "3px 8px", borderRadius: 4, fontFamily: FONTS.body, fontWeight: 600 }}>POST-TAX GAINS</span>}
              {st.rebalance && <span style={{ fontSize: 10, background: "rgba(8,145,178,0.1)", color: COLORS.accent, padding: "3px 8px", borderRadius: 4, fontFamily: FONTS.body, fontWeight: 600 }}>REBALANCED</span>}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={420}>
            {chartView === "balance" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                <defs>
                  {segments.map((seg) => (
                    <linearGradient key={seg.id} id={`g-${seg.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getSegmentColor(seg)} stopOpacity={0.65} />
                      <stop offset="100%" stopColor={getSegmentColor(seg)} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                  <linearGradient id="g-home" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ASSET_COLORS.home} stopOpacity={0.65} />
                    <stop offset="100%" stopColor={ASSET_COLORS.home} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: COLORS.textDim, fontSize: 11, fontFamily: FONTS.mono }} axisLine={{ stroke: COLORS.border }} tickLine={false}
                  tickFormatter={(y) => `Y${y}/${st.currentAge + y}`} interval="preserveStartEnd" minTickGap={30} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: COLORS.textDim, fontSize: 11, fontFamily: FONTS.mono }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
                  return (
                    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 14px", fontFamily: FONTS.body, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Year {label} · Age {st.currentAge + label}</div>
                      <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 700, fontFamily: FONTS.mono, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>
                        Total: {formatFull(total)}
                      </div>
                      {payload.filter(p => p.value > 0).reverse().map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, marginBottom: 2 }}>
                          <span style={{ color: p.color, fontFamily: FONTS.body, fontWeight: 500 }}>{p.name}</span>
                          <span style={{ color: COLORS.text, fontFamily: FONTS.mono, fontWeight: 600 }}>{formatFull(p.value)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, paddingTop: 12 }} iconType="circle" iconSize={8} />
                {home.enabled && (
                  <Area type="monotone" dataKey="home" name="Primary Home" stackId="1"
                    stroke={ASSET_COLORS.home} strokeWidth={1.5} fill="url(#g-home)" />
                )}
                {orderedSegments.map((seg) => (
                  <Area key={seg.id} type="monotone"
                    dataKey={seg.id}
                    name={seg.label} stackId="1"
                    stroke={getSegmentColor(seg)} strokeWidth={1.5} fill={`url(#g-${seg.id})`} />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: COLORS.textDim, fontSize: 11, fontFamily: FONTS.mono }} axisLine={{ stroke: COLORS.border }} tickLine={false}
                  tickFormatter={(y) => `Y${y}/${st.currentAge + y}`} interval="preserveStartEnd" minTickGap={30} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: COLORS.textDim, fontSize: 11, fontFamily: FONTS.mono }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const sorted = [...payload].filter(p => p.value > 0).sort((a, b) => b.value - a.value);
                  return (
                    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 14px", fontFamily: FONTS.body, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Year {label} · Age {st.currentAge + label}</div>
                      <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Gains per asset</div>
                      {sorted.map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, marginBottom: 2 }}>
                          <span style={{ color: p.color, fontFamily: FONTS.body, fontWeight: 500 }}>{p.name}</span>
                          <span style={{ color: COLORS.text, fontFamily: FONTS.mono, fontWeight: 600 }}>{formatFull(p.value)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, paddingTop: 12 }} iconType="circle" iconSize={8} />
                {home.enabled && (
                  <Line type="monotone" dataKey="growth_home" name="Primary Home"
                    stroke={ASSET_COLORS.home} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: COLORS.card, stroke: ASSET_COLORS.home }} />
                )}
                {orderedSegments.map((seg) => (
                  <Line key={seg.id} type="monotone"
                    dataKey={`growth_${seg.id}`}
                    name={seg.label}
                    stroke={getSegmentColor(seg)} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: COLORS.card, stroke: getSegmentColor(seg) }} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Growth Contribution Leaderboard */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.text }}>Growth Contribution Leaderboard</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>
              Ranked by total $ growth over {st.years} years — identify which asset classes drive your wealth and where to optimize
            </div>
          </div>
          {(() => {
            const maxGain = Math.max(...contribution.map(c => Math.abs(c.gain)), 1);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {contribution.map((c, i) => {
                  const barWidth = (Math.abs(c.gain) / maxGain) * 100;
                  const isNegative = c.gain < 0;
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 180px", minWidth: 160 }}>
                        <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textDim, fontWeight: 700, minWidth: 18 }}>#{i + 1}</span>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{c.label}</span>
                      </div>
                      <div style={{ flex: "1 1 200px", minWidth: 150, position: "relative", height: 22 }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${barWidth}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}80)`,
                          borderRadius: 4, transition: "width 0.3s",
                        }} />
                      </div>
                      <div style={{ display: "flex", gap: 12, flex: "0 0 260px", justifyContent: "flex-end", minWidth: 240 }}>
                        <div style={{ textAlign: "right", minWidth: 90 }}>
                          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: isNegative ? COLORS.red : COLORS.text, fontWeight: 700 }}>
                            {isNegative ? "-" : "+"}{formatCurrency(Math.abs(c.gain))}
                          </div>
                          <div style={{ fontFamily: FONTS.body, fontSize: 10, color: COLORS.textDim }}>gain</div>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 60 }}>
                          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.text, fontWeight: 600 }}>
                            {c.multiple.toFixed(1)}x
                          </div>
                          <div style={{ fontFamily: FONTS.body, fontSize: 10, color: COLORS.textDim }}>multiple</div>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 60 }}>
                          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: c.color, fontWeight: 600 }}>
                            {c.pctOfGrowth.toFixed(1)}%
                          </div>
                          <div style={{ fontFamily: FONTS.body, fontSize: 10, color: COLORS.textDim }}>of growth</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Strategic Insights — expanded */}
          {contribution.length > 0 && (() => {
            const top = contribution[0];
            const bottom = contribution[contribution.length - 1];
            const topByMultiple = [...contribution].sort((a, b) => b.multiple - a.multiple)[0];
            const cagr = totalNW > 0 ? (Math.pow(finalTotal / totalNW, 1 / st.years) - 1) * 100 : 0;
            const yearsToDouble = cagr > 0 ? 72 / cagr : Infinity;
            const concentrationTop = top.pctOfGrowth;
            const concentrationRisk = concentrationTop > 50;
            const effectiveContribYears = Math.min(st.contributionYears ?? st.years, st.years);
            const totalContribOverYears = st.monthlyAdd * 12 * effectiveContribYears;
            const contribAsPctOfGrowth = growth > 0 ? (totalContribOverYears / growth) * 100 : 0;

            // Asset class diversity
            const significantAssets = contribution.filter(c => c.pctOfGrowth >= 10).length;

            // Find low performers
            const underperformers = contribution.filter(c => c.start > 100000 && c.multiple < 1.5);

            // Tax drag
            const taxDragPct = totalTaxPaid > 0 && growth > 0 ? (totalTaxPaid / (growth + totalTaxPaid)) * 100 : 0;

            const insights = [];

            // Insight 1: Top contributor
            insights.push({
              type: "primary",
              icon: "★",
              color: top.color,
              text: <><span style={{ color: top.color, fontWeight: 600 }}>{top.label}</span> drives <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{top.pctOfGrowth.toFixed(0)}%</span> of total growth (<span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{formatCurrency(top.gain)}</span>). {concentrationRisk ? "Heavy concentration — consider whether you're comfortable with this risk." : "This is your wealth engine."}</>,
            });

            // Insight 2: Highest multiple (efficiency)
            if (topByMultiple.id !== top.id && topByMultiple.multiple > 2) {
              insights.push({
                type: "opportunity",
                icon: "↑",
                color: COLORS.green,
                text: <><span style={{ color: topByMultiple.color, fontWeight: 600 }}>{topByMultiple.label}</span> grew <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{topByMultiple.multiple.toFixed(1)}x</span> — highest efficiency. A larger allocation here could amplify wealth, though typically with more risk.</>,
              });
            }

            // Insight 3: CAGR + rule of 72
            insights.push({
              type: "info",
              icon: "◆",
              color: COLORS.accent,
              text: <>Portfolio CAGR is <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{cagr.toFixed(1)}%</span>. At this rate, your wealth doubles every <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>~{yearsToDouble.toFixed(1)} years</span> (Rule of 72).</>,
            });

            // Insight 4: Contribution vs growth ratio
            if (st.monthlyAdd > 0 && growth > 0) {
              if (contribAsPctOfGrowth < 20) {
                insights.push({
                  type: "info",
                  icon: "◆",
                  color: COLORS.purple,
                  text: <>Your <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{formatCurrency(totalContribOverYears)}</span> in contributions over {effectiveContribYears} years accounts for only <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{contribAsPctOfGrowth.toFixed(0)}%</span> of your growth — the rest is pure compounding. The market is doing the heavy lifting.</>,
                });
              } else {
                insights.push({
                  type: "warning",
                  icon: "!",
                  color: COLORS.amber,
                  text: <>Contributions (<span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{formatCurrency(totalContribOverYears)}</span>) are <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{contribAsPctOfGrowth.toFixed(0)}%</span> of total growth — you're earning your wealth more than compounding it. Consider boosting return rates or extending the time horizon.</>,
                });
              }
            }

            // Insight 5: Underperformers
            if (underperformers.length > 0) {
              const total = underperformers.reduce((sum, c) => sum + c.start, 0);
              insights.push({
                type: "warning",
                icon: "!",
                color: COLORS.amber,
                text: <><span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{formatCurrency(total)}</span> sits in low-multiple assets ({underperformers.map(u => u.label).join(", ")}). Reallocating even part of this toward higher-return assets could meaningfully improve outcomes — assuming you accept the added risk.</>,
              });
            }

            // Insight 6: Concentration check
            if (significantAssets <= 2) {
              insights.push({
                type: "warning",
                icon: "!",
                color: COLORS.red,
                text: <>Only <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{significantAssets}</span> asset {significantAssets === 1 ? "class drives" : "classes drive"} most of your growth. Diversification could reduce downside risk if your top performer underperforms its historical average.</>,
              });
            }

            // Insight 7: Tax drag (only if taxes are on)
            if (st.applyGainsTax && taxDragPct > 5) {
              insights.push({
                type: "warning",
                icon: "!",
                color: COLORS.red,
                text: <>Annual gains taxes are dragging <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{taxDragPct.toFixed(0)}%</span> off your growth. Tax-advantaged accounts (401k, IRA, Roth, HSA) and tax-loss harvesting could recover meaningful value.</>,
              });
            }

            // Insight 8: Withdrawal sustainability
            if (st.annualWithdrawal > 0) {
              const withdrawalRate = (st.annualWithdrawal / totalNW) * 100;
              if (withdrawalRate > 4) {
                insights.push({
                  type: "warning",
                  icon: "!",
                  color: COLORS.red,
                  text: <>Your <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{withdrawalRate.toFixed(1)}%</span> annual withdrawal rate exceeds the 4% safe withdrawal rule. Consider whether this is sustainable across market downturns.</>,
                });
              } else if (depleted) {
                insights.push({
                  type: "warning",
                  icon: "!",
                  color: COLORS.red,
                  text: <>Your withdrawals deplete the portfolio before reaching year {st.years}. Reduce annual withdrawal, extend contributions, or shift to higher-return assets.</>,
                });
              } else {
                insights.push({
                  type: "info",
                  icon: "◆",
                  color: COLORS.green,
                  text: <>Your <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{withdrawalRate.toFixed(1)}%</span> withdrawal rate is within the 4% safe withdrawal guideline — portfolio is likely sustainable across most market conditions.</>,
                });
              }
            }

            // Insight 9: Inflation impact
            if (st.adjustInflation && st.inflationRate > 0) {
              const nominalFinal = chartData[chartData.length - 1].total * Math.pow(1 + st.inflationRate / 100, st.years);
              const realLossPct = ((nominalFinal - finalTotal) / nominalFinal) * 100;
              if (realLossPct > 30) {
                insights.push({
                  type: "warning",
                  icon: "!",
                  color: COLORS.purple,
                  text: <>Inflation erodes <span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{realLossPct.toFixed(0)}%</span> of nominal wealth over {st.years} years. Asset classes that beat inflation (stocks, real estate) become essential, not optional.</>,
                });
              }
            }

            // Insight 10: Worst contributor (always last)
            if (bottom.id !== top.id && bottom.start > 0) {
              insights.push({
                type: "secondary",
                icon: "▾",
                color: COLORS.textMuted,
                text: <><span style={{ color: bottom.color, fontWeight: 600 }}>{bottom.label}</span> contributed least to growth (<span style={{ fontFamily: FONTS.mono, fontWeight: 600 }}>{bottom.pctOfGrowth.toFixed(1)}%</span>). If it's a defensive position (cash, bonds), this may be intentional for stability — otherwise, reconsider its role.</>,
              });
            }

            return (
              <div style={{ marginTop: 20, padding: "16px 18px", background: COLORS.input, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Strategic Insights</div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim }}>{insights.length} observations</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {insights.map((insight, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 4, background: `${insight.color}15`,
                        color: insight.color, fontSize: 14, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                        border: `1px solid ${insight.color}30`,
                      }}>
                        {insight.icon}
                      </div>
                      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, lineHeight: 1.5, flex: 1 }}>
                        {insight.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Data Table with Age */}
        <div style={{ marginBottom: 24 }}>
          <DataTable chartData={chartData} segments={segments} currentAge={st.currentAge} homeEnabled={home.enabled} showNominal={st.adjustInflation} />
        </div>

        {/* Scenario Planning */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.text }}>Scenario Planning</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>Try common allocation frameworks against your current plan — for exploration only, not financial advice</div>
            </div>
          </div>

          {/* Preset Strategies */}
          <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(8,145,178,0.04)", border: `1px solid rgba(8,145,178,0.15)`, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, color: COLORS.accent, letterSpacing: "0.05em", textTransform: "uppercase" }}>Preset Allocation Strategies</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>Applied to your current total NW of {formatFull(totalNW)}</div>
              </div>
              <button onClick={applyAllPresets}
                style={{ background: COLORS.accent, border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 12, color: "#fff", fontWeight: 600 }}>
                Compare All 3 vs My Plan
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <div key={key} style={{ flex: "1 1 240px", minWidth: 220, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, fontWeight: 600, marginBottom: 4 }}>{preset.name}</div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textDim, marginBottom: 10, lineHeight: 1.4 }}>{preset.description}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
                    {Object.entries(preset.allocations)
                      .filter(([, pct]) => pct > 0)
                      .sort(([, a], [, b]) => b - a)
                      .map(([id, pct]) => {
                        const label = segments.find(s => s.id === id)?.label || id;
                        return (
                          <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: FONTS.body }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted }}>
                              <span style={{ width: 6, height: 6, borderRadius: 1, background: getSegmentColor(segments.find(s => s.id === id) || { id }) }} />
                              {label}
                            </span>
                            <span style={{ fontFamily: FONTS.mono, color: COLORS.text, fontWeight: 600 }}>{pct}%</span>
                          </div>
                        );
                      })}
                  </div>
                  <button onClick={() => applyPreset(key)}
                    style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.accent}`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>
                    Add as Scenario
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontFamily: FONTS.body, fontSize: 10, color: COLORS.textDim, lineHeight: 1.5, fontStyle: "italic" }}>
              These are illustrative frameworks based on common industry conventions, not personalized advice. Asset class behavior varies year-to-year; historical returns aren't guaranteed. Consult a fiduciary financial advisor before making allocation changes at this scale.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Custom scenario name"
              style={{ flex: "1 1 240px", background: COLORS.input, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "10px 12px", fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, outline: "none" }} />
            <button onClick={saveScenario}
              style={{ background: COLORS.accent, border: "none", borderRadius: 6, padding: "10px 18px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 13, color: "#fff", fontWeight: 600 }}>
              Save Current as Scenario
            </button>
            {scenarios.length > 0 && (
              <button onClick={() => setScenarios([])}
                style={{ background: "rgba(220,38,38,0.06)", border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 6, padding: "10px 14px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 12, color: COLORS.red, fontWeight: 500 }}>
                Clear All
              </button>
            )}
          </div>

          {scenarios.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenarios.map((s, i) => {
                const end = s.result.chartData[s.result.chartData.length - 1]?.total || 0;
                const color = SCENARIO_COLORS[(i + 1) % SCENARIO_COLORS.length];
                return (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    background: COLORS.input, border: `1px solid ${COLORS.border}`, borderRadius: 8, flexWrap: "wrap",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <div style={{ flex: "1 1 200px" }}>
                      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textDim }}>{s.settingsSnap.years}yr horizon · ends at {formatCurrency(end)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => loadScenario(s.id)}
                        style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
                        Load
                      </button>
                      <button onClick={() => removeScenario(s.id)}
                        style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: FONTS.body, fontSize: 11, color: COLORS.red, fontWeight: 500 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scenario Comparison Chart */}
        {scenarios.length > 0 && (
          <ScenarioComparison scenarios={scenarios} currentScenario={currentScenario} currentAge={st.currentAge} />
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", fontFamily: FONTS.body, fontSize: 12, color: COLORS.textDim, paddingBottom: 20 }}>
          Built by Vin · Wealth Building Series · For educational purposes only, not financial advice
        </div>
      </div>
    </div>
  );
}
