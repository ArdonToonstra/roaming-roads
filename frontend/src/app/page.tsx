import Link from 'next/link';

export default function HomePage() {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Trip Card 1 - Kyrgyzstan */}
            <Link href="/trips/kyrgyzstan-adventure" className="group">
              <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img 
                    src="/api/placeholder/400/300" 
                    alt="Kyrgyzstan Adventure"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Adventure
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Mountains
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    Kyrgyzstan Adventure
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    A stunning journey through the mountains and valleys of Kyrgyzstan, discovering nomadic culture and breathtaking landscapes.
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>14 days</span>
                    <span>Aug 2024</span>
                  </div>
                </div>
              </article>
            </Link>

            {/* Trip Card 2 - Nepal */}
            <Link href="/trips/nepal-trek" className="group">
              <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img 
                    src="/api/placeholder/400/300" 
                    alt="Nepal Himalaya Trek"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Trekking
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Spiritual
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    Nepal Himalaya Trek
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Trekking through the majestic Himalayas and experiencing the rich spiritual culture of Nepal's mountain communities.
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>18 days</span>
                    <span>Apr 2024</span>
                  </div>
                </div>
              </article>
            </Link>

            {/* Trip Card 3 - Iceland */}
            <Link href="/trips/iceland-roadtrip" className="group">
              <article className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img 
                    src="/api/placeholder/400/300" 
                    alt="Iceland Ring Road"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Road Trip
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Nature
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    Iceland Ring Road
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    A complete circuit of Iceland discovering incredible waterfalls, glaciers, geysers, and the raw beauty of Nordic nature.
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>12 days</span>
                    <span>Mar 2024</span>
                  </div>
                </div>
              </article>
            </Link>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Link 
              href="/adventures"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground font-heading font-bold rounded-full hover:opacity-90 transition-opacity duration-300"
            >
              View All Adventures
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
