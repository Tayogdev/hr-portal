import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const { userId } = await validateAPIRouteAndGetUserId(request);
    const { opportunityId } = await params;

    console.log('Ownership check - userId:', userId, 'opportunityId:', opportunityId);

    if (!opportunityId) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity ID is required'
      }, { status: 400 });
    }

    // First, let's check what the opportunity data looks like
    const opportunityQuery = `
      SELECT id, "publishedBy", "pageId", "createdByUser"
      FROM opportunities
      WHERE id = $1
    `;
    
    const opportunityResult = await pool.query(opportunityQuery, [opportunityId]);
    console.log('Opportunity data for ownership check:', opportunityResult.rows[0]);

    if (opportunityResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity not found'
      }, { status: 404 });
    }

    const opportunity = opportunityResult.rows[0];

    // Query to check if the current user is the page owner for this opportunity
    const query = `
      SELECT 
        po."pageId",
        po."userId",
        po.role as ownership_role,
        po."isActive" as is_active
      FROM "pageOwnership" po
      WHERE po."pageId" = $1 AND po."userId" = $2 AND po."isActive" = true
    `;
    
    const result = await pool.query(query, [opportunity.publishedBy, userId]);
    console.log('Ownership check result:', result.rows);
    
    const isOwner = result.rows.length > 0;
    const ownershipData = isOwner ? result.rows[0] : null;

    // If not owner, let's check what page ownership records exist for this user
    if (!isOwner) {
      const userOwnershipQuery = `
        SELECT "pageId", "userId", "isActive", role
        FROM "pageOwnership"
        WHERE "userId" = $1
      `;
      
      const userOwnershipResult = await pool.query(userOwnershipQuery, [userId]);
      console.log('User ownership records:', userOwnershipResult.rows);
    }

    return NextResponse.json({
      success: true,
      message: 'Ownership check completed',
      data: {
        isOwner,
        opportunityId,
        ownershipData: ownershipData ? {
          opportunityId: opportunity.id,
          pageId: ownershipData.pageId,
          userId: ownershipData.userId,
          role: ownershipData.ownership_role,
          isActive: ownershipData.is_active
        } : null
      }
    });

  } catch (error) {
    console.error('Error checking opportunity ownership:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check opportunity ownership',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 