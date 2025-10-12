import Link from 'next/link';
import { payload } from '@/lib/api';
import { Trip } from '@/types/payload';
import { env } from '@/lib/config';

async function getFeaturedTrips(): Promise<Trip[]> {
  try {
    const response = await payload.getTrips({
      where: { 
        featured: { equals: true }
      },
      limit: 3
    }) as { docs: Trip[] };
    
    // If no featured trips, get the 3 most recent trips
    if (response.docs.length === 0) {
      const fallbackResponse = await payload.getTrips({
        limit: 3
      }) as { docs: Trip[] };
      return fallbackResponse.docs;
    }
    
    return response.docs;
  } catch (error) {
    console.error('Failed to fetch featured trips:', error);
    return [];
  }
}

function FeaturedTripCard({ trip }: { trip: Trip }) {
  const coverImage = trip.coverImage;
  const imageUrl = typeof coverImage === 'object' && coverImage.url 
    ? coverImage.url 
    : '/api/placeholder/400/300';
  
  const country = typeof trip.country === 'object' ? trip.country.name : 'Adventure';
  
  return (
    <Link href={`/trips/${trip.slug || trip.id}`} className="group">
      <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img 
            src={imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {trip.regionsVisited?.slice(0, 2).map((region, index) => (
              <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                {region.regionName}
              </span>
            ))}
          </div>
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {trip.description}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{country}</span>
            <span>{trip.period || 'Adventure'}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function HomePage() {
  const featuredTrips = await getFeaturedTrips();
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F1ED' }}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden -mt-16">
        {/* Background Gradient inspired by brand colors */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(135deg, #4C3A7A 0%, #F57D50 50%, #2A9D8F 100%)' 
          }} 
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative text-center z-10 max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-wider">
              ROAMING ROADS
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 uppercase">
            Find Your Next Road
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
            Authentic travel guides, honestly written. No ads. No affiliate links. Ever.
          </p>
          
          <Link 
            href="/trips" 
            className="inline-block px-12 py-4 text-white font-heading font-bold text-lg uppercase tracking-wide rounded-full transition-colors duration-300 hover:opacity-90"
            style={{ backgroundColor: '#F57D50' }}
          >
            Explore Guides
          </Link>
        </div>
      </section>

      {/* Featured Adventures Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-muted-foreground mb-4">
              Featured Adventures
            </h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Discover some of our most authentic and inspiring travel experiences from around the world.
            </p>
          </div>

          {featuredTrips.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredTrips.map((trip) => (
                  <FeaturedTripCard key={trip.id} trip={trip} />
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12">
                <Link 
                  href="/trips"
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground font-heading font-bold rounded-full hover:opacity-90 transition-opacity duration-300"
                >
                  View All Adventures
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-card rounded-xl p-8 max-w-lg mx-auto border border-border">
                <h3 className="text-2xl font-heading font-bold mb-4 text-card-foreground">
                  Adventures Coming Soon
                </h3>
                <p className="mb-6 text-muted-foreground">
                  We're currently adding our travel stories and adventures. Check back soon for authentic travel experiences!
                </p>
                <Link 
                  href="/trips"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground font-heading font-bold rounded-full hover:opacity-90 transition-opacity duration-300"
                >
                  Explore Trips
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
