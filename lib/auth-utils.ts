// lib/auth-utils.ts
// Reusable authentication utilities for server components and actions

import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";

/**
 * Check if user is authenticated (any role)
 * Redirects to /login if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Check if user is authenticated and is an admin or superadmin
 * Redirects to /login if not authenticated
 * Redirects to / if user is not admin/superadmin
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    console.log("❌ requireAdmin: No session, redirecting to /login");
    redirect("/login");
  }
  
  const userRole = (session.user as any)?.role;
  
  console.log("🔐 requireAdmin: Checking role:", userRole);
  
  if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
    console.log("❌ requireAdmin: Not admin/superadmin, redirecting to /");
    redirect("/");
  }
  
  console.log("✅ requireAdmin: Access granted");
  return session;
} 

/**
 * Check if user is authenticated and is a superadmin
 * Redirects to /login if not authenticated
 * Redirects to / if user is not superadmin
 */
export async function requireSuperAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    console.log("❌ requireSuperAdmin: No session, redirecting to /login");
    redirect("/login");
  }
  
  const userRole = (session.user as any)?.role;
  
  console.log("🔐 requireSuperAdmin: Checking role:", userRole);
  
  if (userRole !== "SUPERADMIN") {
    console.log("❌ requireSuperAdmin: Not superadmin, redirecting to /");
    redirect("/");
  }
  
  console.log("✅ requireSuperAdmin: Access granted");
  return session;
}

/**
 * Get current user session without redirecting
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Check if current user is admin or superadmin
 * Returns boolean without redirecting
 */
export async function isAdmin() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  return userRole === "ADMIN" || userRole === "SUPERADMIN";
}

/**
 * Check if current user is superadmin
 * Returns boolean without redirecting
 */
export async function isSuperAdmin() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  return userRole === "SUPERADMIN";
}

/**
 * Check if user is authenticated
 * Returns boolean without redirecting
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

