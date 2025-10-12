'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

// Mock trip data with country coordinates for positioning
const tripsData = [
  {
    id: 1,
    slug: 'kyrgyzstan-adventure',
    title: 'Kyrgyzstan Adventure',
    summary: 'A stunning journey through the mountains and valleys of Kyrgyzstan',
    country: 'Kyrgyzstan',
    countryCode: 'KG',
    coordinates: { lat: 41.2044, lng: 74.7661 },
    duration: '14 days',
    publishedAt: '2024-08-15',
    heroImage: '/api/placeholder/300/200'
  },
  {
    id: 2,
    slug: 'patagonia-expedition',
    title: 'Patagonia Expedition',
    summary: 'Exploring the wild landscapes of Patagonia',
    country: 'Argentina',
    countryCode: 'AR',
    coordinates: { lat: -38.4161, lng: -63.6167 },
    duration: '21 days',
    publishedAt: '2024-06-10',
    heroImage: '/api/placeholder/300/200'
  },
  {
    id: 3,
    slug: 'nepal-trek',
    title: 'Nepal Himalaya Trek',
    summary: 'Trekking through the majestic Himalayas',
    country: 'Nepal',
    countryCode: 'NP',
    coordinates: { lat: 28.3949, lng: 84.1240 },
    duration: '18 days',
    publishedAt: '2024-04-20',
    heroImage: '/api/placeholder/300/200'
  },
  {
    id: 4,
    slug: 'iceland-roadtrip',
    title: 'Iceland Ring Road',
    summary: 'A complete circuit of Iceland discovering natural wonders',
    country: 'Iceland',
    countryCode: 'IS',
    coordinates: { lat: 64.9631, lng: -19.0208 },
    duration: '12 days',
    publishedAt: '2024-03-05',
    heroImage: '/api/placeholder/300/200'
  },
  {
    id: 5,
    slug: 'morocco-desert',
    title: 'Morocco Desert Journey',
    summary: 'From the Atlas Mountains to the Sahara Desert',
    country: 'Morocco',
    countryCode: 'MA',
    coordinates: { lat: 31.7917, lng: -7.0926 },
    duration: '16 days',
    publishedAt: '2024-01-15',
    heroImage: '/api/placeholder/300/200'
  },
  {
    id: 6,
    slug: 'japan-culture-tour',
    title: 'Japan Cultural Immersion',
    summary: 'Traditional and modern Japan from Tokyo to Kyoto',
    country: 'Japan',
    countryCode: 'JP',
    coordinates: { lat: 36.2048, lng: 138.2529 },
    duration: '10 days',
    publishedAt: '2023-11-30',
    heroImage: '/api/placeholder/300/200'
  }
];

function TripMarker({ trip, onClick }: { 
  trip: typeof tripsData[0];
  onClick: () => void;
}) {
  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{
        left: `${((trip.coordinates.lng + 180) / 360) * 100}%`,
        top: `${((90 - trip.coordinates.lat) / 180) * 100}%`
      }}
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-lg group-hover:scale-125 transition-transform duration-200">
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
        </div>
        <MapPin className="absolute -top-6 -left-3 w-6 h-6 text-primary drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </div>
  );
}

function TripCard({ trip, onClose }: { 
  trip: typeof tripsData[0]; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-lg border border-border max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-[4/3] bg-muted overflow-hidden rounded-t-lg">
          <img 
            src={trip.heroImage} 
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>{trip.country}</span>
          </div>
          
          <h3 className="font-heading font-bold text-xl text-card-foreground mb-2">
            {trip.title}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {trip.summary}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(trip.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <a 
              href={`/trips/${trip.slug}`}
              className="flex-1 bg-primary text-primary-foreground text-center py-2 px-4 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Read Adventure
            </a>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-border transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GlobePage() {
  const [selectedTrip, setSelectedTrip] = useState<typeof tripsData[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-secondary via-primary to-secondary py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">
            Our Journey Around the Globe
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Discover our adventures across the world. Click on any country marker to see our travel stories from that destination.
          </p>
        </div>
      </section>

      {/* Interactive World Map */}
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-blue-200 to-blue-100 rounded-lg overflow-hidden">
              {/* World Map Background - Using CSS for a simple representation */}
              <div 
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 250 Q250 200 500 250 Q750 300 1000 250 L1000 500 L0 500 Z' fill='%23E5E7EB'/%3E%3C/svg%3E")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Continents - Simplified representation */}
              <div className="absolute inset-0">
                {/* North America */}
                <div className="absolute w-32 h-40 bg-muted rounded-lg transform rotate-12" 
                     style={{ top: '15%', left: '15%' }} />
                {/* South America */}
                <div className="absolute w-20 h-48 bg-muted rounded-lg transform rotate-6" 
                     style={{ top: '35%', left: '25%' }} />
                {/* Europe */}
                <div className="absolute w-24 h-20 bg-muted rounded-lg" 
                     style={{ top: '20%', left: '45%' }} />
                {/* Africa */}
                <div className="absolute w-28 h-44 bg-muted rounded-lg" 
                     style={{ top: '25%', left: '50%' }} />
                {/* Asia */}
                <div className="absolute w-40 h-36 bg-muted rounded-lg transform -rotate-3" 
                     style={{ top: '18%', left: '60%' }} />
                {/* Australia */}
                <div className="absolute w-16 h-12 bg-muted rounded-lg" 
                     style={{ top: '65%', left: '75%' }} />
              </div>
              
              {/* Trip Markers */}
              {tripsData.map((trip) => (
                <TripMarker
                  key={trip.id}
                  trip={trip}
                  onClick={() => setSelectedTrip(trip)}
                />
              ))}
              
              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-card-foreground">Our Adventures</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Click on any glowing marker to explore our adventure in that country
              </p>
            </div>
          </div>

         
        </div>
      </main>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripCard 
          trip={selectedTrip} 
          onClose={() => setSelectedTrip(null)} 
        />
      )}
    </div>
  );
}