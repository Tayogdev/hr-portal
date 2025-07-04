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
import { validateAPIRoute } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { DatabaseError } from 'pg';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authError = await validateAPIRoute(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const opportunityId = url.pathname.split('/')[3];
    
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
          data: null
        }, { status: 404 });
      }

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || 'ALL';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = (page - 1) * limit;

      // Build the status condition based on ApplicationStatus enum
      let statusCondition = '';
      if (status !== 'ALL') {
        const applicationStatus = 
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
      if (status !== 'ALL') {
        countParams.push(status);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      if (totalCount === 0) {
        return NextResponse.json({
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
      if (status !== 'ALL') {
        queryParams.push(status);
      }

      const result = await pool.query(query, queryParams);
      
      return NextResponse.json({
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
            status: row.applicationStatus,
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
    } catch (error) {
      if (error instanceof DatabaseError) {
        return NextResponse.json({
          success: false,
          message: 'Database error occurred',
          timestamp: new Date().toISOString(),
          error: {
            code: error.code,
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
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 