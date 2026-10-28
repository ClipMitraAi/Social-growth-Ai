import { Request, Response, NextFunction } from 'express';
import { db, User } from '../db/store.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

export function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );
    if (cookies.session_token) {
      return cookies.session_token;
    }
  }
  return undefined;
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const session = db.getSessionByToken(token);
    if (session) {
      req.user = db.getUserById(session.userId);
      req.sessionToken = token;
    }
  }
  next();
}

export function requireAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  const session = db.getSessionByToken(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    return;
  }
  const user = db.getUserById(session.userId);
  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }
  req.user = user;
  req.sessionToken = token;
  next();
}

export function requireAdminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuthMiddleware(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
      return;
    }
    next();
  });
}

/**
 * In-memory IP rate limiter to guard expensive endpoints
 */
class RateLimiter {
  private requests: Map<string, { count: number; windowStart: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 60, windowMs = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(ip);
    if (!entry) {
      this.requests.set(ip, { count: 1, windowStart: now });
      return false;
    }
    if (now - entry.windowStart > this.windowMs) {
      this.requests.set(ip, { count: 1, windowStart: now });
      return false;
    }
    entry.count += 1;
    return entry.count > this.maxRequests;
  }
}

export const generalRateLimiter = new RateLimiter(120, 60 * 1000); // 120 req / min
export const expensiveRateLimiter = new RateLimiter(30, 60 * 1000); // 30 req / min (for audits & AI)

export function rateLimitGuard(isExpensive = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const limiter = isExpensive ? expensiveRateLimiter : generalRateLimiter;
    if (limiter.isRateLimited(ip)) {
      res.status(429).json({
        error: 'Too many requests. Please slow down and try again shortly.',
        retryAfterSeconds: 30,
      });
      return;
    }
    next();
  };
}

/**
 * SSRF protection: validates that public profile URLs only target legitimate social domains
 */
export function validateSocialUrlSafety(urlStr: string): { isSafe: boolean; error?: string } {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    
    // Check against internal / private addresses
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return { isSafe: false, error: 'Internal network hosts are strictly forbidden.' };
    }

    const allowedDomains = [
      'instagram.com',
      'www.instagram.com',
      'youtube.com',
      'www.youtube.com',
      'youtu.be',
      'tiktok.com',
      'www.tiktok.com',
      'facebook.com',
      'www.facebook.com',
      'x.com',
      'www.x.com',
      'twitter.com',
      'www.twitter.com',
    ];

    const isMatch = allowedDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
    if (!isMatch) {
      return { isSafe: false, error: 'Only supported public social media domains are allowed (Instagram, YouTube, TikTok, Facebook, X/Twitter).' };
    }

    return { isSafe: true };
  } catch {
    return { isSafe: false, error: 'Invalid URL format.' };
  }
}
