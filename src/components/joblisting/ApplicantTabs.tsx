'use client';

import React from 'react';

type Tab = {
  name: string;
  count: number;
};

const tabs: Tab[] = [
  { name: 'All Applicants', count: 80 },
  { name: 'Shortlisted', count: 4 },
  { name: 'Final Selections', count: 0 },
  { name: 'Rejected', count: 0 },
];

export default function ApplicantTabs(): React.JSX.Element {
  const activeTab = 5; // static for now, set to 1 for 'Shortlisted'

  return (
    <nav className="flex gap-8 px-6 pt-4 pb-2 border-b bg-white text-base font-medium">
      {tabs.map((tab, idx) => (
        <button
          key={tab.name}
          className={`relative pb-2 transition-colors duration-150 focus:outline-none ${
            activeTab === idx ? 'text-[#4F8FF0] font-bold' : 'text-gray-700 hover:text-[#4F8FF0]'
          }`}
        >
          {tab.name}{' '}
          <span className="ml-1 text-sm font-normal">({tab.count})</span>
          {activeTab === idx && (
            <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[#4F8FF0] rounded" />
          )}
        </button>
      ))}
    </nav>
  );
}
