'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Share2, SlidersHorizontal } from 'lucide-react';

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
    name: 'Gatikrushna Mohapatra',
    title: 'UI/UX Designer, Pursuing Bachelors of Design from IIT Hyderabad',
    score: 10,
    tags: ['UI Design', 'Dashboard Design', 'Web design', 'User research', 'UX design'],
    appliedDate: '26 days ago',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    title: 'Frontend Developer Intern, IIIT Bangalore',
    score: 9,
    tags: ['React.js', 'Tailwind CSS', 'Next.js', 'UI/UX'],
    appliedDate: '18 days ago',
  },
  {
    id: 3,
    name: 'Rohit Jain',
    title: 'Software Developer Trainee, NIT Trichy',
    score: 8,
    tags: ['JavaScript', 'Node.js', 'MongoDB', 'REST APIs'],
    appliedDate: '12 days ago',
  },
  {
    id: 4,
    name: 'Meera Iyer',
    title: 'Data Analyst, pursuing B.Tech in Data Science from VIT',
    score: 9,
    tags: ['Python', 'Pandas', 'SQL', 'Power BI', 'Statistics'],
    appliedDate: '8 days ago',
  },
  {
    id: 5,
    name: 'Amit Kumar',
    title: 'DevOps Intern at TCS, Final year student - B.E. CS',
    score: 7,
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    appliedDate: '4 days ago',
  },
];


export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params);
  const [selectedTab, setSelectedTab] = useState<TabId>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(mockApplicants[0]);

  const [jobStatus, setJobStatus] = useState<'Live' | 'Closed'>('Live');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'all' as TabId, label: 'All Applicants (80)' },
    { id: 'shortlisted', label: 'Shortlisted (4)' },
    { id: 'final', label: 'Final Selections (0)' },
    { id: 'rejected', label: 'Rejected (0)' },
  ];

  const filters = [
    { id: 'all', label: 'All', count: '(80)' },
    { id: 'strong', label: 'Strong Fit', count: '(8)' },
    { id: 'good', label: 'Good Fit', count: '(16)' },
    { id: 'potential', label: 'Potential', count: '(32)' },
    { id: 'consider', label: 'Consider', count: '(16)' },
    { id: 'declined', label: 'Declined', count: '(8)' },
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
              <h1 className="text-xl font-semibold text-gray-900">
                User Experience and Research Intern
              </h1>
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
            {/* Status Dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                  jobStatus === 'Live'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                {jobStatus} ▼
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-32">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setJobStatus('Live');
                      setStatusDropdownOpen(false);
                    }}
                  >
                    Live
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setJobStatus('Closed');
                      setStatusDropdownOpen(false);
                    }}
                  >
                    Closed
                  </button>
                </div>
              )}
            </div>

            {/* Job Details */}
            <Button variant="outline" size="sm" className="text-gray-700">
              Job Details
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-100"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Job link copied to clipboard!');
              }}
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </Button>

            {/* 3-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 w-40">
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit Job</button>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Delete Job</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
onClick={() => setSelectedTab(tab.id as TabId)}
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
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex items-center gap-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Shortlist by filters
        </Button>
      </div>

      {/* Applicants Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Sidebar */}
       {/* Left Sidebar */}
<div className="bg-white rounded-lg p-4 shadow-sm">
  <h2 className="text-lg font-semibold mb-4">Applicants</h2>
  {mockApplicants.map((applicant) => {
    const isSelected = selectedApplicant?.id === applicant.id;
    return (
      <div
        key={applicant.id}
        onClick={() => setSelectedApplicant(applicant)}
        className={`flex gap-4 cursor-pointer p-4 border-l-4 ${
          isSelected ? 'border-[#4F46E5] bg-gray-50' : 'border-transparent'
        } hover:bg-gray-50`}
      >
        {/* Profile Photo */}
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            src="/avatar-placeholder.png" // replace with actual image path
            alt={applicant.name}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{applicant.name}</h3>
          <p className="text-sm text-gray-600">{applicant.title}</p>
          <div className="text-sm text-[#6366F1] mt-1 flex flex-wrap gap-x-1">
            {applicant.tags.map((tag, idx) => (
              <span key={idx} className=" text-blue-600">{tag}</span>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>Applied {applicant.appliedDate}</span>
            <span className="text-green-600 font-semibold">Score: {applicant.score}</span>
          </div>
        </div>
      </div>
    );
  })}
</div>


        {/* Right Detail */}
       <div className="col-span-2 bg-white rounded-2xl shadow p-6">
  {selectedApplicant ? (
    <>
      {/* Name & Role */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-1xl font-bold text-gray-900">{selectedApplicant.name}</h2>
          <p className="text-sm text-gray-700 mt-1">{selectedApplicant.title}</p>
        </div>
        <div className="text-green-600 font-semibold text-sm">Score: {selectedApplicant.score}</div>
      </div>

      {/* Tags */}
      <div className="text-sm text-indigo-600 flex flex-wrap gap-1 font-medium mb-4">
        {selectedApplicant.tags.map((tag, idx) => (
          <span key={idx}>
            {tag}
            {idx !== selectedApplicant.tags.length - 1 && <span className="mx-1 text-gray-400">•</span>}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-between items-center mt-2 mb-4">
        {/* Left Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button className="rounded-full px-4 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200">
            Profile
          </button>
          <button className="rounded-full px-4 py-1 text-sm text-gray-700 bg-gray-200 font-semibold">
            Resume/ CV
          </button>
          <button className="rounded-full px-4 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200">
            Contacts
          </button>
          <button className="rounded-full px-4 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200">
            2 files ▼
          </button>
        </div>

        {/* Right Buttons */}
        <div className="flex gap-3">
          <button className="rounded-full px-4 py-1 text-sm text-gray-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200">
            Mark as ▼
          </button>
          <button
            className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-indigo-700 transition"
            onClick={() => alert('Candidate Finalized')}
          >
            Shortlist
          </button>
        </div>
      </div>

      {/* Resume Preview Area */}
      <div className="mt-6 w-full h-[700px]">
        <iframe
          src="/resume-sample.pdf"
          className="w-full h-full rounded-md"
          title="Resume PDF"
        />
      </div>
    </>
  ) : (
    <p className="text-gray-500">Select an applicant to view details.</p>
  )}
</div>

      </div>
    </div>
  );
}
