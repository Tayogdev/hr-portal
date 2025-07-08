/**
 * @api {put} /api/opportunities/applicants/[applicantId]/status Update Applicant Status
 * @apiVersion 1.0.0
 * @apiDescription Updates the application status of a specific applicant
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteWithRateLimit } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicantId: string }> }
) {
  try {
    const { applicantId } = await params;
    
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) {
      return authError;
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({
        success: false,
        message: 'User ID not found in token',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_TOKEN', details: 'User ID is required' }
      }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(applicantId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid applicant ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Applicant ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['PENDING', 'SHORTLISTED', 'MAYBE', 'REJECTED', 'FINAL'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status',
        timestamp: new Date().toISOString(),
        error: { 
          code: 'INVALID_STATUS', 
          details: `Status must be one of: ${validStatuses.join(', ')}`
        }
      }, { status: 400 });
    }

    // Check if applicant exists
    const existsResult = await pool.query(
      'SELECT id, "applicationStatus" FROM "opportunityApplicants" WHERE id = $1',
      [applicantId]
    );
    
    if (existsResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Applicant not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified applicant does not exist' }
      }, { status: 404 });
    }

    const oldStatus = existsResult.rows[0].applicationStatus;

    // Update applicant status
    const updateQuery = `
      UPDATE "opportunityApplicants" 
      SET "applicationStatus" = $1
      WHERE id = $2
      RETURNING id, "applicationStatus", "createdAt"
    `;

    const result = await pool.query(updateQuery, [status, applicantId]);
    const updatedApplicant = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Applicant status updated successfully',
      timestamp: new Date().toISOString(),
      data: {
        applicant: {
          id: updatedApplicant.id,
          applicationStatus: updatedApplicant.applicationStatus,
          updatedAt: updatedApplicant.createdAt
        },
        changes: {
          from: oldStatus,
          to: status
        }
      }
    });

  } catch (error) {
    console.error('Error updating applicant status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update applicant status',
      timestamp: new Date().toISOString(),
      error: { 
        code: 'INTERNAL_ERROR', 
        details: error instanceof Error ? error.message : String(error) 
      }
    }, { status: 500 });
  }
} 

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicantId: string }> }
) {
  try {
    const { applicantId } = await params;
    
    // Check if applicant exists
    const result = await pool.query(
      'SELECT id, "applicationStatus", "createdAt" FROM "opportunityApplicants" WHERE id = $1',
      [applicantId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Applicant not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Applicant found',
      timestamp: new Date().toISOString(),
      data: {
        applicant: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error getting applicant status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get applicant status',
      timestamp: new Date().toISOString(),
      error: { 
        code: 'INTERNAL_ERROR', 
        details: error instanceof Error ? error.message : String(error) 
      }
    }, { status: 500 });
  }
} 