import { payload } from '@/lib/api';
import TripMap from '@/components/TripMap';
import type { Trip } from '@/types/payload';

async function getTrips(): Promise<Trip[]> {
  try {
    const response = await payload.getTrips({ limit: 1000 }) as { docs: Trip[] };
    return response.docs;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return [];
  }
}

export default async function GlobePage() {
  const trips = await getTrips();

  return (
    <div className="h-screen bg-background grid grid-rows-[auto_1fr]">
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

      {/* Main content */}
      <main className="overflow-hidden">
        <TripMap trips={trips} />
      </main>
    </div>
  );
}