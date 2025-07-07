/**
 * @api {get} /api/tasks/[taskId] Get Task by ID
 * @api {put} /api/tasks/[taskId] Update Task
 * @api {delete} /api/tasks/[taskId] Delete Task
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
  { params }: { params: { taskId: string } }
) {
  try {
    const authError = await validateAPIRouteWithRateLimit(request);
    if (authError) return authError;

    const { taskId } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Task ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Get task with related data
    const query = `
      SELECT 
        at.*,
        oa."userId" as "applicantUserId",
        applicant_user.name as "applicantName",
        applicant_user.email as "applicantEmail",
        o.role as "opportunityRole",
        o.title as "opportunityTitle"
      FROM "assignedTasks" at
      LEFT JOIN "opportunityApplicants" oa ON at."applicantId" = oa.id
      LEFT JOIN users applicant_user ON oa."userId" = applicant_user.id
      LEFT JOIN opportunities o ON at."opportunityId" = o.id
      WHERE at.id = $1
    `;

    const result = await pool.query(query, [taskId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Task not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified task does not exist' }
      }, { status: 404 });
    }

    const task = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Task retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        task: {
          id: task.id,
          opportunityId: task.opportunityId,
          applicantId: task.applicantId,
          userId: task.userId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          tags: task.tags || [],
          uploadedFileName: task.uploadedFileName,
          status: task.status,
          submissionUrl: task.submissionUrl,
          feedback: task.feedback,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          applicantName: task.applicantName,
          applicantEmail: task.applicantEmail,
          opportunityRole: task.opportunityRole,
          opportunityTitle: task.opportunityTitle
        }
      }
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch task',
      timestamp: new Date().toISOString(),
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) }
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;
    const body = await request.json();
    const { title, description, dueDate, tags, status, submissionUrl, feedback } = body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Task ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Check if task exists
    const existsResult = await pool.query('SELECT id FROM "assignedTasks" WHERE id = $1', [taskId]);
    if (existsResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Task not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified task does not exist' }
      }, { status: 404 });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      updateValues.push(title);
      paramIndex++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(description);
      paramIndex++;
    }
    if (dueDate !== undefined) {
      updateFields.push(`"dueDate" = $${paramIndex}`);
      updateValues.push(dueDate);
      paramIndex++;
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramIndex}`);
      updateValues.push(tags);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(status);
      paramIndex++;
    }
    if (submissionUrl !== undefined) {
      updateFields.push(`"submissionUrl" = $${paramIndex}`);
      updateValues.push(submissionUrl);
      paramIndex++;
    }
    if (feedback !== undefined) {
      updateFields.push(`feedback = $${paramIndex}`);
      updateValues.push(feedback);
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
    updateValues.push(taskId);

    const updateQuery = `
      UPDATE "assignedTasks" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    const updatedTask = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      timestamp: new Date().toISOString(),
      data: {
        task: {
          id: updatedTask.id,
          opportunityId: updatedTask.opportunityId,
          applicantId: updatedTask.applicantId,
          userId: updatedTask.userId,
          title: updatedTask.title,
          description: updatedTask.description,
          dueDate: updatedTask.dueDate,
          tags: updatedTask.tags || [],
          uploadedFileName: updatedTask.uploadedFileName,
          status: updatedTask.status,
          submissionUrl: updatedTask.submissionUrl,
          feedback: updatedTask.feedback,
          createdAt: updatedTask.createdAt,
          updatedAt: updatedTask.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update task',
      timestamp: new Date().toISOString(),
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) }
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
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

    const { taskId } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid task ID format',
        timestamp: new Date().toISOString(),
        error: { code: 'INVALID_UUID', details: 'Task ID must be a valid UUID' }
      }, { status: 400 });
    }

    // Delete the task
    const deleteQuery = 'DELETE FROM "assignedTasks" WHERE id = $1 RETURNING id, title';
    const result = await pool.query(deleteQuery, [taskId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Task not found',
        timestamp: new Date().toISOString(),
        error: { code: 'NOT_FOUND', details: 'The specified task does not exist' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
      timestamp: new Date().toISOString(),
      data: {
        deletedTask: {
          id: result.rows[0].id,
          title: result.rows[0].title
        }
      }
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete task',
      timestamp: new Date().toISOString(),
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) }
    }, { status: 500 });
  }
} 