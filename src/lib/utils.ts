import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function validateAPIRoute(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Unauthorized - Please login to access this resource',
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  }
  
  return null; // Authentication successful
}
