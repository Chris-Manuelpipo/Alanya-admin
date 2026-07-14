export interface CountryGeo {
  name: string;
  lat: number;
  lng: number;
  iso2: string;
  iso3: string;
}

export const COUNTRY_GEO: Record<string, CountryGeo> = {
  "Côte d'Ivoire": { name: "Côte d'Ivoire", lat: 7.54, lng: -5.547, iso2: "CI", iso3: "CIV" },
  France: { name: "France", lat: 46.2276, lng: 2.2137, iso2: "FR", iso3: "FRA" },
  Cameroun: { name: "Cameroun", lat: 7.3697, lng: 12.3547, iso2: "CM", iso3: "CMR" },
  Sénégal: { name: "Sénégal", lat: 14.4974, lng: -14.4524, iso2: "SN", iso3: "SEN" },
  Maroc: { name: "Maroc", lat: 31.7917, lng: -7.0926, iso2: "MA", iso3: "MAR" },
  Algérie: { name: "Algérie", lat: 28.0339, lng: 1.6596, iso2: "DZ", iso3: "DZA" },
  Tunisie: { name: "Tunisie", lat: 33.8869, lng: 9.5375, iso2: "TN", iso3: "TUN" },
  Belgique: { name: "Belgique", lat: 50.5039, lng: 4.4699, iso2: "BE", iso3: "BEL" },
  Canada: { name: "Canada", lat: 56.1304, lng: -106.3468, iso2: "CA", iso3: "CAN" },
  Suisse: { name: "Suisse", lat: 46.8182, lng: 8.2275, iso2: "CH", iso3: "CHE" },
  "Cote d'Ivoire": { name: "Côte d'Ivoire", lat: 7.54, lng: -5.547, iso2: "CI", iso3: "CIV" },
  Senegal: { name: "Sénégal", lat: 14.4974, lng: -14.4524, iso2: "SN", iso3: "SEN" },
  Algerie: { name: "Algérie", lat: 28.0339, lng: 1.6596, iso2: "DZ", iso3: "DZA" },
  Bénin: { name: "Bénin", lat: 9.3077, lng: 2.3158, iso2: "BJ", iso3: "BEN" },
  Mali: { name: "Mali", lat: 17.5707, lng: -3.9962, iso2: "ML", iso3: "MLI" },
  Burkina: { name: "Burkina Faso", lat: 12.3714, lng: -1.5197, iso2: "BF", iso3: "BFA" },
  "Burkina Faso": { name: "Burkina Faso", lat: 12.3714, lng: -1.5197, iso2: "BF", iso3: "BFA" },
  Guinée: { name: "Guinée", lat: 9.9456, lng: -9.6966, iso2: "GN", iso3: "GIN" },
  Congo: { name: "Congo", lat: -0.228, lng: 15.8277, iso2: "CG", iso3: "COG" },
  "République démocratique du Congo": { name: "République démocratique du Congo", lat: -4.0383, lng: 21.7587, iso2: "CD", iso3: "COD" },
  Gabon: { name: "Gabon", lat: -0.8037, lng: 11.6094, iso2: "GA", iso3: "GAB" },
  Togo: { name: "Togo", lat: 8.6195, lng: 0.8248, iso2: "TG", iso3: "TGO" },
  Niger: { name: "Niger", lat: 17.6078, lng: 8.0817, iso2: "NE", iso3: "NER" },
  Tchad: { name: "Tchad", lat: 15.4542, lng: 18.7322, iso2: "TD", iso3: "TCD" },
  Rwanda: { name: "Rwanda", lat: -1.9403, lng: 29.8739, iso2: "RW", iso3: "RWA" },
  Madagascar: { name: "Madagascar", lat: -18.7669, lng: 46.8691, iso2: "MG", iso3: "MDG" },
  Mozambique: { name: "Mozambique", lat: -18.6657, lng: 35.5296, iso2: "MZ", iso3: "MOZ" },
  Angola: { name: "Angola", lat: -11.2027, lng: 17.8739, iso2: "AO", iso3: "AGO" },
  Kenya: { name: "Kenya", lat: -0.0236, lng: 37.9062, iso2: "KE", iso3: "KEN" },
  Nigeria: { name: "Nigeria", lat: 9.082, lng: 8.6753, iso2: "NG", iso3: "NGA" },
  "États-Unis": { name: "États-Unis", lat: 37.0902, lng: -95.7129, iso2: "US", iso3: "USA" },
  USA: { name: "États-Unis", lat: 37.0902, lng: -95.7129, iso2: "US", iso3: "USA" },
  "Royaume-Uni": { name: "Royaume-Uni", lat: 55.3781, lng: -3.436, iso2: "GB", iso3: "GBR" },
  Allemagne: { name: "Allemagne", lat: 51.1657, lng: 10.4515, iso2: "DE", iso3: "DEU" },
  Espagne: { name: "Espagne", lat: 40.4637, lng: -3.7492, iso2: "ES", iso3: "ESP" },
  Italie: { name: "Italie", lat: 41.8719, lng: 12.5674, iso2: "IT", iso3: "ITA" },
  Portugal: { name: "Portugal", lat: 39.3999, lng: -8.2245, iso2: "PT", iso3: "PRT" },
  PaysBas: { name: "Pays-Bas", lat: 52.1326, lng: 5.2913, iso2: "NL", iso3: "NLD" },
  "Pays-Bas": { name: "Pays-Bas", lat: 52.1326, lng: 5.2913, iso2: "NL", iso3: "NLD" },
  Luxembourg: { name: "Luxembourg", lat: 49.8153, lng: 6.1296, iso2: "LU", iso3: "LUX" },
  Autriche: { name: "Autriche", lat: 47.5162, lng: 14.5501, iso2: "AT", iso3: "AUT" },
  Brésil: { name: "Brésil", lat: -14.235, lng: -51.9253, iso2: "BR", iso3: "BRA" },
  Argentine: { name: "Argentine", lat: -38.4161, lng: -63.6167, iso2: "AR", iso3: "ARG" },
  Haïti: { name: "Haïti", lat: 19.8563, lng: -72.2451, iso2: "HT", iso3: "HTI" },
  Liban: { name: "Liban", lat: 33.8547, lng: 35.8623, iso2: "LB", iso3: "LBN" },
  Turquie: { name: "Turquie", lat: 38.9637, lng: 35.2433, iso2: "TR", iso3: "TUR" },
  Chine: { name: "Chine", lat: 35.8617, lng: 104.1954, iso2: "CN", iso3: "CHN" },
  Inde: { name: "Inde", lat: 20.5937, lng: 78.9629, iso2: "IN", iso3: "IND" },
  Japon: { name: "Japon", lat: 36.2048, lng: 138.2529, iso2: "JP", iso3: "JPN" },
  Corée: { name: "Corée du Sud", lat: 35.9078, lng: 127.7669, iso2: "KR", iso3: "KOR" },
  "Corée du Sud": { name: "Corée du Sud", lat: 35.9078, lng: 127.7669, iso2: "KR", iso3: "KOR" },
  Australie: { name: "Australie", lat: -25.2744, lng: 133.7751, iso2: "AU", iso3: "AUS" },
  Russie: { name: "Russie", lat: 61.524, lng: 105.3188, iso2: "RU", iso3: "RUS" },
};

