import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { randomBytes } from 'crypto';

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number; email: string }>();

export async function POST(request: NextRequest) {
  try {
    const { credential, verificationCode } = await request.json();

    if (!credential || !verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Credential and verification code are required' },
        { status: 400 }
      );
    }

    // Check if verification code exists and is valid
    const storedData = verificationCodes.get(credential);
    if (!storedData) {
      return NextResponse.json(
        { success: false, error: 'Invalid credential or verification code expired' },
        { status: 400 }
      );
    }

    if (storedData.code !== verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(credential);
      return NextResponse.json(
        { success: false, error: 'Verification code expired' },
        { status: 400 }
      );
    }

    // Verify user exists in database
    const result = await pool.query(
      'SELECT id, "uName" AS uname, name, email, role, image, "accountStatus" FROM users WHERE email = $1 OR "uName" = $1',
      [storedData.email]
    );

    const user = result.rows[0];
    if (!user || user.accountStatus !== 0) {
      return NextResponse.json(
        { success: false, error: 'User not found or account not active' },
        { status: 400 }
      );
    }

    // Clean up verification code
    verificationCodes.delete(credential);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        uName: user.uname,
        role: user.role,
        image: user.image,
        isRegistered: true
      }
    });

  } catch (error) {
    console.error('Credential verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate verification code endpoint
export async function PUT(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential is required' },
        { status: 400 }
      );
    }

    // Check if user exists with this credential
    const result = await pool.query(
      'SELECT email, name FROM users WHERE email = $1 OR "uName" = $1',
      [credential]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found with this credential' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store verification code
    verificationCodes.set(credential, {
      code,
      expires,
      email: user.email
    });

    // TODO: Send email with verification code
    // For now, we'll just log it (in production, implement email sending)
    console.log(`Verification code for ${user.email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      // In development, return the code for testing
      ...(process.env.NODE_ENV === 'development' && { code })
    });

  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
