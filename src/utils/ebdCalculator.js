/**
 * EBD Computation Pipeline
 * ========================
 * EU Environmental Noise Directive (END) framework for
 * traffic noise-attributed IHD burden.
 *
 * Sources:
 *  - WHO (2018) Environmental Noise Guidelines
 *  - Tobollik et al. (2019) EBD methodology
 *  - Rockhill et al. (1998) PAF formula
 *  - Im et al. (2023) DW = 0.521
 */

import { WHO_LDEN_THRESHOLD, DISABILITY_WEIGHT, RR_BASE, RR_PER_DB, THRESHOLDS } from '../data/constants';

/**
 * IHD Relative Risk (EU END, Eq. 1 in dissertation)
 * RR = exp( ln(1.08) / 10 × (Lden − 53) )  if Lden > 53 dB
 * RR = 1                                     otherwise
 */
export function calcRR(lden) {
  if (lden <= WHO_LDEN_THRESHOLD) return 1.0;
  return Math.exp((Math.log(RR_BASE) / RR_PER_DB) * (lden - WHO_LDEN_THRESHOLD));
}

/**
 * Population Attributable Fraction (Rockhill et al., 1998)
 * Single-exposure simplification: PAF = (RR − 1) / RR
 */
export function calcPAF(rr) {
  return rr <= 1 ? 0 : (rr - 1) / rr;
}

/** YLLs = (population × mortalityRate / 100,000) × remaining life expectancy */
export function calcYLLs(pop, mortalityRate, lifeExp) {
  return (pop * mortalityRate / 100000) * lifeExp;
}

/** YLDs = (population × prevalenceRate / 100,000) × DW(0.521) */
export function calcYLDs(pop, prevalenceRate) {
  return (pop * prevalenceRate / 100000) * DISABILITY_WEIGHT;
}

/**
 * Risk classification (Chapter 3, Section 3.3.2)
 * High:   65+PO ≥ 620 AND EBD ≥ 239
 * Medium: either exceeded
 * Low:    both below
 */
export function classifyRisk(elderlyPop, ebd) {
  const e = elderlyPop >= THRESHOLDS.elderly;
  const b = ebd >= THRESHOLDS.ebd;
  if (e && b) return 'High';
  if (e || b) return 'Medium';
  return 'Low';
}

/** Full pipeline — returns all intermediate values */
export function computeEBD(inputs) {
  const { lden, population, elderlyPop, mortalityRate, prevalenceRate, remainingLifeExp } = inputs;
  const rr   = calcRR(lden);
  const paf  = calcPAF(rr);
  const ylls = calcYLLs(population, mortalityRate, remainingLifeExp);
  const ylds = calcYLDs(population, prevalenceRate);
  const dalys = ylls + ylds;
  const ebd  = paf * dalys;
  const risk = classifyRisk(elderlyPop, ebd);
  return { lden, rr, paf, ylls, ylds, dalys, ebd, risk, exceedsWHO: lden > WHO_LDEN_THRESHOLD };
}
