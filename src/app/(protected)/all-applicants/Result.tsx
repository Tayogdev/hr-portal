'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ReviewFilterButton from '@/components/all-applicants/ReviewFilterButton';
import AdvancedFilterModal from '@/components/all-applicants/AdvancedFilterModal';
import { useRouter } from 'next/navigation';

import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Loader2 } from 'lucide-react';

interface Applicant {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  jobType: string;
  uploads: number;
  appliedOn: string;
  status: 'PENDING' | 'SHORTLISTED' | 'MAYBE' | 'REJECTED' | 'FINAL';
  score: number;
  scoreColor: string;
  opportunityId: string;
  opportunityTitle: string;
}

const statusColorMap: Record<string, string> = {
  SHORTLISTED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
  MAYBE: 'bg-yellow-100 text-yellow-700',
  FINAL: 'bg-green-100 text-green-700',
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    minScore: number;
    maxScore: number;
    jobType: string;
  } | null>(null);
  const router = useRouter();

  const itemsPerPage = 10;

  // Fetch all applicants from all opportunities
  const fetchAllApplicants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new efficient API endpoint
      const response = await fetch('/api/opportunities/applicants');
      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data?.applicants) {
        throw new Error('No applicants found');
      }

      setApplicants(data.data.applicants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch applicants only once on mount
  useEffect(() => {
    fetchAllApplicants();
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, advancedFilters]);

  const filteredApplicants = applicants.filter((a) => {
    const filterToStatus: Record<string, string[]> = {
      'All': ['PENDING', 'SHORTLISTED', 'MAYBE', 'REJECTED', 'FINAL'],
      'Shortlisted': ['SHORTLISTED'],
      'New': ['PENDING'],
      'Declined': ['REJECTED'],
      'May Fit': ['MAYBE'],
      'Final': ['FINAL']
    };

    const matchesStatus = filterToStatus[selectedFilter]?.includes(a.status) ?? true;

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

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      // Update status in database via API
      const response = await fetch(`/api/opportunities/applicants/${applicantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setApplicants(prev => 
        prev.map(applicant => 
          applicant.id === applicantId 
            ? { ...applicant, status: newStatus as Applicant['status'] }
            : applicant
        )
      );

    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Applicants</h1>
      <p className="text-gray-600 mb-6">
        Here is the list of applicants applying for all the jobs you posted ({applicants.length} total)
      </p>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {['All', 'Shortlisted', 'New', 'Declined', 'May Fit', 'Final'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium ${
              selectedFilter === filter
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {filter} {filter === 'All' ? `(${applicants.length})` : 
                     `(${applicants.filter(a => {
                       const filterMap: Record<string, string> = {
                         'Shortlisted': 'SHORTLISTED',
                         'New': 'PENDING', 
                         'Declined': 'REJECTED',
                         'May Fit': 'MAYBE',
                         'Final': 'FINAL'
                       };
                       return a.status === filterMap[filter];
                     }).length})`}
          </button>
        ))}
        <ReviewFilterButton onClick={() => setShowAdvancedFilter(true)} />
      </div>

      {/* Loading State - Inline */}
      {loading && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading applicants...</span>
          </div>
        </div>
      )}

      {/* Error State - Inline */}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-sm">⚠️ {error}</span>
            </div>
            <button
              onClick={() => fetchAllApplicants()}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 py-2 px-3 bg-gray-100 font-medium text-gray-700 rounded-md text-sm">
        <div>Applicant</div>
        <div>Job Role</div>
        <div>Job Type</div>
        <div>Uploads</div>
        <div>Applied on</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {/* Table Content */}
      {loading ? (
        // Show skeleton while loading
        <TableSkeleton rows={8} />
      ) : error ? (
        // Show empty state when there's an error
        <div className="text-center py-8 text-gray-500">
          <p>Unable to load applicants. Please try again.</p>
        </div>
      ) : filteredApplicants.length === 0 ? (
        // Show empty state when no applicants
        <div className="text-center py-8 text-gray-500">
          <p>No applicants found for the selected filter.</p>
        </div>
      ) : (
        // Show actual data
        paginatedApplicants.map((applicant) => (
          <div
            key={applicant.id}
            className="grid grid-cols-7 gap-4 items-center border-b py-4 px-3 text-sm hover:bg-gray-50"
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
                <div className="text-gray-500 text-xs">{applicant.email}</div>
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
                onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                className={`px-3 py-1 text-sm rounded-md shadow-md ${statusColorMap[applicant.status] || 'bg-white text-gray-700'}`}
              >
                <option value="PENDING">New</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Declined</option>
                <option value="MAYBE">May Fit</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => router.push(`/all-applicants/${applicant.id}`)}
                className="bg-[#4F8FF0] hover:bg-[#3B77D3] text-white px-4 py-2 rounded-md text-sm"
              >
                Review Application
              </button>
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {!loading && !error && filteredApplicants.length > 0 && (
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
      )}

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