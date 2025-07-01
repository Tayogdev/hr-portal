'use client';

import React from 'react';
import Image from 'next/image';

type Applicant = {
  name: string;
  title: string;
  tags: string[];
  applied: string;
  score: number;
  avatar: string;
};

type ApplicantListProps = {
  selected: number;
};

const applicants: Applicant[] = [
  {
    name: 'Ravindra Dhage',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    applied: '26 days ago',
    score: 10,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    applied: '26 days ago',
    score: 9,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

export default function ApplicantList({ selected }: ApplicantListProps): React.JSX.Element {
  return (
    <div className="py-4 px-2 flex flex-col gap-3 bg-gray-50 rounded-xl shadow-inner">
      {applicants.map((app, idx) => {
        const isSelected = selected === idx;
        return (
          <div
            key={idx}
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
              src={app.avatar}
              alt={app.name}
              width={40}
              height={40}
              className="rounded-full z-10 object-cover"
            />

            <div className="flex-1 z-10">
              <div className="font-bold text-gray-800 text-base mb-0.5">{app.name}</div>
              <div className="text-xs text-gray-500 mb-1">{app.title}</div>
              <div className="flex flex-wrap gap-1 text-xs mb-1">
                {app.tags.map((tag, i) => (
                  <span key={i} className="text-[#4F8FF0]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-400">Applied {app.applied}</div>
            </div>

            <div className="text-xs font-bold text-green-600 z-10">
              Score: {app.score}
            </div>
          </div>
        );
      })}
    </div>
  );
}
