/** @type {import('next').NextConfig} */
export default {
  // Plain HTML/CSS/JS in out/ — no Node server to run on the Pi.
  output: 'export',
  // Static export has no image optimizer; scripts/fetch-media.ts already
  // resized everything into public/media.
  images: { unoptimized: true },
  // Emit /trips/foo/index.html so any web server resolves it without rewrites.
  trailingSlash: true,
}
