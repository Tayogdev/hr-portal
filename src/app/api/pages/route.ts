import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import pool from '@/dbconfig/dbconfig';

export async function GET(req: NextRequest) {
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

    // 🗂️ Step 1: Get all page IDs that the user owns
const ownershipRes = await pool.query(
  `SELECT "pageId" FROM "pageOwnership" WHERE "userId" = $1`,
  [userId]
);



    const pageIds = ownershipRes.rows.map(row => row.pageId);

    if (pageIds.length === 0) {
      return NextResponse.json({
        success: true,
        pages: [],
        total: 0,
      });
    }

    // 📄 Step 2: Fetch page details
 const pagesRes = await pool.query(
  `SELECT id, title, "uName", logo, type
   FROM pages
   WHERE id = ANY($1::text[])
   ORDER BY "createdAt" DESC`,
  [pageIds]
);



    return NextResponse.json({
      success: true,
      pages: pagesRes.rows,
      total: pagesRes.rows.length,
    });
  } catch (error) {
    console.error("❌ Error fetching owned pages:", error);
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
