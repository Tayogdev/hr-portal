// src/app/all-applicants/[applicantID]/layout.tsx

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Applicant',
  description: 'Detailed applicant information and resume view',
};

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
