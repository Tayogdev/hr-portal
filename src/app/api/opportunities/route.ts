import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  publishedBy: string;
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
    // Validate authentication and get user ID
    const { userId } = await validateAPIRouteAndGetUserId(request);

    // Debug logging
    console.log('🔍 Debug: User ID from token:', userId);
    console.log('🔍 Debug: Token info:', {
      id: userId,
      email: (await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }))?.email,
      isRegistered: (await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }))?.isRegistered
    });

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

    // Step 1: Find all publishedBy (page IDs) for this user
    const pageIdQuery = `
      SELECT DISTINCT "publishedBy"
      FROM opportunities
      WHERE "createdByUser" = $1
    `;
    const pageIdResult = await pool.query(pageIdQuery, [userId]);
    const pageIds = pageIdResult.rows.map(row => row.publishedBy);
    console.log('🔍 Debug: Page IDs (publishedBy) for user:', userId, pageIds);

    if (pageIds.length === 0) {
      // No pages, return empty result
      return NextResponse.json({
        success: true,
        message: 'No opportunities found for user',
        timestamp: new Date().toISOString(),
        data: {
          opportunities: [],
          pagination: {
            total: 0,
            page,
            totalPages: 0,
            hasMore: false,
          }
        }
      });
    }

    // Step 2: Get total count for these page IDs
    const countQuery = `
      SELECT COUNT(*)
      FROM opportunities o
      WHERE o."publishedBy" = ANY($1)
    `;
    const countResult = await pool.query(countQuery, [pageIds]);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    console.log('🔍 Debug: Count query executed with pageIds:', pageIds, 'Result:', totalCount);

    // Step 3: Fetch paginated opportunities for these page IDs
    const query = `
      SELECT
        o.*,
        COUNT(DISTINCT oa.id) as applicant_count
      FROM opportunities o
      LEFT JOIN "opportunityApplicants" oa ON o.id = oa."opportunityId"
      WHERE o."publishedBy" = ANY($1)
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query<OpportunityQueryResult>(query, [pageIds, limit, offset]);
    const opportunities = result.rows;
    console.log('🔍 Debug: Main query returned opportunities:', opportunities.length, 'IDs:', opportunities.map(o => o.id));
    if (opportunities.length > 0) {
      console.log('🔍 Debug: First opportunity publishedBy:', opportunities[0].publishedBy, 'Type:', typeof opportunities[0].publishedBy);
    }

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
    // If it's already a NextResponse, return it
    if (error instanceof NextResponse) {
      return error;
    }
    // Log full error server-side
    console.error('Error fetching opportunities:', error);
    // Return generic error to client
    const response = NextResponse.json({
      success: false,
      message: 'Failed to fetch opportunities',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: 'An unexpected error occurred. Please try again later.'
      }
    }, { status: 500 });
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    return response;
  }
}