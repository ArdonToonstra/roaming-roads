"use client";
import React, { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import { geoCentroid } from 'd3-geo'
import type { Trip } from '@/types/payload'

// Minimal local GeoJSON types to satisfy TS in this file
type GeoJSONFeature = any
type GeoJSONFeatureCollection = { features: GeoJSONFeature[] }

const geoJson = feature(worldData as any, (worldData as any).objects.countries) as GeoJSONFeatureCollection

export default function WorldMapClient({ trips }: { trips: Trip[] }) {
  // build a map from ISO_A3 -> centroid
  const markers = useMemo(() => {
    const map: { id: string; name?: string; coordinates: [number, number]; trip?: Trip }[] = []
    const unmatched: { tripId: string; code: string | null }[] = []
    // For each trip try to read country iso3 code from trip.country.countryCode or trip.countryCode
    trips.forEach(t => {
      const cc = typeof t.country === 'object' ? (t.country as any).countryCode : (t as any).countryCode || null
      if (!cc) return
      // find geo feature by ISO_A3 or ISO_A2 or by numeric id used in world-atlas TopoJSON
      let f = geoJson.features.find((ft: any) => {
        const props = (ft as any).properties as Record<string, any>
        // sometimes topojson features use different casing or fields; check common ones
        return props && (
          props.iso_a3 === cc || props.iso_a2 === cc || props.ADM0_A3 === cc || props.ISO_A3 === cc || props.ISO_A2 === cc || String((ft as any).id) === cc
        )
      })
      // If not found, try mapping ISO3 -> numeric (world-atlas uses numeric ids like "040")
      if (!f) {
        try {
          // require dynamically to avoid type issues during SSR build time; this runs client-side
          // @ts-ignore
          const iso = require('i18n-iso-countries')
          // alpha3ToNumeric returns a zero-padded string like '040' for Austria (AUT)
          const numeric = iso.alpha3ToNumeric(cc)
          if (numeric) {
            // try exact match and also parseInt variant without leading zeros
            f = geoJson.features.find((ft: any) => String((ft as any).id) === String(numeric) || String((ft as any).id) === String(parseInt(numeric, 10)))
          }
        } catch (e) {
          // ignore if package not available or mapping fails
        }
      }
      if (!f) return
      // compute centroid using d3's geoCentroid (best effort for MultiPolygons)
      let centroid: [number, number]
      try {
        const c = geoCentroid(f as any)
        centroid = [c[0], c[1]]
      } catch (e) {
        const coords = (f as any).properties && (f as any).properties.centroid ? (f as any).properties.centroid : null
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
    // attach debug info on the array object (client-only) for rendering
    ;(dedup as any).__debug = {
      matched: dedup.map(d => ({ id: d.id, code: typeof d.trip?.country === 'object' ? (d.trip.country as any).countryCode : (d.trip as any).countryCode })),
      // unmatched list: trips with country code but no feature
      // build by checking which trips had codes but weren't in dedup
      unmatched: trips.filter(t => {
        const cc = typeof t.country === 'object' ? (t.country as any).countryCode : (t as any).countryCode || null
        if (!cc) return false
        return !dedup.find(d => {
          const tripCc = typeof d.trip?.country === 'object' ? (d.trip!.country as any).countryCode : (d.trip as any).countryCode
          return tripCc === cc
        })
      }).map(t => ({ tripId: String(t.id), code: typeof t.country === 'object' ? (t.country as any).countryCode : (t as any).countryCode || null })),
    }
    return dedup
  }, [trips])

  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div>
      <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: '100%', height: 'auto' }}>
        <Geographies geography={geoJson}>
          {((args: any) => {
            const geographies = args.geographies as any[]
            return geographies.map((geo: any) => (
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
            {((markers as any).__debug?.matched ?? markers.map(m => ({ id: m.id, code: typeof m.trip?.country === 'object' ? (m.trip.country as any).countryCode : (m.trip as any).countryCode }))).slice(0,10).map((x: any) => (
              <li key={x.id}>{x.code} (trip {x.id})</li>
            ))}
          </ul>
        </div>
        <div className="mt-2">
          <div className="font-semibold">Unmatched country codes (first 20)</div>
          <ul className="text-xs list-disc pl-5">
            {(((markers as any).__debug?.unmatched) ?? []).slice(0,20).map((u: any) => (
              <li key={u.tripId}>{u.code} (trip {u.tripId})</li>
            ))}
          </ul>
        </div>
        <div className="mt-2 text-xs">
          <div className="font-semibold">Tip</div>
          If your country codes are ISO3 (e.g. JOR, KGZ) the map attempts to match properties.iso_a3, ISO_A3 or feature.id. If markers are missing, we can log feature property keys for a sample country to adapt matching.
        </div>
      </div>
    </div>
  )
}

function getFeatureCentroid(feature: any): [number, number] {
  // fallback centroid: average of coordinates of the first polygon ring
  try {
    const coords = feature.geometry.coordinates
    if (!coords || !coords.length) return [0, 0]
    // drill down to first coordinate pair set
    let ring = coords[0]
    if (Array.isArray(ring[0]) && Array.isArray(ring[0][0])) ring = ring[0]
    const pts = ring.slice(0, 10) // limit for perf
    const avg = pts.reduce((acc: [number, number], p: [number, number]) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    return [avg[0] / pts.length, avg[1] / pts.length]
  } catch (e) {
    return [0, 0]
  }
}
