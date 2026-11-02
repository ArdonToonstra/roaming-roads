import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'i18n-iso-countries';
import world from 'world-atlas/countries-110m.json';
import type { FeatureCollection, Geometry } from 'geojson';
import { data } from '@/lib/data';
import { getImageUrl } from '@/lib/images';
import GlobeMap, { type GlobeTrip } from '@/components/GlobeMap';
import type { Country } from '@/types/content';

const worldFeatures = (feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry>).features;

export default async function GlobePage() {
  const { docs } = await data.getTrips({ limit: 1000 });

  const visited = new Set<string>();
  const trips: GlobeTrip[] = docs.flatMap((trip) => {
    const ids = (trip.countries ?? [])
      .map((c) => (typeof c === 'object' ? (c as Country).countryCode : undefined))
      .map((code) => (code ? countries.alpha3ToNumeric(code) : undefined))
      .filter((id): id is string => Boolean(id));
    ids.forEach((id) => visited.add(id));
    // The marker sits in the middle of the steps; a trip without steps yet falls back to its country's centre.
    const steps = trip.itinerary.map((b) => b.location).filter((l): l is [number, number] => Array.isArray(l) && l.length >= 2);
    const country = worldFeatures.find((f) => String(f.id) === ids[0]);
    const coord = steps.length ? geoCentroid({ type: 'MultiPoint', coordinates: steps }) : country && geoCentroid(country);
    if (!coord) return [];
    return [{ slug: trip.slug || trip.id, title: trip.title, status: trip.status, period: trip.period, image: getImageUrl(trip.coverImage), coord }];
  });

  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">Our journey around the globe</h1>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <GlobeMap trips={trips} visitedIds={[...visited]} />
      </main>
    </div>
  );
}
