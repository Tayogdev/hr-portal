import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/dbconfig/dbconfig';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No authentication token found',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Get user info from database using token ID
    let dbUser = null;
    if (token.id) {
      const userQuery = `
        SELECT id, name, email, "userVerified", "accountStatus", "isDeleted"
        FROM users 
        WHERE id = $1
      `;
      
      const result = await pool.query(userQuery, [token.id]);
      if (result.rows.length > 0) {
        dbUser = result.rows[0];
      }
    }

    // Get user info from database using email
    let dbUserByEmail = null;
    if (token.email) {
      const userByEmailQuery = `
        SELECT id, name, email, "userVerified", "accountStatus", "isDeleted"
        FROM users 
        WHERE email = $1
      `;
      
      const result = await pool.query(userByEmailQuery, [token.email]);
      if (result.rows.length > 0) {
        dbUserByEmail = result.rows[0];
      }
    }

    // Check opportunities for the token ID
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
    }

    // Check opportunities for the database user ID (by email)
    let opportunitiesByDbUser = [];
    if (dbUserByEmail?.id) {
      const opportunitiesQuery = `
        SELECT id, role, title, "publishedBy", "createdAt"
        FROM opportunities 
        WHERE "publishedBy" = $1
        ORDER BY "createdAt" DESC
      `;
      
      const result = await pool.query(opportunitiesQuery, [dbUserByEmail.id]);
      opportunitiesByDbUser = result.rows;
    }

    // Check all opportunities for debugging
    const allOpportunitiesQuery = `
      SELECT id, role, title, "publishedBy", "createdAt"
      FROM opportunities 
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    const allOpportunitiesResult = await pool.query(allOpportunitiesQuery);
    const allOpportunities = allOpportunitiesResult.rows;

    return NextResponse.json({
      success: true,
      message: 'Debug information retrieved',
      timestamp: new Date().toISOString(),
      data: {
        token: {
          id: token.id,
          email: token.email,
          name: token.name,
          isRegistered: token.isRegistered
        },
        databaseUserById: dbUser,
        databaseUserByEmail: dbUserByEmail,
        opportunitiesByTokenId: {
          count: opportunitiesByTokenId.length,
          opportunities: opportunitiesByTokenId
        },
        opportunitiesByDbUser: {
          count: opportunitiesByDbUser.length,
          opportunities: opportunitiesByDbUser
        },
        allOpportunities: {
          count: allOpportunities.length,
          opportunities: allOpportunities
        }
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve debug information',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 