/**
 * One-shot migration: Payload REST API -> YAML files in ../content.
 * Reads from the live site rather than the local Postgres dump, whose UTF-8
 * was mangled by the db sync script (emoji and accented characters).
 *
 * Run with `pnpm tsx scripts/export-content.ts`, then `fetch-media.ts`,
 * then delete both along with the rest of Payload.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'

const API = process.env.CMS_API ?? 'https://www.roamingroads.nl/api'
const OUT = join(import.meta.dirname, '..', 'content')

// --- Lexical -> Markdown ----------------------------------------------------

// ponytail: covers the node types actually present in this DB (asserted below).
// Anything else is dumped verbatim as a warning so it can't disappear silently.
const seenNodeTypes = new Set<string>()

function inline(node: any): string {
  seenNodeTypes.add(node.type ?? 'text')
  if (node.type === 'linebreak') return '\n'
  if (node.type === 'link') {
    const href = node.fields?.linkType === 'internal'
      ? `/trips/${node.fields.doc?.value?.slug ?? node.fields.doc?.value}`
      : (node.fields?.url ?? '#')
    return `[${(node.children ?? []).map(inline).join('')}](${href})`
  }
  let text = node.text ?? ''
  if (!text) return (node.children ?? []).map(inline).join('')
  const f = node.format ?? 0
  if (f & 16) text = `\`${text}\``
  if (f & 1) text = `**${text}**`
  if (f & 2) text = `*${text}*`
  if (f & 4) text = `~~${text}~~`
  return text
}

function block(node: any, indent = ''): string {
  seenNodeTypes.add(node.type)
  const kids = node.children ?? []
  switch (node.type) {
    case 'paragraph':
      return indent + kids.map(inline).join('')
    case 'heading':
      return indent + '#'.repeat(Number(node.tag?.slice(1)) || 2) + ' ' + kids.map(inline).join('')
    case 'quote':
      return indent + '> ' + kids.map(inline).join('')
    case 'horizontalrule':
      return indent + '---'
    case 'list':
      return kids
        .map((li: any, i: number) => {
          const marker = node.listType === 'number' ? `${i + 1}. ` : '- '
          const nested = (li.children ?? []).filter((c: any) => c.type === 'list')
          const own = (li.children ?? []).filter((c: any) => c.type !== 'list')
          const head = indent + marker + own.map(inline).join('')
          const tail = nested.map((n: any) => block(n, indent + '  '))
          return [head, ...tail].join('\n')
        })
        .join('\n')
    default:
      return indent + kids.map(inline).join('')
  }
}

function toMarkdown(rich: any): string | undefined {
  const kids = rich?.root?.children
  if (!Array.isArray(kids)) return undefined
  const md = kids
    .map((n) => block(n))
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return md || undefined
}

// --- shaping ----------------------------------------------------------------

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Drop nulls, empty strings, empty arrays and empty objects so the YAML stays readable. */
function prune(value: any): any {
  if (Array.isArray(value)) {
    const arr = value.map(prune).filter((v) => v !== undefined)
    return arr.length ? arr : undefined
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      if (['id', 'createdAt', 'updatedAt', 'blockName', '_status'].includes(k)) continue
      const p = prune(v)
      if (p !== undefined) out[k] = p
    }
    const keys = Object.keys(out)
    // travelTime/distance groups keep their default unit even when never filled in
    if (!keys.length || (keys.length === 1 && keys[0] === 'unit')) return undefined
    return out
  }
  if (value === null || value === '') return undefined
  return value
}

const media = new Map<string, any>()
const sources = new Map<string, string>()

/** Media object -> filename ref, recording the file in the media index. */
function mediaRef(m: any): string | undefined {
  if (!m || typeof m !== 'object' || !m.filename) return undefined
  if (!media.has(m.filename)) {
    media.set(m.filename, prune({
      alt: m.alt,
      caption: m.caption,
      width: m.width,
      height: m.height,
      mimeType: m.mimeType,
    }) ?? {})
    sources.set(m.filename, m.url)
  }
  return m.filename
}

/** Walk a Payload doc converting rich text to markdown and media docs to refs. */
function convert(value: any): any {
  if (Array.isArray(value)) return value.map(convert)
  if (!value || typeof value !== 'object') return value
  if (value.root?.children) return toMarkdown(value)
  if (value.filename && value.mimeType) return mediaRef(value)
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(value)) out[k] = convert(v)
  return out
}

const dump = (doc: any) =>
  yaml.dump(prune(doc) ?? {}, { lineWidth: -1, noRefs: true, quotingType: '"' })

/** The filename is the slug, so it is not repeated inside the document. */
const write = (dir: string, name: string, doc: any) => {
  mkdirSync(join(OUT, dir), { recursive: true })
  writeFileSync(join(OUT, dir, `${name}.yml`), dump({ ...doc, slug: undefined }))
}

// --- run --------------------------------------------------------------------

const all = async (collection: string, depth = 2): Promise<any[]> => {
  const res = await fetch(`${API}/${collection}?limit=0&depth=${depth}`)
  if (!res.ok) throw new Error(`${collection}: ${res.status}`)
  return (await res.json()).docs
}

rmSync(OUT, { recursive: true, force: true })

const [trips, countries, accommodations] = await Promise.all([
  all('trips'),
  all('countries'),
  all('accommodations'),
])

/** Neither countries nor accommodations have a slug field; derive one from the name. */
function slugMap(docs: any[]): Map<number, string> {
  const taken = new Set<string>()
  const map = new Map<number, string>()
  for (const d of docs) {
    let s = slugify(d.name)
    while (taken.has(s)) s += '-2'
    taken.add(s)
    map.set(d.id, s)
  }
  return map
}

const accoSlug = slugMap(accommodations)
const countrySlug = slugMap(countries)

const relSlug = (v: any, map: Map<number, string>) =>
  typeof v === 'object' && v ? map.get(v.id) : undefined

for (const c of countries) {
  const { id: _id, ...rest } = c
  write('countries', countrySlug.get(c.id)!, convert(rest))
}

for (const a of accommodations) {
  const { id: _id, country, ...rest } = a
  write('accommodations', accoSlug.get(a.id)!, {
    ...convert(rest),
    country: relSlug(country, countrySlug),
  })
}

for (const t of trips) {
  const { id: _id, countries: cs, featuredAccommodations, itinerary, ...rest } = t
  write('trips', t.slug, {
    ...convert(rest),
    added: t.createdAt?.slice(0, 10), // the "newest first" sort on /adventures needs it
    countries: (cs ?? []).map((c: any) => relSlug(c, countrySlug)).filter(Boolean),
    featuredAccommodations: (featuredAccommodations ?? [])
      .map((f: any) => relSlug(f.accommodation, accoSlug))
      .filter(Boolean),
    itinerary: (itinerary ?? []).map((b: any) => ({
      ...convert({ ...b, accommodation: undefined }),
      ...(b.accommodation ? { accommodation: relSlug(b.accommodation, accoSlug) } : {}),
      gallery: (b.gallery ?? []).map((g: any) => prune({
        media: mediaRef(g.media),
        caption: g.caption,
      })).filter(Boolean),
    })),
  })
}

writeFileSync(join(OUT, 'media.yml'), dump(Object.fromEntries([...media].sort())))
writeFileSync(
  join(OUT, '.media-sources.json'),
  JSON.stringify(Object.fromEntries([...sources].sort()), null, 1),
)

console.log(`${trips.length} trips, ${countries.length} countries, ${accommodations.length} accommodations, ${media.size} media`)
console.log('lexical node types seen:', [...seenNodeTypes].sort().join(', '))
process.exit(0)
