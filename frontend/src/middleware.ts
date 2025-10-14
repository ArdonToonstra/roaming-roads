import { NextRequest, NextResponse } from 'next/server'

// Add your IP addresses here
const ALLOWED_IPS = [
  '127.0.0.1', // localhost
  '::1', // localhost IPv6
  // Add your public IP here - you can find it at https://whatismyipaddress.com/
  '109.137.111.142', // Replace this with your actual IP
]

export function middleware(request: NextRequest) {
  // Skip IP check in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Get the client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
    request.headers.get('x-real-ip') ||
    request.nextUrl.hostname ||
    '127.0.0.1'

  // Check if IP is allowed
  if (!ALLOWED_IPS.includes(ip)) {
    console.log(`Blocked access from IP: ${ip}`)
    return new NextResponse('Access denied', { status: 403 })
  }

  return NextResponse.next()
}

// Apply to all routes except API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}