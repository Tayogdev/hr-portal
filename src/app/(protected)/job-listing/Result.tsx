'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLoading } from '@/components/LoadingProvider';
import { usePageContext } from '@/components/PageContext';
import { Loader2 } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

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
};

type PaginationInfo = {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};

export default function JobListingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedPageId, setSelectedPageId } = usePageContext();
  const { startLoading, stopLoading } = useLoading();
  
  // Get pageId from URL params first, then from context
  const urlPageId = searchParams.get('pageId');
  const pageId = urlPageId || selectedPageId;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0, page: 1, totalPages: 1, hasMore: false
  });
  const [currentPageName, setCurrentPageName] = useState<string | null>(null);

  const fetchJobs = useCallback(async (page: number) => {
    if (!session || !pageId) return;
    
    try {
      setLoading(true);
      setError(null);

      const apiUrl = new URL('/api/opportunities', window.location.origin);
      apiUrl.searchParams.set('page', page.toString());
      apiUrl.searchParams.set('limit', '10');
      apiUrl.searchParams.set('pageId', pageId);
      apiUrl.searchParams.set('_t', Date.now().toString());

      const response = await fetch(apiUrl.toString(), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setJobs(result.data.opportunities || []);
        setPagination(result.data.pagination || { total: 0, page: 1, totalPages: 1, hasMore: false });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [session, pageId]); // Removed startLoading and stopLoading from dependencies

  // Auto-redirect to stored pageId if none in URL
  useEffect(() => {
    if (!urlPageId && selectedPageId) {
      router.replace(`/job-listing?pageId=${selectedPageId}`);
    }
  }, [urlPageId, selectedPageId, router]);

  // Update context when pageId changes
  useEffect(() => {
    if (urlPageId && urlPageId !== selectedPageId) {
      setSelectedPageId(urlPageId);
    }
  }, [urlPageId, selectedPageId, setSelectedPageId]);

  // Fetch page name
  useEffect(() => {
    if (!pageId) {
      setCurrentPageName(null);
      return;
    }

    const cachedName = sessionStorage.getItem(`pageName_${pageId}`);
    if (cachedName) {
      setCurrentPageName(cachedName);
      return;
    }

    fetch(`/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.page) {
          setCurrentPageName(data.page.title);
          sessionStorage.setItem(`pageName_${pageId}`, data.page.title);
        }
      })
      .catch(() => {}); // Silent error handling
  }, [pageId]);

  // Fetch jobs when dependencies change
  useEffect(() => {
    if (session && pageId) {
      setJobs([]);
      setLoading(true);
      // Call fetchJobs directly instead of including it in dependencies
      fetchJobs(currentPage);
    } else if (session && !pageId) {
      setJobs([]);
      setLoading(false);
      setError(null);
    }
  }, [currentPage, session, pageId]); // Removed fetchJobs to prevent infinite loops

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold mb-1">
              Job Listing
              {currentPageName && <span className="text-lg text-blue-600 ml-2">- {currentPageName}</span>}
            </h1>
            <p className="text-gray-500 text-sm">
              Here is your job listing from {new Date().toLocaleDateString('en-GB')} to {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
            </p>
            {session?.user && (
              <p className="text-sm text-blue-600 mt-1">Showing opportunities for: {session.user.email}</p>
            )}
          </div>
        </div>

        {/* Loading State - Inline */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading job opportunities...</span>
          </div>
        </div>
        
        {/* Table Skeleton */}
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error Loading Jobs</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={() => fetchJobs(currentPage)} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && !loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          {!pageId ? (
            <>
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Page Selected</h2>
              <p className="text-gray-600 mb-6">Please select a page from the sidebar to view job opportunities.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">💡 <strong>Tip:</strong> Click the &quot;Switch&quot; button in the header.</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Opportunities Found</h2>
              <p className="text-gray-600 mb-4">
                {currentPageName ? `No job opportunities found for ${currentPageName}.` : "No job opportunities found."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => fetchJobs(currentPage)} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Refresh
                </Button>
                <Link href="/job-listing">
                  <Button variant="outline">Select Different Page</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">
            Job Listing
            {currentPageName && <span className="text-lg text-blue-600 ml-2">- {currentPageName}</span>}
          </h1>
          <p className="text-gray-500 text-sm">
            Here is your job listing from {new Date().toLocaleDateString('en-GB')} to {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
          </p>
          {session?.user && (
            <p className="text-sm text-blue-600 mt-1">Showing opportunities for: {session.user.email}</p>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="w-full">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-600 text-white">
                {['Job Role', 'Status', 'Job Type', 'Posted on', 'Due Date', 'Applicants', 'Needs', 'Action'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="bg-white">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 border-b border-gray-100">
                  {/* Job Role with Icon */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {job.role}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'Live'
                          ? 'bg-white text-gray-800 border border-gray-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status === 'Live' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>}
                      {job.status}
                      {job.status === 'Live' && <div className="ml-1 text-gray-500 text-xs">▼</div>}
                    </span>
                  </td>

                  {/* Job Type */}
                  <td className="px-6 py-2 text-gray-600 text-sm">
                    {job.type}
                  </td>

                  {/* Posted On */}
                  <td className="px-6 py-2 text-gray-600 text-sm">
                    {job.posted}
                  </td>

                  {/* Due Date */}
                  <td className="px-6 py-2 text-gray-600 text-sm">
                    {job.due}
                  </td>

                  {/* Applicants */}
                  <td className="px-6 py-2 text-gray-900 font-medium text-sm text-center">
                    {job.applicants}
                  </td>

                  {/* Needs */}
                  <td className="px-6 py-2 text-gray-600 text-sm">
                    {job.needs}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    {job.status === 'Closed' ? (
                      <Button
                        size="sm"
                        disabled
                        className="bg-gray-300 text-gray-500 cursor-not-allowed text-xs px-2 py-1 rounded-full"
                      >
                        Closed
                      </Button>
                    ) : (
                      <Link href={`/job-listing/${job.id}`}>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 rounded-full text-white"
                        >
                          Review Applicants
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 space-y-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{job.role}</h3>
                  <p className="text-sm text-gray-500">{job.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Live'
                          ? 'bg-white text-gray-800 border border-gray-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status === 'Live' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>}
                      {job.status}
                      {job.status === 'Live' && <div className="ml-1.5 text-gray-500">▼</div>}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Applicants:</span>
                  <p className="font-medium text-gray-900">{job.applicants}</p>
                </div>
                <div>
                  <span className="text-gray-500">Posted:</span>
                  <p className="font-medium text-gray-900">{job.posted}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due:</span>
                  <p className="font-medium text-gray-900">{job.due}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="w-full">
                  {job.status === 'Closed' ? (
                    <Button
                      size="sm"
                      disabled
                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed text-sm px-4 py-2 rounded-full"
                    >
                      Closed
                    </Button>
                  ) : (
                    <Link href={`/job-listing/${job.id}`}>
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-full text-white"
                      >
                        Review Applicants
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-gray-600">Page {currentPage} of {pagination.totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}