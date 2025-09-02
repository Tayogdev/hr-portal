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
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch event details',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { userId } = await validateAPIRouteAndGetUserId(request);
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json({
        success: false,
        message: 'Event ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      regStartDate,
      regEndDate,
      website,
      email,
      contact
    } = body;

    // Validate required fields
    if (!title || !startDate || !endDate || !regStartDate || !regEndDate) {
      return NextResponse.json({
        success: false,
        message: 'Event title and all dates are required'
      }, { status: 400 });
    }

    // Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regStart = new Date(regStartDate);
    const regEnd = new Date(regEndDate);

    // Registration should start before it ends
    if (regStart >= regEnd) {
      return NextResponse.json({
        success: false,
        message: 'Registration start date must be before registration end date'
      }, { status: 400 });
    }

    // Event should start before it ends
    if (start >= end) {
      return NextResponse.json({
        success: false,
        message: 'Event start date must be before event end date'
      }, { status: 400 });
    }

    // Registration should start before event ends (allow registration during event)
    if (regStart >= end) {
      return NextResponse.json({
        success: false,
        message: 'Registration should start before the event ends'
      }, { status: 400 });
    }

    // Check if user is the page owner for this event
    const ownershipQuery = `
      SELECT 
        po."pageId",
        po."userId",
        po.role as ownership_role,
        po."isActive" as is_active
      FROM events e
      INNER JOIN "pageOwnership" po ON e."publishedBy" = po."pageId"
      WHERE e.id = $1 AND po."userId" = $2 AND po."isActive" = true
    `;
    
    const ownershipResult = await pool.query(ownershipQuery, [eventId, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to edit this event'
      }, { status: 403 });
    }

    // Update the event with date fields
    const updateQuery = `
      UPDATE events
      SET 
        title = $1,
        description = $2,
        "startDate" = $3,
        "endDate" = $4,
        "regStartDate" = $5,
        "regEndDate" = $6,
        website = $7,
        email = $8,
        contact = $9,
        "updatedAt" = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [
      title,
      description || '',
      startDate,
      endDate,
      regStartDate,
      regEndDate,
      website || null,
      email || null,
      contact || null,
      eventId
    ]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Event not found'
      }, { status: 404 });
    }

    const updatedEvent = updateResult.rows[0];


    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
        regStartDate: updatedEvent.regStartDate,
        regEndDate: updatedEvent.regEndDate,
        website: updatedEvent.website,
        email: updatedEvent.email,
        contact: updatedEvent.contact,
        updatedAt: updatedEvent.updatedAt
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update event',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 