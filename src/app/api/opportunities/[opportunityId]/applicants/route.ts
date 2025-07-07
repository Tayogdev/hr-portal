/**
 * @api {get} /api/opportunities/:opportunityId/applicants Get Opportunity Applicants
 * @apiVersion 1.0.0
 * @apiDescription Fetches paginated list of applicants for a specific opportunity with their documents and details
 * @apiParam {string} opportunityId The ID of the opportunity
 * @apiQuery {string} [status=ALL] Filter by application status (ALL|STRONG_FIT|GOOD_FIT|REJECTED|FINAL)
 * @apiQuery {number} [page=1] Page number for pagination
 * @apiQuery {number} [limit=10] Number of items per page
 * @apiSuccess {Object} data Contains opportunity details, applicants list, and pagination info
 * @apiSuccess {Object[]} data.applicants List of applicants with their documents
 * @apiSuccess {Object} data.pagination Pagination information
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteWithRateLimit } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { DatabaseError } from 'pg';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Validate authentication with rate limiting
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const opportunityId = url.pathname.split('/')[3];

    // Validate opportunityId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(opportunityId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid opportunity ID format',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_ID',
          details: 'Opportunity ID must be a valid UUID'
        }
      }, { status: 400 });
    }

    try {
      await pool.query('SELECT NOW()');

      // First check if the opportunity exists
      const opportunityQuery = `
        SELECT id, role, title
        FROM "opportunities"
        WHERE id = $1
      `;

      const opportunityResult = await pool.query(opportunityQuery, [opportunityId]);

      if (opportunityResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Opportunity not found',
          timestamp: new Date().toISOString(),
          error: {
            code: 'NOT_FOUND',
            details: 'No opportunity found with the provided ID'
          }
        }, { status: 404 });
      }

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || 'ALL';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
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

      // Validate status parameter
      const validStatuses = ['ALL', 'STRONG_FIT', 'GOOD_FIT', 'REJECTED', 'FINAL'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          success: false,
          message: 'Invalid status parameter',
          timestamp: new Date().toISOString(),
          error: {
            code: 'INVALID_STATUS',
            details: `Status must be one of: ${validStatuses.join(', ')}`
          }
        }, { status: 400 });
      }

      let statusCondition = '';
      let mappedApplicationStatus: string | null = null; // Declare a variable to hold the mapped status

      if (status !== 'ALL') {
        mappedApplicationStatus =
          status === 'STRONG_FIT' ? 'SHORTLISTED' :
          status === 'GOOD_FIT' ? 'MAYBE' :
          status === 'REJECTED' ? 'REJECTED' :
          status === 'FINAL' ? 'FINAL' : 'PENDING';
        statusCondition = `AND oa."applicationStatus"::text = $4`;
      }

      // Check if there are any applicants for this opportunity
      const countQuery = `
        SELECT COUNT(*)
        FROM "opportunityApplicants" oa
        WHERE oa."opportunityId" = $1 ${statusCondition}
      `;

      const countParams = [opportunityId];
      if (mappedApplicationStatus) { // Push the mapped status
        countParams.push(mappedApplicationStatus);
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      if (totalCount === 0) {
        const response = NextResponse.json({
          success: true,
          message: 'No applicants found for this opportunity',
          timestamp: new Date().toISOString(),
          data: {
            opportunity: opportunityResult.rows[0],
            applicants: [],
            pagination: {
              total: 0,
              page: 1,
              totalPages: 0,
              hasMore: false
            }
          }
        });

        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        
        return response;
      }

      // If there are applicants, fetch them with all their documents
      const query = `
        SELECT
          oa.id,
          oa."userId",
          oa."opportunityId",
          oa."applicationStatus",
          oa."createdAt",
          -- Summary Documents
          oa.cv,
          oa.portfolio,
          oa.sops,
          oa.lor,
          oa."researchProposal",
          oa."coverLetter",
          -- User Details
          u.id as "userId",
          u.name,
          u.email,
          u.image
        FROM "opportunityApplicants" oa
        LEFT JOIN users u ON oa."userId" = u.id
        WHERE oa."opportunityId" = $1 ${statusCondition}
        ORDER BY oa."createdAt" DESC
        LIMIT $2 OFFSET $3
      `;

      const queryParams = [opportunityId, limit, offset];
      if (mappedApplicationStatus) { // Push the mapped status
        queryParams.push(mappedApplicationStatus);
      }

      const result = await pool.query(query, queryParams);

      const response = NextResponse.json({
        success: true,
        message: 'Successfully retrieved applicants data',
        timestamp: new Date().toISOString(),
        data: {
          opportunity: opportunityResult.rows[0],
          applicants: result.rows.map(row => ({
            id: row.id,
            userId: row.userId,
            name: row.name,
            email: row.email,
            image: row.image,
            status: row.applicationStatus, // Use row.applicationStatus directly here
            documents: {
              summary: {
                cv: row.cv,
                portfolio: row.portfolio,
                sops: row.sops,
                lor: row.lor,
                researchProposal: row.researchProposal,
                coverLetter: row.coverLetter
              }
            },
            appliedDate: row.createdAt
          })),
          pagination: {
            total: totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: offset + limit < totalCount
          }
        }
      });

      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      return response;
    } catch (error) {
      if (error instanceof DatabaseError) {
        return NextResponse.json({
          success: false,
          message: 'Database error occurred',
          timestamp: new Date().toISOString(),
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            detail: error.detail,
            table: error.table
          }
        }, { status: 500 });
      }

      return NextResponse.json({
        success: false,
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : String(error)
        }
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch applicants',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}