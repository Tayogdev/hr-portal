import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/dbconfig/dbconfig';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized - Please login to access this resource',
          timestamp: new Date().toISOString(),
          error: {
            code: 'UNAUTHORIZED',
            details: 'Authentication token not found'
          }
        },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    // Get all opportunities owned by the user
    const opportunitiesQuery = `
      SELECT o.id, o.role, o.title, o.type
      FROM opportunities o
      INNER JOIN "pageOwnership" po ON o."pageId" = po."pageId"
      WHERE po."userId" = $1
      ORDER BY o."createdAt" DESC
    `;

    const opportunitiesResult = await pool.query(opportunitiesQuery, [userId]);
    const opportunities = opportunitiesResult.rows;

    if (opportunities.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          applicants: [],
          total: 0,
          opportunities: []
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get all applicants for all opportunities in a single query
    const opportunityIds = opportunities.map(opp => opp.id);
    
    // Handle the case where we have opportunities but need to build the query properly
    if (opportunityIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          applicants: [],
          total: 0,
          opportunities: opportunities.length
        },
        timestamp: new Date().toISOString()
      });
    }

    const placeholders = opportunityIds.map((_, index) => `$${index + 1}`).join(',');
    
    const applicantsQuery = `
      SELECT 
        oa.id,
        oa."userId",
        oa."opportunityId",
        oa."applicationStatus" as status,
        oa."createdAt",
        oa."appliedDate",
        oa.cv,
        oa.portfolio,
        oa.sops,
        oa.lor,
        oa."researchProposal",
        oa."coverLetter",
        u.name,
        u.email
      FROM "opportunityApplicants" oa
      LEFT JOIN users u ON oa."userId" = u.id
      WHERE oa."opportunityId" IN (${placeholders})
      ORDER BY oa."createdAt" DESC
    `;

    const applicantsResult = await pool.query(applicantsQuery, opportunityIds);
    const applicants = applicantsResult.rows;

    // Enhance applicants with opportunity data and document counts
    const enhancedApplicants = applicants.map(applicant => {
      const opportunity = opportunities.find(opp => opp.id === applicant.opportunityId);
      const documents = {
        cv: applicant.cv,
        portfolio: applicant.portfolio,
        sops: applicant.sops,
        lor: applicant.lor,
        researchProposal: applicant.researchProposal,
        coverLetter: applicant.coverLetter
      };
      
      const uploads = Object.values(documents).filter(Boolean).length;
      
      return {
        id: applicant.id,
        userId: applicant.userId,
        name: applicant.name || 'Anonymous',
        email: applicant.email || '',
        role: opportunity?.role || opportunity?.title || 'Unknown Role',
        jobType: opportunity?.type || 'Not specified',
        uploads,
        appliedOn: new Date(applicant.appliedDate || applicant.createdAt).toLocaleDateString(),
        status: applicant.status,
        score: Math.floor(Math.random() * 10) + 1, // Generate score for display
        scoreColor: applicant.status === 'REJECTED' ? 'text-red-500' : 
                   applicant.status === 'SHORTLISTED' ? 'text-green-600' : 
                   'text-yellow-500',
        opportunityId: applicant.opportunityId,
        opportunityTitle: opportunity?.title || opportunity?.role
      };
    });

    const response = NextResponse.json({
      success: true,
      data: {
        applicants: enhancedApplicants,
        total: enhancedApplicants.length,
        opportunities: opportunities.length
      },
      timestamp: new Date().toISOString()
    });

    // Add caching headers
    response.headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    response.headers.set('X-Total-Count', enhancedApplicants.length.toString());
    
    return response;

  } catch (error) {
    console.error('Error fetching all applicants:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch applicants',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
} 