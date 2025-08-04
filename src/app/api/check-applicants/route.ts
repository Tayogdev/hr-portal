/**
 * @api {get} /api/check-applicants Check Applicants Table Status
 * @apiVersion 1.0.0
 * @apiDescription Diagnostic endpoint to check the status and structure of the opportunityApplicants table
 * @apiSuccess {Object} data Contains table information and recent applications
 * @apiSuccess {Object} data.tableInfo Information about table structure
 * @apiSuccess {Object} data.applications Recent applications and status distribution
 */

import { NextResponse } from 'next/server';
import pool from '@/dbconfig/dbconfig';
import { validateAPIRoute } from '@/lib/utils';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authError = await validateAPIRoute(request);
    if (authError) return authError;

    // Check if table exists first
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'opportunityApplicants'
      );
    `;
    const tableExists = await pool.query(tableExistsQuery);
    
    if (!tableExists.rows[0].exists) {
      return NextResponse.json({
        success: false,
        message: 'Table opportunityApplicants does not exist',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Check table structure
    const tableStructureQuery = `
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'opportunityApplicants'
      ORDER BY ordinal_position;
    `;

    // Get sample data with related information
    const sampleDataQuery = `
      SELECT 
        oa.id,
        oa."userId",
        u.name as user_name,
        oa."opportunityId",
        o.role as opportunity_role,
        oa."applicationStatus",
        oa."createdAt",
        -- Summary Documents
        CASE WHEN oa.cv IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.portfolio IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.sops IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.lor IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."researchProposal" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."coverLetter" IS NOT NULL THEN 1 ELSE 0 END as summary_docs_count,
        -- Identification Documents
        CASE WHEN oa.aadhar IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.pan IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."drivingLicence" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."voterId" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.passport IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."birthCertificate" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."nationalId" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.pci IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa.visa IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."workPermit" IS NOT NULL THEN 1 ELSE 0 END as identification_docs_count,
        -- Academic Documents
        CASE WHEN oa."tenthMarksheet" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."tenthCertificate" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."twelfthMarksheet" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."twelfthCertificate" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."diplomaCerficate" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."graduationMarksheet" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."graduationCertificate" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."pgMarksheet" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."pgCertificate" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN oa."phdCertificate" IS NOT NULL THEN 1 ELSE 0 END as academic_docs_count
      FROM "opportunityApplicants" oa
      LEFT JOIN users u ON oa."userId" = u.id
      LEFT JOIN opportunities o ON oa."opportunityId" = o.id
      ORDER BY oa."createdAt" DESC
      LIMIT 5;
    `;

    // Get counts by status
    const statusCountQuery = `
      SELECT 
        "applicationStatus",
        COUNT(*) as count
      FROM "opportunityApplicants"
      GROUP BY "applicationStatus";
    `;

    // Execute all queries
    const [structureResult, sampleResult, statusResult] = await Promise.all([
      pool.query(tableStructureQuery),
      pool.query(sampleDataQuery),
      pool.query(statusCountQuery)
    ]);

    return NextResponse.json({
      success: true,
      message: 'API executed successfully! OpportunityApplicants table data retrieved.',
      timestamp: new Date().toISOString(),
      data: {
        tableInfo: {
          totalColumns: structureResult.rows.length,
          hasData: sampleResult.rows.length > 0,
          structure: structureResult.rows
        },
        applications: {
          recentApplications: sampleResult.rows,
          statusDistribution: statusResult.rows,
          totalRecent: sampleResult.rows.length
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking opportunityApplicants table:', error);
    return NextResponse.json({
      success: false,
      message: 'API execution failed',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : String(error)
      }
    }, { status: 500 });
  }
} 
