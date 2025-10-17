'use client';

import { useState, useMemo } from 'react';
import TripMap from '@/components/TripMap';
import { Trip } from '@/types/payload';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getImageUrl } from '@/lib/images';

interface TripsInteractiveProps {
  trips: Trip[];
}

export default function TripsInteractive({ trips }: TripsInteractiveProps) {
  const [hoveredTripId, setHoveredTripId] = useState<number | null>(null);

  const numberedTrips = useMemo(() => {
    return trips.map((t, idx) => ({ trip: t, order: idx + 1 }));
  }, [trips]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Sidebar with interactive map */}
      <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="sticky top-28 space-y-6">
          <div>
            <h2 className="text-lg font-heading font-bold mb-3 text-card-foreground">Explore Our Journeys</h2>
            <TripMap 
              trips={trips} 
              onMarkerHover={(id) => setHoveredTripId(id)}
              hoveredTripId={hoveredTripId}
            />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Hover a marker or card to highlight it; click a marker or card to open full details.
            </p>
          </div>
        </div>
      </aside>
      {/* Cards */}
      <div className="lg:col-span-8 xl:col-span-9">
        {numberedTrips.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {numberedTrips.map(({ trip, order }) => {
              const imageUrl = getImageUrl(trip.coverImage);
              const country = typeof trip.country === 'object' ? trip.country.name : 'Unknown';
              const numericId = typeof trip.id === 'number' ? trip.id : Number(trip.id);
              const highlighted = hoveredTripId === numericId;
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.slug || trip.id}`}
                  className={`group block transition-shadow duration-300 rounded-xl overflow-hidden border ${highlighted ? 'border-primary ring-2 ring-primary' : 'border-border'} bg-card shadow-sm hover:shadow-lg hover:-translate-y-1`}
                  onMouseEnter={() => setHoveredTripId(numericId)}
                  onMouseLeave={() => setHoveredTripId(null)}
                >
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={trip.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <div className={`rr-marker ${highlighted ? 'rr-marker-highlight' : ''}`}>{order}</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm mb-3 text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{country}</span>
                      {trip.period && (
                        <>
                          <span>•</span>
                          <span>{trip.period}</span>
                        </>
                      )}
                    </div>
                    <h3 className={`font-heading text-2xl font-bold mb-3 transition-colors duration-200 ${highlighted ? 'text-primary' : 'text-foreground'}`}>
                      {trip.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 font-sans text-foreground">{trip.description}</p>
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{country}</span>
                      </div>
                      {trip.period && <div>{trip.period}</div>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
              <h3 className="text-2xl font-heading font-bold mb-4 text-muted-foreground">Adventures Loading...</h3>
              <p className="mb-6 font-sans text-foreground">We're currently adding our travel stories. Check back soon for authentic adventures!</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-heading font-bold rounded-full transition-opacity duration-300 hover:opacity-90"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
