import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { payload } from '@/lib/api';
import { Trip } from '@/types/payload';
import { env } from '@/lib/config';

async function getTrips(): Promise<Trip[]> {
  try {
    // In development mode, include draft trips
    const statusFilter = env.NODE_ENV === 'development' 
      ? { status: { in: ['published', 'draft'] } }
      : { status: { equals: 'published' } };

    const response = await payload.getTrips({
      where: statusFilter
    }) as { docs: Trip[] };
    return response.docs;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return [];
  }
}

function TripCard({ trip }: { trip: Trip }) {
  const coverImage = trip.coverImage;
  const imageUrl = typeof coverImage === 'object' && coverImage.url 
    ? coverImage.url 
    : '/api/placeholder/400/300';
  
  const country = typeof trip.country === 'object' ? trip.country.name : 'Adventure';
  const regions = trip.regionsVisited?.slice(0, 2) || [];
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
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {regions.map((region, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md"
              >
                {region.regionName}
              </span>
            ))}
          </div>
          
          {/* Title */}
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          
          {/* Summary */}
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {trip.description}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{country}</span>
              </div>
              {trip.period && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{trip.period}</span>
                </div>
              )}
            </div>
            {trip.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {/* Read More Link */}
          <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-200">
            <span>Read the adventure</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function AdventuresPage() {
  const trips = await getTrips();

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