"use client";
import { useState, useMemo } from "react";

interface SliderProps {
  label: string;
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

function Slider({ label, min, max, step, value, onChange, format }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : value.toString();
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", color: "var(--muted)", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>{display}</span>
      </div>
      <div style={{ position: "relative", height: "4px", background: "var(--bg3)", borderRadius: "2px" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`, background: "var(--accent)", borderRadius: "2px",
          transition: "width 0.1s"
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "absolute", top: "50%", left: 0, width: "100%",
            transform: "translateY(-50%)", opacity: 0, cursor: "pointer",
            height: "20px", margin: 0,
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? "var(--accent-bg)" : "var(--bg2)",
      border: `1px solid ${accent ? "rgba(88,166,255,0.3)" : "var(--border)"}`,
      borderRadius: "8px",
      padding: "14px 16px",
    }}>
      <div style={{ fontSize: "11px", color: accent ? "var(--accent)" : "var(--muted)", letterSpacing: "0.06em", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: accent ? "var(--accent)" : "var(--text)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "10px", letterSpacing: "0.12em", color: "var(--muted)",
      textTransform: "uppercase", marginBottom: "1rem", marginTop: "1.75rem",
      paddingBottom: "6px", borderBottom: "1px solid var(--border)",
    }}>
      {children}
    </div>
  );
}

function fmt(n: number) { return "$" + Math.round(n).toLocaleString(); }
function fmtD(n: number) { return "$" + n.toFixed(2); }

export default function Home() {
  const [loaders, setLoaders] = useState(30);
  const [ratio, setRatio] = useState(3);
  const [support, setSupport] = useState(33);
  const [wage, setWage] = useState(35);
  const [owned, setOwned] = useState(16);
  const [loaderCost, setLoaderCost] = useState(150);
  const [lifespan, setLifespan] = useState(10);
  const [weeks, setWeeks] = useState(24);
  const [freq, setFreq] = useState(1);
  const [driveways, setDriveways] = useState(60000);
  const [overhead, setOverhead] = useState(15);

  const calc = useMemo(() => {
    const operators = loaders * ratio;
    const supportStaff = Math.round(operators * (support / 100));
    const totalStaff = operators + supportStaff;

    const weeklyOpHours = operators * 8 * 7 * freq;
    const weeklySuppHours = supportStaff * 8 * 7 * freq;

    const seasonOpWages = weeklyOpHours * wage * weeks;
    const seasonSuppWages = weeklySuppHours * wage * weeks;
    const totalWages = seasonOpWages + seasonSuppWages;

    const newLoaders = Math.max(0, loaders - owned);
    const loaderCapex = newLoaders * loaderCost * 1000;
    const annualizedLoaders = loaderCapex / lifespan;

    const overheadCost = totalWages * (overhead / 100);
    const totalAnnual = totalWages + annualizedLoaders + overheadCost;
    const perDriveway = driveways > 0 ? totalAnnual / driveways : 0;

    return {
      operators, supportStaff, totalStaff,
      seasonOpWages, seasonSuppWages, totalWages,
      newLoaders, loaderCapex, annualizedLoaders,
      overheadCost, totalAnnual, perDriveway,
    };
  }, [loaders, ratio, support, wage, owned, loaderCost, lifespan, weeks, freq, driveways, overhead]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "11px", color: "var(--accent)", letterSpacing: "0.12em", marginBottom: "8px" }}>
          // city of greater sudbury
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "8px" }}>
          Snow Plow Cost Calculator
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
          Estimate the annual cost of citywide residential driveway plowing — and what each property owner would pay.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "2rem" }}>

        {/* LEFT: Controls */}
        <div>
          <SectionHeader>workforce</SectionHeader>

          <Slider label="Loaders in operation" id="loaders" min={10} max={60} step={1}
            value={loaders} onChange={setLoaders} format={v => `${v} loaders`} />
          <Slider label="Crew shifts per loader (operators)" id="ratio" min={2} max={4} step={1}
            value={ratio} onChange={setRatio} format={v => `${v} shifts × ${loaders} = ${loaders * v} operators`} />
          <Slider label="Support staff (% of operators)" id="support" min={10} max={60} step={1}
            value={support} onChange={setSupport} format={v => `${v}% → ${Math.round(loaders * ratio * v / 100)} staff`} />
          <Slider label="Hourly wage" id="wage" min={20} max={65} step={1}
            value={wage} onChange={setWage} format={v => `$${v}/hr`} />

          <SectionHeader>equipment</SectionHeader>

          <Slider label="City-owned loaders (no purchase needed)" id="owned" min={0} max={40} step={1}
            value={owned} onChange={setOwned} format={v => `${v} owned → buy ${Math.max(0, loaders - v)} more`} />
          <Slider label="Cost per new loader" id="loaderCost" min={100} max={350} step={10}
            value={loaderCost} onChange={setLoaderCost} format={v => `$${v},000`} />
          <Slider label="Loader lifespan" id="lifespan" min={5} max={20} step={1}
            value={lifespan} onChange={setLifespan} format={v => `${v} years`} />

          <SectionHeader>service parameters</SectionHeader>

          <Slider label="Season length" id="weeks" min={8} max={32} step={1}
            value={weeks} onChange={setWeeks} format={v => `${v} weeks`} />
          <Slider label="Plowing frequency" id="freq" min={1} max={5} step={1}
            value={freq} onChange={setFreq} format={v => `${v}x / week`} />
          <Slider label="Total driveways in city" id="driveways" min={10000} max={120000} step={1000}
            value={driveways} onChange={setDriveways} format={v => v.toLocaleString()} />
          <Slider label="Misc overhead (fuel, salt, insurance…)" id="overhead" min={0} max={40} step={1}
            value={overhead} onChange={setOverhead} format={v => `${v}%`} />
        </div>

        {/* RIGHT: Results */}
        <div>
          <SectionHeader>annual cost per driveway owner</SectionHeader>

          <div style={{
            background: "var(--accent-bg)",
            border: "1px solid rgba(88,166,255,0.4)",
            borderRadius: "10px",
            padding: "20px 22px",
            marginBottom: "1.25rem",
          }}>
            <div style={{ fontSize: "11px", color: "var(--accent)", letterSpacing: "0.08em", marginBottom: "8px" }}>per driveway / year</div>
            <div style={{ fontSize: "48px", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
              {fmtD(calc.perDriveway)}
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "10px" }}>
              ≈ {fmtD(calc.perDriveway / 12)} / month &nbsp;·&nbsp; {fmtD(calc.perDriveway / 52)} / week
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
            <MetricCard label="total staff" value={calc.totalStaff.toString()}
              sub={`${calc.operators} operators + ${calc.supportStaff} support`} />
            <MetricCard label="season wages" value={fmt(calc.totalWages)}
              sub={`${weeks} wks × ${freq}x/wk`} />
            <MetricCard label="new loaders needed" value={calc.newLoaders.toString()}
              sub={calc.newLoaders > 0 ? `${fmt(calc.loaderCapex)} capex` : "none needed"} />
            <MetricCard label="total annual cost" value={fmt(calc.totalAnnual)} />
          </div>

          <SectionHeader>cost breakdown</SectionHeader>

          <div style={{ fontSize: "12px" }}>
            {[
              { label: "Operator wages (full season)", value: calc.seasonOpWages, color: "var(--accent)" },
              { label: "Support staff wages (full season)", value: calc.seasonSuppWages, color: "var(--accent)" },
              { label: `New loader capex (÷ ${lifespan} yr)`, value: calc.annualizedLoaders, color: "var(--amber)" },
              { label: `Overhead (${overhead}%)`, value: calc.overheadCost, color: "var(--muted)" },
            ].map((row, i) => {
              const pct = calc.totalAnnual > 0 ? (row.value / calc.totalAnnual) * 100 : 0;
              return (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "var(--muted)" }}>{row.label}</span>
                    <span style={{ color: "var(--text)" }}>{fmt(row.value)}</span>
                  </div>
                  <div style={{ height: "3px", background: "var(--bg3)", borderRadius: "2px" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: row.color, borderRadius: "2px", transition: "width 0.2s"
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{
              display: "flex", justifyContent: "space-between",
              paddingTop: "10px", borderTop: "1px solid var(--border2)",
              fontWeight: 600, marginTop: "6px"
            }}>
              <span>Total annual cost</span>
              <span style={{ color: "var(--accent)" }}>{fmt(calc.totalAnnual)}</span>
            </div>
          </div>

          <SectionHeader>context</SectionHeader>
          <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.8 }}>
            <div>· Based on Greater Sudbury's ~{driveways.toLocaleString()} residential driveways</div>
            <div>· City currently owns {owned} loaders; needs {calc.newLoaders} more for {loaders}-loader operation</div>
            <div>· Loader capex amortized over {lifespan}-year lifespan</div>
            <div>· 24/7 coverage = {ratio} shifts per loader, {loaders * ratio} total operators</div>
            <div>· Wages at ${wage}/hr — no benefits factored in</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "3rem", fontSize: "11px", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
        Cost estimates are illustrative. Actual municipal costs vary based on collective agreements, equipment financing terms, and operational factors.
      </div>
    </div>
  );
}
