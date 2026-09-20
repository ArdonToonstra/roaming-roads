import fs from 'fs'
import path from 'path'
import type { Trip, Country, Accommodation, ItineraryBlock, FullDayBlock } from '@/types/content'

/**
 * Server-only content loader. Reads trips/countries/accommodations from
 * static JSON files under web/content/ instead of a database — content is
 * edited via git.
 *
 * Countries and accommodations are stored once, canonically, in
 * content/countries.json and content/accommodations.json. Trip files
 * reference them by id (a country code / accommodation slug) instead of
 * embedding a full copy, so editing e.g. a country's visa info doesn't mean
 * touching every trip that visited it. This loader resolves those
 * references into fully-populated objects, so components keep working with
 * the same embedded shapes they always have.
 */
const CONTENT_DIR = path.join(process.cwd(), 'content')
const TRIPS_DIR = path.join(CONTENT_DIR, 'trips')

const IS_PROD = process.env.NODE_ENV === 'production'

// On-disk trip shape: countries/accommodations are referenced by id rather
// than embedded, everything else matches the resolved `Trip` type.
type RawTrip = Omit<Trip, 'countries' | 'featuredAccommodations' | 'itinerary'> & {
    countries: string[]
    featuredAccommodations?: string[]
    itinerary: RawItineraryBlock[]
}
type RawItineraryBlock = Omit<FullDayBlock, 'accommodation'> & { accommodation?: string } | Exclude<ItineraryBlock, FullDayBlock>

let cachedTrips: Trip[] | null = null
let cachedCountries: Country[] | null = null
let cachedAccommodations: Accommodation[] | null = null

function readJsonFile<T>(filePath: string, fallback: T): T {
    if (!fs.existsSync(filePath)) return fallback
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function loadAllCountries(): Country[] {
    if (cachedCountries) return cachedCountries
    cachedCountries = readJsonFile<Country[]>(path.join(CONTENT_DIR, 'countries.json'), [])
    return cachedCountries
}

function loadAllAccommodations(): Accommodation[] {
    if (cachedAccommodations) return cachedAccommodations
    cachedAccommodations = readJsonFile<Accommodation[]>(path.join(CONTENT_DIR, 'accommodations.json'), [])
    return cachedAccommodations
}

function resolveTrip(raw: RawTrip, countriesById: Map<string, Country>, accommodationsById: Map<string, Accommodation>): Trip {
    const resolveAccommodation = (id: string | undefined) => (id ? accommodationsById.get(id) : undefined)

    return {
        ...raw,
        countries: raw.countries.map((id) => countriesById.get(id)).filter((c): c is Country => Boolean(c)),
        featuredAccommodations: raw.featuredAccommodations?.map(resolveAccommodation).filter((a): a is Accommodation => Boolean(a)),
        itinerary: raw.itinerary.map((block) =>
            block.blockType === 'fullDay'
                ? { ...block, accommodation: resolveAccommodation(block.accommodation) }
                : block
        ) as ItineraryBlock[],
    }
}

function loadAllTrips(): Trip[] {
    if (cachedTrips) return cachedTrips

    if (!fs.existsSync(TRIPS_DIR)) {
        cachedTrips = []
        return cachedTrips
    }

    const countriesById = new Map(loadAllCountries().map((c) => [c.id, c]))
    const accommodationsById = new Map(loadAllAccommodations().map((a) => [a.id, a]))

    const files = fs.readdirSync(TRIPS_DIR).filter((f) => f.endsWith('.json'))
    const trips = files.map((file) => {
        const raw = readJsonFile<RawTrip>(path.join(TRIPS_DIR, file), null as unknown as RawTrip)
        return resolveTrip(raw, countriesById, accommodationsById)
    })

    trips.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    cachedTrips = trips
    return trips
}

export interface TripCollection {
    docs: Trip[]
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export const data = {
    // -------------------------------------------------------------------------
    // Get all trips
    // -------------------------------------------------------------------------
    getTrips: async (options: { limit?: number; page?: number } = {}): Promise<TripCollection> => {
        const limit = options.limit || 10
        const page = options.page || 1

        let trips = loadAllTrips()
        if (IS_PROD) {
            trips = trips.filter((t) => t.status === 'published' || t.status === 'coming_soon')
        }

        const totalDocs = trips.length
        const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
        const start = (page - 1) * limit
        const docs = trips.slice(start, start + limit)

        return {
            docs,
            totalDocs,
            limit,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        }
    },

    // -------------------------------------------------------------------------
    // Get single trip by slug (or id, as a fallback)
    // -------------------------------------------------------------------------
    getTrip: async (slug: string): Promise<Trip | null> => {
        const trips = loadAllTrips()
        const trip = trips.find((t) => t.slug === slug) || trips.find((t) => t.id === slug)

        if (!trip) return null
        if (IS_PROD && trip.status !== 'published') return null

        return trip
    },

    // -------------------------------------------------------------------------
    // Get all countries
    // -------------------------------------------------------------------------
    getCountries: async (): Promise<Country[]> => {
        return loadAllCountries()
    },

    // -------------------------------------------------------------------------
    // Get every slug that should be statically generated (for generateStaticParams)
    // -------------------------------------------------------------------------
    getAllTripSlugs: (): string[] => {
        let trips = loadAllTrips()
        if (IS_PROD) {
            trips = trips.filter((t) => t.status === 'published' || t.status === 'coming_soon')
        }
        return trips.map((t) => t.slug)
    },
}
