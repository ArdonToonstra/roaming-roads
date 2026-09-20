/**
 * Media objects carry a site-relative url (/media/...), so this is now only
 * a null guard plus the object/string shorthand the components rely on.
 */
export function getImageUrl(media: { url?: string | null } | string | null | undefined): string {
  const url = typeof media === 'string' ? media : media?.url
  return url || '/placeholder-trip.jpg'
}
