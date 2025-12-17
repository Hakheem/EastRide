// lib/security/bot-detector.ts
import { NextRequest } from "next/server";

interface BotDetectionResult {
  isBot: boolean;
  isAllowed: boolean;
  botType?: string;
  reason?: string;
}

// Allowed search engine bots for SEO
const ALLOWED_BOTS = [
  // Search Engines
  'googlebot', 'google-inspectiontool', 'adsbot-google',
  'bingbot', 'msnbot', 'bingpreview',
  'duckduckbot', 'slurp', 'yahoo',
  'yandexbot', 'baiduspider',
  // Social Media crawlers (for previews)
  'twitterbot', 'facebookexternalhit', 'whatsapp',
  'linkedinbot', 'pinterestbot', 'telegrambot',
  // SEO/Analytics tools
  'semrushbot', 'ahrefsbot', 'dotbot',
  'mj12bot', 'rogerbot', 'screaming frog',
  // Monitoring/Uptime
  'uptimerobot', 'pingdom', 'statuscake'
];

// Malicious bot patterns
const MALICIOUS_BOT_PATTERNS = [
  'scraper', 'crawler', 'spider', 'bot',
  'curl', 'wget', 'python-requests', 'java/',
  'go-http-client', 'okhttp', 'axios',
  'masscan', 'nikto', 'sqlmap', 'nmap',
  'acunetix', 'nessus', 'metasploit',
  'httrack', 'teleport', 'webzip',
  'download', 'harvester', 'extract'
];

export function detectBot(req: NextRequest): BotDetectionResult {
  const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || 
             "unknown";

  // Check if it's an allowed bot
  for (const bot of ALLOWED_BOTS) {
    if (userAgent.includes(bot.toLowerCase())) {
      return {
        isBot: true,
        isAllowed: true,
        botType: bot,
        reason: "Allowed search engine or social media bot"
      };
    }
  }

  // Check for missing or suspicious User-Agent
  if (!userAgent || userAgent.length < 10) {
    return {
      isBot: true,
      isAllowed: false,
      reason: "Missing or too short User-Agent"
    };
  }

  // Check for malicious bot patterns
  for (const pattern of MALICIOUS_BOT_PATTERNS) {
    if (userAgent.includes(pattern)) {
      return {
        isBot: true,
        isAllowed: false,
        botType: pattern,
        reason: `Detected malicious pattern: ${pattern}`
      };
    }
  }

  // Advanced bot detection heuristics
  const suspiciousIndicators = [
    !userAgent.includes("mozilla"),
    !userAgent.includes("applewebkit") && !userAgent.includes("gecko"),
    userAgent.split(" ").length < 3,
    /^[a-z0-9\-_]+\/[0-9.]+$/i.test(userAgent), // Simple format like "bot/1.0"
  ];

  const suspiciousCount = suspiciousIndicators.filter(Boolean).length;
  
  if (suspiciousCount >= 2) {
    return {
      isBot: true,
      isAllowed: false,
      reason: "Multiple suspicious indicators detected"
    };
  }

  // Check for common headless browser indicators
  const headlessIndicators = [
    'headless', 'phantom', 'selenium', 'webdriver',
    'puppeteer', 'playwright'
  ];

  for (const indicator of headlessIndicators) {
    if (userAgent.includes(indicator)) {
      return {
        isBot: true,
        isAllowed: false,
        botType: indicator,
        reason: `Headless browser detected: ${indicator}`
      };
    }
  }

  return {
    isBot: false,
    isAllowed: true,
    reason: "Appears to be legitimate user"
  };
}

// Check for suspicious request patterns
export function checkRequestPatterns(req: NextRequest): {
  isSuspicious: boolean;
  reason?: string;
} {
  const url = req.nextUrl;
  const method = req.method;

  // Check for path traversal attempts
  if (url.pathname.includes("..") || url.pathname.includes("//")) {
    return { isSuspicious: true, reason: "Path traversal attempt" };
  }

  // Check for SQL injection patterns in query params
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /(union|select|from|where|insert|delete|drop|update|exec)/i
  ];

  const searchParams = url.searchParams.toString();
  for (const pattern of sqlPatterns) {
    if (pattern.test(searchParams)) {
      return { isSuspicious: true, reason: "SQL injection attempt detected" };
    }
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(url.href)) {
      return { isSuspicious: true, reason: "XSS attempt detected" };
    }
  }

  // Check for file inclusion attempts
  const lfiPatterns = [
    /\.\.\//,
    /etc\/passwd/,
    /windows\/system32/,
    /proc\/self/
  ];

  for (const pattern of lfiPatterns) {
    if (pattern.test(url.pathname)) {
      return { isSuspicious: true, reason: "File inclusion attempt detected" };
    }
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.php', '.asp', '.jsp', '.cgi', '.sh', '.bat'];
  if (suspiciousExtensions.some(ext => url.pathname.endsWith(ext))) {
    return { isSuspicious: true, reason: "Suspicious file extension" };
  }

  return { isSuspicious: false };
}

// Rate limiting per IP (in-memory, for basic protection)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remainingRequests?: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remainingRequests: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false };
  }

  record.count++;
  return { allowed: true, remainingRequests: maxRequests - record.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000); // Clean up every minute
