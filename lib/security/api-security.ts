// lib/security/api-security.ts
// Helper functions for securing API routes

import { NextRequest, NextResponse } from "next/server";
import { detectBot, checkRequestPatterns } from "./bot-detector";
import { checkIPReputation, recordIPViolation, validateFormData } from "./shield-protection";

interface SecurityCheckResult {
  allowed: boolean;
  response?: NextResponse;
  reason?: string;
}

/**
 * Comprehensive security check for API routes
 * Use at the beginning of your API handlers
 */
export async function checkAPISecurity(req: NextRequest): Promise<SecurityCheckResult> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || 
             "unknown";

  // 1. IP Reputation Check
  const ipReputation = checkIPReputation(ip);
  if (ipReputation.blocked) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      ),
      reason: "Blocked IP"
    };
  }

  // 2. Bot Detection (stricter for API routes)
  const botDetection = detectBot(req);
  if (botDetection.isBot && !botDetection.isAllowed) {
    recordIPViolation(ip);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Bot access denied" },
        { status: 403 }
      ),
      reason: botDetection.reason
    };
  }

  // 3. Request Pattern Analysis
  const patternCheck = checkRequestPatterns(req);
  if (patternCheck.isSuspicious) {
    recordIPViolation(ip);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      ),
      reason: patternCheck.reason
    };
  }

  // 4. Method validation
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  if (!allowedMethods.includes(req.method)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      ),
      reason: "Invalid HTTP method"
    };
  }

  return { allowed: true };
}

/**
 * Validate JSON body in API requests
 */
export async function validateJSONBody(req: NextRequest): Promise<{
  valid: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const data = await req.json();
    
    // Check for common attack patterns in JSON
    const jsonString = JSON.stringify(data);
    const suspiciousPatterns = [
      /__proto__/,
      /constructor/,
      /prototype/,
      /<script/i,
      /javascript:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(jsonString)) {
        return {
          valid: false,
          error: "Suspicious content detected in request body"
        };
      }
    }

    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid JSON in request body"
    };
  }
}

/**
 * Example usage in an API route
 */
export async function exampleAPIHandler(req: NextRequest) {
  // 1. Security check
  const securityCheck = await checkAPISecurity(req);
  if (!securityCheck.allowed) {
    console.log(`🚫 API Security block: ${securityCheck.reason}`);
    return securityCheck.response;
  }

  // 2. Method check
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  // 3. Validate JSON body
  const bodyValidation = await validateJSONBody(req);
  if (!bodyValidation.valid) {
    return NextResponse.json(
      { error: bodyValidation.error },
      { status: 400 }
    );
  }

  // Your API logic here
  const data = bodyValidation.data;

  return NextResponse.json({ success: true, data });
}

/**
 * CORS headers for API routes (if needed)
 */
export function getCORSHeaders(origin?: string): HeadersInit {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://yourdomain.com'
  ].filter(Boolean);

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleCORS(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCORSHeaders(req.headers.get('origin') || undefined)
    });
  }
  return null;
}

