import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'
import type { Trip, Country, Accommodation, MediaItem } from '@/types/content'

/**
 * Server-only content loading. The site's source of truth is the YAML in
 * ../content (produced by scripts/export-content.ts); the slug of every
 * document is its filename.
 */
const CONTENT = join(process.cwd(), 'content')

const IS_PROD = process.env.NODE_ENV === 'production'

// Mirrors scripts/fetch-media.ts — uploads are re-encoded to webp in public/media.
const mediaPath = (filename: string) =>
  '/media/' +
  (/\.(jpe?g|png|webp|avif|tiff?|gif)$/i.test(filename)
    ? filename.replace(/\.[^.]+$/, '') + '.webp'
    : filename)

const read = <T,>(path: string): T => yaml.load(readFileSync(path, 'utf8')) as T

function loadDir<T>(dir: string): Map<string, T & { id: string; slug: string }> {
  return new Map(
    readdirSync(join(CONTENT, dir))
      .filter((f) => f.endsWith('.yml'))
      .map((f) => {
        const slug = f.slice(0, -4)
        return [slug, { ...read<T>(join(CONTENT, dir, f)), id: slug, slug }] as const
      }),
  )
}

type MediaMeta = { alt?: string; caption?: string; width?: number; height?: number }
const mediaMeta = read<Record<string, MediaMeta>>(join(CONTENT, 'media.yml'))

/** Media are referenced by the uploaded filename; resolve one to the embedded shape components render. */
function media(filename: string | undefined, caption?: string): MediaItem | undefined {
  if (!filename) return undefined
  const meta = mediaMeta[filename]
  return { url: mediaPath(filename), alt: meta?.alt, caption: caption ?? meta?.caption, width: meta?.width, height: meta?.height }
}

const mediaList = (refs: { media: string; caption?: string }[] | undefined): MediaItem[] =>
  (refs ?? []).map((r) => media(r.media, r.caption)).filter((m): m is MediaItem => Boolean(m))

const countries = loadDir<Omit<Country, 'id' | 'slug'>>('countries')
const accommodations = new Map(
  [...loadDir<Omit<Accommodation, 'id' | 'slug' | 'country'> & { country?: string }>('accommodations')].map(
    ([slug, a]) => [slug, { ...a, country: a.country ? countries.get(a.country) : undefined } as Accommodation],
  ),
)

/** YAML stores relations as slugs and media as filenames; resolve both into the shapes components render. */
function hydrateBlock(block: any) {
  return {
    ...block,
    gallery: mediaList(block.gallery),
    accommodation: block.accommodation ? accommodations.get(block.accommodation) : undefined,
  }
}

function hydrateTrip(raw: any, slug: string): Trip {
  return {
    ...raw,
    id: slug,
    slug,
    coverImage: media(raw.coverImage) as MediaItem,
    highlightsMedia: mediaList(raw.highlightsMedia),
    countries: (raw.countries ?? []).map((c: string) => countries.get(c)).filter(Boolean),
    featuredAccommodations: (raw.featuredAccommodations ?? [])
      .map((a: string) => accommodations.get(a))
      .filter(Boolean),
    itinerary: (raw.itinerary ?? []).map(hydrateBlock),
  }
}

const trips = new Map(
  readdirSync(join(CONTENT, 'trips'))
    .filter((f) => f.endsWith('.yml'))
    .map((f) => {
      const slug = f.slice(0, -4)
      return [slug, hydrateTrip(read<any>(join(CONTENT, 'trips', f)), slug)] as const
    }),
)

/** Drafts are visible while developing, never in a production build. */
const visible = (t: Trip) => !IS_PROD || t.status === 'published' || t.status === 'coming_soon'

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
  getTrips: async (options: { limit?: number; page?: number } = {}): Promise<TripCollection> => {
    const docs = [...trips.values()].filter(visible)
    const limit = options.limit || 10
    const page = options.page || 1
    const totalPages = Math.max(1, Math.ceil(docs.length / limit))
    const start = (page - 1) * limit

    return {
      docs: docs.slice(start, start + limit),
      totalDocs: docs.length,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  },

  getTrip: async (slug: string): Promise<Trip | null> => {
    const trip = trips.get(slug)
    if (!trip) return null
    return IS_PROD && trip.status !== 'published' ? null : trip
  },

  getCountries: async (): Promise<Country[]> => [...countries.values()],

  /** Slugs of the trips that get their own page in a production build. */
  getTripSlugs: async (): Promise<string[]> => [...trips.values()].filter(visible).map((t) => t.slug),
}
