/**
 * @api {get} /api/interviews Get Scheduled Interviews
 * @api {post} /api/interviews Create Scheduled Interview
 * @apiVersion 1.0.0
 * @apiDescription Handles CRUD operations for scheduled interviews
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteWithRateLimit } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication with rate limiting
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    const applicantId = searchParams.get('applicantId');
    const interviewerId = searchParams.get('interviewerId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
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

    // Build WHERE clause dynamically
    const whereConditions: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (opportunityId) {
      whereConditions.push(`si."opportunityId" = $${paramIndex}::uuid`);
      queryParams.push(opportunityId);
      paramIndex++;
    }

    if (applicantId) {
      whereConditions.push(`si."applicantId" = $${paramIndex}::uuid`);
      queryParams.push(applicantId);
      paramIndex++;
    }

    if (interviewerId) {
      whereConditions.push(`si."interviewerId" = $${paramIndex}::uuid`);
      queryParams.push(interviewerId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`si."status" = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (fromDate) {
      whereConditions.push(`si."scheduledDate" >= $${paramIndex}`);
      queryParams.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      whereConditions.push(`si."scheduledDate" <= $${paramIndex}`);
      queryParams.push(toDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*)
      FROM "scheduledInterviews" si
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated interviews with related data (simplified query without complex JOINs)
    const query = `
      SELECT 
        si.*
      FROM "scheduledInterviews" si
      ${whereClause}
      ORDER BY si."scheduledDate" ASC, si."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const mainQueryParams = [...queryParams, limit, offset];
    const result = await pool.query(query, mainQueryParams);

    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved scheduled interviews',
      timestamp: new Date().toISOString(),
      data: {
        interviews: result.rows.map(row => ({
          id: row.id,
          opportunityId: row.opportunityId,
          applicantId: row.applicantId,
          scheduledBy: row.scheduledBy,
          interviewerId: row.interviewerId,
          interviewerName: row.interviewerName,
          scheduledDate: row.scheduledDate,
          scheduledTime: row.scheduledTime,
          modeOfInterview: row.modeOfInterview,
          linkAddress: row.linkAddress,
          notesForCandidate: row.notesForCandidate,
          status: row.status,
          actualStartTime: row.actualStartTime,
          actualEndTime: row.actualEndTime,
          interviewFeedback: row.interviewFeedback,
          rating: row.rating,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
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
    console.error('Error fetching scheduled interviews:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch scheduled interviews',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication with rate limiting
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    // Get the current user from the token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({
        success: false,
        message: 'User ID not found in token',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_TOKEN',
          details: 'User ID is required but not found in authentication token'
        }
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      opportunityId,
      applicantId,
      interviewerId,
      interviewerName,
      scheduledDate,
      scheduledTime,
      modeOfInterview,
      linkAddress,
      notesForCandidate
    } = body;

    // Validate required fields
    if (!opportunityId || !applicantId || !scheduledDate || !scheduledTime || !modeOfInterview) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
        timestamp: new Date().toISOString(),
        error: {
          code: 'VALIDATION_ERROR',
          details: 'opportunityId, applicantId, scheduledDate, scheduledTime, and modeOfInterview are required'
        }
      }, { status: 400 });
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(opportunityId) || !uuidRegex.test(applicantId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid UUID format',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_UUID',
          details: 'opportunityId and applicantId must be valid UUIDs'
        }
      }, { status: 400 });
    }

    if (interviewerId && !uuidRegex.test(interviewerId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid interviewer ID format',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_UUID',
          details: 'interviewerId must be a valid UUID'
        }
      }, { status: 400 });
    }

    // Validate scheduled date
    const scheduledDateObj = new Date(scheduledDate);
    if (isNaN(scheduledDateObj.getTime())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid scheduled date format',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_DATE',
          details: 'scheduledDate must be a valid ISO date string'
        }
      }, { status: 400 });
    }

    // Validate that the interview is not in the past
    if (scheduledDateObj < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'Cannot schedule interview in the past',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_DATE',
          details: 'Interview must be scheduled for a future date and time'
        }
      }, { status: 400 });
    }

    // Check if opportunity and applicant exist - optimized query
    const checkQuery = `
      SELECT 
        EXISTS(SELECT 1 FROM opportunities WHERE id = $1) as opportunity_exists,
        EXISTS(SELECT 1 FROM "opportunityApplicants" WHERE id = $2) as applicant_exists
    `;

    const checkResult = await pool.query(checkQuery, [opportunityId, applicantId]);
    const check = checkResult.rows[0];
    
    if (!check.opportunity_exists || !check.applicant_exists) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity or applicant not found',
        timestamp: new Date().toISOString(),
        error: {
          code: 'NOT_FOUND',
          details: 'The specified opportunity or applicant does not exist'
        }
      }, { status: 404 });
    }

    // Skip user existence check for OAuth users since we removed foreign key constraints
    // The interviewerId can be any valid OAuth ID now

    // Insert the new interview
    const insertQuery = `
      INSERT INTO "scheduledInterviews" (
        "opportunityId", "applicantId", "scheduledBy", "interviewerId", "interviewerName",
        "scheduledDate", "scheduledTime", "modeOfInterview", "linkAddress", "notesForCandidate"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const insertResult = await pool.query(insertQuery, [
      opportunityId,
      applicantId,
      token.sub, // Current user ID (scheduledBy)
      interviewerId || null,
      interviewerName || null,
      scheduledDate,
      scheduledTime,
      modeOfInterview,
      linkAddress || null,
      notesForCandidate || null
    ]);

    const newInterview = insertResult.rows[0];

    const response = NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      timestamp: new Date().toISOString(),
      data: {
        interview: {
          id: newInterview.id,
          opportunityId: newInterview.opportunityId,
          applicantId: newInterview.applicantId,
          scheduledBy: newInterview.scheduledBy,
          interviewerId: newInterview.interviewerId,
          interviewerName: newInterview.interviewerName,
          scheduledDate: newInterview.scheduledDate,
          scheduledTime: newInterview.scheduledTime,
          modeOfInterview: newInterview.modeOfInterview,
          linkAddress: newInterview.linkAddress,
          notesForCandidate: newInterview.notesForCandidate,
          status: newInterview.status,
          actualStartTime: newInterview.actualStartTime,
          actualEndTime: newInterview.actualEndTime,
          interviewFeedback: newInterview.interviewFeedback,
          rating: newInterview.rating,
          createdAt: newInterview.createdAt,
          updatedAt: newInterview.updatedAt
        }
      }
    }, { status: 201 });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;

  } catch (error) {
    console.error('Error creating scheduled interview:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to schedule interview',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
} 