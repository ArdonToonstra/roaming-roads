import { Suspense } from 'react';
import { data } from '@/lib/data';
import { Trip } from '@/types/content';
import AdventureFilters from './components/AdventureFilters';

async function getTrips(): Promise<Trip[]> {
  try {
    // Fetch all trips for filtering (set high limit to get all)
    const response = await data.getTrips({
      limit: 1000
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
      {/* Adventures with Filters */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdventureFiltersWrapper trips={trips} />
        </div>
      </main>
    </div>
  );
}