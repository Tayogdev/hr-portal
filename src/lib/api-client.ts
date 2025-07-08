// API client utilities for tasks and interviews

import { 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CreateInterviewRequest, 
  UpdateInterviewRequest,
  TasksApiResponse,
  SingleTaskApiResponse,
  InterviewsApiResponse,
  SingleInterviewApiResponse
} from '@/types/tasks-interviews';

// Base API configuration
const API_BASE = '';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Generic API call function
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Task API functions
export const taskAPI = {
  // Get all tasks with optional filters
  getTasks: async (params?: {
    opportunityId?: string;
    applicantId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<TasksApiResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.opportunityId) searchParams.set('opportunityId', params.opportunityId);
    if (params?.applicantId) searchParams.set('applicantId', params.applicantId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;
    
    return apiCall<TasksApiResponse>(endpoint);
  },

  // Get single task by ID
  getTask: async (taskId: string): Promise<SingleTaskApiResponse> => {
    return apiCall<SingleTaskApiResponse>(`/api/tasks/${taskId}`);
  },

  // Create new task
  createTask: async (taskData: CreateTaskRequest): Promise<SingleTaskApiResponse> => {
    return apiCall<SingleTaskApiResponse>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update existing task
  updateTask: async (taskId: string, updates: UpdateTaskRequest): Promise<SingleTaskApiResponse> => {
    return apiCall<SingleTaskApiResponse>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<{ success: boolean; message: string }> => {
    return apiCall<{ success: boolean; message: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// Interview API functions
export const interviewAPI = {
  // Get all interviews with optional filters
  getInterviews: async (params?: {
    opportunityId?: string;
    applicantId?: string;
    interviewerId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<InterviewsApiResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.opportunityId) searchParams.set('opportunityId', params.opportunityId);
    if (params?.applicantId) searchParams.set('applicantId', params.applicantId);
    if (params?.interviewerId) searchParams.set('interviewerId', params.interviewerId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/interviews${queryString ? `?${queryString}` : ''}`;
    
    return apiCall<InterviewsApiResponse>(endpoint);
  },

  // Get single interview by ID
  getInterview: async (interviewId: string): Promise<SingleInterviewApiResponse> => {
    return apiCall<SingleInterviewApiResponse>(`/api/interviews/${interviewId}`);
  },

  // Create new interview
  createInterview: async (interviewData: CreateInterviewRequest): Promise<SingleInterviewApiResponse> => {
    return apiCall<SingleInterviewApiResponse>('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  // Update existing interview
  updateInterview: async (interviewId: string, updates: UpdateInterviewRequest): Promise<SingleInterviewApiResponse> => {
    return apiCall<SingleInterviewApiResponse>(`/api/interviews/${interviewId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete interview
  deleteInterview: async (interviewId: string): Promise<{ success: boolean; message: string }> => {
    return apiCall<{ success: boolean; message: string }>(`/api/interviews/${interviewId}`, {
      method: 'DELETE',
    });
  },
};

// Helper functions for frontend integration
export const apiHelpers = {
  // Convert frontend task details to API request format
  convertTaskDetailsToRequest: (
    taskDetails: { title: string; description: string; dueDate: string; tags: string[]; uploadedFileName: string | null },
    opportunityId: string,
    applicantId: string
  ): CreateTaskRequest => ({
    opportunityId,
    applicantId,
    title: taskDetails.title,
    description: taskDetails.description,
    dueDate: taskDetails.dueDate,
    tags: taskDetails.tags,
    uploadedFileName: taskDetails.uploadedFileName,
  }),

  // Convert frontend interview details to API request format
  convertInterviewDetailsToRequest: (
    interviewDetails: {
      selectedDate: Date | undefined;
      selectedTime: string;
      notesForCandidate: string;
      assignInterviewer: string;
      modeOfInterview: string;
      linkAddress: string;
    },
    opportunityId: string,
    applicantId: string
  ): CreateInterviewRequest => {
    if (!interviewDetails.selectedDate) {
      throw new Error('Interview date is required');
    }

    return {
      opportunityId,
      applicantId,
      interviewerName: interviewDetails.assignInterviewer,
      scheduledDate: interviewDetails.selectedDate.toISOString(),
      scheduledTime: interviewDetails.selectedTime,
      modeOfInterview: interviewDetails.modeOfInterview,
      linkAddress: interviewDetails.linkAddress || null,
      notesForCandidate: interviewDetails.notesForCandidate || null,
    };
  },

  // Get tasks for a specific applicant
  getTasksForApplicant: async (opportunityId: string, applicantId: string) => {
    return taskAPI.getTasks({ opportunityId, applicantId });
  },

  // Get interviews for a specific applicant
  getInterviewsForApplicant: async (opportunityId: string, applicantId: string) => {
    return interviewAPI.getInterviews({ opportunityId, applicantId });
  },

  // Format date for display
  formatDateForDisplay: (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  },

  // Format datetime for display
  formatDateTimeForDisplay: (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  },
}; 