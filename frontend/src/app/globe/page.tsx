import { payload } from '@/lib/api'
import WorldMapClient from '@/components/WorldMapClient'
import type { Trip } from '@/types/payload'

// Server component: fetch trips and pass to client map
export default async function GlobePage() {
  const resp = await payload.getTrips({ limit: 1000 })
  const trips = resp.docs

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

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden">
              {/* Client-only interactive map */}
              <WorldMapClient trips={trips} />
            </div>
            {/* Debug: show fetched trips and their country fields */}
            <div className="mt-4 text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">Debug: fetched trips (first 20)</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {trips.slice(0, 20).map((t) => (
                  <li key={t.id} className="p-2 bg-muted/50 rounded">
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs">country: {JSON.stringify(t.country)}</div>
                    <div className="text-xs">period: {String(t.period)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}