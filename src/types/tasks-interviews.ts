// Types for Assigned Tasks and Scheduled Interviews

export interface AssignedTask {
  id: string;
  opportunityId: string;
  applicantId: string;
  userId: string; // User who assigned the task
  title: string;
  description: string;
  dueDate: string; // ISO string
  tags: string[];
  uploadedFileName?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  submissionUrl?: string | null;
  feedback?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ScheduledInterview {
  id: string;
  opportunityId: string;
  applicantId: string;
  scheduledBy: string; // User who scheduled the interview
  interviewerId?: string | null; // User who will conduct the interview
  interviewerName?: string | null; // Fallback if interviewer is not a user in system
  scheduledDate: string; // ISO string
  scheduledTime: string; // e.g., "9:00 AM"
  modeOfInterview: string; // Google Meet, Zoom, Microsoft Teams, In-person
  linkAddress?: string | null; // Meeting link or physical address
  notesForCandidate?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  actualStartTime?: string | null; // ISO string
  actualEndTime?: string | null; // ISO string
  interviewFeedback?: string | null;
  rating?: number | null; // 1-10 scale
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// API Request/Response types for Assigned Tasks
export interface CreateTaskRequest {
  opportunityId: string;
  applicantId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  tags: string[];
  uploadedFileName?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string; // ISO string
  tags?: string[];
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  submissionUrl?: string | null;
  feedback?: string | null;
}

export interface TasksApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    tasks: AssignedTask[];
    pagination?: {
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

export interface SingleTaskApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    task: AssignedTask;
  };
}

// API Request/Response types for Scheduled Interviews
export interface CreateInterviewRequest {
  opportunityId: string;
  applicantId: string;
  interviewerId?: string | null;
  interviewerName?: string | null;
  scheduledDate: string; // ISO string
  scheduledTime: string; // e.g., "9:00 AM"
  modeOfInterview: string;
  linkAddress?: string | null;
  notesForCandidate?: string | null;
}

export interface UpdateInterviewRequest {
  interviewerId?: string | null;
  interviewerName?: string | null;
  scheduledDate?: string; // ISO string
  scheduledTime?: string;
  modeOfInterview?: string;
  linkAddress?: string | null;
  notesForCandidate?: string | null;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  interviewFeedback?: string | null;
  rating?: number | null;
}

export interface InterviewsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    interviews: ScheduledInterview[];
    pagination?: {
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

export interface SingleInterviewApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    interview: ScheduledInterview;
  };
}

// Frontend component integration types (matching existing component props)
export interface TaskDetailsFromModal {
  title: string;
  description: string;
  dueDate: string; // datetime-local format from input
  tags: string[];
  uploadedFileName: string | null;
}

export interface InterviewDetailsFromModal {
  selectedDate: Date | undefined;
  selectedTime: string;
  notesForCandidate: string;
  assignInterviewer: string; // This will be interviewerName
  modeOfInterview: string;
  linkAddress: string;
}

// Extended types to include tasks and interviews in applicant profiles
export interface ApplicantWithTasksAndInterviews {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  status: 'PENDING' | 'SHORTLISTED' | 'MAYBE' | 'REJECTED' | 'FINAL';
  documents: {
    summary: {
      cv?: string;
      portfolio?: string;
      sops?: string;
      lor?: string;
      researchProposal?: string;
      coverLetter?: string;
    };
  };
  appliedDate: string;
  score?: number;
  tags?: string[];
  title?: string;
  assignedTasks?: AssignedTask[]; // Multiple tasks can be assigned
  scheduledInterviews?: ScheduledInterview[]; // Multiple interviews can be scheduled
} 