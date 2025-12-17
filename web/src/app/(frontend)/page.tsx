import { data } from '@/lib/data';
import { Trip } from '@/types/payload';
import { env } from '@/lib/config';
import { getImageUrl } from '@/lib/images';
import HeroRotator from '@/components/HeroRotator';
import FeaturedCarousel from '@/components/FeaturedCarousel';

async function getFeaturedTrips(): Promise<Trip[]> {
  try {
    // Fetch all trips using Local API
    const response = await data.getTrips({
      limit: 1000,
    });

    const allTrips = response.docs;

    // Shuffle the array (Fisher-Yates shuffle)
    for (let i = allTrips.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTrips[i], allTrips[j]] = [allTrips[j], allTrips[i]];
    }

    // Return the first 8
    return allTrips.slice(0, 8);

  } catch (error) {
    console.error('Failed to fetch featured trips:', error);
    return [];
  }
}

// Get a pool of trips to choose a hero image from (featured or most recent)
async function getHeroCandidates(): Promise<Trip[]> {
  try {
    const response = await data.getTrips({ limit: 8 });
    return response.docs;
  } catch (error) {
    console.error('Failed to fetch hero candidates:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredTrips = await getFeaturedTrips();
  const heroCandidates = await getHeroCandidates();

  // Prepare images for client-side rotator (resolve URLs)
  const heroImages = heroCandidates.length > 0 ? heroCandidates.map(t => ({
    url: getImageUrl(t.coverImage),
    title: t.title,
    description: t.description,
    href: `/trips/${t.slug || t.id}`,
  })) : [{ url: '/roaming-roads-logo-no-text.svg', title: 'Roaming Roads' }];
  return (
    <div className="min-h-screen homepage" style={{ backgroundColor: '#F4F1ED' }}>
      {/* Hero Section (rotating trip cover) */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden pt-24 -mt-16">
        {/* Client-side rotator */}
        <HeroRotator images={heroImages} intervalMs={60_000} />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative text-center z-10 max-w-4xl mx-auto px-4">

          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6 uppercase">
            Find Your Next Road
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
            Authentic travel guides, honestly written. No ads. No affiliate links. Ever.
          </p>

          <Link
            href="/adventures"
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
              Discover some of our travel experiences from around the world.
            </p>
          </div>

          {featuredTrips.length > 0 ? (
            <>
              <FeaturedCarousel
                items={featuredTrips}
              />
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
