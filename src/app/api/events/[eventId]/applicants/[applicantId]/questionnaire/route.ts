import { NextRequest, NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRouteAndGetUserId } from '@/lib/utils';

interface QuestionnaireData {
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
  eventId: string;
  userId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; applicantId: string }> }
) {
  try {
    await validateAPIRouteAndGetUserId(request);

    const { eventId, applicantId } = await params;

    if (!eventId || !applicantId) {
      return NextResponse.json({
        success: false,
        message: 'Event ID and Applicant ID are required'
      }, { status: 400 });
    }

    // Query to fetch applicant data directly from registeredEvent table
    const query = `
      SELECT 
        "firstName",
        "lastName",
        "gender",
        "maritalStatus",
        "profession",
        "organizationName",
        "email",
        "phoneNo",
        "state",
        "country",
        "zipCode",
        "eventId",
        "userId"
      FROM "registeredEvent"
      WHERE "eventId" = $1 AND "userId" = $2
      LIMIT 1
    `;
    
    const result = await pool.query<QuestionnaireData>(query, [eventId, applicantId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Applicant data not found for this applicant'
      }, { status: 404 });
    }

    const questionnaireData = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved applicant data',
      data: {
        firstName: questionnaireData.firstName,
        lastName: questionnaireData.lastName,
        gender: questionnaireData.gender,
        maritalStatus: questionnaireData.maritalStatus,
        profession: questionnaireData.profession,
        organizationName: questionnaireData.organizationName,
        email: questionnaireData.email,
        phoneNo: questionnaireData.phoneNo,
        state: questionnaireData.state,
        country: questionnaireData.country,
        zipCode: questionnaireData.zipCode,
        eventId: questionnaireData.eventId,
        userId: questionnaireData.userId,
        lastUpdated: new Date().toISOString(),
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch questionnaire data',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 