import Link from 'next/link';
import { MapPin, Heart, Camera, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F1ED' }}>
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6" style={{ color: '#4C3A7A' }}>
            About Roaming Roads
          </h1>
          <p className="text-xl leading-relaxed" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
            We're passionate travelers who believe that every journey has a story worth sharing.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16" style={{ backgroundColor: '#F4F1ED' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold mb-6" style={{ color: '#2A9D8F' }}>
              Our Mission
            </h2>
            <p className="text-xl leading-relaxed mb-8" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
              To inspire and help travelers plan authentic journeys. We are an ad-free, honest resource 
              built on real, personal travel experiences.
            </p>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-lg font-bold mb-4" style={{ color: '#F57D50' }}>
                100% ad-free. 100% authentic. 100% real travel experiences.
              </p>
              <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                We provide detailed itineraries, stunning photography, and honest insights to help you 
                plan your own adventures and discover the world's most incredible destinations.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F57D50' }}>
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4" style={{ color: '#4C3A7A' }}>
                Adventurous
              </h3>
              <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                We encourage exploration and stepping off the beaten path. We seek the unique and unexpected.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2A9D8F' }}>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4" style={{ color: '#4C3A7A' }}>
                Independent
              </h3>
              <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                100% ad-free and affiliate-free. Our content is unbiased and driven by genuine experience.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4C3A7A' }}>
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4" style={{ color: '#4C3A7A' }}>
                Honest
              </h3>
              <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                We provide a real, unfiltered look at travel - the good, the bad, and the unexpected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-center mb-12" style={{ color: '#4C3A7A' }}>
            Our Approach
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F57D50' }}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>
                  Real Experiences
                </h3>
                <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                  Every trip we share is one we've personally taken. We don't recommend places we haven't been 
                  or experiences we haven't had ourselves.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2A9D8F' }}>
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>
                  Authentic Photography
              </h3>
                <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                  All photos are taken by us during our travels. No stock images, no staged shots - 
                  just real moments from real adventures.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#4C3A7A' }}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold mb-3" style={{ color: '#2A9D8F' }}>
                  Practical Advice
                </h3>
                <p style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
                  We focus on actionable tips and honest insights that help you plan your own adventures, 
                  from budget breakdowns to transportation details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: '#F4F1ED' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-6" style={{ color: '#4C3A7A' }}>
            Ready to Start Your Adventure?
          </h2>
          <p className="text-lg mb-8" style={{ fontFamily: 'Lato, sans-serif', color: '#263238' }}>
            Explore our collection of authentic travel stories and start planning your next journey.
          </p>
          <Link 
            href="/trips"
            className="inline-block px-8 py-4 text-white font-heading font-bold text-lg rounded-full transition-colors duration-300 hover:opacity-90"
            style={{ backgroundColor: '#F57D50' }}
          >
            Explore Our Adventures
          </Link>
        </div>
      </section>
    </div>
  );
}