import pool from '@/dbconfig/dbconfig';
import { ApplicantEmailData, TaskEmailData, InterviewEmailData } from './emailService';

/**
 * Fetch applicant and opportunity data for email notifications
 */
export async function getApplicantEmailData(applicantId: string): Promise<ApplicantEmailData | null> {
  try {
    const query = `
      SELECT 
        oa.id,
        oa."userId",
        oa."opportunityId",
        oa."applicationStatus",
        u.name as "applicantName",
        u.email as "applicantEmail",
        o.role,
        o.title,
        o.department,
        o.location,
        o.stipend,
        o.description
      FROM "opportunityApplicants" oa
      LEFT JOIN users u ON oa."userId" = u.id
      LEFT JOIN opportunities o ON oa."opportunityId" = o.id
      WHERE oa.id = $1
    `;

    const result = await pool.query(query, [applicantId]);
    
    if (result.rows.length === 0) {
      console.error('Applicant not found:', applicantId);
      return null;
    }

    const row = result.rows[0];
    
    return {
      applicantName: row.applicantName || 'Valued Applicant',
      applicantEmail: row.applicantEmail,
      jobTitle: row.title || row.role || 'Position',
      companyName: 'Our Organization', // Fixed value since institute column may not exist
      opportunityData: {
        role: row.role || row.title || 'Position',
        institute: 'Our Organization', // Fixed value since institute column may not exist
        department: row.department || 'Department',
        location: row.location || 'Location',
        stipend: row.stipend || 'TBD',
        type: 'Internship' // Default since there's no opportunityType field
      }
    };
  } catch (error) {
    console.error('Error fetching applicant email data:', error);
    return null;
  }
}

/**
 * Fetch task data for email notification
 */
export async function getTaskEmailData(taskId: string): Promise<TaskEmailData | null> {
  try {
    const query = `
      SELECT 
        at.id,
        at."applicantId",
        at.title as "taskTitle",
        at.description as "taskDescription",
        at."dueDate",
        oa."userId",
        u.name as "applicantName",
        u.email as "applicantEmail",
        o.role,
        o.title,
        o.department,
        o.location,
        o.stipend
      FROM "assignedTasks" at
      LEFT JOIN "opportunityApplicants" oa ON at."applicantId" = oa.id
      LEFT JOIN users u ON oa."userId" = u.id
      LEFT JOIN opportunities o ON at."opportunityId" = o.id
      WHERE at.id = $1
    `;

    const result = await pool.query(query, [taskId]);
    
    if (result.rows.length === 0) {
      console.error('Task not found:', taskId);
      return null;
    }

    const row = result.rows[0];
    
    return {
      applicantName: row.applicantName || 'Valued Applicant',
      applicantEmail: row.applicantEmail,
      jobTitle: row.title || row.role || 'Position',
      companyName: 'Our Organization', // Fixed value since institute column may not exist
      opportunityData: {
        role: row.role || row.title || 'Position',
        institute: 'Our Organization', // Fixed value since institute column may not exist
        department: row.department || 'Department',
        location: row.location || 'Location',
        stipend: row.stipend || 'TBD',
        type: 'Internship' // Default since there's no opportunityType field
      },
      taskDetails: {
        title: row.taskTitle,
        description: row.taskDescription,
        dueDate: row.dueDate,
        submissionFormat: 'As specified in the task description',
        contactEmail: 'hello@tayog.in'
      }
    };
  } catch (error) {
    console.error('Error fetching task email data:', error);
    return null;
  }
}

/**
 * Fetch interview data for email notification
 */
export async function getInterviewEmailData(interviewId: string): Promise<InterviewEmailData | null> {
  try {
    const query = `
      SELECT 
        si.id,
        si."applicantId",
        si."scheduledDate",
        si."scheduledTime",
        si."modeOfInterview",
        si."linkAddress",
        si."interviewerName",
        si."notesForCandidate",
        oa."userId",
        u.name as "applicantName",
        u.email as "applicantEmail",
        o.role,
        o.title,
        o.department,
        o.location,
        o.stipend
      FROM "scheduledInterviews" si
      LEFT JOIN "opportunityApplicants" oa ON si."applicantId" = oa.id
      LEFT JOIN users u ON oa."userId" = u.id
      LEFT JOIN opportunities o ON si."opportunityId" = o.id
      WHERE si.id = $1
    `;

    const result = await pool.query(query, [interviewId]);
    
    if (result.rows.length === 0) {
      console.error('Interview not found:', interviewId);
      return null;
    }

    const row = result.rows[0];
    
    return {
      applicantName: row.applicantName || 'Valued Applicant',
      applicantEmail: row.applicantEmail,
      jobTitle: row.title || row.role || 'Position',
      companyName: 'Our Organization', // Fixed value since institute column may not exist
      opportunityData: {
        role: row.role || row.title || 'Position',
        institute: 'Our Organization', // Fixed value since institute column may not exist
        department: row.department || 'Department',
        location: row.location || 'Location',
        stipend: row.stipend || 'TBD',
        type: 'Internship' // Default since there's no opportunityType field
      },
      interviewDetails: {
        date: row.scheduledDate,
        time: row.scheduledTime,
        mode: row.modeOfInterview,
        link: row.linkAddress,
        interviewer: row.interviewerName,
        notes: row.notesForCandidate
      }
    };
  } catch (error) {
    console.error('Error fetching interview email data:', error);
    return null;
  }
}

/**
 * Helper function to get applicant data by applicant ID for status changes
 */
export async function getApplicantDataByApplicantId(applicantId: string): Promise<ApplicantEmailData | null> {
  return await getApplicantEmailData(applicantId);
}

/**
 * Helper function to get applicant data when we have task or interview data
 */
export async function getApplicantDataByOpportunityAndUser(opportunityId: string, applicantId: string): Promise<ApplicantEmailData | null> {
  try {
    const query = `
      SELECT 
        oa.id,
        oa."userId",
        oa."opportunityId",
        oa."applicationStatus",
        u.name as "applicantName",
        u.email as "applicantEmail",
        o.role,
        o.title,
        o.department,
        o.location,
        o.stipend
      FROM "opportunityApplicants" oa
      LEFT JOIN users u ON oa."userId" = u.id
      LEFT JOIN opportunities o ON oa."opportunityId" = o.id
      WHERE oa."opportunityId" = $1 AND oa.id = $2
    `;

    const result = await pool.query(query, [opportunityId, applicantId]);
    
    if (result.rows.length === 0) {
      console.error('Applicant not found for opportunity:', { opportunityId, applicantId });
      return null;
    }

    const row = result.rows[0];
    
    return {
      applicantName: row.applicantName || 'Valued Applicant',
      applicantEmail: row.applicantEmail,
      jobTitle: row.title || row.role || 'Position',
      companyName: 'Our Organization', // Fixed value since institute column may not exist
      opportunityData: {
        role: row.role || row.title || 'Position',
        institute: 'Our Organization', // Fixed value since institute column may not exist
        department: row.department || 'Department',
        location: row.location || 'Location',
        stipend: row.stipend || 'TBD',
        type: 'Internship' // Default since there's no opportunityType field
      }
    };
  } catch (error) {
    console.error('Error fetching applicant data by opportunity and user:', error);
    return null;
  }
} 