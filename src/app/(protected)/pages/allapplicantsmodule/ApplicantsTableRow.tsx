//ApplicantTableRow.tsx: Displays one applicant row.
'use client';
import React from 'react';
import Image from 'next/image';

interface ApplicantProps {
  applicant: {
    name: string;
    role: string;
    jobType: string;
    uploads: number;
    appliedOn: string;
    status: string;
    score: number;
    scoreColor: string;
    statusColor: string;
  };
}

export default function ApplicantsTableRow({ applicant }: ApplicantProps) {
  return (
    <div className="grid grid-cols-7 gap-4 items-center border-b py-4 px-3 text-sm">
      <div className="flex items-center gap-3">
        <Image
          src="/avatar-placeholder.png"
          alt="Avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div>
          <div className="font-medium text-gray-900">{applicant.name}</div>
          <div className="text-gray-500 text-xs">Applied 26 days ago</div>
          <div className={`text-xs font-semibold ${applicant.scoreColor}`}>
            Score: {applicant.score}
          </div>
        </div>
      </div>
      <div className="text-gray-700">{applicant.role}</div>
      <div className="text-gray-700">{applicant.jobType}</div>
      <div className="text-gray-700">{applicant.uploads} files</div>
      <div className="text-gray-700">{applicant.appliedOn}</div>
      <div>
        <button className={`px-3 py-1 text-sm rounded-md ${applicant.statusColor}`}>
          {applicant.status}
        </button>
      </div>
      <div>
        <button className="bg-[#4F8FF0] hover:bg-[#3B77D3] text-white px-4 py-2 rounded-md text-sm">
          Review Application
        </button>
      </div>
    </div>
  );
}
