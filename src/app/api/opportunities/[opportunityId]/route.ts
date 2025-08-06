import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';
import { invalidateCache } from '@/lib/cacheManager';

interface OpportunityQueryResult {
  id: string;
  role: string | null;
  title: string | null;
  department: string | null;
  location: string | null;
  description: string | null;
  stipend: string | null;
  vacancies: number;
  maxParticipants: number;
  regStartDate: string;
  regEndDate: string;
  createdAt: string;
  updatedAt: string | null;
  publishedBy: string;
  publishedType: string;
  createdByUser: string;
  pageId: string | null;
  acceptCondition: boolean | null;
  clicks: number | null;
  haveDetails: boolean | null;
  isTermsAccept: boolean;
}

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    await validateAPIRouteAndGetUserId(request);

    const { opportunityId } = await params;

    if (!opportunityId) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity ID is required'
      }, { status: 400 });
    }

    // Query to fetch specific opportunity details
    const query = `
      SELECT *
      FROM opportunities
      WHERE id = $1
    `;
    
    const result = await pool.query<OpportunityQueryResult>(query, [opportunityId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity not found'
      }, { status: 404 });
    }

    const opportunity = result.rows[0];
    
    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved opportunity details',
      data: {
        id: opportunity.id,
        role: opportunity.role || 'Untitled Role',
        title: opportunity.title || 'Untitled Opportunity',
        department: opportunity.department,
        location: opportunity.location,
        description: opportunity.description,
        stipend: opportunity.stipend,
        vacancies: opportunity.vacancies,
        maxParticipants: opportunity.maxParticipants,
        regStartDate: opportunity.regStartDate,
        regEndDate: opportunity.regEndDate,
        createdAt: opportunity.createdAt,
        updatedAt: opportunity.updatedAt,
        publishedBy: opportunity.publishedBy,
        publishedType: opportunity.publishedType,
        createdByUser: opportunity.createdByUser,
        pageId: opportunity.pageId,
        acceptCondition: opportunity.acceptCondition,
        clicks: opportunity.clicks,
        haveDetails: opportunity.haveDetails,
        isTermsAccept: opportunity.isTermsAccept,
      }
    });

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch opportunity details',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const { userId } = await validateAPIRouteAndGetUserId(request);
    const { opportunityId } = await params;

    if (!opportunityId) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      role,
      title,
      department,
      location,
      description,
      stipend,
      vacancies,
      maxParticipants,
      regStartDate,
      regEndDate
    } = body;

    // Validate required fields
    if (!role || !title || !location || !regStartDate || !regEndDate) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if user is the page owner for this opportunity
    const ownershipQuery = `
      SELECT 
        po."pageId",
        po."userId",
        po.role as ownership_role,
        po."isActive" as is_active
      FROM opportunities o
      INNER JOIN "pageOwnership" po ON o."publishedBy" = po."pageId"
      WHERE o.id = $1 AND po."userId" = $2 AND po."isActive" = true
    `;
    
    const ownershipResult = await pool.query(ownershipQuery, [opportunityId, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to edit this opportunity'
      }, { status: 403 });
    }

    // Update the opportunity
    const updateQuery = `
      UPDATE opportunities
      SET 
        role = $1,
        title = $2,
        department = $3,
        location = $4,
        description = $5,
        stipend = $6,
        vacancies = $7,
        "maxParticipants" = $8,
        "regStartDate" = $9,
        "regEndDate" = $10,
        "updatedAt" = NOW()
      WHERE id = $11
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [
      role,
      title,
      department || null,
      location,
      description || null,
      stipend,
      vacancies,
      maxParticipants,
      regStartDate,
      regEndDate,
      opportunityId
    ]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Opportunity not found'
      }, { status: 404 });
    }

    const updatedOpportunity = updateResult.rows[0];

    // Invalidate related cache
    invalidateCache.opportunity(opportunityId);

    return NextResponse.json({
      success: true,
      message: 'Opportunity updated successfully',
      data: {
        id: updatedOpportunity.id,
        role: updatedOpportunity.role,
        title: updatedOpportunity.title,
        department: updatedOpportunity.department,
        location: updatedOpportunity.location,
        description: updatedOpportunity.description,
        stipend: updatedOpportunity.stipend,
        vacancies: updatedOpportunity.vacancies,
        maxParticipants: updatedOpportunity.maxParticipants,
        regStartDate: updatedOpportunity.regStartDate,
        regEndDate: updatedOpportunity.regEndDate,
        updatedAt: updatedOpportunity.updatedAt
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update opportunity',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}