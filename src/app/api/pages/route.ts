import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import pool from '@/dbconfig/dbconfig';

export async function GET() {
  try {
    // 🧠 Get logged-in user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Optimized query: Get pages with ownership in one query
    const pagesRes = await pool.query(
      `SELECT p.id, p.title, p."uName", p.logo, p.type
       FROM pages p
       INNER JOIN "pageOwnership" po ON p.id = po."pageId"
       WHERE po."userId" = $1
       ORDER BY p."createdAt" DESC`,
      [userId]
    );

    const response = NextResponse.json({
      success: true,
      pages: pagesRes.rows,
      total: pagesRes.rows.length,
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching pages.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
