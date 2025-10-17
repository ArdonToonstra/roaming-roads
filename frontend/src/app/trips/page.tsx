import { payload } from '@/lib/api';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Trip, Media, Country } from '@/types/payload';
import { env } from '@/lib/config';
import { getImageUrl } from '@/lib/images';

async function getTrips(): Promise<Trip[]> {
  try {
    const response = await payload.getTrips() as { docs: Trip[] };
    return response.docs;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return [];
  }
}

function TripCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);
  
  const country = typeof trip.country === 'object' ? trip.country.name : 'Unknown';
  return (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group block">
      <article className="bg-card rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="relative">
          <img 
            src={imageUrl}
            alt={trip.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* (highlights badge removed - simplified card) */}
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
          
          <h3 className="font-heading text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-200 text-foreground">
            {trip.title}
          </h3>
          
          <p className="mb-4 line-clamp-3 font-sans text-foreground">
            {trip.description}
          </p>
          
          {/* Footer meta: country and travel period (kept) */}
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{country}</span>
            </div>
            {trip.period && <div>{trip.period}</div>}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-muted-foreground">
              Our Travel Stories
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed font-sans text-foreground">
              Authentic adventures from around the world. No ads, no affiliate links, 
              just honest travel experiences to inspire your next journey.
            </p>
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {trips.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              
              <div className="text-center mt-16">
                <p className="text-lg font-sans text-foreground">
                  More adventures coming soon. Follow our journey as we explore the world authentically.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                <h3 className="text-2xl font-heading font-bold mb-4 text-muted-foreground">
                  Adventures Loading...
                </h3>
                <p className="mb-6 font-sans text-foreground">
                  We're currently adding our travel stories. Check back soon for authentic adventures!
                </p>
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
      </section>
    </div>
  );
}