/**
 * One-shot: pull lakes and mountain peaks from Natural Earth (public domain)
 * into src/data/geo-features.json for TripSchematicMap. Re-run to refresh:
 *   pnpm tsx scripts/fetch-geo.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { geoArea } from 'd3-geo'

const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
const OUT = join(import.meta.dirname, '..', 'src', 'data', 'geo-features.json')

type Position = [number, number]
type NEFeature = { properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }
const get = async (name: string): Promise<NEFeature[]> => (await (await fetch(`${BASE}/${name}.geojson`)).json()).features

// ~1 km precision and no repeated points: invisible on an 800px country map with 100 km²+ lakes, and a fraction of the size.
const ring = (r: Position[]) =>
  r.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]).filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1])
// Rounding collapses tiny islands into rings of < 4 points, which crash d3's clipping; drop those (and polygons left without an outline).
const polygon = (p: Position[][]) => {
  const rings = p.map(ring)
  return rings[0].length >= 4 ? rings.filter((r) => r.length >= 4) : null
}

// Lakes under ~100 km² (geoArea is in steradians on the unit sphere) never read at country scale.
const MIN_LAKE = 100 / 6371 ** 2
const lakes = (await get('ne_10m_lakes'))
  .filter((f) => geoArea(f as never) > MIN_LAKE && geoArea(f as never) < 2 * Math.PI)
  .map((f) => ({
  type: 'Feature',
  properties: { name: f.properties.name_en ?? f.properties.name ?? null },
  geometry: {
    type: 'MultiPolygon',
    coordinates: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates as Position[][]] : (f.geometry.coordinates as Position[][][]))
      .map(polygon)
      .filter(Boolean),
  },
}))

// Only named mountains/volcanoes; spot elevations and depressions are mostly unnamed noise.
const peaks = (await get('ne_10m_geography_regions_elevation_points'))
  .filter((f) => ['mountain', 'volcano'].includes(String(f.properties.featurecla)) && (f.properties.name_en || f.properties.name))
  .map((f) => {
    const [x, y] = f.geometry.coordinates as Position
    return [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000, String(f.properties.name_en ?? f.properties.name), Number(f.properties.elevation)]
  })

mkdirSync(join(OUT, '..'), { recursive: true })
writeFileSync(OUT, JSON.stringify({ lakes, peaks }))
console.log(`${lakes.length} lakes, ${peaks.length} peaks -> ${OUT}`)
