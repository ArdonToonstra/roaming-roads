'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Trip } from '@/types/payload';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import { env } from '@/lib/config';
import Link from 'next/link';
import { getImageUrl } from '@/lib/images';

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
const MapContainer: any = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer: any = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker: any = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup: any = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// A simple card component for the popup
function PopupCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);
  return (
    <div className="w-64">
      <img src={imageUrl} alt={trip.title} className="w-full h-32 object-cover rounded-t-lg" />
      <div className="p-3">
        <h3 className="font-heading font-bold text-lg mb-2">{trip.title}</h3>
        <Link href={`/trips/${trip.slug || trip.id}`} className="text-primary font-bold hover:underline text-sm">
          View Trip &rarr;
        </Link>
      </div>
    </div>
  );
}

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
      const L = leafletRef.current;
      if (L && L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
        });
      }
      
      if (mapRef.current && markers.length > 0 && L) {
        const map = mapRef.current;
        const bounds = L.latLngBounds(markers.map(m => [m.coord!.lat, m.coord!.lng]));
        
        if (markers.length === 1) {
          map.fitBounds(bounds, { padding: [100, 100], maxZoom: 4 });
        } else {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 3 });
        }
      }
    }).catch(() => {});
  }, [markers]);

  const initialCenter: [number, number] = markers.length > 0 ? [20, 0] : [20, 0];
  const initialZoom = markers.length > 0 ? 2 : 1;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full"
        whenCreated={(map: any) => { mapRef.current = map; }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        maxBounds={[[-90, -180], [90, 180]]}
      >
        <TileLayer
          attribution={env.MAPTILER_KEY ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'}
          url={env.MAPTILER_KEY ? `https://api.maptiler.com/maps/satellite-v2/{z}/{x}/{y}.jpg?key=${env.MAPTILER_KEY}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        {env.MAPTILER_KEY && (
          <TileLayer
            attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> contributors'
            url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${env.MAPTILER_KEY}`}
            zIndex={650}
            opacity={1}
          />
        )}
        {markers.map(({ trip, coord }, idx) => {
          if (!coord) return null;
          const numericId = typeof trip.id === 'number' ? trip.id : Number(trip.id);
          const highlighted = hoveredTripId === numericId;
          const L = leafletRef.current;
          const icon = L ? L.divIcon({ html: `<div class="rr-marker rr-marker-globe ${highlighted ? 'rr-marker-highlight' : ''}"></div>`, className: '', iconSize: [16, 16] }) : undefined;
          return (
            <Marker
              key={trip.id}
              position={[coord.lat, coord.lng]}
              {...(icon ? { icon } : {})}
              eventHandlers={{
                mouseover: () => numericId && onMarkerHover?.(numericId),
                mouseout: () => onMarkerHover?.(null),
              }}
            >
              <Popup>
                <PopupCard trip={trip} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}