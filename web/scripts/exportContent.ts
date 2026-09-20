/**
 * ONE-TIME MIGRATION SCRIPT — Payload CMS (Postgres + Vercel Blob) -> static
 * JSON + local images under web/content/ and web/public/images/.
 *
 * Payload itself has already been removed from this codebase (see
 * PI-MIGRATION.md / the git history around this commit for context), so this
 * script carries its own minimal, self-contained collection config rather
 * than importing the deleted src/collections/*.ts files. It talks to
 * Payload's Local API purely to read the still-live production database —
 * it does not depend on anything else in src/.
 *
 * Usage:
 *   1. pnpm add -D payload@3.78.0 @payloadcms/db-postgres@3.78.0 \
 *        @payloadcms/richtext-lexical@3.78.0 @payloadcms/storage-vercel-blob@3.78.0
 *   2. Set DATABASE_URI (Neon connection string) and BLOB_READ_WRITE_TOKEN
 *      (Vercel Blob token) in your environment, or in web/.env.local.
 *   3. pnpm tsx scripts/exportContent.ts
 *   4. Review web/content/ and web/public/images/, commit them.
 *   5. pnpm remove payload @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/storage-vercel-blob
 *      — this script and those packages are not needed again after migration.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig, getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(dirname, '..')
const CONTENT_DIR = path.join(WEB_ROOT, 'content')
const IMAGES_DIR = path.join(WEB_ROOT, 'public', 'images')

// --- Minimal inline collection config (read-only use, mirrors the deleted
// src/collections/*.ts closely enough for the Local API to resolve
// relationships and uploads correctly). ---

const transportFields = {
    name: 'transportation',
    type: 'group' as const,
    fields: [
        { name: 'arrivalMethod', type: 'select' as const, options: ['walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other'] },
        { name: 'departureMethod', type: 'select' as const, options: ['walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other'] },
        { name: 'travelTime', type: 'group' as const, fields: [{ name: 'value', type: 'number' as const }, { name: 'unit', type: 'select' as const, options: ['minutes', 'hours', 'days'] }] },
        { name: 'distance', type: 'group' as const, fields: [{ name: 'value', type: 'number' as const }, { name: 'unit', type: 'select' as const, options: ['km', 'mi'] }] },
        { name: 'transportationNotes', type: 'textarea' as const },
    ],
}

const Users = { slug: 'users', auth: true, fields: [] }

const Media = {
    slug: 'media',
    upload: true,
    fields: [
        { name: 'alt', type: 'text' as const },
        { name: 'caption', type: 'text' as const },
        { name: 'country', type: 'relationship' as const, relationTo: 'countries' as const },
        { name: 'relatedTrip', type: 'relationship' as const, relationTo: 'trips' as const },
    ],
}

const Countries = {
    slug: 'countries',
    fields: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'countryCode', type: 'text' as const, required: true },
        { name: 'continent', type: 'select' as const, options: ['africa', 'antarctica', 'asia', 'europe', 'north_america', 'oceania', 'south_america'] },
        { name: 'capital', type: 'text' as const },
        { name: 'currency', type: 'text' as const },
        { name: 'currencyName', type: 'text' as const },
        { name: 'officialLanguages', type: 'array' as const, fields: [{ name: 'language', type: 'text' as const }] },
        { name: 'mainReligion', type: 'select' as const, options: ['christianity', 'catholicism', 'islam', 'judaism', 'hinduism', 'buddhism', 'sikhism', 'secular', 'mixed', 'other'] },
        { name: 'mainReligionPercentage', type: 'number' as const },
        { name: 'visaRequirements', type: 'richText' as const },
        { name: 'safetyLevel', type: 'select' as const, options: ['very_safe', 'safe', 'moderate', 'caution', 'high_risk'] },
        { name: 'bestTimeToVisit', type: 'select' as const, hasMany: true, options: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] },
        { name: 'travelTimeFromBrussels', type: 'number' as const },
    ],
}

const Accommodations = {
    slug: 'accommodations',
    fields: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'type', type: 'select' as const, options: ['hotel', 'hostel', 'camping', 'guesthouse', 'resort', 'apartment', 'yurt', 'wild_camping', 'homestay', 'ecolodge', 'other'] },
        { name: 'description', type: 'richText' as const },
        { name: 'country', type: 'relationship' as const, relationTo: 'countries' as const },
        { name: 'website', type: 'text' as const },
        { name: 'media', type: 'upload' as const, relationTo: 'media' as const, hasMany: true },
    ],
}

const FullDay = {
    slug: 'fullDay',
    fields: [
        { name: 'time', type: 'text' as const },
        { name: 'locationName', type: 'text' as const, required: true },
        { name: 'location', type: 'point' as const },
        { name: 'description', type: 'textarea' as const },
        { name: 'activities', type: 'richText' as const },
        { name: 'accommodation', type: 'relationship' as const, relationTo: 'accommodations' as const },
        transportFields,
        { name: 'gallery', type: 'array' as const, fields: [{ name: 'media', type: 'upload' as const, relationTo: 'media' as const, required: true }] },
    ],
}

const Waypoint = {
    slug: 'waypoint',
    fields: [
        { name: 'locationName', type: 'text' as const, required: true },
        { name: 'description', type: 'textarea' as const },
        { name: 'activities', type: 'richText' as const },
        { name: 'location', type: 'point' as const },
        { name: 'connectionType', type: 'select' as const, options: ['route', 'side_trip'] },
        transportFields,
        { name: 'gallery', type: 'array' as const, fields: [{ name: 'media', type: 'upload' as const, relationTo: 'media' as const, required: true }, { name: 'caption', type: 'text' as const }] },
    ],
}

const Point = {
    slug: 'point',
    fields: [
        { name: 'locationName', type: 'text' as const, required: true },
        { name: 'description', type: 'textarea' as const },
        { name: 'location', type: 'point' as const },
        { name: 'pointType', type: 'select' as const, options: ['intermediate', 'start', 'end'] },
        transportFields,
    ],
}

const Trips = {
    slug: 'trips',
    fields: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'slug', type: 'text' as const, required: true },
        { name: 'status', type: 'select' as const, options: ['draft', 'coming_soon', 'published'] },
        { name: 'category', type: 'select' as const, hasMany: true, options: ['city_trip', 'road_trip', 'backpacking', 'hiking', 'base_camp', 'diving', 'wintersport', 'culinary'] },
        { name: 'coverImage', type: 'upload' as const, relationTo: 'media' as const, required: true },
        { name: 'highlightsMedia', type: 'array' as const, fields: [{ name: 'media', type: 'upload' as const, relationTo: 'media' as const, required: true }] },
        {
            type: 'tabs' as const,
            tabs: [
                {
                    label: 'General Details',
                    fields: [
                        { name: 'description', type: 'textarea' as const },
                        { name: 'countries', type: 'relationship' as const, relationTo: 'countries' as const, hasMany: true },
                        { name: 'period', type: 'text' as const },
                        { name: 'budget', type: 'group' as const, fields: [{ name: 'amount', type: 'number' as const }, { name: 'currency', type: 'text' as const }, { name: 'perPerson', type: 'checkbox' as const }] },
                        { name: 'activities', type: 'richText' as const },
                        { name: 'featuredAccommodations', type: 'array' as const, fields: [{ name: 'accommodation', type: 'relationship' as const, relationTo: 'accommodations' as const, required: true }] },
                        { name: 'importantPreparations', type: 'richText' as const },
                    ],
                },
            ],
        },
        { name: 'itinerary', type: 'blocks' as const, blocks: [FullDay, Waypoint, Point] },
    ],
}

const config = buildConfig({
    admin: { user: Users.slug },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collections: [Users, Media, Trips, Countries, Accommodations] as any,
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || 'export-script-does-not-need-a-real-secret',
    db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' } }),
    plugins: [
        vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN || '',
        }),
    ],
})

// --- Lexical JSON -> Markdown ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lexicalTextToMarkdown(node: any): string {
    if (node.type === 'linebreak') return '\n'
    if (node.type === 'link') {
        const href = node.fields?.url || node.url || '#'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = (node.children || []).map((c: any) => lexicalTextToMarkdown(c)).join('')
        return `[${text}](${href})`
    }
    if (typeof node.text === 'string') {
        let text = node.text
        const format = node.format || 0
        if (format & 1) text = `**${text}**` // bold
        if (format & 2) text = `_${text}_` // italic
        return text
    }
    return ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lexicalToMarkdown(content: any): string {
    if (!content) return ''
    if (typeof content === 'string') return content

    const rootChildren = content.root?.children
    if (!Array.isArray(rootChildren)) return ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function renderList(node: any, ordered: boolean, depth: number): string {
        const indent = '  '.repeat(depth)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (node.children || [])
            .map((item: any, i: number) => {
                const nested = (item.children || []).filter((c: any) => c.type === 'list')
                const inline = (item.children || []).filter((c: any) => c.type !== 'list')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const text = inline.map((c: any) => lexicalTextToMarkdown(c)).join('')
                const marker = ordered ? `${i + 1}.` : '-'
                const nestedText = nested.map((n: any) => renderList(n, n.tag === 'ol' || n.listType === 'number', depth + 1)).join('')
                return `${indent}${marker} ${text}\n${nestedText}`
            })
            .join('')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines = rootChildren.map((node: any) => {
        if (node.type === 'paragraph') {
            return (node.children || []).map(lexicalTextToMarkdown).join('') + '\n'
        }
        if (typeof node.type === 'string' && /^h[1-6]$/.test(node.type)) {
            const level = Number(node.type[1])
            return `${'#'.repeat(level)} ${(node.children || []).map(lexicalTextToMarkdown).join('')}\n`
        }
        if (node.type === 'list') {
            return renderList(node, node.listType === 'number' || node.tag === 'ol', 0)
        }
        return ''
    })

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

// --- Media download ---

function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const downloadedUrls = new Map<string, string>()

async function downloadMedia(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: any,
    destSubdir: string
): Promise<{ url: string; alt?: string; caption?: string; width?: number; height?: number } | null> {
    if (!media || typeof media !== 'object' || !media.url) return null

    const sourceUrl: string = media.url
    const cacheKey = `${destSubdir}:${sourceUrl}`
    let localUrl = downloadedUrls.get(cacheKey)

    if (!localUrl) {
        const filename = media.filename || path.basename(new URL(sourceUrl).pathname)
        const destDir = path.join(IMAGES_DIR, destSubdir)
        fs.mkdirSync(destDir, { recursive: true })
        const destPath = path.join(destDir, filename)

        console.log(`  downloading ${sourceUrl} -> public/images/${destSubdir}/${filename}`)
        const res = await fetch(sourceUrl)
        if (!res.ok) {
            console.warn(`  ! failed to download ${sourceUrl}: ${res.status}`)
            return null
        }
        const buffer = Buffer.from(await res.arrayBuffer())
        fs.writeFileSync(destPath, buffer)

        localUrl = `/images/${destSubdir}/${filename}`
        downloadedUrls.set(cacheKey, localUrl)
    }

    return {
        url: localUrl,
        alt: media.alt || undefined,
        caption: media.caption || undefined,
        width: media.width || undefined,
        height: media.height || undefined,
    }
}

// --- Main ---

async function main() {
    const payload = await getPayload({ config })

    fs.mkdirSync(path.join(CONTENT_DIR, 'trips'), { recursive: true })

    console.log('Fetching countries...')
    const countriesResult = await payload.find({ collection: 'countries', limit: 1000, pagination: false })
    const countries = countriesResult.docs.map((c) => ({
        id: (c.countryCode as string) || slugify(c.name as string),
        name: c.name,
        countryCode: c.countryCode,
        continent: c.continent,
        capital: c.capital,
        currency: c.currency,
        currencyName: c.currencyName,
        officialLanguages: (c.officialLanguages as { language: string }[] | undefined)?.map((l) => l.language),
        mainReligion: c.mainReligion,
        mainReligionPercentage: c.mainReligionPercentage,
        visaRequirements: lexicalToMarkdown(c.visaRequirements) || undefined,
        safetyLevel: c.safetyLevel,
        bestTimeToVisit: c.bestTimeToVisit,
        travelTimeFromBrussels: c.travelTimeFromBrussels,
    }))
    fs.writeFileSync(path.join(CONTENT_DIR, 'countries.json'), JSON.stringify(countries, null, 2))
    console.log(`  wrote ${countries.length} countries`)

    console.log('Fetching accommodations...')
    const accommodationsResult = await payload.find({ collection: 'accommodations', limit: 1000, pagination: false, depth: 1 })
    const usedSlugs = new Set<string>()
    const accommodations = []
    for (const a of accommodationsResult.docs) {
        let slug = slugify(a.name as string)
        while (usedSlugs.has(slug)) slug = `${slug}-2`
        usedSlugs.add(slug)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mediaList = Array.isArray(a.media) ? (a.media as any[]) : []
        const media = (
            await Promise.all(mediaList.map((m) => downloadMedia(m, `accommodations/${slug}`)))
        ).filter((m): m is NonNullable<typeof m> => Boolean(m))

        accommodations.push({
            id: slug,
            name: a.name,
            type: a.type,
            description: lexicalToMarkdown(a.description) || undefined,
            country: typeof a.country === 'object' && a.country ? (a.country as { countryCode: string }).countryCode : undefined,
            website: a.website || undefined,
            media: media.length > 0 ? media : undefined,
        })
    }
    fs.writeFileSync(path.join(CONTENT_DIR, 'accommodations.json'), JSON.stringify(accommodations, null, 2))
    console.log(`  wrote ${accommodations.length} accommodations`)

    console.log('Fetching trips...')
    const tripsResult = await payload.find({ collection: 'trips', limit: 1000, pagination: false, depth: 2, draft: true })
    console.log(`  found ${tripsResult.docs.length} trips`)

    for (const t of tripsResult.docs) {
        const slug = t.slug as string
        console.log(`Trip: ${slug}`)

        const coverImage = await downloadMedia(t.coverImage, `trips/${slug}`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const highlightsMedia = (
            await Promise.all(
                ((t.highlightsMedia as { media: unknown }[] | undefined) || []).map((h) => downloadMedia(h.media, `trips/${slug}`))
            )
        ).filter((m): m is NonNullable<typeof m> => Boolean(m))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countryIds = ((t.countries as any[]) || [])
            .map((c) => (typeof c === 'object' ? c.countryCode : null))
            .filter(Boolean)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const featuredAccommodationIds = ((t.featuredAccommodations as any[]) || [])
            .map((f) => (typeof f.accommodation === 'object' ? slugify(f.accommodation.name) : null))
            .filter(Boolean)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itinerary = await Promise.all(
            ((t.itinerary as any[]) || []).map(async (block, idx) => {
                const destSubdir = `trips/${slug}`
                const base = {
                    blockType: block.blockType,
                    locationName: block.locationName,
                    description: block.description || undefined,
                    location: block.location
                        ? { type: 'Point', coordinates: block.location.coordinates || block.location }
                        : undefined,
                    transportation: block.transportation,
                }

                if (block.blockType === 'fullDay') {
                    const gallery = (
                        await Promise.all((block.gallery || []).map((g: { media: unknown }) => downloadMedia(g.media, destSubdir)))
                    ).filter((m): m is NonNullable<typeof m> => Boolean(m))
                    return {
                        ...base,
                        time: block.time || undefined,
                        activities: lexicalToMarkdown(block.activities) || undefined,
                        accommodation: typeof block.accommodation === 'object' && block.accommodation ? slugify(block.accommodation.name) : undefined,
                        gallery,
                    }
                }

                if (block.blockType === 'waypoint') {
                    const gallery = (
                        await Promise.all(
                            (block.gallery || []).map(async (g: { media: unknown; caption?: string }) => {
                                const m = await downloadMedia(g.media, destSubdir)
                                return m ? { ...m, caption: g.caption || m.caption } : null
                            })
                        )
                    ).filter((m): m is NonNullable<typeof m> => Boolean(m))
                    return {
                        ...base,
                        activities: lexicalToMarkdown(block.activities) || undefined,
                        connectionType: block.connectionType || undefined,
                        gallery,
                    }
                }

                // point
                console.log(`  block ${idx}: point`)
                return { ...base, pointType: block.pointType || undefined }
            })
        )

        const trip = {
            id: t.id,
            title: t.title,
            slug,
            status: t.status,
            category: t.category || undefined,
            coverImage,
            highlightsMedia: highlightsMedia.length > 0 ? highlightsMedia : undefined,
            description: t.description || undefined,
            countries: countryIds,
            period: t.period || undefined,
            budget: t.budget || undefined,
            activities: lexicalToMarkdown(t.activities) || undefined,
            featuredAccommodations: featuredAccommodationIds.length > 0 ? featuredAccommodationIds : undefined,
            importantPreparations: lexicalToMarkdown(t.importantPreparations) || undefined,
            itinerary,
            createdAt: t.createdAt,
        }

        fs.writeFileSync(path.join(CONTENT_DIR, 'trips', `${slug}.json`), JSON.stringify(trip, null, 2))
    }

    console.log('\nDone. Review web/content/ and web/public/images/, then commit them.')
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
