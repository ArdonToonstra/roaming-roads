import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date utilities
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

// Format duration (days)
export function formatDuration(days: number) {
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  
  if (weeks === 1 && remainingDays === 0) return '1 week'
  if (remainingDays === 0) return `${weeks} weeks`
  if (weeks === 1) return `1 week, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
  
  return `${weeks} weeks, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
}

// Generate slug from string
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Truncate text
export function truncate(str: string, length: number = 100) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}