import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { DEFAULTS, WHO_LDEN_THRESHOLD } from '../../data/constants';
import { computeEBD } from '../../utils/ebdCalculator';

const STEPS = ['Lden', 'RR', 'PAF', 'DALYs', 'EBD', 'Risk'];

function Pipeline({ step }) {
  return (
    <div className="pipeline">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <span className={`pipeline-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            {i < step ? '✓' : ''} {s}
          </span>
          {i < STEPS.length - 1 && <span className="pipeline-arrow">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function Field({ label, name, value, onChange, unit, hint, hintClass }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{unit ? <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}> ({unit})</span> : null}
      </label>
      <input className="form-input" type="number" name={name} value={value}
        onChange={onChange} step="any" />
      {hint && <span className={`form-hint ${hintClass || ''}`}>{hint}</span>}
    </div>
  );
}

export default function EBDCalculator() {
  const [inp, setInp] = useState(DEFAULTS);
  const set = (e) => setInp({ ...inp, [e.target.name]: parseFloat(e.target.value) || 0 });
  const r = useMemo(() => computeEBD(inp), [inp]);
  const step = r.ebd > 0 ? 5 : 0;

  // Sensitivity data: EBD vs Lden
  const curve = useMemo(() => {
    const pts = [];
    for (let l = 45; l <= 85; l += 0.5) {
      const v = computeEBD({ ...inp, lden: l });
      pts.push({ lden: l, ebd: Math.round(v.ebd * 10) / 10 });
    }
    return pts;
  }, [inp]);

  return (
    <div>
      <Pipeline step={step} />

      {/* Inputs */}
      <div className="card">
        <h2 className="card-title">Input Parameters</h2>
        <p className="card-desc">
          Enter noise exposure and population data for a 1 km grid cell.
          The EBD pipeline computes the IHD disease burden attributable to traffic noise.
        </p>
        <div className="form-grid">
          <Field label="Noise Level" name="lden" value={inp.lden} onChange={set}
            unit="Lden dB(A)" hint={r.exceedsWHO ? `⚠ Exceeds WHO ${WHO_LDEN_THRESHOLD} dB` : `✓ Below WHO ${WHO_LDEN_THRESHOLD} dB`}
            hintClass={r.exceedsWHO ? 'warn' : 'ok'} />
          <Field label="Total Population" name="population" value={inp.population} onChange={set}
            unit="persons" hint="Grid cell population" />
          <Field label="Elderly Population (65+)" name="elderlyPop" value={inp.elderlyPop} onChange={set}
            unit="persons" hint="Threshold: 620 (33rd pctl)" />
          <Field label="IHD Mortality Rate" name="mortalityRate" value={inp.mortalityRate} onChange={set}
            unit="per 100k" />
          <Field label="IHD Prevalence Rate" name="prevalenceRate" value={inp.prevalenceRate} onChange={set}
            unit="per 100k" />
          <Field label="Remaining Life Expectancy" name="remainingLifeExp" value={inp.remainingLifeExp} onChange={set}
            unit="years" />
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <h2 className="card-title">Computation Results</h2>
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-value">{r.rr.toFixed(4)}</div>
            <div className="metric-label">Relative Risk</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{(r.paf * 100).toFixed(2)}%</div>
            <div className="metric-label">PAF</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{r.ylls.toFixed(1)}</div>
            <div className="metric-label">YLLs</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{r.ylds.toFixed(1)}</div>
            <div className="metric-label">YLDs</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{r.dalys.toFixed(1)}</div>
            <div className="metric-label">DALYs</div>
          </div>
          <div className="metric-card" style={{
            background: r.risk === 'High' ? 'var(--color-risk-high-bg)' :
                        r.risk === 'Medium' ? 'var(--color-risk-med-bg)' : 'var(--color-risk-low-bg)',
          }}>
            <div className="metric-value">{r.ebd.toFixed(1)}</div>
            <div className="metric-label">EBD (DALYs)</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16,
          padding: 12, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Health Risk:</span>
          <span className={`risk-badge ${r.risk.toLowerCase()}`}>
            {r.risk === 'High' ? '🔴' : r.risk === 'Medium' ? '🟡' : '🟢'} {r.risk}
          </span>
        </div>
      </div>

      {/* Sensitivity Chart */}
      <div className="card">
        <h2 className="card-title">Sensitivity: EBD vs. Noise Level</h2>
        <p className="card-desc">Other inputs held constant. WHO threshold at 53 dB; current value marked.</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={curve} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis dataKey="lden" tick={{ fontSize: 11 }} label={{ value: 'Lden (dB)', position: 'insideBottom', offset: -2, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'EBD (DALYs)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`${v} DALYs`, 'EBD']} labelFormatter={(v) => `Lden: ${v} dB`} />
            <ReferenceLine x={WHO_LDEN_THRESHOLD} stroke="var(--color-who)" strokeDasharray="4 4" label={{ value: 'WHO 53 dB', fill: 'var(--color-who)', fontSize: 10 }} />
            <ReferenceLine x={inp.lden} stroke="var(--color-risk-high)" strokeDasharray="2 2" label={{ value: `${inp.lden} dB`, fill: 'var(--color-risk-high)', fontSize: 10 }} />
            <Line type="monotone" dataKey="ebd" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Formula Reference */}
      <div className="card">
        <h2 className="card-title">Formula Reference</h2>
        <div className="formula-block">
          <div><b>EBD<sub>IHD</sub> = PAF × DALYs</b></div><br />
          <div>RR = exp( ln(1.08) / 10 × (L<sub>den</sub> − 53) ) &nbsp; if L<sub>den</sub> &gt; 53 dB</div>
          <div>PAF = (RR − 1) / RR</div>
          <div>DALYs = YLLs + YLDs</div>
          <div>YLLs = Deaths × Remaining Life Expectancy</div>
          <div>YLDs = Prevalent Cases × DW (0.521)</div>
        </div>
      </div>
    </div>
  );
}