const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

export async function fetchWorldGeoJSON() {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error("Failed to fetch GeoJSON");
  return res.json();
}

export function getCountryGeo(name: string): CountryGeo | undefined {
  if (COUNTRY_GEO[name]) return COUNTRY_GEO[name];
  const lower = name.toLowerCase();
  for (const key of Object.keys(COUNTRY_GEO)) {
    if (key.toLowerCase() === lower) return COUNTRY_GEO[key];
  }
  return undefined;
}

export function getColorForCount(
  count: number,
  max: number,
): string {
  if (max === 0) return "#1e1b4b";
  const ratio = count / max;
  const stops: [number, [number, number, number]][] = [
    [0, [30, 27, 75]],
    [0.15, [55, 48, 163]],
    [0.35, [79, 70, 229]],
    [0.55, [99, 102, 241]],
    [0.75, [129, 140, 248]],
    [1, [199, 210, 254]],
  ];
  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (ratio >= stops[i][0] && ratio <= stops[i + 1][0]) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  const range = upper[0] - lower[0] || 1;
  const t = (ratio - lower[0]) / range;
  const r = Math.round(lower[1][0] + (upper[1][0] - lower[1][0]) * t);
  const g = Math.round(lower[1][1] + (upper[1][1] - lower[1][1]) * t);
  const b = Math.round(lower[1][2] + (upper[1][2] - lower[1][2]) * t);
  return `rgb(${r},${g},${b})`;
}

