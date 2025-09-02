'use client';

import React from 'react';
import Image from 'next/image';

export default function JobDetailsHeader(): React.JSX.Element {
  const job = {
    title: 'User Experience and Research Intern',
    company: 'Tech Japan',
    remote: true,
    needs: '0/1',
    posted: '08.07.2024',
    closing: '19.08.2024',
    status: 'Live',
  };

  return (
    <div className="bg-white border-b px-8 pt-4 pb-0 flex flex-col gap-2">
      {/* Breadcrumbs */}
      <div className="text-xs text-gray-400 mb-2">
        Job listing &gt; User Experience ... &gt; Shortlisted Applicants
      </div>

      {/* Job Info Card */}
      <div className="flex items-start gap-4 w-full">
        <div className="flex-1 flex items-center border border-[#4F8FF0] rounded-md p-3 bg-white min-w-0">
          <Image
            src="/file.svg"
            alt="logo"
            width={40}
            height={40}
            className="mr-3"
          />
          <div className="min-w-0">
            <div className="text-lg font-bold text-gray-800 truncate">{job.title}</div>
            <div className="text-gray-500 text-xs">
              {job.company} . {job.remote ? 'Remote' : 'Onsite'} . Needs {job.needs}
            </div>
            <div className="text-xs text-gray-400">
              Posted on {job.posted} . Closing on {job.closing}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
            {job.status}
          </span>
          <button className="border border-gray-300 rounded px-3 py-1 text-sm font-medium">Job Details</button>
          <button className="text-gray-400 hover:text-gray-600 text-xl px-2 py-1 rounded-full">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M7 9h4M9 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
