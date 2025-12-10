import { auth } from "@/app/utils/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Allow public routes
  if (
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon")
  ) {
    return;
  }

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "admin" && userRole !== "superadmin") {
      return Response.redirect(new URL("/", nextUrl));
    }
  }

  // Protect superadmin routes
  if (nextUrl.pathname.startsWith("/superadmin")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "superadmin") {
      return Response.redirect(new URL("/", nextUrl));
    }
  }

  // Protect authenticated routes
  if (
    nextUrl.pathname.startsWith("/saved-cars") ||
    nextUrl.pathname.startsWith("/reservations") ||
    nextUrl.pathname.startsWith("/profile")
  ) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
