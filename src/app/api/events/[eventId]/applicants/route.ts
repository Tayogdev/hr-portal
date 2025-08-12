import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';

interface RegisteredEventQueryResult {
  id: string;
  userId: string;
  eventId: string;
  bookingStatus: string;
  status: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  maritalStatus: boolean | null;
  profession: string | null;
  organizationName: string | null;
  email: string | null;
  phoneNo: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  isTermsAccept: boolean;
  transactionId: string;
  lastReminderSent: string | null; // Added for reminder cooldown
  // User details from join
  userEmail: string | null;
  userName: string | null;
  userImage: string | null;
  userJoinedOn: string | null;
}

interface FormattedRegisteredUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  type: string;
  title?: string;
  tags?: string[];
  appliedDate: string;
  status: 'PENDING' | 'SHORTLISTED' | 'MAYBE' | 'REJECTED' | 'FINAL';
  score?: number;
  // Additional registration details
  profession?: string;
  organizationName?: string;
  phoneNo?: string;
  state?: string;
  country?: string;
  bookingStatus: string;
  // Questionnaire data fields
  firstName?: string;
  lastName?: string;
  gender?: string;
  maritalStatus?: boolean;
  zipCode?: string;
  lastReminderSent?: string; // Added for reminder cooldown
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await validateAPIRouteAndGetUserId(request);

    const { eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pagination parameters'
      }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({
        success: false,
        message: 'Event ID is required'
      }, { status: 400 });
    }

    // Query to fetch registered users for the specific event
    const query = `
      SELECT
        re.*,
        u.email as "userEmail",
        u.name as "userName",
        u.image as "userImage",
        u."joinedOn" as "userJoinedOn",
        COUNT(*) OVER() as total_count
      FROM "registeredEvent" re
      LEFT JOIN users u ON re."userId" = u.id
      WHERE re."eventId" = $1
      ORDER BY re."id" DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query<RegisteredEventQueryResult & { total_count: string }>(
      query, 
      [eventId, limit, offset]
    );
    
    const registeredUsers = result.rows;
    const totalCount = registeredUsers.length > 0 ? parseInt(registeredUsers[0].total_count, 10) : 0;

    const formattedUsers: FormattedRegisteredUser[] = registeredUsers.map((user) => {
      // Use user name from users table if available, otherwise use firstName + lastName from registeredEvent
      const fullName = user.userName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
      
      // Determine user type based on profession
      let userType = 'Professional';
      if (user.profession === 'STUDENT') {
        userType = 'Student';
      } else if (user.country && user.country !== 'India') {
        userType = 'Foreign National';
      }

      // Generate tags based on profession only (excluding organization name)
      const tags = [];
      if (user.profession) {
        tags.push(user.profession);
      }

      // Generate a score based on registration completeness (for demo purposes)
      let score = 5; // Base score
      if (user.firstName && user.lastName) score += 1;
      if (user.email) score += 1;
      if (user.phoneNo) score += 1;
      if (user.profession) score += 1;
      if (user.organizationName) score += 1;

      return {
        id: user.id,
        userId: user.userId,
        name: fullName,
        email: user.email || user.userEmail || 'No email provided',
        image: user.userImage || '/avatar-placeholder.png',
        type: userType,
        title: user.profession || 'Event Participant',
        tags: tags,
        appliedDate: new Date(user.userJoinedOn || Date.now()).toLocaleDateString('en-GB', {
          month: 'long',
          day: 'numeric'
        }),
        status: user.status || 'PENDING' as const, // Use the status field for approval status
        score: Math.min(score, 10), // Cap at 10
        profession: user.profession || undefined,
        organizationName: user.organizationName || undefined,
        phoneNo: user.phoneNo || undefined,
        state: user.state || undefined,
        country: user.country || undefined,
        bookingStatus: user.bookingStatus,
        // Questionnaire data fields
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        gender: user.gender || undefined,
        maritalStatus: user.maritalStatus || undefined,
        zipCode: user.zipCode || undefined,
        lastReminderSent: user.lastReminderSent || undefined,
      };
    });

    const response = NextResponse.json({
      success: true,
      message: 'Successfully retrieved registered users for event',
      data: {
        eventId,
        registeredUsers: formattedUsers,
        pagination: {
          total: totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount,
        }
      }
    });

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch registered users for event',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 