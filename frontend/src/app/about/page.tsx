import Link from 'next/link';
import { MapPin, Heart, Camera, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Hero Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-muted-foreground">
            About Roaming Roads
          </h1>
          <p className="text-xl leading-relaxed font-sans text-foreground">
            We're passionate travelers who believe that every journey has a story worth sharing.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold mb-6 text-secondary">
              Our Mission
            </h2>
            <p className="text-xl leading-relaxed mb-8 font-sans text-foreground">
              To inspire and help travelers plan authentic journeys. We are an ad-free, honest resource 
              built on real, personal travel experiences.
            </p>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <p className="text-lg font-bold mb-4 text-primary">
                100% ad-free. 100% authentic. 100% real travel experiences.
              </p>
              <p className="font-sans text-card-foreground">
                We provide detailed itineraries, stunning photography, and honest insights to help you 
                plan your own adventures and discover the world's most incredible destinations.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-muted-foreground">
                Adventurous
              </h3>
              <p className="font-sans text-card-foreground">
                We encourage exploration and stepping off the beaten path. We seek the unique and unexpected.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary">
                <Heart className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-muted-foreground">
                Independent
              </h3>
              <p className="font-sans text-card-foreground">
                100% ad-free and affiliate-free. Our content is unbiased and driven by genuine experience.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-muted-foreground">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 text-muted-foreground">
                Honest
              </h3>
              <p className="font-sans text-card-foreground">
                We provide a real, unfiltered look at travel - the good, the bad, and the unexpected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-center mb-12 text-muted-foreground">
            Our Approach
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold mb-3 text-secondary">
                  Real Experiences
                </h3>
                <p className="font-sans text-card-foreground">
                  Every trip we share is one we've personally taken. We don't recommend places we haven't been 
                  or experiences we haven't had ourselves.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary">
                <Camera className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold mb-3 text-secondary">
                  Authentic Photography
              </h3>
                <p className="font-sans text-card-foreground">
                  All photos are taken by us during our travels. No stock images, no staged shots - 
                  just real moments from real adventures.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-muted-foreground">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold mb-3 text-secondary">
                  Practical Advice
                </h3>
                <p className="font-sans text-card-foreground">
                  We focus on actionable tips and honest insights that help you plan your own adventures, 
                  from budget breakdowns to transportation details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-6 text-muted-foreground">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-lg mb-8 font-sans text-foreground">
            Explore our collection of authentic travel stories and start planning your next journey.
          </p>
          <Link 
            href="/trips"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground font-heading font-bold text-lg rounded-full transition-opacity duration-300 hover:opacity-90"
          >
            Explore Our Adventures
          </Link>
        </div>
      </section>
    </div>
  );
}