import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { RISK_COLORS, RISK_OPACITY, CLUSTERS } from '../../data/constants';
import { loadGridData } from '../../utils/dataLoader';

/* ── Fit map to data bounds ────────────────────────────────────────── */
function FitBounds({ data }) {
  const map = useMap();
  useEffect(() => {
    if (!data?.features?.length) return;
    const pts = data.features.flatMap((f) =>
      f.geometry.coordinates[0].map((c) => [c[1], c[0]])
    );
    if (pts.length) map.fitBounds(pts, { padding: [20, 20] });
  }, [data, map]);
  return null;
}

/* ── Popup HTML ────────────────────────────────────────────────────── */
function popupHTML(p) {
  return `
    <div class="grid-popup">
      <h3>${p.grid_id || 'Grid Cell'}</h3>
      <div class="popup-row"><span class="popup-key">Risk</span>
        <span class="risk-badge ${(p.risk_level||'').toLowerCase()}">${p.risk_level}</span></div>
      <div class="popup-row"><span class="popup-key">Lden</span>
        <span class="popup-val">${p.Lden} dB</span></div>
      <div class="popup-row"><span class="popup-key">EBD</span>
        <span class="popup-val">${p.EBD} DALYs</span></div>
      <div class="popup-row"><span class="popup-key">Population</span>
        <span class="popup-val">${p.population?.toLocaleString()}</span></div>
      <div class="popup-row"><span class="popup-key">Elderly (65+)</span>
        <span class="popup-val">${p.elderly_pop?.toLocaleString()}</span></div>
      <div class="popup-row"><span class="popup-key">Cluster</span>
        <span class="popup-val" style="font-family:var(--font-body)">${p.cluster_name || ''}</span></div>
      <div class="popup-row"><span class="popup-key">Noise Source</span>
        <span class="popup-val" style="font-family:var(--font-body)">${p.dominant_noise || ''}</span></div>
    </div>`;
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function SeoulMap() {
  const [grid, setGrid] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('All');
  /*const [clusterFilter, setClusterFilter] = useState('All');*/

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, isDemo: demo } = await loadGridData();
      setGrid(data);
      setIsDemo(demo);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!grid) return null;
    const ff = grid.features.filter((f) => {
      const p = f.properties;
      if (riskFilter !== 'All' && p.risk_level !== riskFilter) return false;
      if (clusterFilter !== String(p.cluster_id) !== clusterFilter) return false;
      return true;
    });
    return { ...grid, features: ff };
  }, [grid, riskFilter, clusterFilter]);

  const stats = useMemo(() => {
    if (!grid) return null;
    const f = grid.features;
    return {
      total: f.length,
      high: f.filter((x) => x.properties.risk_level === 'High Risk').length,
      med: f.filter((x) => x.properties.risk_level === 'Medium Risk').length,
      low: f.filter((x) => x.properties.risk_level === 'Low Risk').length,
    };
  }, [grid]);

  const cellStyle = (feature) => ({
    fillColor: RISK_COLORS[feature.properties.risk_level] || '#888',
    fillOpacity: RISK_OPACITY[feature.properties.risk_level] || 0.35,
    color: '#ffffff',
    weight: 0.5,
    opacity: 0.8,
  });

  const onEach = (feature, layer) => {
    layer.bindPopup(popupHTML(feature.properties), { maxWidth: 280 });
    const base = cellStyle(feature);
    layer.on({
      mouseover: (e) => { e.target.setStyle({ weight: 2, color: '#1b1f24', fillOpacity: 0.8 }); e.target.bringToFront(); },
      mouseout: (e) => { e.target.setStyle(base); },
    });
  };

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>Loading map data…</div>;
  }

  return (
    <div>
      {/* Demo banner */}
      {isDemo && (
        <div style={{ padding: '8px 14px', background: 'var(--color-accent-bg)', borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem', color: 'var(--color-accent)', marginBottom: 12 }}>
          Demo data — place your <code>seoul_grid_1km.geojson</code> in <code>public/data/</code> for real data.
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="metrics-row" style={{ marginBottom: 12 }}>
          <div className="metric-card">
            <div className="metric-value">{stats.total}</div>
            <div className="metric-label">Total Cells</div>
          </div>
          <div className="metric-card" style={{ background: 'var(--color-risk-high-bg)' }}>
            <div className="metric-value" style={{ color: '#b52222' }}>{stats.high}</div>
            <div className="metric-label">High Risk</div>
          </div>
          <div className="metric-card" style={{ background: 'var(--color-risk-med-bg)' }}>
            <div className="metric-value" style={{ color: '#9a6700' }}>{stats.med}</div>
            <div className="metric-label">Medium Risk</div>
          </div>
          <div className="metric-card" style={{ background: 'var(--color-risk-low-bg)' }}>
            <div className="metric-value" style={{ color: '#117a44' }}>{stats.low}</div>
            <div className="metric-label">Low Risk</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className="filter-row">
            <span className="filter-label">Risk:</span>
            {['All', 'High Risk', 'Medium Risk', 'Low Risk'].map((v) => (
              <button key={v} className={`chip ${riskFilter === v ? 'active' : ''}`}
                onClick={() => setRiskFilter(v)}>{v}</button>
            ))}
          </div>
          <div className="filter-row">
            <span className="filter-label">Cluster:</span>
            {CLUSTERS.map((c) => (
              <button key={c.id} className={`chip ${clusterFilter === String(c.id) ? 'active' : ''}`}
                onClick={() => setClusterFilter(String(c.id))} title={c.desc}>{c.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper" style={{ height: 500 }}>
        <MapContainer center={[37.5665, 126.978]} zoom={11}
          style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {filtered && (
            <GeoJSON key={`${riskFilter}-${clusterFilter}`} data={filtered}
              style={cellStyle} onEachFeature={onEach} />
          )}
          {filtered && <FitBounds data={filtered} />}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item"><div className="legend-swatch" style={{ background: RISK_COLORS["Low Risk"] }} /> Low (EBD &lt; 239 &amp; Elderly &lt; 620)</div>
        <div className="legend-item"><div className="legend-swatch" style={{ background: RISK_COLORS["Medium Risk"] }} /> Medium (one threshold exceeded)</div>
        <div className="legend-item"><div className="legend-swatch" style={{ background: RISK_COLORS["High Risk"] }} /> High (both exceeded)</div>
      </div>
    </div>
  );
}
