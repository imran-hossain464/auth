import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Define protected routes
const protectedRoutes = ["/dashboard", "/profile", "/settings"]
const authRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security Headers
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com; frame-src https://www.google.com;",
  )

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

  // Force HTTPS in production
  if (process.env.NODE_ENV === "production" && !request.nextUrl.protocol.includes("https")) {
    return NextResponse.redirect(`https://${request.nextUrl.host}${request.nextUrl.pathname}`)
  }

  // Get token from cookies
  const accessToken = request.cookies.get("accessToken")?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If accessing protected route without token
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing auth routes with valid token
  if (isAuthRoute && accessToken) {
    try {
      jwt.verify(accessToken, process.env.JWT_SECRET || "your-secret-key")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
      // Token is invalid, allow access to auth routes
    }
  }

  // Verify token for protected routes
  if (isProtectedRoute && accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "your-secret-key")

      // Add user info to headers for API routes
      response.headers.set("x-user-id", (decoded as any).userId)
      response.headers.set("x-user-email", (decoded as any).email)
      response.headers.set("x-user-role", (decoded as any).role)
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
