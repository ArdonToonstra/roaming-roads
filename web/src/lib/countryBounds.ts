/**
 * Country bounds utility for maps
 * 
 * Provides geographic bounding boxes for countries to auto-zoom maps
 * Format: [southWest: [lat, lng], northEast: [lat, lng]]
 */

export interface CountryBounds {
  [countryCode: string]: [[number, number], [number, number]];
}

// Common country bounds (can be expanded as needed)
export const COUNTRY_BOUNDS: CountryBounds = {
  // Central Asia
  'KGZ': [[39.2, 69.3], [43.3, 80.3]], // Kyrgyzstan
  'KAZ': [[40.6, 46.5], [55.4, 87.3]], // Kazakhstan
  'UZB': [[37.2, 55.9], [45.6, 73.2]], // Uzbekistan
  'TJK': [[36.7, 67.4], [41.1, 75.1]], // Tajikistan
  'TKM': [[35.1, 52.4], [42.8, 66.7]], // Turkmenistan
  
  // Europe
  'NLD': [[50.8, 3.4], [53.6, 7.2]], // Netherlands
  'DEU': [[47.3, 5.9], [55.1, 15.0]], // Germany
  'FRA': [[41.3, -5.1], [51.1, 9.6]], // France
  'ESP': [[27.6, -18.2], [43.8, 4.3]], // Spain
  'ITA': [[35.5, 6.6], [47.1, 18.5]], // Italy
  'GRC': [[34.8, 19.4], [41.7, 29.6]], // Greece
  'HRV': [[42.4, 13.5], [46.5, 19.4]], // Croatia
  'SVN': [[45.4, 13.4], [46.9, 16.6]], // Slovenia
  'AUT': [[46.4, 9.5], [49.0, 17.2]], // Austria
  'HUN': [[45.7, 16.1], [48.6, 22.9]], // Hungary
  'POL': [[49.0, 14.1], [54.8, 24.2]], // Poland
  'CZE': [[48.6, 12.1], [51.1, 18.9]], // Czech Republic
  'SVK': [[47.7, 16.8], [49.6, 22.6]], // Slovakia
  'NOR': [[57.9, 4.6], [71.2, 31.3]], // Norway
  
  // Southeast Asia
  'THA': [[5.6, 97.3], [20.5, 105.6]], // Thailand
  'MYS': [[0.9, 99.6], [7.4, 119.3]], // Malaysia
  'SGP': [[1.16, 103.6], [1.47, 104.0]], // Singapore
  'IDN': [[-11.0, 95.0], [6.1, 141.0]], // Indonesia
  'LKA': [[5.9, 79.7], [9.8, 81.9]], // Sri Lanka
  'PHL': [[4.6, 116.9], [21.1, 126.6]], // Philippines
  
  // Other regions
  'JOR': [[29.2, 34.9], [33.4, 39.3]], // Jordan
  'GHA': [[4.7, -3.3], [11.2, 1.2]], // Ghana
  'COL': [[-4.2, -81.7], [12.5, -66.9]], // Colombia
  'PAN': [[7.2, -83.0], [9.6, -77.2]], // Panama
  'BGD': [[20.7, 88.0], [26.6, 92.7]], // Bangladesh
  
  // Add more countries as needed...
};

/**
 * Get country bounds by country code
 */
export function getCountryBounds(countryCode: string): [[number, number], [number, number]] | null {
  return COUNTRY_BOUNDS[countryCode.toUpperCase()] || null;
}

/**
 * Get country bounds by country name (basic matching)
 */
export function getCountryBoundsByName(countryName: string): [[number, number], [number, number]] | null {
  const nameToCode: { [key: string]: string } = {
    'kyrgyzstan': 'KGZ',
    'kazakhstan': 'KAZ',
    'uzbekistan': 'UZB',
    'tajikistan': 'TJK',
    'turkmenistan': 'TKM',
    'netherlands': 'NLD',
    'germany': 'DEU',
    'france': 'FRA',
    'spain': 'ESP',
    'italy': 'ITA',
    'greece': 'GRC',
    'croatia': 'HRV',
    'slovenia': 'SVN',
    'austria': 'AUT',
    'hungary': 'HUN',
    'poland': 'POL',
    'czech republic': 'CZE',
    'slovakia': 'SVK',
    'norway': 'NOR',
    'thailand': 'THA',
    'malaysia': 'MYS',
    'singapore': 'SGP',
    'indonesia': 'IDN',
    'sri lanka': 'LKA',
    'philippines': 'PHL',
    'jordan': 'JOR',
    'ghana': 'GHA',
    'colombia': 'COL',
    'panama': 'PAN',
    'bangladesh': 'BGD',
  };
  
  const code = nameToCode[countryName.toLowerCase()];
  return code ? getCountryBounds(code) : null;
}

/**
 * Get combined bounds for multiple countries
 */
export function getCombinedCountryBounds(countryCodes: string[]): [[number, number], [number, number]] | null {
  const bounds = countryCodes
    .map(code => getCountryBounds(code))
    .filter((bound): bound is [[number, number], [number, number]] => bound !== null);
  
  if (bounds.length === 0) return null;
  
  // Find the outer bounds that encompass all countries
  let minLat = bounds[0][0][0];
  let minLng = bounds[0][0][1];
  let maxLat = bounds[0][1][0];
  let maxLng = bounds[0][1][1];
  
  bounds.forEach(([[sw_lat, sw_lng], [ne_lat, ne_lng]]) => {
    minLat = Math.min(minLat, sw_lat);
    minLng = Math.min(minLng, sw_lng);
    maxLat = Math.max(maxLat, ne_lat);
    maxLng = Math.max(maxLng, ne_lng);
  });
  
  return [[minLat, minLng], [maxLat, maxLng]];
}