"use client";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { Trip, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import { useMemo, useRef, useEffect } from 'react';

const MapContainer: any = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer: any = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker: any = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return isNaN(n) ? null : n;
  }
  return null;
}

function extractBlockCoords(block: CmsFullDayBlock | CmsWaypointBlock) {
  const b: any = block;
  const candidates: any[] = [];
  if (b.location?.coordinates) candidates.push(b.location.coordinates);
  if (Array.isArray(b.location) && b.location.length >= 2) candidates.push(b.location);
  if (b.location?.lng !== undefined && b.location?.lat !== undefined) candidates.push([b.location.lng, b.location.lat]);
  if (b.locationLng !== undefined && b.locationLat !== undefined) candidates.push([b.locationLng, b.locationLat]);
  if (b.coordinates) candidates.push(b.coordinates);
  if (b.locationCoordinates) candidates.push(b.locationCoordinates);
  for (const raw of candidates) {
    if (Array.isArray(raw) && raw.length >= 2) {
      const lng = toNumber(raw[0]);
      const lat = toNumber(raw[1]);
      if (lng !== null && lat !== null) return { lat, lng };
    } else if (typeof raw === 'object' && raw) {
      const lng = toNumber(raw.lng);
      const lat = toNumber(raw.lat);
      if (lng !== null && lat !== null) return { lat, lng };
    }
  }
  return null;
}

export default function SmallOverviewMap({ trip }: { trip: Trip }) {
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  // Dynamically import Leaflet on the client only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((mod) => {
      leafletRef.current = (mod && (mod as any).default) || mod;
    }).catch(() => {});
  }, []);

  const markers = useMemo(() => {
    if (!trip.itinerary) return [];
    const m: { coord: { lat: number; lng: number }; idx: number }[] = [];
    trip.itinerary.forEach((block, idx) => {
      const coord = extractBlockCoords(block as any);
      if (coord) {
        m.push({ coord, idx });
      }
    });
    return m;
  }, [trip.itinerary]);

  // Auto-fit bounds to markers when they change
  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;
    const map = mapRef.current;
    const L = (window as any).L;
    if (!L) return;
    
    // Always create bounds from all markers and fit them
    const bounds = L.latLngBounds(markers.map(m => [m.coord.lat, m.coord.lng]));
    
    if (markers.length === 1) {
      // For single marker, fit bounds but with reasonable zoom limit
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
    } else {
      // For multiple markers, fit all with padding
      map.fitBounds(bounds, { padding: [15, 15] });
    }
  }, [markers]);

  // Initial center and zoom (will be overridden by useEffect for markers)
  const center: [number, number] = markers.length > 0 ? [markers[0].coord.lat, markers[0].coord.lng] : [20, 0];
  const zoom = markers.length > 0 ? 7 : 3;

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card shadow-sm w-full md:w-96">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="h-48 w-full" 
        scrollWheelZoom={false} 
        dragging={false} 
        doubleClickZoom={false} 
        zoomControl={false} 
        touchZoom={false} 
        attributionControl={false}
        whenCreated={(map: any) => { mapRef.current = map; }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map(m => {
          const L = leafletRef.current;
          const icon = L ? L.divIcon({ html: `<div class=\"rr-marker\">${m.idx + 1}</div>`, className: '', iconSize: [24, 24] }) : undefined;
          return (
            <Marker key={m.idx} position={[m.coord.lat, m.coord.lng]} {...(icon ? { icon } : {})} />
          );
        })}
      </MapContainer>
      <div className="p-3 text-xs text-muted-foreground border-t border-border">
        {markers.length > 0 ? `${markers.length} itinerary point${markers.length === 1 ? '' : 's'}` : 'No coordinates yet'}
      </div>
    </div>
  );
}
