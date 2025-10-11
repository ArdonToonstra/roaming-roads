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

      {/* Coming Soon Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold mb-6" style={{ color: '#4C3A7A' }}>
            More Adventures Coming Soon
          </h2>
          <p className="text-xl mb-8" style={{ color: '#263238', fontFamily: 'Lato, sans-serif' }}>
            We're currently adding our travel stories and building out the full experience.
          </p>
          <p className="text-lg" style={{ color: '#263238', fontFamily: 'Lato, sans-serif' }}>
            Follow our journey as we share authentic travel experiences from around the world.
          </p>
        </div>
      </section>
    </div>
  );
}
