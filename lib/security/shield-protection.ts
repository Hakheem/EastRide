// lib/security/shield-protection.ts
import { NextRequest, NextResponse } from "next/server";

interface SecurityHeaders {
  [key: string]: string;
}

// Generate strong Content Security Policy for car marketplace
export function generateCSP(): string {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://api.* wss://*",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ];
  
  return cspDirectives.join("; ");
}

// Comprehensive security headers
export function getSecurityHeaders(req: NextRequest): SecurityHeaders {
  return {
    // Content Security Policy
    "Content-Security-Policy": generateCSP(),
    
    // Prevent clickjacking
    "X-Frame-Options": "SAMEORIGIN",
    
    // XSS Protection
    "X-XSS-Protection": "1; mode=block",
    
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Permissions Policy (formerly Feature Policy)
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "payment=(self)"
    ].join(", "),
    
    // Strict Transport Security (HTTPS only)
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    
    // Cross-Origin policies
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    
    // Additional security headers
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "X-Permitted-Cross-Domain-Policies": "none"
  };
}

// Apply security headers to response
export function applySecurityHeaders(
  response: NextResponse,
  req: NextRequest
): NextResponse {
  const headers = getSecurityHeaders(req);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Check for suspicious form submissions
export function validateFormData(formData: FormData): {
  valid: boolean;
  reason?: string;
} {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /expression\(/i
  ];

  for (const [key, value] of formData.entries()) {
    const strValue = value.toString();
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(strValue)) {
        return {
          valid: false,
          reason: `Suspicious pattern detected in field: ${key}`
        };
      }
    }
  }

  return { valid: true };
}

// Content validation for car marketplace
export function validateCarListingContent(content: string): {
  valid: boolean;
  sanitized: string;
  issues?: string[];
} {
  const issues: string[] = [];
  let sanitized = content;

  // Check content length
  if (content.length > 10000) {
    issues.push("Content exceeds maximum length");
  }

  // Remove potentially dangerous HTML
  const dangerousPatterns = [
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, name: 'script tags' },
    { pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, name: 'iframe tags' },
    { pattern: /javascript:[^'"']*/gi, name: 'javascript: URLs' },
    { pattern: /on\w+\s*=\s*["'][^"']*["']/gi, name: 'inline event handlers' }
  ];

  dangerousPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(sanitized)) {
      issues.push(`Removed ${name}`);
      sanitized = sanitized.replace(pattern, '');
    }
  });

  return {
    valid: issues.length === 0,
    sanitized,
    issues: issues.length > 0 ? issues : undefined
  };
}

// Check for spam/abuse patterns in car listings
export function checkForSpam(text: string): {
  isSpam: boolean;
  confidence: number;
  reasons?: string[];
} {
  const reasons: string[] = [];
  let spamScore = 0;

  // Check for excessive links
  const linkCount = (text.match(/https?:\/\//gi) || []).length;
  if (linkCount > 3) {
    spamScore += 0.3;
    reasons.push(`Too many links: ${linkCount}`);
  }

  // Check for excessive caps
  const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsPercentage > 0.5 && text.length > 50) {
    spamScore += 0.2;
    reasons.push("Excessive capitalization");
  }

  // Check for repeated characters
  if (/(.)\1{4,}/.test(text)) {
    spamScore += 0.2;
    reasons.push("Repeated characters");
  }

  // Check for common spam keywords
  const spamKeywords = [
    'buy now', 'click here', 'limited time', 'act now',
    'winner', 'congratulations', 'free money', '100% free',
    'no credit check', 'cash now', 'guarantee'
  ];

  const lowerText = text.toLowerCase();
  const spamKeywordCount = spamKeywords.filter(kw => 
    lowerText.includes(kw)
  ).length;

  if (spamKeywordCount > 2) {
    spamScore += 0.3;
    reasons.push(`Spam keywords detected: ${spamKeywordCount}`);
  }

  // Check for phone numbers and emails (may indicate spam)
  const phoneCount = (text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || []).length;
  const emailCount = (text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  
  if (phoneCount > 3 || emailCount > 2) {
    spamScore += 0.2;
    reasons.push("Multiple contact details");
  }

  return {
    isSpam: spamScore > 0.5,
    confidence: spamScore,
    reasons: reasons.length > 0 ? reasons : undefined
  };
}

// IP reputation check (basic implementation)
const blockedIPs = new Set<string>();
const ipReputations = new Map<string, { violations: number; lastViolation: number }>();

export function checkIPReputation(ip: string): {
  blocked: boolean;
  violations: number;
  shouldWarn: boolean;
} {
  if (blockedIPs.has(ip)) {
    return { blocked: true, violations: 0, shouldWarn: false };
  }

  const reputation = ipReputations.get(ip);
  if (!reputation) {
    return { blocked: false, violations: 0, shouldWarn: false };
  }

  // Auto-unblock after 24 hours of last violation
  const hoursSinceViolation = (Date.now() - reputation.lastViolation) / (1000 * 60 * 60);
  if (hoursSinceViolation > 24) {
    ipReputations.delete(ip);
    return { blocked: false, violations: 0, shouldWarn: false };
  }

  return {
    blocked: reputation.violations >= 10,
    violations: reputation.violations,
    shouldWarn: reputation.violations >= 5
  };
}

export function recordIPViolation(ip: string): void {
  const reputation = ipReputations.get(ip) || { violations: 0, lastViolation: 0 };
  reputation.violations++;
  reputation.lastViolation = Date.now();
  ipReputations.set(ip, reputation);

  if (reputation.violations >= 10) {
    blockedIPs.add(ip);
  }
}

// Clean up old IP reputations periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, reputation] of ipReputations.entries()) {
    const hoursSince = (now - reputation.lastViolation) / (1000 * 60 * 60);
    if (hoursSince > 24) {
      ipReputations.delete(ip);
      blockedIPs.delete(ip);
    }
  }
}, 3600000); // Clean up every hour

