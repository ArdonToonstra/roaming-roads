import { env, API_ENDPOINTS } from './config'
import type { Trip, PayloadCollection } from '../types/payload'

// Base API client for Payload CMS
class PayloadAPI {
  private baseURL: string

  constructor() {
    this.baseURL = env.CMS_URL
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // In development, disable caching to always get fresh data
      // In production, cache for better performance
      ...(env.NODE_ENV === 'development' 
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

// API functions for each collection
export const payload = {
  // Get all trips
  getTrips: async (params?: { limit?: number; page?: number; where?: Record<string, unknown>; depth?: number }) : Promise<PayloadCollection<Trip>> => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.page) searchParams.set('page', params.page.toString())
    
    // Merge where conditions - in production, only show published trips
    let whereCondition = params?.where || {}
    if (env.NODE_ENV === 'production') {
      whereCondition = {
        ...whereCondition,
        status: { equals: 'published' }
      }
    }
    
    if (Object.keys(whereCondition).length > 0) {
      searchParams.set('where', JSON.stringify(whereCondition))
    }
    if (typeof params?.depth === 'number') searchParams.set('depth', String(params.depth))
    
    // In development mode, always include draft content
    if (env.NODE_ENV === 'development') {
      searchParams.set('draft', 'true')
    }
    
    const query = searchParams.toString()
  const endpoint = `${API_ENDPOINTS.TRIPS}${query ? `?${query}` : ''}`
    
    const fetchOptions = env.NODE_ENV === 'development' ? undefined : { next: { revalidate: 360 } }
    return api.get<PayloadCollection<Trip>>(endpoint, fetchOptions)
  },

  // Get single trip by slug or ID
  getTrip: async (slugOrId: string) => {
    const whereCondition: Record<string, unknown> = {}
    
    // Try to determine if it's an ID (numeric) or slug (string)
    if (/^\d+$/.test(slugOrId)) {
      // It's an ID
      whereCondition.id = { equals: slugOrId }
    } else {
      // It's a slug
      whereCondition.slug = { equals: slugOrId }
    }
    
    // In production, only show published trips
    if (env.NODE_ENV === 'production') {
      whereCondition.status = { equals: 'published' }
    }
    
    const searchParams = new URLSearchParams()
    searchParams.set('where', JSON.stringify(whereCondition))
    searchParams.set('limit', '1')
    
    // In development mode, include draft content
    if (env.NODE_ENV === 'development') {
      searchParams.set('draft', 'true')
    }
    
    const endpoint = `${API_ENDPOINTS.TRIPS}?${searchParams.toString()}`
    console.log('Making API request to:', endpoint)
    // Trip detail pages change less frequently; cache longer by default
    const fetchOptions = env.NODE_ENV === 'development' ? undefined : { next: { revalidate: 3600 } }
    const response = await api.get<{ docs: Trip[] }>(endpoint, fetchOptions)
    return response.docs[0] || null
  },

  // Get all countries
  getCountries: async () => {
    return api.get(API_ENDPOINTS.COUNTRIES)
  },

  // Get country by slug
  getCountry: async (slug: string) => {
    const endpoint = `${API_ENDPOINTS.COUNTRIES}?where[slug][equals]=${slug}&limit=1`
    const response = await api.get<{ docs: Record<string, unknown>[] }>(endpoint)
    return response.docs[0] || null
  },

  // Get media
  getMedia: async (id: string) => {
    return api.get(`${API_ENDPOINTS.MEDIA}/${id}`)
  },
}