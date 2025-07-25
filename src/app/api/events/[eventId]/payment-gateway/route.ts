import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';

interface PaymentGatewayConfig {
  gateway: 'stripe' | 'razorpay' | 'paypal' | 'custom';
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  currency: string;
  isEnabled: boolean;
}

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
        message: 'You do not have permission to access this event'
      }, { status: 403 });
    }

    // Get payment gateway configuration for this event
    const configQuery = `
      SELECT payment_gateway_config
      FROM events
      WHERE id = $1
    `;
    
    const configResult = await pool.query(configQuery, [eventId]);
    
    if (configResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Event not found'
      }, { status: 404 });
    }

    const config = configResult.rows[0].payment_gateway_config || {
      gateway: 'stripe',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      currency: 'INR',
      isEnabled: false
    };

    return NextResponse.json({
      success: true,
      message: 'Payment gateway configuration retrieved successfully',
      data: config
    });

  } catch (error) {
    console.error('Error retrieving payment gateway config:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve payment gateway configuration',
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
    const config: PaymentGatewayConfig = body;

    // Validate required fields
    if (config.isEnabled) {
      if (!config.gateway) {
        return NextResponse.json({
          success: false,
          message: 'Payment gateway type is required when enabled'
        }, { status: 400 });
      }

      if (!config.apiKey || !config.secretKey) {
        return NextResponse.json({
          success: false,
          message: 'API key and secret key are required when payment gateway is enabled'
        }, { status: 400 });
      }

      if (!config.currency) {
        return NextResponse.json({
          success: false,
          message: 'Currency is required when payment gateway is enabled'
        }, { status: 400 });
      }
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

    // Update payment gateway configuration
    const updateQuery = `
      UPDATE events
      SET 
        payment_gateway_config = $1,
        "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [
      JSON.stringify(config),
      eventId
    ]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Event not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment gateway configuration updated successfully',
      data: config
    });

  } catch (error) {
    console.error('Error updating payment gateway config:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update payment gateway configuration',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 