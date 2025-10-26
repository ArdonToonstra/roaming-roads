"use client";
import React, { useState } from 'react'
import { payload } from '@/lib/api'
import type { Trip } from '@/types/payload'
import TripCard from '@/app/adventures/TripCard'

export default function TripsPaginator({ initial, initialPage = 1, pageSize = 9 }: { initial: Trip[]; initialPage?: number; pageSize?: number }) {
  const [items, setItems] = useState<Trip[]>(initial)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    if (loading) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await payload.getTrips({ limit: pageSize, page: nextPage }) as { docs: Trip[] }
      const docs = res.docs || []
      setItems(prev => [...prev, ...docs])
      setPage(nextPage)
      if (docs.length < pageSize) setHasMore(false)
    } catch (err) {
      console.error('Failed to load more trips', err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(t => (
          <TripCard key={t.id} trip={t} />
        ))}
      </div>

      <div className="mt-8 text-center">
        {hasMore ? (
          <button onClick={loadMore} disabled={loading} className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition">
            {loading ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">No more adventures.</p>
        )}
      </div>
    </>
  )
}
