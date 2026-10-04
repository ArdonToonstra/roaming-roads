/**
 * One-shot migration: pull every referenced upload out of Vercel Blob and
 * downsample it into public/media, which is what the static site serves.
 *
 * Originals land in media-originals/ (gitignored) — keep a backup of that
 * folder somewhere, it is the only copy once the CMS is gone.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = join(import.meta.dirname, '..')
const ORIGINALS = join(ROOT, 'media-originals')
const OUT = join(ROOT, 'public', 'media')

// ponytail: one size for everyone. A home Pi's upstream is the bottleneck,
// not the pixels; add srcset here if that ever stops being true.
const MAX_WIDTH = 1400
const QUALITY = 72

const sources: Record<string, string> = JSON.parse(
  readFileSync(join(ROOT, 'content', '.media-sources.json'), 'utf8'),
)

mkdirSync(ORIGINALS, { recursive: true })
mkdirSync(OUT, { recursive: true })

export const outputName = (filename: string) =>
  /\.(jpe?g|png|webp|avif|tiff?|gif)$/i.test(filename)
    ? filename.replace(/\.[^.]+$/, '') + '.webp'
    : filename

// Two uploads whose names differ only by extension would collide on .webp.
const byOutput = new Map<string, string>()
for (const name of Object.keys(sources)) {
  const out = outputName(name)
  if (byOutput.has(out)) throw new Error(`name collision: ${name} and ${byOutput.get(out)} -> ${out}`)
  byOutput.set(out, name)
}

async function one(filename: string, url: string) {
  const original = join(ORIGINALS, filename)
  if (!existsSync(original)) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${filename}: ${res.status}`)
    writeFileSync(original, Buffer.from(await res.arrayBuffer()))
  }

  const out = join(OUT, outputName(filename))
  if (existsSync(out)) return
  if (outputName(filename) === filename) {
    writeFileSync(out, readFileSync(original)) // video/audio, passed through
    return
  }
  await sharp(original)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out)
}

const entries = Object.entries(sources)
let done = 0
const failures: string[] = []

// ponytail: fixed pool of 8, plenty for 500 files over one connection.
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let entry = entries.pop(); entry; entry = entries.pop()) {
      try {
        await one(...entry)
      } catch (e) {
        failures.push(`${entry[0]}: ${(e as Error).message}`)
      }
      if (++done % 50 === 0) console.log(`${done}/${byOutput.size}`)
    }
  }),
)

console.log(`${done - failures.length}/${byOutput.size} media written to public/media`)
if (failures.length) {
  console.error(`${failures.length} failed:`)
  failures.forEach((f) => console.error('  ' + f))
  process.exit(1)
}
