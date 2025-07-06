'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReviewFilterButton from './ReviewFilterButton';
import AdvancedFilterModal from './AdvancedFilterModal';
import { useRouter } from 'next/navigation';
interface Applicant {
  name: string;
  role: string;
  jobType: string;
  uploads: number;
  appliedOn: string;
  status: string;
  score: number;
  scoreColor: string; 
}

const initialApplicants: Applicant[] = [
  {
    name: 'Gatikrushna Mohapatra',
    role: 'User Experience and Research Intern',
    jobType: 'Internship',
    uploads: 3,
    appliedOn: '08.07.2024',
    status: 'Shortlisted',
    score: 10,
    scoreColor: 'text-green-600',
  },
  {
    name: 'Gatikrushna Mohapatra',
    role: 'User Interface Design Intern',
    jobType: 'Internship',
    uploads: 3,
    appliedOn: '08.07.2024',
    status: 'Shortlisted',
    score: 9,
    scoreColor: 'text-green-600',
  },
  {
    name: 'Gatikrushna Mohapatra',
    role: 'User Experience and Research Intern',
    jobType: 'Full Time',
    uploads: 3,
    appliedOn: '08.11.2023',
    status: 'May Fit',
    score: 9,
    scoreColor: 'text-green-600',
  },
  {
    name: 'Gatikrushna Mohapatra',
    role: 'User Experience and Research Intern',
    jobType: 'Internship',
    uploads: 3,
    appliedOn: '08.01.2024',
    status: 'New',
    score: 7,
    scoreColor: 'text-yellow-500',
  },
  {
    name: 'Gatikrushna Mohapatra',
    role: 'User Experience and Research Intern',
    jobType: 'Full Time',
    uploads: 3,
    appliedOn: '08.1.2023',
    status: 'Declined',
    score: 2,
    scoreColor: 'text-red-500',
  },
];

const statusColorMap: Record<string, string> = {
  Shortlisted: 'bg-blue-100 text-blue-700',
  New: 'bg-purple-100 text-purple-700',
  Declined: 'bg-red-100 text-red-700',
  'May Fit': 'bg-yellow-100 text-yellow-700',
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    minScore: number;
    maxScore: number;
    jobType: string;
  } | null>(null);
  const router = useRouter();

  const itemsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, advancedFilters]);

  const filteredApplicants = applicants.filter((a) => {
    const matchesStatus =
      selectedFilter === 'All' ||
      a.status.toLowerCase() === selectedFilter.toLowerCase();

    const matchesScore =
      !advancedFilters ||
      (a.score >= advancedFilters.minScore &&
        a.score <= advancedFilters.maxScore);

    const matchesJobType =
      !advancedFilters || !advancedFilters.jobType
        ? true
        : a.jobType === advancedFilters.jobType;

    return matchesStatus && matchesScore && matchesJobType;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplicants = filteredApplicants.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleStatusChange = (index: number, newStatus: string) => {
    const updated = [...applicants];
    updated[index].status = newStatus;
    setApplicants(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Applicants</h1>
      <p className="text-gray-600 mb-6">
        Here is the list of applicants applying for all the jobs you posted till now
      </p>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {['All', 'Shortlisted', 'New', 'Declined', 'May Fit'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium ${
              selectedFilter === filter
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {filter}
          </button>
        ))}
        <ReviewFilterButton onClick={() => setShowAdvancedFilter(true)} />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 py-2 px-3 bg-gray-100 font-medium text-gray-700 rounded-md text-sm">
        <div>Job Role</div>
        <div>Role</div>
        <div>Job Type</div>
        <div>Uploads</div>
        <div>Applied on</div>
        <div>Status Marked</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      {paginatedApplicants.map((applicant, index) => {
        const globalIndex = startIndex + index;
        return (
          <div
            key={globalIndex}
            className="grid grid-cols-7 gap-4 items-center border-b py-4 px-3 text-sm"
          >
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
              <select
                value={applicant.status}
                onChange={(e) => handleStatusChange(globalIndex, e.target.value)}
                className={`px-3 py-1 text-sm rounded-md shadow-md ${statusColorMap[applicant.status] || 'bg-white text-gray-700'}`}
              >
                <option value="New">New</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Declined">Declined</option>
                <option value="May Fit">May Fit</option>
              </select>
            </div>
            <div>
             <button
  onClick={() => router.push(`/all-applicants/${globalIndex}`)} // ✅ fixed
  className="bg-[#4F8FF0] hover:bg-[#3B77D3] text-white px-4 py-2 rounded-md text-sm"
>
  Review Application
</button>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-[#4F8FF0] text-white hover:bg-[#3B77D3]'
          }`}
        >
          Previous
        </button>
        <button
          disabled={startIndex + itemsPerPage >= filteredApplicants.length}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`px-4 py-2 rounded-md ${
            startIndex + itemsPerPage >= filteredApplicants.length
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-[#4F8FF0] text-white hover:bg-[#3B77D3]'
          }`}
        >
          Next
        </button>
      </div>

      {/* Advanced Filter Modal */}
      {showAdvancedFilter && (
        <AdvancedFilterModal
          onClose={() => setShowAdvancedFilter(false)}
          onApplyFilters={(filters) => {
            setAdvancedFilters(filters);
            setShowAdvancedFilter(false);
          }}
        />
      )}

     

    </div>
  );
}