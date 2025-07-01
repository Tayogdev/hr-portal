'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type Job = {
  id: number;
  role: string;
  status: 'Live' | 'Closed' | 'Completed';
  type: string;
  posted: string;
  due: string;
  applicants: number;
  needs: string;
  action: string;
  active: boolean;
};

const jobs: Job[] = [
  {
    id: 1,
    role: 'User Experience and Research Intern',
    status: 'Live',
    type: 'Internship',
    posted: '08.07.2024',
    due: '19.08.2024',
    applicants: 80,
    needs: '0 / 1',
    action: 'Review Applicants',
    active: true,
  },
  {
    id: 2,
    role: 'User Interface Design Intern',
    status: 'Live',
    type: 'Internship',
    posted: '08.07.2024',
    due: '19.08.2024',
    applicants: 260,
    needs: '0 / 4',
    action: 'Review Applicants',
    active: true,
  },
  {
    id: 3,
    role: 'Software Development',
    status: 'Closed',
    type: 'Full Time',
    posted: '08.11.2023',
    due: '08.02.2024',
    applicants: 620,
    needs: '4 / 4',
    action: 'Completed',
    active: false,
  },
  {
    id: 4,
    role: 'AI ML & Machine Learning Engineer',
    status: 'Closed',
    type: 'Internship',
    posted: '08.01.2024',
    due: '08.02.2024',
    applicants: 206,
    needs: '3 / 4',
    action: 'Completed',
    active: false,
  },
  {
    id: 5,
    role: 'AI ML & Machine Learning Engineer',
    status: 'Closed',
    type: 'Full Time',
    posted: '08.1.2023',
    due: '08.02.2024',
    applicants: 602,
    needs: '4 / 4',
    action: 'Completed',
    active: false,
  },
];

export default function JobListingPage(): React.JSX.Element {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [jobStatuses, setJobStatuses] = useState<{ [key: number]: 'Live' | 'Closed' }>({});

  const handleStatusChange = (jobId: number, newStatus: 'Live' | 'Closed') => {
    setJobStatuses(prev => ({ ...prev, [jobId]: newStatus }));
    setOpenDropdownId(null);
  };

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Job Listing</h1>
          <p className="text-gray-500">
            Here is your job listing from 3rd Nov 2023 to 17th Aug 2024
          </p>
        </div>
        <div className="text-gray-500">
          3rd Nov 2023 to 17th Aug 2024
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#4A5568] text-white">
              <th className="px-6 py-4 text-left font-medium">Job Role</th>
              <th className="px-6 py-4 text-left font-medium">Status</th>
              <th className="px-6 py-4 text-left font-medium">Job Type</th>
              <th className="px-6 py-4 text-left font-medium">Posted on</th>
              <th className="px-6 py-4 text-left font-medium">Due Date</th>
              <th className="px-6 py-4 text-left font-medium">Applicants</th>
              <th className="px-6 py-4 text-left font-medium">Needs</th>
              <th className="px-6 py-4 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const isDisabled = !job.active;
              const currentStatus = jobStatuses[job.id] || job.status;
              
              return (
                <tr
                  key={job.id}
                  className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${
                    isDisabled ? 'bg-gray-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                        <Image
                          src="/job-icon.png"
                          alt="Job Icon"
                          width={20}
                          height={20}
                        />
                      </div>
                      <span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {job.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === job.id ? null : job.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currentStatus === 'Live'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {currentStatus}
                      <span className="ml-1">▼</span>
                    </button>
                    {openDropdownId === job.id && (
                      <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => handleStatusChange(job.id, 'Live')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Live
                          </button>
                          <button
                            onClick={() => handleStatusChange(job.id, 'Closed')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Closed
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {job.type}
                  </td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {job.posted}
                  </td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {job.due}
                  </td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {job.applicants}
                  </td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {job.needs}
                  </td>
                  <td className="px-6 py-4">
                    {job.active ? (
                      <Link href={`/job-listing/${job.id}`}>
                        <Button
                          variant="outline"
                          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                        >
                          Review Applicants
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-gray-400">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
