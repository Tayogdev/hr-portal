'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Optional if using shadcn/ui
import ResumePreview from './resume-preview'; // Make sure this file exists

export default function ApplicantReviewDetail() {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/4 space-y-4">
        {/* Applicant Card */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-sm font-semibold mb-4">Applicants</h3>
          <div className="flex items-center gap-4">
            <Image
              src="/avatar-placeholder.png"
              alt="Gatikrushna"
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Gatikrushna Mohapatra
              </h2>
              <p className="text-sm text-gray-600 leading-tight">
                UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad
              </p>
            </div>
          </div>
        </div>

        {/* Applied Jobs */}
        <div className="bg-white shadow-md p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Applied Jobs (2)</h3>

          {/* Job 1 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-3">
              <Image src="/job-icon.png" alt="job icon" width={16} height={16} className="mt-1" style={{ objectFit: 'contain' }}/>
              <div>
                <p className="font-semibold text-sm text-gray-900 leading-snug">
                  User Experience and<br />Research Intern
                </p>
                <p className="text-xs text-gray-500 mt-1">Applied 26 days ago</p>
              </div>
            </div>
            <span className="text-green-600 text-sm font-medium">Score: 10</span>
          </div>

          {/* Job 2 */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Image src="/job-icon.png" alt="job icon" width={16} height={16} className="mt-1" style={{ objectFit: 'contain' }}/>
              <div>
                <p className="font-semibold text-sm text-gray-900 leading-snug">
                  User Interface Design Intern
                </p>
                <p className="text-xs text-gray-500 mt-1">Applied 26 days ago</p>
              </div>
            </div>
            <span className="text-green-600 text-sm font-medium">Score: 9</span>
          </div>
        </div>

        {/* Hiring Process */}
        <div className="bg-white shadow p-4 rounded-2xl text-sm text-gray-800">
          <h3 className="font-semibold mb-4">Hiring Process</h3>

      <Button variant="outline" className="w-full justify-center gap-1 rounded-full text-gray-600">
  Assign Task <span className="text-lg leading-none">+</span>
</Button>

<Button variant="outline" className="w-full justify-center gap-2 mt-3 border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-full">
  Schedule Interview
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
</Button>

        </div>

        {/* Contact Info */}
        <div className="bg-white shadow p-4 rounded-2xl text-sm text-gray-800">
          <p className="font-semibold mb-4">Contacts</p>

          <div className="flex items-center gap-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>bd21bdes11008@iith.ac.in</span>
          </div>

          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a1 1 0 011 1v2a1 1 0 01-.293.707L6.414 9.414a16.019 16.019 0 006.172 6.172l2.707-2.707A1 1 0 0116 12h2a1 1 0 011 1v2a2 2 0 01-2 2c-7.18 0-13-5.82-13-13z" />
            </svg>
            <span>+91 7205869973</span>
          </div>
        </div>
      </div>

      {/* Right Section - Resume Preview */}
      <div className="w-full md:w-3/4">
        <ResumePreview />
      </div>
    </div>
  );
}
