'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLoading } from '@/components/LoadingProvider';
import { usePageContext } from '@/components/PageContext';
import { Loader2 } from 'lucide-react';

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
    startLoading();
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
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading opportunities...</p>
          {currentPageName && <p className="text-sm text-gray-500 mt-2">for {currentPageName}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
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
      <div className="p-8 bg-[#F8F9FC] min-h-screen flex items-center justify-center">
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
    <div className="p-4 sm:p-6 md:p-8 bg-[#F8F9FC] min-h-screen">
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
      <div className="w-full overflow-x-auto rounded-xl shadow bg-white">
        <div className="min-w-[800px] w-full">
          {/* Table Header */}
          <div className="bg-[#4A5568] text-white px-6 py-4">
            <div className="grid grid-cols-8 gap-4">
              {['Job Role', 'Status', 'Job Type', 'Posted on', 'Due Date', 'Applicants', 'Needs', 'Action'].map((header) => (
                <div key={header} className="font-medium">{header}</div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          {jobs.map((job) => (
            <div key={job.id} className="border-b last:border-0 px-6 py-4 hover:bg-gray-50">
              <div className="grid grid-cols-8 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">{job.role}</span>
                      </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'Live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                      </span>
                    </div>
                <div className="text-gray-600">{job.type}</div>
                <div className="text-gray-600">{job.posted}</div>
                <div className="text-gray-600">{job.due}</div>
                <div className="text-gray-600">{job.applicants}</div>
                <div className="text-gray-600">{job.needs}</div>
                <div>
                  <Link href={`/job-listing/${job.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      {job.action}
                    </Button>
                  </Link>
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