export type ApplicantDocument = {
  cv?: string;
  portfolio?: string;
  coverLetter?: string;
  // Add other document types as needed
};

export type Applicant = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  title?: string;
  education?: string;
  skills?: string[];
  experience?: string;
  status: 'PENDING' | 'SHORTLISTED' | 'MAYBE' | 'REJECTED' | 'FINAL';
  documents: ApplicantDocument;
  appliedDate: Date;
};

export type ApplicantsResponse = {
  applicants: Applicant[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}; 