/**
 * @api {get} /api/tasks Get Assigned Tasks
 * @api {post} /api/tasks Create Assigned Task
 * @apiVersion 1.0.0
 * @apiDescription Handles CRUD operations for assigned tasks
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteWithRateLimit } from '@/lib/utils';
import { type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { EmailNotifications } from '@/lib/emailService';
import { getApplicantDataByOpportunityAndUser } from '@/lib/emailHelpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication with rate limiting
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    const applicantId = searchParams.get('applicantId');
    const status = searchParams.get('status');
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
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (opportunityId) {
      whereConditions.push(`at."opportunityId" = $${paramIndex}::uuid`);
      queryParams.push(opportunityId);
      paramIndex++;
    }

    if (applicantId) {
      whereConditions.push(`at."applicantId" = $${paramIndex}::uuid`);
      queryParams.push(applicantId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`at."status" = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*)
      FROM "assignedTasks" at
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated tasks with related data (simplified query without complex JOINs)
    const query = `
      SELECT 
        at.*
      FROM "assignedTasks" at
      ${whereClause}
      ORDER BY at."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const mainQueryParams = [...queryParams, limit, offset];
    const result = await pool.query(query, mainQueryParams);

    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved assigned tasks',
      timestamp: new Date().toISOString(),
      data: {
        tasks: result.rows.map(row => ({
          id: row.id,
          opportunityId: row.opportunityId,
          applicantId: row.applicantId,
          userId: row.userId,
          title: row.title,
          description: row.description,
          dueDate: row.dueDate,
          tags: row.tags || [],
          uploadedFileName: row.uploadedFileName,
          status: row.status,
          submissionUrl: row.submissionUrl,
          feedback: row.feedback,
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
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch assigned tasks',
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
    if (!token?.id) {
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
      title,
      description,
      dueDate,
      tags = [],
      uploadedFileName
    } = body;

    // Validate required fields
    if (!opportunityId || !applicantId || !title || !description || !dueDate) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
        timestamp: new Date().toISOString(),
        error: {
          code: 'VALIDATION_ERROR',
          details: 'opportunityId, applicantId, title, description, and dueDate are required'
        }
      }, { status: 400 });
    }

    // Validate due date
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid due date format',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INVALID_DATE',
          details: 'dueDate must be a valid ISO date string'
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

    // Insert the new task
    const insertQuery = `
      INSERT INTO "assignedTasks" (
        "opportunityId", "applicantId", "userId", "title", "description", 
        "dueDate", "tags", "uploadedFileName"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const insertResult = await pool.query(insertQuery, [
      opportunityId,
      applicantId,
      token.id, // Current user ID
      title,
      description,
      dueDate,
      tags,
      uploadedFileName
    ]);

    const newTask = insertResult.rows[0];

    // Send task assignment email notification (async, don't block response)
    setImmediate(async () => {
      try {
        const emailData = await getApplicantDataByOpportunityAndUser(opportunityId, applicantId);
        if (emailData && emailData.applicantEmail) {
          const taskEmailData = {
            ...emailData,
            taskDetails: {
              title: newTask.title,
              description: newTask.description,
              dueDate: newTask.dueDate,
              submissionFormat: 'As specified in the task description',
              contactEmail: 'hello@tayog.in'
            }
          };
          
          await EmailNotifications.sendTaskAssignedEmail(taskEmailData);
          console.log(`Task assignment email sent to ${emailData.applicantEmail} for task: ${newTask.title}`);
        } else {
          console.error('Could not fetch email data for task assignment:', { opportunityId, applicantId });
        }
      } catch (emailError) {
        console.error('Error sending task assignment email:', emailError);
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Task assigned successfully',
      timestamp: new Date().toISOString(),
      data: {
        task: {
          id: newTask.id,
          opportunityId: newTask.opportunityId,
          applicantId: newTask.applicantId,
          userId: newTask.userId,
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          tags: newTask.tags || [],
          uploadedFileName: newTask.uploadedFileName,
          status: newTask.status,
          submissionUrl: newTask.submissionUrl,
          feedback: newTask.feedback,
          createdAt: newTask.createdAt,
          updatedAt: newTask.updatedAt
        }
      }
    }, { status: 201 });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;

  } catch (error) {
    console.error('Error creating assigned task:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create assigned task',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
} 