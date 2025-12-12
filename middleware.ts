import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Get the JWT token directly (doesn't need Prisma)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  // Skip middleware for static files and API routes
  if (
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon") ||
    nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Handle /login page - redirect logged-in users to appropriate dashboard
  if (nextUrl.pathname === "/login") {
    if (isLoggedIn) {
      if (userRole === "SUPERADMIN") {
        return NextResponse.redirect(new URL("/superadmin", nextUrl));
      } else if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      } else {
        return NextResponse.redirect(new URL("/", nextUrl));
      }
    }
    return NextResponse.next();
  }

  // Protect admin routes - redirect to login if not authenticated or not admin
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect superadmin routes - redirect to login if not authenticated or not superadmin
  if (nextUrl.pathname.startsWith("/superadmin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Handle homepage "/" - redirect admins to their dashboards
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      if (userRole === "SUPERADMIN") {
        return NextResponse.redirect(new URL("/superadmin", nextUrl));
      } else if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    }
  }

  // All other routes - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

