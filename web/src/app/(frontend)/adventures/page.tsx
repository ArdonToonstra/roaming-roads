import { Suspense } from 'react';
import { data } from '@/lib/data';
import { Trip } from '@/types/payload';
import AdventureFilters from './components/AdventureFilters';

async function getTrips(): Promise<Trip[]> {
  try {
    // Fetch all trips for filtering (set high limit to get all)
    const response = await data.getTrips({
      limit: 1000,
      depth: 2 // Include full country and media data
    });
    return response.docs;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return [];
  }
}

function AdventureFiltersWrapper({ trips }: { trips: Trip[] }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-8">Loading filters...</div>}>
      <AdventureFilters trips={trips} />
    </Suspense>
  );
}

export default async function AdventuresPage() {
  const trips = await getTrips();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary via-secondary to-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">
            Our Adventures
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Authentic travel stories from around the world. No ads, no affiliate links, just honest experiences and practical advice.
          </p>
        </div>
      </section>

      {/* Adventures with Filters */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdventureFiltersWrapper trips={trips} />
        </div>
      </main>
    </div>
  );
}