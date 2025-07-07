export interface ApplicantDocument {
  cv?: string;
  portfolio?: string;
  sops?: string;
  lor?: string;
  researchProposal?: string;
  coverLetter?: string;
  aadhar?: string;
  pan?: string;
  drivingLicence?: string;
  voterId?: string;
  passport?: string;
  birthCertificate?: string;
  nationalId?: string;
  pci?: string;
  visa?: string;
  workPermit?: string;
  cast?: string;
  ews?: string;
  pwd?: string;
  income?: string;
  domicile?: string;
  tenthMarksheet?: string;
  tenthCertificate?: string;
  twelfthMarksheet?: string;
  twelfthCertificate?: string;
  diplomaCerficate?: string;
  graduationMarksheet?: string;
  graduationCertificate?: string;
  pgMarksheet?: string;
  pgCertificate?: string;
  phdCertificate?: string;
  courseCompletionCertificate?: string;
  torCertificate?: string;
  offerLetter?: string;
  experienceCertificate?: string;
  bankPassbook?: string;
  salaryDetails?: string;
}

export interface ApplicantProfile {
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
  assignedTask?: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
  };
  scheduledInterview?: {
    date: string;
    time: string;
    interviewer: string;
    mode: string;
    link?: string;
    notes?: string;
  };
}

export interface OpportunityDetails {
  id: string;
  role?: string;
  title?: string;
  institute?: string;
  department?: string;
  location?: string;
  stipend?: string;
  description?: string;
  regStartDate: string;
  regEndDate: string;
  maxParticipants: number;
  vacancies: number;
}

export interface ApplicantsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    opportunity: OpportunityDetails;
    applicants: ApplicantProfile[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
} 