// ================================================================
// Constants from the dissertation
// All thresholds, formulas, cluster definitions sourced directly
// from Chapters 3, 5, and 6.
// ================================================================

// WHO guideline: Lden threshold for IHD risk (WHO, 2018)
export const WHO_LDEN_THRESHOLD = 53;

// Disability Weight for IHD (Im et al., 2023)
export const DISABILITY_WEIGHT = 0.521;

// IHD Relative Risk parameters (EU END)
export const RR_BASE = 1.08;
export const RR_PER_DB = 10;

// Risk classification thresholds (Chapter 3, Section 3.3.2)
// 33rd percentile of 65+PO, 67th percentile of EBD
export const THRESHOLDS = {
  elderly: 620,   // persons (33rd percentile)
  ebd: 239,       // DALYs  (67th percentile)
};

// Default EBD calculator inputs (Seoul averages)
export const DEFAULTS = {
  lden: 65,
  population: 15000,
  elderlyPop: 2500,
  mortalityRate: 28.5,    // per 100,000
  prevalenceRate: 420,    // per 100,000
  remainingLifeExp: 15.2, // years
};

// K-means clusters (Chapter 4, Section 4.4)
export const CLUSTERS = [
  { id: 1, name: 'High-rise mixed-use',             ko: '고층 복합용도',       color: '#6366f1', desc: 'High BH (0.59), low GR (0.10)' },
  { id: 2, name: 'Rail & traffic-heavy residential', ko: '철도·교통 밀집 주거',  color: '#ef4444', desc: 'Peak traffic exposure, railway noise' },
  { id: 3, name: 'Green & low-noise residential',    ko: '녹지·저소음 주거',    color: '#22c55e', desc: 'High green space, low noise' },
  { id: 4, name: 'High-density with construction',   ko: '고밀도 건설지역',     color: '#f59e0b', desc: 'High building density, construction noise' },
  { id: 5, name: 'Public urban core',                ko: '도심 공공지역',       color: '#3b82f6', desc: 'High traffic volume, siren/signal noise' },
];

// Map styling
export const RISK_COLORS = { Low: '#1a9a5a', Medium: '#d08a15', High: '#cf2e2e' };
export const RISK_OPACITY = { Low: 0.35, Medium: 0.50, High: 0.65 };
