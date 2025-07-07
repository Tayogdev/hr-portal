import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function validateAPIRoute(req: NextRequest, requiredRole?: string) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          timestamp: new Date().toISOString(),
          error: {
            code: 'UNAUTHORIZED',
            details: 'Authentication token not found'
          }
        },
        { status: 401 }
      );
    }

    // Check if user has required role (if specified)
    if (requiredRole && token.role !== requiredRole && token.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          message: 'Forbidden - Insufficient permissions',
          timestamp: new Date().toISOString(),
          error: {
            code: 'FORBIDDEN',
            details: `Required role: ${requiredRole}, Current role: ${token.role || 'none'}`
          }
        },
        { status: 403 }
      );
    }

    // Check token expiration
    if (token.exp && typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Token expired - Please login again',
          timestamp: new Date().toISOString(),
          error: {
            code: 'TOKEN_EXPIRED',
            details: 'Authentication token has expired'
          }
        },
        { status: 401 }
      );
    }

    return null; // Authentication successful
  } catch (error) {
    console.error('Authentication validation error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Authentication validation failed',
        timestamp: new Date().toISOString(),
        error: {
          code: 'AUTH_ERROR',
          details: error instanceof Error ? error.message : 'Unknown authentication error'
        }
      },
      { status: 500 }
    );
  }
}

export async function validateAdminAPIRoute(req: NextRequest) {
  return validateAPIRoute(req, 'admin');
}

export async function validateHRAPIRoute(req: NextRequest) {
  return validateAPIRoute(req, 'hr');
}

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (userRequests.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  userRequests.count++;
  return { allowed: true, remaining: limit - userRequests.count };
}

export async function validateAPIRouteWithRateLimit(req: NextRequest, requiredRole?: string) {
  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(clientIP, 100, 60000); // 100 requests per minute
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          details: 'Too many requests, please try again later'
        }
      },
      { status: 429 }
    );
  }

  // Standard authentication validation
  return validateAPIRoute(req, requiredRole);
}
