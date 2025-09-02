export interface ApplicantProfile {
  id: string;
  name: string;
  image: string;
  type: string;
  title: string;
  tags: string[];
  appliedDate: string;
  score: number;
  status: "PENDING" | "SHORTLISTING" | "REJECTED" | "HOLD" | "FINAL";
  assignedTask?: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
  };
  scheduledInterview?: {
    id: string;
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  };
  resumePath?: string;
  email?: string;
  phoneNo?: string;
  state?: string;
  country?: string;
  bookingStatus?: string;
  userId?: string;
  // Questionnaire data fields
  firstName?: string;
  lastName?: string;
  gender?: string;
  maritalStatus?: boolean;
  profession?: string;
  organizationName?: string;
  zipCode?: string;
}

export interface EventDetails {
  id: string;
  title: string;
  type: string;
  isOnline: boolean;
  createdAt: string;
  regEndDate: string;
  description: string;
  startDate: string;
  endDate: string;
  regStartDate: string;
  seat: number;
  price: number;
  website?: string;
  email?: string;
  contact?: string;
}

export interface QuestionnaireData {
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
  lastUpdated?: string;
}

export interface TaskDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface InterviewDetails {
  date: string;
  time: string;
  interviewer: string;
  mode: string;
  link?: string;
  notes?: string;
}

export type TabType = "all" | "final" | "approved" | "hold";
export type ApprovedSubTabType = "all" | "paid" | "pending";
export type ActiveSectionType =
  | "none"
  | "profile"
  | "resume"
  | "contact"
  | "files"
  | "taskDetails"
  | "interviewDetails"
  | "applicantDetails";

export interface EventDetailPageProps {
  eventId: string;
}

export interface EventStats {
  allRegistrations: number;
  finalAttendees: number;
  approvedApplicants: number;
}
