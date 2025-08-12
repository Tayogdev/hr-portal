import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();
    
    // Validate log data
    if (!logData.level || !logData.message || !logData.timestamp) {
      return NextResponse.json(
        { success: false, message: 'Invalid log data' },
        { status: 400 }
      );
    }

    // Log the received data using our server-side logger
    const { level, message, context, timestamp, userAgent, url } = logData;
    
    logger.info('Client-side log received', 'LogAPI', {
      level,
      message,
      context,
      timestamp,
      userAgent,
      url,
    });

    // In production, you might want to:
    // 1. Store logs in a database
    // 2. Send to external logging service (Sentry, LogRocket, etc.)
    // 3. Send to monitoring service (DataDog, New Relic, etc.)
    // 4. Trigger alerts for critical errors

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Error processing log request', error as Error, 'LogAPI');
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve recent logs (for debugging)
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or for authorized users
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Not available in production' },
        { status: 403 }
      );
    }

    const recentLogs = logger.getRecentLogs(50);
    
    return NextResponse.json({
      success: true,
      logs: recentLogs,
    });

  } catch (error) {
    logger.error('Error retrieving logs', error as Error, 'LogAPI');
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
