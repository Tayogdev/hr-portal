import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; applicantId: string }>}
) {
  try {
    const { eventId, applicantId } = await params;
    const { bookingStatus } = await request.json();
    


    // Validate booking status
    if (!['PENDING', 'SUCCESS', 'FAILED'].includes(bookingStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking status' },
        { status: 400 }
      );
    }

    

    // Update the registered event with new booking status
    const updateQuery = `
      UPDATE "registeredEvent" 
      SET "bookingStatus" = $1
      WHERE "id" = $2 AND "eventId" = $3
    `;
    
    const updateResult = await pool.query(updateQuery, [bookingStatus, applicantId, eventId]);
    
    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { bookingStatus, applicantId, eventId }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string; applicantId: string } }
) {
  try {
    const { eventId, applicantId } = params;

    // Get the current payment status
    const query = `
      SELECT "bookingStatus", "transactionId", "updatedAt"
      FROM "registeredEvent" 
      WHERE "id" = $1 AND "eventId" = $2
    `;
    
    const result = await pool.query(query, [applicantId, eventId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
} 