import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Check if user exists in database
    const checkUserQuery = `
      SELECT 
        id, 
        name, 
        email, 
        "userVerified", 
        "accountStatus", 
        "isDeleted",
        "joinedOn"
      FROM users 
      WHERE email = $1 AND ("isDeleted" = false OR "isDeleted" IS NULL)
    `;
    
    const result = await pool.query(checkUserQuery, [email]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found in database',
        registered: false,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    const user = result.rows[0];

    // Check account status
    if (user.accountStatus !== 0) {
      return NextResponse.json({
        success: false,
        message: `User account is ${user.accountStatus === 1 ? 'suspended' : 'inactive'}`,
        registered: true,
        accountActive: false, 
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'User is registered and active',
      registered: true,
      accountActive: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userVerified: user.userVerified,
        joinedOn: user.joinedOn
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify user',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 