import { NextRequest, NextResponse } from 'next/server';
import { EmailNotifications } from '@/lib/emailService';
import pool from '@/dbconfig/dbconfig';
import logger from '@/lib/logger';

// Helper function to test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection test failed', error as Error, 'RemindAPI');
    return false;
  }
}

// Helper function to execute query with retry
async function executeQueryWithRetry(query: string, params: (string | number)[], maxRetries = 3) {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      lastError = error;
      logger.error(`Database query attempt ${attempt} failed`, error as Error, 'RemindAPI', {
        query,
        params,
        attempt,
        maxRetries,
      });
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        
        // Test connection before retry
        const isConnected = await testDatabaseConnection();
        if (!isConnected) {
          logger.warn('Database connection lost, attempting to reconnect', 'RemindAPI');
          // Wait a bit longer for reconnection
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }
  
  throw lastError;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; applicantId: string }> }
) {
  try {
    const { eventId, applicantId } = await params;

    logger.info('Payment reminder request received', 'RemindAPI', {
      eventId,
      applicantId,
    });

    // Test database connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      logger.error('Database connection unavailable', undefined, 'RemindAPI', {
        eventId,
        applicantId,
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection unavailable. Please try again in a few moments.',
          error: 'Database connection failed'
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Get event details with retry
    const eventQuery = `
      SELECT title, type
      FROM events 
      WHERE id = $1
    `;
    const eventResult = await executeQueryWithRetry(eventQuery, [eventId]);
    
    if (eventResult.rows.length === 0) {
      logger.warn('Event not found', 'RemindAPI', { eventId });
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    const event = eventResult.rows[0];

    // Get applicant details with retry
    const registrationQuery = `
      SELECT "userId" FROM "registeredEvent" WHERE "id" = $1 AND "eventId" = $2
    `;
    const registrationResult = await executeQueryWithRetry(registrationQuery, [applicantId, eventId]);
    
    if (registrationResult.rows.length === 0) {
      logger.warn('Applicant not found for event', 'RemindAPI', { eventId, applicantId });
      return NextResponse.json(
        { success: false, message: 'Applicant not found for this event' },
        { status: 404 }
      );
    }

    const registration = registrationResult.rows[0];
    const userId = registration.userId;
    
    // Get user details with retry
    const applicantQuery = `
      SELECT u.name, u.email
      FROM users u 
      WHERE u.id = $1
    `;
    const applicantResult = await executeQueryWithRetry(applicantQuery, [userId]);
    
    if (applicantResult.rows.length === 0) {
      logger.warn('User not found', 'RemindAPI', { userId });
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const applicant = applicantResult.rows[0];
    const applicantName = applicant.name || 'Applicant';
    const applicantEmail = applicant.email;

    if (!applicantEmail) {
      logger.warn('Applicant email not found', 'RemindAPI', { userId, applicantName });
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

    logger.info('Sending payment reminder email', 'RemindAPI', {
      eventId,
      applicantId,
      applicantEmail,
      eventTitle: event.title,
    });

    // Send payment request email
    const emailSent = await EmailNotifications.sendPaymentRequestEmail(emailData);
    
    if (emailSent) {
      logger.info('Payment reminder sent successfully', 'RemindAPI', {
        eventId,
        applicantId,
        applicantEmail,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Payment reminder sent successfully',
        data: {
          emailSent: true,
          recipient: applicantEmail
        }
      });
    } else {
      logger.error('Failed to send email', undefined, 'RemindAPI', {
        eventId,
        applicantId,
        applicantEmail,
      });
      
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Error sending payment reminder', error as Error, 'RemindAPI', {
      eventId: (await params).eventId,
      applicantId: (await params).applicantId,
    });
    
    // Provide specific error messages based on error type
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Connection terminated') || error.message.includes('connection timeout')) {
        errorMessage = 'Database connection timeout. Please try again.';
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes('connection') && error.message.includes('terminated')) {
        errorMessage = 'Database connection lost. Please try again.';
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
        statusCode = 408; // Request Timeout
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined,
        retryAfter: statusCode === 503 ? 30 : undefined // Suggest retry after 30 seconds for connection issues
      },
      { status: statusCode }
    );
  }
} 