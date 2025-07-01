'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Job = {
  id: string;
  role: string;
  status: 'Live' | 'Closed';
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<{ [key: string]: 'Live' | 'Closed' }>({});
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    return [today, nextMonth];
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
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
    fetchJobs(currentPage);
  }, [currentPage]);

  const fetchJobs = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/opportunities?page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data.opportunities);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: 'Live' | 'Closed') => {
    setJobStatuses(prev => ({ ...prev, [jobId]: newStatus }));
    setOpenDropdownId(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Job Listing</h1>
          <p className="text-gray-500">
            Here is your job listing from {formatDate(startDate)} to {formatDate(endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="text-gray-500">
            {formatDate(startDate)} to {formatDate(endDate)}
          </div>
          <div ref={calendarDropdownRef}>
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              📅
            </button>
            {isCalendarOpen && (
              <div className="absolute right-0 mt-2 z-50">
                <DatePicker
                  selected={startDate}
                  onChange={(update: [Date | null, Date | null]) => {
                    setDateRange(update);
                    if (update[0] && update[1]) {
                      setIsCalendarOpen(false);
                    }
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

      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#4A5568] text-white">
              <th className="px-6 py-4 text-left">Job Role</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Job Type</th>
              <th className="px-6 py-4 text-left">Posted</th>
              <th className="px-6 py-4 text-left">Due</th>
              <th className="px-6 py-4 text-left">Applicants</th>
              <th className="px-6 py-4 text-left">Needs</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => {
              const isDisabled = !job.active;
              const currentStatus = jobStatuses[job.id] || job.status;
              return (
                <tr key={job.id} className={`hover:bg-gray-50 ${isDisabled ? 'bg-gray-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image src="/job-icon.png" alt="Icon" width={20} height={20} />
                      <span className={`${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {job.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    <div ref={statusDropdownRef}>
                      <button
                        onClick={() =>
                          setOpenDropdownId(openDropdownId === job.id ? null : job.id)
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currentStatus === 'Live'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {currentStatus} ▼
                      </button>
                      {openDropdownId === job.id && (
                        <div className="absolute mt-1 bg-white shadow border rounded z-50">
                          <button
                            onClick={() => handleStatusChange(job.id, 'Live')}
                            className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                          >
                            Live
                          </button>
                          <button
                            onClick={() => handleStatusChange(job.id, 'Closed')}
                            className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-sm"
                          >
                            Closed
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{job.type}</td>
                  <td className="px-6 py-4 text-gray-500">{job.posted}</td>
                  <td className="px-6 py-4 text-gray-500">{job.due}</td>
                  <td className="px-6 py-4 text-gray-500">{job.applicants}</td>
                  <td className="px-6 py-4 text-gray-500">{job.needs}</td>
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

      <div className="mt-6 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="text-[#4F46E5] border-[#4F46E5]"
        >
          Previous
        </Button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={!pagination.hasMore}
          className="text-[#4F46E5] border-[#4F46E5]"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
