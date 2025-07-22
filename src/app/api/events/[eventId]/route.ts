import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';

interface EventQueryResult {
  id: string;
  title: string | null;
  type: string | null;
  isOnline: boolean;
  seat: number;
  participantCount: number;
  view: number;
  isVerified: boolean;
  price: number;
  currencyId: number | null;
  foreignPrice: number;
  fCurrencyId: number | null;
  isIncluded: boolean | null;
  isRefundable: boolean;
  isTermsAccepted: boolean | null;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  startDate: string;
  endDate: string;
  regStartDate: string;
  regEndDate: string;
  description: string;
  sessionLink: string | null;
  publishedBy: string;
  website: string | null;
  email: string | null;
  contact: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await validateAPIRouteAndGetUserId(request);

    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json({
        success: false,
        message: 'Event ID is required'
      }, { status: 400 });
    }

    // Query to fetch specific event details
    const query = `
      SELECT *
      FROM events
      WHERE id = $1
    `;
    
    const result = await pool.query<EventQueryResult>(query, [eventId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Event not found'
      }, { status: 404 });
    }

    const event = result.rows[0];

    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved event details',
      data: {
        id: event.id,
        title: event.title || 'Untitled Event',
        type: event.type || 'Event',
        isOnline: event.isOnline,
        seat: event.seat,
        participantCount: event.participantCount,
        view: event.view,
        isVerified: event.isVerified,
        price: event.price,
        foreignPrice: event.foreignPrice,
        isRefundable: event.isRefundable,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        publishedAt: event.publishedAt,
        startDate: event.startDate,
        endDate: event.endDate,
        regStartDate: event.regStartDate,
        regEndDate: event.regEndDate,
        description: event.description,
        sessionLink: event.sessionLink,
        publishedBy: event.publishedBy,
        website: event.website,
        email: event.email,
        contact: event.contact,
      }
    });

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch event details',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 