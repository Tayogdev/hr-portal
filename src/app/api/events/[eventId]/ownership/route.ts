import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';

export async function GET(
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

    // Query to check if the current user is the page owner for this event
    const query = `
      SELECT 
        e.id as event_id,
        e."publishedBy" as event_page_id,
        po."userId" as owner_user_id,
        po.role as ownership_role,
        po."isActive" as is_active
      FROM events e
      INNER JOIN "pageOwnership" po ON e."publishedBy" = po."pageId"
      WHERE e.id = $1 AND po."userId" = $2 AND po."isActive" = true
      LIMIT 1
    `;
    
    const result = await pool.query(query, [eventId, userId]);
    
    const isOwner = result.rows.length > 0;
    const ownershipData = isOwner ? result.rows[0] : null;

    return NextResponse.json({
      success: true,
      message: 'Ownership check completed',
      data: {
        isOwner,
        eventId,
        ownershipData: ownershipData ? {
          eventId: ownershipData.event_id,
          pageId: ownershipData.event_page_id,
          userId: ownershipData.owner_user_id,
          role: ownershipData.ownership_role,
          isActive: ownershipData.is_active
        } : null
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check event ownership',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 