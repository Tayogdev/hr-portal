import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRoute } from '@/lib/utils';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authError = await validateAPIRoute(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const opportunityId = url.pathname.split('/')[3]; // Get opportunityId from URL path
    
    // Fetch the opportunity details
    const query = `
      SELECT 
        o.*,
        COUNT(DISTINCT oa.id) as applicant_count
      FROM opportunities o
      LEFT JOIN "opportunityApplicants" oa ON o.id = oa."opportunityId"
      WHERE o.id = $1
      GROUP BY o.id
    `;
    
    const result = await pool.query(query, [opportunityId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity not found',
        timestamp: new Date().toISOString(),
        data: null
      }, { status: 404 });
    }

    const opportunity = result.rows[0];
    
    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved opportunity details',
      timestamp: new Date().toISOString(),
      data: {
        id: opportunity.id,
        role: opportunity.role || opportunity.title || 'Untitled Role',
        institute: opportunity.institute || 'Not Specified',
        department: opportunity.department,
        location: opportunity.location || 'Not Specified',
        stipend: opportunity.stipend,
        title: opportunity.title,
        description: opportunity.description,
        acceptCondition: opportunity.acceptCondition,
        regStartDate: opportunity.regStartDate,
        regEndDate: opportunity.regEndDate,
        clicks: opportunity.clicks,
        vacancies: opportunity.vacancies,
        maxParticipants: opportunity.maxParticipants,
        status: opportunity.isActive && new Date(opportunity.regEndDate) > new Date() ? 'Live' : 'Closed',
        applicantCount: parseInt(opportunity.applicant_count),
        createdAt: opportunity.createdAt,
        updatedAt: opportunity.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch opportunity details',
      timestamp: new Date().toISOString(),
      error: {
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}