import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds

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
    await validateAPIRouteAndGetUserId(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const pageId = searchParams.get('pageId');
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pagination parameters'
      }, { status: 400 });
    }

    if (!pageId) {
      return NextResponse.json({
        success: true,
        message: 'Please select a page to view opportunities',
        data: {
          opportunities: [],
          pagination: { total: 0, page, totalPages: 0, hasMore: false }
        }
      });
    }

    const query = `
      SELECT
        o.*,
        COUNT(DISTINCT oa.id) as applicant_count,
        COUNT(*) OVER() as total_count
      FROM opportunities o
      LEFT JOIN "opportunityApplicants" oa ON o.id = oa."opportunityId"
      WHERE o."publishedBy" = $1
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query<OpportunityQueryResult & { total_count: string }>(query, [pageId, limit, offset]);
    const opportunities = result.rows;
    const totalCount = opportunities.length > 0 ? parseInt(opportunities[0].total_count, 10) : 0;

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

    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved opportunities',
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

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;
  } catch {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch opportunities'
    }, { status: 500 });
  }
}
