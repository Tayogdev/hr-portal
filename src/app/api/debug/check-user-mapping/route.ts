import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/dbconfig/dbconfig';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No authentication token found',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Check if the specific user ID exists in database
    const specificUserId = 'f1a8ce01-4f60-4dc8-9973-031cced3453f';
    
    const specificUserQuery = `
      SELECT id, name, email, "userVerified", "accountStatus", "isDeleted"
      FROM users 
      WHERE id = $1
    `;
    
    const specificUserResult = await pool.query(specificUserQuery, [specificUserId]);
    const specificUser = specificUserResult.rows[0] || null;

    // Check opportunities for the specific user ID
    const specificUserOpportunitiesQuery = `
      SELECT id, role, title, "publishedBy", "createdAt"
      FROM opportunities 
      WHERE "publishedBy" = $1
      ORDER BY "createdAt" DESC
    `;
    
    const specificUserOpportunitiesResult = await pool.query(specificUserOpportunitiesQuery, [specificUserId]);
    const specificUserOpportunities = specificUserOpportunitiesResult.rows;

    // Check if token email matches the specific user
    let emailMatch = false;
    if (token.email && specificUser) {
      emailMatch = token.email === specificUser.email;
    }

    return NextResponse.json({
      success: true,
      message: 'User mapping check completed',
      timestamp: new Date().toISOString(),
      data: {
        tokenInfo: {
          id: token.id,
          email: token.email,
          name: token.name,
          isRegistered: token.isRegistered
        },
        specificUser: {
          exists: !!specificUser,
          data: specificUser,
          opportunitiesCount: specificUserOpportunities.length,
          opportunities: specificUserOpportunities
        },
        mapping: {
          emailMatch,
          idMatch: token.id === specificUserId,
          tokenIdType: typeof token.id,
          specificUserIdType: typeof specificUserId
        }
      }
    });

  } catch (error) {
    console.error('Error in user mapping check:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check user mapping',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 