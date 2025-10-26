"use client";
import React, { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import { geoCentroid } from 'd3-geo'
import type { Trip } from '@/types/payload'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

// Country properties type for feature matching
interface CountryProperties {
  iso_a3?: string;
  ISO_A3?: string;
  iso_a2?: string;
  ISO_A2?: string;
  ADM0_A3?: string;
  centroid?: [number, number];
  [key: string]: unknown;
}

// Use proper GeoJSON Feature type
type GeoJSONFeature = Feature<Geometry, CountryProperties>
type GeoJSONFeatureCollection = FeatureCollection<Geometry, CountryProperties>

interface GeographiesArgs {
  geographies: Array<{
    rsmKey: string;
    geometry: Geometry;
    properties: CountryProperties;
  }>;
}

// topojson.feature returns a FeatureCollection for GeometryCollection objects
const geoJson = feature(worldData, worldData.objects.countries) as unknown as GeoJSONFeatureCollection

export default function WorldMapClient({ trips }: { trips: Trip[] }) {
  // build a map from ISO_A3 -> centroid
  const markers = useMemo(() => {
    const map: { id: string; name?: string; coordinates: [number, number]; trip?: Trip }[] = []
    // For each trip try to read country iso3 code from trip.country.countryCode or trip.countryCode
    trips.forEach(t => {
      const cc = typeof t.country === 'object' && t.country && 'countryCode' in t.country ? t.country.countryCode : null
      if (!cc) return
      // find geo feature by ISO_A3 or ISO_A2 or by numeric id used in world-atlas TopoJSON
      let f = geoJson.features.find((ft: GeoJSONFeature) => {
        const props = ft.properties as CountryProperties
        // sometimes topojson features use different casing or fields; check common ones
        return props && (
          props.iso_a3 === cc || props.iso_a2 === cc || props.ADM0_A3 === cc || props.ISO_A3 === cc || props.ISO_A2 === cc || String(ft.id) === cc
        )
      })
      // If not found, try mapping ISO3 -> numeric (world-atlas uses numeric ids like "040")
      if (!f) {
        try {
          // Dynamic import to avoid type issues during SSR build time; this runs client-side
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const iso = require('i18n-iso-countries')
          // alpha3ToNumeric returns a zero-padded string like '040' for Austria (AUT)
          const numeric = iso.alpha3ToNumeric(cc)
          if (numeric) {
            // try exact match and also parseInt variant without leading zeros
            f = geoJson.features.find((ft: GeoJSONFeature) => String(ft.id) === String(numeric) || String(ft.id) === String(parseInt(numeric, 10)))
          }
        } catch {
          // ignore if package not available or mapping fails
        }
      }
      if (!f) return
      // compute centroid using d3's geoCentroid (best effort for MultiPolygons)
      let centroid: [number, number]
      try {
        const c = geoCentroid(f)
        centroid = [c[0], c[1]]
      } catch {
        const coords = f.properties && f.properties.centroid ? f.properties.centroid : null
        if (coords && Array.isArray(coords) && coords.length >= 2) centroid = [coords[0], coords[1]]
        else centroid = getFeatureCentroid(f)
      }
      map.push({ id: String(t.id), name: t.title, coordinates: centroid, trip: t })
    })
    // de-duplicate by id
    const dedup = map.reduce((acc, cur) => {
      if (!acc.find(a => a.id === cur.id)) acc.push(cur)
      return acc
    }, [] as typeof map)
    return dedup
  }, [trips])

  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div>
      <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: '100%', height: 'auto' }}>
        <Geographies geography={geoJson}>
          {((args: GeographiesArgs) => {
            return args.geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} fill="#F3F4F6" stroke="#E5E7EB" />
            ))
          })}
        </Geographies>
        {markers.map(m => (
          <Marker key={m.id} coordinates={m.coordinates}>
            <circle r={6} fill="#F57D50" stroke="#fff" strokeWidth={2} onClick={() => setSelected(m.id)} style={{ cursor: 'pointer' }} />
          </Marker>
        ))}
      </ComposableMap>
      {selected && (
        <div className="mt-4 text-sm">
          <strong>Selected trip:</strong> {markers.find(m => m.id === selected)?.name}
        </div>
      )}

      {/* Debug panel: show matched/unmatched codes and sample feature props keys */}
      <div className="mt-4 text-sm text-muted-foreground bg-card/60 p-3 rounded">
        <div className="mb-2 font-medium">Map debug</div>
        <div>Markers plotted: {markers.length}</div>
        <div className="mt-2">
          <div className="font-semibold">Matched codes (sample)</div>
          <ul className="text-xs list-disc pl-5">
            {(markers.map(m => ({ id: m.id, code: typeof m.trip?.country === 'object' && 'countryCode' in m.trip.country ? m.trip.country.countryCode : 'unknown' }))).slice(0,10).map((x) => (
              <li key={x.id}>{String(x.code)} (trip {x.id})</li>
            ))}
          </ul>
        </div>
        <div className="mt-2">
          <div className="font-semibold">Trip count</div>
          <div className="text-xs">Total trips: {trips.length}, Mapped trips: {markers.length}</div>
        </div>
        <div className="mt-2 text-xs">
          <div className="font-semibold">Tip</div>
          If your country codes are ISO3 (e.g. JOR, KGZ) the map attempts to match properties.iso_a3, ISO_A3 or feature.id. If markers are missing, we can log feature property keys for a sample country to adapt matching.
        </div>
      </div>
    </div>
  )
}

function getFeatureCentroid(feature: GeoJSONFeature): [number, number] {
  // fallback centroid: average of coordinates of the first polygon ring
  try {
    // Type guard to check if geometry has coordinates
    const geometry = feature.geometry
    if (!geometry || geometry.type === 'GeometryCollection') return [0, 0]
    
    // Type assertion for geometries that have coordinates
    const coords = (geometry as { coordinates: unknown[] }).coordinates
    if (!coords || !Array.isArray(coords) || coords.length === 0) return [0, 0]
    
    // Navigate through nested coordinate arrays to find actual coordinate pairs
    let ring: unknown = coords[0]
    
    // For MultiPolygon geometries, drill down to the first polygon's first ring
    while (Array.isArray(ring) && Array.isArray(ring[0]) && !isCoordinatePair(ring[0])) {
      ring = ring[0]
    }
    
    // Ensure we have an array of coordinate pairs
    if (!Array.isArray(ring)) return [0, 0]
    
    // Filter to only valid coordinate pairs and limit for performance
    const coordinatePairs = (ring as unknown[])
      .filter(isCoordinatePair)
      .slice(0, 10) as [number, number][]
    
    if (coordinatePairs.length === 0) return [0, 0]
    
    // Calculate average coordinates
    const sum = coordinatePairs.reduce(
      (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]] as [number, number],
      [0, 0] as [number, number]
    )
    
    return [sum[0] / coordinatePairs.length, sum[1] / coordinatePairs.length]
  } catch {
    return [0, 0]
  }
}

// Type guard to check if a value is a coordinate pair [longitude, latitude]
function isCoordinatePair(value: unknown): value is [number, number] {
  return Array.isArray(value) && 
         value.length === 2 && 
         typeof value[0] === 'number' && 
         typeof value[1] === 'number'
}
