"use client";
import { useState, useMemo } from "react";

/* ── helpers ─────────────────────────────────────────────────────── */
function fmt(n: number) { return "$" + Math.round(n).toLocaleString(); }
function fmtD(n: number) { return "$" + n.toFixed(2); }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/* ── Slider ──────────────────────────────────────────────────────── */
interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  color?: string;
}

function Slider({ label, min, max, step, value, onChange, format, color }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : value.toString();
  const barColor = color || "var(--accent)";
  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value" style={{ color: barColor }}>{display}</span>
      </div>
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${pct}%`, background: barColor }} />
        <div className="slider-thumb" style={{ left: `${pct}%`, borderColor: barColor }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-input"
          aria-label={label}
        />
      </div>
    </div>
  );
}

/* ── MetricCard ───────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, accent, warn }: {
  label: string; value: string; sub?: string; accent?: boolean; warn?: boolean;
}) {
  const borderColor = warn ? "rgba(248,81,73,0.5)" : accent ? "rgba(88,166,255,0.3)" : "var(--border)";
  const bg = warn ? "rgba(248,81,73,0.08)" : accent ? "var(--accent-bg)" : "var(--bg2)";
  const fg = warn ? "var(--red)" : accent ? "var(--accent)" : "var(--text)";
  const labelColor = warn ? "var(--red)" : accent ? "var(--accent)" : "var(--muted)";
  return (
    <div style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "14px 16px" }}>
      <div style={{ fontSize: "11px", color: labelColor, letterSpacing: "0.06em", marginBottom: "6px", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: fg }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}

/* ── SectionHeader ────────────────────────────────────────────────── */
function SectionHeader({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="section-header">
      {icon && <span className="section-icon">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

/* ── BreakdownRow ─────────────────────────────────────────────────── */
function BreakdownRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
        <span style={{ color: "var(--muted)" }}>{label}</span>
        <span style={{ color: "var(--text)" }}>{fmt(value)}</span>
      </div>
      <div className="breakdown-track">
        <div className="breakdown-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function Home() {
  // workforce
  const [loaders, setLoaders] = useState(30);
  const [ratio, setRatio] = useState(3);
  const [supportPct, setSupportPct] = useState(33);
  const [wage, setWage] = useState(35);
  const [benefitsPct, setBenefitsPct] = useState(25);

  // equipment
  const [owned, setOwned] = useState(16);
  const [loaderCost, setLoaderCost] = useState(250000);
  const [lifespan, setLifespan] = useState(10);

  // service
  const [weeks, setWeeks] = useState(24);
  const [freq, setFreq] = useState(1);
  const [driveways, setDriveways] = useState(60000);

  // timing
  const [minPerDriveway, setMinPerDriveway] = useState(4);
  const [travelMin, setTravelMin] = useState(2);

  // driveway surface
  const [gravelPct, setGravelPct] = useState(5);

  // overhead & insurance
  const [overheadPct, setOverheadPct] = useState(15);
  const [insuranceCost, setInsuranceCost] = useState(500000);

  const calc = useMemo(() => {
    /* ── timing & capacity ──────────────────────────────── */
    const avgMinPerDriveway = minPerDriveway * (1 + gravelPct / 100); // gravel adds time
    const totalMinPerDriveway = avgMinPerDriveway + travelMin;
    const drivewaysPerLoaderHour = 60 / totalMinPerDriveway;

    // how many driveway-services per week needed
    const servicesPerWeek = driveways * freq;

    // each loader operates 8 hrs/shift, ratio shifts/day, 7 days/week
    const loaderHoursPerWeek = 8 * ratio * 7;
    const drivewaysOneLoaderPerWeek = drivewaysPerLoaderHour * loaderHoursPerWeek;

    // loaders actually needed (reactive to driveways)
    const loadersNeeded = Math.max(1, Math.ceil(servicesPerWeek / drivewaysOneLoaderPerWeek));
    const effectiveLoaders = clamp(loaders, loadersNeeded, loaders);

    /* ── workforce (reactive) ───────────────────────────── */
    const operators = effectiveLoaders * ratio;
    const supportStaff = Math.round(operators * (supportPct / 100));
    const totalStaff = operators + supportStaff;

    /* ── wages ───────────────────────────────────────────── */
    const weeklyOpHours = operators * 8 * 7;
    const weeklySuppHours = supportStaff * 8 * 7;
    const seasonOpWages = weeklyOpHours * wage * weeks;
    const seasonSuppWages = weeklySuppHours * wage * weeks;
    const totalWages = seasonOpWages + seasonSuppWages;

    /* ── benefits ────────────────────────────────────────── */
    const totalBenefits = totalWages * (benefitsPct / 100);

    /* ── equipment ───────────────────────────────────────── */
    const newLoaders = Math.max(0, effectiveLoaders - owned);
    const loaderCapex = newLoaders * loaderCost;
    const annualizedLoaders = lifespan > 0 ? loaderCapex / lifespan : 0;

    /* ── overhead & insurance ────────────────────────────── */
    const overheadCost = (totalWages + totalBenefits) * (overheadPct / 100);

    /* ── totals ──────────────────────────────────────────── */
    const totalAnnual = totalWages + totalBenefits + annualizedLoaders + overheadCost + insuranceCost;
    const perDriveway = driveways > 0 ? totalAnnual / driveways : 0;

    return {
      effectiveLoaders, loadersNeeded,
      operators, supportStaff, totalStaff,
      seasonOpWages, seasonSuppWages, totalWages,
      totalBenefits,
      newLoaders, loaderCapex, annualizedLoaders,
      overheadCost,
      totalAnnual, perDriveway,
      drivewaysPerLoaderHour, avgMinPerDriveway,
    };
  }, [loaders, ratio, supportPct, wage, benefitsPct, owned, loaderCost, lifespan, weeks, freq, driveways, minPerDriveway, travelMin, gravelPct, overheadPct, insuranceCost]);

  const overBudget = calc.perDriveway > 250;

  return (
    <div className="page-wrap">

      {/* ─── Header ─── */}
      <header className="page-header">
        <div className="header-tag">// city of greater sudbury</div>
        <h1 className="header-title">Snow Plow Cost Calculator</h1>
        <p className="header-desc">
          Full cost model for a citywide opt-in residential driveway plowing program.
          Adjust any parameter — workforce, equipment, timing, and surface conditions — to see costs update live.
        </p>
      </header>

      {/* ─── Hero metric ─── */}
      <div className={`hero-metric ${overBudget ? "hero-warn" : ""}`}>
        <div className="hero-label">annual cost per driveway owner</div>
        <div className="hero-value">{fmtD(calc.perDriveway)}</div>
        <div className="hero-sub">
          ≈ {fmtD(calc.perDriveway / 12)} / month &nbsp;·&nbsp; {fmtD(calc.perDriveway / 52)} / week
        </div>
        {overBudget && <div className="hero-alert">⚠ Over $250 — may reduce opt-in participation</div>}
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="grid-layout">

        {/* ═══════ LEFT: Controls ═══════ */}
        <div>

          <SectionHeader icon="👷">Workforce</SectionHeader>

          <Slider label="Loaders in operation" min={1} max={60} step={1}
            value={loaders} onChange={setLoaders}
            format={v => `${v} loaders`} />
          {calc.loadersNeeded > loaders && (
            <div className="inline-warn">
              ⚠ Need at least {calc.loadersNeeded} loaders to service {driveways.toLocaleString()} driveways {freq}x/wk
            </div>
          )}
          <Slider label="Crew shifts per loader" min={1} max={4} step={1}
            value={ratio} onChange={setRatio}
            format={v => `${v} shifts → ${loaders * v} operators`} />
          <Slider label="Support staff (% of operators)" min={0} max={80} step={1}
            value={supportPct} onChange={setSupportPct}
            format={v => `${v}% → ${Math.round(loaders * ratio * v / 100)} staff`} />
          <Slider label="Avg hourly wage" min={18} max={75} step={1}
            value={wage} onChange={setWage}
            format={v => `$${v}/hr`} />
          <Slider label="Benefits (% of wages)" min={0} max={60} step={1}
            value={benefitsPct} onChange={setBenefitsPct}
            format={v => `${v}%`} color="var(--green)" />

          <SectionHeader icon="🚜">Equipment</SectionHeader>

          <Slider label="City-owned loaders" min={0} max={60} step={1}
            value={owned} onChange={setOwned}
            format={v => `${v} owned → buy ${Math.max(0, loaders - v)} more`} />
          <Slider label="Cost per new loader" min={50000} max={2000000} step={10000}
            value={loaderCost} onChange={setLoaderCost}
            format={v => `$${(v / 1000).toLocaleString()}k`} color="var(--amber)" />
          <Slider label="Loader useful life" min={3} max={25} step={1}
            value={lifespan} onChange={setLifespan}
            format={v => `${v} years`} />

          <SectionHeader icon="⏱️">Timing &amp; Efficiency</SectionHeader>

          <Slider label="Minutes per driveway (paved)" min={2} max={20} step={0.5}
            value={minPerDriveway} onChange={setMinPerDriveway}
            format={v => `${v} min`} />
          <Slider label="Avg travel between driveways" min={1} max={15} step={0.5}
            value={travelMin} onChange={setTravelMin}
            format={v => `${v} min`} />
          <Slider label="Gravel driveways (2× time)" min={0} max={100} step={1}
            value={gravelPct} onChange={setGravelPct}
            format={v => `${v}%`} color="var(--amber)" />

          <div className="info-box">
            Effective avg per driveway: <strong>{calc.avgMinPerDriveway.toFixed(1)} min</strong> plow + {travelMin} min travel
            = <strong>{(calc.avgMinPerDriveway + travelMin).toFixed(1)} min total</strong>
            &nbsp;→ <strong>{calc.drivewaysPerLoaderHour.toFixed(1)}</strong> driveways/loader/hour
          </div>

          <SectionHeader icon="📅">Service Parameters</SectionHeader>

          <Slider label="Season length" min={4} max={32} step={1}
            value={weeks} onChange={setWeeks}
            format={v => `${v} weeks`} />
          <Slider label="Plowing frequency" min={1} max={7} step={1}
            value={freq} onChange={setFreq}
            format={v => `${v}× / week`} />
          <Slider label="Total driveways in city" min={5000} max={150000} step={1000}
            value={driveways} onChange={setDriveways}
            format={v => v.toLocaleString()} />

          <SectionHeader icon="🛡️">Insurance &amp; Overhead</SectionHeader>

          <Slider label="Annual insurance" min={0} max={5000000} step={50000}
            value={insuranceCost} onChange={setInsuranceCost}
            format={v => fmt(v)} color="var(--red)" />
          <Slider label="Misc overhead (fuel, salt, admin…)" min={0} max={50} step={1}
            value={overheadPct} onChange={setOverheadPct}
            format={v => `${v}%`} />
        </div>

        {/* ═══════ RIGHT: Results ═══════ */}
        <div>

          <SectionHeader icon="📊">Summary</SectionHeader>

          <div className="metric-grid">
            <MetricCard label="Effective Loaders" value={calc.effectiveLoaders.toString()}
              sub={`Need ≥${calc.loadersNeeded} for demand`} />
            <MetricCard label="Total Staff" value={calc.totalStaff.toString()}
              sub={`${calc.operators} operators + ${calc.supportStaff} support`} />
            <MetricCard label="Season Wages" value={fmt(calc.totalWages)}
              sub={`${weeks} wks × ${freq}×/wk`} />
            <MetricCard label="Staff Benefits" value={fmt(calc.totalBenefits)}
              sub={`${benefitsPct}% of wages`} />
            <MetricCard label="New Loaders Needed" value={calc.newLoaders.toString()}
              sub={calc.newLoaders > 0 ? `${fmt(calc.loaderCapex)} capex` : "None needed"} />
            <MetricCard label="Insurance" value={fmt(insuranceCost)}
              sub="Liability & equipment" />
            <MetricCard label="Total Annual Cost" value={fmt(calc.totalAnnual)} accent />
            <MetricCard label="Per Driveway / Year" value={fmtD(calc.perDriveway)}
              accent={!overBudget} warn={overBudget}
              sub={overBudget ? "Exceeds $250 target" : `${driveways.toLocaleString()} driveways`} />
          </div>

          <SectionHeader icon="📈">Cost Breakdown</SectionHeader>

          <BreakdownRow label="Operator wages" value={calc.seasonOpWages} total={calc.totalAnnual} color="var(--accent)" />
          <BreakdownRow label="Support staff wages" value={calc.seasonSuppWages} total={calc.totalAnnual} color="var(--accent)" />
          <BreakdownRow label={`Staff benefits (${benefitsPct}%)`} value={calc.totalBenefits} total={calc.totalAnnual} color="var(--green)" />
          <BreakdownRow label={`Loader capex (÷ ${lifespan} yr)`} value={calc.annualizedLoaders} total={calc.totalAnnual} color="var(--amber)" />
          <BreakdownRow label={`Overhead (${overheadPct}%)`} value={calc.overheadCost} total={calc.totalAnnual} color="var(--muted)" />
          <BreakdownRow label="Insurance" value={insuranceCost} total={calc.totalAnnual} color="var(--red)" />

          <div className="breakdown-total">
            <span>Total annual cost</span>
            <span style={{ color: overBudget ? "var(--red)" : "var(--accent)" }}>{fmt(calc.totalAnnual)}</span>
          </div>

          <SectionHeader icon="📝">Assumptions &amp; Context</SectionHeader>
          <div className="context-list">
            <div>Based on Greater Sudbury&apos;s ~{driveways.toLocaleString()} residential driveways</div>
            <div>City currently owns {owned} loaders; need {calc.newLoaders} more for {calc.effectiveLoaders}-loader operation</div>
            <div>Loader capex amortized over {lifespan}-year useful life</div>
            <div>{ratio} shifts/loader × {calc.effectiveLoaders} loaders = {calc.operators} operators for 24/7 coverage</div>
            <div>Wages at ${wage}/hr + {benefitsPct}% benefits — no overtime premium factored</div>
            <div>{gravelPct}% gravel driveways take {minPerDriveway * 2} min vs {minPerDriveway} min paved</div>
            <div>Insurance at {fmt(insuranceCost)}/yr covers liability, equipment, property damage</div>
            <div>Overhead ({overheadPct}%) covers fuel, salt, sand, admin, facility costs</div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        Cost estimates are illustrative. Actual municipal costs vary based on collective agreements, equipment financing terms, insurance markets, and operational factors.
      </footer>
    </div>
  );
}
