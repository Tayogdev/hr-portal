import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';

import { validateAPIRouteWithRateLimit } from '@/lib/utils';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define an interface for the raw opportunity data from the database
interface OpportunityQueryResult {
  id: string;
  role: string | null;
  title: string | null;
  isActive: boolean;
  regEndDate: string;
  createdAt: string;
  maxParticipants: number;
  vacancies: number;
  applicant_count: string;
}

// Define an interface for the formatted opportunity object
interface FormattedOpportunity {
  id: string;
  role: string;
  status: 'Live' | 'Closed';
  type: string;
  posted: string;
  due: string;
  applicants: number;
  needs: string;
  action: 'Review Applicants' | 'Completed';
  active: boolean;
}

export async function GET(request: NextRequest) {
  try {

    // Validate authentication with rate limiting
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    // ✅ Use static user ID - in production, get this from the authenticated token
    const userId = '7a902358-4091-40a8-8f15-10f7e423aca9';

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;


    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pagination parameters',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_PARAMS',
          details: 'Page must be >= 1, limit must be between 1 and 100'
        }
      }, { status: 400 });
    }

    // Test database connection
    try {
      await pool.query('SELECT NOW()');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        error: {
          code: 'DATABASE_CONNECTION_ERROR',
          details: 'Unable to connect to database'
        }
      }, { status: 500 });
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*)
      FROM opportunities o
      WHERE o."publishedBy" = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Get paginated opportunities
    const query = `
      SELECT
        o.*,
        COUNT(DISTINCT oa.id) as applicant_count
      FROM opportunities o
      LEFT JOIN "opportunityApplicants" oa ON o.id = oa."opportunityId"
      WHERE o."publishedBy" = $1
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query<OpportunityQueryResult>(query, [userId, limit, offset]);
    const opportunities = result.rows;

    const formattedOpportunities: FormattedOpportunity[] = opportunities.map((opp) => ({
      id: opp.id,
      role: opp.role || opp.title || 'Untitled Role',
      status: opp.isActive && new Date(opp.regEndDate) > new Date() ? 'Live' : 'Closed',

      type: opp.title || 'Full Time',
      posted: new Date(opp.createdAt).toLocaleDateString('en-GB'),
      due: new Date(opp.regEndDate).toLocaleDateString('en-GB'),
      applicants: parseInt(opp.applicant_count, 10),
      needs: `${opp.maxParticipants - opp.vacancies} / ${opp.maxParticipants}`,
      action: opp.isActive && new Date(opp.regEndDate) > new Date() ? 'Review Applicants' : 'Completed',
      active: opp.isActive && new Date(opp.regEndDate) > new Date(),
    }));


    // Return the response structure that the frontend expects
    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved opportunities',
      timestamp: new Date().toISOString(),
      data: {
        opportunities: formattedOpportunities,
        pagination: {
          total: totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch opportunities',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}