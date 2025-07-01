'use client';

import React, { useState, use } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type TabId = 'all' | 'shortlisted' | 'final' | 'rejected';

type Applicant = {
  id: number;
  name: string;
  title: string;
  score: number;
  tags: string[];
  appliedDate: string;
};

const mockApplicants: Applicant[] = [
  {
    id: 1,
    name: "Gatikrushna Mohapatra",
    title: "UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad",
    score: 10,
    tags: ["UI Design", "Dashboard Design", "Web design", "User research", "UX design"],
    appliedDate: "26 days ago"
  }
];

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params);
  const [selectedTab, setSelectedTab] = useState<TabId>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Using jobId from resolved params
  console.log('Current Job ID:', resolvedParams.jobId);

  const tabs = [
    { id: 'all' as TabId, label: 'All Applicants (80)' },
    { id: 'shortlisted' as TabId, label: 'Shortlisted (4)' },
    { id: 'final' as TabId, label: 'Final Selections (0)' },
    { id: 'rejected' as TabId, label: 'Rejected (0)' }
  ];

  const filters = [
    { id: 'all', label: 'All', count: '(80)' },
    { id: 'strong', label: 'Strong Fit', count: '(8)' },
    { id: 'good', label: 'Good Fit', count: '(16)' },
    { id: 'potential', label: 'Potential', count: '(32)' },
    { id: 'consider', label: 'Consider', count: '(16)' },
    { id: 'declined', label: 'Declined', count: '(8)' }
  ];

  return (
    <div className="p-6">
      {/* Company Header */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#F3F4F6] flex items-center justify-center">
              <Image
                src="/job-icon.png"
                alt="Company Logo"
                width={24}
                height={24}
                className="rounded"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Experience and Research Intern</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Tech Japan</span>
                <span>•</span>
                <span>Remote</span>
                <span>•</span>
                <span>Needs 0/1</span>
              </div>
              <div className="text-sm text-gray-500">
                Posted on 08.07.2024 • Closing on 19.08.2024
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Live ▼
            </button>
            <Button variant="outline" size="sm" className="text-gray-700">
              Job Details
            </Button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12v-2c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v-2M4 12v2c0 3.314 2.686 6 6 6h4c3.314 0 6-2.686 6-6v-2M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-4 px-1 relative ${
                selectedTab === tab.id
                  ? 'text-[#6366F1] font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {selectedTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.label)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === filter.label
                ? 'bg-[#6366F1] text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {filter.label} {filter.count}
          </button>
        ))}
        <button className="ml-auto px-4 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <span>⚙</span> Shortlist by filters
        </button>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        {mockApplicants.map((applicant) => (
          <div key={applicant.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-4">
              <Image
                src="/avatar-placeholder.png"
                alt={applicant.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{applicant.name}</h3>
                    <p className="text-sm text-gray-500">{applicant.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600">Score: {applicant.score}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      •••
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {applicant.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <button className="px-4 py-1 rounded-full border border-gray-300 text-sm text-gray-700">
                    Profile
                  </button>
                  <button className="px-4 py-1 rounded-full border border-gray-300 text-sm text-gray-700">
                    Resume/CV
                  </button>
                  <button className="px-4 py-1 rounded-full border border-gray-300 text-sm text-gray-700">
                    Contacts
                  </button>
                  <button className="px-4 py-1 rounded-full border border-gray-300 text-sm text-gray-700">
                    2 files
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" className="text-gray-700">
                      Mark as
                    </Button>
                    <Button className="bg-[#6366F1] hover:bg-[#4F46E5]">
                      Shortlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
