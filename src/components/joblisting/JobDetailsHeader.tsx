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
    <div className="bg-white border-b px-8 py-6">
      {/* Main Header Row */}
      <div className="flex items-start justify-between w-full">
        {/* Left Section - Logo and Job Info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-8 h-8 bg-white rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{job.company}</span>
              <span className="text-gray-400">•</span>
              <span>{job.remote ? 'Remote' : 'Onsite'}</span>
              <span className="text-gray-400">•</span>
              <span>Needs {job.needs}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Posted on {job.posted}</span>
                <span className="text-gray-400">•</span>
                <span>Closing on {job.closing}</span>
              </div>
              
              {/* Action Buttons aligned with date line */}
              <div className="flex items-center gap-3 ml-8">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-green-300 rounded-full bg-white hover:bg-green-50 transition-colors cursor-pointer">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{job.status}</span>
                  <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Job Details
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
