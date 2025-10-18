"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Trip } from '@/types/payload';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

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

// Dynamically import react-leaflet components to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapContainer: any = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TileLayer: any = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Marker: any = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Marker coordinate extraction helper
function extractRepresentativeCoordinate(trip: Trip): { lat: number; lng: number } | null {
  if (!trip.itinerary || trip.itinerary.length === 0) return null;
  for (const block of trip.itinerary) {
    const b: any = block;
    const candidates: any[] = [];
    if (b.location?.coordinates) candidates.push(b.location.coordinates);
    if (Array.isArray(b.location) && b.location.length >= 2) candidates.push(b.location);
    if (b.location?.lng !== undefined && b.location?.lat !== undefined) candidates.push([b.location.lng, b.location.lat]);
    if (b.coordinates) candidates.push(b.coordinates);
    if (b.locationCoordinates) candidates.push(b.locationCoordinates);
    for (const raw of candidates) {
      if (Array.isArray(raw) && raw.length >= 2) {
        const lng = typeof raw[0] === 'string' ? Number(raw[0]) : raw[0];
        const lat = typeof raw[1] === 'string' ? Number(raw[1]) : raw[1];
        if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  }
  return null;
}

export interface TripMapProps {
  trips: Trip[];
  onMarkerHover?: (tripId: number | null) => void;
  hoveredTripId?: number | null;
}

export default function TripMap({ trips, onMarkerHover, hoveredTripId }: TripMapProps) {
  const router = useRouter();
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const markers = useMemo(() => {
    return trips.map(t => ({ trip: t, coord: extractRepresentativeCoordinate(t) })).filter(m => m.coord);
  }, [trips]);

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
      
      // Fit bounds after Leaflet is loaded
      if (mapRef.current && markers.length > 0 && L) {
        const map = mapRef.current;
        const bounds = L.latLngBounds(markers.map(m => [m.coord!.lat, m.coord!.lng]));
        
        if (markers.length === 1) {
          // For single marker, center and set reasonable zoom
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
        } else {
          // For multiple markers, fit all with padding
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      }
    }).catch(() => {});
  }, [markers]);

  const initialCenter: [number, number] = markers.length > 0 ? [markers[0].coord!.lat, markers[0].coord!.lng] : [20, 0];
  const initialZoom = markers.length > 0 ? 5 : 2;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-[400px] w-full"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        whenCreated={(map: any) => { mapRef.current = map; }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ trip, coord }, idx) => {
          if (!coord) return null;
          const numericId = typeof trip.id === 'number' ? trip.id : Number(trip.id);
          const highlighted = hoveredTripId === numericId;
          const L = leafletRef.current;
          const icon = L ? L.divIcon({ html: `<div class=\"rr-marker ${highlighted ? 'rr-marker-highlight' : ''}\">${idx + 1}</div>`, className: '', iconSize: [28, 28] }) : undefined;
          return (
            <Marker
              key={trip.id}
              position={[coord.lat, coord.lng]}
              {...(icon ? { icon } : {})}
              eventHandlers={{
                click: () => router.push(`/trips/${trip.slug || trip.id}`),
                mouseover: () => numericId && onMarkerHover?.(numericId),
                mouseout: () => onMarkerHover?.(null),
              }}
            />
          );
        })}
      </MapContainer>
      <div className="p-4 text-xs text-muted-foreground border-t border-border">
        {markers.length > 0 ? `${markers.length} trip${markers.length === 1 ? '' : 's'} mapped` : 'No itinerary coordinates yet'}
      </div>
    </div>
  );
}
