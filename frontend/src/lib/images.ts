import { env } from './config';

/**
 * Resolves image URLs to absolute URLs from the CMS
 * Handles both relative URLs from Payload CMS and already absolute URLs
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-trip.jpg';
  }

  // If it's already an absolute URL (starts with http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative URL, prepend the CMS base URL
  // Remove leading slash if present to avoid double slashes
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  return `${env.CMS_URL}/${cleanUrl}`;
}

/**
 * Helper function to extract and resolve image URL from Payload Media object
 */
export function getImageUrl(media: any): string {
  if (!media) {
    return '/placeholder-trip.jpg';
  }

  // Handle Media object with url property
  if (typeof media === 'object' && media.url) {
    return resolveImageUrl(media.url);
  }

  // Handle direct string URL
  if (typeof media === 'string') {
    return resolveImageUrl(media);
  }

  return '/placeholder-trip.jpg';
}