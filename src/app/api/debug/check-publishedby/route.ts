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

    console.log('🔍 Token Debug Info:', {
      id: token.id,
      email: token.email,
      name: token.name,
      isRegistered: token.isRegistered
    });

    // Check what opportunities exist for the token ID
    let opportunitiesByTokenId = [];
    if (token.id) {
      const opportunitiesQuery = `
        SELECT id, role, title, "publishedBy", "createdAt"
        FROM opportunities 
        WHERE "publishedBy" = $1
        ORDER BY "createdAt" DESC
      `;
      
      const result = await pool.query(opportunitiesQuery, [token.id]);
      opportunitiesByTokenId = result.rows;
      if (opportunitiesByTokenId.length > 0) {
        console.log('🔍 Debug: First opportunity publishedBy:', opportunitiesByTokenId[0].publishedBy, 'Type:', typeof opportunitiesByTokenId[0].publishedBy);
        console.log('🔍 Debug: token.id:', token.id, 'Type:', typeof token.id);
      }
    }

    // Check if user exists in database by token ID
    let userByTokenId = null;
    if (token.id) {
      const userQuery = `
        SELECT id, name, email, "userVerified", "accountStatus", "isDeleted"
        FROM users 
        WHERE id = $1
      `;
      
      const result = await pool.query(userQuery, [token.id]);
      if (result.rows.length > 0) {
        userByTokenId = result.rows[0];
      }
    }

    // Check if user exists in database by email
    let userByEmail = null;
    if (token.email) {
      const userByEmailQuery = `
        SELECT id, name, email, "userVerified", "accountStatus", "isDeleted"
        FROM users 
        WHERE email = $1
      `;
      
      const result = await pool.query(userByEmailQuery, [token.email]);
      if (result.rows.length > 0) {
        userByEmail = result.rows[0];
      }
    }

    // Check all opportunities to see what publishedBy values exist
    const allOpportunitiesQuery = `
      SELECT id, role, title, "publishedBy", "createdAt"
      FROM opportunities 
      ORDER BY "createdAt" DESC
      LIMIT 20
    `;
    
    const allOpportunitiesResult = await pool.query(allOpportunitiesQuery);
    const allOpportunities = allOpportunitiesResult.rows;

    return NextResponse.json({
      success: true,
      message: 'PublishedBy check completed',
      timestamp: new Date().toISOString(),
      data: {
        tokenInfo: {
          id: token.id,
          email: token.email,
          name: token.name,
          isRegistered: token.isRegistered
        },
        userByTokenId: {
          exists: !!userByTokenId,
          data: userByTokenId
        },
        userByEmail: {
          exists: !!userByEmail,
          data: userByEmail
        },
        opportunitiesByTokenId: {
          count: opportunitiesByTokenId.length,
          opportunities: opportunitiesByTokenId
        },
        allOpportunities: {
          count: allOpportunities.length,
          opportunities: allOpportunities
        },
        analysis: {
          tokenIdExistsInDb: !!userByTokenId,
          emailExistsInDb: !!userByEmail,
          hasOpportunities: opportunitiesByTokenId.length > 0
        }
      }
    });

  } catch (error) {
    console.error('Error in publishedBy check:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check publishedBy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 