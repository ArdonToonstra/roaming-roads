"use client";
import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';


// Minimal Payload admin field for picking a point on a Leaflet map.
// - Click on the map to set coordinates
// - Drag the marker to change coordinates
// - Provides small lat/lng inputs for manual editing
// This avoids external APIs and works out-of-the-box in the admin UI.

const MapPicker: React.FC<any> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // helper to normalize Payload 'point' value
  const getCoordsFromValue = (val: any): number[] | null => {
    // Normalize various shapes into [lng, lat]
    if (!val) return null
    if (Array.isArray(val) && val.length >= 2) return [Number(val[0]), Number(val[1])]
    if (val.coordinates && Array.isArray(val.coordinates) && val.coordinates.length >= 2) return [Number(val.coordinates[0]), Number(val.coordinates[1])]
    if (val.type === 'Point' && Array.isArray(val.coordinates) && val.coordinates.length >= 2) return [Number(val.coordinates[0]), Number(val.coordinates[1])]
    return null
  }

  // Local UI state so inputs reflect changes immediately
  const [local, setLocal] = useState<{ lat?: number | ''; lng?: number | '' }>(() => {
    const coords = getCoordsFromValue(value)
    if (coords) return { lng: coords[0], lat: coords[1] }
    return { lat: '', lng: '' }
  })

  useEffect(() => {
    let mounted = true
    if (!containerRef.current) return

    // Dynamically load leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix marker icon loading (same as frontend)
      if (L && L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
        });
      }
      if (!mounted) return
      // Create map if not present
      if (!mapRef.current) {

        mapRef.current = L.map(containerRef.current as HTMLElement, {
          center: [20, 0],
          zoom: 2,
        });

        // Use MapTiler tiles with English if key is present, else fallback to OSM
        const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
        const tileUrl = maptilerKey
          ? `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${maptilerKey}&language=en`
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const attribution = maptilerKey
          ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors'
          : '&copy; OpenStreetMap contributors';
        L.tileLayer(tileUrl, { attribution }).addTo(mapRef.current);

        mapRef.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng
          setMarker([lat, lng])
        })
      }

      // If we have existing value, set marker
      const coords = getCoordsFromValue(value)
      if (coords && coords.length >= 2) {
        const [lng, lat] = coords
        setMarker([lat, lng], true)
        mapRef.current.setView([lat, lng], 10)
        // ensure local state matches incoming value
        setLocal({ lat, lng })
      }

      function setMarker(latlng: [number, number], silent = false) {
        const Lany = (L as any);
        if (!markerRef.current) {
          markerRef.current = Lany.marker(latlng, { draggable: true }).addTo(mapRef.current);
          markerRef.current.on('dragend', function (ev: any) {
            const pos = ev.target.getLatLng();
            updateValue(pos.lat, pos.lng);
          });
        } else {
          markerRef.current.setLatLng(latlng);
        }
        // Always update lat/lng fields immediately
        updateValue(latlng[0], latlng[1]);
        // Update local state immediately so inputs reflect change without waiting for parent
        setLocal({ lat: latlng[0], lng: latlng[1] })
      }

      function updateValue(lat: number, lng: number) {
        // Payload expects [lng, lat] coordinates in many places
        const point = { type: 'Point', coordinates: [lng, lat] }
        if (typeof onChange === 'function') onChange(point)
      }
    })

    return () => { mounted = false }
  }, [])

  // Manual inputs
  // Prefer local state for inputs so UI updates instantly
  const lat = local.lat ?? ''
  const lng = local.lng ?? ''

  const onManualChange = (field: 'lat' | 'lng', v: string) => {
    const parsed = Number(v)
    if (Number.isNaN(parsed)) {
      // allow clearing the field
      setLocal(prev => ({ ...prev, [field]: '' }))
      return
    }
    const newLat = field === 'lat' ? parsed : (local.lat as number) || 0
    const newLng = field === 'lng' ? parsed : (local.lng as number) || 0
    const point = { type: 'Point', coordinates: [newLng, newLat] }
    if (typeof onChange === 'function') onChange(point)
    // Update marker if present
    if (markerRef.current) markerRef.current.setLatLng([newLat, newLng])
    if (mapRef.current) mapRef.current.setView([newLat, newLng], 10)
    setLocal({ lat: newLat, lng: newLng })
  }

  return (
    <div>
      <div ref={containerRef} style={{ height: 300, borderRadius: 8, overflow: 'hidden' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ minWidth: 36 }}>Lat</span>
          <input type="number" step="any" value={lat as any} onChange={(e) => onManualChange('lat', e.target.value)} />
        </label>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ minWidth: 36 }}>Lng</span>
          <input type="number" step="any" value={lng as any} onChange={(e) => onManualChange('lng', e.target.value)} />
        </label>
      </div>
    </div>
  )
}

export default MapPicker
