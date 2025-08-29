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
    


    if (!status || !['APPROVED', 'DECLINED', 'REJECTED', 'HOLD'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be APPROVED, DECLINED, REJECTED, or HOLD' },
        { status: 400 }
      );
    }

    // The status field already exists in the registeredEvent table

    // Map status values to database values
    // const dbStatus = status === 'APPROVED' ? 'SHORTLISTED' : status === 'HOLD' ? 'HOLD' : 'REJECTED';
    let dbStatus: string;
     switch (status) {
      case 'APPROVED':
        dbStatus = 'SHORTLISTING';
        break;
      case 'HOLD':
        dbStatus = 'HOLD';
        break;
      case 'REJECTED':
        dbStatus = 'REJECTED';
        break;
      default:
        dbStatus = 'REJECTED';
     }

    // Update the applicant status in the database
    // applicantId is the registration ID (id field from registeredEvent table)
    const updateQuery = `
      UPDATE "registeredEvent" 
      SET "bookingStatus" = $1
      WHERE "eventId" = $2 AND "id" = $3
    `;
    

    const updateResult = await pool.query(updateQuery, [dbStatus, eventId, applicantId]);
    
        if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Applicant not found. No matching registration found.' },
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
    let emailSent = false;
    
    try {
      const registrationQuery = `
        SELECT "userId" FROM "registeredEvent" WHERE "id" = $1 AND "eventId" = $2
      `;
      const registrationResult = await pool.query(registrationQuery, [applicantId, eventId]);
      
      if (registrationResult.rows.length > 0) {
        const userId = registrationResult.rows[0].userId;
        
        const applicantQuery = `
          SELECT u.name, u.email
          FROM users u 
          WHERE u.id = $1
        `;
        const applicantResult = await pool.query(applicantQuery, [userId]);
        
        if (applicantResult.rows.length > 0) {
          const applicant = applicantResult.rows[0];
          const applicantName = applicant.name || 'Applicant';

          // Send email notification
          const emailData = {
            applicantName,
            applicantEmail: applicant.email,
            jobTitle: event.title,
            companyName: 'Tayog'
          };

          if (status === 'APPROVED') {
            emailSent = await EmailNotifications.sendShortlistedEmail(emailData);
          } else if (status === 'REJECTED' || status === 'DECLINED') {
            emailSent = await EmailNotifications.sendRejectedEmail(emailData);
          }
          // No email sent for HOLD status
        }
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue without email notification
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