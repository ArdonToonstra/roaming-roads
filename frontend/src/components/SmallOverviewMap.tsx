"use client";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { Trip, CmsFullDayBlock, CmsWaypointBlock } from '@/types/payload';
import { useMemo, useRef, useEffect } from 'react';

// Types for Leaflet
interface LeafletMapInstance {
  fitBounds: (bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number }) => void;
}

interface LeafletModule {
  latLngBounds: (coords: Array<[number, number]>) => {
    pad: (amount: number) => unknown;
  };
  divIcon: (options: { html: string; className: string; iconSize: [number, number] }) => unknown;
  Icon?: {
    Default?: {
      prototype: Record<string, unknown>;
      mergeOptions: (options: { iconUrl: string; iconRetinaUrl: string; shadowUrl: string }) => void;
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapContainer: any = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TileLayer: any = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

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

  // Dynamically import Leaflet and handle bounds fitting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((mod) => {
      leafletRef.current = (mod && (mod as any).default) || mod;
      // Configure Leaflet icon paths to use static assets
      const L = leafletRef.current;
      if (L && L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
        });
      }
      
      // Auto-fit bounds to markers after Leaflet is loaded
      if (mapRef.current && markers.length > 0 && L) {
        const map = mapRef.current;
        const bounds = L.latLngBounds(markers.map(m => [m.coord.lat, m.coord.lng]));
        
        if (markers.length === 1) {
          // For single marker, fit bounds but with reasonable zoom limit
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
        } else {
          // For multiple markers, fit all with padding
          map.fitBounds(bounds, { padding: [15, 15] });
        }
      }
    }).catch(() => {});
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
