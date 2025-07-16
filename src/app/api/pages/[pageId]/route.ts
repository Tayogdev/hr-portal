import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRoute } from '@/lib/utils';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authError = await validateAPIRoute(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const pageId = url.pathname.split('/')[3]; // Get pageId from URL path

    // Validate pageId format
    if (!pageId) {
      return NextResponse.json({
        success: false,
        message: 'Page ID is required',
        timestamp: new Date().toISOString(),
        error: {
          code: 'MISSING_PAGE_ID',
          details: 'Page ID must be provided'
        }
      }, { status: 400 });
    }

    // Fetch the page details
    const query = `
      SELECT id, title, "uName", type, description, location, "creatorName", "officialLink", "employeeSize", logo, "bannerImage", "createdAt", "updatedAt"
      FROM pages
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [pageId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Page not found',
        timestamp: new Date().toISOString(),
        error: {
          code: 'PAGE_NOT_FOUND',
          details: 'No page found with the provided ID'
        }
      }, { status: 404 });
    }

    const page = result.rows[0];
    
    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved page details',
      timestamp: new Date().toISOString(),
      data: {
        page: {
          id: page.id,
          title: page.title,
          uName: page.uName,
          type: page.type,
          description: page.description,
          location: page.location,
          creatorName: page.creatorName,
          officialLink: page.officialLink,
          employeeSize: page.employeeSize,
          logo: page.logo,
          bannerImage: page.bannerImage,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch page details',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
} 