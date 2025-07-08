import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Listing Details',
  description: 'View and manage job applicants',
};

export default function JobListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F8F9FC] min-h-screen">
      {children}
    </div>
  );
}
