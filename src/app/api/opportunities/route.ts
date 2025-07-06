import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // ✅ Use static user ID
    const userId = '1bcd2b99-da2b-4cf2-82a6-b4585b9a2dd4';

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

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
    const result = await pool.query(query, [userId, limit, offset]);
    const opportunities = result.rows;

    const formattedOpportunities = opportunities.map((opp: any) => ({
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

    return NextResponse.json({
      opportunities: formattedOpportunities,
      pagination: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch opportunities',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
