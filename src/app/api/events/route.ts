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

interface FormattedEvent {
  id: string;
  eventName: string;
  status: 'Live' | 'Closed';
  eventType: string;
  postedOn: string;
  dueDate: string;
  totalRegistration: number;
  active: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await validateAPIRouteAndGetUserId(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const pageId = searchParams.get('pageId');
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pagination parameters'
      }, { status: 400 });
    }

    if (!pageId) {
      return NextResponse.json({
        success: true,
        message: 'Please select a page to view events',
        data: {
          events: [],
          pagination: { total: 0, page, totalPages: 0, hasMore: false }
        }
      });
    }

    const query = `
      SELECT
        e.*,
        COUNT(*) OVER() as total_count
      FROM events e
      WHERE e."publishedBy" = $1
      ORDER BY e."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query<EventQueryResult & { total_count: string }>(query, [pageId, limit, offset]);
    const events = result.rows;
    const totalCount = events.length > 0 ? parseInt(events[0].total_count, 10) : 0;

    const formattedEvents: FormattedEvent[] = events.map((event) => ({
      id: event.id,
      eventName: event.title || 'Untitled Event',
      status: event.isVerified && new Date(event.regEndDate) > new Date() ? 'Live' : 'Closed',
      eventType: event.type || 'Event',
      postedOn: new Date(event.createdAt).toLocaleDateString('en-GB'),
      dueDate: new Date(event.regEndDate).toLocaleDateString('en-GB'),
      totalRegistration: event.participantCount || 0, // Use participantCount from events table
      active: event.isVerified && new Date(event.regEndDate) > new Date(),
    }));

    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved events',
      data: {
        events: formattedEvents,
        pagination: {
          total: totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount,
        }
      }
    });

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch events'
    }, { status: 500 });
  }
} 