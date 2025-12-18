import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { detectBot, checkRequestPatterns, checkRateLimit } from "@/lib/security/bot-detector";
import { applySecurityHeaders, checkIPReputation, recordIPViolation } from "@/lib/security/shield-protection";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Get IP address
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || 
             "unknown";

  // Skip security checks for static files
  if (
    nextUrl.pathname.startsWith("/_next/static") ||
    nextUrl.pathname.startsWith("/_next/image") ||
    nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 1. IP REPUTATION CHECK
  const ipReputation = checkIPReputation(ip);
  if (ipReputation.blocked) {
    console.log(`🚫 Blocked IP: ${ip} (${ipReputation.violations} violations)`);
    return new NextResponse("Access Denied", { status: 403 });
  }

  // 2. BOT DETECTION (except for API routes which might have their own logic)
  if (!nextUrl.pathname.startsWith("/api")) {
    const botDetection = detectBot(req);
    
    if (botDetection.isBot && !botDetection.isAllowed) {
      console.log(`🤖 Blocked bot: ${botDetection.botType || "unknown"} - ${botDetection.reason}`);
      recordIPViolation(ip);
      return new NextResponse("Bot Access Denied", { status: 403 });
    }

    if (botDetection.isBot && botDetection.isAllowed) {
      console.log(`✅ Allowed bot: ${botDetection.botType} from ${ip}`);
    }
  }

  // 3. REQUEST PATTERN ANALYSIS
  const patternCheck = checkRequestPatterns(req);
  if (patternCheck.isSuspicious) {
    console.log(`⚠️ Suspicious request from ${ip}: ${patternCheck.reason}`);
    recordIPViolation(ip);
    return new NextResponse("Invalid Request", { status: 400 });
  }

  // 4. RATE LIMITING (adjust limits as needed)
  const rateLimit = checkRateLimit(ip, 100, 60000); // 100 requests per minute
  if (!rateLimit.allowed) {
    console.log(`⏱️ Rate limit exceeded for ${ip}`);
    return new NextResponse("Too Many Requests", { 
      status: 429,
      headers: {
        "Retry-After": "60"
      }
    });
  }

  // Get the JWT token for authentication
  // CRITICAL: Match cookie configuration from auth.ts
  const useSecureCookies = nextUrl.protocol === "https:";
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: useSecureCookies,
    cookieName: `${cookiePrefix}next-auth.session-token`,
  });
  
  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  // Debug logging
  console.log("🔍 Middleware:", {
    path: nextUrl.pathname,
    protocol: nextUrl.protocol,
    useSecureCookies,
    cookieName: `${cookiePrefix}next-auth.session-token`,
    hasToken: !!token,
    isLoggedIn,
    userRole,
  });

  // Skip middleware for API routes (they handle their own auth)
  if (nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next();
    return applySecurityHeaders(response, req);
  }

  // Handle /login page - redirect logged-in users to appropriate dashboard
  if (nextUrl.pathname === "/login") {
    if (isLoggedIn) { 
      console.log("✅ User logged in at /login, redirecting based on role:", userRole);
      if (userRole === "SUPERADMIN") {
        return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl));
      } else if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      } else {
        return NextResponse.redirect(new URL("/", nextUrl));
      }
    }
    const response = NextResponse.next();
    return applySecurityHeaders(response, req);
  }

  // Protect admin routes - redirect to login if not authenticated or not admin
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      console.log("❌ Not logged in, redirecting to /login");
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      console.log("❌ Not admin/superadmin, redirecting to /");
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    console.log("✅ Admin access granted");
    const response = NextResponse.next();
    return applySecurityHeaders(response, req);
  }

  // Protect superadmin routes - redirect to login if not authenticated or not superadmin
  if (nextUrl.pathname.startsWith("/superadmin")) {
    if (!isLoggedIn) {
      console.log("❌ Not logged in, redirecting to /login");
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "SUPERADMIN") {
      console.log("❌ Not superadmin, redirecting to /");
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    console.log("✅ Superadmin access granted");
    const response = NextResponse.next();
    return applySecurityHeaders(response, req);
  }

  // Redirect /admin to /admin/dashboard
  if (nextUrl.pathname === "/admin") {
    if (isLoggedIn && (userRole === "ADMIN" || userRole === "SUPERADMIN")) {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
  }

  // Redirect /superadmin to /superadmin/dashboard
  if (nextUrl.pathname === "/superadmin") {
    if (isLoggedIn && userRole === "SUPERADMIN") {
      return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl));
    } 
  }

  // Handle homepage "/" - redirect admins to their dashboards
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      console.log("✅ Logged in user at /, role:", userRole);
      if (userRole === "SUPERADMIN") {
        return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl));
      } else if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      }
    }
  } 

  // All other routes - apply security headers
  const response = NextResponse.next();
  return applySecurityHeaders(response, req);
}

export const config = { 
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

