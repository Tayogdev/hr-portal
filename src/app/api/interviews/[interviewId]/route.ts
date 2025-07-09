/**
 * @api {get} /api/interviews/[interviewId] Get Interview by ID
 * @api {put} /api/interviews/[interviewId] Update Interview
 * @api {delete} /api/interviews/[interviewId] Delete Interview
 * @apiVersion 1.0.0
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteWithRateLimit } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { interviewId: string } }
) {
  try {
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const { interviewId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(interviewId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid interview ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Interview ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Get interview with related data
    const query = `
      SELECT 
        si.*,
        oa."userId" as "applicantUserId",
        applicant_user.name as "applicantName",
        applicant_user.email as "applicantEmail",
        o.role as "opportunityRole",
        o.title as "opportunityTitle"
      FROM "scheduledInterviews" si
      LEFT JOIN "opportunityApplicants" oa ON si."applicantId" = oa.id
      LEFT JOIN users applicant_user ON oa."userId" = applicant_user.id
      LEFT JOIN opportunities o ON si."opportunityId" = o.id
      WHERE si.id = $1
    `;

    const result = await pool.query(query, [interviewId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified interview does not exist' }
      }, { status: 404 });
    }

    const interview = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Interview retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        interview: {
          id: interview.id,
          opportunityId: interview.opportunityId,
          applicantId: interview.applicantId,
          scheduledBy: interview.scheduledBy,
          interviewerId: interview.interviewerId,
          interviewerName: interview.interviewerName,
          scheduledDate: interview.scheduledDate,
          scheduledTime: interview.scheduledTime,
          modeOfInterview: interview.modeOfInterview,
          linkAddress: interview.linkAddress,
          notesForCandidate: interview.notesForCandidate,
          status: interview.status,
          actualStartTime: interview.actualStartTime,
          actualEndTime: interview.actualEndTime,
          interviewFeedback: interview.interviewFeedback,
          rating: interview.rating,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
          applicantName: interview.applicantName,
          applicantEmail: interview.applicantEmail,
          opportunityRole: interview.opportunityRole,
          opportunityTitle: interview.opportunityTitle
        }
      }
    });

  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch interview',
      timestamp: new Date().toISOString(),
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) }
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { interviewId: string } }
) {
  try {
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({
        success: false,
        message: 'User ID not found in token',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_TOKEN', details: 'User ID is required' }
      }, { status: 401 });
    }

    const { interviewId } = await params;
    const body = await request.json();
    const {
      interviewerId,
      interviewerName,
      scheduledDate,
      scheduledTime,
      modeOfInterview,
      linkAddress,
      notesForCandidate,
      status,
      actualStartTime,
      actualEndTime,
      interviewFeedback,
      rating
    } = body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(interviewId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid interview ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Interview ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Check if interview exists
    const existsResult = await pool.query('SELECT id FROM "scheduledInterviews" WHERE id = $1', [interviewId]);
    if (existsResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified interview does not exist' }
      }, { status: 404 });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (interviewerId !== undefined) {
      updateFields.push(`"interviewerId" = $${paramIndex}`);
      updateValues.push(interviewerId);
      paramIndex++;
    }
    if (interviewerName !== undefined) {
      updateFields.push(`"interviewerName" = $${paramIndex}`);
      updateValues.push(interviewerName);
      paramIndex++;
    }
    if (scheduledDate !== undefined) {
      updateFields.push(`"scheduledDate" = $${paramIndex}`);
      updateValues.push(scheduledDate);
      paramIndex++;
    }
    if (scheduledTime !== undefined) {
      updateFields.push(`"scheduledTime" = $${paramIndex}`);
      updateValues.push(scheduledTime);
      paramIndex++;
    }
    if (modeOfInterview !== undefined) {
      updateFields.push(`"modeOfInterview" = $${paramIndex}`);
      updateValues.push(modeOfInterview);
      paramIndex++;
    }
    if (linkAddress !== undefined) {
      updateFields.push(`"linkAddress" = $${paramIndex}`);
      updateValues.push(linkAddress);
      paramIndex++;
    }
    if (notesForCandidate !== undefined) {
      updateFields.push(`"notesForCandidate" = $${paramIndex}`);
      updateValues.push(notesForCandidate);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(status);
      paramIndex++;
    }
    if (actualStartTime !== undefined) {
      updateFields.push(`"actualStartTime" = $${paramIndex}`);
      updateValues.push(actualStartTime);
      paramIndex++;
    }
    if (actualEndTime !== undefined) {
      updateFields.push(`"actualEndTime" = $${paramIndex}`);
      updateValues.push(actualEndTime);
      paramIndex++;
    }
    if (interviewFeedback !== undefined) {
      updateFields.push(`"interviewFeedback" = $${paramIndex}`);
      updateValues.push(interviewFeedback);
      paramIndex++;
    }
    if (rating !== undefined) {
      updateFields.push(`rating = $${paramIndex}`);
      updateValues.push(rating);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No fields to update',
        timestamp: new Date().toISOString(),
        error: { code: 'VALIDATION_ERROR', details: 'At least one field must be provided for update' }
      }, { status: 400 });
    }

    // Add updatedAt
    updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    updateValues.push(interviewId);

    const updateQuery = `
      UPDATE "scheduledInterviews" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    const updatedInterview = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
      timestamp: new Date().toISOString(),
      data: {
        interview: {
          id: updatedInterview.id,
          opportunityId: updatedInterview.opportunityId,
          applicantId: updatedInterview.applicantId,
          scheduledBy: updatedInterview.scheduledBy,
          interviewerId: updatedInterview.interviewerId,
          interviewerName: updatedInterview.interviewerName,
          scheduledDate: updatedInterview.scheduledDate,
          scheduledTime: updatedInterview.scheduledTime,
          modeOfInterview: updatedInterview.modeOfInterview,
          linkAddress: updatedInterview.linkAddress,
          notesForCandidate: updatedInterview.notesForCandidate,
          status: updatedInterview.status,
          actualStartTime: updatedInterview.actualStartTime,
          actualEndTime: updatedInterview.actualEndTime,
          interviewFeedback: updatedInterview.interviewFeedback,
          rating: updatedInterview.rating,
          createdAt: updatedInterview.createdAt,
          updatedAt: updatedInterview.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update interview',
      timestamp: new Date().toISOString(),
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) }
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { interviewId: string } }
) {
  try {
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({
        success: false,
        message: 'User ID not found in token',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_TOKEN', details: 'User ID is required' }
      }, { status: 401 });
    }

    const { interviewId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(interviewId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid interview ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Interview ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Delete the interview
    const deleteQuery = 'DELETE FROM "scheduledInterviews" WHERE id = $1 RETURNING id, "scheduledDate", "scheduledTime"';
    const result = await pool.query(deleteQuery, [interviewId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified interview does not exist' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Interview deleted successfully',
      timestamp: new Date().toISOString(),
      data: {
        deletedInterview: {
          id: result.rows[0].id,
          scheduledDate: result.rows[0].scheduledDate,
          scheduledTime: result.rows[0].scheduledTime
        }
      }
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete interview',
      timestamp: new Date().toISOString(),
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) }
    }, { status: 500 });
  }
} 