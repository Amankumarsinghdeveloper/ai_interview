import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    "/",
    "/tos",
    "/privacy-policy",
    "/contact",
    "/sign-in",
    "/sign-up",
    "/api/payments/cashfree/webhook",
  ];
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath);

  // Skip authentication for static files and public paths
  if (
    isPublicPath ||
    path.startsWith("/images/") ||
    path.startsWith("/public/") ||
    path.startsWith("/logo.svg") ||
    path.startsWith("/robot.png") ||
    path.startsWith("/empty.png") ||
    path.startsWith("/google.svg")
  ) {
    return NextResponse.next();
  }

  // For all other paths, check authentication using cookies
  const authCookie = request.cookies.get("session");

  // If no session cookie exists, redirect to sign-in
  if (!authCookie?.value) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If authenticated, allow access to protected routes
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - images (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|images).*)",
  ],
};
