/**
 * Data Loader
 * ============
 * Loads GeoJSON files directly from /public/data/.
 * No coordinate conversion needed — expects EPSG:4326 (WGS84).
 *
 * If real GeoJSON is not found, generates demo data for preview.
 *
 * YOUR GeoJSON feature properties should include:
 *   grid_id, Lden, EBD, risk_level, cluster_id, cluster_name,
 *   population, elderly_pop, dominant_noise
 *
 * Any extra properties are preserved but not displayed.
 */

import { CLUSTERS, THRESHOLDS } from '../data/constants';

const BASE = import.meta.env.BASE_URL;

export async function loadGeoJSON(filename) {
  try {
    const res = await fetch(`${BASE}data/${filename}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── Demo data generator ─────────────────────────────────────────────
// Creates ~700 realistic 1km grid cells over Seoul for UI preview.

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

export function generateDemoGrid() {
  const rand = seededRandom(42);
  const features = [];
  const latMin = 37.44, latMax = 37.69;
  const lngMin = 126.78, lngMax = 127.17;
  const step = 0.009;
  const cLat = (latMin + latMax) / 2, cLng = (lngMin + lngMax) / 2;
  const noises = ['Road traffic', 'Railway', 'Construction', 'Signal (siren)', 'Aircraft'];
  let id = 0;

  for (let lat = latMin; lat < latMax; lat += step) {
    for (let lng = lngMin; lng < lngMax; lng += step) {
      const dist = Math.sqrt(((lat - cLat) * 111) ** 2 + ((lng - cLng) * 88) ** 2);
      if (dist > 16) continue;

      const dn = dist / 16;
      const lden = Math.max(40, Math.min(85, 65 - dn * 10 + (rand() - 0.5) * 14));
      const pop = Math.max(500, Math.floor(15000 - dn * 8000 + (rand() - 0.5) * 6000));
      const elderly = Math.floor(pop * (0.08 + rand() * 0.2));
      const rr = lden > 53 ? Math.exp((Math.log(1.08) / 10) * (lden - 53)) : 1;
      const paf = rr > 1 ? (rr - 1) / rr : 0;
      const deaths = pop * (28.5 / 100000);
      const dalys = deaths * 15.2 + pop * (420 / 100000) * 0.521;
      const ebd = paf * dalys;
      const cid = Math.floor(rand() * 5);
      const risk = (elderly >= THRESHOLDS.elderly && ebd >= THRESHOLDS.ebd) ? 'High'
                 : (elderly >= THRESHOLDS.elderly || ebd >= THRESHOLDS.ebd) ? 'Medium' : 'Low';

      features.push({
        type: 'Feature',
        properties: {
          grid_id: `G${String(id).padStart(4, '0')}`,
          Lden: Math.round(lden * 10) / 10,
          EBD: Math.round(ebd * 10) / 10,
          risk_level: risk,
          cluster_id: cid,
          cluster_name: CLUSTERS[cid].name,
          population: pop,
          elderly_pop: elderly,
          dominant_noise: noises[cid],
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[ [lng, lat], [lng + step, lat], [lng + step, lat + step], [lng, lat + step], [lng, lat] ]],
        },
      });
      id++;
    }
  }
  return { type: 'FeatureCollection', features };
}

/** Load real GeoJSON; fall back to demo data if not found */
export async function loadGridData() {
  const data = await loadGeoJSON('seoul_grid_1km.geojson');
  if (data?.features?.length) return { data, isDemo: false };
  return { data: generateDemoGrid(), isDemo: true };
}
