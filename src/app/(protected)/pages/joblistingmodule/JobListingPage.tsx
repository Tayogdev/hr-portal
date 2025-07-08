'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSession } from 'next-auth/react';

type Job = {
  id: string;
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

type PaginationInfo = {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};

export default function JobListingPage(): React.JSX.Element {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<{ [key: string]: 'Live' | 'Closed' }>({});
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return [today, nextMonth];
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false
  });

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const calendarDropdownRef = useRef<HTMLDivElement>(null);

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }

      if (calendarDropdownRef.current && !calendarDropdownRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Only fetch jobs if session is available
    if (session) {
      fetchJobs(currentPage);
    }
  }, [currentPage, session]);

  const fetchJobs = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure session is available before making API calls
      if (!session) {
        throw new Error('Please log in to view job listings');
      }
      
      const response = await fetch(`/api/opportunities?page=${page}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this content.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again in a moment.');
        } else {
          throw new Error(`Failed to fetch jobs (${response.status})`);
        }
      }
      
      const result = await response.json();
      
      // Handle the new structured API response
      if (result.success && result.data) {
        setJobs(result.data.opportunities || []);
        setPagination(result.data.pagination || {
          total: 0,
          page: 1,
          totalPages: 1,
          hasMore: false
        });
      } else {
        // Handle error response
        const errorMessage = result.message || 'Unknown error occurred';
        console.error('API Error:', errorMessage);
        setError(errorMessage);
        setJobs([]);
        setPagination({
          total: 0,
          page: 1,
          totalPages: 1,
          hasMore: false
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load jobs';
      setError(errorMessage);
      setJobs([]);
      setPagination({
        total: 0,
        page: 1,
        totalPages: 1,
        hasMore: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: 'Live' | 'Closed') => {
    setJobStatuses(prev => ({ ...prev, [jobId]: newStatus }));
    setOpenDropdownId(null);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-GB') : '';
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error Loading Jobs</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button 
            onClick={() => fetchJobs(currentPage)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && !loading) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">📋 No Jobs Found</div>
          <div className="text-gray-400 mb-4">You haven&apos;t posted any job opportunities yet.</div>
          <Button 
            onClick={() => fetchJobs(currentPage)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">Job Listing</h1>
          <p className="text-gray-500 text-sm">
            Here is your job listing from {formatDate(startDate)} to {formatDate(endDate)}
          </p>
          {session?.user && (
            <p className="text-sm text-blue-600 mt-1">
              Showing opportunities for: {session.user.email}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="text-gray-500 text-sm">
            {formatDate(startDate)} to {formatDate(endDate)}
          </div>
          <div className="relative" ref={calendarDropdownRef}>
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </button>
            {isCalendarOpen && (
              <div className="absolute right-0 mt-2 z-50">
                <DatePicker
                  selected={startDate}
                  onChange={(update: [Date | null, Date | null]) => {
                    setDateRange(update);
                    if (update[0] && update[1]) setIsCalendarOpen(false);
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  monthsShown={2}
                  calendarClassName="shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-[800px] w-full text-sm">
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
                  className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${isDisabled ? 'bg-gray-50' : ''}`}
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
                    <div ref={statusDropdownRef}>
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
                              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                              Live
                            </button>
                            <button
                              onClick={() => handleStatusChange(job.id, 'Closed')}
                              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                              Closed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{job.type}</td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{job.posted}</td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{job.due}</td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{job.applicants}</td>
                  <td className={`px-6 py-4 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{job.needs}</td>
                  <td className="px-6 py-4">
                    {job.active ? (
                      <Link href={`/job-listing/${job.id}`}>
                        <Button
                          variant="outline"
                          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                        >
                          {job.action}
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-gray-400">{job.action}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
        >
          Previous
        </Button>
        <span className="text-gray-600 text-sm">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!pagination.hasMore}
          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}