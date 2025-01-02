// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

// export default clerkMiddleware((auth, request) => {
//   if (!isPublicRoute(request)) {
//     auth().protect()
//   }
// })

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// }
import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple function to check if a route is public
function isPublicRoute(request: NextRequest) {
  const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/api/' // We'll handle more specific API routes in the middleware itself
  ]
  
  return publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
}

export default clerkMiddleware((auth, request: NextRequest) => {
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = ['http://localhost:3001', 'https://onbapparel.vercel.app']
  const isAllowedOrigin = allowedOrigins.includes(origin)
  
  // Check if this is a products endpoint
  const isProductsEndpoint = request.nextUrl.pathname.includes('/products')
  const isCheckoutEndpoint = request.nextUrl.pathname.includes('/checkout')
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0])
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Clerk-Auth-Token')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }
  
  const response = NextResponse.next()
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0])
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Clerk-Auth-Token')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Allow public access to GET requests on products or checkout endpoint
  if (isProductsEndpoint && isCheckoutEndpoint && request.method === 'GET') {
    return response
  }
  
  // Handle authentication for non-public routes
  if (!isPublicRoute(request)) {
    auth().protect()
  }
  
  return response
})

export const config = {
  matcher: [
    '/((?!.*\\.|api\\/|trpc\\/).*)',
    '/(api|trpc)/(.*)'
  ]
}