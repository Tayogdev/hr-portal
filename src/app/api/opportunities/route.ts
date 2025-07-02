/**
 * @api {get} /api/opportunities Get All Opportunities
 * @apiVersion 1.0.0
 * @apiDescription Fetches paginated list of opportunities with applicant counts
 * @apiQuery {number} [page=1] Page number for pagination
 * @apiQuery {number} [limit=10] Number of items per page
 * @apiSuccess {Object[]} opportunities List of opportunities
 * @apiSuccess {Object} pagination Pagination information
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM opportunities o
    `;
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated data
    const query = `
      SELECT 
        o.*,
        COUNT(DISTINCT oa.id) as applicant_count
      FROM opportunities o
      LEFT JOIN "opportunityApplicants" oa ON o.id = oa."opportunityId"
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    const opportunities = result.rows;

    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      role: opp.role || opp.title || 'Untitled Role',
      status: new Date(opp.regEndDate) > new Date() ? 'Live' : 'Closed',
      type: opp.title || 'Full Time',
      posted: new Date(opp.createdAt).toLocaleDateString('en-GB'),
      due: new Date(opp.regEndDate).toLocaleDateString('en-GB'),
      applicants: parseInt(opp.applicant_count),
      needs: `${opp.maxParticipants - opp.vacancies} / ${opp.maxParticipants}`,
      action: new Date(opp.regEndDate) > new Date() ? 'Review Applicants' : 'Completed',
      active: new Date(opp.regEndDate) > new Date(),
    }));

    return NextResponse.json({
      opportunities: formattedOpportunities,
      pagination: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}