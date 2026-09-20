/**
 * Image URLs now point at static files under web/public/images/, so no CMS
 * base URL resolution is needed — this just normalizes the handful of shapes
 * callers pass in (a MediaItem object, a bare path string, or nothing).
 */
export function resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '/placeholder-trip.jpg'
    return url
}

export function getImageUrl(media: { url: string } | string | null | undefined): string {
    if (!media) return '/placeholder-trip.jpg'

    if (typeof media === 'object' && media.url) {
        return resolveImageUrl(media.url)
    }

    if (typeof media === 'string') {
        return resolveImageUrl(media)
    }

    return '/placeholder-trip.jpg'
}
