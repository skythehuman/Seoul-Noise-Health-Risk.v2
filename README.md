# Seoul-Noise-Health-Risk.v2
Interactive web dashboard that visualizes traffic noise-attributed IHD health risks across Seoul using the Environmental Burden of Disease (EBD) framework. This work implements the outcomes from my doctoral dissertation.

**[Go to Dashboard](https://skythehuman.github.io/Seoul-Noise-Health-Risk.v2)**

## Quick Start

```bash
git clone https://github.com/skythehuman/Seoul-Noise-Health-Risk.v2.git
cd Seoul-Noise-Health-Risk.v2
npm install
npm run dev
```

## Using Your GeoJSON Data

Place your GeoJSON file at `public/data/seoul_grid_1km.geojson`. **No coordinate conversion needed** — the app reads the file directly.

**Required**: your GeoJSON must be in **EPSG:4326 (WGS84)** coordinates.

Each feature should include these properties:

```json
{
  "grid_id": "G0001",
  "Lden": 65.3,
  "EBD": 425.7,
  "risk_level": "High Risk",
  "cluster_id": 2,
  "cluster_name": "Rail & traffic-heavy residential",
  "population": 18500,
  "elderly_pop": 3200,
  "dominant_noise": "Railway"
}
```

## EBD Methodology

```
EBD_IHD = PAF × DALYs

RR     = exp( ln(1.08)/10 × (Lden − 53) )   if Lden > 53 dB
PAF    = (RR − 1) / RR
DALYs  = YLLs + YLDs
YLLs   = Deaths × Remaining Life Expectancy
YLDs   = Prevalent Cases × DW (0.521)
```

Risk classification: High (65+PO ≥ 620 AND EBD ≥ 239), Medium (either), Low (both below).

## References

- Lee, H. (2026). *EBD-based Health Risk Assessment with Explainable AI*. In Ph.D. Dissertation.
- WHO (2018). [Environmental Noise Guidelines for the European Region](https://www.who.int/europe/publications/i/item/9789289053563)
- Tobollik, M. et al. (2019). Burden of disease due to traffic noise in Germany. *International journal of environmental research and public health*, 16(13), 2304.
- Rockhill, B. et al. (1998). Use and misuse of population attributable fractions. *American journal of public health*, 88(1), 15–19.
- Im, D., et al. (2023). Updating Korean disability weights for causes of disease: adopting an add-on study method. *Journal of Preventive Medicine and Public Health*, 56(4), 291.

## License

MIT
