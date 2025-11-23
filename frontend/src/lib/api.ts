import { env, API_ENDPOINTS } from './config'
import type { Trip, PayloadCollection } from '../types/payload'

// Helper constants for environment checks
const IS_PROD = env.NODE_ENV === 'production'
const IS_DEV = env.NODE_ENV === 'development'

class PayloadAPI {
  private baseURL: string

  constructor() {
    this.baseURL = env.CMS_URL
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Ensure no double slashes if baseURL ends with / and endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${this.baseURL}${cleanEndpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Cache Strategy:
      // Dev: No store (fresh data)
      // Prod: Revalidate every hour
      ...(IS_DEV 
        ? { cache: 'no-store' as RequestCache }
        : { next: { revalidate: 3600 } }
      ),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }
}

const api = new PayloadAPI()

export const payload = {
  // -------------------------------------------------------------------------
  // Get all trips
  // -------------------------------------------------------------------------
  getTrips: async (params?: { 
    limit?: number; 
    page?: number; 
    where?: Record<string, unknown>; 
    depth?: number 
  }) : Promise<PayloadCollection<Trip>> => {
    
    console.log(`[getTrips] Fetching trips with params:`, params)
    
    // WORKAROUND: Fetching all because server-side WHERE filtering is completely broken.
    // Similar to getTrip, we fetch all and filter client-side to ensure proper filtering.
    
    const searchParams = new URLSearchParams()

    // Always fetch all trips to filter client-side (WHERE clauses are broken)
    searchParams.set('limit', '1000')
    if (typeof params?.depth === 'number') searchParams.set('depth', String(params.depth))
    
    // 3. Handle Draft Mode (Development only)
    if (IS_DEV) {
      searchParams.set('draft', 'true')
    }
    
    const query = searchParams.toString()
    const endpoint = `${API_ENDPOINTS.TRIPS}${query ? `?${query}` : ''}`
    
    // In dev, we want instant updates. In prod, cache lists for 6 mins.
    const fetchOptions = IS_DEV ? undefined : { next: { revalidate: 360 } }

    try {
      const response = await api.get<PayloadCollection<Trip>>(endpoint, fetchOptions)
      
      console.log(`[getTrips] Received ${response.docs?.length || 0} trips from API`)
      
      // CLIENT-SIDE FILTERING (since server-side WHERE is broken)
      let filteredDocs = response.docs || []
      
      // Apply production rule: only show published trips
      if (IS_PROD) {
        const beforeFilter = filteredDocs.length
        filteredDocs = filteredDocs.filter(trip => trip.status === 'published')
        console.log(`[getTrips] Production filter: ${beforeFilter} -> ${filteredDocs.length} trips`)
      }
      
      // Apply custom where conditions if provided
      if (params?.where) {
        Object.entries(params.where).forEach(([key, condition]) => {
          if (typeof condition === 'object' && condition !== null && 'equals' in condition) {
            filteredDocs = filteredDocs.filter(trip => {
              // Fix: Double cast (trip as unknown as Record...) to avoid "insufficient overlap" error
              const tripValue = (trip as unknown as Record<string, unknown>)[key]
              
              // condition is already 'unknown' from Object.entries on params.where, so single cast is fine
              return tripValue === (condition as Record<string, unknown>).equals
            })
          }
        })
      }
      
      // Apply pagination to filtered results
      const limit = params?.limit || 10
      const page = params?.page || 1
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedDocs = filteredDocs.slice(startIndex, endIndex)
      
      console.log(`[getTrips] Returning ${paginatedDocs.length} trips (page ${page}, limit ${limit})`)
      
      return {
        ...response,
        docs: paginatedDocs,
        totalDocs: filteredDocs.length,
        limit,
        page,
        totalPages: Math.ceil(filteredDocs.length / limit),
        hasNextPage: page < Math.ceil(filteredDocs.length / limit),
        hasPrevPage: page > 1,
        nextPage: page < Math.ceil(filteredDocs.length / limit) ? page + 1 : undefined,
        prevPage: page > 1 ? page - 1 : undefined,
        pagingCounter: startIndex + 1
      }
    } catch (error) {
      console.error(`[getTrips] Error:`, error)
      throw error
    }
  },

  // -------------------------------------------------------------------------
  // Get single trip by slug or ID
  // -------------------------------------------------------------------------
  getTrip: async (slugOrId: string): Promise<Trip | null> => {
    console.log(`[getTrip] Fetching: ${slugOrId}`)
    
    // WORKAROUND: Fetching all because server-side filtering is behaving unexpectedly.
    // TODO: Once backend 'where' clauses are fixed, switch to specific query for performance.
    
    const searchParams = new URLSearchParams()
    
    if (IS_DEV) {
      searchParams.set('draft', 'true')
    }

    // We keep the limit high to ensure we find the item in the list
    searchParams.set('limit', '1000') 
    
    const endpoint = `${API_ENDPOINTS.TRIPS}?${searchParams.toString()}`
    
    // Cache detail calls for 1 hour in production
    const fetchOptions = IS_DEV ? undefined : { next: { revalidate: 3600 } }

    try {
      const response = await api.get<{ docs: Trip[] }>(endpoint, fetchOptions)
      
      // Client-side find
      const trip = response.docs?.find(t => {
        const isIdMatch = t.id?.toString() === slugOrId
        const isSlugMatch = t.slug === slugOrId
        return isIdMatch || isSlugMatch
      })

      if (!trip) return null

      // PRODUCTION RULE: Filter out non-published trips found via ID/Slug
      if (IS_PROD && trip.status !== 'published') {
        console.warn(`[getTrip] Blocked access to non-published trip: ${slugOrId}`)
        return null
      }

      return trip
    } catch (error) {
      console.error(`[getTrip] Error fetching trip ${slugOrId}:`, error)
      return null
    }
  },

  // -------------------------------------------------------------------------
  // Get all countries
  // -------------------------------------------------------------------------
  getCountries: async () => {
    return api.get(API_ENDPOINTS.COUNTRIES)
  },

  // -------------------------------------------------------------------------
  // Get country by slug
  // -------------------------------------------------------------------------
  getCountry: async (slug: string) => {
    // Note: If you have issues with standard Payload 'where' syntax here, 
    // you might need to use the JSON.stringify approach used in getTrips.
    // Current standard syntax: ?where[slug][equals]=value
    const endpoint = `${API_ENDPOINTS.COUNTRIES}?where[slug][equals]=${slug}&limit=1`
    const response = await api.get<{ docs: Record<string, unknown>[] }>(endpoint)
    return response.docs[0] || null
  },

  // -------------------------------------------------------------------------
  // Get media
  // -------------------------------------------------------------------------
  getMedia: async (id: string) => {
    return api.get(`${API_ENDPOINTS.MEDIA}/${id}`)
  },
}