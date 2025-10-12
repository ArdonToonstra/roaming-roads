import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

// Mock data - later this will come from Payload CMS
const mockTrips = [
  {
    id: 1,
    slug: 'kyrgyzstan-adventure',
    title: 'Kyrgyzstan Adventure',
    summary: 'A stunning journey through the mountains and valleys of Kyrgyzstan',
    duration: '14 days',
    country: 'Kyrgyzstan',
    countryCode: 'KG',
    heroImage: '/api/placeholder/400/300',
    tags: ['Adventure', 'Mountains', 'Culture'],
    publishedAt: '2024-08-15'
  },
  {
    id: 2,
    slug: 'patagonia-expedition',
    title: 'Patagonia Expedition',
    summary: 'Exploring the wild landscapes of Patagonia across Argentina and Chile',
    duration: '21 days',
    country: 'Argentina',
    countryCode: 'AR',
    heroImage: '/api/placeholder/400/300',
    tags: ['Hiking', 'Nature', 'Photography'],
    publishedAt: '2024-06-10'
  },
  {
    id: 3,
    slug: 'nepal-trek',
    title: 'Nepal Himalaya Trek',
    summary: 'Trekking through the majestic Himalayas and experiencing local culture',
    duration: '18 days',
    country: 'Nepal',
    countryCode: 'NP',
    heroImage: '/api/placeholder/400/300',
    tags: ['Trekking', 'Mountains', 'Spiritual'],
    publishedAt: '2024-04-20'
  },
  {
    id: 4,
    slug: 'iceland-roadtrip',
    title: 'Iceland Ring Road',
    summary: 'A complete circuit of Iceland discovering waterfalls, glaciers, and geysers',
    duration: '12 days',
    country: 'Iceland',
    countryCode: 'IS',
    heroImage: '/api/placeholder/400/300',
    tags: ['Road Trip', 'Nature', 'Photography'],
    publishedAt: '2024-03-05'
  },
  {
    id: 5,
    slug: 'morocco-desert',
    title: 'Morocco Desert Journey',
    summary: 'From the Atlas Mountains to the Sahara Desert and imperial cities',
    duration: '16 days',
    country: 'Morocco',
    countryCode: 'MA',
    heroImage: '/api/placeholder/400/300',
    tags: ['Desert', 'Culture', 'Adventure'],
    publishedAt: '2024-01-15'
  },
  {
    id: 6,
    slug: 'japan-culture-tour',
    title: 'Japan Cultural Immersion',
    summary: 'Traditional and modern Japan from Tokyo temples to Kyoto gardens',
    duration: '10 days',
    country: 'Japan',
    countryCode: 'JP',
    heroImage: '/api/placeholder/400/300',
    tags: ['Culture', 'Temples', 'Food'],
    publishedAt: '2023-11-30'
  }
];

function TripCard({ trip }: { trip: typeof mockTrips[0] }) {
  return (
    <Link href={`/trips/${trip.slug}`} className="group">
      <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Hero Image */}
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img 
            src={trip.heroImage} 
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {trip.tags.map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Title */}
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          
          {/* Summary */}
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {trip.summary}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{trip.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{trip.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(trip.publishedAt).toLocaleDateString()}</span>
            </div>
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

export default function AdventuresPage() {
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

      {/* Filters Section - Placeholder for future implementation */}
      <section className="bg-card border-b border-border py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-foreground font-medium">Filter by:</span>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                All Adventures
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-md text-sm font-medium transition-colors">
                Mountains
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-md text-sm font-medium transition-colors">
                Culture
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-md text-sm font-medium transition-colors">
                Adventure
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-md text-sm font-medium transition-colors">
                Nature
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Adventures Grid */}
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
          
          {/* Pagination - Placeholder */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                Previous
              </button>
              <span className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
                1
              </span>
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                2
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}