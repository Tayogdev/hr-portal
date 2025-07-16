'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLoading } from '@/components/LoadingProvider';
import DebugInfo from '@/components/DebugInfo';
import { Loader2 } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const pageId = searchParams.get('pageId');
  const { startLoading, stopLoading } = useLoading();
  
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
  const [currentPageName, setCurrentPageName] = useState<string | null>(null);

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


const fetchJobs = useCallback(async (page: number) => {
  try {
    setLoading(true);
    startLoading();
    setError(null);

    if (!session) throw new Error('Please log in to view job listings');

    // Build the API URL with pageId if available
    const apiUrl = new URL('/api/opportunities', window.location.origin);
    apiUrl.searchParams.set('page', page.toString());
    apiUrl.searchParams.set('limit', '10');
    if (pageId) {
      apiUrl.searchParams.set('pageId', pageId);
    }

    // Add cache busting for immediate updates
    apiUrl.searchParams.set('_t', Date.now().toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorMessages: Record<number, string> = {
        401: 'Authentication required. Please log in again.',
        403: 'Access denied. You do not have permission to view this content.',
        429: 'Too many requests. Please try again later.',
      };
      throw new Error(errorMessages[response.status] || `Failed to fetch jobs (${response.status})`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      setJobs(result.data.opportunities || []);
      setPagination(result.data.pagination || {
        total: 0,
        page: 1,
        totalPages: 1,
        hasMore: false,
      });
    } else {
      throw new Error(result.message || 'Unknown error occurred');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load jobs';
    setError(errorMessage);
    setJobs([]);
    setPagination({ total: 0, page: 1, totalPages: 1, hasMore: false });
  } finally {
    setLoading(false);
    stopLoading();
  }
}, [session]);


  // Fetch page name when pageId changes (with caching)
  useEffect(() => {
    const fetchPageName = async () => {
      if (pageId) {
        // Check if we already have the page name cached
        const cachedPageName = sessionStorage.getItem(`pageName_${pageId}`);
        if (cachedPageName) {
          setCurrentPageName(cachedPageName);
          return;
        }

        try {
          const response = await fetch(`/api/pages/${pageId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.page) {
              setCurrentPageName(data.page.title);
              // Cache the page name
              sessionStorage.setItem(`pageName_${pageId}`, data.page.title);
            }
          }
        } catch {
          // Silently handle page name fetch error
        }
      } else {
        setCurrentPageName(null);
      }
    };

    fetchPageName();
  }, [pageId]);

  useEffect(() => {
    // Clear jobs immediately when pageId changes to prevent showing old data
    if (pageId) {
      setJobs([]);
      setLoading(true);
      setError(null);
    }
  }, [pageId]);

  useEffect(() => {
    // Only fetch jobs if session is available
    if (session) {
      startLoading();
      fetchJobs(currentPage);
    }
  }, [currentPage, session, pageId]); // Removed fetchJobs from dependencies to prevent unnecessary re-renders


  const handleStatusChange = (jobId: string, newStatus: 'Live' | 'Closed') => {
    setJobStatuses(prev => ({ ...prev, [jobId]: newStatus }));
    setOpenDropdownId(null);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-GB') : '';
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
          <div className="min-w-[800px] w-full">
            {/* Table Header */}
            <div className="bg-[#4A5568] text-white px-6 py-4">
              <div className="grid grid-cols-8 gap-4">
                {['Job Role', 'Status', 'Job Type', 'Posted on', 'Due Date', 'Applicants', 'Needs', 'Action'].map((header) => (
                  <div key={header} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Table Rows */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border-b last:border-0 px-6 py-4">
                <div className="grid grid-cols-8 gap-4">
                  {[...Array(8)].map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error Loading Jobs</div>
          <div className="text-gray-600 mb-4">
            {error}
            {currentPageName && (
              <div className="mt-2 text-sm text-gray-500">
                Error occurred while loading opportunities for page: {currentPageName}
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => fetchJobs(currentPage)}
              disabled={loading}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
            {currentPageName && (
              <Link href="/job-listing">
                <Button 
                  variant="outline" 
                  disabled={loading}
                  className="border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'View All Opportunities'
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && !loading) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          {!pageId ? (
            <>
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Page Selected</h2>
              <p className="text-gray-600 mb-6">
                Please select a page from the sidebar to view its job opportunities.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> Click the &quot;Switch&quot; button in the header to select a page.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Opportunities Found</h2>
              <p className="text-gray-600 mb-4">
                {currentPageName 
                  ? `No job opportunities found for the page ${currentPageName}.`
                  : "No job opportunities found for the selected page."
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => fetchJobs(currentPage)}
                  disabled={loading}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </Button>
                <Link href="/job-listing">
                  <Button 
                    variant="outline" 
                    disabled={loading}
                    className="border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Select Different Page'
                    )}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

    return (
    <>
      <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen relative">
        {/* Debug component - remove in production */}
        <DebugInfo />
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading opportunities...</p>
            </div>
          </div>
        )}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">
            Job Listing
            {currentPageName && (
              <span className="text-lg text-blue-600 ml-2">- {currentPageName}</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">
            Here is your job listing from {formatDate(startDate)} to {formatDate(endDate)}
            {currentPageName && (
              <span className="ml-2 text-blue-600">(Filtered by page: {currentPageName})</span>
            )}
          </p>
          {session?.user && (
            <p className="text-sm text-blue-600 mt-1">
              Showing opportunities for: {session.user.email}
            </p>
          )}
          {currentPageName && (
            <div className="mt-2">
              <Link href="/job-listing">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={loading}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Clear Page Filter'
                  )}
                </Button>
              </Link>
            </div>
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
                          disabled={loading}
                          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            job.action
                          )}
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
          disabled={currentPage === 1 || loading}
          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Previous'
          )}
        </Button>
        <span className="text-gray-600 text-sm">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!pagination.hasMore || loading}
          className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Next'
          )}
        </Button>
      </div>
      </div>
    </>
  );
}