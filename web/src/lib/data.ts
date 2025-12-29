import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Trip, PayloadCollection, Country } from '@/types/payload'
import { env } from './config'

// Helper constants
const IS_PROD = env.NODE_ENV === 'production'
const IS_DEV = env.NODE_ENV === 'development'

/**
 * Server-only data fetching utilities using Payload's Local API.
 * This bypasses the REST API overhead for faster Initial Page Loads.
 */
export const data = {
    // -------------------------------------------------------------------------
    // Get all trips
    // -------------------------------------------------------------------------
    getTrips: async (options: {
        limit?: number;
        page?: number;
        where?: Record<string, unknown>;
        depth?: number
    } = {}): Promise<PayloadCollection<Trip>> => {
        const payload = await getPayload({ config })

        // Default options
        const limit = options.limit || 10
        const page = options.page || 1
        const depth = options.depth ?? 1

        try {
            // Build query
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where: any = {
                ...(options.where || {}),
            }

            // Production filter: only published and coming_soon
            if (IS_PROD) {
                where.status = {
                    in: ['published', 'coming_soon'],
                }
            }

            const result = await payload.find({
                collection: 'trips',
                where,
                limit,
                page,
                depth,
                sort: '-createdAt', // Default sort
                draft: IS_DEV, // Enable drafts in dev mode
            })

            return result as unknown as PayloadCollection<Trip>
        } catch (error) {
            console.error('[LocalAPI] Error fetching trips:', error)
            return { docs: [], totalDocs: 0, limit, page, totalPages: 0, hasNextPage: false, hasPrevPage: false, nextPage: undefined, prevPage: undefined, pagingCounter: 0 }
        }
    },

    // -------------------------------------------------------------------------
    // Get single trip by slug
    // -------------------------------------------------------------------------
    getTrip: async (slug: string): Promise<Trip | null> => {
        const payload = await getPayload({ config })

        try {
            console.log(`[LocalAPI] Fetching trip: ${slug}`)

            // Try finding by slug first
            const result = await payload.find({
                collection: 'trips',
                where: {
                    slug: {
                        equals: slug
                    }
                },
                limit: 1,
                depth: 2, // Deeper depth for details
                draft: IS_DEV,
            })

            let trip = result.docs[0]

            // Fallback: Try finding by ID if no slug match
            if (!trip) {
                try {
                    // Verify it looks like an ID (optional check depending on ID format)
                    const byId = await payload.findByID({
                        collection: 'trips',
                        id: slug,
                        depth: 2,
                        draft: IS_DEV,
                    })
                    trip = byId
                } catch {
                    // ID lookup failed, return null
                }
            }

            if (!trip) return null

            // Enforce published status in production (coming_soon trips are not accessible)
            if (IS_PROD && trip.status !== 'published') {
                return null
            }

            return trip as unknown as Trip
        } catch (error) {
            console.error(`[LocalAPI] Error fetching trip ${slug}:`, error)
            return null
        }
    },

    // -------------------------------------------------------------------------
    // Get all countries
    // -------------------------------------------------------------------------
    getCountries: async (): Promise<Country[]> => {
        const payload = await getPayload({ config })

        try {
            const result = await payload.find({
                collection: 'countries',
                limit: 1000,
                pagination: false,
                draft: IS_DEV,
            })

            return result.docs as unknown as Country[]
        } catch (error) {
            console.error('[LocalAPI] Error fetching countries:', error)
            return []
        }
    }
}
