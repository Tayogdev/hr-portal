'use client';

import React from 'react';
import ResumeCV from './ResumeCV';
type Applicant = {
  name: string;
  title: string;
  tags: string[];
  score: number;
  avatar: string;
  linkedin?: string;
  portfolio?: string;
};

type ApplicantProfileProps = {
  applicantIndex: number;
};

const applicants: Applicant[] = [
  {
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    score: 10,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    linkedin: 'https://linkedin.com',
    portfolio: 'https://portfolio.com',
  },
  {
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    score: 9,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    linkedin: 'https://linkedin.com',
    portfolio: 'https://portfolio.com',
  },
  {
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    score: 8,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    score: 9,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

export default function ApplicantProfile({ applicantIndex }: ApplicantProfileProps): React.JSX.Element {
  const app = applicants[applicantIndex] || applicants[0];

  return (
    <div className="bg-white rounded-xl shadow border p-6 relative mb-6">
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-xl text-gray-800">{app.name}</div>
          <div className="text-sm text-gray-500 mb-1">{app.title}</div>
          <div className="flex flex-wrap gap-1 text-xs mb-1">
            {app.tags.map((tag, i) => (
              <span key={i} className="text-[#264AFF] font-medium">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[100px]">
          <span className="text-xs font-bold text-green-600">Score: {app.score}</span>
          <button className="text-gray-400 hover:text-gray-600 text-xl px-2 py-1 rounded-full">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <circle cx="3" cy="10" r="2" fill="currentColor" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
              <circle cx="17" cy="10" r="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pills and actions */}
      <div className="flex flex-wrap gap-2 mb-4 mt-2 items-center">
        <button className="border rounded-full px-4 py-1 text-xs font-medium text-gray-700 bg-gray-100">Profile</button>
        <button className="border rounded-full px-4 py-1 text-xs font-medium text-gray-700 bg-gray-100">Resume/CV</button>
        <button className="border rounded-full px-4 py-1 text-xs font-medium text-gray-700 bg-gray-100">Contacts</button>
        <button className="border rounded-full px-4 py-1 text-xs font-medium text-gray-700 bg-gray-100">2 files</button>
        <div className="flex-1"></div>
        <button className="border rounded px-3 py-1 text-xs font-medium text-gray-700 bg-white">Mark as</button>
        <button className="bg-[#264AFF] text-white rounded px-4 py-1 text-xs font-semibold">Finalize</button>
      </div>

      {/* Submission and actions row */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Submitted</span>
        <span className="border border-gray-300 px-3 py-1 rounded-full text-xs text-gray-700 bg-white">3 file attachments</span>
        <div className="flex-1"></div>
        <button className="border border-gray-300 rounded px-3 py-1 text-xs font-medium text-gray-700 bg-white">Assign Task</button>
        <button className="border border-gray-300 rounded px-3 py-1 text-xs font-medium text-gray-700 bg-white">Schedule Interview</button>
      </div>

      <hr className="my-4" />

      <ResumeCV linkedin={app.linkedin} portfolio={app.portfolio} />
    </div>
  );
}
