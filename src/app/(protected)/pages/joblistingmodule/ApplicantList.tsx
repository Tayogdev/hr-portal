'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

type Document = {
  cv?: string;
  portfolio?: string;
  sops?: string;
  lor?: string;
  researchProposal?: string;
  coverLetter?: string;
};

type Applicant = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string;
  title: string;
  education: string;
  skills: string[];
  experience: string;
  status: 'PENDING' | 'SHORTLISTED' | 'MAYBE' | 'REJECTED' | 'FINAL';
  documents: {
    summary: Document;
  };
  appliedDate: string;
};

type ApplicantListProps = {
  selected: number;
  opportunityId: string;
};

export default function ApplicantList({ selected, opportunityId }: ApplicantListProps): React.JSX.Element {
  const { data: session } = useSession();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/opportunities/${opportunityId}/applicants`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Error ${response.status}: Failed to fetch applicants`);
        }

        const data = await response.json();

        if (!data.data?.applicants) {
          throw new Error('Invalid response format - missing applicants data');
        }

        setApplicants(data.data.applicants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applicants');
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId) {
      fetchApplicants();
    }
  }, [opportunityId]);

  const handleImageError = (applicantId: string) => {
    setImageError(prev => ({
      ...prev,
      [applicantId]: true
    }));
  };

  if (loading) {
    return (
      <div className="py-4 px-2 flex items-center justify-center h-40 bg-gray-50 rounded-xl shadow-inner">
        <div className="text-gray-500">Loading applicants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-2 flex items-center justify-center h-40 bg-gray-50 rounded-xl shadow-inner">
        <div className="flex flex-col items-center gap-2">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="py-4 px-2 flex items-center justify-center h-40 bg-gray-50 rounded-xl shadow-inner">
        <div className="text-gray-500">No applicants found for this opportunity</div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 flex flex-col gap-3 bg-gray-50 rounded-xl shadow-inner">
      {applicants.map((applicant, idx) => {
        const isSelected = selected === idx;
        const appliedDays = Math.floor((Date.now() - new Date(applicant.appliedDate).getTime()) / (1000 * 60 * 60 * 24));
        const showDefaultImage = imageError[applicant.id] || !applicant.image;
        
        return (
          <div
            key={applicant.id}
            className={`relative flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm border transition cursor-pointer ${
              isSelected
                ? 'border-l-4 border-[#4F8FF0] border-t border-b border-r-0 bg-[#F1F6FF]'
                : 'border border-gray-200'
            } group`}
          >
            <Image
              src="/file.svg"
              alt="logo"
              width={24}
              height={24}
              className="shrink-0"
            />

            <Image
              src={showDefaultImage ? '/avatar-placeholder.png' : applicant.image}
              alt={applicant.name || 'Applicant'}
              width={40}
              height={40}
              className="rounded-full z-10 object-cover"
              onError={() => handleImageError(applicant.id)}
            />

            <div className="flex-1 z-10">
              <div className="font-bold text-gray-800 text-base mb-0.5">
                {applicant.name || 'Anonymous Applicant'}
              </div>
              <div className="text-xs text-gray-500 mb-1">{applicant.email}</div>
              <div className="text-xs text-gray-400">
                Applied {appliedDays} {appliedDays === 1 ? 'day' : 'days'} ago
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 z-10">
              <div className={`text-xs font-bold ${
                applicant.status === 'SHORTLISTED' ? 'text-green-600' :
                applicant.status === 'MAYBE' ? 'text-yellow-600' :
                applicant.status === 'REJECTED' ? 'text-red-600' :
                applicant.status === 'FINAL' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {applicant.status}
              </div>
              {applicant.documents.summary.cv && (
                <div className="text-xs text-gray-400">CV Attached</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
