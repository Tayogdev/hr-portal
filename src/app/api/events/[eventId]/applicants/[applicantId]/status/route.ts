import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { EmailNotifications } from '@/lib/emailService';
import pool from '@/dbconfig/dbconfig';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; applicantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { eventId, applicantId } = await params;
    const { status } = await request.json();

    if (!status || !['APPROVED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be APPROVED or DECLINED' },
        { status: 400 }
      );
    }

    // Map status values to database values
    // Use the same status values as job listing system
    const dbStatus = status === 'APPROVED' ? 'SHORTLISTED' : 'REJECTED';

    // Update the applicant status in the database
    const updateQuery = `
      UPDATE "registeredEvent" 
      SET "bookingStatus" = $1
      WHERE "eventId" = $2 AND "userId" = $3
    `;
    
    const updateResult = await pool.query(updateQuery, [dbStatus, eventId, applicantId]);
    
    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Get event and applicant details for email
    const eventQuery = `
      SELECT title, type FROM events WHERE id = $1
    `;
    const eventResult = await pool.query(eventQuery, [eventId]);
    
    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    const event = eventResult.rows[0];

    // Get applicant details for email
    const applicantQuery = `
      SELECT u.name, u.email, u."firstName", u."lastName"
      FROM users u 
      WHERE u.id = $1
    `;
    const applicantResult = await pool.query(applicantQuery, [applicantId]);
    
    if (applicantResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Applicant user not found' },
        { status: 404 }
      );
    }

    const applicant = applicantResult.rows[0];
    const applicantName = applicant.firstName && applicant.lastName 
      ? `${applicant.firstName} ${applicant.lastName}` 
      : applicant.name || 'Applicant';

    // Send email notification
    const emailData = {
      applicantName,
      applicantEmail: applicant.email,
      jobTitle: event.title,
      companyName: 'Tayog'
    };

    let emailSent = false;
    if (status === 'APPROVED') {
      emailSent = await EmailNotifications.sendShortlistedEmail(emailData);
    } else if (status === 'DECLINED') {
      emailSent = await EmailNotifications.sendRejectedEmail(emailData);
    }

    return NextResponse.json({
      success: true,
      message: `Applicant ${status.toLowerCase()} successfully`,
      data: {
        status,
        emailSent
      }
    });

  } catch (error) {
    console.error('Error updating applicant status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update applicant status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 