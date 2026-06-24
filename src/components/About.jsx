import React from 'react';
import { WHO_LDEN_THRESHOLD, DISABILITY_WEIGHT, THRESHOLDS, CLUSTERS } from '../data/constants';

export default function About() {
  return (
    <div className="about">
      <div className="card">
        <h2>About This Dashboard</h2>
        <p>
          This dashboard visualizes traffic noise-attributed health risks across Seoul's
          1 km grid system. It implements the Environmental Burden of Disease (EBD)
          framework developed in a doctoral dissertation on machine learning-based
          sustainable urban soundscape management.
        </p>

        <h3>EBD Methodology</h3>
        <p>
          The EBD quantifies how much of the ischemic heart disease (IHD) burden
          can be attributed to traffic noise, following the EU Environmental Noise
          Directive (END) approach with WHO 2018 guideline thresholds.
        </p>
        <div className="formula-block">
          <b>Step 1 — Relative Risk (EU END)</b><br />
          RR = exp( ln(1.08) / 10 × (L<sub>den</sub> − {WHO_LDEN_THRESHOLD}) ) &nbsp; when L<sub>den</sub> &gt; {WHO_LDEN_THRESHOLD} dB<br />
          RR = 1 &nbsp; when L<sub>den</sub> ≤ {WHO_LDEN_THRESHOLD} dB<br /><br />
          <b>Step 2 — Population Attributable Fraction</b><br />
          PAF = (RR − 1) / RR<br /><br />
          <b>Step 3 — DALYs</b><br />
          YLLs = Deaths × Remaining Life Expectancy<br />
          YLDs = Prevalent Cases × DW ({DISABILITY_WEIGHT})<br />
          DALYs = YLLs + YLDs<br /><br />
          <b>Step 4 — Environmental Burden of Disease</b><br />
          EBD<sub>IHD</sub> = PAF × DALYs
        </div>

        <h3>Risk Classification</h3>
        <p>
          Grid cells are classified using the 33rd percentile of elderly population
          ({THRESHOLDS.elderly} persons) and 67th percentile of EBD ({THRESHOLDS.ebd} DALYs).
        </p>
        <div className="risk-cards">
          <div className="risk-card-item" style={{ background: 'var(--color-risk-high-bg)' }}>
            <b style={{ color: '#b52222' }}>High Risk</b><br />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              65+PO ≥ {THRESHOLDS.elderly} AND EBD ≥ {THRESHOLDS.ebd}
            </span>
          </div>
          <div className="risk-card-item" style={{ background: 'var(--color-risk-med-bg)' }}>
            <b style={{ color: '#9a6700' }}>Medium Risk</b><br />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              Either threshold exceeded
            </span>
          </div>
          <div className="risk-card-item" style={{ background: 'var(--color-risk-low-bg)' }}>
            <b style={{ color: '#117a44' }}>Low Risk</b><br />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              Both below thresholds
            </span>
          </div>
        </div>

        <h3>Urban Environment Clusters (K-means, k=5)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Cluster</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Characteristics</th>
              </tr>
            </thead>
            <tbody>
              {CLUSTERS.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2,
                      background: c.color, marginRight: 8, verticalAlign: 'middle' }} />
                    {c.name}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>
                    {c.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>Data Sources</h3>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.9 }}>
          Noise exposure (Lden): Road traffic noise map (NoiseModelling) <br />
          Population &amp; elderly: Census data, 1 km grid (통계청, 2021)<br />
          IHD mortality/prevalence: National health statistics (국가데이터처, 2021)<br />
          Urban morphology: National spatial data (환경부, 국토부, 2021)
        </p>

        <h3>References</h3>
        <div className="ref-list">
          <div>WHO (2018). <a href="https://www.who.int/europe/publications/i/item/9789289053563" target="_blank" rel="noopener noreferrer">Environmental Noise Guidelines for the European Region</a></div>
          <div>Tobollik, M. et al. (2019). Burden of disease due to traffic noise in Germany. International journal of environmental research and public health, 16(13), 2304.</div>
          <div>Rockhill, B. et al. (1998). Use and misuse of population attributable fractions. American journal of public health, 88(1), 15–19.</div>
          <div>Im, H. et al. (2023). Updating Korean disability weights for causes of disease: adopting an add-on study method. Journal of Preventive Medicine and Public Health, 56(4), 291.</div>
          <div>EU Environmental Noise Directive (END). <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32002L0049" target="_blank" rel="noopener noreferrer">Directive 2002/49/EC</a></div>
        </div>
      </div>
    </div>
  );
}
