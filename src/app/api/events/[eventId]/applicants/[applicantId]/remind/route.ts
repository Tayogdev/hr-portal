import { NextRequest, NextResponse } from 'next/server';
import { EmailNotifications } from '@/lib/emailService';
import pool from '@/dbconfig/dbconfig';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; applicantId: string }> }
) {
  try {
    const { eventId, applicantId } = await params;

    // Get event details
    const eventQuery = `
      SELECT title, type
      FROM events 
      WHERE id = $1
    `;
    const eventResult = await pool.query(eventQuery, [eventId]);
    
    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    const event = eventResult.rows[0];

    // Get applicant details
    const registrationQuery = `
      SELECT "userId" FROM "registeredEvent" WHERE "id" = $1 AND "eventId" = $2
    `;
    const registrationResult = await pool.query(registrationQuery, [applicantId, eventId]);
    
    if (registrationResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Applicant not found for this event' },
        { status: 404 }
      );
    }

    const userId = registrationResult.rows[0].userId;
    
    const applicantQuery = `
      SELECT u.name, u.email
      FROM users u 
      WHERE u.id = $1
    `;
    const applicantResult = await pool.query(applicantQuery, [userId]);
    
    if (applicantResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const applicant = applicantResult.rows[0];
    const applicantName = applicant.name || 'Applicant';
    const applicantEmail = applicant.email;

    if (!applicantEmail) {
      return NextResponse.json(
        { success: false, message: 'Applicant email not found' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData = {
      applicantName,
      applicantEmail,
      jobTitle: event.title,
      companyName: 'Tayog',
      eventDetails: {
        title: event.title,
        type: event.type || 'Event',
        location: 'Hyderabad, India (Online)', // Default to online for events
        department: 'Department of Design, IIT Hyderabad', // Default department
        paymentLink: `https://tayog.in/payment/${eventId}/${applicantId}` // You can customize this payment link
      }
    };

    // Send payment request email
    const emailSent = await EmailNotifications.sendPaymentRequestEmail(emailData);
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Payment reminder sent successfully',
        data: {
          emailSent: true,
          recipient: applicantEmail
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 