import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { payload } from '@/lib/api';
import { Trip } from '@/types/payload';
import { env } from '@/lib/config';
import { getImageUrl } from '@/lib/images';
import TripsPaginator from '@/components/TripsPaginator'

async function getTrips(limit = 9, page = 1): Promise<{ docs: Trip[] } | null> {
  try {
    const response = await payload.getTrips({ limit, page }) as { docs: Trip[] };
    return response;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return null;
  }
}

function TripCard({ trip }: { trip: Trip }) {
  const imageUrl = getImageUrl(trip.coverImage);
  
  const country = typeof trip.country === 'object' ? trip.country.name : 'Adventure';
  return (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group">
      <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Hero Image */}
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img 
            src={imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* (regions removed for simplified card) */}
          
          {/* Title */}
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          
          {/* Summary */}
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {trip.description}
          </p>
          
          {/* Footer meta: country and travel period */}
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

export default async function AdventuresPage() {
  const tripsResp = await getTrips(9, 1);
  const trips = tripsResp?.docs || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary via-secondary to-primary py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">
            Our Adventures
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Authentic travel stories from around the world. No ads, no affiliate links, just honest experiences and practical advice.
          </p>
        </div>
      </section>

      {/* Adventures Grid */}
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {trips.length > 0 ? (
            <>
              <TripsPaginator initial={trips} initialPage={1} pageSize={9} />

              <div className="text-center mt-16">
                <p className="text-lg font-sans text-foreground">
                  More adventures coming soon. Follow our journey as we explore the world authentically.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto border border-border">
                <h3 className="text-2xl font-heading font-bold mb-4 text-card-foreground">
                  Adventures Loading...
                </h3>
                <p className="mb-6 text-muted-foreground">
                  We're currently adding our travel stories. Check back soon for authentic adventures from around the world!
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
      </main>
    </div>
  );
}