export function getRadiusForCount(count: number, max: number): number {
  if (max === 0) return 4;
  const ratio = count / max;
  return 4 + ratio * 18;
}

export function matchGeoToCountry(
  geoJsonName: string,
  countryData: Record<string, number>,
): number {
  if (countryData[geoJsonName]) return countryData[geoJsonName];
  for (const [key, val] of Object.entries(countryData)) {
    const geo = COUNTRY_GEO[key];
    if (geo && geo.name === geoJsonName) return val;
  }
  for (const [key, val] of Object.entries(countryData)) {
    if (key.toLowerCase() === geoJsonName.toLowerCase()) return val;
  }
  return 0;
}

export interface RegionStats {
  region: string;
  countries: string[];
  total: number;
  percentage: number;
}

const REGION_MAP: Record<string, string[]> = {
  "Afrique": [
    "Côte d'Ivoire", "Cameroun", "Sénégal", "Maroc", "Algérie", "Tunisie",
    "Bénin", "Mali", "Burkina Faso", "Guinée", "Congo", "République démocratique du Congo",
    "Gabon", "Togo", "Niger", "Tchad", "Rwanda", "Madagascar", "Mozambique",
    "Angola", "Kenya", "Nigeria",
  ],
  "Europe": [
    "France", "Belgique", "Suisse", "Luxembourg", "Allemagne", "Espagne",
    "Italie", "Portugal", "Pays-Bas", "Autriche", "Royaume-Uni",
  ],
  "Amériques": ["Canada", "États-Unis", "Brésil", "Argentine", "Haïti"],
  "Asie": ["Liban", "Turquie", "Chine", "Inde", "Japon", "Corée du Sud"],
  "Océanie": ["Australie"],
};

export function computeRegionStats(countryData: Record<string, number>): RegionStats[] {
  const total = Object.values(countryData).reduce((s, v) => s + v, 0);
  return Object.entries(REGION_MAP).map(([region, countries]) => {
    const regionTotal = countries.reduce((s, c) => s + (countryData[c] || 0), 0);
    return {
      region,
      countries,
      total: regionTotal,
      percentage: total > 0 ? Math.round((regionTotal / total) * 100) : 0,
    };
  }).filter(r => r.total > 0).sort((a, b) => b.total - a.total);
}

export const FLAG_EMOJIS: Record<string, string> = {
  "Côte d'Ivoire": "🇨🇮", France: "🇫🇷", Cameroun: "🇨🇲", Sénégal: "🇸🇳",
  Maroc: "🇲🇦", Algérie: "🇩🇿", Tunisie: "🇹🇳", Belgique: "🇧🇪",
  Canada: "🇨🇦", Suisse: "🇨🇭", Bénin: "🇧🇯", Mali: "🇲🇱",
  "Burkina Faso": "🇧🇫", Guinée: "🇬🇳", Congo: "🇨🇬",
  "République démocratique du Congo": "🇨🇩", Gabon: "🇬🇦", Togo: "🇹🇬",
  Niger: "🇳🇪", Tchad: "🇹🇩", Rwanda: "🇷🇼", Madagascar: "🇲🇬",
  Mozambique: "🇲🇿", Angola: "🇦🇴", Kenya: "🇰🇪", Nigeria: "🇳🇬",
  "États-Unis": "🇺🇸", "Royaume-Uni": "🇬🇧", Allemagne: "🇩🇪",
  Espagne: "🇪🇸", Italie: "🇮🇹", Portugal: "🇵🇹", "Pays-Bas": "🇳🇱",
  Luxembourg: "🇱🇺", Autriche: "🇦🇹", Brésil: "🇧🇷", Argentine: "🇦🇷",
  Haïti: "🇭🇹", Liban: "🇱🇧", Turquie: "🇹🇷", Chine: "🇨🇳",
  Inde: "🇮🇳", Japon: "🇯🇵", "Corée du Sud": "🇰🇷", Australie: "🇦🇺",
};

export function getFlag(pays: string): string {
  return FLAG_EMOJIS[pays] || "🌍";
}
